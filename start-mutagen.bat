@echo off
echo Starting project with Mutagen for improved performance...

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

REM Stop any existing Mutagen sessions
echo Stopping any existing Mutagen sessions...
"%MUTAGEN_PATH%" sync terminate --all

REM Start Docker Compose with the Mutagen override
echo Starting Docker Compose with Mutagen configuration...
docker-compose -f infra/docker-compose.yml -f docker-compose.mutagen.yml up -d

REM Wait for containers to be ready
echo Waiting for containers to be ready...
timeout /t 40 /nobreak

REM Start Mutagen sync
echo Starting Mutagen file synchronization...
"%MUTAGEN_PATH%" project start
timeout /t 40 /nobreak

echo Project started successfully with Mutagen!
echo Access your application at:
echo   - Frontend: http://localhost:5173
echo   - Backend API: http://localhost:8000
echo   - PHPMyAdmin: http://localhost:8080