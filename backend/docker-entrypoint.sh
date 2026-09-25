#!/bin/bash
set -e

echo "========================================="
echo " GREEN TECHNOLOGIES - Laravel Startup"
echo "========================================="

# --------------------------------------------------
# Laravel storage directories
# --------------------------------------------------

mkdir -p \
    /var/www/html/storage/logs \
    /var/www/html/storage/framework/cache/data \
    /var/www/html/storage/framework/sessions \
    /var/www/html/storage/framework/views \
    /var/www/html/storage/app/public \
    /var/www/html/bootstrap/cache

# --------------------------------------------------
# Permissions
# --------------------------------------------------

chown -R www-data:www-data \
    /var/www/html/storage \
    /var/www/html/bootstrap/cache

chmod -R 775 \
    /var/www/html/storage \
    /var/www/html/bootstrap/cache

echo "Storage permissions configured."

# --------------------------------------------------
# Laravel package discovery
# --------------------------------------------------

php artisan package:discover --ansi

# --------------------------------------------------
# Clear old caches
# --------------------------------------------------

php artisan optimize:clear

# --------------------------------------------------
# Database migrations
# --------------------------------------------------

echo "Running database migrations..."

php artisan migrate --force

# --------------------------------------------------
# Production optimization
# --------------------------------------------------

php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "Laravel startup completed successfully."

# --------------------------------------------------
# Start Apache
# --------------------------------------------------

exec "$@"