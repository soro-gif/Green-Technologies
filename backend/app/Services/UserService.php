<?php

namespace App\Services;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class UserService
{
    /**
     * @param array<string, mixed> $filters
     * @return LengthAwarePaginator<User>
     */
    public function getPaginated(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = User::query();

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if (!empty($filters['role'])) {
            $query->where('role', $filters['role']);
        }

        if (isset($filters['is_active'])) {
            $query->where('is_active', filter_var($filters['is_active'], FILTER_VALIDATE_BOOLEAN));
        }

        $sort = $filters['sort'] ?? 'created_at';
        $direction = strtolower($filters['direction'] ?? 'desc') === 'asc' ? 'asc' : 'desc';
        $allowedSorts = ['id', 'name', 'email', 'role', 'created_at'];

        if (in_array($sort, $allowedSorts, true)) {
            $query->orderBy($sort, $direction);
        }

        return $query->paginate(min(max($perPage, 1), 100));
    }

    public function findById(int $id): User
    {
        return User::findOrFail($id);
    }

    /**
     * @param array<string, mixed> $data
     */
    public function create(array $data): User
    {
        $data['password'] = Hash::make($data['password']);
        $data['role'] = $data['role'] ?? UserRole::Editor;
        $data['is_active'] = $data['is_active'] ?? true;

        return User::create($data);
    }

    /**
     * @param array<string, mixed> $data
     */
    public function update(User $user, array $data): User
    {
        if (!empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        // Prevent demoting the last super admin
        if (isset($data['role']) && $data['role'] !== UserRole::SuperAdmin && $user->role === UserRole::SuperAdmin) {
            $superAdminCount = User::where('role', UserRole::SuperAdmin)->count();
            if ($superAdminCount <= 1) {
                throw ValidationException::withMessages([
                    'role' => ['Impossible de modifier le rôle du dernier Super Administrateur.'],
                ]);
            }
        }

        // Prevent deactivating the last super admin
        if (isset($data['is_active']) && !$data['is_active'] && $user->role === UserRole::SuperAdmin) {
            $activeSuperAdminCount = User::where('role', UserRole::SuperAdmin)->where('is_active', true)->count();
            if ($activeSuperAdminCount <= 1) {
                throw ValidationException::withMessages([
                    'is_active' => ['Impossible de désactiver le dernier Super Administrateur actif.'],
                ]);
            }
        }

        $user->update($data);

        return $user->fresh() ?? $user;
    }

    public function delete(User $user, int $currentUserId): bool
    {
        if ($user->id === $currentUserId) {
            throw ValidationException::withMessages([
                'user' => ['Vous ne pouvez pas supprimer votre propre compte.'],
            ]);
        }

        if ($user->role === UserRole::SuperAdmin) {
            $superAdminCount = User::where('role', UserRole::SuperAdmin)->count();
            if ($superAdminCount <= 1) {
                throw ValidationException::withMessages([
                    'user' => ['Impossible de supprimer le dernier Super Administrateur.'],
                ]);
            }
        }

        return (bool) $user->delete();
    }
}
