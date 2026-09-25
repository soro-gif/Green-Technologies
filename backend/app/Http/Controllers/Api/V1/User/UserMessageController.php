<?php

namespace App\Http\Controllers\Api\V1\User;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Contact\StoreContactMessageRequest;
use App\Http\Resources\ContactMessageResource;
use App\Models\ContactMessage;
use App\Services\ContactService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserMessageController extends BaseApiController
{
    public function __construct(
        protected ContactService $contactService
    ) {}

    /**
     * Get all contact messages submitted by this authenticated user.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $paginator = $user->contactMessages()
            ->latest('id')
            ->paginate((int) $request->input('per_page', 10));

        $paginator->through(fn ($msg) => new ContactMessageResource($msg));

        return $this->paginated($paginator, 'Vos messages ont été récupérés avec succès.');
    }

    /**
     * Send a new message attached to authenticated user account.
     */
    public function store(StoreContactMessageRequest $request): JsonResponse
    {
        $user = $request->user();
        $validated = $request->validated();

        $validated['user_id'] = $user->id;
        $validated['full_name'] = $validated['full_name'] ?? $user->name;
        $validated['email'] = $user->email;
        $validated['ip_address'] = $request->ip();

        $message = $this->contactService->create($validated);

        return $this->success(
            new ContactMessageResource($message),
            'Votre message a bien été transmis à nos équipes techniques.',
            201
        );
    }
}
