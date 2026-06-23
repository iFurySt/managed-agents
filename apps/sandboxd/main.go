package main

import (
	"archive/tar"
	"bufio"
	"bytes"
	"compress/gzip"
	"context"
	"encoding/base64"
	"encoding/json"
	"encoding/xml"
	"errors"
	"fmt"
	"hash/fnv"
	"io"
	"net"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"runtime"
	"sort"
	"strings"
	"syscall"
	"time"

	"github.com/spf13/cobra"
)

const ciArtifactBucket = "https://s3.amazonaws.com/spec.ccfc.min"

const (
	backendFirecracker = "firecracker"
	backendDocker      = "docker"
)

type options struct {
	backend             string
	workDir             string
	firecrackerVersion  string
	dockerBin           string
	image               string
	vcpuCount           int
	memMiB              int
	timeout             time.Duration
	useSudo             bool
	keepAlive           bool
	waitForBoot         bool
	withProcessAPI      bool
	processAPIBin       string
	processAPITransport string
	processAPIPort      uint32
	processAPITCPPort   uint32
	execCwd             string
	execEnv             []string
	execTimeout         time.Duration
	processSignal       string
	forceRemove         bool
	vsockCID            uint32
	listenAddr          string
	guestCommand        string
	guestNetwork        bool
}

type listBucketResult struct {
	CommonPrefixes []struct {
		Prefix string `xml:"Prefix"`
	} `xml:"CommonPrefixes"`
	Contents []struct {
		Key string `xml:"Key"`
	} `xml:"Contents"`
}

type assets struct {
	firecracker string
	kernel      string
	rootfs      string
	image       string
	prefix      string
	rootfsKey   string
	kernelKey   string
}

type imageSpec struct {
	name          string
	rootfsVersion string
}

type sandboxState struct {
	ID               string    `json:"id"`
	Backend          string    `json:"backend"`
	Image            string    `json:"image"`
	Status           string    `json:"status"`
	Booted           bool      `json:"booted"`
	PID              int       `json:"pid"`
	VCPUCount        int       `json:"vcpu_count"`
	MemMiB           int       `json:"mem_mib"`
	WorkDir          string    `json:"work_dir"`
	SandboxDir       string    `json:"sandbox_dir"`
	SocketPath       string    `json:"socket_path"`
	ConsolePath      string    `json:"console_path"`
	LogPath          string    `json:"log_path"`
	KernelPath       string    `json:"kernel_path"`
	RootfsPath       string    `json:"rootfs_path"`
	BaseRootfs       string    `json:"base_rootfs"`
	Firecracker      string    `json:"firecracker"`
	ContainerID      string    `json:"container_id,omitempty"`
	ContainerName    string    `json:"container_name,omitempty"`
	WorkspacePath    string    `json:"workspace_path,omitempty"`
	ProcessAPI       bool      `json:"process_api"`
	ProcessTransport string    `json:"process_transport,omitempty"`
	ProcessPort      uint32    `json:"process_port,omitempty"`
	ProcessTCPPort   uint32    `json:"process_tcp_port,omitempty"`
	VsockCID         uint32    `json:"vsock_cid,omitempty"`
	VsockPath        string    `json:"vsock_path,omitempty"`
	TapName          string    `json:"tap_name,omitempty"`
	HostIP           string    `json:"host_ip,omitempty"`
	GuestIP          string    `json:"guest_ip,omitempty"`
	GuestMAC         string    `json:"guest_mac,omitempty"`
	ProcessBin       string    `json:"process_bin,omitempty"`
	StartedAt        time.Time `json:"started_at"`
	StoppedAt        time.Time `json:"stopped_at,omitempty"`
}

type processAPIHealth struct {
	OK        bool   `json:"ok"`
	Service   string `json:"service"`
	Version   string `json:"version"`
	OS        string `json:"os"`
	Arch      string `json:"arch"`
	PID       int    `json:"pid"`
	Timestamp string `json:"timestamp"`
}

type processAPIExecRequest struct {
	Argv          []string          `json:"argv"`
	Cwd           string            `json:"cwd,omitempty"`
	Env           map[string]string `json:"env,omitempty"`
	TimeoutMillis int64             `json:"timeout_millis,omitempty"`
}

type processAPIExecResponse struct {
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

type processAPIProcessRequest processAPIExecRequest

type processAPISignalRequest struct {
	Signal string `json:"signal"`
}

type processAPIProcessResponse struct {
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

type processNetwork struct {
	tapName  string
	hostIP   string
	guestIP  string
	guestMAC string
}

type sandboxdStartRequest struct {
	ID                  string `json:"id,omitempty"`
	Image               string `json:"image,omitempty"`
	VCPUCount           int    `json:"vcpu_count,omitempty"`
	MemMiB              int    `json:"mem_mib,omitempty"`
	Wait                *bool  `json:"wait,omitempty"`
	ProcessAPI          bool   `json:"process_api,omitempty"`
	ProcessAPIBin       string `json:"process_api_bin,omitempty"`
	ProcessAPITransport string `json:"process_api_transport,omitempty"`
	ProcessAPIPort      uint32 `json:"process_api_port,omitempty"`
	ProcessAPITCPPort   uint32 `json:"process_api_tcp_port,omitempty"`
	VsockCID            uint32 `json:"vsock_cid,omitempty"`
	TimeoutMillis       int64  `json:"timeout_millis,omitempty"`
}

type sandboxdRunRequest struct {
	ID            string `json:"id,omitempty"`
	Image         string `json:"image,omitempty"`
	VCPUCount     int    `json:"vcpu_count,omitempty"`
	MemMiB        int    `json:"mem_mib,omitempty"`
	Command       string `json:"command"`
	Network       bool   `json:"network,omitempty"`
	TimeoutMillis int64  `json:"timeout_millis,omitempty"`
}

type sandboxdRunResponse struct {
	ID             string       `json:"id"`
	OK             bool         `json:"ok"`
	ExitCode       int          `json:"exit_code"`
	Stdout         string       `json:"stdout"`
	Stderr         string       `json:"stderr"`
	Error          string       `json:"error,omitempty"`
	TimedOut       bool         `json:"timed_out"`
	DurationMillis int64        `json:"duration_millis"`
	Sandbox        sandboxState `json:"sandbox"`
}

type sandboxdHealth struct {
	OK        bool   `json:"ok"`
	Service   string `json:"service"`
	Version   string `json:"version"`
	Timestamp string `json:"timestamp"`
}

func main() {
	var opt options
	root := &cobra.Command{
		Use:   "sandboxd",
		Short: "Run and inspect local sandboxes",
	}
	root.PersistentFlags().StringVar(&opt.backend, "backend", env("SANDBOXD_BACKEND", backendFirecracker), "sandbox backend: firecracker or docker")
	root.PersistentFlags().StringVar(&opt.workDir, "work-dir", "/opt/managed-agents/firecracker", "workspace for sandbox assets and temporary workspaces")
	root.PersistentFlags().StringVar(&opt.firecrackerVersion, "firecracker-version", "latest", "Firecracker release tag or latest")
	root.PersistentFlags().StringVar(&opt.dockerBin, "docker-bin", env("DOCKER_BIN", "docker"), "Docker CLI binary used by the docker backend")
	root.PersistentFlags().StringVar(&opt.image, "image", env("SANDBOXD_IMAGE", "firecracker-ci-ubuntu-22.04"), "sandbox image to pull or boot")
	root.PersistentFlags().BoolVar(&opt.useSudo, "sudo", true, "run host operations that need KVM/root privileges through sudo")

	root.AddCommand(&cobra.Command{
		Use:   "doctor",
		Short: "Check host prerequisites for Firecracker",
		RunE: func(cmd *cobra.Command, args []string) error {
			return doctor(cmd.Context(), opt)
		},
	})

	root.AddCommand(&cobra.Command{
		Use:   "prepare",
		Short: "Download Firecracker and guest kernel/rootfs assets",
		RunE: func(cmd *cobra.Command, args []string) error {
			_, err := prepareAssets(cmd.Context(), opt)
			return err
		},
	})
	root.AddCommand(&cobra.Command{
		Use:   "pull",
		Short: "Pull the configured microVM image into the local cache",
		RunE: func(cmd *cobra.Command, args []string) error {
			_, err := prepareAssets(cmd.Context(), opt)
			return err
		},
	})

	smoke := &cobra.Command{
		Use:   "smoke",
		Short: "Boot a tiny Firecracker microVM and verify the serial console",
		RunE: func(cmd *cobra.Command, args []string) error {
			return smoke(cmd.Context(), opt)
		},
	}
	smoke.Flags().IntVar(&opt.vcpuCount, "vcpu", 1, "microVM vCPU count")
	smoke.Flags().IntVar(&opt.memMiB, "mem-mib", 256, "microVM memory size in MiB")
	smoke.Flags().DurationVar(&opt.timeout, "timeout", 90*time.Second, "time to wait for guest boot signals")
	smoke.Flags().BoolVar(&opt.keepAlive, "keep-alive", false, "leave the Firecracker process running after validation")
	root.AddCommand(smoke)

	verify := &cobra.Command{
		Use:          "verify",
		Short:        "Run the full sandbox and process-api lifecycle verifier",
		SilenceUsage: true,
		RunE: func(cmd *cobra.Command, args []string) error {
			return verifyLifecycle(cmd.Context(), opt)
		},
	}
	verify.Flags().IntVar(&opt.vcpuCount, "vcpu", 1, "microVM vCPU count")
	verify.Flags().IntVar(&opt.memMiB, "mem-mib", 256, "microVM memory size in MiB")
	verify.Flags().DurationVar(&opt.timeout, "timeout", 150*time.Second, "time to wait for guest boot and process-api readiness")
	verify.Flags().StringVar(&opt.processAPIBin, "process-api-bin", "/opt/managed-agents/bin/process-api", "Linux process-api binary to inject into the guest rootfs")
	verify.Flags().StringVar(&opt.processAPITransport, "process-api-transport", "tcp", "process-api transport: tcp or vsock")
	verify.Flags().Uint32Var(&opt.processAPIPort, "process-api-port", 1024, "guest AF_VSOCK port for process-api")
	verify.Flags().Uint32Var(&opt.processAPITCPPort, "process-api-tcp-port", 8080, "guest TCP port for process-api")
	verify.Flags().Uint32Var(&opt.vsockCID, "vsock-cid", 3, "Firecracker guest CID for the sandbox vsock device")
	root.AddCommand(verify)

	serve := &cobra.Command{
		Use:          "serve",
		Short:        "Run the host-local sandboxd HTTP API",
		SilenceUsage: true,
		RunE: func(cmd *cobra.Command, args []string) error {
			return serveSandboxd(cmd.Context(), opt)
		},
	}
	serve.Flags().StringVar(&opt.listenAddr, "listen", "127.0.0.1:8787", "host-local HTTP listen address")
	serve.Flags().IntVar(&opt.vcpuCount, "vcpu", 1, "default microVM vCPU count")
	serve.Flags().IntVar(&opt.memMiB, "mem-mib", 256, "default microVM memory size in MiB")
	serve.Flags().DurationVar(&opt.timeout, "timeout", 90*time.Second, "default time to wait for guest boot signals")
	serve.Flags().StringVar(&opt.processAPIBin, "process-api-bin", "/opt/managed-agents/bin/process-api", "default Linux process-api binary to inject into the guest rootfs")
	serve.Flags().StringVar(&opt.processAPITransport, "process-api-transport", "tcp", "default process-api transport: tcp or vsock")
	serve.Flags().Uint32Var(&opt.processAPIPort, "process-api-port", 1024, "default guest AF_VSOCK port for process-api")
	serve.Flags().Uint32Var(&opt.processAPITCPPort, "process-api-tcp-port", 8080, "default guest TCP port for process-api")
	serve.Flags().Uint32Var(&opt.vsockCID, "vsock-cid", 3, "default Firecracker guest CID for the sandbox vsock device")
	root.AddCommand(serve)

	sandbox := &cobra.Command{
		Use:   "sandbox",
		Short: "Manage local Firecracker sandbox lifecycles",
	}
	start := &cobra.Command{
		Use:   "start [sandbox-id]",
		Short: "Start a Firecracker sandbox from the configured image",
		Args:  cobra.MaximumNArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			id := ""
			if len(args) > 0 {
				id = args[0]
			}
			state, err := startSandbox(cmd.Context(), opt, id)
			if err != nil {
				return err
			}
			printSandboxState(state)
			return nil
		},
	}
	start.Flags().IntVar(&opt.vcpuCount, "vcpu", 1, "microVM vCPU count")
	start.Flags().IntVar(&opt.memMiB, "mem-mib", 256, "microVM memory size in MiB")
	start.Flags().DurationVar(&opt.timeout, "timeout", 90*time.Second, "time to wait for guest boot signals")
	start.Flags().BoolVar(&opt.waitForBoot, "wait", true, "wait until the guest emits a boot signal before returning")
	start.Flags().BoolVar(&opt.withProcessAPI, "process-api", false, "inject and verify the guest process-api")
	start.Flags().StringVar(&opt.processAPIBin, "process-api-bin", "/opt/managed-agents/bin/process-api", "Linux process-api binary to inject into the guest rootfs")
	start.Flags().StringVar(&opt.processAPITransport, "process-api-transport", "tcp", "process-api transport: tcp or vsock")
	start.Flags().Uint32Var(&opt.processAPIPort, "process-api-port", 1024, "guest AF_VSOCK port for process-api")
	start.Flags().Uint32Var(&opt.processAPITCPPort, "process-api-tcp-port", 8080, "guest TCP port for process-api")
	start.Flags().Uint32Var(&opt.vsockCID, "vsock-cid", 3, "Firecracker guest CID for the sandbox vsock device")
	sandbox.AddCommand(start)

	sandbox.AddCommand(&cobra.Command{
		Use:   "status <sandbox-id>",
		Short: "Inspect a local sandbox state file and host process",
		Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			state, err := readSandboxState(opt, args[0])
			if err != nil {
				return err
			}
			state = refreshSandboxStatus(state)
			printSandboxState(state)
			return nil
		},
	})
	sandbox.AddCommand(&cobra.Command{
		Use:   "list",
		Short: "List known local sandboxes",
		RunE: func(cmd *cobra.Command, args []string) error {
			states, err := listSandboxes(opt)
			if err != nil {
				return err
			}
			for _, state := range states {
				printSandboxState(refreshSandboxStatus(state))
			}
			return nil
		},
	})
	sandbox.AddCommand(&cobra.Command{
		Use:   "ping <sandbox-id>",
		Short: "Query guest process-api health",
		Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			state, err := readSandboxState(opt, args[0])
			if err != nil {
				return err
			}
			health, err := getProcessAPIHealth(cmd.Context(), state)
			if err != nil {
				return err
			}
			fmt.Printf("process_api=ready\nservice=%s\npid=%d\nos=%s\narch=%s\n", health.Service, health.PID, health.OS, health.Arch)
			return nil
		},
	})
	execCmd := &cobra.Command{
		Use:          "exec <sandbox-id> -- <command> [args...]",
		Short:        "Run a command inside the guest through process-api",
		Args:         cobra.MinimumNArgs(2),
		SilenceUsage: true,
		RunE: func(cmd *cobra.Command, args []string) error {
			state, err := readSandboxState(opt, args[0])
			if err != nil {
				return err
			}
			resp, err := execProcessAPI(cmd.Context(), state, processAPIExecRequest{
				Argv:          args[1:],
				Cwd:           opt.execCwd,
				Env:           parseEnv(opt.execEnv),
				TimeoutMillis: opt.execTimeout.Milliseconds(),
			})
			if err != nil {
				return err
			}
			fmt.Print(resp.Stdout)
			if resp.Stderr != "" {
				_, _ = fmt.Fprint(os.Stderr, resp.Stderr)
			}
			fmt.Printf("exit_code=%d\n", resp.ExitCode)
			fmt.Printf("duration_ms=%d\n", resp.DurationMillis)
			if resp.TimedOut {
				return errors.New("guest command timed out")
			}
			if !resp.OK {
				return fmt.Errorf("guest command failed: %s", resp.Error)
			}
			return nil
		},
	}
	execCmd.Flags().StringVar(&opt.execCwd, "cwd", "/", "guest working directory")
	execCmd.Flags().StringArrayVar(&opt.execEnv, "env", nil, "guest environment override as KEY=VALUE; repeatable")
	execCmd.Flags().DurationVar(&opt.execTimeout, "timeout", 30*time.Second, "guest command timeout")
	sandbox.AddCommand(execCmd)

	processCmd := &cobra.Command{
		Use:   "process",
		Short: "Manage long-running guest processes through process-api",
	}
	processStart := &cobra.Command{
		Use:          "start <sandbox-id> -- <command> [args...]",
		Short:        "Start a guest process without waiting for completion",
		Args:         cobra.MinimumNArgs(2),
		SilenceUsage: true,
		RunE: func(cmd *cobra.Command, args []string) error {
			state, err := readSandboxState(opt, args[0])
			if err != nil {
				return err
			}
			resp, err := startProcessAPI(cmd.Context(), state, processAPIProcessRequest{
				Argv:          args[1:],
				Cwd:           opt.execCwd,
				Env:           parseEnv(opt.execEnv),
				TimeoutMillis: opt.execTimeout.Milliseconds(),
			})
			if err != nil {
				return err
			}
			printProcess(resp)
			return nil
		},
	}
	processStart.Flags().StringVar(&opt.execCwd, "cwd", "/", "guest working directory")
	processStart.Flags().StringArrayVar(&opt.execEnv, "env", nil, "guest environment override as KEY=VALUE; repeatable")
	processStart.Flags().DurationVar(&opt.execTimeout, "timeout", 0, "optional guest process timeout; 0 disables timeout")
	processCmd.AddCommand(processStart)
	processCmd.AddCommand(&cobra.Command{
		Use:          "status <sandbox-id> <process-id>",
		Short:        "Inspect a guest process",
		Args:         cobra.ExactArgs(2),
		SilenceUsage: true,
		RunE: func(cmd *cobra.Command, args []string) error {
			state, err := readSandboxState(opt, args[0])
			if err != nil {
				return err
			}
			resp, err := getProcessAPIProcess(cmd.Context(), state, args[1])
			if err != nil {
				return err
			}
			printProcess(resp)
			return nil
		},
	})
	processSignal := &cobra.Command{
		Use:          "signal <sandbox-id> <process-id>",
		Short:        "Send a signal to a guest process",
		Args:         cobra.ExactArgs(2),
		SilenceUsage: true,
		RunE: func(cmd *cobra.Command, args []string) error {
			state, err := readSandboxState(opt, args[0])
			if err != nil {
				return err
			}
			resp, err := signalProcessAPI(cmd.Context(), state, args[1], opt.processSignal)
			if err != nil {
				return err
			}
			printProcess(resp)
			return nil
		},
	}
	processSignal.Flags().StringVar(&opt.processSignal, "signal", "TERM", "signal to send: TERM, INT, KILL, or HUP")
	processCmd.AddCommand(processSignal)
	sandbox.AddCommand(processCmd)
	remove := &cobra.Command{
		Use:          "rm <sandbox-id>",
		Short:        "Remove a stopped sandbox directory and local state",
		Args:         cobra.ExactArgs(1),
		SilenceUsage: true,
		RunE: func(cmd *cobra.Command, args []string) error {
			if err := removeSandbox(cmd.Context(), opt, args[0], opt.forceRemove); err != nil {
				return err
			}
			fmt.Printf("sandbox=%s\nremoved=true\n", args[0])
			return nil
		},
	}
	remove.Flags().BoolVar(&opt.forceRemove, "force", false, "stop the sandbox first if it is still running")
	sandbox.AddCommand(remove)
	sandbox.AddCommand(&cobra.Command{
		Use:   "stop <sandbox-id>",
		Short: "Stop a running Firecracker sandbox",
		Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			state, err := stopSandbox(cmd.Context(), opt, args[0])
			if err != nil {
				return err
			}
			printSandboxState(state)
			return nil
		},
	})
	root.AddCommand(sandbox)

	if err := root.Execute(); err != nil {
		os.Exit(1)
	}
}

