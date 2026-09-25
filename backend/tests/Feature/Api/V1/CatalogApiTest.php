<?php

namespace Tests\Feature\Api\V1;

use App\Enums\ArticleStatus;
use App\Enums\ProjectStatus;
use App\Models\Article;
use App\Models\Category;
use App\Models\Project;
use App\Models\Service;
use App\Models\Testimonial;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CatalogApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_list_active_categories(): void
    {
        Category::factory()->count(3)->create(['is_active' => true]);
        Category::factory()->create(['is_active' => false]);

        $response = $this->getJson('/api/v1/categories');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ])
            ->assertJsonCount(3, 'data');
    }

    public function test_can_show_category_by_slug(): void
    {
        $category = Category::factory()->create(['slug' => 'energie-solaire', 'name' => 'Énergie Solaire']);

        $response = $this->getJson('/api/v1/categories/energie-solaire');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'slug' => 'energie-solaire',
                    'name' => 'Énergie Solaire',
                ],
            ]);
    }

    public function test_can_list_paginated_services_with_filters(): void
    {
        $cat1 = Category::factory()->create();
        $cat2 = Category::factory()->create();

        Service::factory()->create(['category_id' => $cat1->id, 'title' => 'Pompage Solaire', 'is_active' => true]);
        Service::factory()->create(['category_id' => $cat2->id, 'title' => 'Forage Hydraulique', 'is_active' => true]);

        $response = $this->getJson('/api/v1/services?category_id=' . $cat1->id);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ])
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.title', 'Pompage Solaire');
    }

    public function test_can_list_projects_with_status_and_search(): void
    {
        $category = Category::factory()->create();
        $service = Service::factory()->create(['category_id' => $category->id]);

        Project::factory()->create([
            'category_id' => $category->id,
            'service_id' => $service->id,
            'title' => 'Centrale Solaire Korhogo',
            'location' => 'Korhogo',
            'status' => ProjectStatus::Published,
        ]);

        Project::factory()->create([
            'category_id' => $category->id,
            'service_id' => $service->id,
            'title' => 'Château d\'eau Bouaké',
            'location' => 'Bouaké',
            'status' => ProjectStatus::Draft,
        ]);

        $response = $this->getJson('/api/v1/projects?search=Korhogo');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.title', 'Centrale Solaire Korhogo');
    }

    public function test_can_list_published_articles_only(): void
    {
        $user = User::factory()->create();
        $category = Category::factory()->create();

        Article::factory()->create([
            'user_id' => $user->id,
            'category_id' => $category->id,
            'title' => 'Article Publié',
            'status' => ArticleStatus::Published,
            'published_at' => now()->subDay(),
        ]);

        Article::factory()->create([
            'user_id' => $user->id,
            'category_id' => $category->id,
            'title' => 'Article Brouillon',
            'status' => ArticleStatus::Draft,
            'published_at' => null,
        ]);

        $response = $this->getJson('/api/v1/articles');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.title', 'Article Publié');
    }

    public function test_can_list_published_testimonials(): void
    {
        Testimonial::factory()->create(['is_published' => true, 'author_name' => 'Kouamé Jean']);
        Testimonial::factory()->create(['is_published' => false, 'author_name' => 'Non publié']);

        $response = $this->getJson('/api/v1/testimonials');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.author_name', 'Kouamé Jean');
    }
}
