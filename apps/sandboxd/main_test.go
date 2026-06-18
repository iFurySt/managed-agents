package main

import (
	"path/filepath"
	"testing"
	"time"
)

func TestResolveImageAliases(t *testing.T) {
	for _, name := range []string{"", "ubuntu-22.04", "firecracker-ci-ubuntu-22.04"} {
		image, err := resolveImage(name)
		if err != nil {
			t.Fatalf("resolveImage(%q) returned error: %v", name, err)
		}
		if image.name != "firecracker-ci-ubuntu-22.04" {
			t.Fatalf("resolveImage(%q) name = %q", name, image.name)
		}
		if image.rootfsVersion != "22.04" {
			t.Fatalf("resolveImage(%q) rootfsVersion = %q", name, image.rootfsVersion)
		}
	}
	if _, err := resolveImage("unknown"); err == nil {
		t.Fatal("resolveImage accepted an unsupported image")
	}
}

func TestValidateSandboxID(t *testing.T) {
	for _, id := range []string{"sbx-1", "session_01", "sandbox.dev"} {
		if err := validateSandboxID(id); err != nil {
			t.Fatalf("validateSandboxID(%q) returned error: %v", id, err)
		}
	}
	for _, id := range []string{"", "../escape", "bad/id", "-starts-with-dash"} {
		if err := validateSandboxID(id); err == nil {
			t.Fatalf("validateSandboxID(%q) accepted invalid id", id)
		}
	}
}

func TestSandboxStateRoundTripAndList(t *testing.T) {
	opt := options{workDir: t.TempDir()}
	state := sandboxState{
		ID:          "sbx-test",
		Image:       "firecracker-ci-ubuntu-22.04",
		Status:      "running",
		Booted:      true,
		PID:         -1,
		VCPUCount:   1,
		MemMiB:      256,
		WorkDir:     opt.workDir,
		SandboxDir:  filepath.Join(sandboxesDir(opt), "sbx-test"),
		SocketPath:  filepath.Join(sandboxesDir(opt), "sbx-test", "firecracker.socket"),
		ConsolePath: filepath.Join(sandboxesDir(opt), "sbx-test", "console.log"),
		LogPath:     filepath.Join(sandboxesDir(opt), "sbx-test", "firecracker.log"),
		KernelPath:  filepath.Join(opt.workDir, "vmlinux"),
		RootfsPath:  filepath.Join(sandboxesDir(opt), "sbx-test", "rootfs.ext4"),
		BaseRootfs:  filepath.Join(opt.workDir, "ubuntu.ext4"),
		StartedAt:   time.Date(2026, 6, 18, 12, 0, 0, 0, time.UTC),
	}
	if err := writeSandboxState(state); err != nil {
		t.Fatalf("writeSandboxState returned error: %v", err)
	}
	read, err := readSandboxState(opt, "sbx-test")
	if err != nil {
		t.Fatalf("readSandboxState returned error: %v", err)
	}
	if read.ID != state.ID || read.Image != state.Image || !read.Booted {
		t.Fatalf("read state mismatch: %#v", read)
	}
	states, err := listSandboxes(opt)
	if err != nil {
		t.Fatalf("listSandboxes returned error: %v", err)
	}
	if len(states) != 1 || states[0].ID != "sbx-test" {
		t.Fatalf("unexpected sandbox list: %#v", states)
	}
	refreshed := refreshSandboxStatus(read)
	if refreshed.Status != "exited" {
		t.Fatalf("refreshSandboxStatus status = %q", refreshed.Status)
	}
}
