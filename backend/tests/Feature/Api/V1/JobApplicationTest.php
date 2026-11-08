<?php

namespace Tests\Feature\Api\V1;

use App\Enums\ApplicationStatus;
use App\Enums\UserRole;
use App\Models\JobApplication;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class JobApplicationTest extends TestCase
{
    use RefreshDatabase;

    private function payload(array $overrides = []): array
    {
        return array_merge([
            'full_name' => 'Yao Koffi',
            'email' => 'y.koffi@example.ci',
            'phone' => '07 15 25 89 89',
            'city' => 'Abidjan',
            'position' => 'Technicien de forage',
            'experience' => '3-5',
            'linkedin' => 'https://linkedin.com/in/yao-koffi',
            'cv' => UploadedFile::fake()->create('cv.pdf', 300, 'application/pdf'),
            'cover_letter' => UploadedFile::fake()->create('lettre.docx', 80, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'),
            'message' => 'Disponible immédiatement.',
            'consent' => '1',
        ], $overrides);
    }

    private function fakeCloudinary(): void
    {
        config(['services.cloudinary.url' => 'cloudinary://123456:secret-abc@demo-cloud']);
        $n = 0;
        Http::fake([
            'api.cloudinary.com/*' => function () use (&$n) {
                $n++;

                return Http::response(['secure_url' => "https://res.cloudinary.com/demo-cloud/raw/upload/v1/greentech/candidatures/doc{$n}.pdf"]);
            },
        ]);
    }

    private function actingAsAdmin(UserRole $role = UserRole::Admin): User
    {
        $user = User::factory()->create(['role' => $role, 'is_active' => true]);
        Sanctum::actingAs($user);

        return $user;
    }

    // ---------------------------------------------------------------- Site public

    public function test_public_application_is_stored_with_documents_on_cloudinary(): void
    {
        $this->fakeCloudinary();

        $this->post('/api/v1/job-applications', $this->payload(), ['Accept' => 'application/json'])
            ->assertStatus(201);

        $application = JobApplication::sole();
        $this->assertSame('Technicien de forage', $application->position);
        $this->assertSame(ApplicationStatus::New, $application->status);
        $this->assertSame('site', $application->source);
        $this->assertSame('3-5', $application->experience);
        $this->assertNotNull($application->consent_at);
        $this->assertStringStartsWith('https://res.cloudinary.com/demo-cloud/raw/upload/', $application->cv_url);
        $this->assertStringStartsWith('https://res.cloudinary.com/', $application->cover_letter_url);

        Http::assertSentCount(2);
        Http::assertSent(fn (Request $r) => str_contains($r->url(), '/v1_1/demo-cloud/raw/upload'));
    }

    public function test_public_required_fields_and_consent_are_enforced(): void
    {
        $this->fakeCloudinary();

        $this->post('/api/v1/job-applications', $this->payload([
            'phone' => '',
            'position' => '',
            'cv' => null,
            'consent' => null,
        ]), ['Accept' => 'application/json'])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['phone', 'position', 'cv', 'consent']);

        $this->assertSame(0, JobApplication::count());
        Http::assertNothingSent();
    }

    public function test_public_rejects_non_document_and_oversized_files(): void
    {
        $this->fakeCloudinary();

        $this->post('/api/v1/job-applications', $this->payload([
            'cv' => UploadedFile::fake()->create('cv.exe', 10, 'application/octet-stream'),
            'cover_letter' => UploadedFile::fake()->create('lettre.pdf', 6000, 'application/pdf'),
        ]), ['Accept' => 'application/json'])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['cv', 'cover_letter']);
    }

    public function test_public_cloudinary_failure_returns_503_without_saving(): void
    {
        config(['services.cloudinary.url' => 'cloudinary://123456:secret-abc@demo-cloud']);
        Http::fake(['api.cloudinary.com/*' => Http::response(['error' => ['message' => 'down']], 500)]);

        $this->post('/api/v1/job-applications', $this->payload(), ['Accept' => 'application/json'])
            ->assertStatus(503);

        $this->assertSame(0, JobApplication::count());
    }

    // ---------------------------------------------------------------- Administration

    public function test_guests_and_clients_cannot_access_admin_applications(): void
    {
        $this->getJson('/api/v1/admin/job-applications')->assertStatus(401);

        $this->actingAsAdmin(UserRole::User);
        $this->getJson('/api/v1/admin/job-applications')->assertStatus(403);
    }

    public function test_admin_lists_filters_and_searches_applications(): void
    {
        JobApplication::create(['full_name' => 'Awa Traoré', 'email' => 'a@x.ci', 'phone' => '01', 'position' => 'Comptable', 'status' => 'new']);
        JobApplication::create(['full_name' => 'Yao Koffi', 'email' => 'y@x.ci', 'phone' => '02', 'position' => 'Foreur', 'status' => 'interview']);
        $this->actingAsAdmin();

        $this->getJson('/api/v1/admin/job-applications')
            ->assertOk()
            ->assertJsonPath('meta.total', 2)
            ->assertJsonPath('data.0.full_name', 'Yao Koffi')
            ->assertJsonPath('data.0.status_label', 'Entretien');

        $this->getJson('/api/v1/admin/job-applications?status=new')
            ->assertOk()->assertJsonPath('meta.total', 1)->assertJsonPath('data.0.full_name', 'Awa Traoré');

        $this->getJson('/api/v1/admin/job-applications?search=foreur')
            ->assertOk()->assertJsonPath('meta.total', 1)->assertJsonPath('data.0.full_name', 'Yao Koffi');

        $this->getJson('/api/v1/admin/job-applications/stats')
            ->assertOk()
            ->assertJsonPath('data.total', 2)
            ->assertJsonPath('data.by_status.new', 1)
            ->assertJsonPath('data.by_status.interview', 1);
    }

    public function test_admin_adds_an_application_with_a_cv_file(): void
    {
        $this->fakeCloudinary();
        $this->actingAsAdmin();

        $response = $this->post('/api/v1/admin/job-applications', [
            'full_name' => 'Mariam Ouattara',
            'email' => 'm.ouattara@example.ci',
            'phone' => '05 44 33 22 11',
            'position' => 'Conductrice de travaux',
            'experience' => '5-10',
            'cv' => UploadedFile::fake()->create('cv.pdf', 200, 'application/pdf'),
            'notes' => 'Reçue en main propre au salon de l\'emploi.',
        ], ['Accept' => 'application/json']);

        $response->assertStatus(201)
            ->assertJsonPath('data.source', 'admin')
            ->assertJsonPath('data.status', 'new')
            ->assertJsonPath('data.experience_label', '5 à 10 ans');
        $this->assertStringStartsWith('https://res.cloudinary.com/', $response->json('data.cv_url'));
        $this->assertNull(JobApplication::sole()->consent_at);
    }

    public function test_admin_updates_status_and_notes_then_deletes(): void
    {
        Storage::fake('public');
        $application = JobApplication::create(['full_name' => 'Yao Koffi', 'email' => 'y@x.ci', 'phone' => '02', 'position' => 'Foreur', 'status' => 'new']);
        $this->actingAsAdmin();

        $this->patchJson("/api/v1/admin/job-applications/{$application->id}", [
            'status' => 'interview',
            'notes' => 'Entretien prévu lundi.',
        ])->assertOk()->assertJsonPath('data.status', 'interview')->assertJsonPath('data.notes', 'Entretien prévu lundi.');

        // Le site envoie les mises à jour en POST multipart : seuls les champs modifiés sont transmis
        $this->post("/api/v1/admin/job-applications/{$application->id}", [
            'status' => 'hired',
            'cv' => UploadedFile::fake()->create('cv.pdf', 50, 'application/pdf'),
        ], ['Accept' => 'application/json'])
            ->assertOk()
            ->assertJsonPath('data.status', 'hired')
            ->assertJsonPath('data.full_name', 'Yao Koffi');
        $this->assertNotNull($application->fresh()->cv_url);

        $this->patchJson("/api/v1/admin/job-applications/{$application->id}", ['status' => 'inconnu'])
            ->assertStatus(422)->assertJsonValidationErrors(['status']);

        $this->deleteJson("/api/v1/admin/job-applications/{$application->id}")->assertOk();
        $this->assertSame(0, JobApplication::count());
    }

    public function test_dashboard_reports_new_applications(): void
    {
        JobApplication::create(['full_name' => 'A', 'email' => 'a@x.ci', 'phone' => '01', 'position' => 'P', 'status' => 'new']);
        JobApplication::create(['full_name' => 'B', 'email' => 'b@x.ci', 'phone' => '02', 'position' => 'P', 'status' => 'hired']);
        $this->actingAsAdmin();

        $this->getJson('/api/v1/admin/dashboard-stats')
            ->assertOk()
            ->assertJsonPath('data.overview.applications_total', 2)
            ->assertJsonPath('data.overview.applications_new', 1)
            ->assertJsonPath('data.recent_applications.0.full_name', 'B');
    }
}
