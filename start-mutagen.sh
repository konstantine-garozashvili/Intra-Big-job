#!/bin/bash
echo "Starting project with Mutagen for improved performance..."

# Determine script directory for relative paths
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# Find Mutagen executable
if [ -f "${SCRIPT_DIR}/mutagen/mutagen.exe" ]; then
    MUTAGEN_PATH="${SCRIPT_DIR}/mutagen/mutagen.exe"
    echo "Using local Mutagen installation."
else
    # Check if mutagen is in PATH
    if command -v mutagen &> /dev/null; then
        MUTAGEN_PATH="mutagen"
        echo "Using system-wide Mutagen installation."
    else
        echo "Mutagen is not installed. Please install it first."
        echo "Visit https://mutagen.io/documentation/introduction/installation for installation instructions."
        exit 1
    fi
fi

# Stop any existing Mutagen sessions
echo "Stopping any existing Mutagen sessions..."
"$MUTAGEN_PATH" sync terminate --all

# Start Docker Compose with the Mutagen override
echo "Starting Docker Compose with Mutagen configuration..."
docker-compose -f infra/docker-compose.yml -f docker-compose.mutagen.yml up -d

# Wait for containers to be ready
echo "Waiting for containers to be ready..."
sleep 10

# Check if Mutagen project is already running before starting
echo "Checking Mutagen project status..."
if "$MUTAGEN_PATH" project list &> /dev/null; then
    echo "Mutagen project is already running, skipping project start..."
else
    echo "Starting Mutagen file synchronization..."
    "$MUTAGEN_PATH" project start
    echo "Waiting for synchronization to initialize..."
    sleep 40
fi

echo "Project started successfully with Mutagen!"
echo "Access your application at:"
echo "  - Frontend: http://localhost:5173"
echo "  - Backend API: http://localhost:8000"
echo "  - PHPMyAdmin: http://localhost:8080"

# Display Mutagen sync status
echo
echo "Checking Mutagen sync status..."
"$MUTAGEN_PATH" sync list

echo
echo "============================================"
echo "Choose an option:"
echo "============================================"
echo "1. Monitor all services logs"
echo "2. Monitor frontend logs"
echo "3. Monitor backend logs"
echo "4. Monitor Mutagen sync logs"
echo "5. Exit without monitoring logs"
echo

read -p "Enter option (1-5): " CHOICE
echo

case $CHOICE in
    1)
        docker-compose -f infra/docker-compose.yml logs --follow
        ;;
    2)
        docker-compose -f infra/docker-compose.yml logs --follow frontend
        ;;
    3)
        docker-compose -f infra/docker-compose.yml logs --follow backend
        ;;
    4)
        "$MUTAGEN_PATH" sync monitor
        ;;
    5)
        echo "Exiting without monitoring logs."
        ;;
    *)
        echo "Invalid choice. Exiting."
        ;;
esac 