func doctor(ctx context.Context, opt options) error {
	fmt.Printf("os=%s arch=%s\n", runtime.GOOS, runtime.GOARCH)
	if runtime.GOOS != "linux" {
		return errors.New("Firecracker requires a Linux host")
	}
	if err := requireCommand("curl"); err != nil {
		return err
	}
	if err := requireCommand("unsquashfs"); err != nil {
		return err
	}
	if err := requireCommand("mkfs.ext4"); err != nil {
		return err
	}
	if _, err := os.Stat("/dev/kvm"); err != nil {
		return fmt.Errorf("/dev/kvm is not available: %w", err)
	}
	vmx, err := grepCount("/proc/cpuinfo", regexp.MustCompile(`(^| )vmx( |$)`))
	if err != nil {
		return err
	}
	fmt.Printf("vmx_count=%d\n", vmx)
	if vmx == 0 {
		return errors.New("host CPU does not expose Intel VMX")
	}
	fmt.Print("kvm_device=")
	if err := runPassthrough(ctx, opt.useSudo, "ls", "-l", "/dev/kvm"); err != nil {
		return err
	}
	fmt.Print("kvm_modules=\n")
	_ = runShell(ctx, false, "lsmod | grep '^kvm' || true", "")
	return nil
}

func prepareAssets(ctx context.Context, opt options) (assets, error) {
	if err := os.MkdirAll(opt.workDir, 0o755); err != nil {
		return assets{}, err
	}
	image, err := resolveImage(opt.image)
	if err != nil {
		return assets{}, err
	}
	if err := requireCommand("unsquashfs"); err != nil {
		return assets{}, err
	}
	if err := requireCommand("mkfs.ext4"); err != nil {
		return assets{}, err
	}

	arch, err := firecrackerArch()
	if err != nil {
		return assets{}, err
	}
	prefix, err := latestCIPrefix(ctx)
	if err != nil {
		return assets{}, err
	}
	kernelKey, err := latestKey(ctx, prefix+arch+"/vmlinux-", regexp.MustCompile(regexp.QuoteMeta(prefix+arch+`/`)+`vmlinux-[0-9]+\.[0-9]+\.[0-9]{1,3}$`))
	if err != nil {
		return assets{}, err
	}
	rootfsKey, err := latestKey(ctx, prefix+arch+"/ubuntu-", regexp.MustCompile(regexp.QuoteMeta(prefix+arch+`/`)+`ubuntu-[0-9]+\.[0-9]+\.squashfs$`))
	if err != nil {
		return assets{}, err
	}
	if image.rootfsVersion != "" {
		rootfsKey, err = latestKey(ctx, prefix+arch+"/ubuntu-"+image.rootfsVersion, regexp.MustCompile(regexp.QuoteMeta(prefix+arch+`/ubuntu-`+image.rootfsVersion+`.squashfs`)+`$`))
		if err != nil {
			return assets{}, err
		}
	}

	kernelPath := filepath.Join(opt.workDir, filepath.Base(kernelKey))
	rootfsSquashPath := filepath.Join(opt.workDir, filepath.Base(rootfsKey))
	rootfsExt4Path := strings.TrimSuffix(rootfsSquashPath, ".squashfs") + ".ext4"

	if err := downloadIfMissing(ctx, ciArtifactBucket+"/"+kernelKey, kernelPath); err != nil {
		return assets{}, err
	}
	if err := downloadIfMissing(ctx, ciArtifactBucket+"/"+rootfsKey, rootfsSquashPath); err != nil {
		return assets{}, err
	}
	if _, err := os.Stat(rootfsExt4Path); err != nil {
		if !errors.Is(err, os.ErrNotExist) {
			return assets{}, err
		}
		if err := buildExt4Rootfs(ctx, opt, rootfsSquashPath, rootfsExt4Path); err != nil {
			return assets{}, err
		}
	}

	fcPath := filepath.Join(opt.workDir, "firecracker")
	if _, err := os.Stat(fcPath); err != nil {
		if !errors.Is(err, os.ErrNotExist) {
			return assets{}, err
		}
		if err := installFirecracker(ctx, opt, arch, fcPath); err != nil {
			return assets{}, err
		}
	}
	if err := os.Chmod(fcPath, 0o755); err != nil {
		return assets{}, err
	}
	fmt.Printf("image=%s\nartifact_prefix=%s\nfirecracker=%s\nkernel=%s\nrootfs=%s\n", image.name, prefix, fcPath, kernelPath, rootfsExt4Path)
	return assets{firecracker: fcPath, kernel: kernelPath, rootfs: rootfsExt4Path, image: image.name, prefix: prefix, rootfsKey: rootfsKey, kernelKey: kernelKey}, nil
}

func smoke(ctx context.Context, opt options) error {
	opt.waitForBoot = true
	state, err := startSandbox(ctx, opt, "")
	if err != nil {
		return err
	}
	defer func() {
		if opt.keepAlive {
			fmt.Printf("sandbox=%s\nfirecracker_pid=%d\n", state.ID, state.PID)
			return
		}
		_, _ = stopSandbox(ctx, opt, state.ID)
	}()
	fmt.Printf("microvm=booted sandbox=%s console=%s\n", state.ID, state.ConsolePath)
	return nil
}

