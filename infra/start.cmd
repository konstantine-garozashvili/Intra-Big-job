@echo off
REM Script de démarrage universel pour Windows/Git Bash
REM Détecte l'environnement et exécute le script approprié

REM Chemin vers les scripts
set SCRIPT_PATH=%~dp0

REM Si on est dans Git Bash, MSYSTEM sera défini
if defined MSYSTEM (
    echo Exécution en mode Git Bash...
    bash "%SCRIPT_PATH%\start.sh"
    exit /b
)

REM Sinon, on suppose qu'on est dans PowerShell ou CMD
echo Exécution en mode Windows...
powershell -ExecutionPolicy Bypass -File "%SCRIPT_PATH%\start.ps1" 