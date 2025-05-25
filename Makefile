.PHONY: build clean up down fishery-up uav-up client-up fishery-pact-up uav-pact-up all-up all-down all-pact-up all-pact-down test check-port check-port-prod develop test-client-cursor test-setup dev-up dev-down

build:
	docker-compose build

clean:
	docker-compose down -v
	docker system prune -f

up:
	docker-compose up -d

down:
	docker-compose down

fishery-up:
	docker-compose up -d fishery

uav-up:
	docker-compose up -d uav

client-up:
	docker-compose up -d client

fishery-pact-up:
	docker-compose up -d fishery-pact

uav-pact-up:
	docker-compose up -d uav-pact

# Development environment commands
dev-up:
	@echo "Starting development environment..."
	@echo "Checking Docker daemon..."
	@docker info > /dev/null 2>&1 || (echo "ERROR: Docker daemon is not running. Please start Docker Desktop." && exit 1)
	@echo "Building and starting services..."
	docker-compose up -d db fishery uav client
	@echo "Waiting for services to be ready..."
	@sleep 5
	@echo "Development environment is ready!"
	@echo "Fishery API: http://localhost:8000"
	@echo "UAV API: http://localhost:8001"
	@echo "Client: http://localhost:3000"

dev-down:
	@echo "Stopping development environment..."
	docker-compose down
	@echo "Development environment stopped."

# Health check commands
health-check:
	@echo "Checking service health..."
	@curl -f http://localhost:8000/api/fishery/health || echo "Fishery service is not healthy"
	@curl -f http://localhost:8001/api/uav/health || echo "UAV service is not healthy"
	@curl -f http://localhost:3000 || echo "Client service is not healthy"

# Ocean health check
ocean-health:
	@echo "Checking ocean health at coordinates..."
	@curl -X POST http://localhost:8000/api/ocean/health \
		-H "Content-Type: application/json" \
		-d '{"latitude": 0, "longitude": 0}'

# Start all services (fishery, uav, client, db, etc.)
all-up:
	docker-compose up -d fishery uav client db

# Stop all services
all-down:
	docker-compose down

# Start only PACT-related services (fishery, uav)
all-pact-up:
	docker-compose up -d fishery uav

# Stop only PACT-related services
all-pact-down:
	docker-compose stop fishery uav

# Check if port 3000 is in use and optionally clear it (interactive mode)
check-port:
	@if lsof -i :3000 > /dev/null; then \
		echo "Port 3000 is in use by:"; \
		lsof -i :3000; \
		echo "Would you like to kill the process? (y/n)"; \
		read answer; \
		if [ "$$answer" = "y" ]; then \
			lsof -ti :3000 | xargs kill -9; \
			echo "Process killed."; \
		else \
			echo "Please free up port 3000 manually."; \
			exit 1; \
		fi \
	else \
		echo "Port 3000 is available."; \
	fi

# Check if port 3000 is in use (non-interactive mode for production)
check-port-prod:
	@if lsof -i :3000 > /dev/null; then \
		echo "ERROR: Port 3000 is already in use by:"; \
		lsof -i :3000; \
		echo "Please ensure the port is available before deployment."; \
		exit 1; \
	else \
		echo "Port 3000 is available."; \
	fi

test: check-port
	make all-up && pytest server/apps/uav/tests

# Production deployment command
deploy-prod:
	@echo "Checking port availability..."
	@if lsof -i :3000 > /dev/null; then \
		echo "WARNING: Port 3000 is already in use by:"; \
		lsof -i :3000; \
		echo "Attempting to continue with deployment..."; \
	fi
	@echo "Building and deploying services..."
	make all-up && docker-compose logs --tail=50 fishery uav client db

# Development command with additional checks
develop: check-port
	@echo "Starting development environment..."
	@echo "Checking Docker daemon..."
	@docker info > /dev/null 2>&1 || (echo "ERROR: Docker daemon is not running. Please start Docker Desktop." && exit 1)
	@echo "Building and starting services..."
	make all-up && docker-compose logs --tail=50 fishery uav client db

# Setup test environment
test-setup:
	@echo "Setting up test environment..."
	@cd server/apps/client && npm install
	@cd server/apps/client && npx playwright install chromium

# Client test command
test-client-cursor: test-setup
	@echo "Checking port 3000..."
	@if lsof -i :3000 > /dev/null; then \
		echo "Port 3000 is in use. Attempting to free it..."; \
		lsof -ti :3000 | xargs kill -9 2>/dev/null || true; \
		echo "Port 3000 freed."; \
	else \
		echo "Port 3000 is available."; \
	fi
	@echo "Running client tests with Playwright..."
	@cd server/apps/client && npm run test:debug

# Start PACT services with optional normal mode
pact-up:
	@if [ -z "$(mode)" ]; then \
		echo "Starting PACT services in test mode..."; \
		docker-compose up -d db fishery-pact uav-pact pact-broker; \
	elif [ "$(mode)" = "fishery" ]; then \
		echo "Starting PACT services in fishery mode..."; \
		docker-compose up -d client uav-pact db fishery pact-broker; \
	elif [ "$(mode)" = "uav" ]; then \
		echo "Starting PACT services in uav mode..."; \
		docker-compose up -d client fishery-pact db uav pact-broker; \
	elif [ "$(mode)" = "client" ]; then \
		echo "Starting PACT services in client mode..."; \
		docker-compose up -d client uav-pact fishery-pact db pact-broker; \
	else \
		echo "Invalid mode: $(mode). Valid modes are: fishery, uav, client"; \
		exit 1; \
	fi



# ... existing code ... 