<?php

namespace Database\Factories;

use App\Models\Project;
use App\Models\Testimonial;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Testimonial>
 */
class TestimonialFactory extends Factory
{
    protected $model = Testimonial::class;

    public function definition(): array
    {
        return [
            'project_id' => Project::factory(),
            'author_name' => fake()->name(),
            'author_role' => fake()->jobTitle(),
            'company' => fake()->company(),
            'avatar' => null,
            'content' => fake()->paragraph(2),
            'rating' => fake()->numberBetween(4, 5),
            'is_featured' => fake()->boolean(40),
            'is_published' => true,
            'display_order' => fake()->numberBetween(1, 10),
        ];
    }
}
