<?php

namespace App\Services;

use App\Models\Testimonial;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class TestimonialService
{
    /**
     * @param array<string, mixed> $filters
     * @return LengthAwarePaginator<Testimonial>
     */
    public function getPaginated(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = Testimonial::query()->with('project');

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('author_name', 'like', "%{$search}%")
                  ->orWhere('company', 'like', "%{$search}%")
                  ->orWhere('content', 'like', "%{$search}%");
            });
        }

        if (isset($filters['is_published'])) {
            $query->where('is_published', filter_var($filters['is_published'], FILTER_VALIDATE_BOOLEAN));
        }

        if (isset($filters['is_featured'])) {
            $query->where('is_featured', filter_var($filters['is_featured'], FILTER_VALIDATE_BOOLEAN));
        }

        if (!empty($filters['rating'])) {
            $query->where('rating', (int) $filters['rating']);
        }

        $sort = $filters['sort'] ?? 'display_order';
        $direction = strtolower($filters['direction'] ?? 'asc') === 'desc' ? 'desc' : 'asc';
        $allowedSorts = ['id', 'display_order', 'rating', 'created_at'];

        if (in_array($sort, $allowedSorts, true)) {
            $query->orderBy($sort, $direction);
        }

        return $query->paginate(min(max($perPage, 1), 100));
    }

    /**
     * @return Collection<int, Testimonial>
     */
    public function getPublished(): Collection
    {
        return Testimonial::query()
            ->published()
            ->with('project')
            ->get();
    }

    /**
     * @return Collection<int, Testimonial>
     */
    public function getFeatured(): Collection
    {
        return Testimonial::query()
            ->featured()
            ->with('project')
            ->limit(6)
            ->get();
    }

    public function findById(int $id): Testimonial
    {
        return Testimonial::with('project')->findOrFail($id);
    }

    /**
     * @param array<string, mixed> $data
     */
    public function create(array $data): Testimonial
    {
        return Testimonial::create($data);
    }

    /**
     * @param array<string, mixed> $data
     */
    public function update(Testimonial $testimonial, array $data): Testimonial
    {
        $testimonial->update($data);

        return $testimonial->fresh('project') ?? $testimonial;
    }

    public function delete(Testimonial $testimonial): bool
    {
        return (bool) $testimonial->delete();
    }
}
