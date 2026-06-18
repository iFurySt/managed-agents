package main

import (
	"errors"
	"fmt"
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

type Session struct {
	ID              string         `json:"id" gorm:"primaryKey"`
	Name            string         `json:"name"`
	Status          string         `json:"status"`
	AgentID         string         `json:"agentId" gorm:"index"`
	AgentName       string         `json:"agentName"`
	EnvironmentID   string         `json:"environmentId" gorm:"index"`
	EnvironmentName string         `json:"environmentName"`
	DeploymentID    string         `json:"deploymentId"`
	Vaults          string         `json:"vaults"`
	Resources       string         `json:"resources" gorm:"type:text"`
	Duration        string         `json:"duration"`
	Tokens          string         `json:"tokens"`
	Cost            string         `json:"cost"`
	CreatedLabel    string         `json:"createdLabel"`
	CreatedAt       time.Time      `json:"createdAt"`
	UpdatedAt       time.Time      `json:"updatedAt"`
	Events          []SessionEvent `json:"events" gorm:"foreignKey:SessionID;references:ID"`
}

type SessionEvent struct {
	ID        string    `json:"id" gorm:"primaryKey"`
	SessionID string    `json:"sessionId" gorm:"index"`
	Role      string    `json:"role"`
	Kind      string    `json:"kind"`
	Summary   string    `json:"summary" gorm:"type:text"`
	Status    string    `json:"status"`
	Tokens    string    `json:"tokens"`
	Cost      string    `json:"cost"`
	Offset    string    `json:"offset"`
	CreatedAt time.Time `json:"createdAt"`
}

type CreateAgentRequest struct {
	Name         string `json:"name"`
	Description  string `json:"description"`
	Model        string `json:"model"`
	SystemPrompt string `json:"systemPrompt"`
}

type CreateSessionRequest struct {
	Title         string   `json:"title"`
	AgentID       string   `json:"agentId"`
	EnvironmentID string   `json:"environmentId"`
	Vaults        []string `json:"vaults"`
	Resources     []string `json:"resources"`
}

var resourceKinds = map[string]string{
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
	if err := db.AutoMigrate(&Agent{}, &Resource{}, &Session{}, &SessionEvent{}); err != nil {
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
	router.GET("/api/sessions", listSessions(db))
	router.GET("/api/sessions/:id", getSession(db))
	router.POST("/api/sessions", createSession(db))
	router.POST("/api/sessions/:id/cancel", cancelSession(db))
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

func listSessions(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var sessions []Session
		query := db.Order("created_at desc")
		if search := strings.TrimSpace(c.Query("q")); search != "" {
			query = query.Where("id ILIKE ? OR name ILIKE ?", "%"+search+"%", "%"+search+"%")
		}
		if status := strings.TrimSpace(c.Query("status")); status != "" && !strings.EqualFold(status, "all") {
			query = query.Where("status = ?", status)
		}
		if agentID := strings.TrimSpace(c.Query("agentId")); agentID != "" {
			query = query.Where("agent_id = ?", agentID)
		}
		if deploymentID := strings.TrimSpace(c.Query("deploymentId")); deploymentID != "" {
			query = query.Where("deployment_id = ?", deploymentID)
		}
		if err := query.Find(&sessions).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"items": sessions})
	}
}

func getSession(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var session Session
		if err := db.Preload("Events", func(tx *gorm.DB) *gorm.DB {
			return tx.Order("created_at asc")
		}).First(&session, "id = ?", c.Param("id")).Error; err != nil {
			status := http.StatusInternalServerError
			if errors.Is(err, gorm.ErrRecordNotFound) {
				status = http.StatusNotFound
			}
			c.JSON(status, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, session)
	}
}

func createSession(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req CreateSessionRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		now := time.Now().UTC()
		agentID := defaultString(req.AgentID, "agent_013mi1SmR2hJ6Hk6wNTeJvF9")
		agentName := "Managed SSH Reverse Tunnel Bootstrapper"
		var agent Agent
		if err := db.First(&agent, "id = ?", agentID).Error; err == nil {
			agentName = agent.Name
		}
		envID := defaultString(req.EnvironmentID, "env_01ManagedDebug")
		envName := "managed-sh-debug-env"
		var environment Resource
		if err := db.First(&environment, "id = ? AND kind = ?", envID, "environment").Error; err == nil {
			envName = environment.Name
		}
		name := strings.TrimSpace(req.Title)
		if name == "" {
			name = "Untitled session"
		}
		id := fmt.Sprintf("sesn_local_%s%09d", now.Format("20060102150405"), now.Nanosecond())
		session := Session{
			ID:              id,
			Name:            name,
			Status:          "Idle",
			AgentID:         agentID,
			AgentName:       agentName,
			EnvironmentID:   envID,
			EnvironmentName: envName,
			DeploymentID:    "",
			Vaults:          strings.Join(req.Vaults, ", "),
			Resources:       strings.Join(req.Resources, "\n"),
			Duration:        "0m 00s",
			Tokens:          "0 / 0",
			Cost:            "$0.00",
			CreatedLabel:    "just now",
			CreatedAt:       now,
			UpdatedAt:       now,
			Events: []SessionEvent{
				sessionEvent(id, fmt.Sprintf("sevt_local_%s%09d", now.Format("20060102150405"), now.Nanosecond()), "System", "Lifecycle", "Session created and waiting for the first user turn.", "Created", "0 / 0", "$0.00", "0:00:00", now),
			},
		}
		if err := db.Create(&session).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusCreated, session)
	}
}

