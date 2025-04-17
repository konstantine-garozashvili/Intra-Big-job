#!/bin/bash
# Script to fix notification routes by explicitly adding them to routes.yaml

echo "Restarting Docker containers..."
cd infra
docker-compose restart backend nginx

echo "Waiting for containers to be ready..."
sleep 5

echo "Clearing Symfony cache..."
docker-compose exec -T backend php bin/console cache:clear

echo "Checking if notification routes are registered..."
docker-compose exec -T backend php bin/console debug:router | grep notifications

echo "Done! The notification routes should now be properly registered."
