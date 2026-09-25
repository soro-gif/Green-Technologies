<?php

namespace App\Services;

use App\Models\Service;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Str;

class ServiceService
{
    /**
     * @param array<string, mixed> $filters
     * @return LengthAwarePaginator<Service>
     */
    public function getPaginated(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = Service::query()->with('category');

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('summary', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if (!empty($filters['category_id'])) {
            $query->where('category_id', (int) $filters['category_id']);
        }

        if (!empty($filters['category_slug'])) {
            $query->whereHas('category', fn ($q) => $q->where('slug', $filters['category_slug']));
        }

        if (isset($filters['is_active'])) {
            $query->where('is_active', filter_var($filters['is_active'], FILTER_VALIDATE_BOOLEAN));
        }

        $sort = $filters['sort'] ?? 'display_order';
        $direction = strtolower($filters['direction'] ?? 'asc') === 'desc' ? 'desc' : 'asc';
        $allowedSorts = ['id', 'title', 'display_order', 'created_at'];

        if (in_array($sort, $allowedSorts, true)) {
            $query->orderBy($sort, $direction);
        }

        return $query->paginate(min(max($perPage, 1), 100));
    }

    /**
     * @return Collection<int, Service>
     */
    public function getActive(): Collection
    {
        return Service::query()
            ->active()
            ->with('category')
            ->get();
    }

    /**
     * @return Collection<int, Service>
     */
    public function getFeatured(int $limit = 6): Collection
    {
        return Service::query()
            ->active()
            ->with('category')
            ->limit($limit)
            ->get();
    }

    public function findById(int $id): Service
    {
        return Service::with(['category', 'projects'])->findOrFail($id);
    }

    public function findBySlug(string $slug): Service
    {
        return Service::query()
            ->where('slug', $slug)
            ->with(['category', 'projects'])
            ->firstOrFail();
    }

    /**
     * @param array<string, mixed> $data
     */
    public function create(array $data): Service
    {
        if (empty($data['slug']) && !empty($data['title'])) {
            $data['slug'] = Str::slug($data['title']);
        }

        return Service::create($data);
    }

    /**
     * @param array<string, mixed> $data
     */
    public function update(Service $service, array $data): Service
    {
        if (isset($data['title']) && empty($data['slug'])) {
            $data['slug'] = Str::slug($data['title']);
        }

        $service->update($data);

        return $service->fresh(['category', 'projects']) ?? $service;
    }

    public function delete(Service $service): bool
    {
        return (bool) $service->delete();
    }
}
