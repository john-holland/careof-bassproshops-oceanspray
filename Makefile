.PHONY: build clean up down fishery-up uav-up client-up fishery-pact-up uav-pact-up all-up all-down all-pact-up all-pact-down

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

# Health check commands
health-check:
	@echo "Checking service health..."
	@curl -f http://localhost:5000/health || echo "Fishery service is not healthy"
	@curl -f http://localhost:5001/health || echo "UAV service is not healthy"
	@curl -f http://localhost:3000 || echo "Client service is not healthy"

# Ocean health check
ocean-health:
	@echo "Checking ocean health at coordinates..."
	@curl -X POST http://localhost:5000/api/ocean/health \
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