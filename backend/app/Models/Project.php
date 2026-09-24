<?php

namespace App\Models;

use App\Enums\ProjectStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Project extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'category_id',
        'service_id',
        'title',
        'slug',
        'client_name',
        'location',
        'completion_date',
        'summary',
        'description',
        'image',
        'gallery',
        'highlights',
        'budget_indicative',
        'status',
        'is_featured',
        'display_order',
    ];

    protected function casts(): array
    {
        return [
            'completion_date' => 'date',
            'gallery' => 'array',
            'highlights' => 'array',
            'budget_indicative' => 'decimal:2',
            'status' => ProjectStatus::class,
            'is_featured' => 'boolean',
            'display_order' => 'integer',
        ];
    }

    public function scopePublished(Builder $query): Builder
    {
        return $query->where('status', ProjectStatus::Published);
    }

    public function scopeFeatured(Builder $query): Builder
    {
        return $query->where('is_featured', true)->where('status', ProjectStatus::Published);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    public function testimonials(): HasMany
    {
        return $this->hasMany(Testimonial::class);
    }
}
