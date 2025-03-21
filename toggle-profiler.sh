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
      # When enabling profiler, always set ALL_REQUESTS to true (which means only_exceptions to false)
      ALL_REQUESTS=true
      shift
      ;;
    --help|-h)
      echo "Usage: ./toggle-profiler.sh [options]"
      echo "Options:"
      echo "  --enable, -e          Enable the profiler (default: disabled)"
      echo "  --help, -h            Display this help message"
      echo ""
      echo "Note: When profiler is enabled, it will automatically collect data on all requests."
      echo "      When profiler is disabled, it will be set to only collect on exceptions."
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
  CMD_ARGS="$CMD_ARGS --enable --all-requests"
else
  # When disabling, we don't add the all-requests flag, so only_exceptions remains true
  CMD_ARGS="$CMD_ARGS"
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
  if [ "$ENABLE" = true ]; then
    echo -e "${YELLOW}Profiler will collect data on all requests.${NC}"
  else
    echo -e "${YELLOW}Profiler will only collect data on exceptions.${NC}"
  fi
  echo -e "${YELLOW}Refresh your browser to see the changes.${NC}"
else
  echo -e "${RED}Error: Docker container 'infra-backend-1' is not running.${NC}"
  echo -e "${YELLOW}Please start your Docker environment first.${NC}"
  exit 1
fi 