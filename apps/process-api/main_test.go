package main

import (
	"context"
	"strings"
	"syscall"
	"testing"
	"time"
)

func TestRunExecSuccess(t *testing.T) {
	resp := runExec(context.Background(), execRequest{
		Argv: []string{"/bin/sh", "-c", "printf hello"},
		Cwd:  "/",
	})
	if !resp.OK {
		t.Fatalf("runExec returned non-ok response: %#v", resp)
	}
	if resp.ExitCode != 0 {
		t.Fatalf("exit code = %d", resp.ExitCode)
	}
	if resp.Stdout != "hello" {
		t.Fatalf("stdout = %q", resp.Stdout)
	}
}

func TestRunExecCapturesFailure(t *testing.T) {
	resp := runExec(context.Background(), execRequest{
		Argv: []string{"/bin/sh", "-c", "echo bad >&2; exit 7"},
	})
	if resp.OK {
		t.Fatalf("runExec returned ok for failing command: %#v", resp)
	}
	if resp.ExitCode != 7 {
		t.Fatalf("exit code = %d", resp.ExitCode)
	}
	if resp.Stderr != "bad\n" {
		t.Fatalf("stderr = %q", resp.Stderr)
	}
}

func TestRunExecTimeout(t *testing.T) {
	resp := runExec(context.Background(), execRequest{
		Argv:          []string{"/bin/sh", "-c", "sleep 2"},
		TimeoutMillis: 10,
	})
	if !resp.TimedOut {
		t.Fatalf("expected timeout response: %#v", resp)
	}
	if resp.ExitCode != -1 {
		t.Fatalf("exit code = %d", resp.ExitCode)
	}
	if resp.DurationMillis > int64(time.Second/time.Millisecond) {
		t.Fatalf("timeout took too long: %#v", resp)
	}
}

func TestMergeEnvOverrides(t *testing.T) {
	env := mergeEnv([]string{"A=1", "B=2"}, map[string]string{"B": "3", "C": "4"})
	got := map[string]string{}
	for _, item := range env {
		key, value, _ := strings.Cut(item, "=")
		got[key] = value
	}
	if got["A"] != "1" || got["B"] != "3" || got["C"] != "4" {
		t.Fatalf("unexpected env: %#v", got)
	}
}

func TestProcessManagerStartAndStatus(t *testing.T) {
	manager := newProcessManager()
	process, err := manager.start(context.Background(), execRequest{
		Argv: []string{"/bin/sh", "-c", "printf begin; sleep 0.1; printf done"},
	})
	if err != nil {
		t.Fatalf("start returned error: %v", err)
	}
	if process.id == "" {
		t.Fatal("process id is empty")
	}
	first := process.snapshot()
	if first.Status != "running" {
		t.Fatalf("initial status = %q", first.Status)
	}
	final := waitForProcessStatus(t, process, "exited")
	if final.ExitCode != 0 {
		t.Fatalf("exit code = %d", final.ExitCode)
	}
	if final.Stdout != "begindone" {
		t.Fatalf("stdout = %q", final.Stdout)
	}
	if got, ok := manager.get(process.id); !ok || got != process {
		t.Fatalf("manager lookup failed: %v %#v", ok, got)
	}
}

func TestProcessManagerSignal(t *testing.T) {
	manager := newProcessManager()
	process, err := manager.start(context.Background(), execRequest{
		Argv: []string{"/bin/sh", "-c", "trap 'echo term; exit 42' TERM; sleep 10"},
	})
	if err != nil {
		t.Fatalf("start returned error: %v", err)
	}
	if err := process.signal(syscall.SIGTERM); err != nil {
		t.Fatalf("signal returned error: %v", err)
	}
	final := waitForAnyProcessStatus(t, process, []string{"exited", "timed_out"})
	if final.Status != "exited" {
		t.Fatalf("status = %q", final.Status)
	}
	if final.ExitCode == 0 {
		t.Fatalf("expected non-zero exit after signal: %#v", final)
	}
}

func TestParseSignal(t *testing.T) {
	for _, value := range []string{"TERM", "SIGTERM", ""} {
		if _, err := parseSignal(value); err != nil {
			t.Fatalf("parseSignal(%q) returned error: %v", value, err)
		}
	}
	if _, err := parseSignal("NOPE"); err == nil {
		t.Fatal("parseSignal accepted unsupported signal")
	}
}

func waitForProcessStatus(t *testing.T, process *managedProcess, status string) processResponse {
	t.Helper()
	return waitForAnyProcessStatus(t, process, []string{status})
}

func waitForAnyProcessStatus(t *testing.T, process *managedProcess, statuses []string) processResponse {
	t.Helper()
	deadline := time.Now().Add(2 * time.Second)
	for time.Now().Before(deadline) {
		snapshot := process.snapshot()
		for _, status := range statuses {
			if snapshot.Status == status {
				return snapshot
			}
		}
		time.Sleep(10 * time.Millisecond)
	}
	t.Fatalf("process did not reach status %v; last=%#v", statuses, process.snapshot())
	return processResponse{}
}
