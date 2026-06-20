package main

import (
	"bufio"
	"bytes"
	"context"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"

	"github.com/spf13/cobra"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type options struct {
	databaseURL    string
	workerID       string
	runtime        string
	codexBin       string
	codexHome      string
	codexModel     string
	codexTarball   string
	shellCommand   string
	workspaceRoot  string
	pollInterval   time.Duration
	runtimeTimeout time.Duration
	heartbeatTTL   time.Duration
	sandboxdURL    string
	sandboxImage   string
	processAPIBin  string
	keepSandbox    bool
}

type Agent struct {
	ID           string
	Name         string
	Model        string
	SystemPrompt string
}

type Session struct {
	ID              string
	Name            string
	Status          string
	AgentID         string
	AgentName       string
	EnvironmentID   string
	EnvironmentName string
	DeploymentID    string
	Duration        string
	Tokens          string
	Cost            string
	CurrentWorkID   string
	CreatedAt       time.Time
	UpdatedAt       time.Time
}

type SessionEvent struct {
	ID        string `gorm:"primaryKey"`
	SessionID string
	Role      string
	Kind      string
	Type      string
	Summary   string
	Status    string
	Tokens    string
	Cost      string
	Offset    string
	Payload   string
	WorkID    string
	CreatedAt time.Time
}

type EnvironmentWork struct {
	ID                  string `gorm:"primaryKey"`
	EnvironmentID       string
	SessionID           string
	DeploymentRunID     string
	Type                string
	State               string
	Priority            int
	Attempt             int
	MaxAttempts         int
	IdempotencyKey      string
	Payload             string
	WorkerID            string
	LeaseID             string
	HeartbeatAt         time.Time
	HeartbeatTTLSeconds int
	StartedAt           time.Time
	StoppedAt           time.Time
	StopRequestedAt     time.Time
	Error               string
	CreatedAt           time.Time
	UpdatedAt           time.Time
}

type DeploymentRun struct {
	ID            string `gorm:"primaryKey"`
	DeploymentID  string
	WorkID        string
	StartedAt     string
	StartedLabel  string
	Trigger       string
	Result        string
	Error         string
	AgentVersion  string
	SessionID     string
	SessionStatus string
	CompletedAt   time.Time
	CreatedAt     time.Time
}

type workPayload struct {
	Prompt          string `json:"prompt"`
	Source          string `json:"source"`
	SessionID       string `json:"session_id"`
	DeploymentID    string `json:"deployment_id"`
	DeploymentRunID string `json:"deployment_run_id"`
	AgentID         string `json:"agent_id"`
	AgentName       string `json:"agent_name"`
	Environment     string `json:"environment"`
	CreatedAt       string `json:"created_at"`
}

type runResult struct {
	OK        bool
	Summary   string
	RawOutput string
	Error     string
	StartedAt time.Time
	EndedAt   time.Time
}

type sandboxdStartRequest struct {
	ID            string `json:"id,omitempty"`
	Image         string `json:"image,omitempty"`
	ProcessAPI    bool   `json:"process_api,omitempty"`
	ProcessAPIBin string `json:"process_api_bin,omitempty"`
	TimeoutMillis int64  `json:"timeout_millis,omitempty"`
}

type sandboxState struct {
	ID     string `json:"id"`
	Status string `json:"status"`
}

type sandboxdRunRequest struct {
	ID            string `json:"id,omitempty"`
	Image         string `json:"image,omitempty"`
	VCPUCount     int    `json:"vcpu_count,omitempty"`
	MemMiB        int    `json:"mem_mib,omitempty"`
	Command       string `json:"command"`
	Network       bool   `json:"network,omitempty"`
	TimeoutMillis int64  `json:"timeout_millis,omitempty"`
}

type sandboxdRunResponse struct {
	ID             string       `json:"id"`
	OK             bool         `json:"ok"`
	ExitCode       int          `json:"exit_code"`
	Stdout         string       `json:"stdout"`
	Stderr         string       `json:"stderr"`
	Error          string       `json:"error,omitempty"`
	TimedOut       bool         `json:"timed_out"`
	DurationMillis int64        `json:"duration_millis"`
	Sandbox        sandboxState `json:"sandbox"`
}

type processAPIExecRequest struct {
	Argv          []string          `json:"argv"`
	Cwd           string            `json:"cwd,omitempty"`
	Env           map[string]string `json:"env,omitempty"`
	TimeoutMillis int64             `json:"timeout_millis,omitempty"`
}

type processAPIExecResponse struct {
	OK             bool     `json:"ok"`
	Argv           []string `json:"argv"`
	Cwd            string   `json:"cwd"`
	ExitCode       int      `json:"exit_code"`
	Stdout         string   `json:"stdout"`
	Stderr         string   `json:"stderr"`
	Error          string   `json:"error,omitempty"`
	TimedOut       bool     `json:"timed_out"`
	DurationMillis int64    `json:"duration_millis"`
}

func main() {
	opt := options{}
	root := &cobra.Command{
		Use:          "orchestrator",
		Short:        "Claim managed-agent work and execute agent turns",
		SilenceUsage: true,
	}
	root.PersistentFlags().StringVar(&opt.databaseURL, "database-url", env("DATABASE_URL", "postgres://managed_agents:managed_agents@localhost:5432/managed_agents?sslmode=disable"), "metadata database URL")
	root.PersistentFlags().StringVar(&opt.workerID, "worker-id", env("ORCHESTRATOR_WORKER_ID", defaultWorkerID()), "stable worker identifier")
	root.PersistentFlags().StringVar(&opt.runtime, "runtime", env("ORCHESTRATOR_RUNTIME", "codex-local"), "runtime: codex-local, shell, sandbox-shell, sandbox-command, or sandbox-codex")
	root.PersistentFlags().StringVar(&opt.codexBin, "codex-bin", env("CODEX_BIN", "codex"), "Codex CLI binary")
	root.PersistentFlags().StringVar(&opt.codexHome, "codex-home", env("CODEX_HOME", filepath.Join(homeDir(), ".codex")), "host Codex home used for sandbox-codex auth")
	root.PersistentFlags().StringVar(&opt.codexModel, "codex-model", env("CODEX_MODEL", "gpt-5.5"), "Codex model used by codex-local and sandbox-codex")
	root.PersistentFlags().StringVar(&opt.codexTarball, "codex-linux-tarball", env("CODEX_LINUX_TARBALL", "https://github.com/openai/codex/releases/latest/download/codex-x86_64-unknown-linux-musl.tar.gz"), "Linux x86_64 Codex release tarball used by sandbox-codex")
	root.PersistentFlags().StringVar(&opt.shellCommand, "shell-command", env("ORCHESTRATOR_SHELL_COMMAND", ""), "shell command used when --runtime shell")
	root.PersistentFlags().StringVar(&opt.workspaceRoot, "workspace-root", env("ORCHESTRATOR_WORKSPACE_ROOT", "/tmp/managed-agents-workspaces"), "host workspace root for runtime processes")
	root.PersistentFlags().DurationVar(&opt.runtimeTimeout, "runtime-timeout", durationEnv("ORCHESTRATOR_RUNTIME_TIMEOUT", 10*time.Minute), "runtime execution timeout")
	root.PersistentFlags().DurationVar(&opt.heartbeatTTL, "heartbeat-ttl", durationEnv("ORCHESTRATOR_HEARTBEAT_TTL", 30*time.Second), "work heartbeat TTL")
	root.PersistentFlags().StringVar(&opt.sandboxdURL, "sandboxd-url", env("SANDBOXD_URL", "http://127.0.0.1:8787"), "sandboxd HTTP API URL")
	root.PersistentFlags().StringVar(&opt.sandboxImage, "sandbox-image", env("ORCHESTRATOR_SANDBOX_IMAGE", "firecracker-ci-ubuntu-22.04"), "sandbox image passed to sandboxd")
	root.PersistentFlags().StringVar(&opt.processAPIBin, "process-api-bin", env("PROCESS_API_BIN", "/opt/managed-agents/bin/process-api"), "guest process-api binary path on the sandboxd host")
	root.PersistentFlags().BoolVar(&opt.keepSandbox, "keep-sandbox", env("ORCHESTRATOR_KEEP_SANDBOX", "") == "1", "leave sandbox running for debugging")
	runOnce := &cobra.Command{
		Use:   "run-once",
		Short: "Claim and run at most one queued work item",
		RunE: func(cmd *cobra.Command, args []string) error {
			db, err := openDB(opt.databaseURL)
			if err != nil {
				return err
			}
			ran, err := runOnceWork(cmd.Context(), db, opt)
			if err != nil {
				return err
			}
			if !ran {
				fmt.Println("work=none")
			}
			return nil
		},
	}
	root.AddCommand(runOnce)

	serve := &cobra.Command{
		Use:   "serve",
		Short: "Continuously poll and run queued work",
		RunE: func(cmd *cobra.Command, args []string) error {
			if opt.pollInterval == 0 {
				opt.pollInterval = 2 * time.Second
			}
			db, err := openDB(opt.databaseURL)
			if err != nil {
				return err
			}
			ticker := time.NewTicker(opt.pollInterval)
			defer ticker.Stop()
			for {
				ran, err := runOnceWork(cmd.Context(), db, opt)
				if err != nil {
					fmt.Fprintf(os.Stderr, "orchestrator_error=%q\n", err.Error())
				}
				if !ran {
					select {
					case <-cmd.Context().Done():
						return cmd.Context().Err()
					case <-ticker.C:
					}
				}
			}
		},
	}
	serve.Flags().DurationVar(&opt.pollInterval, "poll-interval", durationEnv("ORCHESTRATOR_POLL_INTERVAL", 2*time.Second), "delay when no work is available")
	root.AddCommand(serve)

	if err := root.Execute(); err != nil {
		os.Exit(1)
	}
}

func openDB(databaseURL string) (*gorm.DB, error) {
	db, err := gorm.Open(postgres.Open(databaseURL), &gorm.Config{})
	if err != nil {
		return nil, err
	}
	if err := db.AutoMigrate(&Agent{}, &Session{}, &SessionEvent{}, &EnvironmentWork{}, &DeploymentRun{}); err != nil {
		return nil, err
	}
	return db, nil
}

func runOnceWork(ctx context.Context, db *gorm.DB, opt options) (bool, error) {
	work, ok, err := claimNextWork(db, opt)
	if err != nil || !ok {
		return ok, err
	}
	fmt.Printf("work=%s state=claimed session=%s\n", work.ID, work.SessionID)
	result := runClaimedWork(ctx, db, opt, work)
	if result != nil {
		return true, result
	}
	return true, nil
}

func claimNextWork(db *gorm.DB, opt options) (EnvironmentWork, bool, error) {
	now := time.Now().UTC()
	leaseID := fmt.Sprintf("lease_%s_%d", opt.workerID, now.UnixNano())
	var claimed EnvironmentWork
	err := db.Transaction(func(tx *gorm.DB) error {
		var work EnvironmentWork
		err := tx.Clauses(clause.Locking{Strength: "UPDATE", Options: "SKIP LOCKED"}).
			Where("state = ?", "queued").
			Order("priority desc, created_at asc").
			First(&work).Error
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return err
		}
		if err != nil {
			return err
		}
		work.State = "starting"
		work.Attempt++
		work.WorkerID = opt.workerID
		work.LeaseID = leaseID
		work.HeartbeatAt = now
		work.HeartbeatTTLSeconds = int(opt.heartbeatTTL.Seconds())
		work.StartedAt = now
		work.UpdatedAt = now
		if err := tx.Save(&work).Error; err != nil {
			return err
		}
		claimed = work
		return nil
	})
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return EnvironmentWork{}, false, nil
	}
	return claimed, err == nil, err
}

