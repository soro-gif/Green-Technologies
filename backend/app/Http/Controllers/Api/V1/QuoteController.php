<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Quote\StoreQuoteRequest;
use App\Http\Resources\QuoteRequestResource;
use App\Services\QuoteService;
use Illuminate\Http\JsonResponse;

class QuoteController extends BaseApiController
{
    public function __construct(
        protected QuoteService $quoteService
    ) {}

    public function store(StoreQuoteRequest $request): JsonResponse
    {
        $data = $request->validated();
        if ($user = auth('sanctum')->user()) {
            $data['user_id'] = $user->id;
        }

        $quote = $this->quoteService->create($data);

        return $this->success(
            new QuoteRequestResource($quote),
            'Votre demande de devis a été enregistrée avec succès. Notre équipe vous contactera dans les plus brefs délais.',
            201
        );
    }

    public function track(string $reference): JsonResponse
    {
        $quote = $this->quoteService->findByReference($reference);

        return $this->success(
            new QuoteRequestResource($quote),
            'Demande de devis trouvée.'
        );
    }
}
