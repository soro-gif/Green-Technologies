<?php

namespace App\Http\Resources;

use App\Models\JobApplication;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin JobApplication
 */
class JobApplicationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'full_name' => $this->full_name,
            'email' => $this->email,
            'phone' => $this->phone,
            'city' => $this->city,
            'position' => $this->position,
            'experience' => $this->experience,
            'experience_label' => $this->experienceLabel(),
            'linkedin' => $this->linkedin,
            'cv_url' => $this->cv_url,
            'cover_letter_url' => $this->cover_letter_url,
            'message' => $this->message,
            'status' => $this->status?->value,
            'status_label' => $this->status?->label(),
            'internal_notes' => JobApplicationNoteResource::collection($this->whenLoaded('internalNotes')),
            'source' => $this->source,
            'consent_at' => $this->consent_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
