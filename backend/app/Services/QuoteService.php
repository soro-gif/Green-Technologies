<?php

namespace App\Services;

use App\Enums\QuoteStatus;
use App\Models\QuoteRequest;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class QuoteService
{
    /**
     * @param array<string, mixed> $filters
     * @return LengthAwarePaginator<QuoteRequest>
     */
    public function getPaginated(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = QuoteRequest::query()->with(['category', 'service']);

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('reference', 'like', "%{$search}%")
                  ->orWhere('full_name', 'like', "%{$search}%")
                  ->orWhere('company', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('city', 'like', "%{$search}%");
            });
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['category_id'])) {
            $query->where('category_id', (int) $filters['category_id']);
        }

        if (!empty($filters['service_id'])) {
            $query->where('service_id', (int) $filters['service_id']);
        }

        $sort = $filters['sort'] ?? 'created_at';
        $direction = strtolower($filters['direction'] ?? 'desc') === 'asc' ? 'asc' : 'desc';
        $allowedSorts = ['id', 'reference', 'created_at', 'status', 'estimated_budget'];

        if (in_array($sort, $allowedSorts, true)) {
            $query->orderBy($sort, $direction);
        }

        return $query->paginate(min(max($perPage, 1), 100));
    }

    public function findById(int $id): QuoteRequest
    {
        return QuoteRequest::with(['category', 'service'])->findOrFail($id);
    }

    public function findByReference(string $reference): QuoteRequest
    {
        return QuoteRequest::query()
            ->where('reference', $reference)
            ->with(['category', 'service'])
            ->firstOrFail();
    }

    /**
     * @param array<string, mixed> $data
     */
    public function create(array $data): QuoteRequest
    {
        return DB::transaction(function () use ($data) {
            $year = date('Y');
            
            // Generate atomic reference: DEV-YYYY-XXXXX
            $lastQuote = QuoteRequest::whereYear('created_at', $year)
                ->lockForUpdate()
                ->latest('id')
                ->first();

            $nextSequence = 1;
            if ($lastQuote && preg_match('/DEV-\d{4}-(\d+)/', $lastQuote->reference, $matches)) {
                $nextSequence = ((int) $matches[1]) + 1;
            } else {
                $count = QuoteRequest::whereYear('created_at', $year)->count();
                $nextSequence = $count + 1;
            }

            $data['reference'] = sprintf('DEV-%s-%05d', $year, $nextSequence);
            $data['status'] = $data['status'] ?? QuoteStatus::Pending;

            return QuoteRequest::create($data);
        });
    }

    /**
     * @param array<string, mixed> $data
     */
    public function updateStatus(QuoteRequest $quote, array $data): QuoteRequest
    {
        $quote->update($data);

        return $quote->fresh(['category', 'service']) ?? $quote;
    }

    public function delete(QuoteRequest $quote): bool
    {
        return (bool) $quote->delete();
    }

    /**
     * @return array<string, int>
     */
    public function getStats(): array
    {
        return [
            'total' => QuoteRequest::count(),
            'pending' => QuoteRequest::where('status', QuoteStatus::Pending)->count(),
            'in_review' => QuoteRequest::where('status', QuoteStatus::InReview)->count(),
            'quoted' => QuoteRequest::where('status', QuoteStatus::Quoted)->count(),
            'accepted' => QuoteRequest::where('status', QuoteStatus::Accepted)->count(),
            'rejected' => QuoteRequest::where('status', QuoteStatus::Rejected)->count(),
        ];
    }
}
