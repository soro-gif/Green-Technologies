<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Category\StoreCategoryRequest;
use App\Http\Requests\Category\UpdateCategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use App\Services\CategoryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminCategoryController extends BaseApiController
{
    public function __construct(
        protected CategoryService $categoryService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Category::class);

        $filters = $request->only(['search', 'is_active', 'sort', 'direction']);
        $perPage = (int) $request->input('per_page', 15);

        $paginator = $this->categoryService->getPaginated($filters, $perPage);
        $paginator->through(fn ($cat) => new CategoryResource($cat));

        return $this->paginated($paginator, 'Catégories récupérées avec succès.');
    }

    public function store(StoreCategoryRequest $request): JsonResponse
    {
        $category = $this->categoryService->create($request->validated());

        return $this->success(
            new CategoryResource($category),
            'Catégorie créée avec succès.',
            201
        );
    }

    public function show(Category $category): JsonResponse
    {
        $this->authorize('view', $category);

        return $this->success(
            new CategoryResource($this->categoryService->findById($category->id)),
            'Catégorie récupérée avec succès.'
        );
    }

    public function update(UpdateCategoryRequest $request, Category $category): JsonResponse
    {
        $updated = $this->categoryService->update($category, $request->validated());

        return $this->success(
            new CategoryResource($updated),
            'Catégorie mise à jour avec succès.'
        );
    }

    public function destroy(Category $category): JsonResponse
    {
        $this->authorize('delete', $category);

        $this->categoryService->delete($category);

        return $this->success(null, 'Catégorie supprimée avec succès.');
    }
}
