#!/bin/bash

# Colors for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Default values
ENABLE=false
ALL_REQUESTS=false

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --enable|-e)
      ENABLE=true
      shift
      ;;
    --all-requests|-a)
      ALL_REQUESTS=true
      shift
      ;;
    --help|-h)
      echo "Usage: ./toggle-profiler.sh [options]"
      echo "Options:"
      echo "  --enable, -e          Enable the profiler (default: disabled)"
      echo "  --all-requests, -a    Collect data on all requests, not just exceptions (default: only exceptions)"
      echo "  --help, -h            Display this help message"
      exit 0
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}"
      echo "Use --help for usage information"
      exit 1
      ;;
  esac
done

# Build command arguments
CMD_ARGS=""
if [ "$ENABLE" = true ]; then
  CMD_ARGS="$CMD_ARGS --enable"
fi
if [ "$ALL_REQUESTS" = true ]; then
  CMD_ARGS="$CMD_ARGS --all-requests"
fi

echo -e "${YELLOW}Toggling Symfony Profiler...${NC}"

# Check if the Docker container is running
if docker ps | grep -q "infra-backend-1"; then
  # Run the command in the Docker container
  docker exec -it infra-backend-1 php bin/toggle-profiler $CMD_ARGS
  
  # Clear the Symfony cache
  echo -e "${YELLOW}Clearing Symfony cache...${NC}"
  docker exec -it infra-backend-1 php bin/console cache:clear
  
  echo -e "${GREEN}Done! The profiler is now $([ "$ENABLE" = true ] && echo "enabled" || echo "disabled").${NC}"
  echo -e "${YELLOW}Refresh your browser to see the changes.${NC}"
else
  echo -e "${RED}Error: Docker container 'infra-backend-1' is not running.${NC}"
  echo -e "${YELLOW}Please start your Docker environment first.${NC}"
  exit 1
fi 