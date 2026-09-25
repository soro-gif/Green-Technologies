<?php

use App\Http\Controllers\Api\V1\Admin\AdminArticleController;
use App\Http\Controllers\Api\V1\Admin\AdminCategoryController;
use App\Http\Controllers\Api\V1\Admin\AdminContactController;
use App\Http\Controllers\Api\V1\Admin\AdminDashboardController;
use App\Http\Controllers\Api\V1\Admin\AdminProjectController;
use App\Http\Controllers\Api\V1\Admin\AdminQuoteController;
use App\Http\Controllers\Api\V1\Admin\AdminServiceController;
use App\Http\Controllers\Api\V1\Admin\AdminTestimonialController;
use App\Http\Controllers\Api\V1\Admin\AdminUploadController;
use App\Http\Controllers\Api\V1\Admin\AdminUserController;
use App\Http\Controllers\Api\V1\ArticleController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\CategoryController;
use App\Http\Controllers\Api\V1\ContactController;
use App\Http\Controllers\Api\V1\HealthController;
use App\Http\Controllers\Api\V1\ProjectController;
use App\Http\Controllers\Api\V1\QuoteController;
use App\Http\Controllers\Api\V1\ServiceController;
use App\Http\Controllers\Api\V1\TestimonialController;
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

// =========================================================================
// PUBLIC CATALOG & ENGAGEMENT ROUTES
// =========================================================================

// Categories / Domains
Route::get('/categories', [CategoryController::class, 'index'])->name('api.v1.categories.index');
Route::get('/categories/{slug}', [CategoryController::class, 'show'])->name('api.v1.categories.show');

// Services
Route::get('/services', [ServiceController::class, 'index'])->name('api.v1.services.index');
Route::get('/services/featured', [ServiceController::class, 'featured'])->name('api.v1.services.featured');
Route::get('/services/{slug}', [ServiceController::class, 'show'])->name('api.v1.services.show');

// Projects / Portfolio
Route::get('/projects', [ProjectController::class, 'index'])->name('api.v1.projects.index');
Route::get('/projects/featured', [ProjectController::class, 'featured'])->name('api.v1.projects.featured');
Route::get('/projects/{slug}', [ProjectController::class, 'show'])->name('api.v1.projects.show');

// Testimonials
Route::get('/testimonials', [TestimonialController::class, 'index'])->name('api.v1.testimonials.index');
Route::get('/testimonials/featured', [TestimonialController::class, 'featured'])->name('api.v1.testimonials.featured');

// Blog / News
Route::get('/articles', [ArticleController::class, 'index'])->name('api.v1.articles.index');
Route::get('/articles/{slug}', [ArticleController::class, 'show'])->name('api.v1.articles.show');

// Quote Requests (Submission & Tracking) with Rate Limiting
Route::post('/quotes', [QuoteController::class, 'store'])
    ->middleware('throttle:10,1')
    ->name('api.v1.quotes.store');
Route::get('/quotes/track/{reference}', [QuoteController::class, 'track'])
    ->middleware('throttle:20,1')
    ->name('api.v1.quotes.track');

// Contact Messages with Rate Limiting
Route::post('/contact', [ContactController::class, 'store'])
    ->middleware('throttle:10,1')
    ->name('api.v1.contact.store');

// =========================================================================
// AUTHENTICATION ROUTES
// =========================================================================
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

use App\Http\Controllers\Api\V1\User\UserMessageController;
use App\Http\Controllers\Api\V1\User\UserProfileController;
use App\Http\Controllers\Api\V1\User\UserQuoteController;

