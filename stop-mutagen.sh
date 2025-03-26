#!/bin/bash
echo "Stopping Mutagen and Docker containers..."

# Stop Mutagen synchronization
echo "Stopping Mutagen synchronization..."
mutagen sync terminate --all

# Stop Docker containers
echo "Stopping Docker containers..."
docker-compose -f infra/docker-compose.yml -f docker-compose.mutagen.yml down

echo "Project stopped successfully!"