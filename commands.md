# Project Commands

## Docker Compose Commands

### Development Environment
```bash
# Start all services
docker-compose up

# Start specific services
docker-compose up fishery-service uav-service

# Start services in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f fishery-service

# Stop all services
docker-compose down

# Rebuild services
docker-compose build

# Rebuild specific service
docker-compose build fishery-service
```

### Testing Environment
```bash
# Run PACT tests
docker-compose -f docker-compose.test.yml up

# Run specific PACT test suite
docker-compose -f docker-compose.test.yml up fishery-pact-tests

# Run with specific environment
docker-compose -f docker-compose.test.yml --env-file .env.test up
```

## Make Commands

### Development
```bash
# Install dependencies
make install

# Start development servers
make dev

# Build all services
make build

# Clean build artifacts
make clean
```

### Testing
```bash
# Run all tests
make test

# Run specific test suite
make test-fishery
make test-uav
make test-client

# Run PACT tests
make pact-test

# Run PACT servers
make pact-up

#Run PACT servers, mode parameter specifies the real one
make pact-up mode=fishery|uav|client

# Run specific PACT test suite
make pact-test-fishery
make pact-test-uav
make pact-test-client

# Generate PACT documentation
make pact-docs
```

### Docker Operations
```bash
# Build Docker images
make docker-build

# Push Docker images
make docker-push

# Clean Docker resources
make docker-clean
```

### Database
```bash
# Run migrations
make migrate

# Seed database
make seed

# Reset database
make reset-db
```

### Documentation
```bash
# Generate API documentation
make docs

# Serve documentation locally
make serve-docs
```

## Environment Setup

### Required Environment Variables
```bash
# Copy example environment file
cp .env.example .env

# Generate secrets
make generate-secrets
```

### Development Tools
```bash
# Install development tools
make install-tools

# Run linters
make lint

# Run formatters
make format
``` 