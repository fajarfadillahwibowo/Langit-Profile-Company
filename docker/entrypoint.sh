#!/bin/sh
set -e

echo "==> [Langit CMS] Initializing production container..."

# 1. Ensure storage and upload directories exist with correct permissions
mkdir -p /var/www/html/storage/framework/sessions \
         /var/www/html/storage/framework/views \
         /var/www/html/storage/framework/cache/data \
         /var/www/html/storage/logs \
         /var/www/html/public/uploads/services \
         /var/www/html/public/uploads/profiles \
         /var/www/html/public/uploads/galleries

chown -R www-data:www-data /var/www/html/bootstrap/cache
chmod -R 775 /var/www/html/bootstrap/cache

# 2. Check environment file
if [ ! -f /var/www/html/.env ]; then
    echo "==> [ERROR] Production .env is required. Refusing to initialize or replace configuration."
    exit 1
fi

# 3. Generate APP_KEY if empty
if [ -z "${APP_KEY:-}" ] && ! grep -q '^APP_KEY=base64:' /var/www/html/.env; then
    echo "==> [ERROR] Existing APP_KEY is required. Refusing to rotate the encryption key."
    exit 1
fi

# 4. Storage symlink
if [ ! -L /var/www/html/public/storage ]; then
    echo "==> [Langit CMS] Creating storage public symlink..."
    php artisan storage:link || true
fi

# 5. Database readiness and migration
DB_CONN="${DB_CONNECTION:-sqlite}"

if [ "$DB_CONN" = "mysql" ]; then
    DB_H="${DB_HOST:-db}"
    DB_P="${DB_PORT:-3306}"
    echo "==> [Langit CMS] Waiting for MySQL database ($DB_H:$DB_P) to be ready..."
    
    RETRIES=30
    until nc -z -v -w3 "$DB_H" "$DB_P" 2>/dev/null || [ $RETRIES -eq 0 ]; do
        echo "==> MySQL is unavailable - sleeping 2s ($RETRIES attempts left)"
        RETRIES=$((RETRIES - 1))
        sleep 2
    done

    if [ $RETRIES -eq 0 ]; then
        echo "==> [ERROR] Unable to connect to MySQL database at $DB_H:$DB_P. Exiting."
        exit 1
    fi
    echo "==> [Langit CMS] MySQL database connected successfully!"
elif [ "$DB_CONN" = "sqlite" ]; then
    SQLITE_PATH="${DB_DATABASE:-/var/www/html/database/database.sqlite}"
    if [ ! -f "$SQLITE_PATH" ]; then
        echo "==> [ERROR] Existing SQLite database is required. Refusing to initialize a new database."
        exit 1
    fi
fi

# Database changes must be reviewed, backed up, and executed separately.
echo "==> [Langit CMS] Existing database preserved; automatic migrations are disabled."

if [ "${SEED_ON_DEPLOY:-false}" = "true" ]; then
    echo "==> [ERROR] SEED_ON_DEPLOY is forbidden during production updates."
    exit 1
fi

# 6. Optimize Laravel production caches
if [ "${APP_ENV:-production}" = "production" ]; then
    echo "==> [Langit CMS] Caching config, routes, and views for production performance..."
    php artisan config:cache || true
    php artisan route:cache || true
    php artisan view:cache || true
fi

echo "==> [Langit CMS] Ready to serve! Starting process: $@"
exec "$@"
