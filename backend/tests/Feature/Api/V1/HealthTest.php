<?php

namespace Tests\Feature\Api\V1;

use Tests\TestCase;

class HealthTest extends TestCase
{
    /**
     * Test the API v1 health endpoint contract.
     */
    public function test_v1_health_endpoint_returns_successful_json(): void
    {
        $response = $this->getJson('/api/v1/health');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'status',
                    'version',
                    'environment',
                    'timestamp',
                ],
            ])
            ->assertJson([
                'success' => true,
                'data' => [
                    'status' => 'healthy',
                    'version' => 'v1',
                ],
            ]);
    }
}
