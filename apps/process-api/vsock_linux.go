package main

import (
	"errors"
	"net"
	"os"
	"strconv"

	"golang.org/x/sys/unix"
)

func listenVsock(port uint32) (net.Listener, error) {
	fd, err := unix.Socket(unix.AF_VSOCK, unix.SOCK_STREAM|unix.SOCK_CLOEXEC, 0)
	if err != nil {
		return nil, err
	}
	if err := unix.Bind(fd, &unix.SockaddrVM{CID: unix.VMADDR_CID_ANY, Port: port}); err != nil {
		_ = unix.Close(fd)
		return nil, err
	}
	if err := unix.Listen(fd, 16); err != nil {
		_ = unix.Close(fd)
		return nil, err
	}
	file := os.NewFile(uintptr(fd), "vsock:"+strconv.FormatUint(uint64(port), 10))
	if file == nil {
		_ = unix.Close(fd)
		return nil, errors.New("failed to wrap vsock file descriptor")
	}
	defer file.Close()
	return net.FileListener(file)
}

func powerOff() error {
	return unix.Reboot(unix.LINUX_REBOOT_CMD_POWER_OFF)
}
