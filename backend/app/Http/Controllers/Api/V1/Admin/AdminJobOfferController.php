<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Recruitment\AdminJobOfferRequest;
use App\Http\Resources\JobOfferResource;
use App\Models\JobOffer;
use Illuminate\Http\JsonResponse;

class AdminJobOfferController extends BaseApiController
{
    /**
     * Toutes les offres (brouillons, en ligne, expirées), avec leur nombre de candidatures.
     */
    public function index(): JsonResponse
    {
        $this->authorize('viewAny', JobOffer::class);

        $offers = JobOffer::query()
            ->withCount('applications')
            ->orderByDesc('is_published')
            ->latest('id')
            ->get();

        return $this->success(JobOfferResource::collection($offers), 'Offres d\'emploi récupérées.');
    }

    public function store(AdminJobOfferRequest $request): JsonResponse
    {
        $this->authorize('create', JobOffer::class);

        $offer = JobOffer::create($request->validated());

        return $this->success(
            new JobOfferResource($offer->loadCount('applications')),
            $offer->is_published ? 'Offre publiée sur le site.' : 'Offre enregistrée en brouillon.',
            201
        );
    }

    public function update(AdminJobOfferRequest $request, JobOffer $offer): JsonResponse
    {
        $this->authorize('update', $offer);

        $offer->update($request->validated());

        return $this->success(new JobOfferResource($offer->fresh()->loadCount('applications')), 'Offre mise à jour.');
    }

    /**
     * Les candidatures reçues pour cette offre sont conservées (le poste visé reste renseigné).
     */
    public function destroy(JobOffer $offer): JsonResponse
    {
        $this->authorize('delete', $offer);

        $offer->delete();

        return $this->success(null, 'Offre supprimée. Les candidatures reçues sont conservées.');
    }
}
