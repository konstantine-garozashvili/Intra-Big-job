#!/bin/bash
echo "Starting project with Mutagen for improved performance..."

# Check if Mutagen is installed
if ! command -v mutagen &> /dev/null; then
    echo "Mutagen is not installed. Please install it first."
    echo "Visit https://mutagen.io/documentation/introduction/installation for installation instructions."
    exit 1
fi

# Stop any existing Mutagen sessions
echo "Stopping any existing Mutagen sessions..."
mutagen sync terminate --all

# Start Docker Compose with the Mutagen override
echo "Starting Docker Compose with Mutagen configuration..."
docker-compose -f infra/docker-compose.yml -f docker-compose.mutagen.yml up -d

# Wait for containers to be ready
echo "Waiting for containers to be ready..."
sleep 10

# Start Mutagen sync
echo "Starting Mutagen file synchronization..."
mutagen project start

echo "Project started successfully with Mutagen!"
echo "Access your application at:"
echo "  - Frontend: http://localhost:5173"
echo "  - Backend API: http://localhost:8000"
echo "  - PHPMyAdmin: http://localhost:8080"