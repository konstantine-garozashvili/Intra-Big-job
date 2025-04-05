@echo off
echo Setting up Mutagen synchronization for backend container...

REM Set Mutagen executable path
set MUTAGEN_PATH=%~dp0..\mutagen\mutagen.exe

REM Check if Mutagen executable exists
if not exist "%MUTAGEN_PATH%" (
    echo ERROR: Mutagen executable not found at: %MUTAGEN_PATH%
    exit /b 1
)

REM Check Mutagen version
"%MUTAGEN_PATH%" version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to execute Mutagen. Please check the executable permissions.
    exit /b 1
)

REM Stop any existing synchronization
echo Terminating any existing backend synchronization...
"%MUTAGEN_PATH%" sync terminate backend-sync 2>nul

REM Restart Docker containers
echo Restarting Docker containers...
docker-compose down
docker-compose up -d

REM Wait for backend container to be ready
echo Waiting for backend container to be ready...
timeout /t 10 /nobreak >nul

REM Check if backend container is running
for /f "tokens=*" %%i in ('docker ps --filter "name=infra-backend-1" --format "{{.Names}}"') do set backendContainer=%%i
if "%backendContainer%"=="" (
    echo ERROR: Backend container 'infra-backend-1' not found. Check your Docker setup.
    exit /b 1
)

echo Backend container '%backendContainer%' is running.

REM Start Mutagen synchronization
set PROJECT_DIR=%~dp0..
set BACKEND_DIR=%PROJECT_DIR%\backend

echo Starting Mutagen synchronization...
"%MUTAGEN_PATH%" sync create --name=backend-sync ^
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
    %BACKEND_DIR% docker://infra-backend-1/var/www/symfony

REM Check status
echo Checking synchronization status...
timeout /t 2 /nobreak >nul
"%MUTAGEN_PATH%" sync list

echo.
echo Setup Complete!
echo Your backend files should now be synchronizing with the container.
echo For more information on managing Mutagen, see the MUTAGEN_README.md 