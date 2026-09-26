#!/bin/bash
set -e

echo "========================================="
echo " GREEN TECHNOLOGIES - Laravel Startup"
echo "========================================="

# --------------------------------------------------
# Laravel storage & public upload directories
# --------------------------------------------------
mkdir -p \
    /var/www/html/storage/logs \
    /var/www/html/storage/framework/cache/data \
    /var/www/html/storage/framework/sessions \
    /var/www/html/storage/framework/views \
    /var/www/html/storage/app/public \
    /var/www/html/public/uploads/articles \
    /var/www/html/public/uploads/projects \
    /var/www/html/public/uploads/services \
    /var/www/html/public/uploads/general \
    /var/www/html/public/uploads/categories \
    /var/www/html/bootstrap/cache

chown -R www-data:www-data \
    /var/www/html/storage \
    /var/www/html/public/uploads \
    /var/www/html/bootstrap/cache

chmod -R 775 \
    /var/www/html/storage \
    /var/www/html/public/uploads \
    /var/www/html/bootstrap/cache

# Create storage symlink
php artisan storage:link || true

echo "Storage and uploads permissions configured."

# --------------------------------------------------
# Laravel package discovery
# --------------------------------------------------
php artisan package:discover --ansi || true

# --------------------------------------------------
# Database migrations (MUST RUN BEFORE CACHE CLEAR)
# --------------------------------------------------
echo "Running database migrations..."
php artisan migrate --force || true

# --------------------------------------------------
# Production optimizations (after tables exist)
# --------------------------------------------------
echo "Caching configurations and routes..."
php artisan config:cache || true
php artisan route:cache || true
php artisan view:cache || true

echo "========================================="
echo " Laravel startup completed successfully!"
echo "========================================="

# --------------------------------------------------
# Start Apache
# --------------------------------------------------
exec "$@"