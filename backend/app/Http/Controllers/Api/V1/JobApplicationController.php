<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\ApplicationStatus;
use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Recruitment\StoreJobApplicationRequest;
use App\Models\JobApplication;
use App\Services\ApplicationDocumentStorage;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

/**
 * Candidature publique : les fichiers partent sur Cloudinary, la candidature
 * arrive dans Admin → Candidatures avec le statut « Nouvelle ».
 */
class JobApplicationController extends BaseApiController
{
    public function __construct(
        protected ApplicationDocumentStorage $documents,
    ) {}

    public function store(StoreJobApplicationRequest $request): JsonResponse
    {
        $data = $request->validated();

        try {
            $cvUrl = $this->documents->store($request->file('cv'), $data['full_name'], 'cv');
            $letterUrl = $request->hasFile('cover_letter')
                ? $this->documents->store($request->file('cover_letter'), $data['full_name'], 'lettre')
                : null;
        } catch (\Throwable $e) {
            Log::error('Candidature : échec du dépôt des fichiers : ' . $e->getMessage());

            return $this->error(
                'Le dépôt de votre CV a échoué. Réessayez dans un instant ou envoyez-le à contact@greentechnologies.ci.',
                503
            );
        }

        JobApplication::create([
            'full_name' => $data['full_name'],
            'email' => $data['email'],
            'phone' => $data['phone'],
            'city' => $data['city'] ?? null,
            'position' => $data['position'],
            'experience' => $data['experience'] ?? null,
            'linkedin' => $data['linkedin'] ?? null,
            'cv_url' => $cvUrl,
            'cover_letter_url' => $letterUrl,
            'message' => $data['message'] ?? null,
            'status' => ApplicationStatus::New,
            'source' => 'site',
            'consent_at' => now(),
            'ip_address' => $request->ip(),
        ]);

        return $this->success(null, 'Votre candidature a bien été envoyée.', 201);
    }
}