func runClaimedWork(ctx context.Context, db *gorm.DB, opt options, work EnvironmentWork) error {
	started := time.Now().UTC()
	var session Session
	if err := db.First(&session, "id = ?", work.SessionID).Error; err != nil {
		return finalizeWork(db, work, session, DeploymentRun{}, runResult{OK: false, Error: err.Error(), StartedAt: started, EndedAt: time.Now().UTC()})
	}
	var agent Agent
	if session.AgentID != "" {
		_ = db.First(&agent, "id = ?", session.AgentID).Error
	}
	var run DeploymentRun
	if work.DeploymentRunID != "" {
		_ = db.First(&run, "id = ?", work.DeploymentRunID).Error
	}
	if err := markRunning(db, work, session); err != nil {
		return err
	}

	payload := decodeWorkPayload(work.Payload)
	result := executeRuntime(ctx, opt, work, session, agent, payload)
	if err := finalizeWork(db, work, session, run, result); err != nil {
		return err
	}
	if result.OK {
		fmt.Printf("work=%s result=success duration_ms=%d\n", work.ID, result.EndedAt.Sub(result.StartedAt).Milliseconds())
		return nil
	}
	return fmt.Errorf("work %s failed: %s", work.ID, result.Error)
}

func markRunning(db *gorm.DB, work EnvironmentWork, session Session) error {
	now := time.Now().UTC()
	return db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Model(&EnvironmentWork{}).Where("id = ?", work.ID).Updates(map[string]any{
			"state":        "active",
			"heartbeat_at": now,
			"updated_at":   now,
		}).Error; err != nil {
			return err
		}
		if err := tx.Model(&Session{}).Where("id = ?", session.ID).Updates(map[string]any{
			"status":          "Running",
			"current_work_id": work.ID,
			"updated_at":      now,
		}).Error; err != nil {
			return err
		}
		return tx.Create(&SessionEvent{
			ID:        eventID("sevt_run", now),
			SessionID: session.ID,
			Role:      "System",
			Kind:      "Lifecycle",
			Type:      "session.status_running",
			Summary:   "Orchestrator claimed work and started the agent turn.",
			Status:    "Running",
			WorkID:    work.ID,
			Payload:   work.Payload,
			CreatedAt: now,
		}).Error
	})
}

