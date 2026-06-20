package main

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"sync/atomic"
	"testing"
	"time"
)

func TestSummarizeCodexJSONL(t *testing.T) {
	output := []byte(strings.Join([]string{
		`{"type":"thread.started","thread_id":"t1"}`,
		`{"type":"item.completed","item":{"type":"agent_message","text":"hello from codex"}}`,
		`{"type":"turn.completed"}`,
	}, "\n"))
	if got := summarizeCodexJSONL(output); got != "hello from codex" {
		t.Fatalf("summary = %q", got)
	}
}

func TestRunSandboxShellCallsSandboxdLifecycle(t *testing.T) {
	var started atomic.Bool
	var executed atomic.Bool
	var stopped atomic.Bool
	var deleted atomic.Bool
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch {
		case r.Method == http.MethodPost && r.URL.Path == "/sandboxes":
			started.Store(true)
			_ = json.NewEncoder(w).Encode(sandboxState{ID: "sbx-ewrk_test", Status: "running"})
		case r.Method == http.MethodPost && r.URL.Path == "/sandboxes/sbx-ewrk_test/exec":
			executed.Store(true)
			var req processAPIExecRequest
			if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
				t.Fatalf("decode exec request: %v", err)
			}
			if req.Env["MANAGED_AGENTS_PROMPT"] == "" {
				t.Fatal("exec request did not include prompt env")
			}
			_ = json.NewEncoder(w).Encode(processAPIExecResponse{
				OK:       true,
				ExitCode: 0,
				Stdout:   "sandbox-ok",
			})
		case r.Method == http.MethodPost && r.URL.Path == "/sandboxes/sbx-ewrk_test/stop":
			stopped.Store(true)
			_ = json.NewEncoder(w).Encode(sandboxState{ID: "sbx-ewrk_test", Status: "stopped"})
		case r.Method == http.MethodDelete && r.URL.Path == "/sandboxes/sbx-ewrk_test":
			deleted.Store(true)
			_ = json.NewEncoder(w).Encode(map[string]any{"removed": true})
		default:
			http.NotFound(w, r)
		}
	}))
	defer server.Close()

	result := runSandboxShell(context.Background(), options{
		sandboxdURL:    server.URL,
		sandboxImage:   "test-image",
		processAPIBin:  "/opt/managed-agents/bin/process-api",
		runtimeTimeout: time.Second,
		shellCommand:   "printf sandbox-ok",
	}, EnvironmentWork{ID: "ewrk_test"}, "prompt")
	if !result.OK || result.Summary != "sandbox-ok" {
		t.Fatalf("unexpected result: %#v", result)
	}
	if !started.Load() || !executed.Load() || !stopped.Load() || !deleted.Load() {
		t.Fatalf("lifecycle not complete: start=%t exec=%t stop=%t delete=%t", started.Load(), executed.Load(), stopped.Load(), deleted.Load())
	}
}