func verifyLifecycle(ctx context.Context, opt options) error {
	opt.withProcessAPI = true
	opt.waitForBoot = true
	if opt.vcpuCount == 0 {
		opt.vcpuCount = 1
	}
	if opt.memMiB == 0 {
		opt.memMiB = 256
	}
	if opt.timeout == 0 {
		opt.timeout = 150 * time.Second
	}
	if opt.processAPITransport == "" {
		opt.processAPITransport = "tcp"
	}
	if opt.processAPIPort == 0 {
		opt.processAPIPort = 1024
	}
	if opt.processAPITCPPort == 0 {
		opt.processAPITCPPort = 8080
	}
	id := generateSandboxID()
	fmt.Printf("verify_step=start sandbox=%s\n", id)
	state, err := startSandbox(ctx, opt, id)
	if err != nil {
		return err
	}
	cleanup := true
	defer func() {
		if cleanup {
			_, _ = stopSandbox(ctx, opt, id)
			_ = removeSandbox(ctx, opt, id, true)
		}
	}()

	fmt.Println("verify_step=ping")
	health, err := getProcessAPIHealth(ctx, state)
	if err != nil {
		return err
	}
	if health.Service != "process-api" || health.OS != "linux" {
		return fmt.Errorf("unexpected process-api health response: %+v", health)
	}

	fmt.Println("verify_step=exec")
	execResp, err := execProcessAPI(ctx, state, processAPIExecRequest{
		Argv:          []string{"/bin/uname", "-m"},
		TimeoutMillis: (10 * time.Second).Milliseconds(),
	})
	if err != nil {
		return err
	}
	if !execResp.OK || execResp.ExitCode != 0 || strings.TrimSpace(execResp.Stdout) == "" {
		return fmt.Errorf("guest uname verification failed: %+v", execResp)
	}

	fmt.Println("verify_step=exec_env_cwd")
	envResp, err := execProcessAPI(ctx, state, processAPIExecRequest{
		Argv:          []string{"/bin/sh", "-c", `printf cwd=; pwd; printf " env=$MA_VERIFY"`},
		Cwd:           "/tmp",
		Env:           map[string]string{"MA_VERIFY": "ok"},
		TimeoutMillis: (10 * time.Second).Milliseconds(),
	})
	if err != nil {
		return err
	}
	if !envResp.OK || !strings.Contains(envResp.Stdout, "cwd=/tmp") || !strings.Contains(envResp.Stdout, "env=ok") {
		return fmt.Errorf("guest cwd/env verification failed: %+v", envResp)
	}

	fmt.Println("verify_step=process_lifecycle")
	proc, err := startProcessAPI(ctx, state, processAPIProcessRequest{
		Argv:          []string{"/bin/sh", "-c", "printf begin; sleep 1; printf done"},
		TimeoutMillis: (10 * time.Second).Milliseconds(),
	})
	if err != nil {
		return err
	}
	if proc.Status != "running" {
		return fmt.Errorf("expected running process, got %+v", proc)
	}
	proc, err = waitForGuestProcessStatus(ctx, state, proc.ID, "exited", 5*time.Second)
	if err != nil {
		return err
	}
	if proc.ExitCode != 0 || proc.Stdout != "begindone" {
		return fmt.Errorf("guest process lifecycle verification failed: %+v", proc)
	}

	fmt.Println("verify_step=process_signal")
	sleepProc, err := startProcessAPI(ctx, state, processAPIProcessRequest{
		Argv: []string{"/bin/sleep", "30"},
	})
	if err != nil {
		return err
	}
	if sleepProc.Status != "running" {
		return fmt.Errorf("expected running sleep process, got %+v", sleepProc)
	}
	if _, err := signalProcessAPI(ctx, state, sleepProc.ID, "TERM"); err != nil {
		return err
	}
	sleepProc, err = waitForGuestProcessStatus(ctx, state, sleepProc.ID, "exited", 5*time.Second)
	if err != nil {
		return err
	}
	if sleepProc.ExitCode == 0 {
		return fmt.Errorf("expected non-zero signal exit, got %+v", sleepProc)
	}

	fmt.Println("verify_step=cleanup")
	if _, err := stopSandbox(ctx, opt, id); err != nil {
		return err
	}
	if err := removeSandbox(ctx, opt, id, false); err != nil {
		return err
	}
	if _, err := os.Stat(filepath.Join(sandboxesDir(opt), id)); !errors.Is(err, os.ErrNotExist) {
		return fmt.Errorf("sandbox directory still exists after cleanup: %v", err)
	}
	cleanup = false
	fmt.Println("verify=passed")
	return nil
}

func waitForGuestProcessStatus(ctx context.Context, state sandboxState, processID, status string, timeout time.Duration) (processAPIProcessResponse, error) {
	deadline := time.Now().Add(timeout)
	var last processAPIProcessResponse
	var lastErr error
	for time.Now().Before(deadline) {
		process, err := getProcessAPIProcess(ctx, state, processID)
		if err == nil {
			last = process
			if process.Status == status {
				return process, nil
			}
		} else {
			lastErr = err
		}
		time.Sleep(100 * time.Millisecond)
	}
	if lastErr != nil {
		return processAPIProcessResponse{}, lastErr
	}
	return processAPIProcessResponse{}, fmt.Errorf("process %s did not reach status %s before timeout; last=%+v", processID, status, last)
}

func serveSandboxd(ctx context.Context, opt options) error {
	if opt.listenAddr == "" {
		opt.listenAddr = "127.0.0.1:8787"
	}
	server := &http.Server{
		Addr:              opt.listenAddr,
		Handler:           sandboxdHTTPHandler(opt),
		ReadHeaderTimeout: 5 * time.Second,
	}
	go func() {
		<-ctx.Done()
		shutdownCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		_ = server.Shutdown(shutdownCtx)
	}()
	fmt.Printf("sandboxd_listen=%s\n", opt.listenAddr)
	if err := server.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
		return err
	}
	return nil
}

func sandboxdHTTPHandler(opt options) http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("/healthz", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			writeAPIError(w, http.StatusMethodNotAllowed, "method not allowed")
			return
		}
		writeJSON(w, http.StatusOK, sandboxdHealth{
			OK:        true,
			Service:   "sandboxd",
			Version:   "dev",
			Timestamp: time.Now().UTC().Format(time.RFC3339Nano),
		})
	})
	mux.HandleFunc("/sandboxes", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			states, err := listSandboxes(opt)
			if err != nil {
				writeAPIError(w, http.StatusInternalServerError, err.Error())
				return
			}
			for i := range states {
				states[i] = refreshSandboxStatus(states[i])
			}
			writeJSON(w, http.StatusOK, states)
		case http.MethodPost:
			var request sandboxdStartRequest
			if err := json.NewDecoder(r.Body).Decode(&request); err != nil && !errors.Is(err, io.EOF) {
				writeAPIError(w, http.StatusBadRequest, "invalid json body")
				return
			}
			startOpt := sandboxdStartOptions(opt, request)
			state, err := startSandbox(r.Context(), startOpt, request.ID)
			if err != nil {
				writeAPIError(w, statusForError(err), err.Error())
				return
			}
			writeJSON(w, http.StatusCreated, state)
		default:
			writeAPIError(w, http.StatusMethodNotAllowed, "method not allowed")
		}
	})
	mux.HandleFunc("/runs", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			writeAPIError(w, http.StatusMethodNotAllowed, "method not allowed")
			return
		}
		var request sandboxdRunRequest
		if err := json.NewDecoder(http.MaxBytesReader(w, r.Body, 1<<20)).Decode(&request); err != nil {
			writeAPIError(w, http.StatusBadRequest, "invalid json body")
			return
		}
		result, err := runSandboxCommand(r.Context(), opt, request)
		if err != nil {
			writeAPIError(w, statusForError(err), err.Error())
			return
		}
		writeJSON(w, http.StatusOK, result)
	})
	mux.HandleFunc("/sandboxes/", func(w http.ResponseWriter, r *http.Request) {
		parts := strings.Split(strings.Trim(strings.TrimPrefix(r.URL.Path, "/sandboxes/"), "/"), "/")
		if len(parts) == 0 || parts[0] == "" {
			writeAPIError(w, http.StatusNotFound, "sandbox id is required")
			return
		}
		id := parts[0]
		if err := validateSandboxID(id); err != nil {
			writeAPIError(w, http.StatusBadRequest, err.Error())
			return
		}
		if len(parts) == 1 {
			handleSandboxResource(w, r, opt, id)
			return
		}
		if len(parts) == 2 && parts[1] == "stop" {
			if r.Method != http.MethodPost {
				writeAPIError(w, http.StatusMethodNotAllowed, "method not allowed")
				return
			}
			state, err := stopSandbox(r.Context(), opt, id)
			if err != nil {
				writeAPIError(w, statusForError(err), err.Error())
				return
			}
			writeJSON(w, http.StatusOK, state)
			return
		}
		if len(parts) == 2 && parts[1] == "process-api-health" {
			if r.Method != http.MethodGet {
				writeAPIError(w, http.StatusMethodNotAllowed, "method not allowed")
				return
			}
			state, err := readSandboxState(opt, id)
			if err != nil {
				writeAPIError(w, statusForError(err), err.Error())
				return
			}
			health, err := getProcessAPIHealth(r.Context(), state)
			if err != nil {
				writeAPIError(w, statusForError(err), err.Error())
				return
			}
			writeJSON(w, http.StatusOK, health)
			return
		}
		if len(parts) == 2 && parts[1] == "exec" {
			if r.Method != http.MethodPost {
				writeAPIError(w, http.StatusMethodNotAllowed, "method not allowed")
				return
			}
			state, err := readSandboxState(opt, id)
			if err != nil {
				writeAPIError(w, statusForError(err), err.Error())
				return
			}
			var request processAPIExecRequest
			if err := json.NewDecoder(http.MaxBytesReader(w, r.Body, 1<<20)).Decode(&request); err != nil {
				writeAPIError(w, http.StatusBadRequest, "invalid json body")
				return
			}
			var result processAPIExecResponse
			if state.Backend == backendDocker {
				result, err = execDockerSandbox(r.Context(), opt, state, request)
			} else {
				result, err = execProcessAPI(r.Context(), state, request)
			}
			if err != nil {
				writeAPIError(w, statusForError(err), err.Error())
				return
			}
			writeJSON(w, http.StatusOK, result)
			return
		}
		if len(parts) == 2 && parts[1] == "processes" {
			if r.Method != http.MethodPost {
				writeAPIError(w, http.StatusMethodNotAllowed, "method not allowed")
				return
			}
			state, err := readSandboxState(opt, id)
			if err != nil {
				writeAPIError(w, statusForError(err), err.Error())
				return
			}
			var request processAPIProcessRequest
			if err := json.NewDecoder(http.MaxBytesReader(w, r.Body, 1<<20)).Decode(&request); err != nil {
				writeAPIError(w, http.StatusBadRequest, "invalid json body")
				return
			}
			result, err := startProcessAPI(r.Context(), state, request)
			if err != nil {
				writeAPIError(w, statusForError(err), err.Error())
				return
			}
			writeJSON(w, http.StatusOK, result)
			return
		}
		if len(parts) == 3 && parts[1] == "processes" {
			if r.Method != http.MethodGet {
				writeAPIError(w, http.StatusMethodNotAllowed, "method not allowed")
				return
			}
			state, err := readSandboxState(opt, id)
			if err != nil {
				writeAPIError(w, statusForError(err), err.Error())
				return
			}
			result, err := getProcessAPIProcess(r.Context(), state, parts[2])
			if err != nil {
				writeAPIError(w, statusForError(err), err.Error())
				return
			}
			writeJSON(w, http.StatusOK, result)
			return
		}
		if len(parts) == 4 && parts[1] == "processes" && parts[3] == "signal" {
			if r.Method != http.MethodPost {
				writeAPIError(w, http.StatusMethodNotAllowed, "method not allowed")
				return
			}
			state, err := readSandboxState(opt, id)
			if err != nil {
				writeAPIError(w, statusForError(err), err.Error())
				return
			}
			var request processAPISignalRequest
			if err := json.NewDecoder(http.MaxBytesReader(w, r.Body, 1<<20)).Decode(&request); err != nil && !errors.Is(err, io.EOF) {
				writeAPIError(w, http.StatusBadRequest, "invalid json body")
				return
			}
			result, err := signalProcessAPI(r.Context(), state, parts[2], request.Signal)
			if err != nil {
				writeAPIError(w, statusForError(err), err.Error())
				return
			}
			writeJSON(w, http.StatusOK, result)
			return
		}
		writeAPIError(w, http.StatusNotFound, "route not found")
	})
	return mux
}

func sandboxdStartOptions(base options, request sandboxdStartRequest) options {
	if request.Image != "" {
		base.image = request.Image
	}
	if request.VCPUCount > 0 {
		base.vcpuCount = request.VCPUCount
	}
	if request.MemMiB > 0 {
		base.memMiB = request.MemMiB
	}
	base.waitForBoot = true
	if request.Wait != nil {
		base.waitForBoot = *request.Wait
	}
	base.withProcessAPI = request.ProcessAPI
	if request.ProcessAPIBin != "" {
		base.processAPIBin = request.ProcessAPIBin
	}
	if request.ProcessAPITransport != "" {
		base.processAPITransport = request.ProcessAPITransport
	}
	if request.ProcessAPIPort > 0 {
		base.processAPIPort = request.ProcessAPIPort
	}
	if request.ProcessAPITCPPort > 0 {
		base.processAPITCPPort = request.ProcessAPITCPPort
	}
	if request.VsockCID > 0 {
		base.vsockCID = request.VsockCID
	}
	if request.TimeoutMillis > 0 {
		base.timeout = time.Duration(request.TimeoutMillis) * time.Millisecond
	}
	return base
}

func sandboxdRunOptions(base options, request sandboxdRunRequest) options {
	if request.Image != "" {
		base.image = request.Image
	}
	if request.VCPUCount > 0 {
		base.vcpuCount = request.VCPUCount
	}
	if request.MemMiB > 0 {
		base.memMiB = request.MemMiB
	}
	if request.TimeoutMillis > 0 {
		base.timeout = time.Duration(request.TimeoutMillis) * time.Millisecond
	}
	base.waitForBoot = true
	base.withProcessAPI = false
	base.guestCommand = request.Command
	base.guestNetwork = request.Network
	return base
}