func executeRuntime(ctx context.Context, opt options, work EnvironmentWork, session Session, agent Agent, payload workPayload) runResult {
	started := time.Now().UTC()
	runCtx, cancel := context.WithTimeout(ctx, opt.runtimeTimeout)
	defer cancel()
	workspace, err := prepareWorkspace(opt.workspaceRoot, session, work)
	if err != nil {
		return runResult{OK: false, Error: err.Error(), StartedAt: started, EndedAt: time.Now().UTC()}
	}
	prompt := buildPrompt(session, agent, payload)
	var result runResult
	switch opt.runtime {
	case "shell":
		result = runShellRuntime(runCtx, opt, prompt, workspace)
	case "codex-local":
		result = runCodexLocal(runCtx, opt, prompt, workspace)
	case "sandbox-shell":
		result = runSandboxShell(runCtx, opt, work, prompt)
	case "sandbox-command":
		result = runSandboxCommand(runCtx, opt, work, prompt)
	case "sandbox-codex":
		result = runSandboxCodex(runCtx, opt, work, prompt)
	default:
		result = runResult{OK: false, Error: fmt.Sprintf("unsupported runtime %q", opt.runtime), StartedAt: started, EndedAt: time.Now().UTC()}
	}
	if result.StartedAt.IsZero() {
		result.StartedAt = started
	}
	if result.EndedAt.IsZero() {
		result.EndedAt = time.Now().UTC()
	}
	return result
}

