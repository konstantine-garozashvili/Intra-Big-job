@echo off
echo Restarting Mutagen synchronization...

REM Stop Docker and Mutagen
echo Stopping existing Mutagen sessions and Docker containers...
mutagen project terminate 2>nul
mutagen sync terminate --all 2>nul
mutagen daemon stop 2>nul
docker-compose -f infra/docker-compose.yml down -v
docker volume rm infra_backend_nginx 2>nul

REM Start Docker and Mutagen cleanly
echo Starting Mutagen daemon...
mutagen daemon start
echo Starting Docker with Mutagen configuration...
docker-compose -f infra/docker-compose.yml -f docker-compose.mutagen.yml up -d

echo Waiting for containers to be ready...
timeout /t 10 /nobreak

echo Starting Mutagen project...
mutagen project start

echo Checking synchronization status...
timeout /t 5 /nobreak
echo Active synchronization sessions:
mutagen sync list

echo Done! If you don't see any active synchronization sessions,
echo try running manual sync creation:
echo mutagen sync create --name=frontend-sync ./frontend docker://infra-frontend-1:/app
echo mutagen sync create --name=backend-sync ./backend docker://infra-backend-1:/var/www/symfony
