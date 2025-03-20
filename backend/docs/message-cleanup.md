# Message Cleanup System

This document explains the message cleanup system that automatically deletes chat messages older than 15 days to prevent database bloat.

## Overview

The system includes:

1. A command-line tool (`app:cleanup-old-messages`)
2. A service class (`MessageCleanupService`)
3. An admin API endpoint for manual cleanup

## Command Usage

The cleanup command can be run manually with:

```bash
# From the backend directory
php bin/console app:cleanup-old-messages

# Specify custom number of days (e.g., 30 days)
php bin/console app:cleanup-old-messages --days=30

# Run in dry-run mode (no actual deletion)
php bin/console app:cleanup-old-messages --dry-run
```

## Setting Up Scheduled Cleanup

### Option 1: Using Cron (Recommended for Production)

Add the following to your server's crontab to run the cleanup daily at midnight:

```bash
# Run message cleanup daily at midnight
0 0 * * * cd /path/to/your/project/backend && php bin/console app:cleanup-old-messages >> /var/log/message-cleanup.log 2>&1
```

To edit your crontab:

```bash
crontab -e
```

### Option 2: Using Docker

If you're using Docker, you can add a cron job to your backend container by modifying the Dockerfile:

```dockerfile
# Install cron
RUN apt-get update && apt-get install -y cron

# Add crontab file
COPY crontab /etc/cron.d/message-cleanup
RUN chmod 0644 /etc/cron.d/message-cleanup
RUN crontab /etc/cron.d/message-cleanup

# Run cron in the background
CMD cron && php-fpm
```

Create a `crontab` file with:

```
0 0 * * * cd /var/www/html && php bin/console app:cleanup-old-messages >> /var/log/message-cleanup.log 2>&1
```

## Admin API Endpoint

Administrators can trigger the cleanup manually through an API endpoint:

```
POST /api/admin/messages/cleanup
```

Parameters:
- `days`: Number of days to keep messages (default: 15)
- `dryRun`: Boolean flag to run without actual deletion (default: false)

Example request:
```json
{
  "days": 30,
  "dryRun": true
}
```

This endpoint requires ROLE_ADMIN permissions.

## Modifying Retention Period

The default retention period is 15 days. To change this globally:

1. Edit the `cleanup_scheduler.yaml` configuration file
2. Update your cron job or scheduled task with the new parameter

## Logging

All cleanup operations are logged to the standard Symfony logs. Check your logs for details about cleanup operations:

```bash
tail -f var/log/dev.log | grep "message cleanup"
```
