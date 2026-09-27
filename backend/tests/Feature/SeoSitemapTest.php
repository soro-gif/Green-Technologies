<?php

namespace Tests\Feature;

use App\Enums\ArticleStatus;
use App\Enums\ProjectStatus;
use App\Models\Article;
use App\Models\Category;
use App\Models\Project;
use App\Models\Service;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SeoSitemapTest extends TestCase
{
    use RefreshDatabase;

    public function test_sitemap_returns_http_200_and_application_xml_header(): void
    {
        $response = $this->get('/sitemap.xml');

        $response->assertStatus(200);
        $this->assertStringContainsString('application/xml', $response->headers->get('Content-Type'));
    }

    public function test_sitemap_returns_valid_xml_structure(): void
    {
        $response = $this->get('/sitemap.xml');
        $content = $response->getContent();

        $this->assertNotEmpty($content);
        $xml = simplexml_load_string($content);
        $this->assertNotFalse($xml, 'Le sitemap doit être un XML valide.');
        $this->assertEquals('urlset', $xml->getName());
        $this->assertGreaterThan(0, count($xml->url));
    }

    public function test_sitemap_contains_all_core_public_pages(): void
    {
        $response = $this->get('/sitemap.xml');
        $content = $response->getContent();

        $expectedPaths = [
            'https://greentechnologies.ci/',
            'https://greentechnologies.ci/a-propos',
            'https://greentechnologies.ci/domaines',
            'https://greentechnologies.ci/services',
            'https://greentechnologies.ci/realisations',
            'https://greentechnologies.ci/actualites',
            'https://greentechnologies.ci/devis',
            'https://greentechnologies.ci/contact',
        ];

        foreach ($expectedPaths as $path) {
            $this->assertStringContainsString("<loc>{$path}</loc>", $content);
        }
    }

    public function test_sitemap_dynamically_includes_active_db_models(): void
    {
        $author = User::factory()->create();

        // 1. Category
        $category = Category::create([
            'name' => 'Énergie Solaire Test',
            'slug' => 'energie-solaire-test',
            'description' => 'Test',
            'is_active' => true,
        ]);

        // 2. Service
        $service = Service::create([
            'category_id' => $category->id,
            'title' => 'Centrale Solaire 100kW',
            'slug' => 'centrale-solaire-100kw',
            'summary' => 'Test',
            'description' => 'Test description',
            'is_active' => true,
        ]);

        // 3. Project
        $project = Project::create([
            'category_id' => $category->id,
            'service_id' => $service->id,
            'title' => 'Chantier Korhogo',
            'slug' => 'chantier-korhogo',
            'summary' => 'Test',
            'description' => 'Test description',
            'status' => ProjectStatus::Published,
        ]);

        // 4. Article
        $article = Article::create([
            'user_id' => $author->id,
            'category_id' => $category->id,
            'title' => 'Inauguration Centrale Solaire',
            'slug' => 'inauguration-centrale-solaire',
            'content' => 'Contenu article',
            'status' => ArticleStatus::Published,
            'published_at' => now()->subDay(),
        ]);

        $response = $this->get('/sitemap.xml');
        $content = $response->getContent();

        $this->assertStringContainsString("<loc>https://greentechnologies.ci/domaines/{$category->slug}</loc>", $content);
        $this->assertStringContainsString("<loc>https://greentechnologies.ci/services/{$service->slug}</loc>", $content);
        $this->assertStringContainsString("<loc>https://greentechnologies.ci/realisations/{$project->slug}</loc>", $content);
        $this->assertStringContainsString("<loc>https://greentechnologies.ci/actualites/{$article->slug}</loc>", $content);
    }

    public function test_sitemap_strictly_excludes_private_admin_auth_and_draft_routes(): void
    {
        $author = User::factory()->create();

        // Inactive service
        $inactiveService = Service::create([
            'title' => 'Service Inactif',
            'slug' => 'service-inactif-secret',
            'summary' => 'Test',
            'description' => 'Test description',
            'is_active' => false,
        ]);

        // Draft article
        $draftArticle = Article::create([
            'user_id' => $author->id,
            'title' => 'Brouillon Article',
            'slug' => 'brouillon-secret',
            'content' => 'Test content',
            'status' => ArticleStatus::Draft,
        ]);

        $response = $this->get('/sitemap.xml');
        $content = $response->getContent();

        // Must not contain private keywords
        $forbiddenKeywords = [
            '/admin',
            '/dashboard',
            '/tableau-de-bord',
            '/login',
            '/connexion',
            '/register',
            '/inscription',
            '/mon-espace',
            '/api/',
            $inactiveService->slug,
            $draftArticle->slug,
        ];

        foreach ($forbiddenKeywords as $forbidden) {
            $this->assertStringNotContainsString($forbidden, $content);
        }
    }

    public function test_robots_txt_returns_http_200_and_text_plain_header(): void
    {
        $response = $this->get('/robots.txt');

        $response->assertStatus(200);
        $this->assertStringContainsString('text/plain', $response->headers->get('Content-Type'));
    }

    public function test_robots_txt_contains_valid_directives_and_sitemap_link(): void
    {
        $response = $this->get('/robots.txt');
        $content = $response->getContent();

        $this->assertStringContainsString('User-agent: *', $content);
        $this->assertStringContainsString('Allow: /', $content);
        $this->assertStringContainsString('Disallow: /admin/', $content);
        $this->assertStringContainsString('Disallow: /mon-espace/', $content);
        $this->assertStringContainsString('Disallow: /api/', $content);
        $this->assertStringContainsString('Sitemap: https://greentechnologies.ci/sitemap.xml', $content);
    }

    public function test_sitemap_enforces_https_schema(): void
    {
        $response = $this->get('/sitemap.xml');
        $content = $response->getContent();

        $this->assertStringNotContainsString('http://greentechnologies.ci', $content);
        $this->assertStringContainsString('https://greentechnologies.ci', $content);
    }
}
