<?php

namespace App\Models;

use App\Enums\ContractType;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

/**
 * Offre d'emploi publiée sur la page Recrutement.
 */
class JobOffer extends Model
{
    protected $fillable = [
        'title',
        'department',
        'location',
        'contract_type',
        'summary',
        'description',
        'requirements',
        'deadline',
        'is_published',
    ];

    protected function casts(): array
    {
        return [
            'contract_type' => ContractType::class,
            'deadline' => 'date',
            'is_published' => 'boolean',
            'published_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (JobOffer $offer) {
            $offer->slug = static::uniqueSlug($offer->title);
        });

        // Date de première publication, conservée si l'offre repasse en brouillon
        static::saving(function (JobOffer $offer) {
            if ($offer->is_published && $offer->published_at === null) {
                $offer->published_at = now();
            }
        });
    }

    public function applications(): HasMany
    {
        return $this->hasMany(JobApplication::class);
    }

    /**
     * Offres visibles sur le site : publiées et dont la date limite n'est pas passée.
     */
    public function scopeOpen(Builder $query): Builder
    {
        return $query->where('is_published', true)
            ->where(fn ($q) => $q->whereNull('deadline')->orWhereDate('deadline', '>=', today()));
    }

    public function isExpired(): bool
    {
        return $this->deadline !== null && $this->deadline->lt(today());
    }

    /**
     * draft (brouillon), published (en ligne) ou expired (publiée mais date limite passée).
     */
    public function status(): string
    {
        if (! $this->is_published) {
            return 'draft';
        }

        return $this->isExpired() ? 'expired' : 'published';
    }

    private static function uniqueSlug(string $title): string
    {
        $base = Str::slug($title) ?: 'offre';
        $slug = $base;
        $i = 2;

        while (static::where('slug', $slug)->exists()) {
            $slug = "{$base}-{$i}";
            $i++;
        }

        return $slug;
    }
}
