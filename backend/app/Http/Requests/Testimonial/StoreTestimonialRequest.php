<?php

namespace App\Http\Requests\Testimonial;

use App\Enums\Permission;
use Illuminate\Foundation\Http\FormRequest;

class StoreTestimonialRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasPermission(Permission::ProjectsManage)
            || $this->user()?->hasPermission(Permission::ServicesManage)
            || false;
    }

    public function rules(): array
    {
        return [
            'project_id' => ['nullable', 'integer', 'exists:projects,id'],
            'author_name' => ['required', 'string', 'max:255'],
            'author_role' => ['required', 'string', 'max:255'],
            'company' => ['nullable', 'string', 'max:255'],
            'avatar' => ['nullable', 'string', 'max:255'],
            'content' => ['required', 'string', 'min:10'],
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'is_featured' => ['sometimes', 'boolean'],
            'is_published' => ['sometimes', 'boolean'],
            'display_order' => ['sometimes', 'integer', 'min:0'],
        ];
    }
}