func runSandboxCommand(ctx context.Context, opt options, request sandboxdRunRequest) (sandboxdRunResponse, error) {
	if strings.TrimSpace(request.Command) == "" {
		return sandboxdRunResponse{}, errors.New("command is required")
	}
	runOpt := sandboxdRunOptions(opt, request)
	backend, err := normalizeBackend(runOpt.backend)
	if err != nil {
		return sandboxdRunResponse{}, err
	}
	if runOpt.timeout == 0 {
		runOpt.timeout = 180 * time.Second
	}
	if backend == backendDocker {
		return runDockerSandboxCommand(ctx, runOpt, request)
	}
	started := time.Now()
	state, err := startSandbox(ctx, runOpt, request.ID)
	if err != nil {
		return sandboxdRunResponse{}, err
	}
	cleanup := true
	defer func() {
		if cleanup {
			_ = removeSandbox(context.Background(), opt, state.ID, true)
		}
	}()
	timedOut, err := waitForGuestCommandCompletion(ctx, state, runOpt.timeout)
	if err != nil {
		return sandboxdRunResponse{}, err
	}
	result, err := readGuestCommandResult(ctx, state)
	if err != nil {
		return sandboxdRunResponse{}, err
	}
	result.ID = state.ID
	result.Sandbox = state
	result.TimedOut = timedOut
	result.DurationMillis = time.Since(started).Milliseconds()
	if err := removeSandbox(ctx, opt, state.ID, true); err != nil {
		return sandboxdRunResponse{}, err
	}
	cleanup = false
	return result, nil
}

func handleSandboxResource(w http.ResponseWriter, r *http.Request, opt options, id string) {
	switch r.Method {
	case http.MethodGet:
		state, err := readSandboxState(opt, id)
		if err != nil {
			writeAPIError(w, statusForError(err), err.Error())
			return
		}
		writeJSON(w, http.StatusOK, refreshSandboxStatus(state))
	case http.MethodDelete:
		force := r.URL.Query().Get("force") == "true" || r.URL.Query().Get("force") == "1"
		if err := removeSandbox(r.Context(), opt, id, force); err != nil {
			writeAPIError(w, statusForError(err), err.Error())
			return
		}
		writeJSON(w, http.StatusOK, map[string]any{"id": id, "removed": true})
	default:
		writeAPIError(w, http.StatusMethodNotAllowed, "method not allowed")
	}
}

func statusForError(err error) int {
	if err == nil {
		return http.StatusOK
	}
	if errors.Is(err, os.ErrNotExist) {
		return http.StatusNotFound
	}
	return http.StatusBadRequest
}

func writeJSON(w http.ResponseWriter, status int, value any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(value)
}

func writeAPIError(w http.ResponseWriter, status int, message string) {
	writeJSON(w, status, map[string]string{"error": message})
}

func resolveImage(name string) (imageSpec, error) {
	switch name {
	case "", "firecracker-ci-ubuntu-22.04", "ubuntu-22.04":
		return imageSpec{name: "firecracker-ci-ubuntu-22.04", rootfsVersion: "22.04"}, nil
	default:
		return imageSpec{}, fmt.Errorf("unsupported image %q; supported images: firecracker-ci-ubuntu-22.04", name)
	}
}

func normalizeBackend(value string) (string, error) {
	switch strings.ToLower(strings.TrimSpace(value)) {
	case "", backendFirecracker:
		return backendFirecracker, nil
	case backendDocker:
		return backendDocker, nil
	default:
		return "", fmt.Errorf("unsupported sandbox backend %q; supported backends: firecracker, docker", value)
	}
}

func generateSandboxID() string {
	return fmt.Sprintf("sbx-%s", time.Now().UTC().Format("20060102-150405"))
}

func validateSandboxID(id string) error {
	if id == "" {
		return errors.New("sandbox id is required")
	}
	if len(id) > 64 {
		return fmt.Errorf("sandbox id %q is too long", id)
	}
	if ok, _ := regexp.MatchString(`^[A-Za-z0-9][A-Za-z0-9_.-]*$`, id); !ok {
		return fmt.Errorf("sandbox id %q must contain only letters, numbers, dot, underscore, or dash", id)
	}
	return nil
}

func sandboxesDir(opt options) string {
	return filepath.Join(opt.workDir, "sandboxes")
}

func sandboxStatePath(opt options, id string) string {
	return filepath.Join(sandboxesDir(opt), id, "state.json")
}

func writeSandboxState(state sandboxState) error {
	if err := os.MkdirAll(state.SandboxDir, 0o755); err != nil {
		return err
	}
	data, err := json.MarshalIndent(state, "", "  ")
	if err != nil {
		return err
	}
	data = append(data, '\n')
	path := filepath.Join(state.SandboxDir, "state.json")
	tmp := path + ".tmp"
	if err := os.WriteFile(tmp, data, 0o644); err != nil {
		return err
	}
	return os.Rename(tmp, path)
}

func readSandboxState(opt options, id string) (sandboxState, error) {
	if err := validateSandboxID(id); err != nil {
		return sandboxState{}, err
	}
	data, err := os.ReadFile(sandboxStatePath(opt, id))
	if err != nil {
		return sandboxState{}, err
	}
	var state sandboxState
	if err := json.Unmarshal(data, &state); err != nil {
		return sandboxState{}, err
	}
	return state, nil
}

func listSandboxes(opt options) ([]sandboxState, error) {
	entries, err := os.ReadDir(sandboxesDir(opt))
	if errors.Is(err, os.ErrNotExist) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	var states []sandboxState
	for _, entry := range entries {
		if !entry.IsDir() {
			continue
		}
		state, err := readSandboxState(opt, entry.Name())
		if err == nil {
			states = append(states, state)
		}
	}
	sort.Slice(states, func(i, j int) bool {
		return states[i].StartedAt.Before(states[j].StartedAt)
	})
	return states, nil
}

func refreshSandboxStatus(state sandboxState) sandboxState {
	if state.Backend == backendDocker && state.ContainerID != "" {
		running, err := dockerContainerRunning(context.Background(), "docker", state.ContainerID)
		if err == nil {
			if running {
				state.Status = "running"
			} else if state.Status == "running" || state.Status == "starting" {
				state.Status = "exited"
			}
			return state
		}
	}
	switch state.Status {
	case "running", "starting":
		if !isProcessAlive(state.PID) {
			state.Status = "exited"
		}
	}
	return state
}

func printSandboxState(state sandboxState) {
	fmt.Printf("sandbox=%s\nbackend=%s\nstatus=%s\nbooted=%t\npid=%d\nimage=%s\nvcpu=%d\nmem_mib=%d\nsandbox_dir=%s\nworkspace=%s\ncontainer=%s\nconsole=%s\nrootfs=%s\nprocess_api=%t\n",
		state.ID,
		defaultString(state.Backend, backendFirecracker),
		state.Status,
		state.Booted,
		state.PID,
		state.Image,
		state.VCPUCount,
		state.MemMiB,
		state.SandboxDir,
		state.WorkspacePath,
		state.ContainerID,
		state.ConsolePath,
		state.RootfsPath,
		state.ProcessAPI,
	)
	if state.ProcessAPI {
		fmt.Printf("process_transport=%s\nprocess_port=%d\nprocess_tcp_port=%d\nvsock_cid=%d\nvsock_path=%s\ntap_name=%s\nhost_ip=%s\nguest_ip=%s\nguest_mac=%s\n",
			state.ProcessTransport,
			state.ProcessPort,
			state.ProcessTCPPort,
			state.VsockCID,
			state.VsockPath,
			state.TapName,
			state.HostIP,
			state.GuestIP,
			state.GuestMAC,
		)
	}
}

func copyRootfs(ctx context.Context, source, target string) error {
	if err := requireCommand("cp"); err != nil {
		return err
	}
	if err := os.MkdirAll(filepath.Dir(target), 0o755); err != nil {
		return err
	}
	_ = os.Remove(target)
	return runPassthrough(ctx, false, "cp", "--reflink=auto", "--sparse=always", source, target)
}

func injectGuestCommand(ctx context.Context, opt options, rootfsPath, sandboxDir string) error {
	mountDir := filepath.Join(sandboxDir, "rootfs-mount")
	if err := os.MkdirAll(mountDir, 0o755); err != nil {
		return err
	}
	servicePath := filepath.Join(sandboxDir, "managed-agents-command.service")
	if err := os.WriteFile(servicePath, []byte(guestCommandService(opt.guestNetwork)), 0o644); err != nil {
		return err
	}
	runnerPath := filepath.Join(sandboxDir, "managed-agents-command-runner.sh")
	if err := os.WriteFile(runnerPath, []byte(guestCommandRunnerScript()), 0o755); err != nil {
		return err
	}
	commandPath := filepath.Join(sandboxDir, "command.b64")
	if err := os.WriteFile(commandPath, []byte(base64.StdEncoding.EncodeToString([]byte(opt.guestCommand))), 0o644); err != nil {
		return err
	}
	mounted := false
	defer func() {
		if mounted {
			_ = runPassthrough(ctx, true, "umount", mountDir)
		}
		_ = os.RemoveAll(mountDir)
	}()
	if err := runPassthrough(ctx, true, "mount", "-o", "loop", rootfsPath, mountDir); err != nil {
		return err
	}
	mounted = true
	if err := runPassthrough(ctx, true, "mkdir", "-p",
		filepath.Join(mountDir, "opt/managed-agents/run"),
		filepath.Join(mountDir, "etc/systemd/system/multi-user.target.wants"),
	); err != nil {
		return err
	}
	if err := runPassthrough(ctx, true, "cp", servicePath, filepath.Join(mountDir, "etc/systemd/system/managed-agents-command.service")); err != nil {
		return err
	}
	if err := runPassthrough(ctx, true, "cp", runnerPath, filepath.Join(mountDir, "opt/managed-agents/run/runner.sh")); err != nil {
		return err
	}
	if err := runPassthrough(ctx, true, "chmod", "0755", filepath.Join(mountDir, "opt/managed-agents/run/runner.sh")); err != nil {
		return err
	}
	if err := runPassthrough(ctx, true, "cp", commandPath, filepath.Join(mountDir, "opt/managed-agents/run/command.b64")); err != nil {
		return err
	}
	if err := runPassthrough(ctx, true, "ln", "-sf", "../managed-agents-command.service", filepath.Join(mountDir, "etc/systemd/system/multi-user.target.wants/managed-agents-command.service")); err != nil {
		return err
	}
	if err := runPassthrough(ctx, true, "sync"); err != nil {
		return err
	}
	if err := runPassthrough(ctx, true, "umount", mountDir); err != nil {
		return err
	}
	mounted = false
	return nil
}

func guestCommandService(network bool) string {
	networkDeps := ""
	if network {
		networkDeps = "Wants=managed-agents-network.service\nAfter=managed-agents-network.service\n"
	}
	return fmt.Sprintf(`[Unit]
Description=Managed Agents One Shot Command
After=local-fs.target
%s

[Service]
Type=oneshot
ExecStart=/bin/sh /opt/managed-agents/run/runner.sh
TimeoutStartSec=0
StandardOutput=journal+console
StandardError=journal+console

[Install]
WantedBy=multi-user.target
`, networkDeps)
}

func guestCommandRunnerScript() string {
	return `#!/bin/sh
set +e
run_dir=/opt/managed-agents/run
mkdir -p "$run_dir"
echo "managed-agents-command: starting"
base64 -d "$run_dir/command.b64" >"$run_dir/command.sh" 2>"$run_dir/decode.stderr"
decode_code=$?
if [ "$decode_code" -ne 0 ]; then
	printf '{"exit_code":%s,"error":"command_decode_failed"}\n' "$decode_code" >"$run_dir/result.json"
	sync
	systemctl poweroff --force --force || poweroff -f || true
	exit 0
fi
chmod +x "$run_dir/command.sh"
/bin/sh "$run_dir/command.sh" >"$run_dir/stdout" 2>"$run_dir/stderr"
code=$?
printf '{"exit_code":%s}\n' "$code" >"$run_dir/result.json"
sync
echo "managed-agents-command: finished exit_code=$code"
systemctl poweroff --force --force || poweroff -f || true
exit 0
`
}

