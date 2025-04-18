@echo off
REM Script d'arret universel pour Windows/Git Bash
REM Detecte l'environnement et execute le script approprie

REM Chemin vers les scripts
set INFRA_PATH=%~dp0infra

REM Si on est dans Git Bash, MSYSTEM sera defini
if defined MSYSTEM (
    echo Execution en mode Git Bash...
    bash "%INFRA_PATH%\stop.sh"
    exit /b
)

REM Sinon, on suppose qu'on est dans PowerShell ou CMD
echo Execution en mode Windows...
powershell -ExecutionPolicy Bypass -File "%INFRA_PATH%\stop.ps1" 