func cancelSession(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var session Session
		if err := db.First(&session, "id = ?", c.Param("id")).Error; err != nil {
			status := http.StatusInternalServerError
			if errors.Is(err, gorm.ErrRecordNotFound) {
				status = http.StatusNotFound
			}
			c.JSON(status, gin.H{"error": err.Error()})
			return
		}
		now := time.Now().UTC()
		session.Status = "Cancelled"
		session.UpdatedAt = now
		if err := db.Save(&session).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		event := sessionEvent(session.ID, fmt.Sprintf("sevt_%s%09d", now.Format("20060102150405"), now.Nanosecond()), "System", "Lifecycle", "Cancellation requested from the console.", "Cancelled", session.Tokens, session.Cost, session.Duration, now)
		_ = db.Create(&event).Error
		c.JSON(http.StatusOK, session)
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

	if err := db.Model(&Session{}).Count(&count).Error; err != nil {
		return err
	}
	if count == 0 {
		sessions, events := seedSessions(time.Now().UTC())
		if err := db.Create(&sessions).Error; err != nil {
			return err
		}
		if err := db.Create(&events).Error; err != nil {
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
		resource("deployment", "depl_01DailyDigest", "World Cup digest preview", "Ready", "Vercel", "https://digest.example.local", ts),
		resource("environment", "env_01ManagedDebug", "managed-sh-debug-env", "Active", "4 vCPU / 16 GB", "Firecracker", ts),
		resource("environment", "env_01UbuntuNode", "Ubuntu Node sandbox", "Active", "4 vCPU / 16 GB", "Firecracker", ts),
		resource("environment", "env_01PythonBrowser", "Python browser workspace", "Active", "Playwright / Python", "Firecracker", ts),
		resource("vault", "vault_01GitHub", "GitHub source access", "Active", "3 bindings", "last used 2 days ago", ts),
		resource("memory_store", "mem_01Ops", "Operations memory", "Active", "42 documents", "vector index ready", ts),
		resource("file", "file_01Outputs", "session-output.tar.gz", "Available", "outputs", "2.4 MB", ts),
		resource("skill", "skill_01ReverseTunnel", "reverse-tunnel-bootstrap", "Active", "v0.1.0", "read-only mount", ts),
	}
}

func seedSessions(now time.Time) ([]Session, []SessionEvent) {
	sessionRows := []Session{
		session("sesn_01MwRxWt4Enabbz8a2Vk66M7", "Runtime inventory via SSH 2026-06-18", "Idle", "agent_013mi1SmR2hJ6Hk6wNTeJvF9", "Managed SSH Reverse Tunnel Bootstrapper", "env_01ManagedDebug", "managed-sh-debug-env", "", "34m 34s", "168k / 5.6k", "$4.81", "5 hours ago", now.Add(-5*time.Hour)),
		session("sesn_01DpRMTNY1P3gNrELQEXitXN", "1111", "Idle", "agent_017k8CPYuCFRD9AmupUeXd2Z", "World Cup Daily Digest", "env_01UbuntuNode", "Ubuntu Node sandbox", "", "7m 12s", "31k / 1.2k", "$0.74", "6 hours ago", now.Add(-6*time.Hour)),
		session("sesn_01Dvrq7VjSGUeke6b4fSjBUC", "CronWorldCupDailyDigest", "Idle", "agent_017k8CPYuCFRD9AmupUeXd2Z", "World Cup Daily Digest", "env_01PythonBrowser", "Python browser workspace", "depl_01DailyDigest", "11m 02s", "42k / 2.1k", "$1.10", "Jun 17", now.Add(-28*time.Hour)),
		session("sesn_017yutQbshtPvaCw9efKDP5r", "Reverse SSH bootstrap via amoylab", "Idle", "agent_013mi1SmR2hJ6Hk6wNTeJvF9", "Managed SSH Reverse Tunnel Bootstrapper", "env_01ManagedDebug", "managed-sh-debug-env", "", "18m 45s", "81k / 3.4k", "$2.34", "Jun 16", now.Add(-54*time.Hour)),
		session("sesn_01NVn9pEgoscvpdrNE95mMPd", "CronWorldCupDailyDigest", "Idle", "agent_017k8CPYuCFRD9AmupUeXd2Z", "World Cup Daily Digest", "env_01PythonBrowser", "Python browser workspace", "depl_01DailyDigest", "8m 54s", "38k / 1.8k", "$0.96", "Jun 16", now.Add(-58*time.Hour)),
		session("sesn_01NxEc3HZBVGJhooULZnMyM5", "CronWorldCupDailyDigest", "Idle", "agent_017k8CPYuCFRD9AmupUeXd2Z", "World Cup Daily Digest", "env_01PythonBrowser", "Python browser workspace", "depl_01DailyDigest", "8m 31s", "37k / 1.6k", "$0.91", "Jun 16", now.Add(-60*time.Hour)),
		session("sesn_01R5Mm2LwFTLZtimNNTShPCP", "CronWorldCupDailyDigest", "Idle", "agent_017k8CPYuCFRD9AmupUeXd2Z", "World Cup Daily Digest", "env_01PythonBrowser", "Python browser workspace", "depl_01DailyDigest", "8m 40s", "39k / 1.7k", "$0.93", "Jun 16", now.Add(-62*time.Hour)),
		session("sesn_01Fhy2Hd5TMwWJvMYmjK19vn", "–", "Idle", "agent_017k8CPYuCFRD9AmupUeXd2Z", "World Cup Daily Digest", "env_01PythonBrowser", "Python browser workspace", "", "2m 10s", "9k / 340", "$0.22", "Jun 16", now.Add(-64*time.Hour)),
	}
	events := []SessionEvent{
		sessionEvent("sesn_01MwRxWt4Enabbz8a2Vk66M7", "sevt_01UserBootstrap", "User", "Message", "Bootstrap debug SSH for runtime inventory. Use exactly one bash tool if possible.", "", "", "", "0:00:43", now.Add(-5*time.Hour)),
		sessionEvent("sesn_01MwRxWt4Enabbz8a2Vk66M7", "sevt_01ToolInstall", "Tool", "Bash", "set -euo pipefail; install runtime packages and prepare reverse tunnel.", "Error", "6.0k / 1.6k", "$1.70", "0:00:43", now.Add(-5*time.Hour).Add(43*time.Second)),
		sessionEvent("sesn_01MwRxWt4Enabbz8a2Vk66M7", "sevt_01ToolRetry", "Tool", "Bash", "Create runtime directories, restart the tunnel process, and verify sshd listeners.", "", "7.7k / 854", "$3.50", "0:00:56", now.Add(-5*time.Hour).Add(56*time.Second)),
		sessionEvent("sesn_01MwRxWt4Enabbz8a2Vk66M7", "sevt_01AgentReady", "Agent", "Message", "All components are set up and running. Runtime inventory and debug SSH are healthy.", "", "9.6k / 451", "", "0:01:20", now.Add(-5*time.Hour).Add(80*time.Second)),
		sessionEvent("sesn_01MwRxWt4Enabbz8a2Vk66M7", "sevt_01Cleanup", "Tool", "Bash", "Stop the debug tunnel, verify the process exited, and leave the runtime clean.", "", "13.3k / 78", "$2.30", "0:13:32", now.Add(-5*time.Hour).Add(812*time.Second)),
	}
	for _, row := range sessionRows[1:] {
		events = append(events, sessionEvent(row.ID, "sevt_"+row.ID[len(row.ID)-6:], "System", "Lifecycle", "Session reached idle state after completing its last turn.", "Idle", row.Tokens, row.Cost, row.Duration, row.CreatedAt.Add(2*time.Minute)))
	}
	return sessionRows, events
}

func session(id, name, status, agentID, agentName, environmentID, environmentName, deploymentID, duration, tokens, cost, createdLabel string, ts time.Time) Session {
	return Session{
		ID:              id,
		Name:            name,
		Status:          status,
		AgentID:         agentID,
		AgentName:       agentName,
		EnvironmentID:   environmentID,
		EnvironmentName: environmentName,
		DeploymentID:    deploymentID,
		Vaults:          "vault_01GitHub",
		Resources:       "session-output.tar.gz\noperations-memory",
		Duration:        duration,
		Tokens:          tokens,
		Cost:            cost,
		CreatedLabel:    createdLabel,
		CreatedAt:       ts,
		UpdatedAt:       ts,
	}
}

func sessionEvent(sessionID, id, role, kind, summary, status, tokens, cost, offset string, ts time.Time) SessionEvent {
	return SessionEvent{
		ID:        id,
		SessionID: sessionID,
		Role:      role,
		Kind:      kind,
		Summary:   summary,
		Status:    status,
		Tokens:    tokens,
		Cost:      cost,
		Offset:    offset,
		CreatedAt: ts,
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