func injectProcessAPI(ctx context.Context, opt options, rootfsPath, sandboxDir string, network processNetwork) error {
	if opt.processAPIBin == "" {
		return errors.New("process-api binary path is required")
	}
	if _, err := os.Stat(opt.processAPIBin); err != nil {
		return fmt.Errorf("process-api binary is not available at %s: %w", opt.processAPIBin, err)
	}
	mountDir := filepath.Join(sandboxDir, "rootfs-mount")
	if err := os.MkdirAll(mountDir, 0o755); err != nil {
		return err
	}
	servicePath := filepath.Join(sandboxDir, "process-api.service")
	if err := os.WriteFile(servicePath, []byte(processAPIService(opt)), 0o644); err != nil {
		return err
	}
	networkServicePath := filepath.Join(sandboxDir, "managed-agents-network.service")
	if opt.processAPITransport == "tcp" {
		if err := os.WriteFile(networkServicePath, []byte(managedAgentsNetworkService(network)), 0o644); err != nil {
			return err
		}
	}
	mounted := false
	defer func() {
		if mounted {
			_ = runPassthrough(ctx, true, "umount", mountDir)
		}
		_ = os.RemoveAll(mountDir)
	}()
	if err := runPassthrough(ctx, true, "mount", "-o", "loop", rootfsPath, mountDir); err != nil {
		return err
	}
	mounted = true
	if err := runPassthrough(ctx, true, "mkdir", "-p",
		filepath.Join(mountDir, "opt/managed-agents/bin"),
		filepath.Join(mountDir, "etc/systemd/system/multi-user.target.wants"),
	); err != nil {
		return err
	}
	if err := runPassthrough(ctx, true, "cp", opt.processAPIBin, filepath.Join(mountDir, "opt/managed-agents/bin/process-api")); err != nil {
		return err
	}
	if err := runPassthrough(ctx, true, "chmod", "0755", filepath.Join(mountDir, "opt/managed-agents/bin/process-api")); err != nil {
		return err
	}
	if err := runPassthrough(ctx, true, "cp", servicePath, filepath.Join(mountDir, "etc/systemd/system/process-api.service")); err != nil {
		return err
	}
	if err := runPassthrough(ctx, true, "ln", "-sf", "../process-api.service", filepath.Join(mountDir, "etc/systemd/system/multi-user.target.wants/process-api.service")); err != nil {
		return err
	}
	if opt.processAPITransport == "tcp" {
		if err := runPassthrough(ctx, true, "cp", networkServicePath, filepath.Join(mountDir, "etc/systemd/system/managed-agents-network.service")); err != nil {
			return err
		}
		if err := runPassthrough(ctx, true, "ln", "-sf", "../managed-agents-network.service", filepath.Join(mountDir, "etc/systemd/system/multi-user.target.wants/managed-agents-network.service")); err != nil {
			return err
		}
	}
	if err := runPassthrough(ctx, true, "sync"); err != nil {
		return err
	}
	if err := runPassthrough(ctx, true, "umount", mountDir); err != nil {
		return err
	}
	mounted = false
	return nil
}

func injectGuestNetwork(ctx context.Context, rootfsPath, sandboxDir string, network processNetwork) error {
	mountDir := filepath.Join(sandboxDir, "rootfs-mount")
	if err := os.MkdirAll(mountDir, 0o755); err != nil {
		return err
	}
	networkServicePath := filepath.Join(sandboxDir, "managed-agents-network.service")
	if err := os.WriteFile(networkServicePath, []byte(managedAgentsNetworkService(network)), 0o644); err != nil {
		return err
	}
	mounted := false
	defer func() {
		if mounted {
			_ = runPassthrough(ctx, true, "umount", mountDir)
		}
		_ = os.RemoveAll(mountDir)
	}()
	if err := runPassthrough(ctx, true, "mount", "-o", "loop", rootfsPath, mountDir); err != nil {
		return err
	}
	mounted = true
	if err := runPassthrough(ctx, true, "mkdir", "-p", filepath.Join(mountDir, "etc/systemd/system/multi-user.target.wants")); err != nil {
		return err
	}
	if err := injectHostCABundle(ctx, mountDir); err != nil {
		return err
	}
	if err := runPassthrough(ctx, true, "cp", networkServicePath, filepath.Join(mountDir, "etc/systemd/system/managed-agents-network.service")); err != nil {
		return err
	}
	if err := runPassthrough(ctx, true, "ln", "-sf", "../managed-agents-network.service", filepath.Join(mountDir, "etc/systemd/system/multi-user.target.wants/managed-agents-network.service")); err != nil {
		return err
	}
	if err := runPassthrough(ctx, true, "sync"); err != nil {
		return err
	}
	if err := runPassthrough(ctx, true, "umount", mountDir); err != nil {
		return err
	}
	mounted = false
	return nil
}

func injectHostCABundle(ctx context.Context, mountDir string) error {
	hostCA := "/etc/ssl/certs/ca-certificates.crt"
	if _, err := os.Stat(hostCA); err != nil {
		if errors.Is(err, os.ErrNotExist) {
			return nil
		}
		return err
	}
	guestCA := filepath.Join(mountDir, "etc/ssl/certs/ca-certificates.crt")
	if err := runPassthrough(ctx, true, "mkdir", "-p", filepath.Dir(guestCA)); err != nil {
		return err
	}
	return runPassthrough(ctx, true, "cp", hostCA, guestCA)
}

func processAPIService(opt options) string {
	args := fmt.Sprintf("--transport %s --tcp-addr 0.0.0.0:%d --vsock-port %d", opt.processAPITransport, opt.processAPITCPPort, opt.processAPIPort)
	networkDeps := ""
	if opt.processAPITransport == "tcp" {
		networkDeps = "Wants=managed-agents-network.service\nAfter=managed-agents-network.service\n"
	}
	return fmt.Sprintf(`[Unit]
Description=Managed Agents Process API
After=basic.target
%s

[Service]
Type=simple
ExecStart=/opt/managed-agents/bin/process-api %s
Restart=always
RestartSec=1
StandardOutput=journal+console
StandardError=journal+console

[Install]
WantedBy=multi-user.target
`, networkDeps, args)
}

func managedAgentsNetworkService(network processNetwork) string {
	return fmt.Sprintf(`[Unit]
Description=Managed Agents Guest Network
DefaultDependencies=no
After=systemd-udevd.service
Before=managed-agents-network.target process-api.service

[Service]
Type=oneshot
RemainAfterExit=yes
ExecStart=/bin/sh -c 'set -e; ip link set dev eth0 up; ip addr flush dev eth0 || true; ip addr add %s/30 dev eth0; ip route replace default via %s dev eth0 || true; printf "nameserver 8.8.8.8\nnameserver 1.1.1.1\n" >/etc/resolv.conf || true'

[Install]
WantedBy=multi-user.target
`, network.guestIP, network.hostIP)
}

func processNetworkForSandbox(id string) processNetwork {
	octet := sandboxNetworkOctet(id)
	return processNetwork{
		tapName:  fmt.Sprintf("ma%x", networkHash(id)&0xfffffff),
		hostIP:   fmt.Sprintf("172.16.%d.1", octet),
		guestIP:  fmt.Sprintf("172.16.%d.2", octet),
		guestMAC: fmt.Sprintf("06:00:ac:10:%02x:02", octet),
	}
}

func sandboxNetworkOctet(id string) uint32 {
	return networkHash(id)%253 + 1
}

func networkHash(id string) uint32 {
	hash := fnv.New32a()
	_, _ = hash.Write([]byte(id))
	return hash.Sum32()
}

func setupTap(ctx context.Context, network processNetwork) error {
	if err := requireCommand("ip"); err != nil {
		return err
	}
	_ = runShell(ctx, true, "ip link del "+shellQuote(network.tapName)+" 2>/dev/null || true", "")
	if err := runPassthrough(ctx, true, "ip", "tuntap", "add", "dev", network.tapName, "mode", "tap"); err != nil {
		return err
	}
	if err := runPassthrough(ctx, true, "ip", "addr", "add", network.hostIP+"/30", "dev", network.tapName); err != nil {
		_ = deleteTap(ctx, network.tapName)
		return err
	}
	if err := runPassthrough(ctx, true, "ip", "link", "set", network.tapName, "up"); err != nil {
		_ = deleteTap(ctx, network.tapName)
		return err
	}
	if err := configureTapForwarding(ctx, network); err != nil {
		_ = deleteTap(ctx, network.tapName)
		return err
	}
	return nil
}

func configureTapForwarding(ctx context.Context, network processNetwork) error {
	script := fmt.Sprintf(`
set -e
sysctl -w net.ipv4.ip_forward=1 >/dev/null
out_dev="$(ip route show default 0.0.0.0/0 | awk '{print $5; exit}')"
if [ -n "$out_dev" ] && command -v iptables >/dev/null 2>&1; then
  iptables -t nat -C POSTROUTING -s %[1]s/30 -o "$out_dev" -j MASQUERADE 2>/dev/null || iptables -t nat -A POSTROUTING -s %[1]s/30 -o "$out_dev" -j MASQUERADE
  iptables -C FORWARD -i %[2]s -j ACCEPT 2>/dev/null || iptables -A FORWARD -i %[2]s -j ACCEPT
  iptables -C FORWARD -o %[2]s -m state --state RELATED,ESTABLISHED -j ACCEPT 2>/dev/null || iptables -A FORWARD -o %[2]s -m state --state RELATED,ESTABLISHED -j ACCEPT
fi
`, network.guestIP, shellQuote(network.tapName))
	return runShell(ctx, true, script, "")
}

func deleteTap(ctx context.Context, tapName string) error {
	if tapName == "" {
		return nil
	}
	return runShell(ctx, true, "ip link show "+shellQuote(tapName)+" >/dev/null 2>&1 || exit 0\nip link del "+shellQuote(tapName), "")
}

func shellQuote(value string) string {
	return "'" + strings.ReplaceAll(value, "'", "'\\''") + "'"
}

func defaultString(value, fallback string) string {
	if strings.TrimSpace(value) == "" {
		return fallback
	}
	return value
}

func env(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}

func dockerBin(opt options) string {
	return defaultString(opt.dockerBin, "docker")
}

func dockerContainerName(id string) string {
	return "managed-agents-" + id
}

func startDockerSandbox(ctx context.Context, opt options, id string) (sandboxState, error) {
	if id == "" {
		id = generateSandboxID()
	}
	if err := validateSandboxID(id); err != nil {
		return sandboxState{}, err
	}
	if strings.TrimSpace(opt.image) == "" {
		return sandboxState{}, errors.New("docker image is required")
	}
	if err := requireCommand(dockerBin(opt)); err != nil {
		return sandboxState{}, err
	}
	if existing, err := readSandboxState(opt, id); err == nil && existing.Backend == backendDocker && existing.ContainerID != "" {
		running, _ := dockerContainerRunning(ctx, dockerBin(opt), existing.ContainerID)
		if running {
			return sandboxState{}, fmt.Errorf("sandbox %s is already running as container %s", id, existing.ContainerID)
		}
	}
	sandboxDir := filepath.Join(sandboxesDir(opt), id)
	workspacePath := filepath.Join(sandboxDir, "workspace")
	if err := os.MkdirAll(workspacePath, 0o755); err != nil {
		return sandboxState{}, err
	}
	name := dockerContainerName(id)
	_ = dockerRemoveContainer(ctx, dockerBin(opt), name)
	args := []string{
		"run",
		"-d",
		"--name", name,
		"--label", "managed-agents.sandbox=" + id,
		"-v", workspacePath + ":/workspace",
		"-w", "/workspace",
		opt.image,
		"/bin/sh", "-c", "trap 'exit 0' TERM INT; while true; do sleep 3600; done",
	}
	output, err := exec.CommandContext(ctx, dockerBin(opt), args...).CombinedOutput()
	if err != nil {
		return sandboxState{}, fmt.Errorf("docker run failed: %v: %s", err, strings.TrimSpace(string(output)))
	}
	containerID := strings.TrimSpace(string(output))
	state := sandboxState{
		ID:            id,
		Backend:       backendDocker,
		Image:         opt.image,
		Status:        "running",
		Booted:        true,
		PID:           -1,
		VCPUCount:     opt.vcpuCount,
		MemMiB:        opt.memMiB,
		WorkDir:       opt.workDir,
		SandboxDir:    sandboxDir,
		ContainerID:   containerID,
		ContainerName: name,
		WorkspacePath: workspacePath,
		ProcessAPI:    opt.withProcessAPI,
		StartedAt:     time.Now().UTC(),
	}
	if err := writeSandboxState(state); err != nil {
		_ = dockerRemoveContainer(context.Background(), dockerBin(opt), containerID)
		return sandboxState{}, err
	}
	return state, nil
}

func runDockerSandboxCommand(ctx context.Context, opt options, request sandboxdRunRequest) (sandboxdRunResponse, error) {
	started := time.Now()
	if strings.TrimSpace(opt.image) == "" {
		return sandboxdRunResponse{}, errors.New("docker image is required")
	}
	if err := requireCommand(dockerBin(opt)); err != nil {
		return sandboxdRunResponse{}, err
	}
	id := request.ID
	if id == "" {
		id = generateSandboxID()
	}
	if err := validateSandboxID(id); err != nil {
		return sandboxdRunResponse{}, err
	}
	sandboxDir := filepath.Join(sandboxesDir(opt), id)
	workspacePath := filepath.Join(sandboxDir, "workspace")
	if err := os.MkdirAll(workspacePath, 0o755); err != nil {
		return sandboxdRunResponse{}, err
	}
	name := dockerContainerName(id)
	_ = dockerRemoveContainer(ctx, dockerBin(opt), name)
	defer func() {
		_ = dockerRemoveContainer(context.Background(), dockerBin(opt), name)
		_ = os.RemoveAll(sandboxDir)
	}()
	runCtx := ctx
	cancel := func() {}
	if opt.timeout > 0 {
		runCtx, cancel = context.WithTimeout(ctx, opt.timeout)
	}
	defer cancel()
	args := []string{
		"run",
		"--rm",
		"--name", name,
		"--label", "managed-agents.sandbox=" + id,
		"-v", workspacePath + ":/workspace",
		"-w", "/workspace",
	}
	if !request.Network {
		args = append(args, "--network", "none")
	}
	args = append(args, opt.image, "/bin/sh", "-c", request.Command)
	stdout, stderr, exitCode, timedOut, err := runDockerCommand(runCtx, dockerBin(opt), args...)
	state := sandboxState{
		ID:            id,
		Backend:       backendDocker,
		Image:         opt.image,
		Status:        "stopped",
		Booted:        true,
		PID:           -1,
		WorkDir:       opt.workDir,
		SandboxDir:    sandboxDir,
		ContainerName: name,
		WorkspacePath: workspacePath,
		StartedAt:     started.UTC(),
		StoppedAt:     time.Now().UTC(),
	}
	result := sandboxdRunResponse{
		ID:             id,
		OK:             err == nil && exitCode == 0 && !timedOut,
		ExitCode:       exitCode,
		Stdout:         stdout,
		Stderr:         stderr,
		TimedOut:       timedOut,
		DurationMillis: time.Since(started).Milliseconds(),
		Sandbox:        state,
	}
	if err != nil {
		result.Error = err.Error()
	}
	return result, nil
}

