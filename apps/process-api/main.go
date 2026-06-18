package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net"
	"net/http"
	"os"
	"runtime"
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
