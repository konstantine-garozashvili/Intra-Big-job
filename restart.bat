@echo off
echo Redemarrage de la synchronisation Mutagen...

REM Stop Docker and Mutagen
echo Arret des sessions Mutagen et conteneurs Docker existants...
mutagen project terminate 2>nul
mutagen sync terminate --all 2>nul
mutagen daemon stop 2>nul
docker-compose -f infra/docker-compose.yml down -v
docker volume rm infra_backend_nginx 2>nul

REM Start Docker and Mutagen cleanly
echo Demarrage du demon Mutagen...
mutagen daemon start
echo Demarrage de Docker avec la configuration Mutagen...
docker-compose -f infra/docker-compose.yml -f docker-compose.mutagen.yml up -d

echo Attente de la preparation des conteneurs...
timeout /t 10 /nobreak

echo Lancement du projet Mutagen...
mutagen project start

echo Verification de l'etat de la synchronisation...
timeout /t 5 /nobreak
echo Sessions de synchronisation actives:
mutagen sync list

echo C'est bon !
echo Essayez de creer une synchronisation manuelle:
echo mutagen sync create --name=frontend-sync ./frontend docker://infra-frontend-1:/app
echo mutagen sync create --name=backend-sync ./backend docker://infra-backend-1:/var/www/symfony
