<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseApiController;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class HealthController extends BaseApiController
{
    /**
     * Return the technical health status of the API.
     */
    public function __invoke(): JsonResponse
    {
        $dbStatus = 'disconnected';

        try {
            DB::connection()->getPdo();
            $dbStatus = 'connected';
        } catch (\Throwable) {
            // Le statut suffit : le détail de l'erreur reste dans les journaux du serveur
        }

        return $this->success([
            'status' => 'healthy',
            'version' => 'v1',
            'database' => $dbStatus,
            'environment' => config('app.env'),
            'timestamp' => now()->toIso8601String(),
        ], 'GREEN TECHNOLOGIES API v1 is operational');
    }
}
