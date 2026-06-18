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
