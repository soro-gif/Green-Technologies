<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Resources\ArticleResource;
use App\Services\ArticleService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ArticleController extends BaseApiController
{
    public function __construct(
        protected ArticleService $articleService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['search', 'category_id', 'category_slug', 'sort', 'direction']);

        $perPage = (int) $request->input('per_page', 9);
        $paginator = $this->articleService->getPaginated($filters, $perPage, onlyPublished: true);
        $paginator->through(fn ($article) => new ArticleResource($article));

        return $this->paginated($paginator, 'Articles récupérés avec succès.');
    }

    public function show(string $slug): JsonResponse
    {
        $article = $this->articleService->findPublishedBySlug($slug);

        return $this->success(
            new ArticleResource($article),
            'Article récupéré avec succès.'
        );
    }
}
