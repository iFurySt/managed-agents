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

type Environment struct {
	ID             string    `json:"id" gorm:"primaryKey"`
	Name           string    `json:"name"`
	Status         string    `json:"status" gorm:"index"`
	Type           string    `json:"type" gorm:"index"`
	Description    string    `json:"description" gorm:"type:text"`
	NetworkingType string    `json:"networkingType"`
	PackageManager string    `json:"packageManager"`
	Packages       string    `json:"packages" gorm:"type:text"`
	Metadata       string    `json:"metadata" gorm:"type:text"`
	CreatedLabel   string    `json:"createdLabel"`
	UpdatedLabel   string    `json:"updatedLabel"`
	CreatedAt      time.Time `json:"createdAt"`
	UpdatedAt      time.Time `json:"updatedAt"`
}

type Vault struct {
	ID           string            `json:"id" gorm:"primaryKey"`
	Name         string            `json:"name"`
	Status       string            `json:"status" gorm:"index"`
	Description  string            `json:"description" gorm:"type:text"`
	CreatedLabel string            `json:"createdLabel"`
	UpdatedLabel string            `json:"updatedLabel"`
	CreatedAt    time.Time         `json:"createdAt"`
	UpdatedAt    time.Time         `json:"updatedAt"`
	Credentials  []VaultCredential `json:"credentials" gorm:"foreignKey:VaultID;references:ID"`
}

type VaultCredential struct {
	ID           string    `json:"id" gorm:"primaryKey"`
	VaultID      string    `json:"vaultId" gorm:"index"`
	Name         string    `json:"name"`
	AuthType     string    `json:"authType" gorm:"index"`
	Target       string    `json:"target"`
	Status       string    `json:"status" gorm:"index"`
	LastUsed     string    `json:"lastUsed"`
	UpdatedLabel string    `json:"updatedLabel"`
	CreatedAt    time.Time `json:"createdAt"`
	UpdatedAt    time.Time `json:"updatedAt"`
}

type MemoryStore struct {
	ID           string         `json:"id" gorm:"primaryKey"`
	Name         string         `json:"name"`
	Status       string         `json:"status" gorm:"index"`
	Description  string         `json:"description" gorm:"type:text"`
	CreatedLabel string         `json:"createdLabel"`
	UpdatedLabel string         `json:"updatedLabel"`
	CreatedAt    time.Time      `json:"createdAt"`
	UpdatedAt    time.Time      `json:"updatedAt"`
	Memories     []MemoryRecord `json:"memories" gorm:"foreignKey:MemoryStoreID;references:ID"`
}

