# Symfony Profiler Toggle

The Symfony Profiler is a powerful development tool but can impact performance. This project includes a toggle system to enable/disable the profiler as needed.

## Web Interface

The easiest way to manage the profiler is through the web interface:

1. Ensure your application is running in the `dev` environment
2. Visit `/dev-tools/profiler` in your browser
3. Use the toggle switch to enable/disable the profiler
4. Click "Update Profiler Settings" to apply changes

## Command Line

You can toggle the profiler from the command line:

### Using Docker

```bash
# Enable the profiler (will collect data on all requests)
./toggle-profiler.sh --enable && docker exec -it infra-backend-1 php bin/console cache:clear

# Disable the profiler (will only collect data on exceptions)
./toggle-profiler.sh
```

### Directly on the Server

```bash
# Enable the profiler (will collect data on all requests)
php bin/toggle-profiler --enable

# Disable the profiler (will only collect data on exceptions)
php bin/toggle-profiler
```

## Behavior

- When the profiler is **enabled**, it will automatically collect data on **all requests**
- When the profiler is **disabled**, it will only collect data on **exceptions**

## Manual Configuration

You can also manually configure the profiler by editing:

```yaml
# backend/config/packages/profiler.yaml
parameters:
    profiler.enabled: true|false
    profiler.only_exceptions: true|false
```

After manual changes, clear the cache:

```bash
php bin/console cache:clear
```

## Performance Considerations

- The profiler is a development tool and should be disabled in production environments
- Even in development, enabling the profiler can slow down your application
- For best performance, keep the profiler disabled when not actively debugging
- When enabled, the profiler will collect data on all requests, which can impact performance 