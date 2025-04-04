@echo off
echo Starting project with Mutagen for backend synchronization...

REM Stop Mutagen daemon and any existing sessions
echo Stopping Mutagen daemon and sessions...
mutagen daemon stop
timeout /t 5 /nobreak

REM Start Mutagen daemon
echo Starting Mutagen daemon...
mutagen daemon start
timeout /t 5 /nobreak

REM Arrêter Docker complètement
docker-compose -f infra/docker-compose.yml -f docker-compose.mutagen.yml down

REM Attendre quelques secondes
timeout /t 5 /nobreak

REM Démarrer Docker avec la nouvelle configuration
docker-compose -f infra/docker-compose.yml -f docker-compose.mutagen.yml up -d

REM Wait for containers to be ready
echo Waiting for containers to be ready...
timeout /t 10 /nobreak

REM Create Mutagen sync session explicitly
echo Creating Mutagen sync session for backend...
mutagen sync terminate backend-sync 2>nul
mutagen sync create --name=backend-sync --sync-mode=two-way-resolved --watch-mode=portable --ignore-vcs --default-file-mode=0644 --default-directory-mode=0755 --staging-mode=neighboring ./backend docker://infra-backend-1:/var/www/symfony

REM Monitor the sync status
echo Monitoring sync status for 30 seconds...
mutagen sync monitor backend-sync
timeout /t 30 /nobreak

echo Checking final sync status...
mutagen sync list

echo Configuration complete. Use these commands to manage synchronization:
echo - View status: mutagen sync list
echo - Monitor changes: mutagen sync monitor backend-sync
echo - Flush changes: mutagen sync flush backend-sync
echo - Reset sync: mutagen sync reset backend-sync