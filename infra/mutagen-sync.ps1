param(
    [Parameter(Position=0)]
    [string]$command
)

$projectDir = (Get-Item $PSScriptRoot).Parent.FullName
$backendDir = Join-Path $projectDir "backend"

function Start-Sync {
    Write-Host "Starting Mutagen synchronization..." -ForegroundColor Green
    mutagen sync create --name=backend-sync `
        --default-file-mode=0644 `
        --default-directory-mode=0755 `
        --symlink-mode=portable `
        --ignore=/vendor `
        --ignore=/var `
        --ignore=/config/jwt `
        --ignore=/.git `
        --ignore=/.idea `
        --ignore=/.vscode `
        --ignore=/.env.local `
        --ignore="**/*.log" `
        $backendDir "docker://infra-backend-1/var/www/symfony"
    Write-Host "Synchronization started!" -ForegroundColor Green
}

function Stop-Sync {
    Write-Host "Terminating Mutagen synchronization..." -ForegroundColor Yellow
    mutagen sync terminate backend-sync
    Write-Host "Synchronization terminated!" -ForegroundColor Yellow
}

function Pause-Sync {
    Write-Host "Pausing Mutagen synchronization..." -ForegroundColor Yellow
    mutagen sync pause backend-sync
    Write-Host "Synchronization paused!" -ForegroundColor Yellow
}

function Resume-Sync {
    Write-Host "Resuming Mutagen synchronization..." -ForegroundColor Green
    mutagen sync resume backend-sync
    Write-Host "Synchronization resumed!" -ForegroundColor Green
}

function Get-SyncStatus {
    Write-Host "Checking Mutagen synchronization status..." -ForegroundColor Cyan
    mutagen sync list
}

function Show-Help {
    Write-Host "Mutagen Sync Management Script" -ForegroundColor Cyan
    Write-Host "-----------------------------" -ForegroundColor Cyan
    Write-Host "Usage:"
    Write-Host "  .\mutagen-sync.ps1 up        - Start synchronization"
    Write-Host "  .\mutagen-sync.ps1 terminate - Stop synchronization"
    Write-Host "  .\mutagen-sync.ps1 pause     - Pause synchronization"
    Write-Host "  .\mutagen-sync.ps1 resume    - Resume synchronization"
    Write-Host "  .\mutagen-sync.ps1 status    - Check synchronization status"
}

switch ($command) {
    "up" { Start-Sync }
    "terminate" { Stop-Sync }
    "pause" { Pause-Sync }
    "resume" { Resume-Sync }
    "status" { Get-SyncStatus }
    default { Show-Help }
} 