<?php

namespace App\Http\Resources;

use App\Models\QuoteRequest;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin QuoteRequest
 */
class QuoteRequestResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'reference' => $this->reference,
            'category_id' => $this->category_id,
            'service_id' => $this->service_id,
            'category_name' => $this->whenLoaded('category', fn () => $this->category?->name),
            'service_title' => $this->whenLoaded('service', fn () => $this->service?->title),
            'full_name' => $this->full_name,
            'company' => $this->company,
            'email' => $this->email,
            'phone' => $this->phone,
            'city' => $this->city,
            'service_type' => $this->service_type,
            'estimated_budget' => $this->estimated_budget,
            'details' => $this->details,
            'status' => $this->status?->value,
            'status_label' => $this->status?->label(),
            'admin_notes' => $this->admin_notes,
            'contacted_at' => $this->contacted_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
