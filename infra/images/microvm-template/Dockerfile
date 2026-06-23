FROM golang:1.23-bookworm AS process-api

WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY apps/process-api ./apps/process-api
RUN CGO_ENABLED=0 GOOS=linux go build -o /out/process-api ./apps/process-api

FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y --no-install-recommends \
  bash \
  ca-certificates \
  curl \
  git \
  iproute2 \
  nodejs \
  npm \
  openssh-client \
  openssh-server \
  python3 \
  python3-pip \
  systemd \
  && rm -rf /var/lib/apt/lists/*

COPY --from=process-api /out/process-api /opt/managed-agents/bin/process-api
WORKDIR /workspace
CMD ["/bin/bash"]
