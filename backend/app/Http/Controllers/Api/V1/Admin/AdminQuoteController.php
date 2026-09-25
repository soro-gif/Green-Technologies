<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Quote\UpdateQuoteStatusRequest;
use App\Http\Resources\QuoteRequestResource;
use App\Models\QuoteRequest;
use App\Services\QuoteService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminQuoteController extends BaseApiController
{
    public function __construct(
        protected QuoteService $quoteService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', QuoteRequest::class);

        $filters = $request->only(['search', 'status', 'category_id', 'service_id', 'sort', 'direction']);
        $perPage = (int) $request->input('per_page', 15);

        $paginator = $this->quoteService->getPaginated($filters, $perPage);
        $paginator->through(fn ($quote) => new QuoteRequestResource($quote));

        return $this->paginated($paginator, 'Demandes de devis récupérées avec succès.');
    }

    public function show(QuoteRequest $quote): JsonResponse
    {
        $this->authorize('view', $quote);

        return $this->success(
            new QuoteRequestResource($this->quoteService->findById($quote->id)),
            'Détails du devis récupérés avec succès.'
        );
    }

    public function updateStatus(UpdateQuoteStatusRequest $request, QuoteRequest $quote): JsonResponse
    {
        $this->authorize('update', $quote);

        $updated = $this->quoteService->updateStatus($quote, $request->validated());

        return $this->success(
            new QuoteRequestResource($updated),
            'Statut du devis mis à jour avec succès.'
        );
    }

    public function destroy(QuoteRequest $quote): JsonResponse
    {
        $this->authorize('delete', $quote);

        $this->quoteService->delete($quote);

        return $this->success(null, 'Demande de devis supprimée avec succès.');
    }

    public function stats(): JsonResponse
    {
        $this->authorize('viewAny', QuoteRequest::class);

        return $this->success(
            $this->quoteService->getStats(),
            'Statistiques des devis récupérées avec succès.'
        );
    }

    public function export(Request $request)
    {
        $this->authorize('viewAny', QuoteRequest::class);

        $quotes = QuoteRequest::with(['category', 'service'])->latest('id')->get();
        $filename = 'devis_green_technologies_' . date('Y-m-d_His') . '.xls';

        $headers = [
            'Content-Type' => 'application/vnd.ms-excel; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            'Cache-Control' => 'max-age=0',
        ];

        $callback = function () use ($quotes) {
            echo '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">';
            echo '<head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8">';
            echo '<!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Devis Green Tech</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->';
            echo '<style>
                th { background-color: #064E3B; color: #FFFFFF; font-family: Arial, sans-serif; font-size: 11pt; font-weight: bold; padding: 10px; border: 1px solid #047857; text-align: left; }
                td { font-family: Arial, sans-serif; font-size: 10pt; padding: 6px; border: 1px solid #CBD5E1; vertical-align: middle; }
                .even { background-color: #F8FAFC; }
                .bold { font-weight: bold; }
                .center { text-align: center; }
                .amount { mso-number-format:"\#\,\#\#0"; text-align: right; font-weight: bold; color: #047857; }
                .date { mso-number-format:"yyyy-mm-dd hh:mm"; text-align: center; }
            </style></head><body>';
            echo '<table border="1">';
            echo '<thead><tr>';
            echo '<th>ID</th>';
            echo '<th>Référence</th>';
            echo '<th>Nom / Contact</th>';
            echo '<th>Email</th>';
            echo '<th>Téléphone</th>';
            echo '<th>Entreprise</th>';
            echo '<th>Ville</th>';
            echo '<th>Domaine</th>';
            echo '<th>Prestation</th>';
            echo '<th>Budget Estimé (FCFA)</th>';
            echo '<th>Statut</th>';
            echo '<th>Date Demande</th>';
            echo '<th>Notes Internes</th>';
            echo '</tr></thead><tbody>';

            $i = 0;
            foreach ($quotes as $q) {
                $class = ($i % 2 === 0) ? '' : ' class="even"';
                echo "<tr{$class}>";
                echo '<td class="center">' . htmlspecialchars((string)$q->id) . '</td>';
                echo '<td class="bold">' . htmlspecialchars((string)$q->reference) . '</td>';
                echo '<td>' . htmlspecialchars((string)$q->full_name) . '</td>';
                echo '<td>' . htmlspecialchars((string)$q->email) . '</td>';
                echo '<td>' . htmlspecialchars((string)$q->phone) . '</td>';
                echo '<td>' . htmlspecialchars((string)($q->company ?? 'Particulier')) . '</td>';
                echo '<td>' . htmlspecialchars((string)($q->city ?? 'N/A')) . '</td>';
                echo '<td>' . htmlspecialchars((string)($q->category?->name ?? 'N/A')) . '</td>';
                echo '<td>' . htmlspecialchars((string)($q->service?->title ?? 'N/A')) . '</td>';
                echo '<td class="amount">' . ($q->estimated_budget ? number_format((float)$q->estimated_budget, 0, ',', ' ') : 'Non précisé') . '</td>';
                echo '<td class="center bold">' . htmlspecialchars((string)$q->status->value) . '</td>';
                echo '<td class="date">' . htmlspecialchars($q->created_at->format('Y-m-d H:i')) . '</td>';
                echo '<td>' . htmlspecialchars((string)($q->admin_notes ?? '')) . '</td>';
                echo '</tr>';
                $i++;
            }

            echo '</tbody></table></body></html>';
        };

        return response()->stream($callback, 200, $headers);
    }
}
