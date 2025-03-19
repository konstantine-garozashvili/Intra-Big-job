#!/bin/bash

# Colors for better readability
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}===== Database Initialization Script =====${NC}"

# Check if docker is running and containers are up
if ! docker ps | grep -q "infra-backend-1"; then
  echo -e "${RED}Error: Backend container not found or not running.${NC}"
  echo -e "${YELLOW}Please run 'docker-compose -f infra/docker-compose.yml up -d' first.${NC}"
  exit 1
fi

echo -e "${YELLOW}Starting complete database initialization...${NC}"

# Drop the database and recreate it
echo -e "${GREEN}Dropping and recreating database...${NC}"
docker exec -it infra-backend-1 php bin/console doctrine:database:drop --force --no-interaction || true
docker exec -it infra-backend-1 php bin/console doctrine:database:create --no-interaction || {
  echo -e "${RED}Error creating database${NC}"
  exit 1
}

# Create schema directly from entities
echo -e "${GREEN}Creating database schema from entities...${NC}"
docker exec -it infra-backend-1 php bin/console doctrine:schema:update --force --no-interaction || {
  echo -e "${RED}Error creating schema${NC}"
  exit 1
}

# Also run migrations for good measure
echo -e "${GREEN}Running migrations...${NC}"
docker exec -it infra-backend-1 php bin/console doctrine:migrations:migrate --no-interaction --allow-no-migration || {
  echo -e "${RED}Error running migrations${NC}"
  exit 1
}

# Load fixtures
echo -e "${GREEN}Loading fixtures...${NC}"
docker exec -it infra-backend-1 php bin/console doctrine:fixtures:load --no-interaction || {
  echo -e "${RED}Error loading fixtures${NC}"
  exit 1
}

echo -e "${GREEN}Database initialization completed successfully!${NC}"
echo -e "${YELLOW}You can now access your application with fresh data.${NC}" 