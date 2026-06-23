FROM alpine:3.20

RUN apk add --no-cache \
  bash \
  ca-certificates \
  curl \
  git \
  nodejs \
  npm \
  openssh-client \
  python3 \
  py3-pip

WORKDIR /workspace
CMD ["/bin/sh", "-c", "trap 'exit 0' TERM INT; while true; do sleep 3600; done"]
