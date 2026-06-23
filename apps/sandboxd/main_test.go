package main

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
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

func TestRemoveSandboxRemovesStoppedState(t *testing.T) {
	opt := options{workDir: t.TempDir()}
	state := sandboxState{
		ID:         "sbx-remove",
		Status:     "stopped",
		PID:        -1,
		WorkDir:    opt.workDir,
		SandboxDir: filepath.Join(sandboxesDir(opt), "sbx-remove"),
		StartedAt:  time.Date(2026, 6, 18, 12, 0, 0, 0, time.UTC),
	}
	if err := writeSandboxState(state); err != nil {
		t.Fatalf("writeSandboxState returned error: %v", err)
	}
	if err := os.WriteFile(filepath.Join(state.SandboxDir, "rootfs.ext4"), []byte("rootfs"), 0o644); err != nil {
		t.Fatalf("write rootfs marker: %v", err)
	}
	if err := removeSandbox(context.Background(), opt, "sbx-remove", false); err != nil {
		t.Fatalf("removeSandbox returned error: %v", err)
	}
	if _, err := os.Stat(state.SandboxDir); !os.IsNotExist(err) {
		t.Fatalf("sandbox dir still exists or unexpected error: %v", err)
	}
}

func TestRemoveSandboxRefusesRunningWithoutForce(t *testing.T) {
	opt := options{workDir: t.TempDir()}
	state := sandboxState{
		ID:         "sbx-running",
		Status:     "running",
		PID:        os.Getpid(),
		WorkDir:    opt.workDir,
		SandboxDir: filepath.Join(sandboxesDir(opt), "sbx-running"),
		StartedAt:  time.Date(2026, 6, 18, 12, 0, 0, 0, time.UTC),
	}
	if err := writeSandboxState(state); err != nil {
		t.Fatalf("writeSandboxState returned error: %v", err)
	}
	err := removeSandbox(context.Background(), opt, "sbx-running", false)
	if err == nil || !strings.Contains(err.Error(), "still running") {
		t.Fatalf("removeSandbox error = %v", err)
	}
	if _, err := os.Stat(state.SandboxDir); err != nil {
		t.Fatalf("sandbox dir should still exist: %v", err)
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
		"Wants=managed-agents-network.service",
		"After=managed-agents-network.service",
		"ExecStart=/opt/managed-agents/bin/process-api --transport tcp --tcp-addr 0.0.0.0:8080 --vsock-port 2048",
		"StandardOutput=journal+console",
		"WantedBy=multi-user.target",
	} {
		if !strings.Contains(service, want) {
			t.Fatalf("service file missing %q:\n%s", want, service)
		}
	}
}

func TestGuestCommandServiceUsesFixedRunner(t *testing.T) {
	service := guestCommandService(false)
	for _, want := range []string{
		"Description=Managed Agents One Shot Command",
		"After=local-fs.target",
		"ExecStart=/bin/sh /opt/managed-agents/run/runner.sh",
		"TimeoutStartSec=0",
		"WantedBy=multi-user.target",
	} {
		if !strings.Contains(service, want) {
			t.Fatalf("command service missing %q:\n%s", want, service)
		}
	}
	if strings.Contains(service, "%s") || strings.Contains(service, "base64 -d") {
		t.Fatalf("command service should not inline shell formatting or base64 decode:\n%s", service)
	}

	withNetwork := guestCommandService(true)
	for _, want := range []string{
		"Wants=managed-agents-network.service",
		"After=managed-agents-network.service",
	} {
		if !strings.Contains(withNetwork, want) {
			t.Fatalf("network command service missing %q:\n%s", want, withNetwork)
		}
	}
}

