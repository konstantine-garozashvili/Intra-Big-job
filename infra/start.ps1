# Script de demarrage de l'environnement pour PowerShell

$InfraPath = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "[ START ] Demarrage de l'environnement de developpement..." -ForegroundColor Cyan

# Verifier si Docker est en cours d'execution
try {
    docker info | Out-Null
} catch {
    Write-Host "[ ERROR ] Docker n'est pas en cours d'execution. Veuillez demarrer Docker Desktop." -ForegroundColor Red
    exit 1
}

Set-Location $InfraPath

# Demarrer les containers
Write-Host "[ DOCKER ] Demarrage des containers..." -ForegroundColor Yellow
docker-compose up -d

# Attendre que les containers soient prets
Write-Host "[ WAIT ] Attente du demarrage des services..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Demarrer Mutagen
Write-Host "[ SYNC ] Configuration de la synchronisation Mutagen..." -ForegroundColor Yellow
& "$InfraPath\setup-mutagen.ps1" -ExecutionPolicy Bypass

Write-Host ""
Write-Host "[ DONE ] Environnement de developpement pret!" -ForegroundColor Green
Write-Host "[ URLS ] URLs disponibles:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "   Backend API: http://localhost:8000" -ForegroundColor White
Write-Host "   PHPMyAdmin: http://localhost:8080" -ForegroundColor White 