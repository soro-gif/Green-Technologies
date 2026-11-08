<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\ApplicationStatus;
use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Recruitment\AdminJobApplicationRequest;
use App\Http\Resources\JobApplicationResource;
use App\Models\JobApplication;
use App\Services\ApplicationDocumentStorage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AdminJobApplicationController extends BaseApiController
{
    public function __construct(
        protected ApplicationDocumentStorage $documents,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', JobApplication::class);

        $query = JobApplication::query()->latest('id');

        if ($search = trim((string) $request->query('search', ''))) {
            $query->where(function ($q) use ($search) {
                $q->where('full_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('position', 'like', "%{$search}%")
                    ->orWhere('city', 'like', "%{$search}%");
            });
        }

        if ($status = ApplicationStatus::tryFrom((string) $request->query('status', ''))) {
            $query->where('status', $status);
        }

        $perPage = min(max((int) $request->query('per_page', 15), 1), 100);
        $paginator = $query->paginate($perPage);
        $paginator->through(fn ($application) => new JobApplicationResource($application));

        return $this->paginated($paginator, 'Candidatures récupérées avec succès.');
    }

    public function stats(): JsonResponse
    {
        $this->authorize('viewAny', JobApplication::class);

        $grouped = JobApplication::query()
            ->selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status')
            ->all();

        $byStatus = [];
        foreach (ApplicationStatus::cases() as $case) {
            $byStatus[$case->value] = (int) ($grouped[$case->value] ?? 0);
        }

        return $this->success([
            'total' => array_sum($byStatus),
            'by_status' => $byStatus,
        ], 'Statistiques des candidatures.');
    }

    public function show(JobApplication $application): JsonResponse
    {
        $this->authorize('view', $application);

        return $this->success(new JobApplicationResource($application), 'Candidature récupérée.');
    }

    public function store(AdminJobApplicationRequest $request): JsonResponse
    {
        $this->authorize('create', JobApplication::class);

        $data = $this->withDocuments($request, $request->validated());
        if ($data instanceof JsonResponse) {
            return $data;
        }

        $application = JobApplication::create([
            ...$data,
            'status' => $data['status'] ?? ApplicationStatus::New->value,
            'source' => 'admin',
        ]);

        return $this->success(new JobApplicationResource($application), 'Candidature ajoutée.', 201);
    }

    public function update(AdminJobApplicationRequest $request, JobApplication $application): JsonResponse
    {
        $this->authorize('update', $application);

        $data = $this->withDocuments($request, $request->validated(), $application->full_name);
        if ($data instanceof JsonResponse) {
            return $data;
        }

        $application->update($data);

        return $this->success(new JobApplicationResource($application->fresh()), 'Candidature mise à jour.');
    }

    public function destroy(JobApplication $application): JsonResponse
    {
        $this->authorize('delete', $application);

        $application->delete();

        return $this->success(null, 'Candidature supprimée.');
    }

    /**
     * Remplace les fichiers envoyés (cv, cover_letter) par leur URL de stockage.
     *
     * @return array<string, mixed>|JsonResponse
     */
    private function withDocuments(Request $request, array $data, ?string $fallbackName = null): array|JsonResponse
    {
        unset($data['cv'], $data['cover_letter']);
        $name = $data['full_name'] ?? $fallbackName ?? 'candidat';

        try {
            if ($request->hasFile('cv')) {
                $data['cv_url'] = $this->documents->store($request->file('cv'), $name, 'cv');
            }
            if ($request->hasFile('cover_letter')) {
                $data['cover_letter_url'] = $this->documents->store($request->file('cover_letter'), $name, 'lettre');
            }
        } catch (\Throwable $e) {
            Log::error('Candidature (admin) : échec du dépôt des fichiers : ' . $e->getMessage());

            return $this->error('Le dépôt du fichier a échoué. Réessayez dans un instant.', 503);
        }

        return $data;
    }
}
