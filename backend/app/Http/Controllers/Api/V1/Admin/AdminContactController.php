<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Contact\UpdateMessageStatusRequest;
use App\Http\Resources\ContactMessageResource;
use App\Models\ContactMessage;
use App\Services\ContactService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminContactController extends BaseApiController
{
    public function __construct(
        protected ContactService $contactService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', ContactMessage::class);

        $filters = $request->only(['search', 'status', 'sort', 'direction']);
        $perPage = (int) $request->input('per_page', 15);

        $paginator = $this->contactService->getPaginated($filters, $perPage);
        $paginator->through(fn ($msg) => new ContactMessageResource($msg));

        return $this->paginated($paginator, 'Messages de contact récupérés avec succès.');
    }

    public function show(ContactMessage $message): JsonResponse
    {
        $this->authorize('view', $message);

        return $this->success(
            new ContactMessageResource($this->contactService->findById($message->id)),
            'Détails du message récupérés avec succès.'
        );
    }

    public function updateStatus(UpdateMessageStatusRequest $request, ContactMessage $message): JsonResponse
    {
        $this->authorize('update', $message);

        $updated = $this->contactService->updateStatus($message, $request->validated());

        return $this->success(
            new ContactMessageResource($updated),
            'Statut du message mis à jour avec succès.'
        );
    }

    public function destroy(ContactMessage $message): JsonResponse
    {
        $this->authorize('delete', $message);

        $this->contactService->delete($message);

        return $this->success(null, 'Message de contact supprimé avec succès.');
    }

    public function stats(): JsonResponse
    {
        $this->authorize('viewAny', ContactMessage::class);

        return $this->success(
            $this->contactService->getStats(),
            'Statistiques des messages récupérées avec succès.'
        );
    }

    public function export(Request $request)
    {
        $this->authorize('viewAny', ContactMessage::class);

        $messages = ContactMessage::latest('id')->get();
        $filename = 'messages_contact_' . date('Y-m-d_His') . '.xls';

        $headers = [
            'Content-Type' => 'application/vnd.ms-excel; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            'Cache-Control' => 'max-age=0',
        ];

        $callback = function () use ($messages) {
            echo '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">';
            echo '<head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8">';
            echo '<!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Messages Contact</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->';
            echo '<style>
                th { background-color: #0369A1; color: #FFFFFF; font-family: Arial, sans-serif; font-size: 11pt; font-weight: bold; padding: 10px; border: 1px solid #0284C7; text-align: left; }
                td { font-family: Arial, sans-serif; font-size: 10pt; padding: 6px; border: 1px solid #CBD5E1; vertical-align: middle; }
                .even { background-color: #F8FAFC; }
                .bold { font-weight: bold; }
                .center { text-align: center; }
                .date { mso-number-format:"yyyy-mm-dd hh:mm"; text-align: center; }
            </style></head><body>';
            echo '<table border="1">';
            echo '<thead><tr>';
            echo '<th>ID</th>';
            echo '<th>Nom Complet</th>';
            echo '<th>Email</th>';
            echo '<th>Téléphone</th>';
            echo '<th>Sujet</th>';
            echo '<th>Message</th>';
            echo '<th>Statut</th>';
            echo '<th>Date Envoi</th>';
            echo '<th>Adresse IP</th>';
            echo '<th>Notes / Réponse</th>';
            echo '</tr></thead><tbody>';

            $i = 0;
            foreach ($messages as $m) {
                $class = ($i % 2 === 0) ? '' : ' class="even"';
                echo "<tr{$class}>";
                echo '<td class="center">' . htmlspecialchars((string)$m->id) . '</td>';
                echo '<td class="bold">' . htmlspecialchars((string)$m->full_name) . '</td>';
                echo '<td>' . htmlspecialchars((string)$m->email) . '</td>';
                echo '<td>' . htmlspecialchars((string)($m->phone ?? 'N/A')) . '</td>';
                echo '<td class="bold">' . htmlspecialchars((string)$m->subject) . '</td>';
                echo '<td>' . htmlspecialchars((string)$m->message) . '</td>';
                echo '<td class="center bold">' . htmlspecialchars((string)$m->status->value) . '</td>';
                echo '<td class="date">' . htmlspecialchars($m->created_at->format('Y-m-d H:i')) . '</td>';
                echo '<td>' . htmlspecialchars((string)($m->ip_address ?? 'N/A')) . '</td>';
                echo '<td>' . htmlspecialchars((string)($m->reply_notes ?? '')) . '</td>';
                echo '</tr>';
                $i++;
            }

            echo '</tbody></table></body></html>';
        };

        return response()->stream($callback, 200, $headers);
    }
}
