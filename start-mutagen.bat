@echo off
echo Starting project with Mutagen for improved performance...

REM Find Mutagen executable
set MUTAGEN_PATH=%~dp0mutagen\mutagen.exe

REM Check if local Mutagen exists
if exist "%MUTAGEN_PATH%" (
    echo Using local Mutagen installation.
) else (
    echo Local Mutagen executable not found at %MUTAGEN_PATH%
    echo Checking for system-wide installation...
    
    where mutagen >nul 2>&1
    if %ERRORLEVEL% NEQ 0 (
        echo Mutagen is not installed. Please install it first or extract it to the mutagen folder.
        echo Visit https://mutagen.io/documentation/introduction/installation for installation instructions.
        exit /b 1
    ) else (
        echo Using system-wide Mutagen installation.
        set MUTAGEN_PATH=mutagen
    )
)

REM Stop any existing Mutagen sessions
echo Stopping any existing Mutagen sessions...
"%MUTAGEN_PATH%" sync terminate --all

REM Start Docker Compose with the Mutagen override
echo Starting Docker Compose with Mutagen configuration...
docker-compose -f infra/docker-compose.yml -f docker-compose.mutagen.yml up -d

REM Wait for containers to be ready
echo Waiting for containers to be ready...
REM Use ping as a cross-compatible sleep command
ping -n 11 127.0.0.1 > nul 2>&1

REM Check if Mutagen project is already running before starting
echo Checking Mutagen project status...
"%MUTAGEN_PATH%" project list > nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Mutagen project is already running, skipping project start...
) else (
    echo Starting Mutagen file synchronization...
    "%MUTAGEN_PATH%" project start
    echo Waiting for synchronization to initialize...
    REM Use ping as a cross-compatible sleep command
    ping -n 41 127.0.0.1 > nul 2>&1
)

echo Project started successfully with Mutagen!
echo Access your application at:
echo   - Frontend: http://localhost:5173
echo   - Backend API: http://localhost:8000
echo   - PHPMyAdmin: http://localhost:8080

REM Display Mutagen sync status
echo.
echo Checking Mutagen sync status...
"%MUTAGEN_PATH%" sync list

echo.
echo ============================================
echo Choose an option:
echo ============================================
echo 1. Monitor all services logs
echo 2. Monitor frontend logs
echo 3. Monitor backend logs
echo 4. Monitor Mutagen sync logs
echo 5. Exit without monitoring logs
echo.

SET /P CHOICE="Enter option (1-5): "
echo.

if "%CHOICE%"=="1" (
    docker-compose -f infra/docker-compose.yml logs --follow
    exit /b
)
if "%CHOICE%"=="2" (
    docker-compose -f infra/docker-compose.yml logs --follow frontend
    exit /b
)
if "%CHOICE%"=="3" (
    docker-compose -f infra/docker-compose.yml logs --follow backend
    exit /b
)
if "%CHOICE%"=="4" (
    "%MUTAGEN_PATH%" sync monitor
    exit /b
)
if "%CHOICE%"=="5" (
    echo Exiting without monitoring logs.
    exit /b
)

echo Invalid choice. Exiting.
exit /b 0 