func TestGuestCommandRunnerScriptWritesResultAndPowersOff(t *testing.T) {
	runner := guestCommandRunnerScript()
	for _, want := range []string{
		`base64 -d "$run_dir/command.b64" >"$run_dir/command.sh"`,
		`/bin/sh "$run_dir/command.sh" >"$run_dir/stdout" 2>"$run_dir/stderr"`,
		`printf '{"exit_code":%s}\n' "$code" >"$run_dir/result.json"`,
		`systemctl poweroff --force --force || poweroff -f || true`,
	} {
		if !strings.Contains(runner, want) {
			t.Fatalf("command runner missing %q:\n%s", want, runner)
		}
	}
}

func TestGuestCommandCompletedFromConsole(t *testing.T) {
	for _, console := range []string{
		"managed-agents-command: finished exit_code=0",
		"[  1.637541] sh[468]: Powering off.",
		"[  1.913863] reboot: System halted",
	} {
		if !guestCommandCompletedFromConsole(console) {
			t.Fatalf("console was not recognized as complete: %q", console)
		}
	}
	if guestCommandCompletedFromConsole("managed-agents-command: starting") {
		t.Fatal("start-only console was recognized as complete")
	}
}

func TestManagedAgentsNetworkService(t *testing.T) {
	service := managedAgentsNetworkService(processNetwork{
		guestIP: "172.16.50.2",
		hostIP:  "172.16.50.1",
	})
	for _, want := range []string{
		"Description=Managed Agents Guest Network",
		"ip link set dev eth0 up",
		"ip addr add 172.16.50.2/30 dev eth0",
		"ip route replace default via 172.16.50.1 dev eth0",
		"nameserver 8.8.8.8",
		"WantedBy=multi-user.target",
	} {
		if !strings.Contains(service, want) {
			t.Fatalf("network service missing %q:\n%s", want, service)
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

func TestSandboxdRunOptionsEnablesGuestNetwork(t *testing.T) {
	opt := sandboxdRunOptions(options{}, sandboxdRunRequest{
		Command: "true",
		Network: true,
	})
	if !opt.guestNetwork {
		t.Fatal("guest network was not enabled")
	}
	if opt.withProcessAPI {
		t.Fatal("run options should not enable process-api for one-shot commands")
	}
}

func TestParseEnv(t *testing.T) {
	env := parseEnv([]string{"A=1", "B=two=parts", "missing", "=empty"})
	if env["A"] != "1" {
		t.Fatalf("A = %q", env["A"])
	}
	if env["B"] != "two=parts" {
		t.Fatalf("B = %q", env["B"])
	}
	if _, ok := env["missing"]; ok {
		t.Fatalf("invalid env item was included: %#v", env)
	}
	if _, ok := env[""]; ok {
		t.Fatalf("empty env key was included: %#v", env)
	}
}

func TestProcessAPIURL(t *testing.T) {
	tcp := sandboxState{
		ProcessAPI:       true,
		ProcessTransport: "tcp",
		GuestIP:          "172.16.1.2",
		ProcessTCPPort:   8080,
	}
	if got := processAPIURL(tcp, "/exec"); got != "http://172.16.1.2:8080/exec" {
		t.Fatalf("tcp URL = %q", got)
	}
	vsock := sandboxState{
		ProcessAPI:       true,
		ProcessTransport: "vsock",
		VsockPath:        "/tmp/process-api.vsock",
		ProcessPort:      1024,
	}
	if got := processAPIURL(vsock, "/healthz"); got != "http://process-api/healthz" {
		t.Fatalf("vsock URL = %q", got)
	}
}

func TestWaitForGuestProcessStatus(t *testing.T) {
	var calls int
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		calls++
		status := "running"
		if calls >= 2 {
			status = "exited"
		}
		_ = json.NewEncoder(w).Encode(processAPIProcessResponse{
			ID:       "proc-1",
			Status:   status,
			ExitCode: 0,
			Stdout:   "done",
		})
	}))
	defer server.Close()
	state := sandboxState{
		ID:               "sbx-test",
		ProcessAPI:       true,
		ProcessTransport: "tcp",
		GuestIP:          strings.TrimPrefix(server.URL, "http://"),
		ProcessTCPPort:   80,
	}
	host, port, _ := strings.Cut(state.GuestIP, ":")
	state.GuestIP = host
	if port != "" {
		state.ProcessTCPPort = 0
		fmt.Sscanf(port, "%d", &state.ProcessTCPPort)
	}
	process, err := waitForGuestProcessStatus(context.Background(), state, "proc-1", "exited", time.Second)
	if err != nil {
		t.Fatalf("waitForGuestProcessStatus returned error: %v", err)
	}
	if process.Status != "exited" || calls < 2 {
		t.Fatalf("unexpected process/calls: %#v %d", process, calls)
	}
}

