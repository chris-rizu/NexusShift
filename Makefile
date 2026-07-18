.PHONY: help up down restart logs build clean install dev-admin dev-worker

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

up: ## Start all services
	docker-compose up -d

down: ## Stop all services
	docker-compose down

down-volumes: ## Stop all services and remove volumes
	docker-compose down -v

restart: ## Restart all services
	docker-compose restart

logs: ## Show logs from all services
	docker-compose logs -f

logs-admin: ## Show admin dashboard logs
	docker-compose logs -f admin-dashboard

logs-worker: ## Show worker agent logs
	docker-compose logs -f worker-agent

logs-db: ## Show database logs
	docker-compose logs -f postgres

build: ## Build all Docker images
	docker-compose build

rebuild: ## Rebuild all images without cache
	docker-compose build --no-cache

clean: ## Remove all containers, networks, and volumes
	docker-compose down -v
	docker system prune -f

install: ## Install dependencies
	npm install

dev-admin: ## Start admin dashboard in development mode
	cd packages/admin-dashboard && npm run dev

dev-worker: ## Start worker agent in development mode
	cd packages/worker-agent && npm run dev

db-shell: ## Open PostgreSQL shell
	docker-compose exec postgres psql -U espionage -d espionage

redis-cli: ## Open Redis CLI
	docker-compose exec redis redis-cli

db-backup: ## Backup PostgreSQL database
	docker-compose exec postgres pg_dump -U espionage espionage > backup_$$(date +%Y%m%d_%H%M%S).sql

db-restore: ## Restore PostgreSQL database (usage: make db-restore FILE=backup.sql)
	docker-compose exec -T postgres psql -U espionage espionage < $(FILE)

stats: ## Show container resource usage
	docker stats

ps: ## List all containers
	docker-compose ps

top: ## Show running processes
	docker-compose top
