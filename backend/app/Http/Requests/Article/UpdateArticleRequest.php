<?php

namespace App\Http\Requests\Article;

use App\Enums\ArticleStatus;
use App\Enums\Permission;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

class UpdateArticleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasPermission(Permission::ArticlesManage) ?? false;
    }

    public function rules(): array
    {
        $article = $this->route('article');
        $articleId = is_object($article) ? $article->id : $article;

        return [
            'category_id' => ['nullable', 'integer', 'exists:categories,id'],
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'slug' => ['sometimes', 'string', 'max:255', Rule::unique('articles', 'slug')->ignore($articleId)],
            'excerpt' => ['nullable', 'string', 'max:500'],
            'content' => ['sometimes', 'required', 'string', 'min:20'],
            'cover_image' => ['nullable', 'string'],
            'status' => ['sometimes', new Enum(ArticleStatus::class)],
            'published_at' => ['nullable', 'date'],
        ];
    }
}
