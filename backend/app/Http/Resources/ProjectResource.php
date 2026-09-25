<?php

namespace App\Http\Resources;

use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Project
 */
class ProjectResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'category_id' => $this->category_id,
            'service_id' => $this->service_id,
            'category_name' => $this->whenLoaded('category', fn () => $this->category?->name),
            'category_slug' => $this->whenLoaded('category', fn () => $this->category?->slug),
            'service_title' => $this->whenLoaded('service', fn () => $this->service?->title),
            'title' => $this->title,
            'slug' => $this->slug,
            'client_name' => $this->client_name,
            'location' => $this->location,
            'completion_date' => $this->completion_date?->format('Y-m-d'),
            'completion_year' => $this->completion_date?->format('Y'),
            'summary' => $this->summary,
            'description' => $this->description,
            'image' => $this->image,
            'image_url' => $this->image,
            'gallery' => $this->gallery ?? [],
            'highlights' => $this->highlights ?? [],
            'budget_indicative' => $this->budget_indicative,
            'status' => $this->status?->value,
            'status_label' => $this->status?->label(),
            'is_featured' => $this->is_featured,
            'display_order' => $this->display_order,
            'category' => new CategoryResource($this->whenLoaded('category')),
            'service' => new ServiceResource($this->whenLoaded('service')),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
