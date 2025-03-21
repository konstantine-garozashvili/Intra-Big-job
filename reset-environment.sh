#!/bin/bash

# Colors for better readability
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}===== Complete Environment Reset Script =====${NC}"
echo -e "${YELLOW}This will reset the entire environment, including database data${NC}"
echo -e "${YELLOW}Are you sure you want to continue? (y/n)${NC}"
read -r response
if [[ ! "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
  echo -e "${RED}Operation cancelled.${NC}"
  exit 0
fi

# Step 1: Stop all containers
echo -e "${GREEN}Stopping all containers...${NC}"
docker-compose -f infra/docker-compose.yml down || {
  echo -e "${RED}Error stopping containers${NC}"
  exit 1
}

# Step 2: Prune volumes
echo -e "${GREEN}Pruning Docker volumes...${NC}"
docker volume rm infra_database_data infra_redis_data infra_jwt_keys infra_backend_var infra_backend_vendor infra_frontend_node_modules || true

# Step 3: Rebuild images
echo -e "${GREEN}Rebuilding Docker images...${NC}"
docker-compose -f infra/docker-compose.yml build --no-cache || {
  echo -e "${RED}Error rebuilding images${NC}"
  exit 1
}

# Step 4: Start containers
echo -e "${GREEN}Starting containers...${NC}"
docker-compose -f infra/docker-compose.yml up -d || {
  echo -e "${RED}Error starting containers${NC}"
  exit 1
}

# Step 5: Generate JWT keys
echo -e "${GREEN}Generating JWT keys...${NC}"
sleep 10 # Give some time for services to initialize
docker exec -it infra-backend-1 php bin/console lexik:jwt:generate-keypair --no-interaction || {
  echo -e "${RED}Error generating JWT keys${NC}"
  # Not exiting as this is not critical
}

echo -e "${GREEN}Environment reset completed successfully!${NC}"
echo -e "${YELLOW}The application should be accessible at:${NC}"
echo -e " - Frontend: ${GREEN}http://localhost:5173${NC}"
echo -e " - Backend API: ${GREEN}http://localhost:8000${NC}"
echo -e " - PHPMyAdmin: ${GREEN}http://localhost:8080${NC} (root/root)" 