func execDockerSandbox(ctx context.Context, opt options, state sandboxState, request processAPIExecRequest) (processAPIExecResponse, error) {
	if state.ContainerID == "" {
		return processAPIExecResponse{}, errors.New("docker container id is missing")
	}
	if len(request.Argv) == 0 {
		return processAPIExecResponse{}, errors.New("argv is required")
	}
	execCtx := ctx
	cancel := func() {}
	if request.TimeoutMillis > 0 {
		execCtx, cancel = context.WithTimeout(ctx, time.Duration(request.TimeoutMillis)*time.Millisecond)
	}
	defer cancel()
	cwd := defaultString(request.Cwd, "/workspace")
	args := []string{"exec", "-w", cwd}
	for key, value := range request.Env {
		if key == "" {
			continue
		}
		args = append(args, "-e", key+"="+value)
	}
	args = append(args, state.ContainerID)
	args = append(args, request.Argv...)
	started := time.Now()
	stdout, stderr, exitCode, timedOut, err := runDockerCommand(execCtx, dockerBin(opt), args...)
	result := processAPIExecResponse{
		OK:             err == nil && exitCode == 0 && !timedOut,
		Argv:           request.Argv,
		Cwd:            cwd,
		ExitCode:       exitCode,
		Stdout:         stdout,
		Stderr:         stderr,
		TimedOut:       timedOut,
		DurationMillis: time.Since(started).Milliseconds(),
	}
	if err != nil {
		result.Error = err.Error()
	}
	return result, nil
}

func stopDockerSandbox(ctx context.Context, opt options, state sandboxState) (sandboxState, error) {
	target := defaultString(state.ContainerID, state.ContainerName)
	if target != "" {
		output, err := exec.CommandContext(ctx, dockerBin(opt), "rm", "-f", target).CombinedOutput()
		if err != nil && !strings.Contains(string(output), "No such container") {
			return sandboxState{}, fmt.Errorf("docker rm failed: %v: %s", err, strings.TrimSpace(string(output)))
		}
	}
	state.Status = "stopped"
	state.StoppedAt = time.Now().UTC()
	if err := writeSandboxState(state); err != nil {
		return sandboxState{}, err
	}
	return state, nil
}

func dockerContainerRunning(ctx context.Context, docker string, id string) (bool, error) {
	if id == "" {
		return false, nil
	}
	output, err := exec.CommandContext(ctx, docker, "inspect", "-f", "{{.State.Running}}", id).CombinedOutput()
	if err != nil {
		if strings.Contains(string(output), "No such object") || strings.Contains(string(output), "No such container") {
			return false, nil
		}
		return false, fmt.Errorf("docker inspect failed: %v: %s", err, strings.TrimSpace(string(output)))
	}
	return strings.TrimSpace(string(output)) == "true", nil
}

func dockerRemoveContainer(ctx context.Context, docker string, id string) error {
	if id == "" {
		return nil
	}
	output, err := exec.CommandContext(ctx, docker, "rm", "-f", id).CombinedOutput()
	if err != nil && !strings.Contains(string(output), "No such container") {
		return fmt.Errorf("docker rm failed: %v: %s", err, strings.TrimSpace(string(output)))
	}
	return nil
}

func runDockerCommand(ctx context.Context, docker string, args ...string) (string, string, int, bool, error) {
	cmd := exec.CommandContext(ctx, docker, args...)
	var stdout bytes.Buffer
	var stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr
	err := cmd.Run()
	timedOut := ctx.Err() != nil
	exitCode := 0
	if err != nil {
		exitCode = 1
		var exitErr *exec.ExitError
		if errors.As(err, &exitErr) {
			exitCode = exitErr.ExitCode()
		}
		if timedOut {
			err = ctx.Err()
		}
	}
	return stdout.String(), stderr.String(), exitCode, timedOut, err
}

func stopSandbox(ctx context.Context, opt options, id string) (sandboxState, error) {
	state, err := readSandboxState(opt, id)
	if err != nil {
		return sandboxState{}, err
	}
	if state.Backend == backendDocker {
		return stopDockerSandbox(ctx, opt, state)
	}
	if isProcessAlive(state.PID) {
		if err := terminatePID(state.PID); err != nil && isProcessAlive(state.PID) {
			return sandboxState{}, err
		}
	}
	_ = os.Remove(state.SocketPath)
	_ = deleteTap(ctx, state.TapName)
	state.Status = "stopped"
	state.StoppedAt = time.Now().UTC()
	if err := writeSandboxState(state); err != nil {
		return sandboxState{}, err
	}
	return state, nil
}

func removeSandbox(ctx context.Context, opt options, id string, force bool) error {
	if err := validateSandboxID(id); err != nil {
		return err
	}
	state, err := readSandboxState(opt, id)
	if err != nil {
		return err
	}
	if state.Backend == backendDocker && state.ContainerID != "" {
		running, _ := dockerContainerRunning(ctx, dockerBin(opt), state.ContainerID)
		if running {
			if !force {
				return fmt.Errorf("sandbox %s is still running; stop it first or pass --force", id)
			}
			if _, err := stopDockerSandbox(ctx, opt, state); err != nil {
				return err
			}
			state, err = readSandboxState(opt, id)
			if err != nil {
				return err
			}
		}
	}
	if isProcessAlive(state.PID) {
		if !force {
			return fmt.Errorf("sandbox %s is still running; stop it first or pass --force", id)
		}
		if _, err := stopSandbox(ctx, opt, id); err != nil {
			return err
		}
		state, err = readSandboxState(opt, id)
		if err != nil {
			return err
		}
	}
	_ = os.Remove(state.SocketPath)
	_ = os.Remove(state.VsockPath)
	_ = deleteTap(ctx, state.TapName)
	sandboxDir := filepath.Join(sandboxesDir(opt), id)
	cleanDir, err := filepath.Abs(sandboxDir)
	if err != nil {
		return err
	}
	cleanRoot, err := filepath.Abs(sandboxesDir(opt))
	if err != nil {
		return err
	}
	if cleanDir == cleanRoot || !strings.HasPrefix(cleanDir, cleanRoot+string(os.PathSeparator)) {
		return fmt.Errorf("refusing to remove sandbox directory outside sandbox root: %s", cleanDir)
	}
	return os.RemoveAll(cleanDir)
}

func waitForSandboxExit(ctx context.Context, pid int, timeout time.Duration) (bool, error) {
	deadline := time.Now().Add(timeout)
	for time.Now().Before(deadline) {
		if !isProcessAlive(pid) {
			return false, nil
		}
		select {
		case <-ctx.Done():
			return false, ctx.Err()
		case <-time.After(250 * time.Millisecond):
		}
	}
	if err := terminatePID(pid); err != nil {
		return true, err
	}
	return true, nil
}

func waitForGuestCommandCompletion(ctx context.Context, state sandboxState, timeout time.Duration) (bool, error) {
	deadline := time.Now().Add(timeout)
	var lastConsole string
	for time.Now().Before(deadline) {
		if !isProcessAlive(state.PID) {
			return false, nil
		}
		data, _ := os.ReadFile(state.ConsolePath)
		lastConsole = string(data)
		if guestCommandCompletedFromConsole(lastConsole) {
			if err := terminatePID(state.PID); err != nil && isProcessAlive(state.PID) {
				return false, err
			}
			return false, nil
		}
		select {
		case <-ctx.Done():
			return false, ctx.Err()
		case <-time.After(250 * time.Millisecond):
		}
	}
	if err := terminatePID(state.PID); err != nil {
		return true, err
	}
	if len(lastConsole) > 2000 {
		lastConsole = lastConsole[len(lastConsole)-2000:]
	}
	if strings.TrimSpace(lastConsole) != "" {
		return true, fmt.Errorf("guest command timed out before completion; console tail:\n%s", lastConsole)
	}
	return true, nil
}

func guestCommandCompletedFromConsole(console string) bool {
	for _, signal := range []string{
		"managed-agents-command: finished",
		"reboot: System halted",
		"Powering off.",
	} {
		if strings.Contains(console, signal) {
			return true
		}
	}
	return false
}

func readGuestCommandResult(ctx context.Context, state sandboxState) (sandboxdRunResponse, error) {
	mountDir := filepath.Join(state.SandboxDir, "result-mount")
	if err := os.MkdirAll(mountDir, 0o755); err != nil {
		return sandboxdRunResponse{}, err
	}
	mounted := false
	defer func() {
		if mounted {
			_ = runPassthrough(ctx, true, "umount", mountDir)
		}
		_ = os.RemoveAll(mountDir)
	}()
	if err := runPassthrough(ctx, true, "mount", "-o", "loop", state.RootfsPath, mountDir); err != nil {
		return sandboxdRunResponse{}, err
	}
	mounted = true
	runDir := filepath.Join(mountDir, "opt/managed-agents/run")
	stdout, _ := os.ReadFile(filepath.Join(runDir, "stdout"))
	stderr, _ := os.ReadFile(filepath.Join(runDir, "stderr"))
	var result struct {
		ExitCode int `json:"exit_code"`
	}
	data, err := os.ReadFile(filepath.Join(runDir, "result.json"))
	if err != nil {
		return sandboxdRunResponse{}, fmt.Errorf("guest command result is missing: %w", err)
	}
	if err := json.Unmarshal(data, &result); err != nil {
		return sandboxdRunResponse{}, err
	}
	return sandboxdRunResponse{
		OK:       result.ExitCode == 0,
		ExitCode: result.ExitCode,
		Stdout:   string(stdout),
		Stderr:   string(stderr),
	}, nil
}

