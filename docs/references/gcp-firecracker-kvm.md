# GCP Firecracker KVM Harness

Use this reference when an agent needs a disposable Google Cloud VM that can run
Firecracker microVMs through KVM.

This document is intentionally redacted. Do not record personal Google accounts,
billing account IDs, public VM IPs, SSH keys, or one-off project IDs here.

## Known Working Shape

- Cloud: Google Cloud Compute Engine.
- Current reusable harness project: `fc-harness-20260617` with display name
  `firecracker-harness`.
- VM family: Intel-based N2.
- Tested machine type: `n2-standard-4`.
- Tested guest image: Debian 12.
- Tested Firecracker release: `v1.16.0`.
- Tested microVM guest: Ubuntu 22.04 rootfs from Firecracker CI artifacts.
- Required VM option: `--enable-nested-virtualization`.
- Required CPU platform for N2: `Intel Cascade Lake` or newer.
- Current reusable harness VM: `fc-kvm-test-1` in `us-east1-b`.

Avoid these machine families for this harness:

- `e2-*`
- AMD families such as `n2d-*`, `t2d-*`, and AMD compute-optimized variants
- Arm families
- memory-optimized families

Google Cloud nested virtualization exposes Intel VT-x to the L1 VM. Firecracker
then uses Linux KVM through `/dev/kvm` inside that VM.

## Create A Disposable Project

Use an isolated project so test instances, disks, firewall rules, and API enablement
do not leak into a shared project.

```bash
PROJECT_ID="fc-harness-YYYYMMDD"
BILLING_ACCOUNT="REDACTED_BILLING_ACCOUNT_ID"

gcloud projects create "$PROJECT_ID" --name="firecracker-harness"
gcloud billing projects link "$PROJECT_ID" --billing-account="$BILLING_ACCOUNT"
gcloud services enable compute.googleapis.com --project="$PROJECT_ID"
```

Keep the active `gcloud` project unchanged unless the task explicitly needs it.
Pass `--project="$PROJECT_ID"` on every command.

## Reuse The Existing Harness

The reusable project is intentionally small and should be stopped when idle.
Use these values unless a task explicitly creates a new disposable project:

```bash
PROJECT_ID="fc-harness-20260617"
ZONE="us-east1-b"
VM_NAME="fc-kvm-test-1"
```

The known VM shape is:

- `n2-standard-4`;
- Debian 12;
- 30 GB `pd-balanced` boot disk;
- `--enable-nested-virtualization`;
- `--min-cpu-platform="Intel Cascade Lake"`.

The VM may be `TERMINATED` when idle. Start it only when the task needs remote
KVM or Firecracker validation:

```bash
gcloud compute instances start "$VM_NAME" \
  --project="$PROJECT_ID" \
  --zone="$ZONE"
```

Stop it again before pausing work:

```bash
gcloud compute instances stop "$VM_NAME" \
  --project="$PROJECT_ID" \
  --zone="$ZONE" \
  --quiet
```

## Create A Nested-Virtualization VM

Start with `n2-standard-4`. It is more comfortable than a tiny highcpu shape for
kernel/rootfs downloads and smoke testing, while still being cheap enough for
short-lived harness work.

```bash
PROJECT_ID="fc-harness-YYYYMMDD"
ZONE="us-east1-b"
VM_NAME="fc-kvm-test-1"

gcloud compute instances create "$VM_NAME" \
  --project="$PROJECT_ID" \
  --zone="$ZONE" \
  --machine-type=n2-standard-4 \
  --image-family=debian-12 \
  --image-project=debian-cloud \
  --boot-disk-size=30GB \
  --boot-disk-type=pd-balanced \
  --enable-nested-virtualization \
  --min-cpu-platform="Intel Cascade Lake"
```

Zone capacity for `n2-standard-4` can be temporarily unavailable. If creation
fails with `ZONE_RESOURCE_POOL_EXHAUSTED`, retry another zone before changing
the machine family. During the initial validation, `us-central1-*` had temporary
capacity failures and an East Coast zone succeeded.

## Verify KVM

```bash
gcloud compute ssh "$VM_NAME" \
  --project="$PROJECT_ID" \
  --zone="$ZONE" \
  --command='set -eu
printf "kernel="; uname -r
printf "vmx_count="; grep -Ec "(^| )vmx( |$)" /proc/cpuinfo
printf "kvm_device="; ls -l /dev/kvm
printf "kvm_modules=\n"; lsmod | grep "^kvm" || true
printf "sudo_kvm_access="; sudo sh -c "test -r /dev/kvm && test -w /dev/kvm" && echo ok || echo fail
printf "cpu_model="; lscpu | sed -n "s/^Model name:[[:space:]]*//p" | head -1
sudo usermod -aG kvm "$USER" || true
'
```

