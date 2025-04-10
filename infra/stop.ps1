# Script d'arret de l'environnement pour PowerShell

$InfraPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$MutagenPath = Join-Path $InfraPath "../mutagen/mutagen.exe"

Write-Host "[ STOP ] Arret de l'environnement de developpement..." -ForegroundColor Yellow

# Arreter Mutagen
Write-Host "[ SYNC ] Arret de la synchronisation Mutagen..." -ForegroundColor Yellow
try {
    if (Test-Path $MutagenPath) {
        & "$MutagenPath" sync terminate backend-sync 2>$null
    } else {
        Write-Host "Note: Executable Mutagen non trouve a: $MutagenPath" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Note: Aucune synchronisation Mutagen active trouvee." -ForegroundColor Yellow
}

Set-Location $InfraPath

# Arreter les containers
Write-Host "[ DOCKER ] Arret des containers..." -ForegroundColor Yellow
docker-compose down

Write-Host ""
Write-Host "[ DONE ] Environnement de developpement arrete!" -ForegroundColor Green 