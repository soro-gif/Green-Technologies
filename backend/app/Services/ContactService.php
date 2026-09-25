<?php

namespace App\Services;

use App\Enums\MessageStatus;
use App\Models\ContactMessage;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ContactService
{
    /**
     * @param array<string, mixed> $filters
     * @return LengthAwarePaginator<ContactMessage>
     */
    public function getPaginated(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = ContactMessage::query();

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('full_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('subject', 'like', "%{$search}%")
                  ->orWhere('message', 'like', "%{$search}%");
            });
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        $sort = $filters['sort'] ?? 'created_at';
        $direction = strtolower($filters['direction'] ?? 'desc') === 'asc' ? 'asc' : 'desc';
        $allowedSorts = ['id', 'full_name', 'created_at', 'status'];

        if (in_array($sort, $allowedSorts, true)) {
            $query->orderBy($sort, $direction);
        }

        return $query->paginate(min(max($perPage, 1), 100));
    }

    public function findById(int $id): ContactMessage
    {
        return ContactMessage::findOrFail($id);
    }

    /**
     * @param array<string, mixed> $data
     */
    public function create(array $data, ?string $ipAddress = null): ContactMessage
    {
        $data['ip_address'] = $ipAddress;
        $data['status'] = MessageStatus::Unread;

        return ContactMessage::create($data);
    }

    /**
     * @param array<string, mixed> $data
     */
    public function updateStatus(ContactMessage $message, array $data): ContactMessage
    {
        $message->update($data);

        return $message->fresh() ?? $message;
    }

    public function delete(ContactMessage $message): bool
    {
        return (bool) $message->delete();
    }

    /**
     * @return array<string, int>
     */
    public function getStats(): array
    {
        return [
            'total' => ContactMessage::count(),
            'unread' => ContactMessage::where('status', MessageStatus::Unread)->count(),
            'read' => ContactMessage::where('status', MessageStatus::Read)->count(),
            'replied' => ContactMessage::where('status', MessageStatus::Replied)->count(),
            'archived' => ContactMessage::where('status', MessageStatus::Archived)->count(),
        ];
    }
}
