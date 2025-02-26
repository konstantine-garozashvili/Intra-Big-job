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

# Create necessary directories with proper permissions
RUN mkdir -p /var/www/symfony/var/cache \
    /var/www/symfony/var/log \
    /var/www/symfony/vendor \
    && chown -R dev:dev /var/www/symfony \
    && chmod -R 777 /var/www/symfony/var

# Switch to dev user
USER dev

# Copy composer files first to leverage Docker cache
COPY --chown=dev:dev ./symfony/composer.json ./symfony/composer.lock ./

# Install dependencies with optimizations
RUN composer install \
    --prefer-dist \
    --no-scripts \
    --no-progress \
    --no-interaction \
    --optimize-autoloader \
    --classmap-authoritative

# Copy existing application directory
COPY --chown=dev:dev ./symfony .

# Run scripts and generate optimized autoload files
RUN composer dump-autoload --optimize --classmap-authoritative \
    && composer run-script post-install-cmd

# Switch back to root for permissions
USER root

# Set proper permissions for var directory
RUN chown -R www-data:www-data var \
    && chmod -R 777 var \
    && chmod -R g+s var

# Configure opcache for better performance
RUN { \
    echo 'opcache.memory_consumption=256'; \
    echo 'opcache.interned_strings_buffer=16'; \
    echo 'opcache.max_accelerated_files=20000'; \
    echo 'opcache.revalidate_freq=0'; \
    echo 'opcache.fast_shutdown=1'; \
    echo 'opcache.enable_cli=1'; \
    echo 'opcache.enable=1'; \
    echo 'opcache.validate_timestamps=0'; \
    echo 'opcache.max_wasted_percentage=10'; \
    } > /usr/local/etc/php/conf.d/opcache-recommended.ini

# Configure PHP-FPM for better performance
RUN { \
    echo '[www]'; \
    echo 'pm = dynamic'; \
    echo 'pm.max_children = 10'; \
    echo 'pm.start_servers = 3'; \
    echo 'pm.min_spare_servers = 2'; \
    echo 'pm.max_spare_servers = 5'; \
    echo 'pm.max_requests = 500'; \
    } > /usr/local/etc/php-fpm.d/zz-docker.conf

# Switch back to dev user
USER dev

# Expose port 9000
EXPOSE 9000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD php-fpm -t || exit 1 