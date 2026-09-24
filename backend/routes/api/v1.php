<?php

use App\Http\Controllers\Api\V1\AuthController;
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

// Public Authentication Routes (with Rate Limiting)
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register'])
        ->middleware('throttle:10,1')
        ->name('api.v1.auth.register');

    Route::post('/login', [AuthController::class, 'login'])
        ->middleware('throttle:5,1')
        ->name('api.v1.auth.login');

    Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])
        ->middleware('throttle:5,1')
        ->name('api.v1.auth.forgot_password');

    Route::post('/reset-password', [AuthController::class, 'resetPassword'])
        ->middleware('throttle:5,1')
        ->name('api.v1.auth.reset_password');
});

// Protected Routes (Sanctum Authentication required)
Route::middleware('auth:sanctum')->group(function () {
    // Auth & Profile
    Route::prefix('auth')->group(function () {
        Route::get('/me', [AuthController::class, 'me'])->name('api.v1.auth.me');
        Route::post('/logout', [AuthController::class, 'logout'])->name('api.v1.auth.logout');
    });

    // RBAC Protected Test Routes (Admin & SuperAdmin)
    Route::prefix('admin')->group(function () {
        Route::get('/dashboard-check', function (Request $request) {
            return response()->json([
                'success' => true,
                'message' => 'Accès autorisé à l\'administration.',
                'data' => [
                    'user' => $request->user()->name,
                    'role' => $request->user()->role->value,
                ],
            ]);
        })->middleware('role:super_admin,admin')->name('api.v1.admin.check');

        Route::get('/users-manage-check', function () {
            return response()->json([
                'success' => true,
                'message' => 'Accès autorisé à la gestion des utilisateurs (SuperAdmin).',
            ]);
        })->middleware('permission:users.manage')->name('api.v1.admin.users_manage');
    });
});
