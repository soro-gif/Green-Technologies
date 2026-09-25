<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\User\StoreUserRequest;
use App\Http\Requests\User\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\UserService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminUserController extends BaseApiController
{
    public function __construct(
        protected UserService $userService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', User::class);

        $filters = $request->only(['search', 'role', 'is_active', 'sort', 'direction']);
        $perPage = (int) $request->input('per_page', 15);

        $paginator = $this->userService->getPaginated($filters, $perPage);
        $paginator->through(fn ($user) => new UserResource($user));

        return $this->paginated($paginator, 'Utilisateurs récupérés avec succès.');
    }

    public function store(StoreUserRequest $request): JsonResponse
    {
        $user = $this->userService->create($request->validated());

        return $this->success(
            new UserResource($user),
            'Utilisateur créé avec succès.',
            201
        );
    }

    public function show(User $user): JsonResponse
    {
        $this->authorize('view', $user);

        return $this->success(
            new UserResource($this->userService->findById($user->id)),
            'Utilisateur récupéré avec succès.'
        );
    }

    public function update(UpdateUserRequest $request, User $user): JsonResponse
    {
        $this->authorize('update', $user);

        $updated = $this->userService->update($user, $request->validated());

        return $this->success(
            new UserResource($updated),
            'Utilisateur mis à jour avec succès.'
        );
    }

    public function destroy(Request $request, User $user): JsonResponse
    {
        $this->authorize('delete', $user);

        $this->userService->delete($user, $request->user()->id);

        return $this->success(null, 'Utilisateur supprimé avec succès.');
    }
}
