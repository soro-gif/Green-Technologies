<?php

namespace App\Providers;

use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     *
     * Force HTTPS scheme when the app is running behind an HTTPS reverse proxy
     * (e.g. Render, Railway, Heroku). Without this, Laravel's url() helper uses
     * the internal HTTP scheme and generates mixed-content http:// URLs.
     */
    public function boot(): void
    {
        // Force https:// if APP_URL declares https OR we're in production
        $appUrl = config('app.url', '');
        if (str_starts_with($appUrl, 'https://') || config('app.env') === 'production') {
            URL::forceScheme('https');
        }
    }
}