func runCodexLocal(ctx context.Context, opt options, prompt, workspace string) runResult {
	started := time.Now().UTC()
	args := []string{
		"exec",
		"--json",
		"--ephemeral",
		"--skip-git-repo-check",
		"--dangerously-bypass-approvals-and-sandbox",
		"-C",
		workspace,
		"-m",
		opt.codexModel,
		prompt,
	}
	cmd := exec.CommandContext(ctx, opt.codexBin, args...)
	cmd.Dir = workspace
	output, err := cmd.CombinedOutput()
	summary := summarizeCodexJSONL(output)
	if summary == "" {
		summary = strings.TrimSpace(string(output))
	}
	result := runResult{
		OK:        err == nil,
		Summary:   limitString(summary, 8000),
		RawOutput: limitString(string(output), 50000),
		StartedAt: started,
		EndedAt:   time.Now().UTC(),
	}
	if err != nil {
		result.Error = err.Error()
		if ctx.Err() != nil {
			result.Error = ctx.Err().Error()
		}
	}
	return result
}

func runShellRuntime(ctx context.Context, opt options, prompt, workspace string) runResult {
	started := time.Now().UTC()
	command := strings.TrimSpace(opt.shellCommand)
	if command == "" {
		command = "printf '%s\n' \"$MANAGED_AGENTS_PROMPT\""
	}
	cmd := exec.CommandContext(ctx, "/bin/sh", "-c", command)
	cmd.Dir = workspace
	cmd.Env = append(os.Environ(), "MANAGED_AGENTS_PROMPT="+prompt)
	output, err := cmd.CombinedOutput()
	result := runResult{
		OK:        err == nil,
		Summary:   limitString(strings.TrimSpace(string(output)), 8000),
		RawOutput: limitString(string(output), 50000),
		StartedAt: started,
		EndedAt:   time.Now().UTC(),
	}
	if err != nil {
		result.Error = err.Error()
		if ctx.Err() != nil {
			result.Error = ctx.Err().Error()
		}
	}
	return result
}