func TestSandboxdHTTPHandlerStatusStopAndRemove(t *testing.T) {
	opt := options{workDir: t.TempDir()}
	state := sandboxState{
		ID:         "sbx-http",
		Image:      "firecracker-ci-ubuntu-22.04",
		Status:     "running",
		PID:        -1,
		WorkDir:    opt.workDir,
		SandboxDir: filepath.Join(sandboxesDir(opt), "sbx-http"),
		StartedAt:  time.Date(2026, 6, 18, 12, 0, 0, 0, time.UTC),
	}
	if err := writeSandboxState(state); err != nil {
		t.Fatalf("writeSandboxState returned error: %v", err)
	}
	server := httptest.NewServer(sandboxdHTTPHandler(opt))
	defer server.Close()

	resp, err := http.Get(server.URL + "/healthz")
	if err != nil {
		t.Fatalf("GET /healthz returned error: %v", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("GET /healthz status = %d", resp.StatusCode)
	}
	var health sandboxdHealth
	if err := json.NewDecoder(resp.Body).Decode(&health); err != nil {
		t.Fatalf("decode health: %v", err)
	}
	if !health.OK || health.Service != "sandboxd" {
		t.Fatalf("unexpected health response: %#v", health)
	}

	resp, err = http.Get(server.URL + "/sandboxes")
	if err != nil {
		t.Fatalf("GET /sandboxes returned error: %v", err)
	}
	defer resp.Body.Close()
	var states []sandboxState
	if err := json.NewDecoder(resp.Body).Decode(&states); err != nil {
		t.Fatalf("decode sandbox list: %v", err)
	}
	if len(states) != 1 || states[0].ID != "sbx-http" {
		t.Fatalf("unexpected sandbox list: %#v", states)
	}

	req, err := http.NewRequest(http.MethodPost, server.URL+"/sandboxes/sbx-http/stop", nil)
	if err != nil {
		t.Fatalf("new stop request: %v", err)
	}
	resp, err = http.DefaultClient.Do(req)
	if err != nil {
		t.Fatalf("POST stop returned error: %v", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("POST stop status = %d", resp.StatusCode)
	}
	var stopped sandboxState
	if err := json.NewDecoder(resp.Body).Decode(&stopped); err != nil {
		t.Fatalf("decode stopped state: %v", err)
	}
	if stopped.Status != "stopped" {
		t.Fatalf("stopped status = %q", stopped.Status)
	}

	req, err = http.NewRequest(http.MethodDelete, server.URL+"/sandboxes/sbx-http", nil)
	if err != nil {
		t.Fatalf("new delete request: %v", err)
	}
	resp, err = http.DefaultClient.Do(req)
	if err != nil {
		t.Fatalf("DELETE sandbox returned error: %v", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("DELETE sandbox status = %d", resp.StatusCode)
	}
	if _, err := os.Stat(state.SandboxDir); !os.IsNotExist(err) {
		t.Fatalf("sandbox dir still exists or unexpected error: %v", err)
	}
}

func TestSandboxdHTTPHandlerProcessAPIProxy(t *testing.T) {
	processServer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch {
		case r.Method == http.MethodPost && r.URL.Path == "/exec":
			var req processAPIExecRequest
			if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
				t.Fatalf("decode exec request: %v", err)
			}
			_ = json.NewEncoder(w).Encode(processAPIExecResponse{
				OK:       true,
				Argv:     req.Argv,
				Cwd:      req.Cwd,
				ExitCode: 0,
				Stdout:   "exec-ok",
			})
		case r.Method == http.MethodPost && r.URL.Path == "/processes":
			_ = json.NewEncoder(w).Encode(processAPIProcessResponse{
				ID:       "proc-1",
				Status:   "running",
				PID:      123,
				ExitCode: 0,
			})
		case r.Method == http.MethodGet && r.URL.Path == "/processes/proc-1":
			_ = json.NewEncoder(w).Encode(processAPIProcessResponse{
				ID:       "proc-1",
				Status:   "exited",
				ExitCode: 0,
				Stdout:   "done",
			})
		case r.Method == http.MethodPost && r.URL.Path == "/processes/proc-1/signal":
			_ = json.NewEncoder(w).Encode(processAPIProcessResponse{
				ID:       "proc-1",
				Status:   "exited",
				ExitCode: 143,
			})
		default:
			http.NotFound(w, r)
		}
	}))
	defer processServer.Close()

	hostPort := strings.TrimPrefix(processServer.URL, "http://")
	host, port, _ := strings.Cut(hostPort, ":")
	var tcpPort uint32
	if _, err := fmt.Sscanf(port, "%d", &tcpPort); err != nil {
		t.Fatalf("parse test server port: %v", err)
	}

	opt := options{workDir: t.TempDir()}
	state := sandboxState{
		ID:               "sbx-proxy",
		Image:            "firecracker-ci-ubuntu-22.04",
		Status:           "running",
		PID:              -1,
		WorkDir:          opt.workDir,
		SandboxDir:       filepath.Join(sandboxesDir(opt), "sbx-proxy"),
		ProcessAPI:       true,
		ProcessTransport: "tcp",
		GuestIP:          host,
		ProcessTCPPort:   tcpPort,
		StartedAt:        time.Date(2026, 6, 18, 12, 0, 0, 0, time.UTC),
	}
	if err := writeSandboxState(state); err != nil {
		t.Fatalf("writeSandboxState returned error: %v", err)
	}
	server := httptest.NewServer(sandboxdHTTPHandler(opt))
	defer server.Close()

	body := strings.NewReader(`{"argv":["/bin/echo","ok"],"cwd":"/tmp"}`)
	resp, err := http.Post(server.URL+"/sandboxes/sbx-proxy/exec", "application/json", body)
	if err != nil {
		t.Fatalf("POST exec returned error: %v", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("POST exec status = %d", resp.StatusCode)
	}
	var execResp processAPIExecResponse
	if err := json.NewDecoder(resp.Body).Decode(&execResp); err != nil {
		t.Fatalf("decode exec response: %v", err)
	}
	if !execResp.OK || execResp.Stdout != "exec-ok" || execResp.Cwd != "/tmp" {
		t.Fatalf("unexpected exec response: %#v", execResp)
	}

	resp, err = http.Post(server.URL+"/sandboxes/sbx-proxy/processes", "application/json", strings.NewReader(`{"argv":["/bin/sleep","1"]}`))
	if err != nil {
		t.Fatalf("POST processes returned error: %v", err)
	}
	defer resp.Body.Close()
	var process processAPIProcessResponse
	if err := json.NewDecoder(resp.Body).Decode(&process); err != nil {
		t.Fatalf("decode process start: %v", err)
	}
	if process.ID != "proc-1" || process.Status != "running" {
		t.Fatalf("unexpected process start: %#v", process)
	}

	resp, err = http.Get(server.URL + "/sandboxes/sbx-proxy/processes/proc-1")
	if err != nil {
		t.Fatalf("GET process returned error: %v", err)
	}
	defer resp.Body.Close()
	if err := json.NewDecoder(resp.Body).Decode(&process); err != nil {
		t.Fatalf("decode process status: %v", err)
	}
	if process.Status != "exited" || process.Stdout != "done" {
		t.Fatalf("unexpected process status: %#v", process)
	}

	req, err := http.NewRequest(http.MethodPost, server.URL+"/sandboxes/sbx-proxy/processes/proc-1/signal", strings.NewReader(`{"signal":"TERM"}`))
	if err != nil {
		t.Fatalf("new signal request: %v", err)
	}
	req.Header.Set("Content-Type", "application/json")
	resp, err = http.DefaultClient.Do(req)
	if err != nil {
		t.Fatalf("POST signal returned error: %v", err)
	}
	defer resp.Body.Close()
	if err := json.NewDecoder(resp.Body).Decode(&process); err != nil {
		t.Fatalf("decode signal response: %v", err)
	}
	if process.ExitCode != 143 {
		t.Fatalf("unexpected signal response: %#v", process)
	}
}

