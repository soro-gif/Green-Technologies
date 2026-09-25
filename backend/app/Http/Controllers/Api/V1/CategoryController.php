<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Resources\CategoryResource;
use App\Services\CategoryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryController extends BaseApiController
{
    public function __construct(
        protected CategoryService $categoryService
    ) {}

    public function index(): JsonResponse
    {
        $categories = $this->categoryService->getActive();

        return $this->success(
            CategoryResource::collection($categories),
            'Catégories récupérées avec succès.'
        );
    }

    public function show(string $slug): JsonResponse
    {
        $category = $this->categoryService->findBySlug($slug);

        return $this->success(
            new CategoryResource($category),
            'Détails de la catégorie récupérés avec succès.'
        );
    }
}
