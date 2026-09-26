<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseApiController;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;

class HealthController extends BaseApiController
{
    /**
     * Return the technical health status of the API and ensure migrations and seeds are run.
     */
    public function __invoke(): JsonResponse
    {
        $dbStatus = 'disconnected';
        $migrateStatus = 'not_run';

        try {
            DB::connection()->getPdo();
            $dbStatus = 'connected';

            // Auto-run migrations and seeds if invoked
            Artisan::call('migrate', ['--force' => true]);
            Artisan::call('db:seed', ['--force' => true]);
            $migrateStatus = 'success';
        } catch (\Throwable $e) {
            $migrateStatus = 'error: ' . $e->getMessage();
        }

        return $this->success([
            'status' => 'healthy',
            'version' => 'v1',
            'database' => $dbStatus,
            'migration' => $migrateStatus,
            'environment' => config('app.env'),
            'timestamp' => now()->toIso8601String(),
        ], 'GREEN TECHNOLOGIES API v1 is operational');
    }
}
