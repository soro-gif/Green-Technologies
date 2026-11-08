<?php

namespace Tests\Feature\Api\V1;

use App\Models\ContactMessage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
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

    public function test_application_is_stored_with_documents_on_cloudinary(): void
    {
        $this->fakeCloudinary();

        $this->post('/api/v1/job-applications', $this->payload(), ['Accept' => 'application/json'])
            ->assertStatus(201);

        $message = ContactMessage::sole();
        $this->assertSame('Candidature – Technicien de forage', $message->subject);
        $this->assertSame('07 15 25 89 89', $message->phone);
        $this->assertStringContainsString('Expérience : 3 à 5 ans', $message->message);
        $this->assertStringContainsString('Ville : Abidjan', $message->message);
        $this->assertStringContainsString('CV : https://res.cloudinary.com/demo-cloud/raw/upload/', $message->message);
        $this->assertStringContainsString('Lettre de motivation : https://res.cloudinary.com/', $message->message);
        $this->assertStringContainsString('Consentement à la conservation des données : oui', $message->message);

        Http::assertSentCount(2);
        Http::assertSent(fn (Request $r) => str_contains($r->url(), '/v1_1/demo-cloud/raw/upload'));
    }

    public function test_required_fields_and_consent_are_enforced(): void
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

        $this->assertSame(0, ContactMessage::count());
        Http::assertNothingSent();
    }

    public function test_rejects_non_document_and_oversized_files(): void
    {
        $this->fakeCloudinary();

        $this->post('/api/v1/job-applications', $this->payload([
            'cv' => UploadedFile::fake()->create('cv.exe', 10, 'application/octet-stream'),
            'cover_letter' => UploadedFile::fake()->create('lettre.pdf', 6000, 'application/pdf'),
        ]), ['Accept' => 'application/json'])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['cv', 'cover_letter']);
    }

    public function test_cloudinary_failure_returns_503_without_saving(): void
    {
        config(['services.cloudinary.url' => 'cloudinary://123456:secret-abc@demo-cloud']);
        Http::fake(['api.cloudinary.com/*' => Http::response(['error' => ['message' => 'down']], 500)]);

        $this->post('/api/v1/job-applications', $this->payload(), ['Accept' => 'application/json'])
            ->assertStatus(503);

        $this->assertSame(0, ContactMessage::count());
    }
}
