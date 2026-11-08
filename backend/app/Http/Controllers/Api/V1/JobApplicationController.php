<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Recruitment\StoreJobApplicationRequest;
use App\Services\CloudinaryService;
use App\Services\ContactService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Candidature publique : les fichiers partent sur Cloudinary, la candidature
 * arrive dans les messages de l'admin (Admin → Messages) avec les liens vers les fichiers.
 */
class JobApplicationController extends BaseApiController
{
    public function __construct(
        protected ContactService $contactService,
        protected CloudinaryService $cloudinary,
    ) {}

    public function store(StoreJobApplicationRequest $request): JsonResponse
    {
        $data = $request->validated();

        try {
            $cvUrl = $this->storeDocument($request->file('cv'), $data['full_name'], 'cv');
            $letterUrl = $request->hasFile('cover_letter')
                ? $this->storeDocument($request->file('cover_letter'), $data['full_name'], 'lettre')
                : null;
        } catch (\Throwable $e) {
            Log::error('Candidature : échec du dépôt des fichiers : ' . $e->getMessage());

            return $this->error(
                'Le dépôt de votre CV a échoué. Réessayez dans un instant ou envoyez-le à contact@greentechnologies.ci.',
                503
            );
        }

        $experience = StoreJobApplicationRequest::EXPERIENCE_LEVELS[$data['experience'] ?? ''] ?? null;

        $body = collect([
            "Poste ou domaine visé : {$data['position']}",
            $experience ? "Expérience : {$experience}" : null,
            !empty($data['city']) ? "Ville : {$data['city']}" : null,
            !empty($data['linkedin']) ? "LinkedIn : {$data['linkedin']}" : null,
            "CV : {$cvUrl}",
            $letterUrl ? "Lettre de motivation : {$letterUrl}" : null,
            'Consentement à la conservation des données : oui, le ' . now()->format('d/m/Y à H:i'),
            !empty($data['message']) ? "\n" . $data['message'] : null,
        ])->filter()->implode("\n");

        $payload = [
            'full_name' => $data['full_name'],
            'email' => $data['email'],
            'phone' => $data['phone'],
            'subject' => Str::limit("Candidature – {$data['position']}", 200, ''),
            'message' => $body,
        ];
        if ($user = auth('sanctum')->user()) {
            $payload['user_id'] = $user->id;
        }

        $this->contactService->create($payload, $request->ip());

        return $this->success(null, 'Votre candidature a bien été envoyée.', 201);
    }

    private function storeDocument(UploadedFile $file, string $applicant, string $kind): string
    {
        $name = Str::slug($applicant) . "-{$kind}." . strtolower($file->getClientOriginalExtension() ?: 'pdf');

        if ($this->cloudinary->isConfigured()) {
            return $this->cloudinary->uploadDocument($file->getRealPath(), $name, 'candidatures');
        }

        // Sans Cloudinary, le disque local n'est acceptable qu'en développement :
        // sur Render il est effacé à chaque redémarrage et le CV serait perdu.
        if (app()->environment('production')) {
            throw new \RuntimeException('Cloudinary non configuré : impossible de conserver le CV.');
        }

        $path = $file->storeAs('candidatures', Str::random(12) . "-{$name}", 'public');

        return url(Storage::url($path));
    }
}
