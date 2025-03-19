#!/bin/bash

# Test script for axios configuration
echo "===== Testing Axios Configuration ====="

# Run the specific axios tests
echo "Running specific axios tests..."
docker exec -it infra-frontend-1 npm test -- src/test/features/axios/axios.test.js

# If you want to also test the integration of axios with services
echo ""
echo "Running axios integration tests..."
docker exec -it infra-frontend-1 npm test -- src/test/features/axios/axiosIntegration.test.js

# If you want to also test the environment variables handling
echo ""
echo "Running axios environment configuration tests..."
docker exec -it infra-frontend-1 npm test -- src/test/features/axios/axiosEnv.test.js

echo ""
echo "===== Axios Configuration Testing Complete =====" 