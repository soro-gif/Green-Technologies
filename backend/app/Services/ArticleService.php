<?php

namespace App\Services;

use App\Enums\ArticleStatus;
use App\Models\Article;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Str;

class ArticleService
{
    /**
     * @param array<string, mixed> $filters
     * @return LengthAwarePaginator<Article>
     */
    public function getPaginated(array $filters = [], int $perPage = 10, bool $onlyPublished = false): LengthAwarePaginator
    {
        $query = Article::query()->with(['author', 'category']);

        if ($onlyPublished) {
            $query->published();
        } elseif (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('excerpt', 'like', "%{$search}%")
                  ->orWhere('content', 'like', "%{$search}%");
            });
        }

        if (!empty($filters['category_id'])) {
            $query->where('category_id', (int) $filters['category_id']);
        }

        if (!empty($filters['category_slug'])) {
            $query->whereHas('category', fn ($q) => $q->where('slug', $filters['category_slug']));
        }

        if (!empty($filters['user_id'])) {
            $query->where('user_id', (int) $filters['user_id']);
        }

        $sort = $filters['sort'] ?? 'published_at';
        $direction = strtolower($filters['direction'] ?? 'desc') === 'asc' ? 'asc' : 'desc';
        $allowedSorts = ['id', 'title', 'published_at', 'created_at'];

        if (in_array($sort, $allowedSorts, true)) {
            $query->orderBy($sort, $direction);
        }

        return $query->paginate(min(max($perPage, 1), 100));
    }

    public function findById(int $id): Article
    {
        return Article::with(['author', 'category'])->findOrFail($id);
    }

    public function findPublishedBySlug(string $slug): Article
    {
        return Article::query()
            ->where('slug', $slug)
            ->published()
            ->with(['author', 'category'])
            ->firstOrFail();
    }

    public function findBySlug(string $slug): Article
    {
        return Article::query()
            ->where('slug', $slug)
            ->with(['author', 'category'])
            ->firstOrFail();
    }

    /**
     * @param array<string, mixed> $data
     */
    public function create(array $data, int $authorId): Article
    {
        if (empty($data['slug'])) {
            $data['slug'] = Str::slug($data['title']);
        }

        $data['user_id'] = $authorId;
        
        $status = is_string($data['status'] ?? null)
            ? ArticleStatus::tryFrom($data['status']) ?? ArticleStatus::Published
            : ($data['status'] ?? ArticleStatus::Published);

        $data['status'] = $status;

        if (($status === ArticleStatus::Published || $status === 'published') && empty($data['published_at'])) {
            $data['published_at'] = now();
        }

        return Article::create($data);
    }

    /**
     * @param array<string, mixed> $data
     */
    public function update(Article $article, array $data): Article
    {
        if (isset($data['title']) && empty($data['slug'])) {
            $data['slug'] = Str::slug($data['title']);
        }

        if (isset($data['status'])) {
            $status = is_string($data['status'])
                ? ArticleStatus::tryFrom($data['status']) ?? $data['status']
                : $data['status'];
            $data['status'] = $status;

            if (($status === ArticleStatus::Published || $status === 'published') && empty($article->published_at) && empty($data['published_at'])) {
                $data['published_at'] = now();
            }
        }

        $article->update($data);

        return $article->fresh(['author', 'category']) ?? $article;
    }

    public function delete(Article $article): bool
    {
        return (bool) $article->delete();
    }
}
