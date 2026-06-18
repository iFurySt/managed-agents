package main

import (
	"archive/tar"
	"compress/gzip"
	"context"
	"encoding/xml"
	"errors"
	"fmt"
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

type options struct {
	workDir            string
	firecrackerVersion string
	vcpuCount          int
	memMiB             int
	timeout            time.Duration
	useSudo            bool
	keepAlive          bool
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
}

func main() {
	var opt options
	root := &cobra.Command{
		Use:   "sandboxd",
		Short: "Run and inspect local Firecracker sandboxes",
	}
	root.PersistentFlags().StringVar(&opt.workDir, "work-dir", "/opt/managed-agents/firecracker", "workspace for Firecracker binaries and guest assets")
	root.PersistentFlags().StringVar(&opt.firecrackerVersion, "firecracker-version", "latest", "Firecracker release tag or latest")
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
	fmt.Printf("firecracker=%s\nkernel=%s\nrootfs=%s\n", fcPath, kernelPath, rootfsExt4Path)
	return assets{firecracker: fcPath, kernel: kernelPath, rootfs: rootfsExt4Path}, nil
}

func smoke(ctx context.Context, opt options) error {
	if opt.vcpuCount <= 0 || opt.memMiB <= 0 {
		return errors.New("vcpu and mem-mib must be positive")
	}
	if err := doctor(ctx, opt); err != nil {
		return err
	}
	assets, err := prepareAssets(ctx, opt)
	if err != nil {
		return err
	}

	socketPath := filepath.Join(os.TempDir(), fmt.Sprintf("managed-agents-firecracker-%d.socket", time.Now().UnixNano()))
	consolePath := filepath.Join(opt.workDir, "firecracker.console.log")
	logPath := filepath.Join(opt.workDir, "firecracker.log")
	_ = os.Remove(socketPath)
	_ = os.Remove(consolePath)
	_ = os.Remove(logPath)

	cmd := exec.CommandContext(ctx, assets.firecracker, "--api-sock", socketPath)
	if opt.useSudo {
		cmd = exec.CommandContext(ctx, "sudo", assets.firecracker, "--api-sock", socketPath)
	}
	console, err := os.Create(consolePath)
	if err != nil {
		return err
	}
	defer console.Close()
	cmd.Stdout = console
	cmd.Stderr = console
	if err := cmd.Start(); err != nil {
		return err
	}
	defer func() {
		if opt.keepAlive {
			fmt.Printf("firecracker_pid=%d\n", cmd.Process.Pid)
			return
		}
		_ = terminateProcess(cmd.Process)
		_ = os.Remove(socketPath)
	}()

	if err := waitForSocket(socketPath, 5*time.Second); err != nil {
		return err
	}
	if opt.useSudo {
		_ = runPassthrough(ctx, true, "chmod", "666", socketPath)
	}
	client := firecrackerClient(socketPath)
	if err := putJSON(ctx, client, "/logger", fmt.Sprintf(`{"log_path":%q,"level":"Info","show_level":true,"show_log_origin":true}`, logPath)); err != nil {
		return err
	}
	if err := putJSON(ctx, client, "/boot-source", fmt.Sprintf(`{"kernel_image_path":%q,"boot_args":"console=ttyS0 reboot=k panic=1 pci=off"}`, assets.kernel)); err != nil {
		return err
	}
	if err := putJSON(ctx, client, "/drives/rootfs", fmt.Sprintf(`{"drive_id":"rootfs","path_on_host":%q,"is_root_device":true,"is_read_only":false}`, assets.rootfs)); err != nil {
		return err
	}
	if err := putJSON(ctx, client, "/machine-config", fmt.Sprintf(`{"vcpu_count":%d,"mem_size_mib":%d}`, opt.vcpuCount, opt.memMiB)); err != nil {
		return err
	}
	if err := putJSON(ctx, client, "/actions", `{"action_type":"InstanceStart"}`); err != nil {
		return err
	}

	if err := waitForConsole(consolePath, opt.timeout); err != nil {
		return err
	}
	fmt.Printf("microvm=booted console=%s\n", consolePath)
	return nil
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
