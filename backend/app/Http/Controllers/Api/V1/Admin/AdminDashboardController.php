<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\ArticleStatus;
use App\Enums\MessageStatus;
use App\Enums\ProjectStatus;
use App\Enums\QuoteStatus;
use App\Http\Controllers\Api\BaseApiController;
use App\Models\Article;
use App\Models\Category;
use App\Models\ContactMessage;
use App\Models\Project;
use App\Models\QuoteRequest;
use App\Models\Service;
use App\Models\Testimonial;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminDashboardController extends BaseApiController
{
    public function stats(Request $request): JsonResponse
    {
        $quotesGrouped = QuoteRequest::query()
            ->selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status')
            ->all();

        $quotesPending = (int) ($quotesGrouped[QuoteStatus::Pending->value] ?? 0);
        $quotesInReview = (int) ($quotesGrouped[QuoteStatus::InReview->value] ?? 0);
        $quotesQuoted = (int) ($quotesGrouped[QuoteStatus::Quoted->value] ?? 0);
        $quotesAccepted = (int) ($quotesGrouped[QuoteStatus::Accepted->value] ?? 0);
        $quotesRejected = (int) ($quotesGrouped[QuoteStatus::Rejected->value] ?? 0);
        $quotesCount = array_sum($quotesGrouped);

        $messagesGrouped = ContactMessage::query()
            ->selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status')
            ->all();

        $messagesUnread = (int) ($messagesGrouped[MessageStatus::Unread->value] ?? 0);
        $messagesRead = (int) ($messagesGrouped[MessageStatus::Read->value] ?? 0);
        $messagesReplied = (int) ($messagesGrouped[MessageStatus::Replied->value] ?? 0);
        $messagesCount = array_sum($messagesGrouped);

        $servicesTotal = Service::count();
        $servicesActive = Service::where('is_active', true)->count();

        $projectsTotal = Project::count();
        $projectsPublished = Project::where('status', ProjectStatus::Published)->count();

        $articlesTotal = Article::count();
        $articlesPublished = Article::where('status', ArticleStatus::Published)->count();

        $categoriesTotal = Category::count();
        $testimonialsTotal = Testimonial::count();
        $usersTotal = User::count();

        $recentQuotes = QuoteRequest::with(['category', 'service'])
            ->latest('id')
            ->limit(5)
            ->get();

        $recentMessages = ContactMessage::latest('id')
            ->limit(5)
            ->get();

        return $this->success([
            'overview' => [
                'quotes_total' => $quotesCount,
                'quotes_pending' => $quotesPending,
                'quotes_quoted' => $quotesQuoted,
                'quotes_accepted' => $quotesAccepted,
                'messages_total' => $messagesCount,
                'messages_unread' => $messagesUnread,
                'services_total' => $servicesTotal,
                'services_active' => $servicesActive,
                'projects_total' => $projectsTotal,
                'projects_published' => $projectsPublished,
                'articles_total' => $articlesTotal,
                'articles_published' => $articlesPublished,
                'categories_total' => $categoriesTotal,
                'testimonials_total' => $testimonialsTotal,
                'users_total' => $usersTotal,
            ],
            'quotes_distribution' => [
                'pending' => $quotesPending,
                'in_review' => $quotesInReview,
                'quoted' => $quotesQuoted,
                'accepted' => $quotesAccepted,
                'rejected' => $quotesRejected,
            ],
            'messages_distribution' => [
                'unread' => $messagesUnread,
                'read' => $messagesRead,
                'replied' => $messagesReplied,
            ],
            'recent_quotes' => $recentQuotes,
            'recent_messages' => $recentMessages,
        ], 'Statistiques complètes du tableau de bord.');
    }
}
