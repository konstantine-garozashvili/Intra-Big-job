@echo off
echo Stopping Mutagen and Docker containers...

REM Set path to local Mutagen executable
set MUTAGEN_PATH=%~dp0mutagen\mutagen.exe

REM Check if local Mutagen exists
if not exist "%MUTAGEN_PATH%" (
    echo Local Mutagen executable not found at %MUTAGEN_PATH%
    echo Checking for system-wide installation...
    
    mutagen version >nul 2>&1
    if %ERRORLEVEL% NEQ 0 (
        echo Mutagen is not installed. Please install it first or extract it to the mutagen folder.
        echo Visit https://mutagen.io/documentation/introduction/installation for installation instructions.
        exit /b 1
    ) else (
        echo Using system-wide Mutagen installation.
        set MUTAGEN_PATH=mutagen
    )
) else (
    echo Using local Mutagen installation.
)

REM Stop Mutagen synchronization
echo Stopping Mutagen synchronization...
"%MUTAGEN_PATH%" sync terminate --all

REM Stop Docker containers
echo Stopping Docker containers...
docker-compose -f infra/docker-compose.yml -f docker-compose.mutagen.yml down

echo Project stopped successfully!