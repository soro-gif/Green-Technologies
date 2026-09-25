<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Project\StoreProjectRequest;
use App\Http\Requests\Project\UpdateProjectRequest;
use App\Http\Resources\ProjectResource;
use App\Models\Project;
use App\Services\ProjectService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminProjectController extends BaseApiController
{
    public function __construct(
        protected ProjectService $projectService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Project::class);

        $filters = $request->only([
            'search', 'category_id', 'service_id', 'status',
            'location', 'is_featured', 'sort', 'direction'
        ]);
        $perPage = (int) $request->input('per_page', 15);

        $paginator = $this->projectService->getPaginated($filters, $perPage);
        $paginator->through(fn ($project) => new ProjectResource($project));

        return $this->paginated($paginator, 'Projets récupérés avec succès.');
    }

    public function store(StoreProjectRequest $request): JsonResponse
    {
        $project = $this->projectService->create($request->validated());

        return $this->success(
            new ProjectResource($project),
            'Projet créé avec succès.',
            201
        );
    }

    public function show(Project $project): JsonResponse
    {
        $this->authorize('view', $project);

        return $this->success(
            new ProjectResource($this->projectService->findById($project->id)),
            'Projet récupéré avec succès.'
        );
    }

    public function update(UpdateProjectRequest $request, Project $project): JsonResponse
    {
        $updated = $this->projectService->update($project, $request->validated());

        return $this->success(
            new ProjectResource($updated),
            'Projet mis à jour avec succès.'
        );
    }

    public function destroy(Project $project): JsonResponse
    {
        $this->authorize('delete', $project);

        $this->projectService->delete($project);

        return $this->success(null, 'Projet supprimé avec succès.');
    }
}
