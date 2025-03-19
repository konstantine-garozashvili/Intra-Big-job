#!/bin/bash

# Colors for better readability
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}===== Loading Database Fixtures =====${NC}"

# Check if docker is running and containers are up
if ! docker ps | grep -q "infra-backend-1"; then
  echo -e "${RED}Error: Backend container not found or not running.${NC}"
  echo -e "${YELLOW}Please run 'docker-compose -f infra/docker-compose.yml up -d' first.${NC}"
  exit 1
fi

# Load fixtures
echo -e "${GREEN}Loading fixtures into database...${NC}"
docker exec -it infra-backend-1 php bin/console doctrine:fixtures:load --no-interaction || {
  echo -e "${RED}Error loading fixtures${NC}"
  exit 1
}

echo -e "${GREEN}Fixtures loaded successfully!${NC}"
echo -e "${YELLOW}Your database is now populated with sample data.${NC}" 