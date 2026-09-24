<?php

use App\Http\Controllers\Api\V1\HealthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API V1 Routes
|--------------------------------------------------------------------------
|
| Prefix: /api/v1
|
*/

// Technical Health Check
Route::get('/health', HealthController::class)->name('api.v1.health');

// Protected Routes Template (Sanctum)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return response()->json([
            'success' => true,
            'message' => 'Authenticated user retrieved',
            'data' => $request->user(),
        ]);
    })->name('api.v1.user');
});
