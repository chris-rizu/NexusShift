# Docker Setup Guide

This guide covers running the Espionage Remote Worker Monitoring System using Docker.

## Prerequisites

- Docker Desktop installed and running
- Docker Compose (included with Docker Desktop)

## Quick Start

### 1. Configure Environment

```bash
# Copy the example environment file
cp .env.docker.example .env

# Edit with your Supabase credentials if needed
nano .env
```

### 2. Start All Services

```bash
# Start all services
docker-compose up -d

# Check status
docker-compose ps
```

This will start:
- **Admin Dashboard** on http://localhost:3000
- **Worker Agent** on http://localhost:3001
- **PostgreSQL** on localhost:5432
- **Redis** on localhost:6379
- **pgAdmin** on http://localhost:5050

### 3. View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f admin-dashboard
docker-compose logs -f worker-agent
```

### 4. Stop Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

## Service Details

### Admin Dashboard
- **URL**: http://localhost:3000
- **Purpose**: Management interface for monitoring workers
- **Default**: No default user - create via Supabase Auth

### Worker Agent
- **URL**: http://localhost:3001
- **Purpose**: Background monitoring application
- **Note**: In production, each worker needs their own instance

### PostgreSQL
- **Host**: localhost:5432
- **User**: espionage
- **Password**: espionage_dev_password
- **Database**: espionage
- **Purpose**: Local database (alternative to Supabase)

### Redis
- **Host**: localhost:6379
- **Purpose**: Caching and job queues

### pgAdmin
- **URL**: http://localhost:5050
- **Email**: admin@espionage.local
- **Password**: admin
- **Purpose**: Database management UI

## Development Workflow

### Build Images

```bash
# Build all images
docker-compose build

# Build specific service
docker-compose build admin-dashboard
docker-compose build worker-agent
```

### Rebuild After Changes

```bash
# Rebuild and restart
docker-compose up -d --build

# Force rebuild without cache
docker-compose build --no-cache
```

### Run Commands in Containers

```bash
# Admin dashboard
docker-compose exec admin-dashboard npm run dev

# Worker agent
docker-compose exec worker-agent npm run dev

# PostgreSQL
docker-compose exec postgres psql -U espionage -d espionage

# Redis
docker-compose exec redis redis-cli
```

## Docker Compose Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose stop

# Restart services
docker-compose restart

# View logs
docker-compose logs -f [service]

# Execute command
docker-compose exec [service] [command]

# Remove containers
docker-compose down

# Remove containers and volumes
docker-compose down -v

# View resource usage
docker-compose top
```

## Production Deployment

### Using Docker Compose

```bash
# Build production images
docker-compose -f docker-compose.yml build

# Start production stack
docker-compose -f docker-compose.yml up -d

# View logs
docker-compose -f docker-compose.yml logs -f
```

### Environment Variables

Set these in your `.env` file or Docker Compose:

```yaml
environment:
  - NODE_ENV=production
  - VITE_SUPABASE_URL=https://your-project.supabase.co
  - VITE_SUPABASE_ANON_KEY=your-anon-key
  - SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
  - SCREENSHOT_INTERVAL_MINUTES=5
  - IDLE_THRESHOLD_SECONDS=600
```

### Multiple Worker Instances

To run multiple worker agents, create multiple services in docker-compose.yml:

```yaml
services:
  worker-1:
    extends:
      file: docker-compose.yml
      service: worker-agent
    container_name: espionage-worker-1
    environment:
      - WORKER_ID=worker-1

  worker-2:
    extends:
      file: docker-compose.yml
      service: worker-agent
    container_name: espionage-worker-2
    environment:
      - WORKER_ID=worker-2
```

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker-compose logs [service]

# Check container status
docker-compose ps

# Restart service
docker-compose restart [service]
```

### Port Conflicts

If ports are already in use, modify in `docker-compose.yml`:

```yaml
ports:
  - "3001:3000"  # Change 3001 to available port
```

### Database Connection Issues

```bash
# Check PostgreSQL is running
docker-compose exec postgres pg_isready

# Test connection
docker-compose exec postgres psql -U espionage -d espionage
```

### Volume Issues

```bash
# List volumes
docker volume ls

# Remove volumes
docker-compose down -v

# Inspect volume
docker volume inspect espionage_postgres_data
```

### Clean Restart

```bash
# Stop everything
docker-compose down

# Remove volumes
docker-compose down -v

# Remove images (optional)
docker-compose down --rmi all

# Rebuild and start
docker-compose up -d --build
```

## Security Notes

### For Production

1. **Change Default Passwords**
   - PostgreSQL password in .env
   - pgAdmin credentials

2. **Use Secrets Management**
   - Docker Secrets or Swarm secrets
   - External secret manager (HashiCorp Vault)

3. **Network Isolation**
   - Use private networks
   - Restrict exposed ports
   - Use VPN for access

4. **Update Regularly**
   - Keep base images updated
   - Monitor for security updates

5. **Resource Limits**
   ```yaml
   deploy:
     resources:
       limits:
         memory: 512M
       reservations:
         memory: 256M
   ```

## Monitoring

### Container Stats

```bash
# Resource usage
docker stats

# Specific service
docker stats espionage-admin
```

### Health Checks

Services include health checks:
- PostgreSQL: `pg_isready`
- Redis: `redis-cli ping`
- Apps: HTTP endpoint checks

### Logs

```bash
# Real-time logs
docker-compose logs -f

# Last 100 lines
docker-compose logs --tail=100

# Since specific time
docker-compose logs --since 1h
```

## Backup and Restore

### Backup Database

```bash
# Backup PostgreSQL
docker-compose exec postgres pg_dump -U espionage espionage > backup.sql

# Backup volume
docker run --rm -v espionage_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres-backup.tar.gz /data
```

### Restore Database

```bash
# Restore PostgreSQL
docker-compose exec -T postgres psql -U espionage espionage < backup.sql

# Restore volume
docker run --rm -v espionage_postgres_data:/data -v $(pwd):/backup alpine tar xzf /backup/postgres-backup.tar.gz -C /
```

## Next Steps

1. **Configure Supabase**: Follow setup guide in `/packages/supabase/README.md`
2. **Set up authentication**: Create admin user via Supabase Auth
3. **Configure workers**: Register worker devices in the dashboard
4. **Deploy**: Use Docker Compose or Kubernetes for production

For additional help, see:
- [Docker Documentation](https://docs.docker.com)
- [Docker Compose Documentation](https://docs.docker.com/compose)
- [Main README](../README.md)