// =========================================================================
// PROTECTED ROUTES (Sanctum Authentication)
// =========================================================================
Route::middleware('auth:sanctum')->group(function () {
    // Current User Profile & Session
    Route::prefix('auth')->group(function () {
        Route::get('/me', [AuthController::class, 'me'])->name('api.v1.auth.me');
        Route::post('/logout', [AuthController::class, 'logout'])->name('api.v1.auth.logout');
    });

    // =====================================================================
    // USER PERSONAL PORTAL (Accessible to any authenticated user/client)
    // =====================================================================
    Route::prefix('user')->group(function () {
        // User Profile
        Route::get('/profile', [UserProfileController::class, 'show'])->name('api.v1.user.profile.show');
        Route::put('/profile', [UserProfileController::class, 'update'])->name('api.v1.user.profile.update');

        // User Own Quotes
        Route::get('/quotes', [UserQuoteController::class, 'index'])->name('api.v1.user.quotes.index');
        Route::get('/quotes/{id}', [UserQuoteController::class, 'show'])->name('api.v1.user.quotes.show');
        Route::post('/quotes', [UserQuoteController::class, 'store'])->name('api.v1.user.quotes.store');

        // User Messages
        Route::get('/messages', [UserMessageController::class, 'index'])->name('api.v1.user.messages.index');
        Route::post('/messages', [UserMessageController::class, 'store'])->name('api.v1.user.messages.store');
    });

    // Administration Backoffice API (Accessible strictly to super_admin, admin, editor)
    Route::prefix('admin')->middleware('role:super_admin,admin,editor')->group(function () {
        // Dashboard connectivity check
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

        // Dashboard Overview & Stats
        Route::get('/dashboard-stats', [AdminDashboardController::class, 'stats'])
            ->middleware('role:super_admin,admin')
            ->name('api.v1.admin.dashboard_stats');

        // Categories Management
        Route::apiResource('categories', AdminCategoryController::class)
            ->names('api.v1.admin.categories');

        // Services Management
        Route::apiResource('services', AdminServiceController::class)
            ->names('api.v1.admin.services');

        // Projects Management
        Route::apiResource('projects', AdminProjectController::class)
            ->names('api.v1.admin.projects');

        // Quotes Management, Export & Stats
        Route::get('quotes/export', [AdminQuoteController::class, 'export'])
            ->name('api.v1.admin.quotes.export');
        Route::get('quotes/stats', [AdminQuoteController::class, 'stats'])
            ->name('api.v1.admin.quotes.stats');
        Route::get('quotes', [AdminQuoteController::class, 'index'])
            ->name('api.v1.admin.quotes.index');
        Route::get('quotes/{quote}', [AdminQuoteController::class, 'show'])
            ->name('api.v1.admin.quotes.show');
        Route::patch('quotes/{quote}/status', [AdminQuoteController::class, 'updateStatus'])
            ->name('api.v1.admin.quotes.update_status');
        Route::delete('quotes/{quote}', [AdminQuoteController::class, 'destroy'])
            ->name('api.v1.admin.quotes.destroy');

        // Contact Messages Management, Export & Stats
        Route::get('contact-messages/export', [AdminContactController::class, 'export'])
            ->name('api.v1.admin.contact_messages.export');
        Route::get('contact-messages/stats', [AdminContactController::class, 'stats'])
            ->name('api.v1.admin.contact_messages.stats');
        Route::get('contact-messages', [AdminContactController::class, 'index'])
            ->name('api.v1.admin.contact_messages.index');
        Route::get('contact-messages/{message}', [AdminContactController::class, 'show'])
            ->name('api.v1.admin.contact_messages.show');
        Route::patch('contact-messages/{message}/status', [AdminContactController::class, 'updateStatus'])
            ->name('api.v1.admin.contact_messages.update_status');
        Route::delete('contact-messages/{message}', [AdminContactController::class, 'destroy'])
            ->name('api.v1.admin.contact_messages.destroy');

        // Testimonials Management
        Route::apiResource('testimonials', AdminTestimonialController::class)
            ->names('api.v1.admin.testimonials');

        // Articles Management
        Route::apiResource('articles', AdminArticleController::class)
            ->names('api.v1.admin.articles');

        // Media & Image Upload from Computer Explorer
        Route::post('upload', [AdminUploadController::class, 'uploadImage'])
            ->name('api.v1.admin.upload');

        // Users Management (SuperAdmin only via Policy/Request)
        Route::apiResource('users', AdminUserController::class)
            ->names('api.v1.admin.users');
    });
});
