<?php

namespace Tests\Feature\Auth;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RbacTest extends TestCase
{
    use RefreshDatabase;

    public function test_super_admin_can_access_admin_and_users_manage_routes(): void
    {
        $superAdmin = User::factory()->create([
            'role' => UserRole::SuperAdmin,
            'is_active' => true,
        ]);

        $response1 = $this->actingAs($superAdmin, 'sanctum')->getJson('/api/v1/admin/dashboard-check');
        $response1->assertStatus(200)->assertJson(['success' => true]);

        $response2 = $this->actingAs($superAdmin, 'sanctum')->getJson('/api/v1/admin/users-manage-check');
        $response2->assertStatus(200)->assertJson(['success' => true]);
    }

    public function test_admin_can_access_dashboard_but_not_users_manage(): void
    {
        $admin = User::factory()->create([
            'role' => UserRole::Admin,
            'is_active' => true,
        ]);

        $response1 = $this->actingAs($admin, 'sanctum')->getJson('/api/v1/admin/dashboard-check');
        $response1->assertStatus(200)->assertJson(['success' => true]);

        // Admin does not have users.manage permission
        $response2 = $this->actingAs($admin, 'sanctum')->getJson('/api/v1/admin/users-manage-check');
        $response2->assertStatus(403);
    }

    public function test_editor_is_forbidden_from_admin_dashboard(): void
    {
        $editor = User::factory()->create([
            'role' => UserRole::Editor,
            'is_active' => true,
        ]);

        $response = $this->actingAs($editor, 'sanctum')->getJson('/api/v1/admin/dashboard-check');
        $response->assertStatus(403);
    }

    public function test_inactive_user_is_forbidden_even_if_admin(): void
    {
        $inactiveAdmin = User::factory()->create([
            'role' => UserRole::SuperAdmin,
            'is_active' => false,
        ]);

        $response = $this->actingAs($inactiveAdmin, 'sanctum')->getJson('/api/v1/admin/dashboard-check');
        $response->assertStatus(403);
    }
}