type MemoryRecord struct {
	ID            string    `json:"id" gorm:"primaryKey"`
	MemoryStoreID string    `json:"memoryStoreId" gorm:"index"`
	Path          string    `json:"path"`
	Status        string    `json:"status" gorm:"index"`
	Size          string    `json:"size"`
	Content       string    `json:"content" gorm:"type:text"`
	AuthorID      string    `json:"authorId"`
	UpdatedLabel  string    `json:"updatedLabel"`
	CreatedAt     time.Time `json:"createdAt"`
	UpdatedAt     time.Time `json:"updatedAt"`
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

type Deployment struct {
	ID              string          `json:"id" gorm:"primaryKey"`
	Name            string          `json:"name"`
	Status          string          `json:"status"`
	AgentID         string          `json:"agentId" gorm:"index"`
	AgentName       string          `json:"agentName"`
	AgentVersion    string          `json:"agentVersion"`
	EnvironmentID   string          `json:"environmentId" gorm:"index"`
	EnvironmentName string          `json:"environmentName"`
	Vaults          string          `json:"vaults"`
	MemoryStores    string          `json:"memoryStores"`
	Trigger         string          `json:"trigger"`
	Schedule        string          `json:"schedule"`
	Timezone        string          `json:"timezone"`
	InitialMessage  string          `json:"initialMessage" gorm:"type:text"`
	NextRuns        string          `json:"nextRuns"`
	LastRunLabel    string          `json:"lastRunLabel"`
	CreatedLabel    string          `json:"createdLabel"`
	CreatedAt       time.Time       `json:"createdAt"`
	UpdatedAt       time.Time       `json:"updatedAt"`
	Runs            []DeploymentRun `json:"runs" gorm:"foreignKey:DeploymentID;references:ID"`
}

type DeploymentRun struct {
	ID            string    `json:"id" gorm:"primaryKey"`
	DeploymentID  string    `json:"deploymentId" gorm:"index"`
	StartedAt     string    `json:"startedAt"`
	StartedLabel  string    `json:"startedLabel"`
	Trigger       string    `json:"trigger"`
	Result        string    `json:"result"`
	AgentVersion  string    `json:"agentVersion"`
	SessionID     string    `json:"sessionId"`
	SessionStatus string    `json:"sessionStatus"`
	CreatedAt     time.Time `json:"createdAt"`
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

type CreateDeploymentRequest struct {
	Name           string   `json:"name"`
	AgentID        string   `json:"agentId"`
	InitialMessage string   `json:"initialMessage"`
	EnvironmentID  string   `json:"environmentId"`
	Vaults         []string `json:"vaults"`
	MemoryStores   []string `json:"memoryStores"`
	Trigger        string   `json:"trigger"`
	Schedule       string   `json:"schedule"`
	Timezone       string   `json:"timezone"`
}

type CreateEnvironmentRequest struct {
	Name        string `json:"name"`
	HostingType string `json:"hostingType"`
	Description string `json:"description"`
}

type UpdateEnvironmentRequest struct {
	Name           string   `json:"name"`
	Description    string   `json:"description"`
	NetworkingType string   `json:"networkingType"`
	PackageManager string   `json:"packageManager"`
	Packages       []string `json:"packages"`
	Metadata       string   `json:"metadata"`
}

type CreateVaultRequest struct {
	Name string `json:"name"`
}

type CreateVaultCredentialRequest struct {
	Name     string `json:"name"`
	AuthType string `json:"authType"`
	Target   string `json:"target"`
}

type CreateMemoryStoreRequest struct {
	Name        string `json:"name"`
	Description string `json:"description"`
}

type CreateMemoryRequest struct {
	Path    string `json:"path"`
	Content string `json:"content"`
}

var resourceKinds = map[string]string{
	"files":  "file",
	"skills": "skill",
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
	if err := db.AutoMigrate(&Agent{}, &Resource{}, &Environment{}, &Vault{}, &VaultCredential{}, &MemoryStore{}, &MemoryRecord{}, &Session{}, &SessionEvent{}, &Deployment{}, &DeploymentRun{}); err != nil {
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
	router.GET("/api/deployments", listDeployments(db))
	router.GET("/api/deployments/:id", getDeployment(db))
	router.POST("/api/deployments", createDeployment(db))
	router.POST("/api/deployments/:id/run", runDeployment(db))
	router.GET("/api/environments", listEnvironments(db))
	router.GET("/api/environments/:id", getEnvironment(db))
	router.POST("/api/environments", createEnvironment(db))
	router.PATCH("/api/environments/:id", updateEnvironment(db))
	router.POST("/api/environments/:id/archive", archiveEnvironment(db))
	router.GET("/api/vaults", listVaults(db))
	router.GET("/api/vaults/:id", getVault(db))
	router.POST("/api/vaults", createVault(db))
	router.POST("/api/vaults/:id/archive", archiveVault(db))
	router.DELETE("/api/vaults/:id", deleteVault(db))
	router.POST("/api/vaults/:id/credentials", createVaultCredential(db))
	router.POST("/api/vaults/:id/credentials/:credentialID/archive", archiveVaultCredential(db))
	router.DELETE("/api/vaults/:id/credentials/:credentialID", deleteVaultCredential(db))
	router.GET("/api/memory-stores", listMemoryStores(db))
	router.GET("/api/memory-stores/:id", getMemoryStore(db))
	router.POST("/api/memory-stores", createMemoryStore(db))
	router.POST("/api/memory-stores/:id/archive", archiveMemoryStore(db))
	router.DELETE("/api/memory-stores/:id", deleteMemoryStore(db))
	router.POST("/api/memory-stores/:id/memories", createMemoryRecord(db))
	router.DELETE("/api/memory-stores/:id/memories/:memoryID", deleteMemoryRecord(db))
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
		envName := lookupEnvironmentName(db, envID, "managed-sh-debug-env")
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

func listDeployments(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var deployments []Deployment
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
		if err := query.Find(&deployments).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"items": deployments})
	}
}

func getDeployment(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var deployment Deployment
		if err := db.Preload("Runs", func(tx *gorm.DB) *gorm.DB {
			return tx.Order("created_at desc")
		}).First(&deployment, "id = ?", c.Param("id")).Error; err != nil {
			status := http.StatusInternalServerError
			if errors.Is(err, gorm.ErrRecordNotFound) {
				status = http.StatusNotFound
			}
			c.JSON(status, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, deployment)
	}
}

func createDeployment(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req CreateDeploymentRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		now := time.Now().UTC()
		agentID := defaultString(req.AgentID, "agent_017k8CPYuCFRD9AmupUeXd2Z")
		agentName := "World Cup Daily Digest"
		var agent Agent
		if err := db.First(&agent, "id = ?", agentID).Error; err == nil {
			agentName = agent.Name
		}
		envID := defaultString(req.EnvironmentID, "env_01PythonBrowser")
		envName := lookupEnvironmentName(db, envID, "world-cup-digest-env")
		name := strings.TrimSpace(req.Name)
		if name == "" {
			name = "Untitled deployment"
		}
		trigger := defaultString(req.Trigger, "Manual")
		deployment := Deployment{
			ID:              fmt.Sprintf("depl_local_%s%09d", now.Format("20060102150405"), now.Nanosecond()),
			Name:            name,
			Status:          "Paused",
			AgentID:         agentID,
			AgentName:       agentName,
			AgentVersion:    "v1",
			EnvironmentID:   envID,
			EnvironmentName: envName,
			Vaults:          strings.Join(req.Vaults, ", "),
			MemoryStores:    strings.Join(req.MemoryStores, ", "),
			Trigger:         trigger,
			Schedule:        defaultString(req.Schedule, "Manual"),
			Timezone:        defaultString(req.Timezone, "Asia/Shanghai"),
			InitialMessage:  defaultString(req.InitialMessage, "Run the deployment task and report a concise completion summary."),
			NextRuns:        "On demand",
			LastRunLabel:    "never",
			CreatedLabel:    "just now",
			CreatedAt:       now,
			UpdatedAt:       now,
		}
		if strings.EqualFold(trigger, "Schedule") && deployment.Schedule == "Manual" {
			deployment.Schedule = "0 1 * * *"
			deployment.NextRuns = "Fri 1:00 AM, Sat 1:00 AM, Sun 1:00 AM, Mon 1:00 AM"
		}
		if err := db.Create(&deployment).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusCreated, deployment)
	}
}