func runSandboxShell(ctx context.Context, opt options, work EnvironmentWork, prompt string) runResult {
	started := time.Now().UTC()
	sandboxID := "sbx-" + safePathPart(work.ID)
	client := &http.Client{Timeout: opt.runtimeTimeout + 30*time.Second}
	state, err := startSandbox(ctx, client, opt, sandboxID)
	if err != nil {
		return runResult{OK: false, Error: err.Error(), StartedAt: started, EndedAt: time.Now().UTC()}
	}
	if !opt.keepSandbox {
		defer cleanupSandbox(context.Background(), client, opt, state.ID)
	}
	command := strings.TrimSpace(opt.shellCommand)
	if command == "" {
		command = "printf '%s\n' \"$MANAGED_AGENTS_PROMPT\""
	}
	resp, err := execSandbox(ctx, client, opt, state.ID, processAPIExecRequest{
		Argv:          []string{"/bin/sh", "-c", command},
		Cwd:           "/tmp",
		Env:           map[string]string{"MANAGED_AGENTS_PROMPT": prompt},
		TimeoutMillis: opt.runtimeTimeout.Milliseconds(),
	})
	output := resp.Stdout
	if resp.Stderr != "" {
		output += "\n[stderr]\n" + resp.Stderr
	}
	result := runResult{
		OK:        err == nil && resp.OK,
		Summary:   limitString(strings.TrimSpace(output), 8000),
		RawOutput: limitString(output, 50000),
		StartedAt: started,
		EndedAt:   time.Now().UTC(),
	}
	if err != nil {
		result.Error = err.Error()
	} else if !resp.OK {
		result.Error = resp.Error
		if result.Error == "" {
			result.Error = fmt.Sprintf("guest command exited with %d", resp.ExitCode)
		}
		if resp.TimedOut {
			result.Error = "guest command timed out"
		}
	}
	return result
}

func runSandboxCommand(ctx context.Context, opt options, work EnvironmentWork, prompt string) runResult {
	started := time.Now().UTC()
	command := strings.TrimSpace(opt.shellCommand)
	if command == "" {
		command = "printf '%s\n' \"$MANAGED_AGENTS_PROMPT\""
	}
	command = "MANAGED_AGENTS_PROMPT=" + shellEnvQuote(prompt) + "\n" + command
	request := sandboxdRunRequest{
		ID:            "sbx-" + safePathPart(work.ID),
		Image:         opt.sandboxImage,
		Command:       command,
		TimeoutMillis: opt.runtimeTimeout.Milliseconds(),
	}
	run, err := postSandboxRun(ctx, opt, request)
	if err != nil {
		return runResult{OK: false, Error: err.Error(), StartedAt: started, EndedAt: time.Now().UTC()}
	}
	return sandboxRunResult(run, started)
}

func runSandboxCodex(ctx context.Context, opt options, work EnvironmentWork, prompt string) runResult {
	started := time.Now().UTC()
	auth, err := os.ReadFile(filepath.Join(opt.codexHome, "auth.json"))
	if err != nil {
		return runResult{OK: false, Error: fmt.Sprintf("read codex auth: %v", err), StartedAt: started, EndedAt: time.Now().UTC()}
	}
	command := sandboxCodexCommand(auth, opt.codexModel, opt.codexTarball, prompt)
	request := sandboxdRunRequest{
		ID:            "sbx-" + safePathPart(work.ID),
		Image:         opt.sandboxImage,
		VCPUCount:     2,
		MemMiB:        1024,
		Command:       command,
		Network:       true,
		TimeoutMillis: opt.runtimeTimeout.Milliseconds(),
	}
	run, err := postSandboxRun(ctx, opt, request)
	if err != nil {
		return runResult{OK: false, Error: err.Error(), StartedAt: started, EndedAt: time.Now().UTC()}
	}
	result := sandboxRunResult(run, started)
	if result.OK {
		if summary := summarizeCodexRunOutput(run.Stdout); summary != "" {
			result.Summary = limitString(summary, 8000)
		}
	}
	return result
}

func postSandboxRun(ctx context.Context, opt options, request sandboxdRunRequest) (sandboxdRunResponse, error) {
	var body bytes.Buffer
	if err := json.NewEncoder(&body).Encode(request); err != nil {
		return sandboxdRunResponse{}, err
	}
	client := &http.Client{Timeout: opt.runtimeTimeout + 30*time.Second}
	httpCtx, cancel := context.WithTimeout(context.WithoutCancel(ctx), opt.runtimeTimeout+30*time.Second)
	defer cancel()
	req, err := http.NewRequestWithContext(httpCtx, http.MethodPost, strings.TrimRight(opt.sandboxdURL, "/")+"/runs", &body)
	if err != nil {
		return sandboxdRunResponse{}, err
	}
	req.Header.Set("Content-Type", "application/json")
	resp, err := client.Do(req)
	if err != nil {
		return sandboxdRunResponse{}, err
	}
	defer resp.Body.Close()
	var run sandboxdRunResponse
	if err := readJSON(resp, &run); err != nil {
		return sandboxdRunResponse{}, err
	}
	return run, nil
}

func sandboxRunResult(run sandboxdRunResponse, started time.Time) runResult {
	output := run.Stdout
	if run.Stderr != "" {
		output += "\n[stderr]\n" + run.Stderr
	}
	result := runResult{
		OK:        run.OK,
		Summary:   limitString(strings.TrimSpace(output), 8000),
		RawOutput: limitString(output, 50000),
		StartedAt: started,
		EndedAt:   time.Now().UTC(),
	}
	if !run.OK {
		result.Error = run.Error
		if result.Error == "" {
			result.Error = fmt.Sprintf("guest command exited with %d", run.ExitCode)
		}
	}
	return result
}

