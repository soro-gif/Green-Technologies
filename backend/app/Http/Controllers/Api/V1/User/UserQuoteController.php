<?php

namespace App\Http\Controllers\Api\V1\User;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Quote\StoreQuoteRequest;
use App\Http\Resources\QuoteRequestResource;
use App\Models\QuoteRequest;
use App\Services\QuoteService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserQuoteController extends BaseApiController
{
    public function __construct(
        protected QuoteService $quoteService
    ) {}

    /**
     * Get all quotes submitted by the authenticated user.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $paginator = $user->quoteRequests()
            ->with(['category', 'service'])
            ->latest('id')
            ->paginate((int) $request->input('per_page', 10));

        $paginator->through(fn ($quote) => new QuoteRequestResource($quote));

        return $this->paginated($paginator, 'Vos demandes de devis ont été récupérées avec succès.');
    }

    /**
     * Get a specific quote owned by the authenticated user.
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        $quote = QuoteRequest::with(['category', 'service'])->find($id);

        if (!$quote) {
            return $this->error('Demande de devis introuvable.', 404);
        }

        // Strictly verify that the quote belongs to the authenticated user
        if ($quote->user_id !== $user->id && strtolower($quote->email) !== strtolower($user->email)) {
            return $this->error('Accès non autorisé à ce devis.', 403);
        }

        return $this->success(
            new QuoteRequestResource($quote),
            'Détails de votre devis récupérés avec succès.'
        );
    }

    /**
     * Submit a new quote request attached to the authenticated user.
     */
    public function store(StoreQuoteRequest $request): JsonResponse
    {
        $user = $request->user();
        $validated = $request->validated();

        // Enforce authentic user identity
        $validated['user_id'] = $user->id;
        $validated['full_name'] = $validated['full_name'] ?? $user->name;
        $validated['email'] = $user->email; // Never allow overriding with another user's email

        $quote = $this->quoteService->create($validated);

        return $this->success(
            new QuoteRequestResource($quote),
            'Votre demande de devis a été enregistrée avec succès. Notre équipe technique prendra contact sous 48h.',
            201
        );
    }
}