func runDeployment(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var deployment Deployment
		if err := db.First(&deployment, "id = ?", c.Param("id")).Error; err != nil {
			status := http.StatusInternalServerError
			if errors.Is(err, gorm.ErrRecordNotFound) {
				status = http.StatusNotFound
			}
			c.JSON(status, gin.H{"error": err.Error()})
			return
		}
		now := time.Now().UTC()
		sessionID := fmt.Sprintf("sesn_local_%s%09d", now.Format("20060102150405"), now.Nanosecond())
		session := Session{
			ID:              sessionID,
			Name:            deployment.Name,
			Status:          "Idle",
			AgentID:         deployment.AgentID,
			AgentName:       deployment.AgentName,
			EnvironmentID:   deployment.EnvironmentID,
			EnvironmentName: deployment.EnvironmentName,
			DeploymentID:    deployment.ID,
			Vaults:          deployment.Vaults,
			Resources:       deployment.MemoryStores,
			Duration:        "0m 00s",
			Tokens:          "0 / 0",
			Cost:            "$0.00",
			CreatedLabel:    "just now",
			CreatedAt:       now,
			UpdatedAt:       now,
		}
		run := DeploymentRun{
			ID:            fmt.Sprintf("drun_local_%s%09d", now.Format("20060102150405"), now.Nanosecond()),
			DeploymentID:  deployment.ID,
			StartedAt:     now.Format("1/2/2006, 3:04 PM"),
			StartedLabel:  "just now",
			Trigger:       "Manual",
			Result:        "Success",
			AgentVersion:  deployment.AgentVersion,
			SessionID:     sessionID,
			SessionStatus: "Idle",
			CreatedAt:     now,
		}
		event := sessionEvent(sessionID, fmt.Sprintf("sevt_local_%s%09d", now.Format("20060102150405"), now.Nanosecond()), "System", "Deployment run", "Deployment was run manually from the console.", "Idle", "0 / 0", "$0.00", "0:00:00", now)
		deployment.LastRunLabel = "just now"
		deployment.UpdatedAt = now
		if err := db.Create(&session).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		if err := db.Create(&event).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		if err := db.Create(&run).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		if err := db.Save(&deployment).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusCreated, run)
	}
}

func listEnvironments(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var environments []Environment
		query := db.Order("created_at desc")
		if search := strings.TrimSpace(c.Query("q")); search != "" {
			query = query.Where("id ILIKE ? OR name ILIKE ?", "%"+search+"%", "%"+search+"%")
		}
		if status := strings.TrimSpace(c.Query("status")); status != "" && !strings.EqualFold(status, "all") {
			query = query.Where("status = ?", status)
		}
		if err := query.Find(&environments).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"items": environments})
	}
}

func getEnvironment(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var environment Environment
		if err := db.First(&environment, "id = ?", c.Param("id")).Error; err != nil {
			status := http.StatusInternalServerError
			if errors.Is(err, gorm.ErrRecordNotFound) {
				status = http.StatusNotFound
			}
			c.JSON(status, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, environment)
	}
}

func createEnvironment(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req CreateEnvironmentRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		now := time.Now().UTC()
		name := strings.TrimSpace(req.Name)
		if name == "" {
			name = "Untitled environment"
		}
		if len(name) > 50 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "name must be 50 characters or fewer"})
			return
		}
		hostingType := defaultString(req.HostingType, "Cloud")
		if !strings.EqualFold(hostingType, "Cloud") && !strings.EqualFold(hostingType, "Self-hosted") {
			c.JSON(http.StatusBadRequest, gin.H{"error": "hostingType must be Cloud or Self-hosted"})
			return
		}
		environment := Environment{
			ID:             fmt.Sprintf("env_local_%s%09d", now.Format("20060102150405"), now.Nanosecond()),
			Name:           name,
			Status:         "Active",
			Type:           titleHostType(hostingType),
			Description:    strings.TrimSpace(req.Description),
			NetworkingType: "Unrestricted",
			PackageManager: "apt",
			Packages:       "",
			Metadata:       "",
			CreatedLabel:   "just now",
			UpdatedLabel:   "just now",
			CreatedAt:      now,
			UpdatedAt:      now,
		}
		if err := db.Create(&environment).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusCreated, environment)
	}
}

func updateEnvironment(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var environment Environment
		if err := db.First(&environment, "id = ?", c.Param("id")).Error; err != nil {
			status := http.StatusInternalServerError
			if errors.Is(err, gorm.ErrRecordNotFound) {
				status = http.StatusNotFound
			}
			c.JSON(status, gin.H{"error": err.Error()})
			return
		}
		var req UpdateEnvironmentRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		if name := strings.TrimSpace(req.Name); name != "" {
			if len(name) > 50 {
				c.JSON(http.StatusBadRequest, gin.H{"error": "name must be 50 characters or fewer"})
				return
			}
			environment.Name = name
		}
		environment.Description = strings.TrimSpace(req.Description)
		environment.NetworkingType = defaultString(req.NetworkingType, environment.NetworkingType)
		environment.PackageManager = defaultString(req.PackageManager, environment.PackageManager)
		environment.Packages = strings.Join(req.Packages, " ")
		environment.Metadata = strings.TrimSpace(req.Metadata)
		environment.UpdatedLabel = "just now"
		environment.UpdatedAt = time.Now().UTC()
		if err := db.Save(&environment).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, environment)
	}
}

