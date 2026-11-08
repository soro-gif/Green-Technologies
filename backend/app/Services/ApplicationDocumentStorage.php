<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use RuntimeException;

/**
 * Stockage des CV et lettres de motivation.
 * Cloudinary en production ; disque local accepté seulement hors production
 * (sur Render, le disque est effacé à chaque redémarrage).
 */
class ApplicationDocumentStorage
{
    public function __construct(private CloudinaryService $cloudinary) {}

    public function store(UploadedFile $file, string $applicant, string $kind): string
    {
        $name = Str::slug($applicant) . "-{$kind}." . strtolower($file->getClientOriginalExtension() ?: 'pdf');

        if ($this->cloudinary->isConfigured()) {
            return $this->cloudinary->uploadDocument($file->getRealPath(), $name, 'candidatures');
        }

        if (app()->environment('production')) {
            throw new RuntimeException('Cloudinary non configuré : impossible de conserver le document.');
        }

        $path = $file->storeAs('candidatures', Str::random(12) . "-{$name}", 'public');

        return url(Storage::url($path));
    }
}
