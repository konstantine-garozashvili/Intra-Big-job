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

## Setup Instructions

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

### 4. Verify Installation

The following services should be available:
- Main application: http://localhost:8080
- PHPMyAdmin: http://localhost:8081
  - Username: symfony_user
  - Password: your_password (or what you set in .env.local)

### 5. Common Commands

```bash
# Stop all containers
docker-compose down

# View logs
docker-compose logs

# View specific service logs
docker-compose logs app    # PHP-FPM logs
docker-compose logs nginx  # Nginx logs
docker-compose logs db     # MySQL logs

# Rebuild containers (if you modify Dockerfile or docker-compose.yml)
docker-compose down -v
docker-compose up -d --build

# Access PHP container (for running Symfony commands)
docker-compose exec app bash
```

### 6. Directory Structure

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

### 502 Bad Gateway
1. Check if all containers are running:
   ```bash
   docker-compose ps
   ```
2. Verify logs for errors:
   ```bash
   docker-compose logs nginx app
   ```
3. Make sure no other services are using required ports (8080, 8081, 3306)

### Database Connection Issues
1. Verify MySQL is running:
   ```bash
   docker-compose ps db
   ```
2. Check database logs:
   ```bash
   docker-compose logs db
   ```
3. Verify your .env.local database credentials match docker-compose.yml

### Permission Issues
If you encounter permission issues:
1. The containers run with UID/GID 1000 by default
2. Ensure your host user has proper permissions on the project directory
3. If needed, adjust USER_ID and GROUP_ID in the Dockerfile

## Development Workflow

1. Code changes in the `symfony/` directory are immediately reflected in the running application
2. Clear Symfony cache after major changes:
   ```bash
   docker-compose exec app php bin/console cache:clear
   ```
3. Install new dependencies:
   ```bash
   docker-compose exec app composer require [package-name]
   ```

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## Tech Stack

- PHP 8.2
- Symfony 6.4
- MySQL 8.2
- Nginx 1.24
- Docker & Docker Compose


