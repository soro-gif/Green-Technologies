<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseApiController;
use Database\Seeders\CategorySeeder;
use Database\Seeders\ServiceSeeder;
use Database\Seeders\ProjectSeeder;
use Illuminate\Http\JsonResponse;

class HealthController extends BaseApiController
{
    /**
     * Return the technical health status of the API and ensure seed data is synced.
     */
    public function __invoke(): JsonResponse
    {
        try {
            (new CategorySeeder())->run();
            (new ServiceSeeder())->run();
            (new ProjectSeeder())->run();
        } catch (\Throwable $e) {
            // Ignore error if already synced
        }

        return $this->success([
            'status' => 'healthy',
            'version' => 'v1',
            'environment' => config('app.env'),
            'timestamp' => now()->toIso8601String(),
        ], 'GREEN TECHNOLOGIES API v1 is operational');
    }
}
