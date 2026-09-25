<?php

namespace App\Http\Resources;

use App\Models\Testimonial;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Testimonial
 */
class TestimonialResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'project_id' => $this->project_id,
            'project_title' => $this->whenLoaded('project', fn () => $this->project?->title),
            'author_name' => $this->author_name,
            'author_role' => $this->author_role,
            'company' => $this->company,
            'avatar' => $this->avatar,
            'content' => $this->content,
            'rating' => $this->rating,
            'is_featured' => $this->is_featured,
            'is_published' => $this->is_published,
            'display_order' => $this->display_order,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
