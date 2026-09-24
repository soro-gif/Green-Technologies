<?php

namespace Database\Factories;

use App\Enums\ProjectStatus;
use App\Models\Category;
use App\Models\Project;
use App\Models\Service;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Project>
 */
class ProjectFactory extends Factory
{
    protected $model = Project::class;

    public function definition(): array
    {
        $title = fake()->unique()->words(4, true);

        return [
            'category_id' => Category::factory(),
            'service_id' => Service::factory(),
            'title' => ucfirst($title),
            'slug' => Str::slug($title),
            'client_name' => fake()->company(),
            'location' => fake()->city(),
            'completion_date' => fake()->dateTimeBetween('-2 years', 'now')->format('Y-m-d'),
            'summary' => fake()->sentence(12),
            'description' => fake()->paragraphs(3, true),
            'image' => 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800',
            'gallery' => [
                'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800',
                'https://images.unsplash.com/photo-1497440001374-f26997328c1b?w=800',
            ],
            'highlights' => [
                'Capacité de production continue',
                'Zéro émission carbone',
                'Autonomie énergétique complète',
            ],
            'budget_indicative' => fake()->randomFloat(2, 5000000, 50000000),
            'status' => ProjectStatus::Published,
            'is_featured' => fake()->boolean(30),
            'display_order' => fake()->numberBetween(1, 10),
        ];
    }
}
