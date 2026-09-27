<?php

use App\Http\Controllers\SitemapController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Handles top-level entrypoints including dynamic SEO sitemaps and robots.txt.
|
*/

// SEO Dynamic Sitemap and Robots.txt
Route::get('/sitemap.xml', [SitemapController::class, 'index'])->name('sitemap');
Route::get('/robots.txt', [SitemapController::class, 'robots'])->name('robots');

// Root Entrypoint (SPA / API status)
Route::get('/', function () {
    if (file_exists(public_path('index.html'))) {
        return file_get_contents(public_path('index.html'));
    }
    return response()->json([
        'success' => true,
        'message' => 'GREEN TECHNOLOGIES API Root is operational',
    ]);
});

// Fallback Route
Route::fallback(function () {
    if (file_exists(public_path('index.html'))) {
        return file_get_contents(public_path('index.html'));
    }
    return response()->json([
        'success' => false,
        'message' => 'Resource not found',
    ], 404);
});
