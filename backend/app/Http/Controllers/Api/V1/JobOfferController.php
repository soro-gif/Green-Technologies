<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Resources\JobOfferResource;
use App\Models\JobOffer;
use Illuminate\Http\JsonResponse;

/**
 * Offres d'emploi visibles sur la page Recrutement : publiées et non expirées.
 */
class JobOfferController extends BaseApiController
{
    public function index(): JsonResponse
    {
        $offers = JobOffer::open()->latest('published_at')->latest('id')->get();

        return $this->success(JobOfferResource::collection($offers), 'Offres d\'emploi ouvertes.');
    }

    public function show(string $slug): JsonResponse
    {
        $offer = JobOffer::open()->where('slug', $slug)->firstOrFail();

        return $this->success(new JobOfferResource($offer), 'Offre d\'emploi.');
    }
}
