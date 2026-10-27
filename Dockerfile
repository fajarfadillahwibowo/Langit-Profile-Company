# ==========================================================
# STAGE 1: Frontend Asset Compilation (Vite & React)
# ==========================================================
FROM node:22-alpine AS frontend

WORKDIR /app

# Install npm dependencies first to leverage Docker layer caching
COPY package.json package-lock.json ./
RUN npm ci

# Copy frontend source files
COPY vite.config.js ./
COPY resources ./resources
COPY public ./public

# Build production bundle into public/build
RUN npm run build

# ==========================================================
# STAGE 2: PHP 8.4 Application Runtime (PHP-FPM Alpine)
# ==========================================================
FROM php:8.4-fpm-alpine AS app

LABEL maintainer="Langit Profile Company"
LABEL description="Production PHP 8.4 FPM container for Langit Profile Company"

WORKDIR /var/www/html

# Install system libraries and build dependencies
RUN apk add --no-cache \
        bash \
        curl \
        git \
        libpng \
        libjpeg-turbo \
        freetype \
        libwebp \
        libzip \
        icu \
        oniguruma \
        sqlite-libs \
        supervisor \
        netcat-openbsd \
    && apk add --no-cache --virtual .build-deps \
        $PHPIZE_DEPS \
        libpng-dev \
        libjpeg-turbo-dev \
        freetype-dev \
        libwebp-dev \
        libzip-dev \
        icu-dev \
        oniguruma-dev \
        sqlite-dev \
    # Configure & install PHP extensions
    && docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp \
    && docker-php-ext-install -j$(nproc) \
        gd \
        pdo \
        pdo_mysql \
        pdo_sqlite \
        mbstring \
        exif \
        pcntl \
        bcmath \
        zip \
        intl \
        opcache \
    # Install Redis extension for fast cache & session
    && pecl install redis \
    && docker-php-ext-enable redis \
    # Clean up build dependencies to minimize image size
    && apk del .build-deps \
    && rm -rf /tmp/pear

# Install Composer 2 from official image
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Copy composer definition files first for layer caching
COPY composer.json composer.lock ./

# Install production PHP dependencies
RUN composer install --no-dev --no-interaction --prefer-dist --optimize-autoloader --no-scripts

# Copy full application code
COPY . .

# Copy compiled frontend assets from Stage 1
COPY --from=frontend /app/public/build ./public/build

# Complete composer autoload optimization
RUN composer dump-autoload --optimize --no-dev

# Copy custom configurations
COPY docker/php/php.ini /usr/local/etc/php/conf.d/99-custom.ini
COPY docker/php/opcache.ini /usr/local/etc/php/conf.d/opcache.ini
COPY docker/supervisor/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh

# Normalize line endings and permissions for entrypoint
RUN sed -i 's/\r$//' /usr/local/bin/entrypoint.sh \
    && chmod +x /usr/local/bin/entrypoint.sh

# Set directory ownership to www-data
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

EXPOSE 9000

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["php-fpm"]
