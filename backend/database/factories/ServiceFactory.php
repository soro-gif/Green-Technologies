<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Service;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Service>
 */
class ServiceFactory extends Factory
{
    protected $model = Service::class;

    public function definition(): array
    {
        $title = fake()->unique()->words(3, true);

        return [
            'category_id' => Category::factory(),
            'title' => ucfirst($title),
            'slug' => Str::slug($title),
            'summary' => fake()->sentence(),
            'description' => fake()->paragraphs(2, true),
            'features' => [
                'Garantie décennale et normes OMS',
                'Maintenance préventive incluse',
                'Monitoring intelligent à distance',
            ],
            'icon' => 'activity',
            'image' => null,
            'display_order' => fake()->numberBetween(1, 10),
            'is_active' => true,
        ];
    }
}
