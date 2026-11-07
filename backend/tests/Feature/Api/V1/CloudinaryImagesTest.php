<?php

namespace Tests\Feature\Api\V1;

use App\Enums\UserRole;
use App\Models\Project;
use App\Models\Service;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CloudinaryImagesTest extends TestCase
{
    use RefreshDatabase;

    private const DATA_URL = 'data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==';

    /** Vrai fichier WebP (l'extension GD n'est pas requise pour le générer). */
    private function webpUpload(): UploadedFile
    {
        $bytes = base64_decode(substr(self::DATA_URL, strlen('data:image/webp;base64,')));

        return UploadedFile::fake()->createWithContent('forage.webp', $bytes);
    }

    private function configureCloudinary(): void
    {
        config(['services.cloudinary.url' => 'cloudinary://123456:secret-abc@demo-cloud']);
    }

    private function fakeCloudinary(): void
    {
        $n = 0;
        Http::fake([
            'api.cloudinary.com/*' => function () use (&$n) {
                $n++;

                return Http::response(['secure_url' => "https://res.cloudinary.com/demo-cloud/image/upload/v1/greentech/img{$n}.webp"]);
            },
        ]);
    }

    public function test_upload_goes_to_cloudinary_with_a_valid_signature(): void
    {
        $this->configureCloudinary();
        $this->fakeCloudinary();
        Sanctum::actingAs(User::factory()->create(['role' => UserRole::Admin, 'is_active' => true]));

        $response = $this->post('/api/v1/admin/media/upload', [
            'image' => $this->webpUpload(),
            'folder' => 'projects',
        ], ['Accept' => 'application/json']);

        $response->assertStatus(201);
        $this->assertStringStartsWith('https://res.cloudinary.com/', $response->json('data.url'));

        Http::assertSent(function (Request $request) {
            $fields = collect($request->data())->pluck('contents', 'name');
            $expected = sha1("folder=greentech/projects&timestamp={$fields['timestamp']}secret-abc");

            return str_contains($request->url(), '/v1_1/demo-cloud/image/upload')
                && $fields['api_key'] === '123456'
                && $fields['signature'] === $expected;
        });
    }

    public function test_upload_fails_loudly_instead_of_using_the_ephemeral_disk(): void
    {
        $this->configureCloudinary();
        Http::fake(['api.cloudinary.com/*' => Http::response(['error' => ['message' => 'Invalid']], 401)]);
        Sanctum::actingAs(User::factory()->create(['role' => UserRole::Admin, 'is_active' => true]));

        $this->post('/api/v1/admin/media/upload', [
            'image' => $this->webpUpload(),
        ], ['Accept' => 'application/json'])->assertStatus(502);
    }

    public function test_command_moves_base64_images_to_cloudinary(): void
    {
        $this->configureCloudinary();
        $this->fakeCloudinary();

        $service = Service::factory()->create(['image' => self::DATA_URL]);
        $project = Project::factory()->create([
            'image' => '/forage.jpg',
            'gallery' => [self::DATA_URL, 'https://example.com/a.jpg'],
        ]);

        $this->artisan('images:migrate-to-cloudinary')->assertSuccessful()->run();

        $this->assertStringStartsWith('https://res.cloudinary.com/', $service->fresh()->image);
        $this->assertSame('/forage.jpg', $project->fresh()->image);
        $gallery = $project->fresh()->gallery;
        $this->assertStringStartsWith('https://res.cloudinary.com/', $gallery[0]);
        $this->assertSame('https://example.com/a.jpg', $gallery[1]);
        Http::assertSentCount(2);
    }

    public function test_dry_run_changes_nothing(): void
    {
        Http::fake();
        $service = Service::factory()->create(['image' => self::DATA_URL]);

        $this->artisan('images:migrate-to-cloudinary', ['--dry-run' => true])
            ->expectsOutputToContain('1 image(s) base64 trouvée(s)')
            ->assertSuccessful();

        $this->assertSame(self::DATA_URL, DB::table('services')->where('id', $service->id)->value('image'));
        Http::assertNothingSent();
    }
}
