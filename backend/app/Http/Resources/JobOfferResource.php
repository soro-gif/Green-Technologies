<?php

namespace App\Http\Resources;

use App\Models\JobOffer;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin JobOffer
 */
class JobOfferResource extends JsonResource
{
    private const STATUS_LABELS = [
        'draft' => 'Brouillon',
        'published' => 'En ligne',
        'expired' => 'Expirée',
    ];

    public function toArray(Request $request): array
    {
        $status = $this->status();

        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'department' => $this->department,
            'location' => $this->location,
            'contract_type' => $this->contract_type?->value,
            'contract_label' => $this->contract_type?->label(),
            'summary' => $this->summary,
            'description' => $this->description,
            'requirements' => $this->requirements,
            'deadline' => $this->deadline?->toDateString(),
            'published_at' => $this->published_at?->toIso8601String(),
            // Informations de gestion : seulement pour l'administration
            $this->mergeWhen($request->is('api/v1/admin/*'), fn () => [
                'is_published' => $this->is_published,
                'status' => $status,
                'status_label' => self::STATUS_LABELS[$status],
                'applications_count' => $this->whenCounted('applications'),
                'created_at' => $this->created_at?->toIso8601String(),
                'updated_at' => $this->updated_at?->toIso8601String(),
            ]),
        ];
    }
}
