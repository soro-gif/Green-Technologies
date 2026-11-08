<?php

namespace Tests\Feature\Api\V1;

use App\Enums\UserRole;
use App\Models\JobApplication;
use App\Models\JobOffer;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Notification;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class JobOfferTest extends TestCase
{
    use RefreshDatabase;

    private function offerData(array $overrides = []): array
    {
        return array_merge([
            'title' => 'Technicien de forage',
            'department' => 'Eau',
            'location' => 'Korhogo',
            'contract_type' => 'cdd',
            'summary' => 'Conduite de chantiers de forage dans le nord.',
            'description' => "Implantation des forages.\nSuivi des équipes.",
            'requirements' => 'BTS hydraulique, 3 ans d\'expérience.',
            'deadline' => now()->addMonth()->toDateString(),
            'is_published' => true,
        ], $overrides);
    }

    private function offer(array $overrides = []): JobOffer
    {
        return JobOffer::create($this->offerData($overrides));
    }

    private function actingAsAdmin(UserRole $role = UserRole::Admin): User
    {
        $user = User::factory()->create(['role' => $role, 'is_active' => true]);
        Sanctum::actingAs($user);

        return $user;
    }

    // ---------------------------------------------------------------- Administration

    public function test_admin_creates_a_published_offer(): void
    {
        $this->actingAsAdmin();

        $this->postJson('/api/v1/admin/job-offers', $this->offerData())
            ->assertStatus(201)
            ->assertJsonPath('message', 'Offre publiée sur le site.')
            ->assertJsonPath('data.slug', 'technicien-de-forage')
            ->assertJsonPath('data.contract_label', 'CDD')
            ->assertJsonPath('data.status', 'published')
            ->assertJsonPath('data.applications_count', 0);

        $this->assertNotNull(JobOffer::sole()->published_at);
    }

    public function test_admin_creates_a_draft_and_slugs_stay_unique(): void
    {
        $this->actingAsAdmin();

        $this->postJson('/api/v1/admin/job-offers', $this->offerData(['is_published' => false]))
            ->assertStatus(201)
            ->assertJsonPath('data.status', 'draft')
            ->assertJsonPath('message', 'Offre enregistrée en brouillon.');
        $this->postJson('/api/v1/admin/job-offers', $this->offerData())
            ->assertStatus(201)
            ->assertJsonPath('data.slug', 'technicien-de-forage-2');
    }

    public function test_offer_validation(): void
    {
        $this->actingAsAdmin();

        $this->postJson('/api/v1/admin/job-offers', $this->offerData([
            'title' => '',
            'contract_type' => 'esclavage',
            'summary' => str_repeat('a', 301),
            'deadline' => now()->subDay()->toDateString(),
        ]))
            ->assertStatus(422)
            ->assertJsonValidationErrors(['title', 'contract_type', 'summary', 'deadline']);
    }

    public function test_admin_lists_updates_unpublishes_and_deletes(): void
    {
        $offer = $this->offer();
        JobApplication::create(['full_name' => 'A', 'email' => 'a@x.ci', 'phone' => '01', 'position' => 'Foreur', 'status' => 'new', 'job_offer_id' => $offer->id]);
        $this->actingAsAdmin();

        $this->getJson('/api/v1/admin/job-offers')
            ->assertOk()
            ->assertJsonPath('data.0.applications_count', 1);

        $this->patchJson("/api/v1/admin/job-offers/{$offer->id}", ['is_published' => false])
            ->assertOk()
            ->assertJsonPath('data.status', 'draft')
            ->assertJsonPath('data.title', 'Technicien de forage');

        // Le slug ne change pas quand on renomme : les liens partagés restent valides
        $this->patchJson("/api/v1/admin/job-offers/{$offer->id}", ['title' => 'Chef foreur'])
            ->assertOk()->assertJsonPath('data.slug', 'technicien-de-forage');

        $this->deleteJson("/api/v1/admin/job-offers/{$offer->id}")->assertOk();
        $this->assertSame(0, JobOffer::count());

        // La candidature reste, sans lien vers l'offre supprimée
        $this->assertNull(JobApplication::sole()->job_offer_id);
    }

    public function test_an_expired_offer_keeps_its_past_deadline_on_update(): void
    {
        $offer = $this->offer();
        $offer->forceFill(['deadline' => now()->subWeek()])->save();
        $this->actingAsAdmin();

        $this->getJson('/api/v1/admin/job-offers')->assertJsonPath('data.0.status', 'expired');

        $this->patchJson("/api/v1/admin/job-offers/{$offer->id}", [
            'summary' => 'Résumé corrigé.',
            'deadline' => $offer->deadline->toDateString(),
        ])->assertOk();
    }

    public function test_clients_and_guests_cannot_manage_offers(): void
    {
        $this->postJson('/api/v1/admin/job-offers', $this->offerData())->assertStatus(401);

        $this->actingAsAdmin(UserRole::User);
        $this->postJson('/api/v1/admin/job-offers', $this->offerData())->assertStatus(403);
        $this->assertSame(0, JobOffer::count());
    }

    // ---------------------------------------------------------------- Site public

    public function test_public_sees_only_open_offers_without_admin_fields(): void
    {
        $this->offer(['title' => 'Ouverte']);
        $this->offer(['title' => 'Sans date limite', 'deadline' => null]);
        $this->offer(['title' => 'Brouillon', 'is_published' => false]);
        $this->offer(['title' => 'Expirée'])->forceFill(['deadline' => now()->subDay()])->save();

        $response = $this->getJson('/api/v1/job-offers')->assertOk()->assertJsonCount(2, 'data');

        $titles = collect($response->json('data'))->pluck('title')->all();
        $this->assertEqualsCanonicalizing(['Ouverte', 'Sans date limite'], $titles);
        $response->assertJsonMissingPath('data.0.is_published')->assertJsonMissingPath('data.0.applications_count');

        $this->getJson('/api/v1/job-offers/ouverte')->assertOk()->assertJsonPath('data.title', 'Ouverte');
        $this->getJson('/api/v1/job-offers/brouillon')->assertStatus(404);
        $this->getJson('/api/v1/job-offers/expiree')->assertStatus(404);
    }

    public function test_application_to_an_offer_is_linked_and_closed_offers_are_refused(): void
    {
        config(['services.cloudinary.url' => 'cloudinary://123456:secret-abc@demo-cloud']);
        Http::fake(['api.cloudinary.com/*' => Http::response(['secure_url' => 'https://res.cloudinary.com/demo/raw/upload/v1/cv.pdf'])]);
        Notification::fake();

        $open = $this->offer();
        $draft = $this->offer(['title' => 'Brouillon', 'is_published' => false]);

        $payload = fn (int $offerId) => [
            'full_name' => 'Yao Koffi',
            'email' => 'y@example.ci',
            'phone' => '07 00 00 00 00',
            'position' => 'Technicien de forage',
            'job_offer_id' => $offerId,
            'cv' => UploadedFile::fake()->create('cv.pdf', 100, 'application/pdf'),
            'consent' => '1',
        ];

        $this->post('/api/v1/job-applications', $payload($draft->id), ['Accept' => 'application/json'])
            ->assertStatus(422)->assertJsonValidationErrors(['job_offer_id']);

        $this->post('/api/v1/job-applications', $payload($open->id), ['Accept' => 'application/json'])
            ->assertStatus(201);
        $this->assertSame($open->id, JobApplication::sole()->job_offer_id);

        // L'admin retrouve l'offre sur la candidature et peut filtrer par offre
        $this->actingAsAdmin();
        $this->getJson("/api/v1/admin/job-applications?job_offer_id={$open->id}")
            ->assertOk()
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.job_offer_title', 'Technicien de forage');
        $this->getJson("/api/v1/admin/job-applications?job_offer_id={$draft->id}")
            ->assertOk()->assertJsonPath('meta.total', 0);
    }
}
