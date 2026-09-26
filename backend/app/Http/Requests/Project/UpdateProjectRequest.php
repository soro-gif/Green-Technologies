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
        $project = $this->route('project');
        $projectId = is_object($project) ? $project->id : ($project ?? $this->route('id'));

        return [
            'category_id' => ['sometimes', 'required', 'integer', 'exists:categories,id'],
            'service_id' => ['nullable', 'integer', 'exists:services,id'],
            'title' => ['sometimes', 'required', 'string', 'max:200'],
            'slug' => ['sometimes', 'nullable', 'string', 'max:200', Rule::unique('projects', 'slug')->ignore($projectId)],
            'client_name' => ['nullable', 'string', 'max:150'],
            'location' => ['sometimes', 'nullable', 'string', 'max:150'],
            'completion_date' => ['nullable', 'date'],
            'summary' => ['sometimes', 'nullable', 'string'],
            'description' => ['nullable', 'string'],
            'image' => ['nullable', 'string'],
            'gallery' => ['nullable', 'array'],
            'gallery.*' => ['string'],
            'highlights' => ['nullable', 'array'],
            'highlights.*' => ['string', 'max:255'],
            'budget_indicative' => ['nullable', 'numeric', 'min:0'],
            'status' => ['nullable', Rule::enum(ProjectStatus::class)],
            'is_featured' => ['nullable', 'boolean'],
            'display_order' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
