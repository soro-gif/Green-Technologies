<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;
use Tests\TestCase;

class AdminBootstrapSecurityTest extends TestCase
{
    use RefreshDatabase;

    public function test_setup_admin_endpoint_no_longer_exists(): void
    {
        $this->getJson('/api/v1/setup-admin')->assertNotFound();

        $response = $this->postJson('/api/v1/setup-admin', [
            'email' => 'attacker@example.com',
            'password' => 'attacker-password',
        ]);

        $this->assertContains($response->status(), [404, 405]);
        $this->assertDatabaseMissing('users', ['email' => 'attacker@example.com']);
    }

    public function test_health_endpoint_does_not_run_seeders(): void
    {
        $this->getJson('/api/v1/health')->assertOk();

        $this->assertSame(0, User::count());
    }

    public function test_health_endpoint_reports_only_a_database_status(): void
    {
        $this->getJson('/api/v1/health')
            ->assertOk()
            ->assertJsonPath('data.database', 'connected')
            ->assertJsonMissingPath('data.migration');
    }

    public function test_demo_accounts_are_not_seeded_in_production(): void
    {
        $this->app['env'] = 'production';

        Artisan::call('db:seed', ['--class' => DatabaseSeeder::class, '--force' => true]);

        $this->assertDatabaseCount('categories', 4);
        $this->assertSame(0, User::count());
    }

    public function test_demo_accounts_are_seeded_for_development(): void
    {
        $this->seed(DatabaseSeeder::class);

        $this->assertDatabaseHas('users', ['email' => 'admin@greentechnologies.ci']);
    }

    public function test_admin_command_refuses_a_short_password(): void
    {
        $this->artisan('admin:create', ['email' => 'admin@example.com', 'password' => 'password'])
            ->assertFailed();

        $this->assertDatabaseMissing('users', ['email' => 'admin@example.com']);
    }

    public function test_admin_command_creates_admin_without_printing_the_password(): void
    {
        $password = 'a-long-enough-test-value';

        $this->artisan('admin:create', ['email' => 'admin@example.com', 'password' => $password])
            ->doesntExpectOutputToContain($password)
            ->assertSuccessful();

        $this->assertDatabaseHas('users', ['email' => 'admin@example.com', 'role' => 'super_admin']);
    }
}
