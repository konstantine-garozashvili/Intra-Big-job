# Mutagen Integration Guide

## Overview

This guide explains how to use Mutagen with Docker to significantly improve file synchronization performance in the Intra-Big-Job project, especially on Windows systems.

## What is Mutagen?

Mutagen is a tool that provides high-performance file synchronization between your local machine and Docker containers. It addresses performance issues that commonly occur with Docker volume mounts, particularly on Windows and macOS.

Benefits include:
- Faster file synchronization (5-10x improvement)
- Reduced CPU usage
- Better handling of large codebases
- Improved developer experience with faster hot-reloading

## Installation

### Windows

1. Install Mutagen using Chocolatey:
   ```
   choco install mutagen
   ```
  powershell -Command Invoke-WebRequest -Uri 'https://github.com/mutagen-io/mutagen/releases/download/v0.17.2/mutagen_windows_amd64_v0.17.2.zip' -OutFile 'mutagen.zip'
   Or download the installer from the [Mutagen releases page](https://github.com/mutagen-io/mutagen/releases).

### macOS

1. Install Mutagen using Homebrew:
   ```
   brew install mutagen-io/mutagen/mutagen
   ```

### Linux

1. Download the appropriate package from the [Mutagen releases page](https://github.com/mutagen-io/mutagen/releases).

## Usage

We've provided convenience scripts to start the project with Mutagen:

### Windows

Run the batch script in the project root:
```
.\start-with-mutagen.bat
```

### macOS/Linux

Run the shell script in the project root:
```
bash ./start-with-mutagen.sh
```

## How It Works

The Mutagen configuration in this project:

1. Uses a `mutagen.yml` file to define synchronization settings for both frontend and backend directories
2. Employs a `docker-compose.mutagen.yml` override file to modify volume configurations
3. Provides startup scripts that handle the Docker and Mutagen orchestration

## Manual Configuration

If you need to manually configure Mutagen:

1. Start Docker containers with the Mutagen override:
   ```
   docker-compose -f infra/docker-compose.yml -f docker-compose.mutagen.yml up -d
   ```

2. Start Mutagen synchronization:
   ```
   mutagen project start
   ```

3. To stop synchronization:
   ```
   mutagen sync terminate --all-projects
   ```

## Troubleshooting

### Common Issues

1. **Container names don't match**: If your Docker container names differ from what's in the `mutagen.yml` file, update the beta URLs in the configuration.

2. **Synchronization conflicts**: If you encounter conflicts, you can resolve them with:
   ```
   mutagen sync list
   mutagen sync flush <session-id>
   ```

3. **Performance still slow**: Ensure you're not running with both Docker volume mounts and Mutagen simultaneously. The override file should comment out the direct volume mounts.

### Viewing Sync Status

To check the status of your Mutagen synchronization:
```
mutagen sync list
```

## Additional Resources

- [Mutagen Documentation](https://mutagen.io/documentation/)
- [Docker Compose Override Files](https://docs.docker.com/compose/extends/)