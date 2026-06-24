package main

import (
	"crypto/sha256"
	"encoding/json"
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
	"gorm.io/gorm/clause"
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
	Version      string    `json:"version"`
	ConfigYAML   string    `json:"configYaml" gorm:"type:text"`
	CreatedLabel string    `json:"createdLabel"`
	UpdatedLabel string    `json:"updatedLabel"`
	CreatedAt    time.Time `json:"createdAt"`
	UpdatedAt    time.Time `json:"updatedAt"`
}

const sourceAgentOrderSQL = `
CASE id
WHEN 'agent_011VCSqwTBQSr7SqT2Mwmus2' THEN 1
WHEN 'agent_013mi1SmR2hJ6Hk6wNTeJvF9' THEN 2
WHEN 'agent_01AVRPTGyYareCeoUasn66q5' THEN 3
WHEN 'agent_019BdsR2v3NW1DiEG62wpu3e' THEN 4
WHEN 'agent_017k8CPYuCFRD9AmupUeXd2Z' THEN 5
WHEN 'agent_01MNpVPKyrSECHGA6HqAmREZ' THEN 6
ELSE 0
END`

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

type WorkspaceFile struct {
	ID           string    `json:"id" gorm:"primaryKey"`
	Name         string    `json:"name"`
	Status       string    `json:"status" gorm:"index"`
	Kind         string    `json:"kind" gorm:"index"`
	MediaType    string    `json:"mediaType"`
	Size         string    `json:"size"`
	Checksum     string    `json:"checksum"`
	Description  string    `json:"description" gorm:"type:text"`
	Content      string    `json:"content" gorm:"type:text"`
	CreatedLabel string    `json:"createdLabel"`
	UpdatedLabel string    `json:"updatedLabel"`
	CreatedAt    time.Time `json:"createdAt"`
	UpdatedAt    time.Time `json:"updatedAt"`
}

type SkillPackage struct {
	ID           string         `json:"id" gorm:"primaryKey"`
	Name         string         `json:"name"`
	Status       string         `json:"status" gorm:"index"`
	Description  string         `json:"description" gorm:"type:text"`
	Slug         string         `json:"slug" gorm:"index"`
	Owner        string         `json:"owner" gorm:"index"`
	Version      string         `json:"version"`
	LatestLabel  string         `json:"latestLabel"`
	CreatedLabel string         `json:"createdLabel"`
	UpdatedLabel string         `json:"updatedLabel"`
	CreatedAt    time.Time      `json:"createdAt"`
	UpdatedAt    time.Time      `json:"updatedAt"`
	Versions     []SkillVersion `json:"versions" gorm:"foreignKey:SkillID;references:ID"`
}

type SkillVersion struct {
	ID          string    `json:"id" gorm:"primaryKey"`
	SkillID     string    `json:"skillId" gorm:"index"`
	Version     string    `json:"version"`
	ReleasedAt  string    `json:"releasedAt"`
	Latest      bool      `json:"latest"`
	Description string    `json:"description" gorm:"type:text"`
	CreatedAt   time.Time `json:"createdAt"`
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
	CurrentWorkID   string         `json:"currentWorkId" gorm:"index"`
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
	Type      string    `json:"type" gorm:"index"`
	Summary   string    `json:"summary" gorm:"type:text"`
	Status    string    `json:"status"`
	Tokens    string    `json:"tokens"`
	Cost      string    `json:"cost"`
	Offset    string    `json:"offset"`
	Payload   string    `json:"payload" gorm:"type:text"`
	WorkID    string    `json:"workId" gorm:"index"`
	CreatedAt time.Time `json:"createdAt"`
}

type EnvironmentWork struct {
	ID                  string    `json:"id" gorm:"primaryKey"`
	EnvironmentID       string    `json:"environmentId" gorm:"index"`
	SessionID           string    `json:"sessionId" gorm:"index"`
	DeploymentRunID     string    `json:"deploymentRunId" gorm:"index"`
	Type                string    `json:"type" gorm:"index"`
	State               string    `json:"state" gorm:"index"`
	Priority            int       `json:"priority" gorm:"index"`
	Attempt             int       `json:"attempt"`
	MaxAttempts         int       `json:"maxAttempts"`
	IdempotencyKey      string    `json:"idempotencyKey" gorm:"uniqueIndex"`
	Payload             string    `json:"payload" gorm:"type:text"`
	WorkerID            string    `json:"workerId" gorm:"index"`
	LeaseID             string    `json:"leaseId" gorm:"index"`
	HeartbeatAt         time.Time `json:"heartbeatAt"`
	HeartbeatTTLSeconds int       `json:"heartbeatTtlSeconds"`
	StartedAt           time.Time `json:"startedAt"`
	StoppedAt           time.Time `json:"stoppedAt"`
	StopRequestedAt     time.Time `json:"stopRequestedAt"`
	Error               string    `json:"error" gorm:"type:text"`
	CreatedAt           time.Time `json:"createdAt"`
	UpdatedAt           time.Time `json:"updatedAt"`
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
	WorkID        string    `json:"workId" gorm:"index"`
	StartedAt     string    `json:"startedAt"`
	StartedLabel  string    `json:"startedLabel"`
	Trigger       string    `json:"trigger"`
	Result        string    `json:"result"`
	Error         string    `json:"error" gorm:"type:text"`
	AgentVersion  string    `json:"agentVersion"`
	SessionID     string    `json:"sessionId"`
	SessionStatus string    `json:"sessionStatus"`
	CompletedAt   time.Time `json:"completedAt"`
	CreatedAt     time.Time `json:"createdAt"`
}

type CreateAgentRequest struct {
	Name         string `json:"name"`
	Description  string `json:"description"`
	Model        string `json:"model"`
	SystemPrompt string `json:"systemPrompt"`
	ConfigYAML   string `json:"configYaml"`
}

type UpdateAgentRequest struct {
	Name         string `json:"name"`
	Description  string `json:"description"`
	Model        string `json:"model"`
	SystemPrompt string `json:"systemPrompt"`
	ConfigYAML   string `json:"configYaml"`
}

type CreateSessionRequest struct {
	Title         string   `json:"title"`
	AgentID       string   `json:"agentId"`
	EnvironmentID string   `json:"environmentId"`
	Vaults        []string `json:"vaults"`
	Resources     []string `json:"resources"`
}

type CreateSessionMessageRequest struct {
	Message string `json:"message"`
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

type UpdateDeploymentRequest = CreateDeploymentRequest

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

type CreateWorkspaceFileRequest struct {
	Name        string `json:"name"`
	MediaType   string `json:"mediaType"`
	Content     string `json:"content"`
	Description string `json:"description"`
}

type CreateSkillPackageRequest struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	Version     string `json:"version"`
}