func sandboxCodexCommand(auth []byte, model, tarballURL, prompt string) string {
	authB64 := base64.StdEncoding.EncodeToString(auth)
	config := fmt.Sprintf("model = %q\nmodel_reasoning_effort = \"low\"\n", model)
	configB64 := base64.StdEncoding.EncodeToString([]byte(config))
	promptB64 := base64.StdEncoding.EncodeToString([]byte(prompt))
	return fmt.Sprintf(`set -eu
HOME=/root
CODEX_HOME=/root/.codex
export HOME CODEX_HOME
mkdir -p /opt/codex/bin /workspace "$CODEX_HOME"
printf '%%s' %s | base64 -d > "$CODEX_HOME/auth.json"
printf '%%s' %s | base64 -d > "$CODEX_HOME/config.toml"
printf '%%s' %s | base64 -d > /tmp/managed-agents-prompt.txt
chmod 600 "$CODEX_HOME/auth.json" "$CODEX_HOME/config.toml"
curl -fsSL --max-time 120 -o /tmp/codex.tgz %s
tar -xzf /tmp/codex.tgz -C /opt/codex/bin
if [ -f /opt/codex/bin/codex-x86_64-unknown-linux-musl ]; then mv /opt/codex/bin/codex-x86_64-unknown-linux-musl /opt/codex/bin/codex; fi
chmod +x /opt/codex/bin/codex
/opt/codex/bin/codex --version
/opt/codex/bin/codex exec --json --ephemeral --skip-git-repo-check --dangerously-bypass-approvals-and-sandbox -C /workspace -m %s -o /tmp/codex-last.txt "$(cat /tmp/managed-agents-prompt.txt)" >/tmp/codex.jsonl 2>/tmp/codex.stderr
code=$?
echo CODEX_EXIT=$code
cat /tmp/codex-last.txt || true
printf '\n--- codex-jsonl-tail ---\n'
tail -20 /tmp/codex.jsonl || true
printf '\n--- codex-stderr ---\n' >&2
cat /tmp/codex.stderr >&2 || true
exit "$code"
`, shellEnvQuote(authB64), shellEnvQuote(configB64), shellEnvQuote(promptB64), shellEnvQuote(tarballURL), shellEnvQuote(model))
}

func summarizeCodexRunOutput(output string) string {
	marker := "CODEX_EXIT=0"
	idx := strings.Index(output, marker)
	if idx < 0 {
		return ""
	}
	rest := strings.TrimSpace(output[idx+len(marker):])
	if cut := strings.Index(rest, "--- codex-jsonl-tail ---"); cut >= 0 {
		rest = strings.TrimSpace(rest[:cut])
	}
	return rest
}

func startSandbox(ctx context.Context, client *http.Client, opt options, id string) (sandboxState, error) {
	request := sandboxdStartRequest{
		ID:            id,
		Image:         opt.sandboxImage,
		ProcessAPI:    true,
		ProcessAPIBin: opt.processAPIBin,
		TimeoutMillis: opt.runtimeTimeout.Milliseconds(),
	}
	var body bytes.Buffer
	if err := json.NewEncoder(&body).Encode(request); err != nil {
		return sandboxState{}, err
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, strings.TrimRight(opt.sandboxdURL, "/")+"/sandboxes", &body)
	if err != nil {
		return sandboxState{}, err
	}
	req.Header.Set("Content-Type", "application/json")
	resp, err := client.Do(req)
	if err != nil {
		return sandboxState{}, err
	}
	var state sandboxState
	if err := readJSON(resp, &state); err != nil {
		return sandboxState{}, err
	}
	return state, nil
}

func execSandbox(ctx context.Context, client *http.Client, opt options, id string, request processAPIExecRequest) (processAPIExecResponse, error) {
	var body bytes.Buffer
	if err := json.NewEncoder(&body).Encode(request); err != nil {
		return processAPIExecResponse{}, err
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, fmt.Sprintf("%s/sandboxes/%s/exec", strings.TrimRight(opt.sandboxdURL, "/"), id), &body)
	if err != nil {
		return processAPIExecResponse{}, err
	}
	req.Header.Set("Content-Type", "application/json")
	resp, err := client.Do(req)
	if err != nil {
		return processAPIExecResponse{}, err
	}
	var result processAPIExecResponse
	if err := readJSON(resp, &result); err != nil {
		return processAPIExecResponse{}, err
	}
	return result, nil
}

