#!/bin/bash
# Script to fix notification route issue

echo "Stopping Docker containers..."
cd infra
docker-compose down

echo "Starting Docker containers..."
docker-compose up -d

echo "Waiting for containers to be ready..."
sleep 10

echo "Clearing Symfony cache..."
docker-compose exec -T backend php bin/console cache:clear

echo "Checking if notification route is registered..."
docker-compose exec -T backend php bin/console debug:router | grep notifications

echo "Done! The notification route should now be properly registered."
