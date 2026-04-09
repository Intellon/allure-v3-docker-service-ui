# Allure Docker Service UI

[![Build](https://github.com/Intellon/allure-v3-docker-service-ui/actions/workflows/docker-publish.yml/badge.svg?branch=develop)](https://github.com/Intellon/allure-v3-docker-service-ui/actions?query=branch%3Adevelop)

UI for the [Allure Docker Service](https://github.com/fescobar/allure-docker-service) API. Built with React 18, MUI 5, Vite 6.

**Image:** `ghcr.io/intellon/allure-docker-service-ui`

## Usage

### Docker Compose

```yaml
services:
  allure:
    image: "ghcr.io/intellon/allure-docker-service"
    environment:
      CHECK_RESULTS_EVERY_SECONDS: NONE
      KEEP_HISTORY: 1
    ports:
      - "5050:5050"
    volumes:
      - ./projects:/app/projects

  allure-ui:
    image: "ghcr.io/intellon/allure-docker-service-ui"
    environment:
      ALLURE_DOCKER_PUBLIC_API_URL: "http://localhost:7272"
    ports:
      - "5252:5252"
```

```sh
docker compose up -d
```

Open http://localhost:5252/allure-docker-service-ui

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `ALLURE_DOCKER_PUBLIC_API_URL` | - | URL to the Allure Docker Service API |
| `ALLURE_DOCKER_PUBLIC_API_URL_PREFIX` | - | Custom prefix for the API URL |
| `URL_PREFIX` | - | Custom URL prefix (e.g. for reverse proxy) |

## Local Development

### Prerequisites
- [Node.js 22+](https://nodejs.org/)
- [Docker](https://docs.docker.com/get-docker/)

### Start backend + UI via Docker Compose
```sh
docker compose -f docker-compose-dev.yml up -d --build
```
- **Allure Backend:** http://localhost:7272
- **Allure UI:** http://localhost:7474/allure-docker-service-ui

```sh
# View logs
docker compose -f docker-compose-dev.yml logs -f

# Stop
docker compose -f docker-compose-dev.yml down
```

### Start UI without Docker (dev server)
```sh
docker compose -f docker-compose-dev.yml up -d allure   # start backend only
cd ui
npm install
npm start                                                # http://localhost:4000
```

The file `ui/public/env-config.js` contains the API URL config for local dev.

## Local Docker Build & Test

Build and run only locally (without pushing to any registry):
```sh
# Build
docker build -t allure-docker-service-ui -f docker/Dockerfile .

# Run
docker run -d -p 5252:5252 -e ALLURE_DOCKER_PUBLIC_API_URL=http://localhost:7272 allure-docker-service-ui

# Test
curl http://localhost:5252/allure-docker-service-ui/version
```
Open http://localhost:5252/allure-docker-service-ui

Stop:
```sh
docker rm -f $(docker ps -q --filter ancestor=allure-docker-service-ui)
```

## Build & Push to GHCR

### CI/CD
The pipeline runs automatically on version tags and can be triggered manually. It builds multi-arch (amd64, arm64, arm/v7) and pushes to `ghcr.io/intellon/allure-docker-service-ui`.

**Automatic** — push a version tag:
```sh
git tag v3.4.0
git push origin v3.4.0
```

**Manual** — trigger via GitHub UI:
Go to **Actions > Allure Docker Service UI Workflow > Run workflow**, enter the version (e.g. `3.4.0`) and choose whether to tag as `latest`.

**Prerequisite:** Enable **Settings > Actions > General > Workflow permissions > Read and write permissions** in your GitHub repository.

### Manual

```sh
# 1. Login
echo $GITHUB_TOKEN | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin

# 2. Build
docker build -t ghcr.io/intellon/allure-docker-service-ui:3.4.0 \
  -f docker/Dockerfile \
  --build-arg VERSION=$(git describe --tags --always) \
  --build-arg VCS_REF=$(git rev-parse --short HEAD) \
  --build-arg BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ') .

# 3. Push
docker push ghcr.io/intellon/allure-docker-service-ui:3.4.0
```

**GitHub Token:** Settings > Developer Settings > Personal Access Tokens (classic) with scopes `write:packages`, `read:packages`.