var resourceKinds = map[string]string{}

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
	if err := db.AutoMigrate(&Agent{}, &Resource{}, &Environment{}, &Vault{}, &VaultCredential{}, &MemoryStore{}, &MemoryRecord{}, &WorkspaceFile{}, &SkillPackage{}, &SkillVersion{}, &Session{}, &SessionEvent{}, &EnvironmentWork{}, &Deployment{}, &DeploymentRun{}); err != nil {
		return err
	}
	if err := seed(db); err != nil {
		return err
	}

	router := gin.Default()
	router.Use(cors.New(cors.Config{
		AllowOrigins: []string{
			"http://localhost:4173",
			"http://127.0.0.1:4173",
			"http://localhost:4174",
			"http://127.0.0.1:4174",
			"http://localhost:5173",
			"http://127.0.0.1:5173",
			"http://localhost:5174",
			"http://127.0.0.1:5174",
		},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	router.GET("/healthz", func(c *gin.Context) {
		sqlDB, err := db.DB()
		if err != nil || sqlDB.PingContext(c.Request.Context()) != nil {
			c.JSON(http.StatusServiceUnavailable, gin.H{"status": "unhealthy", "database": "unavailable"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})
	router.GET("/api/agents", listAgents(db))
	router.GET("/api/agents/:id", getAgent(db))
	router.POST("/api/agents", createAgent(db))
	router.PATCH("/api/agents/:id", updateAgent(db))
	router.POST("/api/agents/:id/archive", archiveAgent(db))
	router.GET("/api/sessions", listSessions(db))
	router.GET("/api/sessions/:id", getSession(db))
	router.POST("/api/sessions", createSession(db))
	router.POST("/api/sessions/:id/cancel", cancelSession(db))
	router.POST("/api/sessions/:id/archive", archiveSession(db))
	router.POST("/api/sessions/:id/messages", createSessionMessage(db))
	router.GET("/api/environment-work", listEnvironmentWork(db))
	router.GET("/api/deployments", listDeployments(db))
	router.GET("/api/deployments/:id", getDeployment(db))
	router.POST("/api/deployments", createDeployment(db))
	router.PATCH("/api/deployments/:id", updateDeployment(db))
	router.POST("/api/deployments/:id/run", runDeployment(db))
	router.POST("/api/deployments/:id/pause", pauseDeployment(db))
	router.POST("/api/deployments/:id/resume", resumeDeployment(db))
	router.POST("/api/deployments/:id/archive", archiveDeployment(db))
	router.GET("/api/environments", listEnvironments(db))
	router.GET("/api/environments/:id", getEnvironment(db))
	router.POST("/api/environments", createEnvironment(db))
	router.PATCH("/api/environments/:id", updateEnvironment(db))
	router.POST("/api/environments/:id/archive", archiveEnvironment(db))
	router.DELETE("/api/environments/:id", deleteEnvironment(db))
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
	router.GET("/api/files", listWorkspaceFiles(db))
	router.GET("/api/files/:id", getWorkspaceFile(db))
	router.POST("/api/files", createWorkspaceFile(db))
	router.DELETE("/api/files/:id", deleteWorkspaceFile(db))
	router.GET("/api/skills", listSkillPackages(db))
	router.GET("/api/skills/:id", getSkillPackage(db))
	router.POST("/api/skills", createSkillPackage(db))
	router.DELETE("/api/skills/:id", deleteSkillPackage(db))
	router.GET("/api/:collection", listResources(db))

	addr := env("APISERVER_ADDR", ":8080")
	return router.Run(addr)
}

func openDB() (*gorm.DB, error) {
	dsn := env("DATABASE_URL", "postgres://managed_agents:managed_agents@localhost:5432/managed_agents?sslmode=disable")
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, err
	}
	sqlDB, err := db.DB()
	if err != nil {
		return nil, err
	}
	if err := sqlDB.Ping(); err != nil {
		return nil, err
	}
	return db, nil
}

func listAgents(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var agents []Agent
		query := db.
			Order("CASE WHEN id IN ('agent_011VCSqwTBQSr7SqT2Mwmus2', 'agent_013mi1SmR2hJ6Hk6wNTeJvF9', 'agent_01AVRPTGyYareCeoUasn66q5', 'agent_019BdsR2v3NW1DiEG62wpu3e', 'agent_017k8CPYuCFRD9AmupUeXd2Z', 'agent_01MNpVPKyrSECHGA6HqAmREZ') THEN 1 ELSE 0 END ASC").
			Order(sourceAgentOrderSQL).
			Order("created_at desc")
		if search := strings.TrimSpace(c.Query("q")); search != "" {
			query = query.Where("name ILIKE ? OR id ILIKE ?", "%"+search+"%", "%"+search+"%")
		}
		if status := strings.TrimSpace(c.Query("status")); status != "" && !strings.EqualFold(status, "all") {
			query = query.Where("status = ?", status)
		}
		if cutoff, ok := createdCutoff(c.Query("created"), time.Now().UTC()); ok {
			query = query.Where("created_at >= ?", cutoff)
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
		description := defaultString(req.Description, "A blank starting point with the core toolset.")
		model := defaultString(req.Model, "claude-sonnet-4-6")
		systemPrompt := defaultString(req.SystemPrompt, defaultSystemPrompt)
		agent := Agent{
			ID:           "agent_local_" + now.Format("20060102150405"),
			Name:         name,
			Model:        model,
			Status:       "Active",
			Description:  description,
			SystemPrompt: systemPrompt,
			Tools:        "agent_toolset_20260401",
			Skills:       "[]",
			Version:      "v1",
			ConfigYAML:   defaultString(req.ConfigYAML, agentConfigYAML(name, model, description, systemPrompt)),
			CreatedLabel: "just now",
			UpdatedLabel: "just now",
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

func updateAgent(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req UpdateAgentRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		var agent Agent
		if err := db.First(&agent, "id = ?", c.Param("id")).Error; err != nil {
			status := http.StatusInternalServerError
			if errors.Is(err, gorm.ErrRecordNotFound) {
				status = http.StatusNotFound
			}
			c.JSON(status, gin.H{"error": err.Error()})
			return
		}
		if value := strings.TrimSpace(req.Name); value != "" {
			agent.Name = value
		}
		if value := strings.TrimSpace(req.Description); value != "" {
			agent.Description = value
		}
		if value := strings.TrimSpace(req.Model); value != "" {
			agent.Model = value
		}
		if value := strings.TrimSpace(req.SystemPrompt); value != "" {
			agent.SystemPrompt = value
		}
		if value := strings.TrimSpace(req.ConfigYAML); value != "" {
			agent.ConfigYAML = value
			agent.Name = yamlField(value, "name", agent.Name)
			agent.Description = yamlField(value, "description", agent.Description)
			agent.Model = yamlField(value, "id", yamlField(value, "model", agent.Model))
		}
		if strings.TrimSpace(agent.ConfigYAML) == "" {
			agent.ConfigYAML = agentConfigYAML(agent.Name, agent.Model, agent.Description, agent.SystemPrompt)
		}
		agent.Version = nextAgentVersion(agent.Version)
		agent.UpdatedLabel = "just now"
		agent.UpdatedAt = time.Now().UTC()
		if err := db.Save(&agent).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, agent)
	}
}

func archiveAgent(db *gorm.DB) gin.HandlerFunc {
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
		agent.Status = "Archived"
		agent.UpdatedLabel = "just now"
		agent.UpdatedAt = time.Now().UTC()
		if err := db.Save(&agent).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, agent)
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
			if strings.EqualFold(status, "active") {
				query = query.Where("status IN ?", []string{"Active", "Idle", "Running", "Queued"})
			} else {
				query = query.Where("status = ?", status)
			}
		}
		if agentID := strings.TrimSpace(c.Query("agentId")); agentID != "" && !strings.EqualFold(agentID, "all") {
			query = query.Where("agent_id = ?", agentID)
		}
		if deploymentID := strings.TrimSpace(c.Query("deploymentId")); deploymentID != "" && !strings.EqualFold(deploymentID, "all") {
			query = query.Where("deployment_id = ?", deploymentID)
		}
		if cutoff, ok := createdCutoff(c.Query("created"), time.Now().UTC()); ok {
			query = query.Where("created_at >= ?", cutoff)
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
		envID := defaultString(req.EnvironmentID, "env_01UTaKkbFknSkQNEsZjUARMh")
		envName := lookupEnvironmentName(db, envID, "managed-ssh-debug-env")
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

func archiveSession(db *gorm.DB) gin.HandlerFunc {
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
		session.Status = "Archived"
		session.UpdatedAt = now
		if err := db.Save(&session).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		event := sessionEvent(session.ID, fmt.Sprintf("sevt_%s%09d", now.Format("20060102150405"), now.Nanosecond()), "System", "Lifecycle", "Session archived from the console.", "Archived", session.Tokens, session.Cost, session.Duration, now)
		_ = db.Create(&event).Error
		c.JSON(http.StatusOK, session)
	}
}

func createSessionMessage(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req CreateSessionMessageRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		message := strings.TrimSpace(req.Message)
		if message == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "message is required"})
			return
		}
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
		work := environmentWork(
			fmt.Sprintf("ewrk_msg_%s%09d", now.Format("20060102150405"), now.Nanosecond()),
			session.EnvironmentID,
			session.ID,
			"",
			"session_turn",
			fmt.Sprintf("session-message:%s:%d", session.ID, now.UnixNano()),
			workPayload(map[string]any{
				"prompt":       message,
				"source":       "session_message",
				"session_id":   session.ID,
				"agent_id":     session.AgentID,
				"agent_name":   session.AgentName,
				"environment":  session.EnvironmentName,
				"created_at":   now.Format(time.RFC3339Nano),
				"current_work": session.CurrentWorkID,
			}),
			now,
		)
		userEvent := sessionEvent(session.ID, fmt.Sprintf("sevt_user_%s%09d", now.Format("20060102150405"), now.Nanosecond()), "User", "Message", message, "", "", "", session.Duration, now, work.ID, work.Payload, "user.message")
		session.CurrentWorkID = work.ID
		session.UpdatedAt = now
		err := db.Transaction(func(tx *gorm.DB) error {
			if err := tx.Create(&userEvent).Error; err != nil {
				return err
			}
			if err := tx.Create(&work).Error; err != nil {
				return err
			}
			return tx.Save(&session).Error
		})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		if err := db.Preload("Events", func(tx *gorm.DB) *gorm.DB {
			return tx.Order("created_at asc")
		}).First(&session, "id = ?", session.ID).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, session)
	}
}

