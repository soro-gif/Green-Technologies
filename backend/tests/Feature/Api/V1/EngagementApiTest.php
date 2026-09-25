<?php

namespace Tests\Feature\Api\V1;

use App\Enums\QuoteStatus;
use App\Models\Category;
use App\Models\QuoteRequest;
use App\Models\Service;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EngagementApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_submit_quote_request_with_sequential_reference(): void
    {
        $category = Category::factory()->create();
        $service = Service::factory()->create(['category_id' => $category->id]);

        $payload = [
            'category_id' => $category->id,
            'service_id' => $service->id,
            'full_name' => 'Kouassi Michel',
            'company' => 'Société Agricole du Centre',
            'email' => 'michel.kouassi@example.ci',
            'phone' => '+225 0707070707',
            'city' => 'Bouaké',
            'service_type' => 'Installation solaire pour ferme agricole',
            'estimated_budget' => 15000000,
            'details' => 'Projet d\'installation de panneaux photovoltaïques et pompage pour 50 hectares.',
        ];

        $response = $this->postJson('/api/v1/quotes', $payload);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'data' => [
                    'full_name' => 'Kouassi Michel',
                    'city' => 'Bouaké',
                    'status' => 'pending',
                ],
            ]);

        $this->assertDatabaseHas('quote_requests', [
            'email' => 'michel.kouassi@example.ci',
            'city' => 'Bouaké',
            'status' => QuoteStatus::Pending->value,
        ]);

        $created = QuoteRequest::first();
        $this->assertNotNull($created);
        $this->assertMatchesRegularExpression('/DEV-\d{4}-\d{5}/', $created->reference);

        // Test tracking endpoint
        $trackResponse = $this->getJson('/api/v1/quotes/track/' . $created->reference);
        $trackResponse->assertStatus(200)
            ->assertJsonPath('data.reference', $created->reference);
    }

    public function test_cannot_submit_quote_with_invalid_data(): void
    {
        $response = $this->postJson('/api/v1/quotes', [
            'full_name' => 'A', // too short
            'email' => 'invalid-email',
            'phone' => '',
            'details' => 'short',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email', 'phone', 'city']);
    }

    public function test_can_submit_contact_message(): void
    {
        $payload = [
            'full_name' => 'Awa Traoré',
            'email' => 'awa.traore@example.ci',
            'phone' => '+225 0505050505',
            'subject' => 'Demande d\'information BTP',
            'message' => 'Bonjour, j\'aimerais obtenir des informations concernant vos prestations en génie civil.',
        ];

        $response = $this->postJson('/api/v1/contact', $payload);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'data' => [
                    'full_name' => 'Awa Traoré',
                    'status' => 'unread',
                ],
            ]);

        $this->assertDatabaseHas('contact_messages', [
            'email' => 'awa.traore@example.ci',
            'subject' => 'Demande d\'information BTP',
        ]);
    }
}