func archiveEnvironment(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var environment Environment
		if err := db.First(&environment, "id = ?", c.Param("id")).Error; err != nil {
			status := http.StatusInternalServerError
			if errors.Is(err, gorm.ErrRecordNotFound) {
				status = http.StatusNotFound
			}
			c.JSON(status, gin.H{"error": err.Error()})
			return
		}
		environment.Status = "Archived"
		environment.UpdatedLabel = "just now"
		environment.UpdatedAt = time.Now().UTC()
		if err := db.Save(&environment).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, environment)
	}
}

func listVaults(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var vaults []Vault
		query := db.Order("created_at desc")
		if search := strings.TrimSpace(c.Query("q")); search != "" {
			query = query.Where("id ILIKE ? OR name ILIKE ?", "%"+search+"%", "%"+search+"%")
		}
		if status := strings.TrimSpace(c.Query("status")); status != "" && !strings.EqualFold(status, "all") {
			query = query.Where("status = ?", status)
		}
		if err := query.Find(&vaults).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"items": vaults})
	}
}

func getVault(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var vault Vault
		if err := db.Preload("Credentials", func(tx *gorm.DB) *gorm.DB {
			return tx.Order("created_at desc")
		}).First(&vault, "id = ?", c.Param("id")).Error; err != nil {
			status := http.StatusInternalServerError
			if errors.Is(err, gorm.ErrRecordNotFound) {
				status = http.StatusNotFound
			}
			c.JSON(status, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, vault)
	}
}

func createVault(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req CreateVaultRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		now := time.Now().UTC()
		name := strings.TrimSpace(req.Name)
		if name == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "name is required"})
			return
		}
		if len(name) > 50 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "name must be 50 characters or fewer"})
			return
		}
		vault := Vault{
			ID:           fmt.Sprintf("vlt_local_%s%09d", now.Format("20060102150405"), now.Nanosecond()),
			Name:         name,
			Status:       "Active",
			Description:  "Workspace-shared credential vault.",
			CreatedLabel: "just now",
			UpdatedLabel: "just now",
			CreatedAt:    now,
			UpdatedAt:    now,
		}
		if err := db.Create(&vault).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusCreated, vault)
	}
}

func archiveVault(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var vault Vault
		if err := db.First(&vault, "id = ?", c.Param("id")).Error; err != nil {
			status := http.StatusInternalServerError
			if errors.Is(err, gorm.ErrRecordNotFound) {
				status = http.StatusNotFound
			}
			c.JSON(status, gin.H{"error": err.Error()})
			return
		}
		vault.Status = "Archived"
		vault.UpdatedLabel = "just now"
		vault.UpdatedAt = time.Now().UTC()
		if err := db.Save(&vault).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, vault)
	}
}

func deleteVault(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		if err := db.Where("vault_id = ?", c.Param("id")).Delete(&VaultCredential{}).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		deleteByID[Vault](c, db, "id = ?", c.Param("id"))
	}
}

func createVaultCredential(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var vault Vault
		if err := db.First(&vault, "id = ?", c.Param("id")).Error; err != nil {
			status := http.StatusInternalServerError
			if errors.Is(err, gorm.ErrRecordNotFound) {
				status = http.StatusNotFound
			}
			c.JSON(status, gin.H{"error": err.Error()})
			return
		}
		var req CreateVaultCredentialRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		now := time.Now().UTC()
		authType := defaultString(req.AuthType, "MCP OAuth")
		if !validCredentialType(authType) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "authType must be MCP OAuth, Bearer token, or Environment variable"})
			return
		}
		credential := VaultCredential{
			ID:           fmt.Sprintf("vcrd_local_%s%09d", now.Format("20060102150405"), now.Nanosecond()),
			VaultID:      vault.ID,
			Name:         defaultString(req.Name, "Unnamed"),
			AuthType:     authType,
			Target:       defaultString(req.Target, defaultCredentialTarget(authType)),
			Status:       "Active",
			LastUsed:     "Never",
			UpdatedLabel: "just now",
			CreatedAt:    now,
			UpdatedAt:    now,
		}
		if err := db.Create(&credential).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusCreated, credential)
	}
}

func archiveVaultCredential(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var credential VaultCredential
		if err := db.First(&credential, "id = ? AND vault_id = ?", c.Param("credentialID"), c.Param("id")).Error; err != nil {
			status := http.StatusInternalServerError
			if errors.Is(err, gorm.ErrRecordNotFound) {
				status = http.StatusNotFound
			}
			c.JSON(status, gin.H{"error": err.Error()})
			return
		}
		credential.Status = "Archived"
		credential.UpdatedLabel = "just now"
		credential.UpdatedAt = time.Now().UTC()
		if err := db.Save(&credential).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, credential)
	}
}

func deleteVaultCredential(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		deleteByID[VaultCredential](c, db, "id = ? AND vault_id = ?", c.Param("credentialID"), c.Param("id"))
	}
}

