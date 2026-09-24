<?php

namespace Database\Factories;

use App\Enums\QuoteStatus;
use App\Models\Category;
use App\Models\QuoteRequest;
use App\Models\Service;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<QuoteRequest>
 */
class QuoteRequestFactory extends Factory
{
    protected $model = QuoteRequest::class;

    public function definition(): array
    {
        return [
            'reference' => 'DEV-' . strtoupper(Str::random(8)),
            'category_id' => Category::factory(),
            'service_id' => Service::factory(),
            'full_name' => fake()->name(),
            'company' => fake()->optional()->company(),
            'email' => fake()->safeEmail(),
            'phone' => fake()->phoneNumber(),
            'city' => fake()->city(),
            'service_type' => 'Installation Centrale Solaire',
            'estimated_budget' => fake()->randomFloat(2, 2000000, 20000000),
            'details' => fake()->paragraph(),
            'status' => QuoteStatus::Pending,
            'admin_notes' => null,
            'contacted_at' => null,
        ];
    }
}