func startSandbox(ctx context.Context, opt options, id string) (sandboxState, error) {
	backend, err := normalizeBackend(opt.backend)
	if err != nil {
		return sandboxState{}, err
	}
	if backend == backendDocker {
		return startDockerSandbox(ctx, opt, id)
	}
	if opt.vcpuCount <= 0 || opt.memMiB <= 0 {
		return sandboxState{}, errors.New("vcpu and mem-mib must be positive")
	}
	if opt.timeout == 0 {
		opt.timeout = 90 * time.Second
	}
	if id == "" {
		id = generateSandboxID()
	}
	if err := validateSandboxID(id); err != nil {
		return sandboxState{}, err
	}
	withNetwork := opt.guestNetwork || (opt.withProcessAPI && opt.processAPITransport == "tcp")
	var network processNetwork
	if withNetwork {
		network = processNetworkForSandbox(id)
	}
	if opt.withProcessAPI {
		if err := validateProcessAPIOptions(opt); err != nil {
			return sandboxState{}, err
		}
	}
	if existing, err := readSandboxState(opt, id); err == nil && isProcessAlive(existing.PID) {
		return sandboxState{}, fmt.Errorf("sandbox %s is already running with pid %d", id, existing.PID)
	}
	if err := doctor(ctx, opt); err != nil {
		return sandboxState{}, err
	}
	assets, err := prepareAssets(ctx, opt)
	if err != nil {
		return sandboxState{}, err
	}

	sandboxDir := filepath.Join(sandboxesDir(opt), id)
	if err := os.MkdirAll(sandboxDir, 0o755); err != nil {
		return sandboxState{}, err
	}
	rootfsPath := filepath.Join(sandboxDir, "rootfs.ext4")
	if err := copyRootfs(ctx, assets.rootfs, rootfsPath); err != nil {
		return sandboxState{}, err
	}
	if strings.TrimSpace(opt.guestCommand) != "" {
		if err := injectGuestCommand(ctx, opt, rootfsPath, sandboxDir); err != nil {
			return sandboxState{}, err
		}
	}
	if opt.guestNetwork && !(opt.withProcessAPI && opt.processAPITransport == "tcp") {
		if err := injectGuestNetwork(ctx, rootfsPath, sandboxDir, network); err != nil {
			return sandboxState{}, err
		}
	}
	if opt.withProcessAPI {
		if err := injectProcessAPI(ctx, opt, rootfsPath, sandboxDir, network); err != nil {
			return sandboxState{}, err
		}
	}

	socketPath := filepath.Join(sandboxDir, "firecracker.socket")
	vsockPath := filepath.Join(sandboxDir, "process-api.vsock")
	consolePath := filepath.Join(sandboxDir, "console.log")
	logPath := filepath.Join(sandboxDir, "firecracker.log")
	_ = os.Remove(socketPath)
	_ = os.Remove(vsockPath)
	_ = os.Remove(consolePath)
	_ = os.Remove(logPath)

	networkReady := false
	if withNetwork {
		if err := setupTap(ctx, network); err != nil {
			return sandboxState{}, err
		}
		networkReady = true
	}
	started := false
	defer func() {
		if !started && networkReady {
			_ = deleteTap(ctx, network.tapName)
		}
	}()

	cmd := exec.Command(assets.firecracker, "--api-sock", socketPath)
	if opt.useSudo {
		cmd = exec.Command("sudo", assets.firecracker, "--api-sock", socketPath)
	}
	cmd.SysProcAttr = &syscall.SysProcAttr{Setsid: true}
	console, err := os.Create(consolePath)
	if err != nil {
		return sandboxState{}, err
	}
	defer console.Close()
	cmd.Stdout = console
	cmd.Stderr = console
	if err := cmd.Start(); err != nil {
		return sandboxState{}, err
	}

	state := sandboxState{
		ID:          id,
		Backend:     backendFirecracker,
		Image:       assets.image,
		Status:      "starting",
		PID:         cmd.Process.Pid,
		VCPUCount:   opt.vcpuCount,
		MemMiB:      opt.memMiB,
		WorkDir:     opt.workDir,
		SandboxDir:  sandboxDir,
		SocketPath:  socketPath,
		ConsolePath: consolePath,
		LogPath:     logPath,
		KernelPath:  assets.kernel,
		RootfsPath:  rootfsPath,
		BaseRootfs:  assets.rootfs,
		Firecracker: assets.firecracker,
		ProcessAPI:  opt.withProcessAPI,
		StartedAt:   time.Now().UTC(),
	}
	if opt.withProcessAPI {
		state.ProcessTransport = opt.processAPITransport
		state.ProcessPort = opt.processAPIPort
		state.ProcessTCPPort = opt.processAPITCPPort
		state.VsockCID = opt.vsockCID
		state.ProcessBin = opt.processAPIBin
		if opt.processAPITransport == "vsock" {
			state.VsockPath = vsockPath
		}
		if opt.processAPITransport == "tcp" {
			state.TapName = network.tapName
			state.HostIP = network.hostIP
			state.GuestIP = network.guestIP
			state.GuestMAC = network.guestMAC
		}
	}
	if withNetwork && !state.ProcessAPI {
		state.TapName = network.tapName
		state.HostIP = network.hostIP
		state.GuestIP = network.guestIP
		state.GuestMAC = network.guestMAC
	}
	if err := writeSandboxState(state); err != nil {
		_ = terminateProcess(cmd.Process)
		return sandboxState{}, err
	}

	if err := waitForSocket(socketPath, 5*time.Second); err != nil {
		_ = terminateProcess(cmd.Process)
		return sandboxState{}, err
	}
	if opt.useSudo {
		_ = runPassthrough(ctx, true, "chmod", "666", socketPath)
	}
	client := firecrackerClient(socketPath)
	if err := putJSON(ctx, client, "/logger", fmt.Sprintf(`{"log_path":%q,"level":"Info","show_level":true,"show_log_origin":true}`, logPath)); err != nil {
		_ = terminateProcess(cmd.Process)
		return sandboxState{}, err
	}
	if err := putJSON(ctx, client, "/boot-source", fmt.Sprintf(`{"kernel_image_path":%q,"boot_args":"console=ttyS0 reboot=k panic=1 pci=off"}`, assets.kernel)); err != nil {
		_ = terminateProcess(cmd.Process)
		return sandboxState{}, err
	}
	if err := putJSON(ctx, client, "/drives/rootfs", fmt.Sprintf(`{"drive_id":"rootfs","path_on_host":%q,"is_root_device":true,"is_read_only":false}`, rootfsPath)); err != nil {
		_ = terminateProcess(cmd.Process)
		return sandboxState{}, err
	}
	if err := putJSON(ctx, client, "/machine-config", fmt.Sprintf(`{"vcpu_count":%d,"mem_size_mib":%d}`, opt.vcpuCount, opt.memMiB)); err != nil {
		_ = terminateProcess(cmd.Process)
		return sandboxState{}, err
	}
	if opt.withProcessAPI && opt.processAPITransport == "vsock" {
		if err := putJSON(ctx, client, "/vsock", fmt.Sprintf(`{"vsock_id":"process-api","guest_cid":%d,"uds_path":%q}`, opt.vsockCID, vsockPath)); err != nil {
			_ = terminateProcess(cmd.Process)
			return sandboxState{}, err
		}
	}
	if withNetwork {
		if err := putJSON(ctx, client, "/network-interfaces/eth0", fmt.Sprintf(`{"iface_id":"eth0","guest_mac":%q,"host_dev_name":%q}`, network.guestMAC, network.tapName)); err != nil {
			_ = terminateProcess(cmd.Process)
			return sandboxState{}, err
		}
	}
	if err := putJSON(ctx, client, "/actions", `{"action_type":"InstanceStart"}`); err != nil {
		_ = terminateProcess(cmd.Process)
		return sandboxState{}, err
	}
	if opt.withProcessAPI && opt.processAPITransport == "vsock" {
		if err := waitForSocket(vsockPath, 5*time.Second); err != nil {
			_ = terminateProcess(cmd.Process)
			return sandboxState{}, err
		}
		if opt.useSudo {
			_ = runPassthrough(ctx, true, "chmod", "666", vsockPath)
		}
	}

	state.Status = "running"
	if opt.waitForBoot {
		if err := waitForConsole(consolePath, opt.timeout); err != nil {
			_ = terminateProcess(cmd.Process)
			state.Status = "failed"
			_ = writeSandboxState(state)
			return sandboxState{}, err
		}
		state.Booted = true
	}
	if opt.withProcessAPI {
		if _, err := waitForProcessAPI(ctx, state, opt.timeout); err != nil {
			_ = terminateProcess(cmd.Process)
			state.Status = "failed"
			_ = writeSandboxState(state)
			return sandboxState{}, err
		}
		fmt.Println("process_api=ready")
	}
	if err := writeSandboxState(state); err != nil {
		_ = terminateProcess(cmd.Process)
		return sandboxState{}, err
	}
	started = true
	return state, nil
}

func validateProcessAPIOptions(opt options) error {
	if opt.processAPIBin == "" {
		return errors.New("process-api binary path is required")
	}
	switch opt.processAPITransport {
	case "tcp":
		if opt.processAPITCPPort == 0 {
			return errors.New("process-api TCP port must be positive")
		}
	case "vsock":
		if opt.processAPIPort == 0 {
			return errors.New("process-api vsock port must be positive")
		}
	default:
		return fmt.Errorf("unsupported process-api transport %q", opt.processAPITransport)
	}
	return nil
}

func parseEnv(items []string) map[string]string {
	if len(items) == 0 {
		return nil
	}
	env := make(map[string]string, len(items))
	for _, item := range items {
		key, value, ok := strings.Cut(item, "=")
		if !ok || key == "" {
			continue
		}
		env[key] = value
	}
	return env
}

func firecrackerArch() (string, error) {
	switch runtime.GOARCH {
	case "amd64":
		return "x86_64", nil
	case "arm64":
		return "aarch64", nil
	default:
		return "", fmt.Errorf("unsupported architecture %s", runtime.GOARCH)
	}
}

func latestCIPrefix(ctx context.Context) (string, error) {
	result, err := listBucket(ctx, "firecracker-ci/", true)
	if err != nil {
		return "", err
	}
	var prefixes []string
	for _, item := range result.CommonPrefixes {
		prefixes = append(prefixes, item.Prefix)
	}
	sort.Strings(prefixes)
	if len(prefixes) == 0 {
		return "", errors.New("no Firecracker CI artifact prefixes found")
	}
	return prefixes[len(prefixes)-1], nil
}

func latestKey(ctx context.Context, prefix string, pattern *regexp.Regexp) (string, error) {
	result, err := listBucket(ctx, prefix, false)
	if err != nil {
		return "", err
	}
	var keys []string
	for _, item := range result.Contents {
		if pattern.MatchString(item.Key) {
			keys = append(keys, item.Key)
		}
	}
	sort.Strings(keys)
	if len(keys) == 0 {
		return "", fmt.Errorf("no artifact keys found for prefix %s", prefix)
	}
	return keys[len(keys)-1], nil
}

func listBucket(ctx context.Context, prefix string, delimiter bool) (listBucketResult, error) {
	url := ciArtifactBucket + "?list-type=2&prefix=" + prefix
	if delimiter {
		url += "&delimiter=/"
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return listBucketResult{}, err
	}
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return listBucketResult{}, err
	}
	defer resp.Body.Close()
	if resp.StatusCode >= 300 {
		return listBucketResult{}, fmt.Errorf("list bucket failed: %s", resp.Status)
	}
	var result listBucketResult
	if err := xml.NewDecoder(resp.Body).Decode(&result); err != nil {
		return listBucketResult{}, err
	}
	return result, nil
}

func downloadIfMissing(ctx context.Context, url, path string) error {
	if info, err := os.Stat(path); err == nil && info.Size() > 0 {
		fmt.Printf("asset_cached=%s\n", path)
		return nil
	}
	fmt.Printf("download=%s\n", url)
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return err
	}
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	if resp.StatusCode >= 300 {
		return fmt.Errorf("download failed: %s", resp.Status)
	}
	tmp := path + ".tmp"
	out, err := os.Create(tmp)
	if err != nil {
		return err
	}
	if _, err := io.Copy(out, resp.Body); err != nil {
		_ = out.Close()
		return err
	}
	if err := out.Close(); err != nil {
		return err
	}
	return os.Rename(tmp, path)
}

func buildExt4Rootfs(ctx context.Context, opt options, squashPath, ext4Path string) error {
	squashDir := filepath.Join(opt.workDir, "squashfs-root")
	_ = os.RemoveAll(squashDir)
	if err := runPassthrough(ctx, false, "unsquashfs", "-q", "-d", squashDir, squashPath); err != nil {
		return err
	}
	if err := runPassthrough(ctx, opt.useSudo, "chown", "-R", "root:root", squashDir); err != nil {
		return err
	}
	_ = os.Remove(ext4Path)
	if err := runPassthrough(ctx, false, "truncate", "-s", "1G", ext4Path); err != nil {
		return err
	}
	if err := runPassthrough(ctx, opt.useSudo, "mkfs.ext4", "-q", "-d", squashDir, "-F", ext4Path); err != nil {
		return err
	}
	if opt.useSudo {
		if err := runPassthrough(ctx, true, "chown", fmt.Sprintf("%d:%d", os.Getuid(), os.Getgid()), ext4Path); err != nil {
			return err
		}
	}
	return nil
}

func installFirecracker(ctx context.Context, opt options, arch, target string) error {
	version := opt.firecrackerVersion
	if version == "latest" {
		resp, err := http.DefaultClient.Get("https://github.com/firecracker-microvm/firecracker/releases/latest")
		if err != nil {
			return err
		}
		_ = resp.Body.Close()
		version = filepath.Base(resp.Request.URL.Path)
	}
	url := fmt.Sprintf("https://github.com/firecracker-microvm/firecracker/releases/download/%s/firecracker-%s-%s.tgz", version, version, arch)
	archivePath := filepath.Join(opt.workDir, "firecracker-"+version+"-"+arch+".tgz")
	if err := downloadIfMissing(ctx, url, archivePath); err != nil {
		return err
	}
	file, err := os.Open(archivePath)
	if err != nil {
		return err
	}
	defer file.Close()
	gz, err := gzip.NewReader(file)
	if err != nil {
		return err
	}
	defer gz.Close()
	tr := tar.NewReader(gz)
	want := "firecracker-" + version + "-" + arch
	for {
		header, err := tr.Next()
		if errors.Is(err, io.EOF) {
			break
		}
		if err != nil {
			return err
		}
		if filepath.Base(header.Name) != want {
			continue
		}
		out, err := os.OpenFile(target, os.O_CREATE|os.O_TRUNC|os.O_WRONLY, 0o755)
		if err != nil {
			return err
		}
		if _, err := io.Copy(out, tr); err != nil {
			_ = out.Close()
			return err
		}
		return out.Close()
	}
	return fmt.Errorf("firecracker binary %s not found in archive", want)
}

func putJSON(ctx context.Context, client *http.Client, path, body string) error {
	req, err := http.NewRequestWithContext(ctx, http.MethodPut, "http://unix"+path, strings.NewReader(body))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	if resp.StatusCode >= 300 {
		data, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("firecracker %s failed: %s %s", path, resp.Status, strings.TrimSpace(string(data)))
	}
	return nil
}

func firecrackerClient(socketPath string) *http.Client {
	return &http.Client{
		Transport: &http.Transport{
			DialContext: func(ctx context.Context, network, addr string) (net.Conn, error) {
				return (&net.Dialer{}).DialContext(ctx, "unix", socketPath)
			},
		},
		Timeout: 10 * time.Second,
	}
}

