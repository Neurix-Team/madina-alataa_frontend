# ═════════════════════════════════════════════════════════════════
# 📘 Docker Guide - بطل العطاء Frontend
# ═════════════════════════════════════════════════════════════════

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Build Commands](#build-commands)
4. [Running the Container](#running-the-container)
5. [Docker Compose](#docker-compose)
6. [Health Checks](#health-checks)
7. [Troubleshooting](#troubleshooting)
8. [Production Deployment](#production-deployment)

---

## 🔧 Prerequisites {#prerequisites}

Make sure you have the following installed:
- **Docker**: Version 20.10 or higher
- **Docker Compose**: Version 2.0 or higher

Check versions:
```bash
docker --version
docker-compose --version
```

---

## 🚀 Quick Start {#quick-start}

### Option 1: Using Docker Compose (Recommended)

```bash
# Build and run all services
docker-compose up -d

# View logs
docker-compose logs -f frontend

# Stop all services
docker-compose down
```

### Option 2: Using Docker CLI

```bash
# Build the image
docker build -f Dockerfile.frontend -t madina-frontend:latest .

# Run the container
docker run -d -p 3000:80 --name madina-app madina-frontend:latest

# View logs
docker logs -f madina-app

# Stop the container
docker stop madina-app
docker rm madina-app
```

---

## 🏗️ Build Commands {#build-commands}

### Build the Docker Image

```bash
# Basic build
docker build -f Dockerfile.frontend -t madina-frontend:latest .

# Build with custom tag
docker build -f Dockerfile.frontend -t madina-frontend:v1.0.0 .

# Build without cache (fresh build)
docker build --no-cache -f Dockerfile.frontend -t madina-frontend:latest .

# Build with build arguments
docker build \
  --build-arg NODE_ENV=production \
  -f Dockerfile.frontend \
  -t madina-frontend:latest .
```

### List Built Images

```bash
docker images | grep madina
```

### Remove Old Images

```bash
# Remove specific image
docker rmi madina-frontend:latest

# Remove dangling images
docker image prune -f

# Remove all unused images
docker image prune -a
```

---

## 🏃 Running the Container {#running-the-container}

### Basic Run

```bash
docker run -d \
  --name madina-app \
  -p 3000:80 \
  madina-frontend:latest
```

### Run with Environment Variables

```bash
docker run -d \
  --name madina-app \
  -p 3000:80 \
  -e NODE_ENV=production \
  madina-frontend:latest
```

### Run with Resource Limits

```bash
docker run -d \
  --name madina-app \
  -p 3000:80 \
  --memory="512m" \
  --cpus="0.5" \
  madina-frontend:latest
```

### Run with Auto-Restart

```bash
docker run -d \
  --name madina-app \
  -p 3000:80 \
  --restart unless-stopped \
  madina-frontend:latest
```

---

## 🐳 Docker Compose {#docker-compose}

### Available Commands

```bash
# Build and start services
docker-compose up -d

# Build images only (no start)
docker-compose build

# Start services (without build)
docker-compose start

# Stop services (keep containers)
docker-compose stop

# Stop and remove containers
docker-compose down

# Stop and remove containers + volumes
docker-compose down -v

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f frontend

# Scale services (if needed)
docker-compose up -d --scale frontend=3

# Execute command inside container
docker-compose exec frontend sh

# Restart services
docker-compose restart

# View running services
docker-compose ps
```

### Environment-Specific Compose Files

```bash
# Development
docker-compose -f docker-compose.dev.yml up -d

# Production
docker-compose -f docker-compose.prod.yml up -d

# Multiple compose files
docker-compose -f docker-compose.yml -f docker-compose.override.yml up -d
```

---

## 🏥 Health Checks {#health-checks}

### Check Container Health

```bash
# View health status
docker ps

# Inspect health check details
docker inspect --format='{{json .State.Health}}' madina-app | jq

# View health check logs
docker inspect madina-app | jq '.[].State.Health.Log'
```

### Manual Health Check

```bash
# Test health endpoint
curl http://localhost:3000/health

# Expected response
# healthy
```

### Monitor Container

```bash
# Real-time stats
docker stats madina-app

# Container processes
docker top madina-app

# Container logs (last 100 lines)
docker logs --tail 100 madina-app

# Follow logs
docker logs -f madina-app
```

---

## 🔍 Troubleshooting {#troubleshooting}

### Container Won't Start

```bash
# Check container logs
docker logs madina-app

# Inspect container
docker inspect madina-app

# Check if port is already in use
netstat -ano | findstr :3000  # Windows
lsof -i :3000                 # Linux/Mac
```

### Build Failures

```bash
# Clean build (no cache)
docker build --no-cache -f Dockerfile.frontend -t madina-frontend .

# Check disk space
docker system df

# Clean up unused resources
docker system prune -a
```

### Access Container Shell

```bash
# Using docker run
docker run -it madina-frontend:latest sh

# Using docker exec (running container)
docker exec -it madina-app sh

# Using docker-compose
docker-compose exec frontend sh
```

### View Nginx Configuration

```bash
docker exec madina-app cat /etc/nginx/conf.d/default.conf
```

### Test Nginx Configuration

```bash
docker exec madina-app nginx -t
```

### Reload Nginx

```bash
docker exec madina-app nginx -s reload
```

---

## 🌐 Production Deployment {#production-deployment}

### Pre-deployment Checklist

- [ ] Environment variables configured
- [ ] SSL/TLS certificates ready (if using HTTPS)
- [ ] Database connection tested
- [ ] API endpoints verified
- [ ] Health checks working
- [ ] Logs configured
- [ ] Monitoring setup

### Deploy to Production Server

```bash
# 1. Build production image
docker build -f Dockerfile.frontend -t madina-frontend:v1.0.0 .

# 2. Tag image for registry (if using Docker Hub or private registry)
docker tag madina-frontend:v1.0.0 yourusername/madina-frontend:v1.0.0

# 3. Push to registry
docker push yourusername/madina-frontend:v1.0.0

# 4. On production server, pull image
docker pull yourusername/madina-frontend:v1.0.0

# 5. Run container
docker run -d \
  --name madina-production \
  -p 80:80 \
  --restart always \
  --memory="1g" \
  --cpus="1.0" \
  yourusername/madina-frontend:v1.0.0
```

### Using Docker Compose in Production

```bash
# On production server
docker-compose -f docker-compose.prod.yml up -d

# Update containers (zero-downtime)
docker-compose -f docker-compose.prod.yml up -d --no-deps --build frontend
```

### Backup Strategy

```bash
# Export container
docker export madina-app > madina-backup.tar

# Save image
docker save madina-frontend:latest > madina-image.tar

# Load image (on another machine)
docker load < madina-image.tar
```

---

## 📊 Performance Optimization

### Image Size Optimization

```bash
# Check image size
docker images madina-frontend

# Analyze layers
docker history madina-frontend:latest

# Use dive tool for layer analysis
dive madina-frontend:latest
```

### Multi-Platform Build (for ARM/AMD64)

```bash
# Setup buildx
docker buildx create --use

# Build for multiple platforms
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -f Dockerfile.frontend \
  -t madina-frontend:latest \
  --push .
```

---

## 🛡️ Security Best Practices

1. **Don't run as root** - Use non-privileged user
2. **Scan images** for vulnerabilities:
   ```bash
   docker scan madina-frontend:latest
   ```
3. **Use specific base image versions** - Avoid `latest` tag
4. **Minimize layers** - Combine RUN commands
5. **Remove unnecessary files** - Use `.dockerignore`
6. **Keep images updated** - Regular security patches

---

## 📞 Useful Commands Cheat Sheet

```bash
# Quick access to app
http://localhost:3000

# Quick logs
docker logs -f madina-app --tail 50

# Quick restart
docker restart madina-app

# Quick rebuild
docker-compose up -d --build frontend

# Quick cleanup
docker system prune -af --volumes

# Container shell access
docker exec -it madina-app sh

# Copy files from container
docker cp madina-app:/usr/share/nginx/html ./backup

# Copy files to container
docker cp ./file.txt madina-app:/usr/share/nginx/html/
```

---

## 🆘 Support

If you encounter issues:
1. Check logs: `docker logs madina-app`
2. Verify health: `curl http://localhost:3000/health`
3. Inspect container: `docker inspect madina-app`
4. Contact team for support

---

**Happy Dockerizing! 🐳**
