# Bigproject - Symfony 6.4 Project

## Project Setup Instructions

## Prerequisites
- Docker and Docker Compose installed
- Ports 8080, 8081, and 3306 available on your system

## Setup Steps

1. Clone the repository
```bash
git clone [repository-url]
cd [repository-name]
```

2. Copy the environment file
```bash
cp .env.local.example .env.local
```

3. Create required directories and verify Nginx configuration
```bash
# Create nginx config directory if it doesn't exist
mkdir -p docker/nginx/conf.d

# Verify that only app.conf exists in the nginx/conf.d directory
# Remove any other .conf files if they exist
rm -f docker/nginx/conf.d/default.conf
```

4. Start Docker containers
```bash
# Stop any running containers and remove old volumes
docker-compose down -v

# Build and start fresh containers
docker-compose up -d --build
```

5. Install dependencies (first time only)
```bash
docker-compose exec app composer install
```

## Accessing Services
- Main application: http://localhost:8080
- PHPMyAdmin: http://localhost:8081
  - Username: symfony_user
  - Password: your_password

## Troubleshooting

If you encounter a 502 error:
1. Make sure all ports are available
2. Check if the containers are running: `docker-compose ps`
3. View logs: `docker-compose logs nginx app`
4. Ensure only app.conf exists in docker/nginx/conf.d/
5. Try rebuilding with fresh containers:
   ```bash
   docker-compose down -v
   docker-compose up -d --build
   ```
6. Check Nginx logs:
   ```bash
   docker-compose exec nginx cat /var/log/nginx/error.log
   ```

### Tech Stack
- PHP 8.2
- MySQL 8.2
- Symfony 6.4
- Nginx
- phpMyAdmin


