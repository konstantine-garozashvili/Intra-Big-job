FROM php:8.2-fpm

RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libicu-dev \
    libzip-dev \
    && docker-php-ext-install \
    pdo_mysql \
    intl \
    zip

# Installation de l'extension APCu pour de meilleures performances
RUN pecl install apcu && docker-php-ext-enable apcu \
    && echo "apc.enable_cli=1" >> /usr/local/etc/php/conf.d/docker-php-ext-apcu.ini

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

ENV COMPOSER_ALLOW_SUPERUSER=1

WORKDIR /var/www/symfony

COPY . .

RUN composer install --no-interaction --optimize-autoloader --no-scripts

RUN mkdir -p var && chmod -R 777 var/

# Create JWT directory and set permissions
RUN mkdir -p config/jwt && chmod -R 777 config/jwt

# Fix line endings and generate JWT keys
RUN sed -i 's/\r$//' bin/console && \
    php bin/console lexik:jwt:generate-keypair --overwrite --no-interaction

# Copy php.ini
COPY php.ini /usr/local/etc/php/conf.d/app.ini

# Set PHP configuration
RUN echo "upload_max_filesize = 10M" > /usr/local/etc/php/conf.d/uploads.ini && \
    echo "post_max_size = 10M" >> /usr/local/etc/php/conf.d/uploads.ini

EXPOSE 9000

CMD ["php-fpm"]