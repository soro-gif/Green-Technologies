<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\ApplicationStatus;
use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Recruitment\AdminJobApplicationRequest;
use App\Http\Resources\JobApplicationNoteResource;
use App\Http\Resources\JobApplicationResource;
use App\Models\JobApplication;
use App\Models\JobApplicationNote;
use App\Services\ApplicationDocumentStorage;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AdminJobApplicationController extends BaseApiController
{
    public function __construct(
        protected ApplicationDocumentStorage $documents,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', JobApplication::class);

        $query = $this->filtered($request);

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

        return $this->success(
            new JobApplicationResource($application->load('internalNotes.author')),
            'Candidature récupérée.'
        );
    }

    public function store(AdminJobApplicationRequest $request): JsonResponse
    {
        $this->authorize('create', JobApplication::class);

        $data = $this->withDocuments($request, $request->validated());
        if ($data instanceof JsonResponse) {
            return $data;
        }

        $note = trim((string) ($data['notes'] ?? ''));
        unset($data['notes']);

        $application = JobApplication::create([
            ...$data,
            'status' => $data['status'] ?? ApplicationStatus::New->value,
            'source' => 'admin',
        ]);

        // Une note saisie à l'ajout devient la première entrée du journal
        if ($note !== '') {
            $application->internalNotes()->create(['user_id' => $request->user()->id, 'body' => $note]);
        }

        return $this->success(
            new JobApplicationResource($application->load('internalNotes.author')),
            'Candidature ajoutée.',
            201
        );
    }

    public function update(AdminJobApplicationRequest $request, JobApplication $application): JsonResponse
    {
        $this->authorize('update', $application);

        $data = $this->withDocuments($request, $request->validated(), $application->full_name);
        if ($data instanceof JsonResponse) {
            return $data;
        }

        unset($data['notes']); // les notes passent par le journal (storeNote)
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
     * Export CSV (Excel, séparateur « ; ») des candidatures, avec les mêmes filtres que la liste.
     */
    public function export(Request $request): StreamedResponse
    {
        $this->authorize('viewAny', JobApplication::class);

        $query = $this->filtered($request)->with('internalNotes.author');
        $filename = 'candidatures_' . now()->format('Y-m-d_His') . '.csv';

        return response()->streamDownload(function () use ($query) {
            $out = fopen('php://output', 'w');
            fwrite($out, "\xEF\xBB\xBF"); // BOM : Excel lit l'UTF-8 (accents)

            fputcsv($out, [
                'ID', 'Date de réception', 'Nom et prénoms', 'E-mail', 'Téléphone', 'Ville',
                'Poste visé', 'Expérience', 'Statut', 'Origine', 'LinkedIn', 'CV',
                'Lettre de motivation', 'Message du candidat', 'Notes internes',
            ], ';');

            $query->chunk(200, function ($applications) use ($out) {
                foreach ($applications as $a) {
                    $notes = $a->internalNotes
                        ->map(fn ($n) => $n->created_at?->format('d/m/Y H:i')
                            . ' - ' . ($n->author?->name ?? 'Ancienne note')
                            . ' : ' . $n->body)
                        ->implode("\n");

                    fputcsv($out, array_map([self::class, 'csvCell'], [
                        $a->id,
                        $a->created_at?->format('d/m/Y H:i'),
                        $a->full_name,
                        $a->email,
                        $a->phone,
                        $a->city,
                        $a->position,
                        $a->experienceLabel(),
                        $a->status?->label(),
                        $a->source === 'admin' ? 'Ajout manuel' : 'Site web',
                        $a->linkedin,
                        $a->cv_url,
                        $a->cover_letter_url,
                        $a->message,
                        $notes,
                    ]), ';');
                }
            });

            fclose($out);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Cache-Control' => 'no-store',
        ]);
    }

    public function storeNote(Request $request, JobApplication $application): JsonResponse
    {
        $this->authorize('update', $application);

        $validated = $request->validate(
            ['body' => ['required', 'string', 'max:4000']],
            ['body.required' => 'La note est vide.', 'body.max' => 'La note ne doit pas dépasser 4 000 caractères.']
        );

        $note = $application->internalNotes()->create([
            'user_id' => $request->user()->id,
            'body' => trim($validated['body']),
        ]);

        return $this->success(new JobApplicationNoteResource($note->load('author')), 'Note ajoutée.', 201);
    }

    public function destroyNote(JobApplication $application, JobApplicationNote $note): JsonResponse
    {
        abort_unless($note->job_application_id === $application->id, 404);
        $this->authorize('delete', $note);

        $note->delete();

        return $this->success(null, 'Note supprimée.');
    }

    /**
     * Recherche et filtre de statut communs à la liste et à l'export.
     */
    private function filtered(Request $request): Builder
    {
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

        return $query;
    }

    /**
     * Neutralise les formules : une cellule commençant par = + - @ serait exécutée par Excel.
     * Les données viennent du formulaire public, donc de n'importe qui.
     */
    private static function csvCell(mixed $value): string
    {
        $value = (string) ($value ?? '');

        return preg_match('/^[=+\-@\t\r]/', $value) ? "'" . $value : $value;
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
