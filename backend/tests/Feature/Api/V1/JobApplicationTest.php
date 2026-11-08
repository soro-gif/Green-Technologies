<?php

namespace Tests\Feature\Api\V1;

use App\Enums\ApplicationStatus;
use App\Enums\UserRole;
use App\Models\JobApplication;
use App\Models\JobApplicationNote;
use App\Models\User;
use App\Notifications\NewJobApplication;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Notification;
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

        // La note saisie à l'ajout ouvre le journal
        $response->assertJsonPath('data.internal_notes.0.body', 'Reçue en main propre au salon de l\'emploi.');
    }

    public function test_admin_updates_status_then_deletes(): void
    {
        Storage::fake('public');
        $application = JobApplication::create(['full_name' => 'Yao Koffi', 'email' => 'y@x.ci', 'phone' => '02', 'position' => 'Foreur', 'status' => 'new']);
        $this->actingAsAdmin();

        $this->patchJson("/api/v1/admin/job-applications/{$application->id}", [
            'status' => 'interview',
        ])->assertOk()->assertJsonPath('data.status', 'interview');

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

    // ---------------------------------------------------------------- Notification e-mail

    public function test_public_application_notifies_configured_recipients(): void
    {
        $this->fakeCloudinary();
        Notification::fake();
        config(['services.recruitment.notify' => ['rh@greentechnologies.ci', 'direction@greentechnologies.ci']]);

        $this->post('/api/v1/job-applications', $this->payload(), ['Accept' => 'application/json'])
            ->assertStatus(201);

        Notification::assertSentOnDemand(
            NewJobApplication::class,
            function (NewJobApplication $n, array $channels, object $notifiable) {
                $mail = $n->toMail($notifiable);

                return $notifiable->routes['mail'] === ['rh@greentechnologies.ci', 'direction@greentechnologies.ci']
                    && str_contains($mail->subject, 'Technicien de forage')
                    && str_ends_with($mail->actionUrl, '?id=' . JobApplication::sole()->id);
            }
        );
    }

    public function test_public_application_falls_back_to_active_admins(): void
    {
        $this->fakeCloudinary();
        Notification::fake();
        config(['services.recruitment.notify' => []]);
        $admin = User::factory()->create(['role' => UserRole::Admin, 'is_active' => true]);
        $inactive = User::factory()->create(['role' => UserRole::SuperAdmin, 'is_active' => false]);
        $client = User::factory()->create(['role' => UserRole::User, 'is_active' => true]);

        $this->post('/api/v1/job-applications', $this->payload(), ['Accept' => 'application/json'])
            ->assertStatus(201);

        Notification::assertSentTo($admin, NewJobApplication::class);
        Notification::assertNotSentTo([$inactive, $client], NewJobApplication::class);
    }

    public function test_mail_failure_does_not_lose_the_application(): void
    {
        $this->fakeCloudinary();
        config(['services.recruitment.notify' => ['rh@greentechnologies.ci']]);
        Notification::shouldReceive('route')->andThrow(new \RuntimeException('SMTP indisponible'));

        $this->post('/api/v1/job-applications', $this->payload(), ['Accept' => 'application/json'])
            ->assertStatus(201);

        $this->assertSame(1, JobApplication::count());
    }

    // ---------------------------------------------------------------- Journal de notes

    public function test_admin_adds_and_lists_notes_with_author(): void
    {
        $application = JobApplication::create(['full_name' => 'Yao Koffi', 'email' => 'y@x.ci', 'phone' => '02', 'position' => 'Foreur', 'status' => 'new']);
        $admin = $this->actingAsAdmin();

        $this->postJson("/api/v1/admin/job-applications/{$application->id}/notes", ['body' => 'Appelé, rappelle lundi.'])
            ->assertStatus(201)
            ->assertJsonPath('data.body', 'Appelé, rappelle lundi.')
            ->assertJsonPath('data.author', $admin->name)
            ->assertJsonPath('data.can_delete', true);
        $this->postJson("/api/v1/admin/job-applications/{$application->id}/notes", ['body' => 'Entretien fixé au 12.'])
            ->assertStatus(201);

        $this->postJson("/api/v1/admin/job-applications/{$application->id}/notes", ['body' => '  '])
            ->assertStatus(422)->assertJsonValidationErrors(['body']);

        // La fiche renvoie le journal, de la plus récente à la plus ancienne
        $this->getJson("/api/v1/admin/job-applications/{$application->id}")
            ->assertOk()
            ->assertJsonCount(2, 'data.internal_notes')
            ->assertJsonPath('data.internal_notes.0.body', 'Entretien fixé au 12.');
    }

    public function test_only_the_author_or_a_super_admin_deletes_a_note(): void
    {
        $application = JobApplication::create(['full_name' => 'Yao Koffi', 'email' => 'y@x.ci', 'phone' => '02', 'position' => 'Foreur', 'status' => 'new']);
        $author = User::factory()->create(['role' => UserRole::Admin, 'is_active' => true]);
        $note = $application->internalNotes()->create(['user_id' => $author->id, 'body' => 'Avis favorable.']);
        $other = $application->internalNotes()->create(['user_id' => $author->id, 'body' => 'À relancer.']);

        $this->actingAsAdmin(UserRole::Admin);
        $this->deleteJson("/api/v1/admin/job-applications/{$application->id}/notes/{$note->id}")->assertStatus(403);

        Sanctum::actingAs($author);
        $this->deleteJson("/api/v1/admin/job-applications/{$application->id}/notes/{$note->id}")->assertOk();

        $this->actingAsAdmin(UserRole::SuperAdmin);
        $this->deleteJson("/api/v1/admin/job-applications/{$application->id}/notes/{$other->id}")->assertOk();

        $this->assertSame(0, JobApplicationNote::count());
    }

    public function test_a_note_cannot_be_deleted_through_another_application(): void
    {
        $a = JobApplication::create(['full_name' => 'A', 'email' => 'a@x.ci', 'phone' => '01', 'position' => 'P', 'status' => 'new']);
        $b = JobApplication::create(['full_name' => 'B', 'email' => 'b@x.ci', 'phone' => '02', 'position' => 'P', 'status' => 'new']);
        $note = $a->internalNotes()->create(['user_id' => null, 'body' => 'Note de A']);
        $this->actingAsAdmin(UserRole::SuperAdmin);

        $this->deleteJson("/api/v1/admin/job-applications/{$b->id}/notes/{$note->id}")->assertStatus(404);
        $this->assertSame(1, JobApplicationNote::count());
    }

    // ---------------------------------------------------------------- Export CSV

    public function test_admin_exports_filtered_applications_as_csv(): void
    {
        $hired = JobApplication::create(['full_name' => 'Awa Traoré', 'email' => 'a@x.ci', 'phone' => '+225 01', 'position' => 'Comptable', 'status' => 'hired', 'experience' => '3-5']);
        JobApplication::create(['full_name' => 'Yao Koffi', 'email' => 'y@x.ci', 'phone' => '02', 'position' => 'Foreur', 'status' => 'new']);
        $admin = $this->actingAsAdmin();
        $hired->internalNotes()->create(['user_id' => $admin->id, 'body' => 'Embauchée le 3.']);

        $response = $this->get('/api/v1/admin/job-applications/export?status=hired');

        $response->assertOk();
        $this->assertStringContainsString('text/csv', $response->headers->get('Content-Type'));
        $this->assertStringContainsString('candidatures_', $response->headers->get('Content-Disposition'));

        $csv = $response->streamedContent();
        $this->assertStringStartsWith("\xEF\xBB\xBF", $csv);
        $lines = array_values(array_filter(explode("\n", str_replace("\r", '', $csv))));
        $this->assertSame('Nom et prénoms', str_getcsv($lines[0], ';')[2]);
        $this->assertStringContainsString('Awa Traoré', $csv);
        $this->assertStringContainsString('Retenue', $csv);
        $this->assertStringContainsString('3 à 5 ans', $csv);
        $this->assertStringContainsString('Embauchée le 3.', $csv);
        $this->assertStringNotContainsString('Yao Koffi', $csv);
    }

    public function test_csv_export_neutralises_spreadsheet_formulas(): void
    {
        JobApplication::create(['full_name' => '=HYPERLINK("http://evil","clic")', 'email' => 'e@x.ci', 'phone' => '03', 'position' => '@SUM(A1)', 'status' => 'new']);
        $this->actingAsAdmin();

        $csv = $this->get('/api/v1/admin/job-applications/export')->assertOk()->streamedContent();

        $this->assertStringContainsString(";\"'=HYPERLINK(\"\"http://evil\"\",\"\"clic\"\")\";", $csv);
        $this->assertStringContainsString(";'@SUM(A1);", $csv);
    }

    public function test_clients_cannot_export_applications(): void
    {
        $this->actingAsAdmin(UserRole::User);
        $this->get('/api/v1/admin/job-applications/export', ['Accept' => 'application/json'])->assertStatus(403);
    }
}
