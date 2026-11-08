<?php

namespace App\Models;

use App\Enums\ApplicationStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class JobApplication extends Model
{
    use HasFactory;

    public const EXPERIENCE_LEVELS = [
        'debutant' => 'Débutant / jeune diplômé',
        '1-3' => '1 à 3 ans',
        '3-5' => '3 à 5 ans',
        '5-10' => '5 à 10 ans',
        '10+' => 'Plus de 10 ans',
    ];

    protected $fillable = [
        'full_name',
        'email',
        'phone',
        'city',
        'position',
        'job_offer_id',
        'experience',
        'linkedin',
        'cv_url',
        'cover_letter_url',
        'message',
        'status',
        'source',
        'consent_at',
        'ip_address',
    ];

    protected function casts(): array
    {
        return [
            'status' => ApplicationStatus::class,
            'consent_at' => 'datetime',
        ];
    }

    /**
     * Journal des notes internes, de la plus récente à la plus ancienne.
     */
    public function internalNotes(): HasMany
    {
        return $this->hasMany(JobApplicationNote::class)->latest('id');
    }

    public function jobOffer(): BelongsTo
    {
        return $this->belongsTo(JobOffer::class);
    }

    public function experienceLabel(): ?string
    {
        return self::EXPERIENCE_LEVELS[$this->experience] ?? null;
    }
}