func TestSandboxdStartOptions(t *testing.T) {
	wait := false
	base := options{
		image:               "base-image",
		vcpuCount:           1,
		memMiB:              256,
		timeout:             90 * time.Second,
		processAPIBin:       "/default/process-api",
		processAPITransport: "tcp",
		processAPIPort:      1024,
		processAPITCPPort:   8080,
		vsockCID:            3,
	}
	got := sandboxdStartOptions(base, sandboxdStartRequest{
		Image:               "custom-image",
		VCPUCount:           2,
		MemMiB:              512,
		Wait:                &wait,
		ProcessAPI:          true,
		ProcessAPIBin:       "/custom/process-api",
		ProcessAPITransport: "vsock",
		ProcessAPIPort:      2048,
		ProcessAPITCPPort:   9090,
		VsockCID:            4,
		TimeoutMillis:       1234,
	})
	if got.image != "custom-image" || got.vcpuCount != 2 || got.memMiB != 512 {
		t.Fatalf("resource overrides not applied: %#v", got)
	}
	if got.waitForBoot || !got.withProcessAPI {
		t.Fatalf("wait/process-api overrides not applied: %#v", got)
	}
	if got.processAPIBin != "/custom/process-api" || got.processAPITransport != "vsock" {
		t.Fatalf("process-api overrides not applied: %#v", got)
	}
	if got.processAPIPort != 2048 || got.processAPITCPPort != 9090 || got.vsockCID != 4 {
		t.Fatalf("process-api port overrides not applied: %#v", got)
	}
	if got.timeout != 1234*time.Millisecond {
		t.Fatalf("timeout = %s", got.timeout)
	}
}

