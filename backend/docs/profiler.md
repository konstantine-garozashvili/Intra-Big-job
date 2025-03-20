# Symfony Profiler Toggle

The Symfony Profiler is a powerful development tool but can impact performance. This project includes a toggle system to enable/disable the profiler as needed.

## Web Interface

The easiest way to manage the profiler is through the web interface:

1. Ensure your application is running in the `dev` environment
2. Visit `/dev-tools/profiler` in your browser
3. Use the toggle switches to enable/disable the profiler and configure its behavior
4. Click "Update Profiler Settings" to apply changes

## Command Line

You can toggle the profiler from the command line:

### Using Docker

```bash
# Enable the profiler
./toggle-profiler.sh --enable

# Enable the profiler and collect data on all requests (not just exceptions)
./toggle-profiler.sh --enable --all-requests

# Disable the profiler
./toggle-profiler.sh
```

### Directly on the Server

```bash
# Enable the profiler
php bin/toggle-profiler --enable

# Enable the profiler and collect data on all requests
php bin/toggle-profiler --enable --all-requests

# Disable the profiler
php bin/toggle-profiler
```

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
- Consider using the "only exceptions" option to reduce overhead when the profiler is enabled 