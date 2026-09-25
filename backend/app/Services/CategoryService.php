<?php

namespace App\Services;

use App\Models\Category;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Str;

class CategoryService
{
    /**
     * @param array<string, mixed> $filters
     * @return LengthAwarePaginator<Category>
     */
    public function getPaginated(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = Category::query()->withCount(['services', 'projects', 'articles']);

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if (isset($filters['is_active'])) {
            $query->where('is_active', filter_var($filters['is_active'], FILTER_VALIDATE_BOOLEAN));
        }

        $sort = $filters['sort'] ?? 'display_order';
        $direction = strtolower($filters['direction'] ?? 'asc') === 'desc' ? 'desc' : 'asc';
        $allowedSorts = ['id', 'name', 'display_order', 'created_at'];

        if (in_array($sort, $allowedSorts, true)) {
            $query->orderBy($sort, $direction);
        }

        return $query->paginate(min(max($perPage, 1), 100));
    }

    /**
     * @return Collection<int, Category>
     */
    public function getActive(): Collection
    {
        return Category::query()
            ->active()
            ->withCount(['services', 'projects'])
            ->get();
    }

    public function findById(int $id): Category
    {
        return Category::withCount(['services', 'projects', 'articles'])->findOrFail($id);
    }

    public function findBySlug(string $slug): Category
    {
        return Category::query()
            ->where('slug', $slug)
            ->with(['services' => fn ($q) => $q->where('is_active', true)->orderBy('display_order')])
            ->withCount(['services', 'projects', 'articles'])
            ->firstOrFail();
    }

    /**
     * @param array<string, mixed> $data
     */
    public function create(array $data): Category
    {
        if (empty($data['slug'])) {
            $data['slug'] = Str::slug($data['name']);
        }

        return Category::create($data);
    }

    /**
     * @param array<string, mixed> $data
     */
    public function update(Category $category, array $data): Category
    {
        if (isset($data['name']) && empty($data['slug'])) {
            $data['slug'] = Str::slug($data['name']);
        }

        $category->update($data);

        return $category->fresh(['services', 'projects']) ?? $category;
    }

    public function delete(Category $category): bool
    {
        return (bool) $category->delete();
    }
}