func listMemoryStores(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var stores []MemoryStore
		query := db.Order("created_at desc")
		if search := strings.TrimSpace(c.Query("q")); search != "" {
			query = query.Where("id ILIKE ? OR name ILIKE ?", "%"+search+"%", "%"+search+"%")
		}
		if status := strings.TrimSpace(c.Query("status")); status != "" && !strings.EqualFold(status, "all") {
			query = query.Where("status = ?", status)
		}
		if err := query.Find(&stores).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"items": stores})
	}
}

func getMemoryStore(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var store MemoryStore
		if err := db.Preload("Memories", func(tx *gorm.DB) *gorm.DB {
			return tx.Order("path asc")
		}).First(&store, "id = ?", c.Param("id")).Error; err != nil {
			status := http.StatusInternalServerError
			if errors.Is(err, gorm.ErrRecordNotFound) {
				status = http.StatusNotFound
			}
			c.JSON(status, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, store)
	}
}

func createMemoryStore(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req CreateMemoryStoreRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		now := time.Now().UTC()
		name := strings.TrimSpace(req.Name)
		if name == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "name is required"})
			return
		}
		store := MemoryStore{
			ID:           fmt.Sprintf("memstore_local_%s%09d", now.Format("20060102150405"), now.Nanosecond()),
			Name:         name,
			Status:       "Active",
			Description:  strings.TrimSpace(req.Description),
			CreatedLabel: "just now",
			UpdatedLabel: "just now",
			CreatedAt:    now,
			UpdatedAt:    now,
		}
		if err := db.Create(&store).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusCreated, store)
	}
}

func archiveMemoryStore(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var store MemoryStore
		if err := db.First(&store, "id = ?", c.Param("id")).Error; err != nil {
			status := http.StatusInternalServerError
			if errors.Is(err, gorm.ErrRecordNotFound) {
				status = http.StatusNotFound
			}
			c.JSON(status, gin.H{"error": err.Error()})
			return
		}
		store.Status = "Archived"
		store.UpdatedLabel = "just now"
		store.UpdatedAt = time.Now().UTC()
		if err := db.Save(&store).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, store)
	}
}

func deleteMemoryStore(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		if err := db.Where("memory_store_id = ?", c.Param("id")).Delete(&MemoryRecord{}).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		deleteByID[MemoryStore](c, db, "id = ?", c.Param("id"))
	}
}

func createMemoryRecord(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var store MemoryStore
		if err := db.First(&store, "id = ?", c.Param("id")).Error; err != nil {
			status := http.StatusInternalServerError
			if errors.Is(err, gorm.ErrRecordNotFound) {
				status = http.StatusNotFound
			}
			c.JSON(status, gin.H{"error": err.Error()})
			return
		}
		var req CreateMemoryRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		path := normalizeMemoryPath(req.Path)
		if path == "/" || path == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "path is required"})
			return
		}
		now := time.Now().UTC()
		memory := MemoryRecord{
			ID:            fmt.Sprintf("mem_local_%s%09d", now.Format("20060102150405"), now.Nanosecond()),
			MemoryStoreID: store.ID,
			Path:          path,
			Status:        "Active",
			Size:          humanSize(len(req.Content)),
			Content:       req.Content,
			AuthorID:      "user_local_admin",
			UpdatedLabel:  "just now",
			CreatedAt:     now,
			UpdatedAt:     now,
		}
		if err := db.Create(&memory).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		store.UpdatedLabel = "just now"
		store.UpdatedAt = now
		_ = db.Save(&store).Error
		c.JSON(http.StatusCreated, memory)
	}
}