func cleanupSandbox(ctx context.Context, client *http.Client, opt options, id string) {
	base := strings.TrimRight(opt.sandboxdURL, "/") + "/sandboxes/" + id
	stopReq, err := http.NewRequestWithContext(ctx, http.MethodPost, base+"/stop", nil)
	if err == nil {
		resp, err := client.Do(stopReq)
		if err == nil {
			_, _ = io.Copy(io.Discard, resp.Body)
			_ = resp.Body.Close()
		}
	}
	deleteReq, err := http.NewRequestWithContext(ctx, http.MethodDelete, base+"?force=true", nil)
	if err == nil {
		resp, err := client.Do(deleteReq)
		if err == nil {
			_, _ = io.Copy(io.Discard, resp.Body)
			_ = resp.Body.Close()
		}
	}
}

func finalizeWork(db *gorm.DB, work EnvironmentWork, session Session, run DeploymentRun, result runResult) error {
	now := time.Now().UTC()
	duration := result.EndedAt.Sub(result.StartedAt)
	if duration < 0 {
		duration = 0
	}
	workState := "stopped"
	sessionStatus := "Idle"
	runResultText := "Success"
	eventType := "agent.message"
	eventRole := "Agent"
	eventKind := "Message"
	eventStatus := "Idle"
	summary := result.Summary
	errText := ""
	if !result.OK {
		runResultText = "Failed"
		eventType = "session.error"
		eventRole = "System"
		eventKind = "Error"
		eventStatus = "Error"
		errText = result.Error
		if summary == "" {
			summary = result.Error
		}
	}
	if summary == "" {
		summary = "Agent turn completed without a final message."
	}
	payload := map[string]any{
		"runtime_output": result.RawOutput,
		"error":          result.Error,
		"duration_ms":    duration.Milliseconds(),
	}
	payloadJSON, _ := json.Marshal(payload)
	return db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Model(&EnvironmentWork{}).Where("id = ?", work.ID).Updates(map[string]any{
			"state":        workState,
			"stopped_at":   now,
			"heartbeat_at": now,
			"updated_at":   now,
			"error":        errText,
		}).Error; err != nil {
			return err
		}
		if session.ID != "" {
			if err := tx.Model(&Session{}).Where("id = ?", session.ID).Updates(map[string]any{
				"status":          sessionStatus,
				"current_work_id": "",
				"duration":        formatDuration(duration),
				"updated_at":      now,
			}).Error; err != nil {
				return err
			}
			if err := tx.Create(&SessionEvent{
				ID:        eventID("sevt_done", now),
				SessionID: session.ID,
				Role:      eventRole,
				Kind:      eventKind,
				Type:      eventType,
				Summary:   summary,
				Status:    eventStatus,
				Offset:    formatDuration(duration),
				WorkID:    work.ID,
				Payload:   string(payloadJSON),
				CreatedAt: now,
			}).Error; err != nil {
				return err
			}
			if result.OK {
				if err := tx.Create(&SessionEvent{
					ID:        eventID("sevt_idle", now.Add(time.Nanosecond)),
					SessionID: session.ID,
					Role:      "System",
					Kind:      "Lifecycle",
					Type:      "session.status_idle",
					Summary:   "Agent turn finished; session is idle until the next message.",
					Status:    "Idle",
					Offset:    formatDuration(duration),
					WorkID:    work.ID,
					CreatedAt: now.Add(time.Nanosecond),
				}).Error; err != nil {
					return err
				}
			}
		}
		if run.ID != "" {
			return tx.Model(&DeploymentRun{}).Where("id = ?", run.ID).Updates(map[string]any{
				"result":         runResultText,
				"error":          errText,
				"session_status": sessionStatus,
				"completed_at":   now,
				"work_id":        work.ID,
			}).Error
		}
		return nil
	})
}

func decodeWorkPayload(raw string) workPayload {
	var payload workPayload
	_ = json.Unmarshal([]byte(raw), &payload)
	return payload
}

func prepareWorkspace(root string, session Session, work EnvironmentWork) (string, error) {
	if root == "" {
		root = "/tmp/managed-agents-workspaces"
	}
	dir := filepath.Join(root, safePathPart(session.ID), safePathPart(work.ID))
	if err := os.MkdirAll(dir, 0o755); err != nil {
		return "", err
	}
	readme := fmt.Sprintf("# Managed Agent Workspace\n\nsession: %s\nwork: %s\nenvironment: %s\n", session.ID, work.ID, session.EnvironmentName)
	return dir, os.WriteFile(filepath.Join(dir, "README.md"), []byte(readme), 0o644)
}

