@echo off
setlocal

set PROJECT_DIR=%~dp0..
set MUTAGEN_CONFIG=%~dp0mutagen.yml

if "%1"=="up" (
    echo Starting Mutagen synchronization...
    cd %PROJECT_DIR%
    mutagen sync create --name=backend-sync ^
        --default-file-mode=0644 ^
        --default-directory-mode=0755 ^
        --symlink-mode=portable ^
        --ignore=/vendor ^
        --ignore=/var ^
        --ignore=/config/jwt ^
        --ignore=/.git ^
        --ignore=/.idea ^
        --ignore=/.vscode ^
        --ignore=/.env.local ^
        --ignore=**/*.log ^
        %PROJECT_DIR%\backend docker://infra-backend-1/var/www/symfony
    echo Synchronization started!
) else if "%1"=="terminate" (
    echo Terminating Mutagen synchronization...
    mutagen sync terminate backend-sync
    echo Synchronization terminated!
) else if "%1"=="pause" (
    echo Pausing Mutagen synchronization...
    mutagen sync pause backend-sync
    echo Synchronization paused!
) else if "%1"=="resume" (
    echo Resuming Mutagen synchronization...
    mutagen sync resume backend-sync
    echo Synchronization resumed!
) else if "%1"=="status" (
    echo Checking Mutagen synchronization status...
    mutagen sync list
) else (
    echo Mutagen Sync Management Script
    echo -----------------------------
    echo Usage:
    echo   mutagen-sync.bat up        - Start synchronization
    echo   mutagen-sync.bat terminate - Stop synchronization
    echo   mutagen-sync.bat pause     - Pause synchronization
    echo   mutagen-sync.bat resume    - Resume synchronization
    echo   mutagen-sync.bat status    - Check synchronization status
)

endlocal 