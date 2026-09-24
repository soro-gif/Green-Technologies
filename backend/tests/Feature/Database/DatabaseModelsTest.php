<?php

namespace Tests\Feature\Database;

use App\Enums\ProjectStatus;
use App\Enums\QuoteStatus;
use App\Models\Category;
use App\Models\Project;
use App\Models\QuoteRequest;
use App\Models\Service;
use App\Models\Testimonial;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DatabaseModelsTest extends TestCase
{
    use RefreshDatabase;

    public function test_category_has_many_services_and_projects(): void
    {
        $category = Category::factory()->create(['name' => 'Énergie Solaire']);
        $service = Service::factory()->create(['category_id' => $category->id]);
        $project = Project::factory()->create([
            'category_id' => $category->id,
            'service_id' => $service->id,
        ]);

        $this->assertCount(1, $category->services);
        $this->assertCount(1, $category->projects);
        $this->assertEquals('Énergie Solaire', $project->category->name);
        $this->assertEquals($service->id, $project->service->id);
    }

    public function test_project_has_many_testimonials(): void
    {
        $project = Project::factory()->create();
        $testimonial = Testimonial::factory()->create(['project_id' => $project->id]);

        $this->assertCount(1, $project->testimonials);
        $this->assertEquals($project->id, $testimonial->project->id);
    }

    public function test_quote_request_supports_status_casting(): void
    {
        $quote = QuoteRequest::factory()->create([
            'status' => QuoteStatus::Pending,
            'estimated_budget' => 15000000.50,
        ]);

        $this->assertInstanceOf(QuoteStatus::class, $quote->status);
        $this->assertEquals(QuoteStatus::Pending, $quote->status);
        $this->assertEquals('15000000.50', (string) $quote->estimated_budget);
    }

    public function test_slug_uniqueness_is_enforced(): void
    {
        Category::factory()->create(['slug' => 'eau-potable']);

        $this->expectException(\Illuminate\Database\QueryException::class);
        Category::factory()->create(['slug' => 'eau-potable']);
    }

    public function test_project_soft_deletes_works(): void
    {
        $project = Project::factory()->create(['status' => ProjectStatus::Published]);
        $project->delete();

        $this->assertSoftDeleted('projects', ['id' => $project->id]);
        $this->assertCount(0, Project::all());
        $this->assertCount(1, Project::withTrashed()->get());
    }
}
