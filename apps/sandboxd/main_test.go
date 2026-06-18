package main

import (
	"path/filepath"
	"strings"
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
		ProcessAPI:  true,
		ProcessPort: 1024,
		VsockCID:    3,
		VsockPath:   filepath.Join(sandboxesDir(opt), "sbx-test", "process-api.vsock"),
		ProcessBin:  "/opt/managed-agents/bin/process-api",
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
	if !read.ProcessAPI || read.ProcessPort != 1024 || read.VsockCID != 3 {
		t.Fatalf("process-api state mismatch: %#v", read)
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

func TestProcessAPIService(t *testing.T) {
	service := processAPIService(options{
		processAPITransport: "tcp",
		processAPITCPPort:   8080,
		processAPIPort:      2048,
	})
	for _, want := range []string{
		"Description=Managed Agents Process API",
		"ExecStart=/opt/managed-agents/bin/process-api --transport tcp --tcp-addr 0.0.0.0:8080 --vsock-port 2048",
		"StandardOutput=journal+console",
		"WantedBy=multi-user.target",
	} {
		if !strings.Contains(service, want) {
			t.Fatalf("service file missing %q:\n%s", want, service)
		}
	}
}

func TestProcessNetworkForSandbox(t *testing.T) {
	network := processNetworkForSandbox("sbx-test")
	if network.tapName == "" || len(network.tapName) > 15 {
		t.Fatalf("invalid tap name: %q", network.tapName)
	}
	if !strings.HasPrefix(network.hostIP, "172.16.") || !strings.HasSuffix(network.hostIP, ".1") {
		t.Fatalf("unexpected host IP: %q", network.hostIP)
	}
	if !strings.HasPrefix(network.guestIP, "172.16.") || !strings.HasSuffix(network.guestIP, ".2") {
		t.Fatalf("unexpected guest IP: %q", network.guestIP)
	}
	if !strings.HasPrefix(network.guestMAC, "06:00:ac:10:") || !strings.HasSuffix(network.guestMAC, ":02") {
		t.Fatalf("unexpected guest MAC: %q", network.guestMAC)
	}
}
