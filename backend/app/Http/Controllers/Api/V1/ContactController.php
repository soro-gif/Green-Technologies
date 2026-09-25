<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Contact\StoreContactMessageRequest;
use App\Http\Resources\ContactMessageResource;
use App\Services\ContactService;
use Illuminate\Http\JsonResponse;

class ContactController extends BaseApiController
{
    public function __construct(
        protected ContactService $contactService
    ) {}

    public function store(StoreContactMessageRequest $request): JsonResponse
    {
        $data = $request->validated();
        if ($user = auth('sanctum')->user()) {
            $data['user_id'] = $user->id;
        }

        $message = $this->contactService->create(
            $data,
            $request->ip()
        );

        return $this->success(
            new ContactMessageResource($message),
            'Votre message a été envoyé avec succès. Nous vous répondrons dans les plus brefs délais.',
            201
        );
    }
}
