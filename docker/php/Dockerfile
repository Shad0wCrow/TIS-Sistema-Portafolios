FROM php:7.4-cli

RUN apt-get update && apt-get install -y \
    git \
    curl \
    zip \
    unzip \
    libpq-dev

# extensiones para PostgreSQL y OPcache
RUN docker-php-ext-install pdo pdo_pgsql pgsql opcache

# copiar configuración de OPcache
COPY docker/php/opcache.ini /usr/local/etc/php/conf.d/opcache.ini

# instalar composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www