func TestNormalizeBackend(t *testing.T) {
	for _, value := range []string{"", "firecracker", "FIRECRACKER"} {
		got, err := normalizeBackend(value)
		if err != nil {
			t.Fatalf("normalizeBackend(%q) returned error: %v", value, err)
		}
		if got != backendFirecracker {
			t.Fatalf("normalizeBackend(%q) = %q", value, got)
		}
	}
	got, err := normalizeBackend("docker")
	if err != nil {
		t.Fatalf("normalizeBackend(docker) returned error: %v", err)
	}
	if got != backendDocker {
		t.Fatalf("normalizeBackend(docker) = %q", got)
	}
	if _, err := normalizeBackend("unknown"); err == nil {
		t.Fatal("normalizeBackend accepted an unknown backend")
	}
}

func TestRunDockerSandboxCommandUsesTemporaryContainer(t *testing.T) {
	fakeDocker, logPath := writeFakeDocker(t)
	opt := options{
		backend:   backendDocker,
		dockerBin: fakeDocker,
		workDir:   t.TempDir(),
		image:     "managed-agents/docker-template:test",
		timeout:   time.Second,
	}
	result, err := runSandboxCommand(context.Background(), opt, sandboxdRunRequest{
		ID:      "sbx-docker-run",
		Command: "printf docker-ok",
		Network: false,
	})
	if err != nil {
		t.Fatalf("runSandboxCommand returned error: %v", err)
	}
	if !result.OK || result.Stdout != "fake-run-out\n" || result.Sandbox.Backend != backendDocker {
		t.Fatalf("unexpected docker run result: %#v", result)
	}
	logData, err := os.ReadFile(logPath)
	if err != nil {
		t.Fatalf("read fake docker log: %v", err)
	}
	log := string(logData)
	for _, want := range []string{
		"run --rm --name managed-agents-sbx-docker-run",
		"--network none",
		"managed-agents/docker-template:test /bin/sh -c printf docker-ok",
		"rm -f managed-agents-sbx-docker-run",
	} {
		if !strings.Contains(log, want) {
			t.Fatalf("fake docker log missing %q:\n%s", want, log)
		}
	}
	if _, err := os.Stat(filepath.Join(opt.workDir, "sandboxes", "sbx-docker-run")); !os.IsNotExist(err) {
		t.Fatalf("one-shot docker sandbox directory should be removed, err=%v", err)
	}
}

