<?php

namespace Tests\Feature\Api\V1;

use App\Enums\MessageStatus;
use App\Enums\QuoteStatus;
use App\Enums\UserRole;
use App\Models\ContactMessage;
use App\Models\QuoteRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminOperationsApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_update_quote_status_and_read_stats(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin, 'is_active' => true]);
        Sanctum::actingAs($admin);

        $quote = QuoteRequest::factory()->create([
            'status' => QuoteStatus::Pending,
        ]);

        $updateResponse = $this->patchJson("/api/v1/admin/quotes/{$quote->id}/status", [
            'status' => QuoteStatus::InReview->value,
            'admin_notes' => 'Dossier transmis au bureau d\'études techniques.',
        ]);

        $updateResponse->assertStatus(200)
            ->assertJsonPath('data.status', 'in_review');

        $statsResponse = $this->getJson('/api/v1/admin/quotes/stats');
        $statsResponse->assertStatus(200)
            ->assertJsonPath('data.in_review', 1)
            ->assertJsonPath('data.total', 1);
    }

    public function test_admin_can_update_contact_message_status_and_stats(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin, 'is_active' => true]);
        Sanctum::actingAs($admin);

        $msg = ContactMessage::factory()->create(['status' => MessageStatus::Unread]);

        $updateResponse = $this->patchJson("/api/v1/admin/contact-messages/{$msg->id}/status", [
            'status' => MessageStatus::Read->value,
        ]);

        $updateResponse->assertStatus(200)
            ->assertJsonPath('data.status', 'read');

        $statsResponse = $this->getJson('/api/v1/admin/contact-messages/stats');
        $statsResponse->assertStatus(200)
            ->assertJsonPath('data.read', 1);
    }

    public function test_super_admin_can_manage_users_with_protections(): void
    {
        $superAdmin = User::factory()->create(['role' => UserRole::SuperAdmin, 'is_active' => true]);
        Sanctum::actingAs($superAdmin);

        // Create new editor
        $createResponse = $this->postJson('/api/v1/admin/users', [
            'name' => 'Agent Technique',
            'email' => 'agent@greentechnologies.ci',
            'password' => 'SecurePass123!@#',
            'role' => UserRole::Editor->value,
            'is_active' => true,
        ]);

        $createResponse->assertStatus(201)
            ->assertJsonPath('data.email', 'agent@greentechnologies.ci');

        $newUser = User::where('email', 'agent@greentechnologies.ci')->first();
        $this->assertNotNull($newUser);

        // Cannot delete oneself
        $selfDeleteResponse = $this->deleteJson("/api/v1/admin/users/{$superAdmin->id}");
        $selfDeleteResponse->assertStatus(422);

        // Can delete another user
        $deleteResponse = $this->deleteJson("/api/v1/admin/users/{$newUser->id}");
        $deleteResponse->assertStatus(200);
        $this->assertDatabaseMissing('users', ['id' => $newUser->id]);
    }
}
