<?php

namespace Tests\Feature\Api\V1;

use App\Enums\UserRole;
use App\Models\Category;
use App\Models\Project;
use App\Models\Service;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminCatalogApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthenticated_user_cannot_access_admin_catalog(): void
    {
        $response = $this->getJson('/api/v1/admin/categories');
        $response->assertStatus(401);
    }

    public function test_admin_can_create_and_update_category(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin, 'is_active' => true]);
        Sanctum::actingAs($admin);

        $response = $this->postJson('/api/v1/admin/categories', [
            'name' => 'Énergie Renouvelable',
            'description' => 'Toutes solutions d\'énergies propres',
            'icon' => 'sun',
            'is_active' => true,
            'display_order' => 1,
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.name', 'Énergie Renouvelable')
            ->assertJsonPath('data.slug', 'energie-renouvelable');

        $categoryId = $response->json('data.id');

        $updateResponse = $this->putJson("/api/v1/admin/categories/{$categoryId}", [
            'name' => 'Énergies Renouvelables & Climat',
        ]);

        $updateResponse->assertStatus(200)
            ->assertJsonPath('data.name', 'Énergies Renouvelables & Climat');
    }

    public function test_admin_can_create_and_delete_service(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin, 'is_active' => true]);
        Sanctum::actingAs($admin);

        $category = Category::factory()->create();

        $response = $this->postJson('/api/v1/admin/services', [
            'category_id' => $category->id,
            'title' => 'Adduction d\'eau potable',
            'summary' => 'Réseaux de distribution d\'eau',
            'description' => 'Conception, dimensionnement et déploiement de canalisations d\'eau potable.',
            'is_active' => true,
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.title', 'Adduction d\'eau potable');

        $serviceId = $response->json('data.id');

        $deleteResponse = $this->deleteJson("/api/v1/admin/services/{$serviceId}");
        $deleteResponse->assertStatus(200);

        $this->assertDatabaseMissing('services', ['id' => $serviceId]);
    }
}