func TestDockerSandboxLifecycleExecAndStop(t *testing.T) {
	fakeDocker, logPath := writeFakeDocker(t)
	opt := options{
		backend:   backendDocker,
		dockerBin: fakeDocker,
		workDir:   t.TempDir(),
		image:     "managed-agents/docker-template:test",
	}
	state, err := startSandbox(context.Background(), opt, "sbx-docker-life")
	if err != nil {
		t.Fatalf("startSandbox returned error: %v", err)
	}
	if state.Backend != backendDocker || state.ContainerID != "fake-container-id" || !state.Booted {
		t.Fatalf("unexpected docker state: %#v", state)
	}
	execResp, err := execDockerSandbox(context.Background(), opt, state, processAPIExecRequest{
		Argv: []string{"/bin/sh", "-c", "printf exec-ok"},
		Env:  map[string]string{"A": "1"},
	})
	if err != nil {
		t.Fatalf("execDockerSandbox returned error: %v", err)
	}
	if !execResp.OK || execResp.Stdout != "fake-exec-out\n" {
		t.Fatalf("unexpected docker exec response: %#v", execResp)
	}
	stopped, err := stopSandbox(context.Background(), opt, state.ID)
	if err != nil {
		t.Fatalf("stopSandbox returned error: %v", err)
	}
	if stopped.Status != "stopped" {
		t.Fatalf("stopped status = %q", stopped.Status)
	}
	if err := removeSandbox(context.Background(), opt, state.ID, true); err != nil {
		t.Fatalf("removeSandbox returned error: %v", err)
	}
	logData, err := os.ReadFile(logPath)
	if err != nil {
		t.Fatalf("read fake docker log: %v", err)
	}
	log := string(logData)
	for _, want := range []string{
		"run -d --name managed-agents-sbx-docker-life",
		"exec -w /workspace -e A=1 fake-container-id /bin/sh -c printf exec-ok",
		"rm -f fake-container-id",
	} {
		if !strings.Contains(log, want) {
			t.Fatalf("fake docker log missing %q:\n%s", want, log)
		}
	}
}

func writeFakeDocker(t *testing.T) (string, string) {
	t.Helper()
	dir := t.TempDir()
	logPath := filepath.Join(dir, "docker.log")
	path := filepath.Join(dir, "docker")
	script := fmt.Sprintf(`#!/bin/sh
set -eu
printf '%%s\n' "$*" >>%s
case "$1" in
  rm)
    exit 0
    ;;
  inspect)
    printf 'true\n'
    ;;
  run)
    if [ "$2" = "-d" ]; then
      printf 'fake-container-id\n'
    else
      printf 'fake-run-out\n'
    fi
    ;;
  exec)
    printf 'fake-exec-out\n'
    ;;
  *)
    printf 'unsupported fake docker command: %%s\n' "$1" >&2
    exit 2
    ;;
esac
`, shellQuote(logPath))
	if err := os.WriteFile(path, []byte(script), 0o755); err != nil {
		t.Fatalf("write fake docker: %v", err)
	}
	return path, logPath
}
