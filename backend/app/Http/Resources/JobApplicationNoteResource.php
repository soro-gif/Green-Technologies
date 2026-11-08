<?php

namespace App\Http\Resources;

use App\Models\JobApplicationNote;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin JobApplicationNote
 */
class JobApplicationNoteResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $user = $request->user();

        return [
            'id' => $this->id,
            'body' => $this->body,
            'author' => $this->author?->name,
            'created_at' => $this->created_at?->toIso8601String(),
            'can_delete' => $user !== null && $user->can('delete', $this->resource),
        ];
    }
}
