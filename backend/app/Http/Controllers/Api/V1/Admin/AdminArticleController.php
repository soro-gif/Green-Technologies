<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Article\StoreArticleRequest;
use App\Http\Requests\Article\UpdateArticleRequest;
use App\Http\Resources\ArticleResource;
use App\Models\Article;
use App\Services\ArticleService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminArticleController extends BaseApiController
{
    public function __construct(
        protected ArticleService $articleService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Article::class);

        $filters = $request->only(['search', 'status', 'category_id', 'user_id', 'sort', 'direction']);
        $perPage = (int) $request->input('per_page', 15);

        $paginator = $this->articleService->getPaginated($filters, $perPage, onlyPublished: false);
        $paginator->through(fn ($article) => new ArticleResource($article));

        return $this->paginated($paginator, 'Articles récupérés avec succès.');
    }

    public function store(StoreArticleRequest $request): JsonResponse
    {
        $article = $this->articleService->create(
            $request->validated(),
            $request->user()->id
        );

        return $this->success(
            new ArticleResource($article),
            'Article créé avec succès.',
            201
        );
    }

    public function show(Article $article): JsonResponse
    {
        $this->authorize('view', $article);

        return $this->success(
            new ArticleResource($this->articleService->findById($article->id)),
            'Article récupéré avec succès.'
        );
    }

    public function update(UpdateArticleRequest $request, Article $article): JsonResponse
    {
        $this->authorize('update', $article);

        $updated = $this->articleService->update($article, $request->validated());

        return $this->success(
            new ArticleResource($updated),
            'Article mis à jour avec succès.'
        );
    }

    public function destroy(Article $article): JsonResponse
    {
        $this->authorize('delete', $article);

        $this->articleService->delete($article);

        return $this->success(null, 'Article supprimé avec succès.');
    }
}
