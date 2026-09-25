#!/bin/bash
set -e

# Run optimizations & migrations in production
if [ "$APP_ENV" = "production" ]; then
    echo "Running production setup..."
    php artisan package:discover --ansi || true
    php artisan config:cache || true
    php artisan route:cache || true
    php artisan view:cache || true
    php artisan migrate --force || true
fi

exec "$@"
