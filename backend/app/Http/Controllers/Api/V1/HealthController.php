<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseApiController;
use Illuminate\Http\JsonResponse;

class HealthController extends BaseApiController
{
    /**
     * Return the technical health status of the API.
     */
    public function __invoke(): JsonResponse
    {
        return $this->success([
            'status' => 'healthy',
            'version' => 'v1',
            'environment' => config('app.env'),
            'timestamp' => now()->toIso8601String(),
        ], 'GREEN TECHNOLOGIES API v1 is operational');
    }
}