func deleteMemoryRecord(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		deleteByID[MemoryRecord](c, db, "id = ? AND memory_store_id = ?", c.Param("memoryID"), c.Param("id"))
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

	if err := db.Model(&Environment{}).Count(&count).Error; err != nil {
		return err
	}
	if count == 0 {
		environments := seedEnvironments(now)
		if err := db.Create(&environments).Error; err != nil {
			return err
		}
	}

	if err := db.Model(&Vault{}).Count(&count).Error; err != nil {
		return err
	}
	if count == 0 {
		vaults, credentials := seedVaults(now)
		if err := db.Create(&vaults).Error; err != nil {
			return err
		}
		if err := db.Create(&credentials).Error; err != nil {
			return err
		}
	}

	if err := db.Model(&MemoryStore{}).Count(&count).Error; err != nil {
		return err
	}
	if count == 0 {
		stores, memories := seedMemoryStores(now)
		if err := db.Create(&stores).Error; err != nil {
			return err
		}
		if err := db.Create(&memories).Error; err != nil {
			return err
		}
	}

	if err := db.Model(&Deployment{}).Count(&count).Error; err != nil {
		return err
	}
	if count == 0 {
		deployments, runs := seedDeployments(time.Now().UTC())
		if err := db.Create(&deployments).Error; err != nil {
			return err
		}
		if err := db.Create(&runs).Error; err != nil {
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
		resource("environment", "env_01ManagedDebug", "managed-sh-debug-env", "Active", "4 vCPU / 16 GB", "Firecracker", ts),
		resource("environment", "env_01WorldCupDigest", "world-cup-digest-env", "Active", "Playwright / Python", "Firecracker", ts),
		resource("environment", "env_01UbuntuNode", "Ubuntu Node sandbox", "Active", "4 vCPU / 16 GB", "Firecracker", ts),
		resource("environment", "env_01PythonBrowser", "Python browser workspace", "Active", "Playwright / Python", "Firecracker", ts),
		resource("vault", "vault_01GitHub", "GitHub source access", "Active", "3 bindings", "last used 2 days ago", ts),
		resource("vault", "vault_01TestSecret", "test_secret", "Active", "1 binding", "last used 2 days ago", ts),
		resource("file", "file_01Outputs", "session-output.tar.gz", "Available", "outputs", "2.4 MB", ts),
		resource("skill", "skill_01ReverseTunnel", "reverse-tunnel-bootstrap", "Active", "v0.1.0", "read-only mount", ts),
	}
}

func seedEnvironments(ts time.Time) []Environment {
	return []Environment{
		environment("env_01UTaKkbFknSkQNEsZjUARMh", "managed-ssh-debug-env", "Active", "Cloud", "Cloud env for reverse SSH access through amoylab jump host", "Unrestricted", "apt", "openssh-client openssh-server procps net-tools", "", "Jun 16", ts),
		environment("env_01LiiuDCwZBtqZd5EYMk9D9x", "123", "Active", "Self-hosted", "Self-hosted test environment connected through a customer-managed runner.", "Unrestricted", "apt", "", "", "Jun 16", ts),
		environment("env_01AzQWp3SXQEATgdCFUNwteR", "myenv", "Active", "Self-hosted", "Local self-hosted environment registered for runtime checks.", "Unrestricted", "apt", "", "", "Jun 16", ts),
		environment("env_01UNo9NMB1ZQLKCZk21qryb8", "world-cup-digest-env", "Active", "Cloud", "Cloud runtime for World Cup daily digest sessions and deployments.", "Unrestricted", "apt", "python3 python3-pip playwright chromium", "", "Jun 16", ts),
	}
}

func environment(id, name, status, hostType, description, networkingType, packageManager, packages, metadata, updatedLabel string, ts time.Time) Environment {
	return Environment{
		ID:             id,
		Name:           name,
		Status:         status,
		Type:           hostType,
		Description:    description,
		NetworkingType: networkingType,
		PackageManager: packageManager,
		Packages:       packages,
		Metadata:       metadata,
		CreatedLabel:   updatedLabel,
		UpdatedLabel:   updatedLabel,
		CreatedAt:      ts,
		UpdatedAt:      ts,
	}
}

func seedVaults(ts time.Time) ([]Vault, []VaultCredential) {
	vaults := []Vault{
		vault("vlt_011Cc6ULi3DaPNjN1LZLTenB", "test_secret", "Active", "Jun 16", ts),
		vault("vault_01GitHub", "GitHub source access", "Active", "Jun 16", ts),
	}
	credentials := []VaultCredential{
		vaultCredential("vcrd_01EnvVarOpsToken", "vlt_011Cc6ULi3DaPNjN1LZLTenB", "Unnamed", "Environment variable", "OPS_TOKEN", "Active", "Never", "Jun 16", ts),
		vaultCredential("vcrd_01EnvVarApiKey", "vlt_011Cc6ULi3DaPNjN1LZLTenB", "Unnamed", "Environment variable", "API_TOKEN", "Active", "Never", "Jun 16", ts),
		vaultCredential("vcrd_01BearerInternal", "vlt_011Cc6ULi3DaPNjN1LZLTenB", "bearertoken", "Bearer token", "https://api.example.com/", "Active", "Never", "Jun 16", ts),
		vaultCredential("vcrd_01McpOAuthGmail", "vlt_011Cc6ULi3DaPNjN1LZLTenB", "mcpoauth", "MCP OAuth", "https://gmail.mcp.example.com/mcp", "Active", "Never", "Jun 16", ts),
		vaultCredential("vcrd_01GithubToken", "vault_01GitHub", "github-token", "Bearer token", "https://api.github.com/", "Active", "2 days ago", "Jun 16", ts),
	}
	return vaults, credentials
}

func vault(id, name, status, label string, ts time.Time) Vault {
	return Vault{
		ID:           id,
		Name:         name,
		Status:       status,
		Description:  "Workspace-shared credential vault.",
		CreatedLabel: label,
		UpdatedLabel: label,
		CreatedAt:    ts,
		UpdatedAt:    ts,
	}
}

func vaultCredential(id, vaultID, name, authType, target, status, lastUsed, updatedLabel string, ts time.Time) VaultCredential {
	return VaultCredential{
		ID:           id,
		VaultID:      vaultID,
		Name:         name,
		AuthType:     authType,
		Target:       target,
		Status:       status,
		LastUsed:     lastUsed,
		UpdatedLabel: updatedLabel,
		CreatedAt:    ts,
		UpdatedAt:    ts,
	}
}

func seedMemoryStores(ts time.Time) ([]MemoryStore, []MemoryRecord) {
	stores := []MemoryStore{
		memoryStore("memstore_01TFhvAtMizQJLWU29TaW5AZ", "123", "Active", "Browse and manage persistent memory for your agents.", "6 hours ago", ts.Add(42*time.Hour)),
		memoryStore("memstore_01GYUDt8DBmRPDfhs5i9in8M", "zzz", "Active", "Scratch memory store for console testing.", "2 days ago", ts),
		memoryStore("memstore_01GToktzJyefFL2DVxmgyT5e", "world cup", "Active", "Daily World Cup memory for agents that prepare match and news digests.", "2 days ago", ts),
		memoryStore("memstore_014LoF1P4MoTKK9HYDmacJuB", "leo_test", "Active", "Personal test memory store.", "2 days ago", ts),
	}
	memories := []MemoryRecord{
		memoryRecord("mem_01VZ3WZtoGtAg3kogjFYzCmu", "memstore_01GToktzJyefFL2DVxmgyT5e", "/test123", "3 B", "123", "user_01LsgCVVMMzNu5zsAxf9EgUv", "Jun 16", ts),
		memoryRecord("mem_01DailyReport", "memstore_01GToktzJyefFL2DVxmgyT5e", "/daily-reports/jun-16.md", "446 B", "Track match schedule changes, notable injuries, and coach quotes before producing the daily digest.", "user_01LsgCVVMMzNu5zsAxf9EgUv", "Jun 16", ts),
	}
	return stores, memories
}

func memoryStore(id, name, status, description, label string, ts time.Time) MemoryStore {
	return MemoryStore{
		ID:           id,
		Name:         name,
		Status:       status,
		Description:  description,
		CreatedLabel: label,
		UpdatedLabel: label,
		CreatedAt:    ts,
		UpdatedAt:    ts,
	}
}

func memoryRecord(id, storeID, path, size, content, authorID, label string, ts time.Time) MemoryRecord {
	return MemoryRecord{
		ID:            id,
		MemoryStoreID: storeID,
		Path:          path,
		Status:        "Active",
		Size:          size,
		Content:       content,
		AuthorID:      authorID,
		UpdatedLabel:  label,
		CreatedAt:     ts,
		UpdatedAt:     ts,
	}
}

func seedDeployments(now time.Time) ([]Deployment, []DeploymentRun) {
	deployments := []Deployment{
		{
			ID:              "depl_01ERmHnRJWQSLyxk7pVCMZXs",
			Name:            "CronWorldCupDailyDigest",
			Status:          "Paused",
			AgentID:         "agent_017k8CPYuCFRD9AmupUeXd2Z",
			AgentName:       "World Cup Daily Digest",
			AgentVersion:    "v2",
			EnvironmentID:   "env_01WorldCupDigest",
			EnvironmentName: "world-cup-digest-env",
			Vaults:          "test_secret",
			MemoryStores:    "world cup",
			Trigger:         "Schedule",
			Schedule:        "0 1 * * *",
			Timezone:        "Asia/Shanghai",
			InitialMessage:  "Prepare the daily World Cup digest. When complete, report only a concise delivery status through the configured callback.",
			NextRuns:        "Fri 1:00 AM, Sat 1:00 AM, Sun 1:00 AM, Mon 1:00 AM, +1",
			LastRunLabel:    "2 days ago",
			CreatedLabel:    "Jun 16",
			CreatedAt:       now.Add(-54 * time.Hour),
			UpdatedAt:       now.Add(-48 * time.Hour),
		},
	}
	runs := []DeploymentRun{
		deploymentRun("drun_01Xpr1nsr4kS74mRSumPrXRa", "depl_01ERmHnRJWQSLyxk7pVCMZXs", "6/17/2026, 1:00 AM", "2 days ago", "Schedule", "Success", "v2", "sesn_01Dvrq7VjSGUeke6b4fSjBUC", "Idle", now.Add(-37*time.Hour)),
		deploymentRun("drun_01HBFZWuZFuaDtq4JpEZPJo5", "depl_01ERmHnRJWQSLyxk7pVCMZXs", "6/16/2026, 3:34 PM", "2 days ago", "Manual", "Success", "v2", "sesn_01NVn9pEgoscvpdrNE95mMPd", "Idle", now.Add(-46*time.Hour)),
		deploymentRun("drun_01RJ4FdZisp6wPnGEcgt2685", "depl_01ERmHnRJWQSLyxk7pVCMZXs", "6/16/2026, 3:28 PM", "2 days ago", "Manual", "Success", "v2", "sesn_01NxEc3HZBVGJhooULZnMyM5", "Idle", now.Add(-46*time.Hour).Add(-6*time.Minute)),
		deploymentRun("drun_01D9WXgoGESNVRW4GMcGYubB", "depl_01ERmHnRJWQSLyxk7pVCMZXs", "6/16/2026, 3:13 PM", "2 days ago", "Manual", "Success", "v2", "sesn_01R5Mm2LwFTLZtimNNTShPCP", "Idle", now.Add(-46*time.Hour).Add(-21*time.Minute)),
	}
	return deployments, runs
}

func deploymentRun(id, deploymentID, startedAt, startedLabel, trigger, result, agentVersion, sessionID, sessionStatus string, ts time.Time) DeploymentRun {
	return DeploymentRun{
		ID:            id,
		DeploymentID:  deploymentID,
		StartedAt:     startedAt,
		StartedLabel:  startedLabel,
		Trigger:       trigger,
		Result:        result,
		AgentVersion:  agentVersion,
		SessionID:     sessionID,
		SessionStatus: sessionStatus,
		CreatedAt:     ts,
	}
}

func seedSessions(now time.Time) ([]Session, []SessionEvent) {
	sessionRows := []Session{
		session("sesn_01MwRxWt4Enabbz8a2Vk66M7", "Runtime inventory via SSH 2026-06-18", "Idle", "agent_013mi1SmR2hJ6Hk6wNTeJvF9", "Managed SSH Reverse Tunnel Bootstrapper", "env_01ManagedDebug", "managed-sh-debug-env", "", "34m 34s", "168k / 5.6k", "$4.81", "5 hours ago", now.Add(-5*time.Hour)),
		session("sesn_01DpRMTNY1P3gNrELQEXitXN", "1111", "Idle", "agent_017k8CPYuCFRD9AmupUeXd2Z", "World Cup Daily Digest", "env_01UbuntuNode", "Ubuntu Node sandbox", "", "7m 12s", "31k / 1.2k", "$0.74", "6 hours ago", now.Add(-6*time.Hour)),
		session("sesn_01Dvrq7VjSGUeke6b4fSjBUC", "CronWorldCupDailyDigest", "Idle", "agent_017k8CPYuCFRD9AmupUeXd2Z", "World Cup Daily Digest", "env_01WorldCupDigest", "world-cup-digest-env", "depl_01ERmHnRJWQSLyxk7pVCMZXs", "11m 02s", "42k / 2.1k", "$1.10", "Jun 17", now.Add(-28*time.Hour)),
		session("sesn_017yutQbshtPvaCw9efKDP5r", "Reverse SSH bootstrap via amoylab", "Idle", "agent_013mi1SmR2hJ6Hk6wNTeJvF9", "Managed SSH Reverse Tunnel Bootstrapper", "env_01ManagedDebug", "managed-sh-debug-env", "", "18m 45s", "81k / 3.4k", "$2.34", "Jun 16", now.Add(-54*time.Hour)),
		session("sesn_01NVn9pEgoscvpdrNE95mMPd", "CronWorldCupDailyDigest", "Idle", "agent_017k8CPYuCFRD9AmupUeXd2Z", "World Cup Daily Digest", "env_01WorldCupDigest", "world-cup-digest-env", "depl_01ERmHnRJWQSLyxk7pVCMZXs", "8m 54s", "38k / 1.8k", "$0.96", "Jun 16", now.Add(-58*time.Hour)),
		session("sesn_01NxEc3HZBVGJhooULZnMyM5", "CronWorldCupDailyDigest", "Idle", "agent_017k8CPYuCFRD9AmupUeXd2Z", "World Cup Daily Digest", "env_01WorldCupDigest", "world-cup-digest-env", "depl_01ERmHnRJWQSLyxk7pVCMZXs", "8m 31s", "37k / 1.6k", "$0.91", "Jun 16", now.Add(-60*time.Hour)),
		session("sesn_01R5Mm2LwFTLZtimNNTShPCP", "CronWorldCupDailyDigest", "Idle", "agent_017k8CPYuCFRD9AmupUeXd2Z", "World Cup Daily Digest", "env_01WorldCupDigest", "world-cup-digest-env", "depl_01ERmHnRJWQSLyxk7pVCMZXs", "8m 40s", "39k / 1.7k", "$0.93", "Jun 16", now.Add(-62*time.Hour)),
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

func lookupEnvironmentName(db *gorm.DB, id, fallback string) string {
	var environment Environment
	if err := db.First(&environment, "id = ?", id).Error; err == nil {
		return environment.Name
	}
	var resource Resource
	if err := db.First(&resource, "id = ? AND kind = ?", id, "environment").Error; err == nil {
		return resource.Name
	}
	return fallback
}

func deleteByID[T any](c *gin.Context, db *gorm.DB, query string, args ...any) {
	var row T
	params := append([]any{query}, args...)
	if err := db.First(&row, params...).Error; err != nil {
		status := http.StatusInternalServerError
		if errors.Is(err, gorm.ErrRecordNotFound) {
			status = http.StatusNotFound
		}
		c.JSON(status, gin.H{"error": err.Error()})
		return
	}
	if err := db.Delete(&row).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"deleted": true})
}

func validCredentialType(value string) bool {
	return strings.EqualFold(value, "MCP OAuth") || strings.EqualFold(value, "Bearer token") || strings.EqualFold(value, "Environment variable")
}

func defaultCredentialTarget(authType string) string {
	if strings.EqualFold(authType, "Bearer token") {
		return "https://api.example.com/"
	}
	if strings.EqualFold(authType, "Environment variable") {
		return "ENV_VAR_NAME"
	}
	return "https://mcp.example.com"
}

func titleHostType(value string) string {
	if strings.EqualFold(value, "self-hosted") || strings.EqualFold(value, "self hosted") {
		return "Self-hosted"
	}
	return "Cloud"
}

func normalizeMemoryPath(value string) string {
	path := strings.TrimSpace(value)
	if path == "" {
		return ""
	}
	if !strings.HasPrefix(path, "/") {
		path = "/" + path
	}
	for strings.Contains(path, "//") {
		path = strings.ReplaceAll(path, "//", "/")
	}
	return path
}

func humanSize(bytes int) string {
	if bytes < 1024 {
		return fmt.Sprintf("%d B", bytes)
	}
	kib := float64(bytes) / 1024
	if kib < 1024 {
		return fmt.Sprintf("%.1f KB", kib)
	}
	return fmt.Sprintf("%.1f MB", kib/1024)
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
