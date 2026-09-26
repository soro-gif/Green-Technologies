<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    if (file_exists(public_path('index.html'))) {
        return file_get_contents(public_path('index.html'));
    }
    return response()->json([
        'success' => true,
        'message' => 'GREEN TECHNOLOGIES API Root is operational',
    ]);
});

Route::fallback(function () {
    if (file_exists(public_path('index.html'))) {
        return file_get_contents(public_path('index.html'));
    }
    return response()->json([
        'success' => false,
        'message' => 'Resource not found',
    ], 404);
});
