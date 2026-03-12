FROM php:7.4-cli

RUN apt-get update && apt-get install -y \
    git \
    curl \
    zip \
    unzip \
    libpq-dev

# extensión para PostgreSQL
RUN docker-php-ext-install pdo pdo_pgsql pgsql

# instalar composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www