func listEnvironmentWork(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var work []EnvironmentWork
		query := db.Order("created_at desc")
		if state := strings.TrimSpace(c.Query("state")); state != "" && !strings.EqualFold(state, "all") {
			query = query.Where("state = ?", state)
		}
		if sessionID := strings.TrimSpace(c.Query("sessionId")); sessionID != "" {
			query = query.Where("session_id = ?", sessionID)
		}
		if err := query.Find(&work).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"items": work})
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
		if agentID := strings.TrimSpace(c.Query("agentId")); agentID != "" && !strings.EqualFold(agentID, "all") {
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
		envID := defaultString(req.EnvironmentID, "env_01UNo9NMB1ZQLKCZk21qryb8")
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

func updateDeployment(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req UpdateDeploymentRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
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
		agentID := defaultString(req.AgentID, deployment.AgentID)
		agentName := deployment.AgentName
		var agent Agent
		if err := db.First(&agent, "id = ?", agentID).Error; err == nil {
			agentName = agent.Name
		}
		envID := defaultString(req.EnvironmentID, deployment.EnvironmentID)
		envName := lookupEnvironmentName(db, envID, deployment.EnvironmentName)
		trigger := defaultString(req.Trigger, deployment.Trigger)
		schedule := defaultString(req.Schedule, deployment.Schedule)
		if strings.EqualFold(trigger, "Manual") {
			schedule = "Manual"
		}
		deployment.Name = defaultString(strings.TrimSpace(req.Name), deployment.Name)
		deployment.AgentID = agentID
		deployment.AgentName = agentName
		deployment.EnvironmentID = envID
		deployment.EnvironmentName = envName
		deployment.Vaults = strings.Join(req.Vaults, ", ")
		deployment.MemoryStores = strings.Join(req.MemoryStores, ", ")
		deployment.Trigger = trigger
		deployment.Schedule = schedule
		deployment.Timezone = defaultString(req.Timezone, deployment.Timezone)
		deployment.InitialMessage = defaultString(req.InitialMessage, deployment.InitialMessage)
		deployment.NextRuns = "On demand"
		if strings.EqualFold(trigger, "Schedule") {
			deployment.NextRuns = "Fri 1:00 AM, Sat 1:00 AM, Sun 1:00 AM, Mon 1:00 AM"
		}
		deployment.UpdatedAt = time.Now().UTC()
		if err := db.Save(&deployment).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, deployment)
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
			Result:        "Pending",
			AgentVersion:  deployment.AgentVersion,
			SessionID:     sessionID,
			SessionStatus: "Idle",
			CreatedAt:     now,
		}
		work := environmentWork(
			fmt.Sprintf("ewrk_depl_%s%09d", now.Format("20060102150405"), now.Nanosecond()),
			deployment.EnvironmentID,
			sessionID,
			run.ID,
			"deployment_run",
			fmt.Sprintf("deployment-run:%s:%d", run.ID, now.UnixNano()),
			workPayload(map[string]any{
				"prompt":            deployment.InitialMessage,
				"source":            "deployment_run",
				"deployment_id":     deployment.ID,
				"deployment_run_id": run.ID,
				"session_id":        sessionID,
				"agent_id":          deployment.AgentID,
				"agent_name":        deployment.AgentName,
				"environment":       deployment.EnvironmentName,
				"created_at":        now.Format(time.RFC3339Nano),
			}),
			now,
		)
		session.CurrentWorkID = work.ID
		run.WorkID = work.ID
		event := sessionEvent(sessionID, fmt.Sprintf("sevt_local_%s%09d", now.Format("20060102150405"), now.Nanosecond()), "User", "Message", deployment.InitialMessage, "Queued", "0 / 0", "$0.00", "0:00:00", now, work.ID, work.Payload, "user.message")
		deployment.LastRunLabel = "just now"
		deployment.UpdatedAt = now
		err := db.Transaction(func(tx *gorm.DB) error {
			if err := tx.Create(&session).Error; err != nil {
				return err
			}
			if err := tx.Create(&event).Error; err != nil {
				return err
			}
			if err := tx.Create(&run).Error; err != nil {
				return err
			}
			if err := tx.Create(&work).Error; err != nil {
				return err
			}
			return tx.Save(&deployment).Error
		})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusCreated, run)
	}
}

