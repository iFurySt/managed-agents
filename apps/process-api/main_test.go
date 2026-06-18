package main

import (
	"context"
	"strings"
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
