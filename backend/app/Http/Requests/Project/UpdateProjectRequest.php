<?php

namespace App\Http\Requests\Project;

use App\Enums\ProjectStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasPermission('projects.manage') ?? false;
    }

    public function rules(): array
    {
        $projectId = $this->route('project')?->id ?? $this->route('id');

        return [
            'category_id' => ['sometimes', 'required', 'integer', 'exists:categories,id'],
            'service_id' => ['nullable', 'integer', 'exists:services,id'],
            'title' => ['sometimes', 'required', 'string', 'max:200'],
            'slug' => ['sometimes', 'required', 'string', 'max:200', Rule::unique('projects', 'slug')->ignore($projectId)],
            'client_name' => ['nullable', 'string', 'max:150'],
            'location' => ['sometimes', 'required', 'string', 'max:150'],
            'completion_date' => ['nullable', 'date'],
            'summary' => ['sometimes', 'required', 'string'],
            'description' => ['nullable', 'string'],
            'image' => ['nullable', 'string', 'max:2048'],
            'gallery' => ['nullable', 'array'],
            'gallery.*' => ['string', 'max:255'],
            'highlights' => ['nullable', 'array'],
            'highlights.*' => ['string', 'max:255'],
            'budget_indicative' => ['nullable', 'numeric', 'min:0'],
            'status' => ['nullable', Rule::enum(ProjectStatus::class)],
            'is_featured' => ['nullable', 'boolean'],
            'display_order' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