func buildPrompt(session Session, agent Agent, payload workPayload) string {
	var parts []string
	if strings.TrimSpace(agent.SystemPrompt) != "" {
		parts = append(parts, "System instructions:\n"+strings.TrimSpace(agent.SystemPrompt))
	}
	parts = append(parts, fmt.Sprintf("Session: %s (%s)", session.Name, session.ID))
	if payload.Source != "" {
		parts = append(parts, "Work source: "+payload.Source)
	}
	prompt := strings.TrimSpace(payload.Prompt)
	if prompt == "" {
		prompt = "Continue the managed-agent session and report the outcome."
	}
	parts = append(parts, "User request:\n"+prompt)
	return strings.Join(parts, "\n\n")
}

func summarizeCodexJSONL(output []byte) string {
	scanner := bufio.NewScanner(bytes.NewReader(output))
	scanner.Buffer(make([]byte, 0, 64*1024), 4*1024*1024)
	last := ""
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" || !strings.HasPrefix(line, "{") {
			continue
		}
		var event map[string]any
		if err := json.Unmarshal([]byte(line), &event); err != nil {
			continue
		}
		if text := textFromEvent(event); text != "" {
			last = text
		}
	}
	return last
}

func textFromEvent(value any) string {
	switch item := value.(type) {
	case map[string]any:
		for _, key := range []string{"text", "message", "content", "summary", "last_message"} {
			if text, ok := item[key].(string); ok && strings.TrimSpace(text) != "" {
				return strings.TrimSpace(text)
			}
		}
		for _, key := range []string{"item", "delta", "data"} {
			if nested, ok := item[key]; ok {
				if text := textFromEvent(nested); text != "" {
					return text
				}
			}
		}
		if content, ok := item["content"].([]any); ok {
			var parts []string
			for _, nested := range content {
				if text := textFromEvent(nested); text != "" {
					parts = append(parts, text)
				}
			}
			return strings.TrimSpace(strings.Join(parts, "\n"))
		}
	case []any:
		var parts []string
		for _, nested := range item {
			if text := textFromEvent(nested); text != "" {
				parts = append(parts, text)
			}
		}
		return strings.TrimSpace(strings.Join(parts, "\n"))
	}
	return ""
}

func eventID(prefix string, ts time.Time) string {
	sum := sha256.Sum256([]byte(fmt.Sprintf("%s-%d", prefix, ts.UnixNano())))
	return fmt.Sprintf("%s_%s", prefix, hex.EncodeToString(sum[:])[:16])
}

func safePathPart(value string) string {
	value = strings.TrimSpace(value)
	if value == "" {
		return "unknown"
	}
	var out strings.Builder
	for _, r := range value {
		if r >= 'a' && r <= 'z' || r >= 'A' && r <= 'Z' || r >= '0' && r <= '9' || r == '-' || r == '_' || r == '.' {
			out.WriteRune(r)
		} else {
			out.WriteByte('_')
		}
	}
	return out.String()
}

func shellEnvQuote(value string) string {
	return "'" + strings.ReplaceAll(value, "'", "'\\''") + "'"
}

func formatDuration(duration time.Duration) string {
	if duration < 0 {
		duration = 0
	}
	minutes := int(duration.Minutes())
	seconds := int(duration.Seconds()) % 60
	return fmt.Sprintf("%dm %02ds", minutes, seconds)
}

func limitString(value string, max int) string {
	if max <= 0 || len(value) <= max {
		return value
	}
	return value[:max] + "\n[truncated]"
}

func env(key, fallback string) string {
	value := strings.TrimSpace(os.Getenv(key))
	if value == "" {
		return fallback
	}
	return value
}

func homeDir() string {
	home, err := os.UserHomeDir()
	if err != nil || home == "" {
		return "/tmp"
	}
	return home
}

func durationEnv(key string, fallback time.Duration) time.Duration {
	value := strings.TrimSpace(os.Getenv(key))
	if value == "" {
		return fallback
	}
	parsed, err := time.ParseDuration(value)
	if err != nil {
		return fallback
	}
	return parsed
}

func defaultWorkerID() string {
	host, err := os.Hostname()
	if err != nil || host == "" {
		host = "localhost"
	}
	return "orch-" + safePathPart(host)
}

func readJSON(resp *http.Response, target any) error {
	defer resp.Body.Close()
	data, err := io.ReadAll(resp.Body)
	if err != nil {
		return err
	}
	if resp.StatusCode >= 300 {
		return fmt.Errorf("http %s: %s", resp.Status, strings.TrimSpace(string(data)))
	}
	return json.Unmarshal(data, target)
}
