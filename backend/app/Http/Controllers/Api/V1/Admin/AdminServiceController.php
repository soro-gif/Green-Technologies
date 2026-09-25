<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Service\StoreServiceRequest;
use App\Http\Requests\Service\UpdateServiceRequest;
use App\Http\Resources\ServiceResource;
use App\Models\Service;
use App\Services\ServiceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminServiceController extends BaseApiController
{
    public function __construct(
        protected ServiceService $serviceService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Service::class);

        $filters = $request->only(['search', 'category_id', 'is_active', 'is_featured', 'sort', 'direction']);
        $perPage = (int) $request->input('per_page', 15);

        $paginator = $this->serviceService->getPaginated($filters, $perPage);
        $paginator->through(fn ($service) => new ServiceResource($service));

        return $this->paginated($paginator, 'Services récupérés avec succès.');
    }

    public function store(StoreServiceRequest $request): JsonResponse
    {
        $service = $this->serviceService->create($request->validated());

        return $this->success(
            new ServiceResource($service),
            'Service créé avec succès.',
            201
        );
    }

    public function show(Service $service): JsonResponse
    {
        $this->authorize('view', $service);

        return $this->success(
            new ServiceResource($this->serviceService->findById($service->id)),
            'Service récupéré avec succès.'
        );
    }

    public function update(UpdateServiceRequest $request, Service $service): JsonResponse
    {
        $updated = $this->serviceService->update($service, $request->validated());

        return $this->success(
            new ServiceResource($updated),
            'Service mis à jour avec succès.'
        );
    }

    public function destroy(Service $service): JsonResponse
    {
        $this->authorize('delete', $service);

        $this->serviceService->delete($service);

        return $this->success(null, 'Service supprimé avec succès.');
    }
}
