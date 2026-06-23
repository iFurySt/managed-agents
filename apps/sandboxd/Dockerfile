FROM golang:1.23-alpine AS build

WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY apps/sandboxd ./apps/sandboxd
RUN CGO_ENABLED=0 GOOS=linux go build -o /out/sandboxd ./apps/sandboxd

FROM alpine:3.20

RUN apk add --no-cache ca-certificates docker-cli tzdata
COPY --from=build /out/sandboxd /usr/local/bin/sandboxd

EXPOSE 8787
ENTRYPOINT ["sandboxd"]