Expected signals:

- `vmx_count` is greater than zero.
- `/dev/kvm` exists.
- `kvm_intel` and `kvm` modules are loaded.
- `sudo_kvm_access=ok`.

The current SSH user may need a fresh login before non-root access to `/dev/kvm`
works after being added to the `kvm` group. Running Firecracker with `sudo` is
acceptable for a smoke test.

## Sync Local Development To The Harness

Use `--tunnel-through-iap` for repeatable agent-driven SSH and copy commands.
The VM may receive an ephemeral public IP while running, but IAP avoids relying
on that address and matches the stopped/started lifecycle. Keep the project and
zone explicit:

```bash
PROJECT_ID="fc-harness-20260617"
ZONE="us-east1-b"
VM_NAME="fc-kvm-test-1"

gcloud compute ssh "$VM_NAME" \
  --project="$PROJECT_ID" \
  --zone="$ZONE" \
  --tunnel-through-iap
```

For one-shot syncs, use `gcloud compute scp`:

```bash
gcloud compute scp --recurse \
  apps/sandboxd apps/process-api \
  go.mod go.sum \
  "$VM_NAME:~/managed-agents/" \
  --project="$PROJECT_ID" \
  --zone="$ZONE" \
  --tunnel-through-iap
```

For compiled sandboxd and process-api binaries, compress locally and copy the
smaller archives through IAP:

```bash
GOOS=linux GOARCH=amd64 go build -o /tmp/managed-agents-sandboxd ./apps/sandboxd
GOOS=linux GOARCH=amd64 CGO_ENABLED=0 go build -o /tmp/managed-agents-process-api ./apps/process-api
gzip -c /tmp/managed-agents-sandboxd > /tmp/managed-agents-sandboxd.gz
gzip -c /tmp/managed-agents-process-api > /tmp/managed-agents-process-api.gz

gcloud compute scp \
  /tmp/managed-agents-sandboxd.gz \
  /tmp/managed-agents-process-api.gz \
  "$VM_NAME:/tmp/" \
  --project="$PROJECT_ID" \
  --zone="$ZONE" \
  --tunnel-through-iap

gcloud compute ssh "$VM_NAME" \
  --project="$PROJECT_ID" \
  --zone="$ZONE" \
  --tunnel-through-iap \
  --command='set -euo pipefail
gzip -dc /tmp/managed-agents-sandboxd.gz > /tmp/sandboxd
gzip -dc /tmp/managed-agents-process-api.gz > /tmp/process-api
chmod +x /tmp/sandboxd /tmp/process-api
sudo mkdir -p /opt/managed-agents/bin /opt/managed-agents/firecracker
sudo mv /tmp/sandboxd /opt/managed-agents/bin/sandboxd
sudo mv /tmp/process-api /opt/managed-agents/bin/process-api
sudo chown -R "$USER:$USER" /opt/managed-agents'
```

If local dirty changes belong to another workstream, create a clean git
worktree and sync from that worktree rather than from the primary checkout.

## Sandboxd Lifecycle Test

After syncing the compiled `sandboxd` binary, run the host-local lifecycle path
from the harness VM. This pulls the configured microVM image into the local
cache, starts one sandbox from that image, inspects its state, then stops it:

```bash
WORK_DIR=/opt/managed-agents/firecracker
SANDBOX_ID=sbx-harness

/opt/managed-agents/bin/sandboxd doctor \
  --work-dir "$WORK_DIR" \
  --sudo

/opt/managed-agents/bin/sandboxd pull \
  --work-dir "$WORK_DIR" \
  --image firecracker-ci-ubuntu-22.04 \
  --sudo

/opt/managed-agents/bin/sandboxd sandbox start "$SANDBOX_ID" \
  --work-dir "$WORK_DIR" \
  --image firecracker-ci-ubuntu-22.04 \
  --sudo \
  --timeout 120s

/opt/managed-agents/bin/sandboxd sandbox status "$SANDBOX_ID" \
  --work-dir "$WORK_DIR"

/opt/managed-agents/bin/sandboxd sandbox stop "$SANDBOX_ID" \
  --work-dir "$WORK_DIR"
```

Expected lifecycle signals:

- `pull` reports the resolved image, Firecracker binary, kernel, and base rootfs.
- `sandbox start` reports `status=running`, `booted=true`, a launcher PID, a
  sandbox directory, a console log, and a per-sandbox `rootfs.ext4`.
- `sandbox status` reports the same sandbox id and a live `running` status while
  the Firecracker process exists.
- `sandbox stop` reports `status=stopped`, and `pgrep -a firecracker` should not
  show the stopped sandbox process.

## Process API Guest Test

