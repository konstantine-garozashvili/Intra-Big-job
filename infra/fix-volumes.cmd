@echo off
echo Correction des volumes Docker pour Windows 10...
echo.

REM Vérifier si PowerShell est disponible
where powershell >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo PowerShell n'est pas disponible sur ce système.
    echo Exécution du script avec droits d'administrateur...
    pause
    powershell.exe -ExecutionPolicy Bypass -File "%~dp0fix-volumes.ps1"
    exit /b %ERRORLEVEL%
)

REM Exécuter le script PowerShell avec des privilèges administratifs
echo Exécution du script avec droits d'administrateur...
powershell.exe -ExecutionPolicy Bypass -File "%~dp0fix-volumes.ps1"
echo.
echo Terminé !
pause 