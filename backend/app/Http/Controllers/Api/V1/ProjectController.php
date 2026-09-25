<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Resources\ProjectResource;
use App\Services\ProjectService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProjectController extends BaseApiController
{
    public function __construct(
        protected ProjectService $projectService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only([
            'search', 'category_id', 'category_slug', 'service_id',
            'status', 'location', 'is_featured', 'sort', 'direction'
        ]);

        $perPage = (int) $request->input('per_page', 9);
        $paginator = $this->projectService->getPaginated($filters, $perPage);
        $paginator->through(fn ($project) => new ProjectResource($project));

        return $this->paginated($paginator, 'Projets récupérés avec succès.');
    }

    public function featured(): JsonResponse
    {
        $projects = $this->projectService->getFeatured();

        return $this->success(
            ProjectResource::collection($projects),
            'Projets phares récupérés avec succès.'
        );
    }

    public function show(string $slug): JsonResponse
    {
        $project = $this->projectService->findBySlug($slug);

        return $this->success(
            new ProjectResource($project),
            'Détails du projet récupérés avec succès.'
        );
    }
}
