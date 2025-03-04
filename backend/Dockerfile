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

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

ENV COMPOSER_ALLOW_SUPERUSER=1

WORKDIR /var/www/symfony

COPY . .

RUN composer install --no-interaction --optimize-autoloader --no-scripts

RUN mkdir -p var && chmod -R 777 var/

# Generate JWT keys (with force overwrite if they already exist)
RUN php bin/console lexik:jwt:generate-keypair --overwrite --no-interaction

EXPOSE 9000

CMD ["php-fpm"]