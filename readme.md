# Intra Big Project - Symfony 6.4

A modern web application built with Symfony 6.4, using Docker for development environment.

## Prerequisites

Before you begin, ensure you have the following installed on your system:
- [Docker](https://www.docker.com/products/docker-desktop/)
- [Git](https://git-scm.com/downloads)
- A text editor or IDE (VS Code, PHPStorm, etc.)

## Port Requirements

Make sure these ports are available on your system:
- `8080` - Main application
- `8081` - PHPMyAdmin
- `3306` - MySQL

## Step-by-Step Setup Guide

### 1. Clone the Repository

```bash
git clone [repository-url]
cd [repository-name]
```

### 2. Environment Setup

```bash
# Copy the environment file
cp .env.local.example .env.local

# Edit .env.local with your database credentials if needed
# Default values are:
# MYSQL_DATABASE=Bigproject
# MYSQL_USER=symfony_user
# MYSQL_PASSWORD=your_password
# MYSQL_ROOT_PASSWORD=your_root_password
```

### 3. Start Docker Services

```bash
# First time setup or to rebuild:
docker-compose up -d --build

# For subsequent starts:
docker-compose up -d
```

### 4. Install Dependencies and Setup Database

```bash
# Install PHP dependencies
docker-compose exec app composer install

# Create database schema
docker-compose exec app php bin/console doctrine:schema:create

# Clear cache
docker-compose exec app php bin/console cache:clear
```

### 5. Working with Bundles

```bash
# Install a new bundle
docker-compose exec app composer require bundle-name

# Install a development bundle
docker-compose exec app composer require --dev bundle-name

# Update all packages
docker-compose exec app composer update

# Clear cache after bundle installation
docker-compose exec app php bin/console cache:clear
```

### 6. Database Operations

```bash
# Create a new migration
docker-compose exec app php bin/console make:migration

# Run migrations
docker-compose exec app php bin/console doctrine:migrations:migrate

# Create a new entity
docker-compose exec app php bin/console make:entity
```

### 7. Common Docker Commands

```bash
# View logs
docker-compose logs

# View specific service logs
docker-compose logs app    # PHP-FPM logs
docker-compose logs nginx  # Nginx logs
docker-compose logs db     # MySQL logs

# Restart services
docker-compose restart

# Stop all services
docker-compose down

# Rebuild containers
docker-compose down -v
docker-compose up -d --build
```

## Directory Structure

```
.
├── docker/
│   ├── nginx/
│   │   └── conf.d/
│   │       └── app.conf    # Nginx configuration
│   └── php/
│       ├── php.ini         # PHP configuration
│       └── php-fpm.conf    # PHP-FPM configuration
├── symfony/                # Symfony application code
├── docker-compose.yml      # Docker services configuration
└── Dockerfile             # PHP container configuration
```

## Troubleshooting

### Performance Issues
1. Make sure the vendor volume is properly mounted
2. Verify OPcache is working
3. Check PHP-FPM process manager status

### 502 Bad Gateway
1. Check if all containers are running: `docker-compose ps`
2. Verify logs: `docker-compose logs nginx app`
3. Make sure no other services are using required ports

### Database Connection Issues
1. Verify MySQL is running: `docker-compose ps db`
2. Check database logs: `docker-compose logs db`
3. Verify your .env.local database credentials

### Permission Issues
1. The containers run with UID/GID 1000 by default
2. Ensure your host user has proper permissions
3. If needed, adjust USER_ID and GROUP_ID in docker-compose.yml

## Development Best Practices

1. Always work in feature branches
2. Run tests before committing: `docker-compose exec app php bin/phpunit`
3. Keep dependencies updated
4. Clear cache after major changes
5. Use proper Git commit messages

## Tech Stack

- PHP 8.2
- Symfony 6.4
- MySQL 8.2
- Nginx 1.24
- Docker & Docker Compose