After syncing both binaries, run the first guest process-api path. The current
Firecracker CI Ubuntu rootfs does not ship kernel modules for guest AF_VSOCK, so
this milestone uses Firecracker tap networking and a guest TCP listener. The
`sandboxd` state still records the process-api transport explicitly so a later
rootfs with vsock support can switch transports without changing the lifecycle
shape.

```bash
WORK_DIR=/opt/managed-agents/firecracker
SANDBOX_ID=sbx-process-api

/opt/managed-agents/bin/sandboxd sandbox start "$SANDBOX_ID" \
  --work-dir "$WORK_DIR" \
  --image firecracker-ci-ubuntu-22.04 \
  --sudo \
  --process-api \
  --process-api-bin /opt/managed-agents/bin/process-api \
  --timeout 150s

/opt/managed-agents/bin/sandboxd sandbox ping "$SANDBOX_ID" \
  --work-dir "$WORK_DIR"

/opt/managed-agents/bin/sandboxd sandbox exec "$SANDBOX_ID" \
  --work-dir "$WORK_DIR" \
  -- /bin/uname -m

/opt/managed-agents/bin/sandboxd sandbox exec "$SANDBOX_ID" \
  --work-dir "$WORK_DIR" \
  --cwd /tmp \
  --env MA_EXEC_TEST=ok \
  -- /bin/sh -c 'printf cwd=; pwd; printf env=; printf "$MA_EXEC_TEST"'

PROCESS_OUTPUT=$(/opt/managed-agents/bin/sandboxd sandbox process start "$SANDBOX_ID" \
  --work-dir "$WORK_DIR" \
  -- /bin/sh -c 'printf begin; sleep 1; printf done')
printf '%s\n' "$PROCESS_OUTPUT"
PROCESS_ID=$(printf '%s\n' "$PROCESS_OUTPUT" | sed -n 's/^process=//p')

/opt/managed-agents/bin/sandboxd sandbox process status "$SANDBOX_ID" "$PROCESS_ID" \
  --work-dir "$WORK_DIR"
sleep 2
/opt/managed-agents/bin/sandboxd sandbox process status "$SANDBOX_ID" "$PROCESS_ID" \
  --work-dir "$WORK_DIR"

SLEEP_OUTPUT=$(/opt/managed-agents/bin/sandboxd sandbox process start "$SANDBOX_ID" \
  --work-dir "$WORK_DIR" \
  -- /bin/sleep 30)
SLEEP_ID=$(printf '%s\n' "$SLEEP_OUTPUT" | sed -n 's/^process=//p')

/opt/managed-agents/bin/sandboxd sandbox process signal "$SANDBOX_ID" "$SLEEP_ID" \
  --work-dir "$WORK_DIR" \
  --signal TERM

/opt/managed-agents/bin/sandboxd sandbox stop "$SANDBOX_ID" \
  --work-dir "$WORK_DIR"
```

Expected process-api signals:

- `sandbox start` reports `process_api=ready`.
- `sandbox ping` reports `service=process-api`, `os=linux`, and `arch=amd64`.
- `sandbox exec` returns guest command stdout plus `exit_code=0`.
- A failing guest command returns its stderr and non-zero `exit_code`.
- `sandbox process start/status` shows a running process, then an exited process
  with captured stdout.
- `sandbox process signal --signal TERM` moves a long-running process to an
  exited state with a signal error.
- `state.json` records `process_transport=tcp`, a tap name, host IP, guest IP,
  and guest MAC.
- The console log contains `process_api_ready`.
- After `sandbox stop`, both `pgrep -a firecracker` and `ip addr show | grep ma`
  should be empty for the stopped sandbox.

## Firecracker Smoke Test

Run this from inside the VM. It downloads the latest Firecracker release, pulls
the latest x86_64 Firecracker CI kernel/rootfs artifacts, converts the rootfs to
ext4, starts a 1 vCPU / 256 MiB microVM, and checks that the guest reaches the
serial console.

