<?php

namespace App\Services;

use App\Enums\ProjectStatus;
use App\Models\Project;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Str;

class ProjectService
{
    /**
     * @param array<string, mixed> $filters
     * @return LengthAwarePaginator<Project>
     */
    public function getPaginated(array $filters = [], int $perPage = 12): LengthAwarePaginator
    {
        $query = Project::query()->with(['category', 'service']);

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('client_name', 'like', "%{$search}%")
                  ->orWhere('location', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if (!empty($filters['category_id'])) {
            $query->where('category_id', (int) $filters['category_id']);
        }

        if (!empty($filters['category_slug'])) {
            $query->whereHas('category', fn ($q) => $q->where('slug', $filters['category_slug']));
        }

        if (!empty($filters['service_id'])) {
            $query->where('service_id', (int) $filters['service_id']);
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['location'])) {
            $query->where('location', 'like', "%{$filters['location']}%");
        }

        if (isset($filters['is_featured'])) {
            $query->where('is_featured', filter_var($filters['is_featured'], FILTER_VALIDATE_BOOLEAN));
        }

        $sort = $filters['sort'] ?? 'completion_date';
        $direction = strtolower($filters['direction'] ?? 'desc') === 'asc' ? 'asc' : 'desc';
        $allowedSorts = ['id', 'title', 'completion_date', 'budget', 'created_at'];

        if (in_array($sort, $allowedSorts, true)) {
            $query->orderBy($sort, $direction);
        }

        return $query->paginate(min(max($perPage, 1), 100));
    }

    /**
     * @return Collection<int, Project>
     */
    public function getFeatured(): Collection
    {
        return Project::query()
            ->featured()
            ->with(['category', 'service'])
            ->limit(6)
            ->get();
    }

    public function findById(int $id): Project
    {
        return Project::with(['category', 'service', 'testimonials'])->findOrFail($id);
    }

    public function findBySlug(string $slug): Project
    {
        return Project::query()
            ->where('slug', $slug)
            ->with(['category', 'service', 'testimonials' => fn ($q) => $q->where('is_published', true)])
            ->firstOrFail();
    }

    /**
     * @param array<string, mixed> $data
     */
    public function create(array $data): Project
    {
        if (empty($data['slug']) && !empty($data['title'])) {
            $baseSlug = Str::slug($data['title']);
            $slug = $baseSlug;
            $count = 1;
            while (Project::where('slug', $slug)->exists()) {
                $slug = "{$baseSlug}-{$count}";
                $count++;
            }
            $data['slug'] = $slug;
        }

        if (empty($data['summary'])) {
            $data['summary'] = Str::limit(strip_tags($data['description'] ?? $data['title']), 250);
        }

        if (empty($data['location'])) {
            $data['location'] = 'Côte d\'Ivoire';
        }

        return Project::create($data);
    }

    /**
     * @param array<string, mixed> $data
     */
    public function update(Project $project, array $data): Project
    {
        if (isset($data['title']) && empty($data['slug'])) {
            if ($data['title'] !== $project->title) {
                $baseSlug = Str::slug($data['title']);
                $slug = $baseSlug;
                $count = 1;
                while (Project::where('slug', $slug)->where('id', '!=', $project->id)->exists()) {
                    $slug = "{$baseSlug}-{$count}";
                    $count++;
                }
                $data['slug'] = $slug;
            } else {
                unset($data['slug']);
            }
        }

        if (isset($data['description']) && empty($data['summary'])) {
            $data['summary'] = Str::limit(strip_tags($data['description']), 250);
        }

        $project->update($data);

        return $project->fresh(['category', 'service', 'testimonials']) ?? $project;
    }

    public function delete(Project $project): bool
    {
        return (bool) $project->delete();
    }
}
