FROM php:8.2-fpm

# Arguments for user creation
ARG USER_ID=1000
ARG GROUP_ID=1000

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
    libicu-dev \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-configure intl \
    && docker-php-ext-install -j$(nproc) \
        pdo_mysql \
        mbstring \
        exif \
        pcntl \
        bcmath \
        gd \
        zip \
        intl \
        opcache

# Install Composer
COPY --from=composer:2.6.5 /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/symfony

# Create system user to run Composer and Symfony Commands
RUN groupadd --gid ${GROUP_ID} dev \
    && useradd --uid ${USER_ID} --gid dev --shell /bin/bash --create-home dev \
    && mkdir -p /home/dev/.composer \
    && chown -R dev:dev /home/dev \
    && chown -R dev:dev /var/www

# Switch to dev user
USER dev

# Copy composer files first to leverage Docker cache
COPY --chown=dev:dev ./symfony/composer.* ./

# Install dependencies
RUN if [ -f composer.json ]; then \
        composer install --prefer-dist --no-dev --no-scripts --no-progress --no-interaction; \
    fi

# Copy existing application directory
COPY --chown=dev:dev ./symfony .

# Generate optimized autoload files
RUN if [ -f composer.json ]; then \
        composer dump-autoload --optimize; \
    fi

# Switch back to root for permissions
USER root

# Set proper permissions
RUN mkdir -p var && chown -R www-data:www-data var

# Switch back to dev user
USER dev

# Expose port 9000
EXPOSE 9000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD php-fpm -t || exit 1 