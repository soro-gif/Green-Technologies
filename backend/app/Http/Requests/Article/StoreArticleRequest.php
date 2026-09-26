<?php

namespace App\Http\Requests\Article;

use App\Enums\ArticleStatus;
use App\Enums\Permission;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class StoreArticleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasPermission(Permission::ArticlesManage) ?? false;
    }

    public function rules(): array
    {
        return [
            'category_id' => ['nullable', 'integer', 'exists:categories,id'],
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:articles,slug'],
            'excerpt' => ['nullable', 'string', 'max:500'],
            'content' => ['required', 'string', 'min:20'],
            'cover_image' => ['nullable', 'string'],
            'status' => ['sometimes', new Enum(ArticleStatus::class)],
            'published_at' => ['nullable', 'date'],
        ];
    }
}
