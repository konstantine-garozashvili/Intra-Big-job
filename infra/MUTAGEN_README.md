# Mutagen Sync for Backend Container

This document explains how to use Mutagen to synchronize files between your local machine and the backend Docker container.

## Prerequisites

1. Install Mutagen 0.18.1 from [https://mutagen.io/](https://mutagen.io/)
2. Make sure Docker is running and the backend container is up

## Setup

1. Start your Docker environment without the direct volume mount:
   ```bash
   cd infra
   docker-compose up -d
   ```

2. Start the Mutagen synchronization:
   
   **Using PowerShell:**
   ```powershell
   .\mutagen-sync.ps1 up
   ```
   
   **Using Batch script:**
   ```bash
   mutagen-sync.bat up
   ```

## Managing Synchronization

### Check Status
```powershell
.\mutagen-sync.ps1 status
```
or
```bash
mutagen-sync.bat status
```

### Pause Synchronization
```powershell
.\mutagen-sync.ps1 pause
```
or
```bash
mutagen-sync.bat pause
```

### Resume Synchronization
```powershell
.\mutagen-sync.ps1 resume
```
or
```bash
mutagen-sync.bat resume
```

### Stop Synchronization
```powershell
.\mutagen-sync.ps1 terminate
```
or
```bash
mutagen-sync.bat terminate
```

## Important Notes

1. The synchronization is bidirectional, meaning changes will be synced both ways.
2. We exclude certain directories from synchronization:
   - `/vendor` (managed by Composer)
   - `/var` (runtime files)
   - `/config/jwt` (sensitive keys)
   - `.git`, `.idea`, `.vscode` (development tools)
   - `.env.local` (local environment variables)
   - All log files

3. If you make changes to the Symfony container that require rebuilding, make sure to:
   - Terminate the Mutagen sync
   - Rebuild your containers
   - Start the Mutagen sync again

## Troubleshooting

1. If synchronization isn't working properly, check the container name with:
   ```bash
   docker ps
   ```
   Ensure the container is named `infra-backend-1` as expected in the scripts.

2. To view Mutagen logs:
   ```bash
   mutagen daemon logs
   ```

3. To completely reset Mutagen:
   ```bash
   mutagen sync terminate --all
   mutagen daemon stop
   ``` 