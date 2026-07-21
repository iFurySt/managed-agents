package main

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
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

func TestSandboxCodexCommandDoesNotInlineRawAuthOrPrompt(t *testing.T) {
	command := sandboxCodexCommand([]byte(`{"secret":"token"}`), "gpt-test", "https://example.invalid/codex.tgz", "say hi")
	for _, want := range []string{
		"CODEX_HOME=/root/.codex",
		"curl -fL --connect-timeout 30 --max-time 300 -C -",
		"attempt=$((attempt + 1))",
		"/opt/codex/bin/codex exec --json",
		"-m 'gpt-test'",
	} {
		if !strings.Contains(command, want) {
			t.Fatalf("command missing %q:\n%s", want, command)
		}
	}
	for _, forbidden := range []string{"token", "say hi"} {
		if strings.Contains(command, forbidden) {
			t.Fatalf("command leaked raw value %q:\n%s", forbidden, command)
		}
	}
}

func TestRunSandboxCodexUsesNetworkedRun(t *testing.T) {
	codexHome := t.TempDir()
	if err := os.WriteFile(filepath.Join(codexHome, "auth.json"), []byte(`{"OPENAI_API_KEY":"test"}`), 0o600); err != nil {
		t.Fatalf("write auth: %v", err)
	}
	var called atomic.Bool
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost || r.URL.Path != "/runs" {
			http.NotFound(w, r)
			return
		}
		called.Store(true)
		var req sandboxdRunRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			t.Fatalf("decode run request: %v", err)
		}
		if !req.Network || req.VCPUCount != 2 || req.MemMiB != 1024 {
			t.Fatalf("unexpected sandbox codex request: %#v", req)
		}
		if strings.Contains(req.Command, "OPENAI_API_KEY") {
			t.Fatalf("command leaked raw auth: %s", req.Command)
		}
		_ = json.NewEncoder(w).Encode(sandboxdRunResponse{
			OK:       true,
			ExitCode: 0,
			Stdout:   "codex-cli 0.141.0\nCODEX_EXIT=0\nsandbox-codex-ok\n--- codex-jsonl-tail ---\n{}",
		})
	}))
	defer server.Close()

	result := runSandboxCodex(context.Background(), options{
		sandboxdURL:    server.URL,
		sandboxImage:   "test-image",
		runtimeTimeout: time.Second,
		codexHome:      codexHome,
		codexModel:     "gpt-test",
		codexTarball:   "https://example.invalid/codex.tgz",
	}, EnvironmentWork{ID: "ewrk_test"}, "prompt")
	if !called.Load() {
		t.Fatal("sandboxd /runs was not called")
	}
	if !result.OK || result.Summary != "sandbox-codex-ok" {
		t.Fatalf("unexpected result: %#v", result)
	}
}
