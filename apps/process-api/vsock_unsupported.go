//go:build !linux

package main

import (
	"errors"
	"net"
)

func listenVsock(port uint32) (net.Listener, error) {
	return nil, errors.New("process-api vsock listener requires Linux")
}

func powerOff() error {
	return errors.New("process-api shutdown requires Linux")
}
