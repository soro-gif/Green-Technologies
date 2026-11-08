<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use RuntimeException;

/**
 * Téléversement d'images vers Cloudinary.
 *
 * Les identifiants sont lus via config('services.cloudinary') et non env() :
 * en production, `php artisan config:cache` rend env() vide hors des fichiers de config.
 */
class CloudinaryService
{
    private ?string $cloudName = null;
    private ?string $apiKey = null;
    private ?string $apiSecret = null;
    private ?string $uploadPreset = null;

    public function __construct()
    {
        $config = config('services.cloudinary', []);

        $this->cloudName = $config['cloud_name'] ?? null;
        $this->apiKey = $config['api_key'] ?? null;
        $this->apiSecret = $config['api_secret'] ?? null;
        $this->uploadPreset = $config['upload_preset'] ?? null;

        $url = $config['url'] ?? null;
        if ($url && preg_match('/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/', trim($url), $m)) {
            $this->apiKey = $m[1];
            $this->apiSecret = $m[2];
            $this->cloudName = $m[3];
        }
    }

    public function isConfigured(): bool
    {
        return (bool) $this->cloudName
            && ($this->uploadPreset || ($this->apiKey && $this->apiSecret));
    }

    /**
     * Téléverse un fichier local. Retourne l'URL https publique.
     */
    public function uploadFile(string $path, string $originalName, string $folder): string
    {
        return $this->send($folder, function ($request) use ($path, $originalName) {
            return $request->attach('file', file_get_contents($path), $originalName);
        }, []);
    }

    /**
     * Téléverse un document (PDF, Word) en ressource « raw » : Cloudinary le sert tel quel.
     */
    public function uploadDocument(string $path, string $originalName, string $folder): string
    {
        return $this->send($folder, function ($request) use ($path, $originalName) {
            return $request->attach('file', file_get_contents($path), $originalName);
        }, [], 'raw');
    }

    /**
     * Téléverse une image encodée en data URL (data:image/...;base64,...).
     * Cloudinary accepte directement ce format dans le champ `file`.
     */
    public function uploadDataUrl(string $dataUrl, string $folder): string
    {
        return $this->send($folder, fn ($request) => $request->asMultipart(), ['file' => $dataUrl]);
    }

    private function send(string $folder, callable $prepare, array $extra, string $resourceType = 'image'): string
    {
        if (!$this->isConfigured()) {
            throw new RuntimeException('Cloudinary n\'est pas configuré (CLOUDINARY_URL manquant).');
        }

        $params = ['folder' => "greentech/{$folder}"];

        if ($this->apiKey && $this->apiSecret) {
            // Upload signé : paramètres triés par ordre alphabétique, puis le secret.
            $params['timestamp'] = time();
            $toSign = collect($params)->sortKeys()->map(fn ($v, $k) => "{$k}={$v}")->implode('&');
            $params['signature'] = sha1($toSign . $this->apiSecret);
            $params['api_key'] = $this->apiKey;
        } else {
            $params['upload_preset'] = $this->uploadPreset;
        }

        $request = $prepare(Http::timeout(60));
        $response = $request->post(
            "https://api.cloudinary.com/v1_1/{$this->cloudName}/{$resourceType}/upload",
            array_merge($params, $extra)
        );

        if (!$response->successful()) {
            $message = $response->json('error.message') ?? $response->body();
            throw new RuntimeException("Échec du téléversement Cloudinary : {$message}");
        }

        $url = $response->json('secure_url');
        if (!$url) {
            throw new RuntimeException('Réponse Cloudinary sans secure_url.');
        }

        return $url;
    }
}
