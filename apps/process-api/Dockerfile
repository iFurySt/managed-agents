FROM golang:1.23-alpine AS build

WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY apps/process-api ./apps/process-api
RUN CGO_ENABLED=0 GOOS=linux go build -o /out/process-api ./apps/process-api

FROM alpine:3.20

RUN apk add --no-cache ca-certificates tzdata
COPY --from=build /out/process-api /usr/local/bin/process-api

EXPOSE 8080
ENTRYPOINT ["process-api"]
