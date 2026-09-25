<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Resources\TestimonialResource;
use App\Services\TestimonialService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TestimonialController extends BaseApiController
{
    public function __construct(
        protected TestimonialService $testimonialService
    ) {}

    public function index(): JsonResponse
    {
        $testimonials = $this->testimonialService->getPublished();

        return $this->success(
            TestimonialResource::collection($testimonials),
            'Témoignages récupérés avec succès.'
        );
    }

    public function featured(): JsonResponse
    {
        $testimonials = $this->testimonialService->getFeatured();

        return $this->success(
            TestimonialResource::collection($testimonials),
            'Témoignages à la une récupérés avec succès.'
        );
    }
}