func pauseDeployment(db *gorm.DB) gin.HandlerFunc {
	return updateDeploymentStatus(db, "Paused")
}

func resumeDeployment(db *gorm.DB) gin.HandlerFunc {
	return updateDeploymentStatus(db, "Active")
}

func archiveDeployment(db *gorm.DB) gin.HandlerFunc {
	return updateDeploymentStatus(db, "Archived")
}

func updateDeploymentStatus(db *gorm.DB, status string) gin.HandlerFunc {
	return func(c *gin.Context) {
		var deployment Deployment
		if err := db.Preload("Runs", func(tx *gorm.DB) *gorm.DB {
			return tx.Order("created_at desc")
		}).First(&deployment, "id = ?", c.Param("id")).Error; err != nil {
			httpStatus := http.StatusInternalServerError
			if errors.Is(err, gorm.ErrRecordNotFound) {
				httpStatus = http.StatusNotFound
			}
			c.JSON(httpStatus, gin.H{"error": err.Error()})
			return
		}
		deployment.Status = status
		deployment.UpdatedAt = time.Now().UTC()
		if strings.EqualFold(status, "Active") && strings.EqualFold(deployment.NextRuns, "On demand") && strings.EqualFold(deployment.Trigger, "Schedule") {
			deployment.NextRuns = "Fri 1:00 AM, Sat 1:00 AM, Sun 1:00 AM, Mon 1:00 AM"
		}
		if err := db.Save(&deployment).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, deployment)
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

func deleteEnvironment(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		deleteByID[Environment](c, db, "id = ?", c.Param("id"))
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
			return tx.Order("created_at asc")
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
			name = "Untitled vault"
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
		if cutoff, ok := createdCutoff(c.Query("created"), time.Now().UTC()); ok {
			query = query.Where("created_at >= ?", cutoff)
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

func listWorkspaceFiles(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var files []WorkspaceFile
		query := db.Order("created_at desc")
		if search := strings.TrimSpace(c.Query("q")); search != "" {
			query = query.Where("id ILIKE ? OR name ILIKE ?", "%"+search+"%", "%"+search+"%")
		}
		if status := strings.TrimSpace(c.Query("status")); status != "" && !strings.EqualFold(status, "all") {
			query = query.Where("status = ?", status)
		}
		if kind := strings.TrimSpace(c.Query("kind")); kind != "" && !strings.EqualFold(kind, "all") {
			query = query.Where("kind = ?", kind)
		}
		if err := query.Find(&files).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"items": files})
	}
}

func getWorkspaceFile(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var file WorkspaceFile
		if err := db.First(&file, "id = ?", c.Param("id")).Error; err != nil {
			status := http.StatusInternalServerError
			if errors.Is(err, gorm.ErrRecordNotFound) {
				status = http.StatusNotFound
			}
			c.JSON(status, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, file)
	}
}

func createWorkspaceFile(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req CreateWorkspaceFileRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		name := strings.TrimSpace(req.Name)
		if name == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "name is required"})
			return
		}
		now := time.Now().UTC()
		content := req.Content
		file := WorkspaceFile{
			ID:           fmt.Sprintf("file_local_%s%09d", now.Format("20060102150405"), now.Nanosecond()),
			Name:         name,
			Status:       "Available",
			Kind:         inferFileKind(name, req.MediaType),
			MediaType:    defaultString(req.MediaType, "application/octet-stream"),
			Size:         humanSize(len(content)),
			Checksum:     fileChecksum(content),
			Description:  strings.TrimSpace(req.Description),
			Content:      content,
			CreatedLabel: "just now",
			UpdatedLabel: "just now",
			CreatedAt:    now,
			UpdatedAt:    now,
		}
		if err := db.Create(&file).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusCreated, file)
	}
}

func deleteWorkspaceFile(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		deleteByID[WorkspaceFile](c, db, "id = ?", c.Param("id"))
	}
}

func listSkillPackages(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var skills []SkillPackage
		query := db.Order("CASE slug WHEN 'xlsx' THEN 1 WHEN 'pptx' THEN 2 WHEN 'pdf' THEN 3 WHEN 'docx' THEN 4 ELSE 100 END").Order("created_at asc")
		if search := strings.TrimSpace(c.Query("q")); search != "" {
			query = query.Where("id ILIKE ? OR name ILIKE ? OR slug ILIKE ?", "%"+search+"%", "%"+search+"%", "%"+search+"%")
		}
		if owner := strings.TrimSpace(c.Query("owner")); owner != "" && !strings.EqualFold(owner, "all") {
			query = query.Where("owner = ?", owner)
		}
		if status := strings.TrimSpace(c.Query("status")); status != "" && !strings.EqualFold(status, "all") {
			query = query.Where("status = ?", status)
		}
		if err := query.Find(&skills).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"items": skills})
	}
}

func getSkillPackage(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var skill SkillPackage
		if err := db.Preload("Versions", func(tx *gorm.DB) *gorm.DB {
			return tx.Order("created_at asc")
		}).First(&skill, "id = ?", c.Param("id")).Error; err != nil {
			status := http.StatusInternalServerError
			if errors.Is(err, gorm.ErrRecordNotFound) {
				status = http.StatusNotFound
			}
			c.JSON(status, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, skill)
	}
}

func createSkillPackage(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req CreateSkillPackageRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		name := strings.TrimSpace(req.Name)
		if name == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "name is required"})
			return
		}
		now := time.Now().UTC()
		version := defaultString(req.Version, now.Format("20060102"))
		id := fmt.Sprintf("skill_local_%s%09d", now.Format("20060102150405"), now.Nanosecond())
		skill := SkillPackage{
			ID:           id,
			Name:         name,
			Status:       "Active",
			Description:  strings.TrimSpace(req.Description),
			Slug:         slugify(name),
			Owner:        "Default",
			Version:      version,
			LatestLabel:  "Latest",
			CreatedLabel: "just now",
			UpdatedLabel: "just now",
			CreatedAt:    now,
			UpdatedAt:    now,
			Versions: []SkillVersion{
				{
					ID:          fmt.Sprintf("skv_local_%s%09d", now.Format("20060102150405"), now.Nanosecond()),
					SkillID:     id,
					Version:     version,
					ReleasedAt:  "just now",
					Latest:      true,
					Description: "Initial local upload.",
					CreatedAt:   now,
				},
			},
		}
		if err := db.Create(&skill).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusCreated, skill)
	}
}

