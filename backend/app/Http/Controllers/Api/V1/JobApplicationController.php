<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\ApplicationStatus;
use App\Enums\UserRole;
use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Recruitment\StoreJobApplicationRequest;
use App\Models\JobApplication;
use App\Models\User;
use App\Notifications\NewJobApplication;
use App\Services\ApplicationDocumentStorage;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;

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

        $application = JobApplication::create([
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

        // Après la réponse : le candidat n'attend pas l'envoi du mail, et une panne SMTP ne fait pas échouer son dépôt
        dispatch(fn () => self::notifyRecruiters($application))->afterResponse();

        return $this->success(null, 'Votre candidature a bien été envoyée.', 201);
    }

    public static function notifyRecruiters(JobApplication $application): void
    {
        try {
            $emails = config('services.recruitment.notify');

            if (! empty($emails)) {
                Notification::route('mail', $emails)->notify(new NewJobApplication($application));

                return;
            }

            $admins = User::query()
                ->where('is_active', true)
                ->whereIn('role', [UserRole::SuperAdmin, UserRole::Admin])
                ->get();

            Notification::send($admins, new NewJobApplication($application));
        } catch (\Throwable $e) {
            Log::error("Candidature #{$application->id} : échec de la notification e-mail : " . $e->getMessage());
        }
    }
}
