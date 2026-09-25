<?php

namespace Tests\Feature\Auth;

use App\Enums\QuoteStatus;
use App\Enums\UserRole;
use App\Models\QuoteRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AccessArchitectureTest extends TestCase
{
    use RefreshDatabase;

    /**
     * SCÉNARIO 1 : VISITEUR (NON AUTHENTIFIÉ)
     */
    public function test_visitor_can_access_public_catalogs_but_is_blocked_from_private_and_admin_apis(): void
    {
        // 1. Public catalog access is allowed
        $this->getJson('/api/v1/services')->assertStatus(200);
        $this->getJson('/api/v1/projects')->assertStatus(200);
        $this->getJson('/api/v1/categories')->assertStatus(200);
        $this->getJson('/api/v1/articles')->assertStatus(200);

        // 2. Private User Space APIs are rejected with 401
        $this->getJson('/api/v1/user/profile')->assertStatus(401);
        $this->getJson('/api/v1/user/quotes')->assertStatus(401);
        $this->getJson('/api/v1/user/messages')->assertStatus(401);

        // 3. Admin Backoffice APIs are rejected with 401
        $this->getJson('/api/v1/admin/dashboard-stats')->assertStatus(401);
        $this->getJson('/api/v1/admin/quotes')->assertStatus(401);
        $this->getJson('/api/v1/admin/contact-messages')->assertStatus(401);
        $this->getJson('/api/v1/admin/users')->assertStatus(401);
    }

    /**
     * SCÉNARIO 2 : UTILISATEUR STANDARD (ROLE = USER)
     */
    public function test_standard_user_can_access_own_space_but_is_strictly_forbidden_from_admin_apis(): void
    {
        $userA = User::factory()->create([
            'role' => UserRole::User,
            'is_active' => true,
        ]);

        $userB = User::factory()->create([
            'role' => UserRole::User,
            'is_active' => true,
        ]);

        // Quote belonging to User A
        $quoteA = QuoteRequest::create([
            'user_id' => $userA->id,
            'reference' => 'DEV-2026-00001',
            'full_name' => $userA->name,
            'email' => $userA->email,
            'phone' => '+225 0700000001',
            'city' => 'Abidjan',
            'details' => 'Projet forage pour User A',
            'status' => QuoteStatus::Pending,
        ]);

        // Quote belonging to User B
        $quoteB = QuoteRequest::create([
            'user_id' => $userB->id,
            'reference' => 'DEV-2026-00002',
            'full_name' => $userB->name,
            'email' => $userB->email,
            'phone' => '+225 0700000002',
            'city' => 'Bouaké',
            'details' => 'Projet solaire pour User B',
            'status' => QuoteStatus::Pending,
        ]);

        // User A accesses their own profile -> 200 OK
        $this->actingAs($userA, 'sanctum')
            ->getJson('/api/v1/user/profile')
            ->assertStatus(200)
            ->assertJsonPath('data.id', $userA->id);

        // User A lists their own quotes -> sees quoteA, does NOT see quoteB
        $response = $this->actingAs($userA, 'sanctum')
            ->getJson('/api/v1/user/quotes')
            ->assertStatus(200);

        $this->assertCount(1, $response->json('data'));
        $this->assertEquals('DEV-2026-00001', $response->json('data.0.reference'));

        // User A tries to access Quote B directly -> 403 Forbidden
        $this->actingAs($userA, 'sanctum')
            ->getJson("/api/v1/user/quotes/{$quoteB->id}")
            ->assertStatus(403);

        // User A attempts to call Admin APIs -> 403 Forbidden
        $this->actingAs($userA, 'sanctum')
            ->getJson('/api/v1/admin/dashboard-stats')
            ->assertStatus(403);

        $this->actingAs($userA, 'sanctum')
            ->getJson('/api/v1/admin/quotes')
            ->assertStatus(403);

        $this->actingAs($userA, 'sanctum')
            ->getJson('/api/v1/admin/contact-messages')
            ->assertStatus(403);

        $this->actingAs($userA, 'sanctum')
            ->getJson('/api/v1/admin/users')
            ->assertStatus(403);
    }

    /**
     * SCÉNARIO 3 : ADMINISTRATEUR (ROLE = ADMIN / SUPER_ADMIN)
     */
    public function test_administrator_can_access_admin_backoffice(): void
    {
        $admin = User::factory()->create([
            'role' => UserRole::Admin,
            'is_active' => true,
        ]);

        $superAdmin = User::factory()->create([
            'role' => UserRole::SuperAdmin,
            'is_active' => true,
        ]);

        // Admin can access backoffice stats and quotes
        $this->actingAs($admin, 'sanctum')
            ->getJson('/api/v1/admin/dashboard-stats')
            ->assertStatus(200);

        $this->actingAs($admin, 'sanctum')
            ->getJson('/api/v1/admin/quotes')
            ->assertStatus(200);

        // SuperAdmin can access user management
        $this->actingAs($superAdmin, 'sanctum')
            ->getJson('/api/v1/admin/users')
            ->assertStatus(200);
    }

    /**
     * SCÉNARIO 4 : PROTECTION CONTRE L'ESCALADE DE PRIVILÈGES
     */
    public function test_privilege_escalation_attacks_are_strictly_prevented(): void
    {
        // 1. Attack 1: Sending role: super_admin or role: admin in public registration
        $regResponse = $this->postJson('/api/v1/auth/register', [
            'name' => 'Hacker Account',
            'email' => 'hacker@test.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'role' => 'super_admin',
            'is_admin' => true,
            'permissions' => ['*'],
        ]);

        $regResponse->assertStatus(201);
        $createdUser = User::where('email', 'hacker@test.com')->first();
        // Role MUST strictly be 'user'
        $this->assertEquals(UserRole::User, $createdUser->role);

        // 2. Attack 2: Trying to escalate role through profile update
        $updateResponse = $this->actingAs($createdUser, 'sanctum')
            ->putJson('/api/v1/user/profile', [
                'name' => 'Hacker Renamed',
                'email' => 'hacker@test.com',
                'role' => 'admin',
                'is_admin' => true,
            ]);

        $updateResponse->assertStatus(200);
        $this->assertEquals(UserRole::User, $createdUser->fresh()->role);

        // 3. Attack 3: Spoofing user_id in user quote submission
        $victim = User::factory()->create(['role' => UserRole::User]);
        $category = \App\Models\Category::factory()->create();
        $quoteResponse = $this->actingAs($createdUser, 'sanctum')
            ->postJson('/api/v1/user/quotes', [
                'user_id' => $victim->id,
                'full_name' => 'Spoofed Name',
                'email' => $victim->email,
                'phone' => '+225 0102030405',
                'city' => 'Abidjan',
                'category_id' => $category->id,
                'details' => 'Tentative de création au nom de la victime',
            ]);

        $quoteResponse->assertStatus(201);
        $newQuote = QuoteRequest::where('details', 'Tentative de création au nom de la victime')->first();
        // Server enforced quote user_id and email to the authenticated user
        $this->assertEquals($createdUser->id, $newQuote->user_id);
        $this->assertEquals($createdUser->email, $newQuote->email);
    }
}