func deleteSkillPackage(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		if err := db.Where("skill_id = ?", c.Param("id")).Delete(&SkillVersion{}).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		deleteByID[SkillPackage](c, db, "id = ?", c.Param("id"))
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
	now := time.Now().UTC().Add(-48 * time.Hour)
	agents := []Agent{
		agent("agent_011VCSqwTBQSr7SqT2Mwmus2", "Untitled agent", "claude-sonnet-4-6", "A blank starting point with the core toolset.", defaultSystemPrompt, "2 days ago", now),
		agent("agent_013mi1SmR2hJ6Hk6wNTeJvF9", "Managed SSH Reverse Tunnel Bootstrapper", "claude-sonnet-4-6", "Bootstraps SSH access to a Managed Agents cloud environment through an amoylab reverse SSH tunnel.", reverseTunnelPrompt, "5 days ago", now),
		agent("agent_01AVRPTGyYareCeoUasn66q5", "Incident commander", "claude-opus-4-8", "Coordinates incident triage, diagnosis, mitigation, and status updates.", "You are an incident commander. Build a clear timeline, identify owners, and keep communications concise.", "5 days ago", now),
		agent("agent_019BdsR2v3NW1DiEG62wpu3e", "World Cup Daily Digest (self-hosted clone)", "claude-sonnet-4-6", "Collects World Cup news and prepares a daily digest.", "You summarize sports updates into a concise daily digest with sources.", "5 days ago", now),
		agent("agent_017k8CPYuCFRD9AmupUeXd2Z", "World Cup Daily Digest", "claude-sonnet-4-6", "Collects World Cup news and prepares a daily digest.", "You summarize sports updates into a concise daily digest with sources.", "5 days ago", now),
		agent("agent_01MNpVPKyrSECHGA6HqAmREZ", "Untitled agent", "claude-sonnet-4-6", "A blank starting point with the core toolset.", defaultSystemPrompt, "5 days ago", now),
	}
	if err := db.Clauses(clause.OnConflict{
		Columns: []clause.Column{{Name: "id"}},
		DoUpdates: clause.AssignmentColumns([]string{
			"name",
			"model",
			"status",
			"description",
			"system_prompt",
			"tools",
			"skills",
			"version",
			"config_yaml",
			"created_label",
			"updated_label",
			"created_at",
			"updated_at",
		}),
	}).Create(&agents).Error; err != nil {
		return err
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

	vaults, credentials := seedVaults(now)
	if err := db.Clauses(clause.OnConflict{
		Columns: []clause.Column{{Name: "id"}},
		DoUpdates: clause.AssignmentColumns([]string{
			"name",
			"status",
			"description",
			"created_label",
			"updated_label",
			"created_at",
			"updated_at",
		}),
	}).Create(&vaults).Error; err != nil {
		return err
	}
	staleVaultCredentialIDs := []string{
		"vcrd_01EnvVarOpsToken",
		"vcrd_01EnvVarApiKey",
		"vcrd_01BearerInternal",
		"vcrd_01McpOAuthGmail",
		"vcrd_01ExpLeoKey",
	}
	if err := db.Where("id IN ?", staleVaultCredentialIDs).Delete(&VaultCredential{}).Error; err != nil {
		return err
	}
	if err := db.Clauses(clause.OnConflict{
		Columns: []clause.Column{{Name: "id"}},
		DoUpdates: clause.AssignmentColumns([]string{
			"vault_id",
			"name",
			"auth_type",
			"target",
			"status",
			"last_used",
			"updated_label",
			"created_at",
			"updated_at",
		}),
	}).Create(&credentials).Error; err != nil {
		return err
	}

	stores, memories := seedMemoryStores(now)
	if err := db.Clauses(clause.OnConflict{
		Columns: []clause.Column{{Name: "id"}},
		DoUpdates: clause.AssignmentColumns([]string{
			"name",
			"status",
			"description",
			"created_label",
			"updated_label",
			"created_at",
			"updated_at",
		}),
	}).Create(&stores).Error; err != nil {
		return err
	}
	if err := db.Clauses(clause.OnConflict{
		Columns: []clause.Column{{Name: "id"}},
		DoUpdates: clause.AssignmentColumns([]string{
			"memory_store_id",
			"path",
			"status",
			"size",
			"content",
			"author_id",
			"updated_label",
			"created_at",
			"updated_at",
		}),
	}).Create(&memories).Error; err != nil {
		return err
	}

	skills, versions := seedSkills(now)
	if err := db.Clauses(clause.OnConflict{
		Columns: []clause.Column{{Name: "id"}},
		DoUpdates: clause.AssignmentColumns([]string{
			"name",
			"status",
			"description",
			"slug",
			"owner",
			"version",
			"latest_label",
			"created_label",
			"updated_label",
			"updated_at",
		}),
	}).Create(&skills).Error; err != nil {
		return err
	}
	if err := db.Clauses(clause.OnConflict{
		Columns: []clause.Column{{Name: "id"}},
		DoUpdates: clause.AssignmentColumns([]string{
			"skill_id",
			"version",
			"released_at",
			"latest",
			"description",
		}),
	}).Create(&versions).Error; err != nil {
		return err
	}

	deployments, runs := seedDeployments(time.Now().UTC())
	if err := db.Clauses(clause.OnConflict{
		Columns: []clause.Column{{Name: "id"}},
		DoUpdates: clause.AssignmentColumns([]string{
			"name",
			"status",
			"agent_id",
			"agent_name",
			"agent_version",
			"environment_id",
			"environment_name",
			"vaults",
			"memory_stores",
			"trigger",
			"schedule",
			"timezone",
			"initial_message",
			"next_runs",
			"last_run_label",
			"created_label",
			"updated_at",
		}),
	}).Create(&deployments).Error; err != nil {
		return err
	}
	if err := db.Clauses(clause.OnConflict{
		Columns: []clause.Column{{Name: "id"}},
		DoUpdates: clause.AssignmentColumns([]string{
			"deployment_id",
			"started_at",
			"started_label",
			"trigger",
			"result",
			"agent_version",
			"session_id",
			"session_status",
			"created_at",
		}),
	}).Create(&runs).Error; err != nil {
		return err
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

func agent(id, name, model, description, prompt, label string, ts time.Time) Agent {
	return Agent{
		ID:           id,
		Name:         name,
		Model:        model,
		Status:       "Active",
		Description:  description,
		SystemPrompt: prompt,
		Tools:        "agent_toolset_20260401",
		Skills:       "[]",
		Version:      "v1",
		ConfigYAML:   agentConfigYAML(name, model, description, prompt),
		CreatedLabel: label,
		UpdatedLabel: label,
		CreatedAt:    ts,
		UpdatedAt:    ts,
	}
}

func seedResources(ts time.Time) []Resource {
	return []Resource{
		resource("environment", "env_01UTaKkbFknSkQNEsZjUARMh", "managed-ssh-debug-env", "Active", "4 vCPU / 16 GB", "Firecracker", ts),
		resource("environment", "env_01UNo9NMB1ZQLKCZk21qryb8", "world-cup-digest-env", "Active", "Playwright / Python", "Firecracker", ts),
		resource("environment", "env_01LiiuDCwZBtqZd5EYMk9D9x", "123", "Active", "Self-hosted", "customer-managed runner", ts),
		resource("environment", "env_01AzQWp3SXQEATgdCFUNwteR", "myenv", "Active", "Self-hosted", "customer-managed runner", ts),
		resource("vault", "vlt_011CcAwAMQNPspfRCWurffJx", "Temporary vault", "Active", "No credentials", "created Jun 18", ts.Add(time.Second)),
		resource("vault", "vault_01TestSecret", "test_secret", "Active", "1 binding", "last used 2 days ago", ts),
		resource("file", "file_01Outputs", "session-output.tar.gz", "Available", "outputs", "2.4 MB", ts),
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
		vault("vlt_011CcAwAMQNPspfRCWurffJx", "Temporary vault", "Active", "Jun 18", ts.Add(time.Second)),
		vault("vlt_011Cc6ULi3DaPNjN1LZLTenB", "test_secret", "Active", "Jun 16", ts),
	}
	credentials := []VaultCredential{
		vaultCredential("vcrd_01Console9X2g5BB", "vlt_011Cc6ULi3DaPNjN1LZLTenB", "Unnamed", "Environment variable", "TEST", "Active", "Jun 18, 2026", "Jun 16", ts),
		vaultCredential("vcrd_01ConsolebjRQgYp", "vlt_011Cc6ULi3DaPNjN1LZLTenB", "Unnamed", "Environment variable", "X_LEO_API", "Active", "Jun 18, 2026", "Jun 16", ts.Add(time.Second)),
		vaultCredential("vcrd_01ConsoleGJKMDyK", "vlt_011Cc6ULi3DaPNjN1LZLTenB", "bearertoken", "Bearer token", "https://api.ifuryst.com/", "Active", "Never", "Jun 16", ts.Add(2*time.Second)),
		vaultCredential("vcrd_01ConsoleWtXJ6BE", "vlt_011Cc6ULi3DaPNjN1LZLTenB", "mcpoauth", "MCP OAuth", "https://gmail.mcp.claude.com/mcp", "Active", "Never", "Jun 16", ts.Add(3*time.Second)),
		vaultCredential("vcrd_01ConsoleiByG9Qr", "vlt_011Cc6ULi3DaPNjN1LZLTenB", "exp", "Environment variable", "X_LEO_KEY", "Active", "Jun 18, 2026", "Jun 16", ts.Add(4*time.Second)),
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
		memoryStore("memstore_01TFhvAtMizQJLWU29TaW5AZ", "123", "Active", "Browse and manage persistent memory for your agents.", "5 days ago", ts.Add(42*time.Hour)),
		memoryStore("memstore_01GYUDt8DBmRPDfhs5i9in8M", "zzz", "Active", "Scratch memory store for console testing.", "5 days ago", ts),
		memoryStore("memstore_01GToktzJyefFL2DVxmgyT5e", "world cup", "Active", "Daily World Cup memory for agents that prepare match and news digests.", "5 days ago", ts),
		memoryStore("memstore_014LoF1P4MoTKK9HYDmacJuB", "leo_test", "Active", "Personal test memory store.", "5 days ago", ts),
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

func seedSkills(ts time.Time) ([]SkillPackage, []SkillVersion) {
	skills := []SkillPackage{
		skillPackage("skill_anthropic_xlsx", "xlsx", "**Excel Spreadsheet Handler**: Comprehensive Microsoft Excel (.xlsx) document creation, editing, and analysis with support for formulas, formatting, data analysis, and visualization - MANDATORY TRIGGERS: Excel, spreadsheet, .xlsx, data table, budget, financial model, chart, graph, tabular data, xls", "xlsx", "Anthropic", "20260203", "Oct 14, 2025", "Feb 3", ts),
		skillPackage("skill_anthropic_pptx", "pptx", "Use this skill any time a .pptx file is involved in any way — as input, output, or both. This includes: creating slide decks, pitch decks, or presentations; reading, parsing, or extracting text from any .pptx file (even if the extracted content will be used elsewhere, like in an email or summary); editing, modifying, or updating existing presentations; combining or splitting slide files; working with templates, layouts, speaker notes, or comments. Trigger whenever the user mentions \"deck,\" \"slides,\" \"presentation,\" or references a .pptx filename, regardless of what they plan to do with the content afterward. If a .pptx file needs to be opened, created, or touched, use this skill.", "pptx", "Anthropic", "20260305", "Mar 5, 2026", "Mar 5", ts.Add(24*time.Hour)),
		skillPackage("skill_anthropic_pdf", "pdf", "**PDF Processing**: Comprehensive PDF manipulation toolkit for extracting text and tables, creating new PDFs, merging/splitting documents, and handling forms. - MANDATORY TRIGGERS: PDF, .pdf, form, extract, merge, split", "pdf", "Anthropic", "20260203", "Feb 3, 2026", "Feb 3", ts),
		skillPackage("skill_anthropic_docx", "docx", "Use this skill whenever the user wants to create, read, edit, or manipulate Word documents (.docx files). Triggers include: any mention of 'Word doc', 'word document', '.docx', or requests to produce professional documents with formatting like tables of contents, headings, page numbers, or letterheads. Also use when extracting or reorganizing content from .docx files, inserting or replacing images in documents, performing find-and-replace in Word files, working with tracked changes or comments, or converting content into a polished Word document. If the user asks for a 'report', 'memo', 'letter', 'template', or similar deliverable as a Word or .docx file, use this skill. Do NOT use for PDFs, spreadsheets, Google Docs, or general coding tasks unrelated to document generation.", "docx", "Anthropic", "20260305", "Mar 5, 2026", "Mar 5", ts.Add(24*time.Hour)),
	}
	versions := []SkillVersion{
		skillVersion("skv_xlsx_20251013", "skill_anthropic_xlsx", "20251013", "Oct 15, 2025", false, ts.Add(-112*24*time.Hour)),
		skillVersion("skv_xlsx_20260122", "skill_anthropic_xlsx", "20260122", "Jan 24", false, ts.Add(-41*24*time.Hour)),
		skillVersion("skv_xlsx_20260127", "skill_anthropic_xlsx", "20260127", "Jan 27", false, ts.Add(-38*24*time.Hour)),
		skillVersion("skv_xlsx_20260128", "skill_anthropic_xlsx", "20260128", "Jan 29", false, ts.Add(-37*24*time.Hour)),
		skillVersion("skv_xlsx_20260203", "skill_anthropic_xlsx", "20260203", "Feb 3", true, ts),
		skillVersion("skv_pptx_20260305", "skill_anthropic_pptx", "20260305", "Mar 5", true, ts.Add(24*time.Hour)),
		skillVersion("skv_pdf_20260203", "skill_anthropic_pdf", "20260203", "Feb 3", true, ts),
		skillVersion("skv_docx_20260305", "skill_anthropic_docx", "20260305", "Mar 5", true, ts.Add(24*time.Hour)),
	}
	return skills, versions
}

func skillPackage(id, name, description, slug, owner, version, createdLabel, updatedLabel string, ts time.Time) SkillPackage {
	return SkillPackage{
		ID:           id,
		Name:         name,
		Status:       "Active",
		Description:  description,
		Slug:         slug,
		Owner:        owner,
		Version:      version,
		LatestLabel:  "Latest",
		CreatedLabel: createdLabel,
		UpdatedLabel: updatedLabel,
		CreatedAt:    ts,
		UpdatedAt:    ts,
	}
}

func skillVersion(id, skillID, version, releasedAt string, latest bool, ts time.Time) SkillVersion {
	return SkillVersion{
		ID:          id,
		SkillID:     skillID,
		Version:     version,
		ReleasedAt:  releasedAt,
		Latest:      latest,
		Description: "Published skill package.",
		CreatedAt:   ts,
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
			EnvironmentID:   "env_01UNo9NMB1ZQLKCZk21qryb8",
			EnvironmentName: "world-cup-digest-env",
			Vaults:          "test_secret",
			MemoryStores:    "world cup",
			Trigger:         "Schedule",
			Schedule:        "0 1 * * *",
			Timezone:        "Asia/Shanghai",
			InitialMessage:  "开始。结束后需要请求一下api.ifuryst.com，POST，payload里只汇报完成情况，邮件发送情况，不要直接发结论或邮件内容到这里。curl的时候需要增加这个http header \"Authorization: Bearer $TEST\"。原样使用。",
			NextRuns:        "Thu 1:00 AM, Fri 1:00 AM, Sat 1:00 AM, Sun 1:00 AM, +1",
			LastRunLabel:    "Jun 17",
			CreatedLabel:    "Jun 16",
			CreatedAt:       now.Add(-54 * time.Hour),
			UpdatedAt:       now.Add(-48 * time.Hour),
		},
	}
	runs := []DeploymentRun{
		deploymentRun("drun_01Xpr1nsr4kS74mRSumPrXRa", "depl_01ERmHnRJWQSLyxk7pVCMZXs", "6/17/2026, 1:00 AM", "Jun 17", "Schedule", "Success", "v2", "sesn_01Dvrq7VjSGUeke6b4fSjBUC", "Idle", now.Add(-7*24*time.Hour)),
		deploymentRun("drun_01HBFZWuZFuaDtq4JpEZPJo5", "depl_01ERmHnRJWQSLyxk7pVCMZXs", "6/16/2026, 3:34 PM", "last week", "Manual", "Success", "v2", "sesn_01NVn9pEgoscvpdrNE95mMPd", "Idle", now.Add(-7*24*time.Hour).Add(-9*time.Hour)),
		deploymentRun("drun_01RJ4FdZisp6wPnGEcgt2685", "depl_01ERmHnRJWQSLyxk7pVCMZXs", "6/16/2026, 3:28 PM", "last week", "Manual", "Success", "v2", "sesn_01NxEc3HZBVGJhooULZnMyM5", "Idle", now.Add(-7*24*time.Hour).Add(-9*time.Hour).Add(-6*time.Minute)),
		deploymentRun("drun_01D9WXgoGESNVRW4GMcGYubB", "depl_01ERmHnRJWQSLyxk7pVCMZXs", "6/16/2026, 3:13 PM", "last week", "Manual", "Success", "v2", "sesn_01R5Mm2LwFTLZtimNNTShPCP", "Idle", now.Add(-7*24*time.Hour).Add(-9*time.Hour).Add(-21*time.Minute)),
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
		session("sesn_01MwRxWt4Enabbz8a2Vk66M7", "Runtime inventory via SSH 2026-06-18", "Idle", "agent_013mi1SmR2hJ6Hk6wNTeJvF9", "Managed SSH Reverse Tunnel Bootstrapper", "env_01UTaKkbFknSkQNEsZjUARMh", "managed-ssh-debug-env", "", "34m 34s", "168k / 5.6k", "$4.81", "Jun 18", now.Add(-5*time.Hour)),
		session("sesn_01DpRMTNY1P3gNrELQEXitXN", "1111", "Idle", "agent_017k8CPYuCFRD9AmupUeXd2Z", "World Cup Daily Digest", "env_01LiiuDCwZBtqZd5EYMk9D9x", "123", "", "7m 12s", "31k / 1.2k", "$0.74", "Jun 18", now.Add(-6*time.Hour)),
		session("sesn_01Dvrq7VjSGUeke6b4fSjBUC", "CronWorldCupDailyDigest", "Idle", "agent_017k8CPYuCFRD9AmupUeXd2Z", "World Cup Daily Digest", "env_01UNo9NMB1ZQLKCZk21qryb8", "world-cup-digest-env", "depl_01ERmHnRJWQSLyxk7pVCMZXs", "11m 02s", "42k / 2.1k", "$1.10", "Jun 17", now.Add(-28*time.Hour)),
		session("sesn_017yutQbshtPvaCw9efKDP5r", "Reverse SSH bootstrap via amoylab", "Idle", "agent_013mi1SmR2hJ6Hk6wNTeJvF9", "Managed SSH Reverse Tunnel Bootstrapper", "env_01UTaKkbFknSkQNEsZjUARMh", "managed-ssh-debug-env", "", "18m 45s", "81k / 3.4k", "$2.34", "Jun 16", now.Add(-54*time.Hour)),
		session("sesn_01NVn9pEgoscvpdrNE95mMPd", "CronWorldCupDailyDigest", "Idle", "agent_017k8CPYuCFRD9AmupUeXd2Z", "World Cup Daily Digest", "env_01UNo9NMB1ZQLKCZk21qryb8", "world-cup-digest-env", "depl_01ERmHnRJWQSLyxk7pVCMZXs", "8m 54s", "38k / 1.8k", "$0.96", "Jun 16", now.Add(-58*time.Hour)),
		session("sesn_01NxEc3HZBVGJhooULZnMyM5", "CronWorldCupDailyDigest", "Idle", "agent_017k8CPYuCFRD9AmupUeXd2Z", "World Cup Daily Digest", "env_01UNo9NMB1ZQLKCZk21qryb8", "world-cup-digest-env", "depl_01ERmHnRJWQSLyxk7pVCMZXs", "8m 31s", "37k / 1.6k", "$0.91", "Jun 16", now.Add(-60*time.Hour)),
		session("sesn_01R5Mm2LwFTLZtimNNTShPCP", "CronWorldCupDailyDigest", "Idle", "agent_017k8CPYuCFRD9AmupUeXd2Z", "World Cup Daily Digest", "env_01UNo9NMB1ZQLKCZk21qryb8", "world-cup-digest-env", "depl_01ERmHnRJWQSLyxk7pVCMZXs", "8m 40s", "39k / 1.7k", "$0.93", "Jun 16", now.Add(-62*time.Hour)),
		session("sesn_01Fhy2Hd5TMwWJvMYmjK19vn", "–", "Idle", "agent_017k8CPYuCFRD9AmupUeXd2Z", "World Cup Daily Digest", "env_01AzQWp3SXQEATgdCFUNwteR", "myenv", "", "2m 10s", "9k / 340", "$0.22", "Jun 16", now.Add(-64*time.Hour)),
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
		Vaults:          "test_secret",
		Resources:       "session-output.tar.gz\noperations-memory",
		Duration:        duration,
		Tokens:          tokens,
		Cost:            cost,
		CreatedLabel:    createdLabel,
		CreatedAt:       ts,
		UpdatedAt:       ts,
	}
}

func environmentWork(id, environmentID, sessionID, deploymentRunID, workType, idempotencyKey, payload string, ts time.Time) EnvironmentWork {
	return EnvironmentWork{
		ID:                  id,
		EnvironmentID:       environmentID,
		SessionID:           sessionID,
		DeploymentRunID:     deploymentRunID,
		Type:                workType,
		State:               "queued",
		Priority:            0,
		Attempt:             0,
		MaxAttempts:         3,
		IdempotencyKey:      idempotencyKey,
		Payload:             payload,
		HeartbeatTTLSeconds: 30,
		CreatedAt:           ts,
		UpdatedAt:           ts,
	}
}

func workPayload(value map[string]any) string {
	data, err := json.Marshal(value)
	if err != nil {
		return "{}"
	}
	return string(data)
}

func sessionEvent(sessionID, id, role, kind, summary, status, tokens, cost, offset string, ts time.Time, extra ...string) SessionEvent {
	workID := ""
	payload := ""
	eventType := canonicalEventType(role, kind, status)
	if len(extra) > 0 {
		workID = extra[0]
	}
	if len(extra) > 1 {
		payload = extra[1]
	}
	if len(extra) > 2 && strings.TrimSpace(extra[2]) != "" {
		eventType = extra[2]
	}
	return SessionEvent{
		ID:        id,
		SessionID: sessionID,
		Role:      role,
		Kind:      kind,
		Type:      eventType,
		Summary:   summary,
		Status:    status,
		Tokens:    tokens,
		Cost:      cost,
		Offset:    offset,
		Payload:   payload,
		WorkID:    workID,
		CreatedAt: ts,
	}
}

func canonicalEventType(role, kind, status string) string {
	role = strings.ToLower(strings.TrimSpace(role))
	kind = strings.ToLower(strings.TrimSpace(kind))
	status = strings.ToLower(strings.TrimSpace(status))
	switch {
	case role == "user" && kind == "message":
		return "user.message"
	case role == "agent" && kind == "message":
		return "agent.message"
	case role == "tool":
		return "agent.tool_use"
	case role == "system" && status == "running":
		return "session.status_running"
	case role == "system" && status == "idle":
		return "session.status_idle"
	case role == "system" && (status == "error" || status == "failed"):
		return "session.error"
	default:
		return role + "." + strings.ReplaceAll(kind, " ", "_")
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

func createdCutoff(value string, now time.Time) (time.Time, bool) {
	switch strings.ToLower(strings.TrimSpace(value)) {
	case "last 24 hours", "last_24_hours", "24h":
		return now.Add(-24 * time.Hour), true
	case "last 7 days", "last_7_days", "7d":
		return now.Add(-7 * 24 * time.Hour), true
	case "last 30 days", "last_30_days", "30d":
		return now.Add(-30 * 24 * time.Hour), true
	default:
		return time.Time{}, false
	}
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

func inferFileKind(name, mediaType string) string {
	lowerName := strings.ToLower(name)
	lowerMedia := strings.ToLower(mediaType)
	switch {
	case strings.Contains(lowerMedia, "pdf") || strings.HasSuffix(lowerName, ".pdf"):
		return "Document"
	case strings.HasPrefix(lowerMedia, "image/") || strings.HasSuffix(lowerName, ".png") || strings.HasSuffix(lowerName, ".jpg") || strings.HasSuffix(lowerName, ".jpeg"):
		return "Image"
	case strings.HasPrefix(lowerMedia, "text/") || strings.HasSuffix(lowerName, ".txt") || strings.HasSuffix(lowerName, ".md"):
		return "Text"
	case strings.HasSuffix(lowerName, ".zip") || strings.HasSuffix(lowerName, ".tar.gz"):
		return "Archive"
	default:
		return "File"
	}
}

func fileChecksum(content string) string {
	sum := sha256.Sum256([]byte(content))
	return fmt.Sprintf("sha256:%x", sum)
}

func slugify(value string) string {
	parts := strings.Fields(strings.ToLower(value))
	if len(parts) == 0 {
		return "skill"
	}
	return strings.Join(parts, "-")
}

func agentConfigYAML(name, model, description, systemPrompt string) string {
	return fmt.Sprintf(`name: %s
model:
  id: %s
  speed: standard
description: %s
system: %q
mcp_servers: []
tools:
  - configs: []
    default_config:
      enabled: true
      permission_policy:
        type: always_allow
    type: agent_toolset_20260401
skills: []
metadata: {}`, name, model, description, systemPrompt)
}

func nextAgentVersion(current string) string {
	current = strings.TrimPrefix(strings.TrimSpace(current), "v")
	if current == "" {
		return "v2"
	}
	var version int
	if _, err := fmt.Sscanf(current, "%d", &version); err != nil {
		return "v2"
	}
	return fmt.Sprintf("v%d", version+1)
}

func yamlField(source, key, fallback string) string {
	lines := strings.Split(source, "\n")
	for i, line := range lines {
		trimmed := strings.TrimSpace(line)
		prefix := key + ":"
		if strings.HasPrefix(trimmed, prefix) {
			value := strings.TrimSpace(strings.TrimPrefix(trimmed, prefix))
			if value != "" {
				return strings.Trim(value, `"'`)
			}
			if key == "model" && i+1 < len(lines) {
				return yamlField(strings.Join(lines[i+1:], "\n"), "id", fallback)
			}
		}
	}
	return fallback
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
