FROM php:8.2-fpm

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    libzip-dev \
    --no-install-recommends

# Clear cache
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip intl opcache

# Get latest Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/symfony

# Create system user
RUN useradd -G www-data,root -u 1000 -d /home/dev dev
RUN mkdir -p /home/dev/.composer && \
    chown -R dev:dev /home/dev

# Switch to dev user for composer operations
USER dev

# Copy composer files first to leverage Docker cache
COPY --chown=dev:dev ./symfony/composer.* ./

# Install dependencies (if composer.json exists)
RUN if [ -f composer.json ]; then composer install --no-scripts --no-autoloader; fi

# Copy existing application directory
COPY --chown=dev:dev ./symfony .

# Generate autoload files
RUN if [ -f composer.json ]; then composer dump-autoload --optimize; fi

# Switch back to root for permissions
USER root
RUN chown -R www-data:www-data var

# Switch back to dev user
USER dev 