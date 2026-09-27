<?php

namespace App\Http\Controllers;

use App\Enums\ArticleStatus;
use App\Enums\ProjectStatus;
use App\Models\Article;
use App\Models\Category;
use App\Models\Project;
use App\Models\Service;
use Illuminate\Http\Response;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Schema;

class SitemapController extends Controller
{
    /**
     * Generate dynamic XML sitemap for SEO search engines.
     */
    public function index(): Response
    {
        $baseUrl = $this->resolveBaseUrl();

        $urls = [];

        // 1. Core static public pages
        $urls[] = [
            'loc' => "{$baseUrl}/",
            'lastmod' => now()->startOfDay()->toAtomString(),
            'changefreq' => 'weekly',
            'priority' => '1.0',
        ];
        $urls[] = [
            'loc' => "{$baseUrl}/a-propos",
            'lastmod' => now()->startOfDay()->toAtomString(),
            'changefreq' => 'monthly',
            'priority' => '0.9',
        ];
        $urls[] = [
            'loc' => "{$baseUrl}/domaines",
            'lastmod' => now()->startOfDay()->toAtomString(),
            'changefreq' => 'monthly',
            'priority' => '0.9',
        ];
        $urls[] = [
            'loc' => "{$baseUrl}/services",
            'lastmod' => now()->startOfDay()->toAtomString(),
            'changefreq' => 'weekly',
            'priority' => '0.9',
        ];
        $urls[] = [
            'loc' => "{$baseUrl}/realisations",
            'lastmod' => now()->startOfDay()->toAtomString(),
            'changefreq' => 'weekly',
            'priority' => '0.9',
        ];
        $urls[] = [
            'loc' => "{$baseUrl}/actualites",
            'lastmod' => now()->startOfDay()->toAtomString(),
            'changefreq' => 'weekly',
            'priority' => '0.8',
        ];
        $urls[] = [
            'loc' => "{$baseUrl}/devis",
            'lastmod' => now()->startOfDay()->toAtomString(),
            'changefreq' => 'monthly',
            'priority' => '0.9',
        ];
        $urls[] = [
            'loc' => "{$baseUrl}/contact",
            'lastmod' => now()->startOfDay()->toAtomString(),
            'changefreq' => 'monthly',
            'priority' => '0.8',
        ];

        // 2. Active Categories / Domains (/domaines/{slug})
        try {
            if (Schema::hasTable('categories')) {
                $categories = Category::query();
                if (Schema::hasColumn('categories', 'is_active')) {
                    $categories->where('is_active', true);
                }
                foreach ($categories->get(['slug', 'updated_at']) as $cat) {
                    if ($cat->slug) {
                        $urls[] = [
                            'loc' => "{$baseUrl}/domaines/{$cat->slug}",
                            'lastmod' => ($cat->updated_at ?? now())->toAtomString(),
                            'changefreq' => 'monthly',
                            'priority' => '0.8',
                        ];
                    }
                }
            }
        } catch (\Throwable $e) {}

        // 3. Active Services (/services/{slug})
        try {
            if (Schema::hasTable('services')) {
                $services = Service::query();
                if (Schema::hasColumn('services', 'is_active')) {
                    $services->where('is_active', true);
                }
                foreach ($services->get(['slug', 'updated_at']) as $service) {
                    if ($service->slug) {
                        $urls[] = [
                            'loc' => "{$baseUrl}/services/{$service->slug}",
                            'lastmod' => ($service->updated_at ?? now())->toAtomString(),
                            'changefreq' => 'weekly',
                            'priority' => '0.8',
                        ];
                    }
                }
            }
        } catch (\Throwable $e) {}

        // 4. Published Projects / Réalisations (/realisations/{slug})
        try {
            if (Schema::hasTable('projects')) {
                $projects = Project::query();
                if (Schema::hasColumn('projects', 'status')) {
                    $projects->where(function ($q) {
                        $q->where('status', 'published')
                          ->orWhere('status', ProjectStatus::Published->value ?? 'published');
                    });
                }
                foreach ($projects->get(['slug', 'updated_at']) as $project) {
                    if ($project->slug) {
                        $urls[] = [
                            'loc' => "{$baseUrl}/realisations/{$project->slug}",
                            'lastmod' => ($project->updated_at ?? now())->toAtomString(),
                            'changefreq' => 'weekly',
                            'priority' => '0.8',
                        ];
                    }
                }
            }
        } catch (\Throwable $e) {}

        // 5. Published Articles / Actualités (/actualites/{slug})
        try {
            if (Schema::hasTable('articles')) {
                $articles = Article::query();
                if (Schema::hasColumn('articles', 'status')) {
                    $articles->where(function ($q) {
                        $q->where('status', 'published')
                          ->orWhere('status', ArticleStatus::Published->value ?? 'published');
                    });
                }
                if (Schema::hasColumn('articles', 'published_at')) {
                    $articles->where(function ($q) {
                        $q->whereNull('published_at')
                          ->orWhere('published_at', '<=', now()->addMinutes(5));
                    });
                }
                foreach ($articles->get(['slug', 'published_at', 'updated_at']) as $article) {
                    if ($article->slug) {
                        $date = $article->published_at ?? $article->updated_at ?? now();
                        $urls[] = [
                            'loc' => "{$baseUrl}/actualites/{$article->slug}",
                            'lastmod' => Carbon::parse($date)->toAtomString(),
                            'changefreq' => 'weekly',
                            'priority' => '0.8',
                        ];
                    }
                }
            }
        } catch (\Throwable $e) {}

        // Build XML content
        $xml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";
        foreach ($urls as $url) {
            $xml .= "  <url>\n";
            $xml .= "    <loc>" . htmlspecialchars($url['loc'], ENT_XML1, 'UTF-8') . "</loc>\n";
            $xml .= "    <lastmod>{$url['lastmod']}</lastmod>\n";
            $xml .= "    <changefreq>{$url['changefreq']}</changefreq>\n";
            $xml .= "    <priority>{$url['priority']}</priority>\n";
            $xml .= "  </url>\n";
        }
        $xml .= '</urlset>';

        return response($xml, 200, [
            'Content-Type' => 'application/xml; charset=UTF-8',
            'Cache-Control' => 'public, max-age=3600',
        ]);
    }

    /**
     * Generate dynamic robots.txt content.
     */
    public function robots(): Response
    {
        $baseUrl = $this->resolveBaseUrl();

        $content = "User-agent: *\n";
        $content .= "Allow: /\n";
        $content .= "Disallow: /admin/\n";
        $content .= "Disallow: /mon-espace/\n";
        $content .= "Disallow: /api/\n\n";
        $content .= "Sitemap: {$baseUrl}/sitemap.xml\n";

        return response($content, 200, [
            'Content-Type' => 'text/plain; charset=UTF-8',
            'Cache-Control' => 'public, max-age=86400',
        ]);
    }

    /**
     * Resolve public canonical base URL with HTTPS.
     */
    private function resolveBaseUrl(): string
    {
        $candidate = env('FRONTEND_URL') ?: env('APP_URL') ?: 'https://greentechnologies.ci';

        if (str_contains($candidate, 'localhost') || str_contains($candidate, '127.0.0.1')) {
            $candidate = 'https://greentechnologies.ci';
        }

        $candidate = rtrim($candidate, '/');

        // Always enforce HTTPS for canonical domain
        if (str_starts_with($candidate, 'http://') && !str_contains($candidate, 'localhost')) {
            $candidate = 'https://' . substr($candidate, 7);
        }

        return $candidate;
    }
}
