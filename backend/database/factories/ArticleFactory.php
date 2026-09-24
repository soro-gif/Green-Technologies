<?php

namespace Database\Factories;

use App\Enums\ArticleStatus;
use App\Models\Article;
use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Article>
 */
class ArticleFactory extends Factory
{
    protected $model = Article::class;

    public function definition(): array
    {
        $title = fake()->unique()->sentence(6);

        return [
            'user_id' => User::factory(),
            'category_id' => Category::factory(),
            'title' => ucfirst($title),
            'slug' => Str::slug($title),
            'excerpt' => fake()->paragraph(),
            'content' => fake()->paragraphs(5, true),
            'cover_image' => 'https://images.unsplash.com/photo-1497440001374-f26997328c1b?w=800',
            'status' => ArticleStatus::Published,
            'published_at' => now(),
        ];
    }
}
