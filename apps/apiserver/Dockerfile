FROM golang:1.23-alpine AS build

WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY apps/apiserver ./apps/apiserver
RUN CGO_ENABLED=0 GOOS=linux go build -o /out/apiserver ./apps/apiserver

FROM alpine:3.20

RUN apk add --no-cache ca-certificates tzdata
COPY --from=build /out/apiserver /usr/local/bin/apiserver

EXPOSE 8080
ENTRYPOINT ["apiserver"]
