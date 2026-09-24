<?php

namespace App\Models;

use App\Enums\QuoteStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuoteRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'reference',
        'category_id',
        'service_id',
        'full_name',
        'company',
        'email',
        'phone',
        'city',
        'service_type',
        'estimated_budget',
        'details',
        'status',
        'admin_notes',
        'contacted_at',
    ];

    protected function casts(): array
    {
        return [
            'estimated_budget' => 'decimal:2',
            'status' => QuoteStatus::class,
            'contacted_at' => 'datetime',
        ];
    }

    public function scopePending(Builder $query): Builder
    {
        return $query->where('status', QuoteStatus::Pending);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }
}
