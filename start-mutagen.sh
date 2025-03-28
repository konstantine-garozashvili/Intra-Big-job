#!/bin/bash
echo "Starting project with Mutagen for improved performance..."

# Find Mutagen executable
if command -v mutagen &> /dev/null; then
    MUTAGEN_PATH="mutagen"
    echo "Using system-wide Mutagen installation."
else
    echo "Mutagen is not installed. Please install it first."
    echo "Visit https://mutagen.io/documentation/introduction/installation for installation instructions."
    exit 1
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
    sleep 40
fi

echo "Project started successfully with Mutagen!"
echo "Access your application at:"
echo "  - Frontend: http://localhost:5173"
echo "  - Backend API: http://localhost:8000"
echo "  - PHPMyAdmin: http://localhost:8080"

# Display Mutagen sync status and monitor logs
echo
echo "Checking Mutagen sync status..."
"$MUTAGEN_PATH" sync list

echo
echo "============================================"
echo "Starting log monitoring..."
echo "============================================"
echo
echo "Choose which logs to view:"
echo "1. All services"
echo "2. Frontend only"
echo "3. Backend only"
echo "4. Mutagen sync logs"
echo

read -p "Enter your choice (1-4): " LOG_CHOICE

case $LOG_CHOICE in
    1)
        echo "Monitoring logs for all services (Press Ctrl+C to exit)..."
        docker-compose -f infra/docker-compose.yml logs --follow
        ;;
    2)
        echo "Monitoring logs for frontend service (Press Ctrl+C to exit)..."
        docker-compose -f infra/docker-compose.yml logs --follow frontend
        ;;
    3)
        echo "Monitoring logs for backend service (Press Ctrl+C to exit)..."
        docker-compose -f infra/docker-compose.yml logs --follow backend
        ;;
    4)
        echo "Monitoring Mutagen sync logs (Press Ctrl+C to exit)..."
        "$MUTAGEN_PATH" sync monitor
        ;;
    *)
        echo "Invalid choice. Monitoring logs for all services (Press Ctrl+C to exit)..."
        docker-compose -f infra/docker-compose.yml logs --follow
        ;;
esac 