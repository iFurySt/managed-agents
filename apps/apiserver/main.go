package main

import (
	"errors"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/spf13/cobra"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type Agent struct {
	ID           string    `json:"id" gorm:"primaryKey"`
	Name         string    `json:"name"`
	Model        string    `json:"model"`
	Status       string    `json:"status"`
	Description  string    `json:"description"`
	SystemPrompt string    `json:"systemPrompt" gorm:"type:text"`
	Tools        string    `json:"tools"`
	Skills       string    `json:"skills"`
	CreatedAt    time.Time `json:"createdAt"`
	UpdatedAt    time.Time `json:"updatedAt"`
}

type Resource struct {
	ID          string    `json:"id" gorm:"primaryKey"`
	Kind        string    `json:"kind" gorm:"index"`
	Name        string    `json:"name"`
	Status      string    `json:"status"`
	Description string    `json:"description"`
	Primary     string    `json:"primary"`
	Secondary   string    `json:"secondary"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

type CreateAgentRequest struct {
	Name         string `json:"name"`
	Description  string `json:"description"`
	Model        string `json:"model"`
	SystemPrompt string `json:"systemPrompt"`
}

var resourceKinds = map[string]string{
	"sessions":      "session",
	"deployments":   "deployment",
	"environments":  "environment",
	"vaults":        "vault",
	"memory-stores": "memory_store",
	"files":         "file",
	"skills":        "skill",
}

func main() {
	root := &cobra.Command{
		Use:   "apiserver",
		Short: "Run the managed agents API server",
		RunE: func(cmd *cobra.Command, args []string) error {
			return run()
		},
	}
	if err := root.Execute(); err != nil {
		panic(err)
	}
}

func run() error {
	db, err := openDB()
	if err != nil {
		return err
	}
	if err := db.AutoMigrate(&Agent{}, &Resource{}); err != nil {
		return err
	}
	if err := seed(db); err != nil {
		return err
	}

	router := gin.Default()
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173", "http://127.0.0.1:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	router.GET("/healthz", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})
	router.GET("/api/agents", listAgents(db))
	router.GET("/api/agents/:id", getAgent(db))
	router.POST("/api/agents", createAgent(db))
	router.GET("/api/:collection", listResources(db))

	addr := env("APISERVER_ADDR", ":8080")
	return router.Run(addr)
}

func openDB() (*gorm.DB, error) {
	dsn := env("DATABASE_URL", "postgres://managed_agents:managed_agents@localhost:5432/managed_agents?sslmode=disable")
	return gorm.Open(postgres.Open(dsn), &gorm.Config{})
}

func listAgents(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var agents []Agent
		query := db.Order("created_at desc")
		if search := strings.TrimSpace(c.Query("q")); search != "" {
			query = query.Where("name ILIKE ? OR id ILIKE ?", "%"+search+"%", "%"+search+"%")
		}
		if err := query.Find(&agents).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"items": agents})
	}
}

func getAgent(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var agent Agent
		if err := db.First(&agent, "id = ?", c.Param("id")).Error; err != nil {
			status := http.StatusInternalServerError
			if errors.Is(err, gorm.ErrRecordNotFound) {
				status = http.StatusNotFound
			}
			c.JSON(status, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, agent)
	}
}

func createAgent(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req CreateAgentRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		now := time.Now().UTC()
		name := strings.TrimSpace(req.Name)
		if name == "" {
			name = "Untitled agent"
		}
		agent := Agent{
			ID:           "agent_local_" + now.Format("20060102150405"),
			Name:         name,
			Model:        defaultString(req.Model, "claude-sonnet-4-6"),
			Status:       "Active",
			Description:  defaultString(req.Description, "A blank starting point with the core toolset."),
			SystemPrompt: defaultString(req.SystemPrompt, defaultSystemPrompt),
			Tools:        "agent_toolset_20260401",
			Skills:       "[]",
			CreatedAt:    now,
			UpdatedAt:    now,
		}
		if err := db.Create(&agent).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusCreated, agent)
	}
}

func listResources(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		kind, ok := resourceKinds[c.Param("collection")]
		if !ok {
			c.JSON(http.StatusNotFound, gin.H{"error": "unknown collection"})
			return
		}
		var items []Resource
		if err := db.Where("kind = ?", kind).Order("created_at desc").Find(&items).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"items": items})
	}
}

func seed(db *gorm.DB) error {
	var count int64
	if err := db.Model(&Agent{}).Count(&count).Error; err != nil {
		return err
	}
	now := time.Now().UTC().Add(-48 * time.Hour)
	if count == 0 {
		agents := []Agent{
			agent("agent_013mi1SmR2hJ6Hk6wNTeJvF9", "Managed SSH Reverse Tunnel Bootstrapper", "claude-sonnet-4-6", "Bootstraps SSH access to a Managed Agents cloud environment through an amoylab reverse SSH tunnel.", reverseTunnelPrompt, now),
			agent("agent_01AVRPTGyYareCeoUasn66q5", "Incident commander", "claude-opus-4-8", "Coordinates incident triage, diagnosis, mitigation, and status updates.", "You are an incident commander. Build a clear timeline, identify owners, and keep communications concise.", now),
			agent("agent_019BdsR2v3NW1DiEG62wpu3e", "World Cup Daily Digest (self-hosted clone)", "claude-sonnet-4-6", "Collects World Cup news and prepares a daily digest.", "You summarize sports updates into a concise daily digest with sources.", now),
			agent("agent_017k8CPYuCFRD9AmupUeXd2Z", "World Cup Daily Digest", "claude-sonnet-4-6", "Collects World Cup news and prepares a daily digest.", "You summarize sports updates into a concise daily digest with sources.", now),
			agent("agent_01MNpVPKyrSECHGA6HqAmREZ", "Untitled agent", "claude-sonnet-4-6", "A blank starting point with the core toolset.", defaultSystemPrompt, now),
		}
		if err := db.Create(&agents).Error; err != nil {
			return err
		}
	}

	if err := db.Model(&Resource{}).Count(&count).Error; err != nil {
		return err
	}
	if count == 0 {
		items := seedResources(now)
		if err := db.Create(&items).Error; err != nil {
			return err
		}
	}
	return nil
}

func agent(id, name, model, description, prompt string, ts time.Time) Agent {
	return Agent{
		ID:           id,
		Name:         name,
		Model:        model,
		Status:       "Active",
		Description:  description,
		SystemPrompt: prompt,
		Tools:        "agent_toolset_20260401",
		Skills:       "[]",
		CreatedAt:    ts,
		UpdatedAt:    ts,
	}
}

func seedResources(ts time.Time) []Resource {
	return []Resource{
		resource("session", "sesn_01SSHReverseDebug", "Managed SSH bootstrap", "Succeeded", "agent_013mi1SmR2hJ6Hk6wNTeJvF9", "2 days ago", ts),
		resource("session", "sesn_01IncidentTriage", "Incident triage drill", "Failed", "agent_01AVRPTGyYareCeoUasn66q5", "heartbeat lost", ts),
		resource("deployment", "depl_01DailyDigest", "World Cup digest preview", "Ready", "Vercel", "https://digest.example.local", ts),
		resource("environment", "env_01UbuntuNode", "Ubuntu Node sandbox", "Active", "4 vCPU / 16 GB", "Firecracker", ts),
		resource("environment", "env_01PythonBrowser", "Python browser workspace", "Active", "Playwright / Python", "Firecracker", ts),
		resource("vault", "vault_01GitHub", "GitHub source access", "Active", "3 bindings", "last used 2 days ago", ts),
		resource("memory_store", "mem_01Ops", "Operations memory", "Active", "42 documents", "vector index ready", ts),
		resource("file", "file_01Outputs", "session-output.tar.gz", "Available", "outputs", "2.4 MB", ts),
		resource("skill", "skill_01ReverseTunnel", "reverse-tunnel-bootstrap", "Active", "v0.1.0", "read-only mount", ts),
	}
}

func resource(kind, id, name, status, primary, secondary string, ts time.Time) Resource {
	return Resource{
		ID:          id,
		Kind:        kind,
		Name:        name,
		Status:      status,
		Description: primary,
		Primary:     primary,
		Secondary:   secondary,
		CreatedAt:   ts,
		UpdatedAt:   ts,
	}
}

func env(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}

func defaultString(value, fallback string) string {
	if strings.TrimSpace(value) == "" {
		return fallback
	}
	return value
}

const defaultSystemPrompt = "You are a general-purpose agent that can research, write code, run commands, and use connected tools to complete the user's task end to end."

const reverseTunnelPrompt = "You are a Managed Agents environment bootstrapper for reverse SSH debug access. When instructed, use bash to configure sshd inside the current environment, install the provided authorized public key for inbound login, write the provided private key for outbound connection to the jump host, and establish a persistent reverse SSH tunnel to the jump host. Be careful with secrets: never print private keys or full secrets in output. Prefer idempotent commands. After setup, verify sshd is listening locally, verify the reverse tunnel process is alive, and report only concise connection instructions and status."