func waitForSocket(path string, timeout time.Duration) error {
	deadline := time.Now().Add(timeout)
	for time.Now().Before(deadline) {
		if info, err := os.Stat(path); err == nil && info.Mode()&os.ModeSocket != 0 {
			return nil
		}
		time.Sleep(100 * time.Millisecond)
	}
	return fmt.Errorf("timed out waiting for Firecracker API socket %s", path)
}

func waitForConsole(path string, timeout time.Duration) error {
	deadline := time.Now().Add(timeout)
	signals := []string{"login:", "Welcome to Ubuntu", "Freeing unused kernel", "Run /init as init process"}
	var last string
	for time.Now().Before(deadline) {
		data, _ := os.ReadFile(path)
		last = string(data)
		for _, signal := range signals {
			if strings.Contains(last, signal) {
				fmt.Printf("guest_signal=%q\n", signal)
				return nil
			}
		}
		time.Sleep(500 * time.Millisecond)
	}
	if len(last) > 2000 {
		last = last[len(last)-2000:]
	}
	return fmt.Errorf("guest boot signal not found before timeout; console tail:\n%s", last)
}

func waitForProcessAPI(ctx context.Context, state sandboxState, timeout time.Duration) (processAPIHealth, error) {
	deadline := time.Now().Add(timeout)
	var lastErr error
	for time.Now().Before(deadline) {
		health, err := getProcessAPIHealth(ctx, state)
		if err == nil {
			return health, nil
		}
		lastErr = err
		time.Sleep(500 * time.Millisecond)
	}
	return processAPIHealth{}, fmt.Errorf("process-api did not become ready before timeout: %w", lastErr)
}

func getProcessAPIHealth(ctx context.Context, state sandboxState) (processAPIHealth, error) {
	if err := validateProcessAPIState(state); err != nil {
		return processAPIHealth{}, err
	}
	client := processAPIClient(state)
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, processAPIURL(state, "/healthz"), nil)
	if err != nil {
		return processAPIHealth{}, err
	}
	resp, err := client.Do(req)
	if err != nil {
		return processAPIHealth{}, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		data, _ := io.ReadAll(resp.Body)
		return processAPIHealth{}, fmt.Errorf("process-api health failed: %s %s", resp.Status, strings.TrimSpace(string(data)))
	}
	var health processAPIHealth
	if err := json.NewDecoder(resp.Body).Decode(&health); err != nil {
		return processAPIHealth{}, err
	}
	if !health.OK || health.Service != "process-api" {
		return processAPIHealth{}, fmt.Errorf("unexpected process-api health response: %+v", health)
	}
	return health, nil
}

func execProcessAPI(ctx context.Context, state sandboxState, request processAPIExecRequest) (processAPIExecResponse, error) {
	if err := validateProcessAPIState(state); err != nil {
		return processAPIExecResponse{}, err
	}
	if len(request.Argv) == 0 {
		return processAPIExecResponse{}, errors.New("guest command is required")
	}
	if request.Cwd == "" {
		request.Cwd = "/"
	}
	var body bytes.Buffer
	if err := json.NewEncoder(&body).Encode(request); err != nil {
		return processAPIExecResponse{}, err
	}
	client := processAPIClient(state)
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, processAPIURL(state, "/exec"), &body)
	if err != nil {
		return processAPIExecResponse{}, err
	}
	req.Header.Set("Content-Type", "application/json")
	resp, err := client.Do(req)
	if err != nil {
		return processAPIExecResponse{}, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		data, _ := io.ReadAll(resp.Body)
		return processAPIExecResponse{}, fmt.Errorf("process-api exec failed: %s %s", resp.Status, strings.TrimSpace(string(data)))
	}
	var result processAPIExecResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return processAPIExecResponse{}, err
	}
	return result, nil
}

func startProcessAPI(ctx context.Context, state sandboxState, request processAPIProcessRequest) (processAPIProcessResponse, error) {
	if err := validateProcessAPIState(state); err != nil {
		return processAPIProcessResponse{}, err
	}
	if len(request.Argv) == 0 {
		return processAPIProcessResponse{}, errors.New("guest command is required")
	}
	if request.Cwd == "" {
		request.Cwd = "/"
	}
	var body bytes.Buffer
	if err := json.NewEncoder(&body).Encode(request); err != nil {
		return processAPIProcessResponse{}, err
	}
	client := processAPIClient(state)
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, processAPIURL(state, "/processes"), &body)
	if err != nil {
		return processAPIProcessResponse{}, err
	}
	req.Header.Set("Content-Type", "application/json")
	resp, err := client.Do(req)
	if err != nil {
		return processAPIProcessResponse{}, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		data, _ := io.ReadAll(resp.Body)
		return processAPIProcessResponse{}, fmt.Errorf("process-api process start failed: %s %s", resp.Status, strings.TrimSpace(string(data)))
	}
	var result processAPIProcessResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return processAPIProcessResponse{}, err
	}
	return result, nil
}

func getProcessAPIProcess(ctx context.Context, state sandboxState, processID string) (processAPIProcessResponse, error) {
	if err := validateProcessAPIState(state); err != nil {
		return processAPIProcessResponse{}, err
	}
	if processID == "" {
		return processAPIProcessResponse{}, errors.New("process id is required")
	}
	client := processAPIClient(state)
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, processAPIURL(state, "/processes/"+processID), nil)
	if err != nil {
		return processAPIProcessResponse{}, err
	}
	resp, err := client.Do(req)
	if err != nil {
		return processAPIProcessResponse{}, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		data, _ := io.ReadAll(resp.Body)
		return processAPIProcessResponse{}, fmt.Errorf("process-api process status failed: %s %s", resp.Status, strings.TrimSpace(string(data)))
	}
	var result processAPIProcessResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return processAPIProcessResponse{}, err
	}
	return result, nil
}

func signalProcessAPI(ctx context.Context, state sandboxState, processID, signal string) (processAPIProcessResponse, error) {
	if err := validateProcessAPIState(state); err != nil {
		return processAPIProcessResponse{}, err
	}
	if processID == "" {
		return processAPIProcessResponse{}, errors.New("process id is required")
	}
	var body bytes.Buffer
	if err := json.NewEncoder(&body).Encode(processAPISignalRequest{Signal: signal}); err != nil {
		return processAPIProcessResponse{}, err
	}
	client := processAPIClient(state)
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, processAPIURL(state, "/processes/"+processID+"/signal"), &body)
	if err != nil {
		return processAPIProcessResponse{}, err
	}
	req.Header.Set("Content-Type", "application/json")
	resp, err := client.Do(req)
	if err != nil {
		return processAPIProcessResponse{}, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		data, _ := io.ReadAll(resp.Body)
		return processAPIProcessResponse{}, fmt.Errorf("process-api process signal failed: %s %s", resp.Status, strings.TrimSpace(string(data)))
	}
	var result processAPIProcessResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return processAPIProcessResponse{}, err
	}
	return result, nil
}

func printProcess(process processAPIProcessResponse) {
	fmt.Printf("process=%s\nstatus=%s\npid=%d\nexit_code=%d\ntimed_out=%t\nduration_ms=%d\n",
		process.ID,
		process.Status,
		process.PID,
		process.ExitCode,
		process.TimedOut,
		process.DurationMillis,
	)
	if process.Stdout != "" {
		fmt.Printf("stdout=%q\n", process.Stdout)
	}
	if process.Stderr != "" {
		fmt.Printf("stderr=%q\n", process.Stderr)
	}
	if process.Error != "" {
		fmt.Printf("error=%q\n", process.Error)
	}
}

func validateProcessAPIState(state sandboxState) error {
	if !state.ProcessAPI {
		return fmt.Errorf("sandbox %s was not started with process-api", state.ID)
	}
	switch state.ProcessTransport {
	case "tcp":
		if state.GuestIP == "" || state.ProcessTCPPort == 0 {
			return fmt.Errorf("sandbox %s is missing process-api TCP metadata", state.ID)
		}
	case "vsock":
		if state.VsockPath == "" || state.ProcessPort == 0 {
			return fmt.Errorf("sandbox %s is missing process-api vsock metadata", state.ID)
		}
	default:
		return fmt.Errorf("sandbox %s has unsupported process-api transport %q", state.ID, state.ProcessTransport)
	}
	return nil
}

func processAPIClient(state sandboxState) *http.Client {
	if state.ProcessTransport == "tcp" {
		return &http.Client{
			Transport: &http.Transport{Proxy: nil},
			Timeout:   10 * time.Second,
		}
	}
	return &http.Client{
		Transport: &http.Transport{
			Proxy: nil,
			DialContext: func(ctx context.Context, network, addr string) (net.Conn, error) {
				return dialFirecrackerVsock(ctx, state.VsockPath, state.ProcessPort)
			},
		},
		Timeout: 10 * time.Second,
	}
}

func processAPIURL(state sandboxState, path string) string {
	if state.ProcessTransport == "tcp" {
		return fmt.Sprintf("http://%s:%d%s", state.GuestIP, state.ProcessTCPPort, path)
	}
	return "http://process-api" + path
}

func dialFirecrackerVsock(ctx context.Context, udsPath string, port uint32) (net.Conn, error) {
	var dialer net.Dialer
	conn, err := dialer.DialContext(ctx, "unix", udsPath)
	if err != nil {
		return nil, err
	}
	if _, err := fmt.Fprintf(conn, "CONNECT %d\n", port); err != nil {
		_ = conn.Close()
		return nil, err
	}
	reader := bufio.NewReader(conn)
	line, err := reader.ReadString('\n')
	if err != nil {
		_ = conn.Close()
		return nil, err
	}
	if !strings.HasPrefix(line, "OK ") {
		_ = conn.Close()
		return nil, fmt.Errorf("Firecracker vsock connect failed: %s", strings.TrimSpace(line))
	}
	return &bufferedConn{Conn: conn, reader: reader}, nil
}

type bufferedConn struct {
	net.Conn
	reader *bufio.Reader
}

func (conn *bufferedConn) Read(data []byte) (int, error) {
	return conn.reader.Read(data)
}

func requireCommand(name string) error {
	if _, err := commandPath(name); err != nil {
		return err
	}
	return nil
}

func commandPath(name string) (string, error) {
	if path, err := exec.LookPath(name); err == nil {
		return path, nil
	}
	for _, dir := range []string{"/usr/sbin", "/sbin", "/usr/local/sbin"} {
		path := filepath.Join(dir, name)
		if info, err := os.Stat(path); err == nil && !info.IsDir() && info.Mode()&0o111 != 0 {
			return path, nil
		}
	}
	return "", fmt.Errorf("required command %q is missing from PATH and standard sbin locations", name)
}

func runPassthrough(ctx context.Context, sudo bool, name string, args ...string) error {
	cmdName := name
	cmdArgs := args
	if sudo {
		cmdName = "sudo"
		cmdArgs = append([]string{name}, args...)
	}
	cmd := exec.CommandContext(ctx, cmdName, cmdArgs...)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	return cmd.Run()
}

func runShell(ctx context.Context, sudo bool, script, dir string) error {
	cmd := exec.CommandContext(ctx, "bash", "-lc", script)
	if sudo {
		cmd = exec.CommandContext(ctx, "sudo", "bash", "-lc", script)
	}
	cmd.Dir = dir
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	return cmd.Run()
}

func grepCount(path string, pattern *regexp.Regexp) (int, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return 0, err
	}
	return len(pattern.FindAll(data, -1)), nil
}

func terminateProcess(process *os.Process) error {
	if process == nil {
		return nil
	}
	_ = process.Signal(syscall.SIGTERM)
	done := make(chan error, 1)
	go func() {
		_, err := process.Wait()
		done <- err
	}()
	select {
	case <-time.After(3 * time.Second):
		_ = process.Kill()
		<-done
	case <-done:
	}
	return nil
}

func terminatePID(pid int) error {
	if pid <= 0 {
		return nil
	}
	process, err := os.FindProcess(pid)
	if err != nil {
		return err
	}
	_ = syscall.Kill(-pid, syscall.SIGTERM)
	_ = process.Signal(syscall.SIGTERM)
	deadline := time.Now().Add(3 * time.Second)
	for time.Now().Before(deadline) {
		if !isProcessAlive(pid) {
			return nil
		}
		time.Sleep(100 * time.Millisecond)
	}
	_ = syscall.Kill(-pid, syscall.SIGKILL)
	_ = process.Kill()
	for i := 0; i < 20; i++ {
		if !isProcessAlive(pid) {
			return nil
		}
		time.Sleep(100 * time.Millisecond)
	}
	if isProcessAlive(pid) {
		return fmt.Errorf("pid %d did not exit after SIGKILL", pid)
	}
	return nil
}

func isProcessAlive(pid int) bool {
	if pid <= 0 {
		return false
	}
	if runtime.GOOS == "linux" {
		data, err := os.ReadFile(fmt.Sprintf("/proc/%d/stat", pid))
		if errors.Is(err, os.ErrNotExist) {
			return false
		}
		if err == nil {
			parts := strings.SplitN(string(data), ") ", 2)
			if len(parts) == 2 && len(parts[1]) > 0 {
				return parts[1][0] != 'Z'
			}
		}
	}
	err := syscall.Kill(pid, 0)
	return err == nil || errors.Is(err, syscall.EPERM)
}