```bash
set -euo pipefail

WORK=/opt/firecracker-smoke
sudo mkdir -p "$WORK"
sudo chown "$USER:$USER" "$WORK"
cd "$WORK"

sudo apt-get update -y
sudo apt-get install -y curl wget squashfs-tools e2fsprogs

ARCH="$(uname -m)"
S3="https://s3.amazonaws.com/spec.ccfc.min"
CI_ARTIFACTS_PREFIX=$(curl -fsSL "$S3?list-type=2&prefix=firecracker-ci/&delimiter=/" \
  | grep -oP "(?<=<Prefix>)firecracker-ci/[0-9]{8}-[^/]+/(?=</Prefix>)" \
  | sort \
  | tail -1)

latest_kernel_key=$(curl -fsSL "$S3?list-type=2&prefix=${CI_ARTIFACTS_PREFIX}${ARCH}/vmlinux-" \
  | grep -oP "(?<=<Key>)(${CI_ARTIFACTS_PREFIX}${ARCH}/vmlinux-[0-9]+\.[0-9]+\.[0-9]{1,3})(?=</Key>)" \
  | sort -V \
  | tail -1)

latest_ubuntu_key=$(curl -fsSL "$S3?list-type=2&prefix=${CI_ARTIFACTS_PREFIX}${ARCH}/ubuntu-" \
  | grep -oP "(?<=<Key>)(${CI_ARTIFACTS_PREFIX}${ARCH}/ubuntu-[0-9]+\.[0-9]+\.squashfs)(?=</Key>)" \
  | sort -V \
  | tail -1)

KERNEL="$(basename "$latest_kernel_key")"
ROOTFS_SQUASH="$(basename "$latest_ubuntu_key")"
ROOTFS_EXT4="${ROOTFS_SQUASH%.squashfs}.ext4"

[ -f "$KERNEL" ] || wget -q "$S3/$latest_kernel_key"
[ -f "$ROOTFS_SQUASH" ] || wget -q "$S3/$latest_ubuntu_key"

rm -rf squashfs-root
unsquashfs -q "$ROOTFS_SQUASH"
sudo chown -R root:root squashfs-root
rm -f "$ROOTFS_EXT4"
truncate -s 1G "$ROOTFS_EXT4"
sudo mkfs.ext4 -q -d squashfs-root -F "$ROOTFS_EXT4"
sudo chown "$USER:$USER" "$ROOTFS_EXT4"

release_url="https://github.com/firecracker-microvm/firecracker/releases"
latest=$(basename "$(curl -fsSLI -o /dev/null -w "%{url_effective}" "$release_url/latest")")
curl -fsSL "$release_url/download/$latest/firecracker-$latest-$ARCH.tgz" | tar -xz
mv "release-$latest-$ARCH/firecracker-$latest-$ARCH" ./firecracker
chmod +x ./firecracker

API_SOCKET=/tmp/firecracker-smoke.socket
sudo rm -f "$API_SOCKET"
sudo ./firecracker --api-sock "$API_SOCKET" > firecracker.console.log 2>&1 &
FC_PID=$!

for _ in $(seq 1 50); do
  [ -S "$API_SOCKET" ] && break
  sleep 0.1
done
[ -S "$API_SOCKET" ]

sudo curl -fsS -X PUT --unix-socket "$API_SOCKET" \
  --data '{"log_path":"/opt/firecracker-smoke/firecracker.log","level":"Info","show_level":true,"show_log_origin":true}' \
  http://localhost/logger >/dev/null

sudo curl -fsS -X PUT --unix-socket "$API_SOCKET" \
  --data "{\"kernel_image_path\":\"$WORK/$KERNEL\",\"boot_args\":\"console=ttyS0 reboot=k panic=1 pci=off\"}" \
  http://localhost/boot-source >/dev/null

sudo curl -fsS -X PUT --unix-socket "$API_SOCKET" \
  --data "{\"drive_id\":\"rootfs\",\"path_on_host\":\"$WORK/$ROOTFS_EXT4\",\"is_root_device\":true,\"is_read_only\":false}" \
  http://localhost/drives/rootfs >/dev/null

sudo curl -fsS -X PUT --unix-socket "$API_SOCKET" \
  --data '{"vcpu_count":1,"mem_size_mib":256}' \
  http://localhost/machine-config >/dev/null

sudo curl -fsS -X PUT --unix-socket "$API_SOCKET" \
  --data '{"action_type":"InstanceStart"}' \
  http://localhost/actions >/dev/null

sleep 5
ps -p "$FC_PID" >/dev/null
tail -80 firecracker.console.log

sudo kill "$FC_PID" 2>/dev/null || true
sudo rm -f "$API_SOCKET"
```

Expected smoke-test signals:

- Firecracker API calls return successfully.
- The Firecracker process remains running after `InstanceStart`.
- `firecracker.console.log` shows the guest Linux boot.
- A successful guest reaches an Ubuntu login prompt or root shell prompt.

## Stop Or Delete

Stop the VM when pausing work:

```bash
gcloud compute instances stop "$VM_NAME" \
  --project="$PROJECT_ID" \
  --zone="$ZONE" \
  --quiet
```

Delete the whole project when the harness is no longer needed:

```bash
gcloud projects delete "$PROJECT_ID"
```

## References

- Google Cloud nested virtualization: https://cloud.google.com/compute/docs/instances/nested-virtualization/overview
- Google Cloud nested VM creation: https://cloud.google.com/compute/docs/instances/nested-virtualization/creating-nested-vms
- Firecracker getting started: https://github.com/firecracker-microvm/firecracker/blob/main/docs/getting-started.md
