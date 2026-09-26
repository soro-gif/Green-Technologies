<?php

namespace App\Http\Requests\Service;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateServiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasPermission('services.manage') ?? false;
    }

    public function rules(): array
    {
        $service = $this->route('service');
        $serviceId = is_object($service) ? $service->id : ($service ?? $this->route('id'));

        return [
            'category_id' => ['sometimes', 'required', 'integer', 'exists:categories,id'],
            'title' => ['sometimes', 'required', 'string', 'max:180'],
            'slug' => ['sometimes', 'nullable', 'string', 'max:180', Rule::unique('services', 'slug')->ignore($serviceId)],
            'summary' => ['nullable', 'string', 'max:500'],
            'description' => ['nullable', 'string'],
            'features' => ['nullable', 'array'],
            'features.*' => ['string', 'max:255'],
            'icon' => ['nullable', 'string', 'max:50'],
            'image' => ['nullable', 'string', 'max:2048'],
            'display_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}
