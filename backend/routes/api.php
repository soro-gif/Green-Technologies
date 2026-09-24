<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application.
| All routes are prefixed with /api automatically.
|
*/

// Version 1 Routes
Route::prefix('v1')->group(base_path('routes/api/v1.php'));

// Fallback technical health endpoint directly on /api/health for backward compatibility
Route::get('/health', function () {
    return response()->json([
        'success' => true,
        'message' => 'GREEN TECHNOLOGIES API Root is operational',
        'current_version' => 'v1',
        'endpoints' => [
            'v1_health' => url('/api/v1/health'),
        ],
    ]);
});
