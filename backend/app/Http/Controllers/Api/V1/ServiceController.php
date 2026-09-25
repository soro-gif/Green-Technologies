<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Resources\ServiceResource;
use App\Services\ServiceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ServiceController extends BaseApiController
{
    public function __construct(
        protected ServiceService $serviceService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['search', 'category_id', 'category_slug', 'is_featured', 'sort', 'direction']);
        $filters['is_active'] = true;

        $perPage = (int) $request->input('per_page', 12);
        $paginator = $this->serviceService->getPaginated($filters, $perPage);
        $paginator->through(fn ($service) => new ServiceResource($service));

        return $this->paginated($paginator, 'Services récupérés avec succès.');
    }

    public function featured(): JsonResponse
    {
        $services = $this->serviceService->getFeatured();

        return $this->success(
            ServiceResource::collection($services),
            'Services phares récupérés avec succès.'
        );
    }

    public function show(string $slug): JsonResponse
    {
        $service = $this->serviceService->findBySlug($slug);

        return $this->success(
            new ServiceResource($service),
            'Détails du service récupérés avec succès.'
        );
    }
}
