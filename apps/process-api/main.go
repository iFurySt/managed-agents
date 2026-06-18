package main

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net"
	"net/http"
	"os"
	"os/exec"
	"runtime"
	"strings"
	"sync"
	"sync/atomic"
	"syscall"
	"time"

	"github.com/spf13/cobra"
)

type options struct {
	transport string
	tcpAddr   string
	vsockPort uint32
}

type healthResponse struct {
	OK        bool   `json:"ok"`
	Service   string `json:"service"`
	Version   string `json:"version"`
	OS        string `json:"os"`
	Arch      string `json:"arch"`
	PID       int    `json:"pid"`
	Timestamp string `json:"timestamp"`
}

type execRequest struct {
	Argv          []string          `json:"argv"`
	Cwd           string            `json:"cwd,omitempty"`
	Env           map[string]string `json:"env,omitempty"`
	TimeoutMillis int64             `json:"timeout_millis,omitempty"`
}

type execResponse struct {
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

type processCreateRequest execRequest

type processSignalRequest struct {
	Signal string `json:"signal"`
}

type processResponse struct {
	ID             string   `json:"id"`
	Argv           []string `json:"argv"`
	Cwd            string   `json:"cwd"`
	Status         string   `json:"status"`
	PID            int      `json:"pid,omitempty"`
	ExitCode       int      `json:"exit_code"`
	Stdout         string   `json:"stdout"`
	Stderr         string   `json:"stderr"`
	Error          string   `json:"error,omitempty"`
	TimedOut       bool     `json:"timed_out"`
	StartedAt      string   `json:"started_at"`
	ExitedAt       string   `json:"exited_at,omitempty"`
	DurationMillis int64    `json:"duration_millis"`
}

type processManager struct {
	next      atomic.Uint64
	mu        sync.Mutex
	processes map[string]*managedProcess
}

type managedProcess struct {
	mu        sync.Mutex
	id        string
	argv      []string
	cwd       string
	command   *exec.Cmd
	stdout    *lockedBuffer
	stderr    *lockedBuffer
	status    string
	pid       int
	exitCode  int
	errText   string
	timedOut  bool
	startedAt time.Time
	exitedAt  time.Time
	cancel    context.CancelFunc
}

type lockedBuffer struct {
	mu  sync.Mutex
	buf bytes.Buffer
}

func main() {
	var opt options
	root := &cobra.Command{
		Use:   "process-api",
		Short: "Run the guest-side managed agents process API",
		RunE: func(cmd *cobra.Command, args []string) error {
			return run(cmd.Context(), opt)
		},
	}
	root.Flags().StringVar(&opt.transport, "transport", "tcp", "listener transport: tcp or vsock")
	root.Flags().StringVar(&opt.tcpAddr, "tcp-addr", ":8080", "TCP address to listen on")
	root.Flags().Uint32Var(&opt.vsockPort, "vsock-port", 1024, "AF_VSOCK port to listen on inside the guest")
	if err := root.Execute(); err != nil {
		os.Exit(1)
	}
}

func run(ctx context.Context, opt options) error {
	listener, err := listen(opt)
	if err != nil {
		return err
	}
	defer listener.Close()

	processes := newProcessManager()
	mux := http.NewServeMux()
	mux.HandleFunc("GET /healthz", func(w http.ResponseWriter, r *http.Request) {
		writeJSON(w, healthResponse{
			OK:        true,
			Service:   "process-api",
			Version:   "dev",
			OS:        runtime.GOOS,
			Arch:      runtime.GOARCH,
			PID:       os.Getpid(),
			Timestamp: time.Now().UTC().Format(time.RFC3339Nano),
		})
	})
	mux.HandleFunc("POST /exec", handleExec)
	mux.HandleFunc("POST /processes", processes.handleCreate)
	mux.HandleFunc("GET /processes/{id}", processes.handleGet)
	mux.HandleFunc("POST /processes/{id}/signal", processes.handleSignal)
	mux.HandleFunc("POST /shutdown", func(w http.ResponseWriter, r *http.Request) {
		writeJSON(w, map[string]any{"ok": true, "action": "shutdown"})
		go func() {
			time.Sleep(100 * time.Millisecond)
			_ = powerOff()
		}()
	})

	server := &http.Server{
		Handler:           mux,
		ReadHeaderTimeout: 5 * time.Second,
	}
	go func() {
		<-ctx.Done()
		shutdownCtx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
		defer cancel()
		_ = server.Shutdown(shutdownCtx)
	}()
	fmt.Printf("process_api_ready transport=%s addr=%s port=%d pid=%d\n", opt.transport, opt.tcpAddr, opt.vsockPort, os.Getpid())
	if err := server.Serve(listener); err != nil && !errors.Is(err, http.ErrServerClosed) {
		return err
	}
	return nil
}

func handleExec(w http.ResponseWriter, r *http.Request) {
	var req execRequest
	if err := json.NewDecoder(http.MaxBytesReader(w, r.Body, 1<<20)).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp := runExec(r.Context(), req)
	writeJSON(w, resp)
}

func runExec(ctx context.Context, req execRequest) execResponse {
	started := time.Now()
	cwd := req.Cwd
	if cwd == "" {
		cwd = "/"
	}
	resp := execResponse{
		Argv: req.Argv,
		Cwd:  cwd,
	}
	if len(req.Argv) == 0 || strings.TrimSpace(req.Argv[0]) == "" {
		resp.ExitCode = -1
		resp.Error = "argv must include a command"
		resp.DurationMillis = time.Since(started).Milliseconds()
		return resp
	}
	timeout := 30 * time.Second
	if req.TimeoutMillis > 0 {
		timeout = time.Duration(req.TimeoutMillis) * time.Millisecond
	}
	execCtx, cancel := context.WithTimeout(ctx, timeout)
	defer cancel()

	command := exec.CommandContext(execCtx, req.Argv[0], req.Argv[1:]...)
	command.Dir = cwd
	command.Env = mergeEnv(os.Environ(), req.Env)
	var stdout bytes.Buffer
	var stderr bytes.Buffer
	command.Stdout = &stdout
	command.Stderr = &stderr
	err := command.Run()
	resp.Stdout = stdout.String()
	resp.Stderr = stderr.String()
	resp.DurationMillis = time.Since(started).Milliseconds()
	if errors.Is(execCtx.Err(), context.DeadlineExceeded) {
		resp.TimedOut = true
		resp.ExitCode = -1
		resp.Error = "command timed out"
		return resp
	}
	if err != nil {
		resp.ExitCode = exitCode(err)
		resp.Error = err.Error()
		return resp
	}
	resp.OK = true
	return resp
}

func newProcessManager() *processManager {
	return &processManager{
		processes: make(map[string]*managedProcess),
	}
}

func (manager *processManager) handleCreate(w http.ResponseWriter, r *http.Request) {
	var req processCreateRequest
	if err := json.NewDecoder(http.MaxBytesReader(w, r.Body, 1<<20)).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	process, err := manager.start(r.Context(), execRequest(req))
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	writeJSON(w, process.snapshot())
}

func (manager *processManager) handleGet(w http.ResponseWriter, r *http.Request) {
	process, ok := manager.get(r.PathValue("id"))
	if !ok {
		http.NotFound(w, r)
		return
	}
	writeJSON(w, process.snapshot())
}

func (manager *processManager) handleSignal(w http.ResponseWriter, r *http.Request) {
	process, ok := manager.get(r.PathValue("id"))
	if !ok {
		http.NotFound(w, r)
		return
	}
	var req processSignalRequest
	if err := json.NewDecoder(http.MaxBytesReader(w, r.Body, 1<<20)).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	signal, err := parseSignal(req.Signal)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	if err := process.signal(signal); err != nil {
		http.Error(w, err.Error(), http.StatusConflict)
		return
	}
	writeJSON(w, process.snapshot())
}

func (manager *processManager) start(ctx context.Context, req execRequest) (*managedProcess, error) {
	cwd := req.Cwd
	if cwd == "" {
		cwd = "/"
	}
	if len(req.Argv) == 0 || strings.TrimSpace(req.Argv[0]) == "" {
		return nil, errors.New("argv must include a command")
	}
	timeout := time.Duration(0)
	if req.TimeoutMillis > 0 {
		timeout = time.Duration(req.TimeoutMillis) * time.Millisecond
	}
	processCtx := context.Background()
	cancel := func() {}
	if timeout > 0 {
		processCtx, cancel = context.WithTimeout(processCtx, timeout)
	}
	command := exec.CommandContext(processCtx, req.Argv[0], req.Argv[1:]...)
	command.Dir = cwd
	command.Env = mergeEnv(os.Environ(), req.Env)
	stdout := &lockedBuffer{}
	stderr := &lockedBuffer{}
	command.Stdout = stdout
	command.Stderr = stderr

	id := fmt.Sprintf("proc-%d", manager.next.Add(1))
	process := &managedProcess{
		id:        id,
		argv:      append([]string(nil), req.Argv...),
		cwd:       cwd,
		command:   command,
		stdout:    stdout,
		stderr:    stderr,
		status:    "starting",
		exitCode:  -1,
		startedAt: time.Now().UTC(),
		cancel:    cancel,
	}
	if err := command.Start(); err != nil {
		cancel()
		return nil, err
	}
	process.mu.Lock()
	process.status = "running"
	process.pid = command.Process.Pid
	process.mu.Unlock()

	manager.mu.Lock()
	manager.processes[id] = process
	manager.mu.Unlock()

	go process.wait(processCtx)
	_ = ctx
	return process, nil
}

func (manager *processManager) get(id string) (*managedProcess, bool) {
	manager.mu.Lock()
	defer manager.mu.Unlock()
	process, ok := manager.processes[id]
	return process, ok
}

func (process *managedProcess) wait(ctx context.Context) {
	err := process.command.Wait()
	process.mu.Lock()
	defer process.mu.Unlock()
	process.exitedAt = time.Now().UTC()
	process.exitCode = 0
	process.status = "exited"
	if errors.Is(ctx.Err(), context.DeadlineExceeded) {
		process.timedOut = true
		process.status = "timed_out"
		process.exitCode = -1
		process.errText = "command timed out"
		process.cancel()
		return
	}
	if err != nil {
		process.exitCode = exitCode(err)
		process.errText = err.Error()
	}
	process.cancel()
}

func (process *managedProcess) signal(signal os.Signal) error {
	process.mu.Lock()
	defer process.mu.Unlock()
	if process.command.Process == nil || process.status != "running" {
		return fmt.Errorf("process %s is not running", process.id)
	}
	return process.command.Process.Signal(signal)
}

func (process *managedProcess) snapshot() processResponse {
	process.mu.Lock()
	defer process.mu.Unlock()
	resp := processResponse{
		ID:             process.id,
		Argv:           append([]string(nil), process.argv...),
		Cwd:            process.cwd,
		Status:         process.status,
		PID:            process.pid,
		ExitCode:       process.exitCode,
		Stdout:         process.stdout.String(),
		Stderr:         process.stderr.String(),
		Error:          process.errText,
		TimedOut:       process.timedOut,
		StartedAt:      process.startedAt.Format(time.RFC3339Nano),
		DurationMillis: time.Since(process.startedAt).Milliseconds(),
	}
	if !process.exitedAt.IsZero() {
		resp.ExitedAt = process.exitedAt.Format(time.RFC3339Nano)
		resp.DurationMillis = process.exitedAt.Sub(process.startedAt).Milliseconds()
	}
	return resp
}

func (buffer *lockedBuffer) Write(data []byte) (int, error) {
	buffer.mu.Lock()
	defer buffer.mu.Unlock()
	return buffer.buf.Write(data)
}

func (buffer *lockedBuffer) String() string {
	buffer.mu.Lock()
	defer buffer.mu.Unlock()
	return buffer.buf.String()
}

func parseSignal(value string) (os.Signal, error) {
	switch strings.ToUpper(strings.TrimPrefix(value, "SIG")) {
	case "", "TERM":
		return syscall.SIGTERM, nil
	case "INT":
		return os.Interrupt, nil
	case "KILL":
		return syscall.SIGKILL, nil
	case "HUP":
		return syscall.SIGHUP, nil
	default:
		return nil, fmt.Errorf("unsupported signal %q", value)
	}
}

func mergeEnv(base []string, overrides map[string]string) []string {
	if len(overrides) == 0 {
		return base
	}
	env := make([]string, 0, len(base)+len(overrides))
	seen := make(map[string]bool, len(overrides))
	for key := range overrides {
		seen[key] = true
	}
	for _, item := range base {
		key, _, ok := strings.Cut(item, "=")
		if ok && seen[key] {
			continue
		}
		env = append(env, item)
	}
	for key, value := range overrides {
		env = append(env, key+"="+value)
	}
	return env
}

func exitCode(err error) int {
	var exitErr *exec.ExitError
	if errors.As(err, &exitErr) {
		return exitErr.ExitCode()
	}
	return -1
}

func listen(opt options) (net.Listener, error) {
	switch opt.transport {
	case "tcp":
		return net.Listen("tcp", opt.tcpAddr)
	case "vsock":
		if runtime.GOOS != "linux" {
			return nil, errors.New("process-api vsock listener requires Linux")
		}
		return listenVsock(opt.vsockPort)
	default:
		return nil, fmt.Errorf("unsupported transport %q", opt.transport)
	}
}

func writeJSON(w http.ResponseWriter, value any) {
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(value); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}
