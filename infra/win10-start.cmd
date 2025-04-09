@echo off
echo ========================================================
echo     DEMARRAGE DE L'ENVIRONNEMENT POUR WINDOWS 10
echo ========================================================
echo.

REM Vérifier que Docker est en cours d'exécution
docker info > nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo Docker n'est pas en cours d'execution. Veuillez demarrer Docker Desktop.
    pause
    exit /b 1
)

echo Preparation de l'environnement...

REM Créer le répertoire pour les volumes MySQL si nécessaire
if not exist "C:\DockerVolumes\mysql-data" (
    echo Creation du repertoire pour MySQL...
    mkdir "C:\DockerVolumes\mysql-data" 2>nul
)

REM Configurer les permissions
echo Configuration des permissions...
icacls "C:\DockerVolumes\mysql-data" /grant:r "Everyone:(OI)(CI)F" /T >nul

REM Arrêter les conteneurs existants
echo Arret des conteneurs existants...
docker-compose down

REM Supprimer les volumes problématiques
echo Suppression des volumes potentiellement problematiques...
docker volume rm infra_database_data 2>nul

echo Demarrage des conteneurs avec configuration Windows 10...
docker-compose -f docker-compose-win10.yml up -d

echo Attente du demarrage de MySQL (30 secondes)...
timeout /t 30 /nobreak > nul

echo.
echo ========================================================
echo     ENVIRONNEMENT DEMARRE
echo ========================================================
echo.
echo URLs disponibles:
echo  - Frontend: http://localhost:5173
echo  - Backend API: http://localhost:8000
echo  - PHPMyAdmin: http://localhost:8080
echo.
echo Pour les logs, utilisez:
echo  - docker-compose logs -f
echo.
echo Pour redemarrer l'environnement: 
echo  - win10-start.cmd
echo.
echo Pour arreter l'environnement:
echo  - docker-compose down
echo.
echo En cas de problemes, utilisez les scripts de diagnostic:
echo  - bash mysql-debug.sh
echo  - bash check-volume-init.sh
echo  - bash dns-check.sh
echo.
pause 