FROM golang:1.23-alpine AS build

WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY apps/orchestrator ./apps/orchestrator
RUN CGO_ENABLED=0 GOOS=linux go build -o /out/orchestrator ./apps/orchestrator

FROM alpine:3.20

RUN apk add --no-cache ca-certificates tzdata
COPY --from=build /out/orchestrator /usr/local/bin/orchestrator

ENTRYPOINT ["orchestrator"]
