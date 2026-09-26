<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\BaseApiController;
use App\Models\Article;
use App\Models\Category;
use App\Models\Project;
use App\Models\Service;
use App\Models\Testimonial;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AdminUploadController extends BaseApiController
{
    /**
     * Get a comprehensive listing of all media and images across disk and database models.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $folderFilter = $request->query('folder'); // 'articles', 'projects', 'services', 'categories', 'general', 'public'
            $search = strtolower(trim((string) $request->query('search', '')));

            // 1. Gather all usages across DB models
            $usages = $this->collectModelUsages();

            // 2. Scan physical files on disk
            $mediaItems = [];
            $folders = ['articles', 'projects', 'services', 'categories', 'general'];

            foreach ($folders as $folder) {
                $dirPath = public_path("uploads/{$folder}");
                if (File::exists($dirPath) && File::isDirectory($dirPath)) {
                    $files = File::files($dirPath);
                    foreach ($files as $file) {
                        $filename = $file->getFilename();
                        $relativeUrl = "/uploads/{$folder}/{$filename}";
                        $fullUrl = url($relativeUrl);
                        $size = $file->getSize();
                        $modifiedAt = date('Y-m-d H:i:s', $file->getMTime());
                        $ext = strtolower($file->getExtension());

                        if (!in_array($ext, ['jpg', 'jpeg', 'png', 'webp', 'svg', 'gif', 'bmp', 'avif'])) {
                            continue;
                        }

                        $usedBy = $usages[$relativeUrl] ?? $usages[$fullUrl] ?? $usages[$filename] ?? [];

                        $mediaItems[] = [
                            'id' => md5($relativeUrl),
                            'file_name' => $filename,
                            'name' => pathinfo($filename, PATHINFO_FILENAME),
                            'folder' => $folder,
                            'folder_label' => ucfirst($folder),
                            'relative_url' => $relativeUrl,
                            'url' => $fullUrl,
                            'size' => $size,
                            'formatted_size' => $this->formatBytes($size),
                            'extension' => $ext,
                            'mime_type' => File::mimeType($file->getPathname()) ?: "image/{$ext}",
                            'updated_at' => $modifiedAt,
                            'type' => 'local_upload',
                            'is_deletable' => true,
                            'used_in' => $usedBy,
                            'usage_count' => count($usedBy),
                        ];
                    }
                }
            }

            // Also check public root images (e.g. Fontaine.png, Prefiltre.png, FE.png, etc.)
            $publicFiles = File::files(public_path());
            foreach ($publicFiles as $file) {
                $filename = $file->getFilename();
                $ext = strtolower($file->getExtension());
                if (in_array($ext, ['jpg', 'jpeg', 'png', 'webp', 'svg', 'gif', 'bmp', 'avif'])) {
                    $relativeUrl = "/{$filename}";
                    $fullUrl = url($relativeUrl);
                    $size = $file->getSize();
                    $modifiedAt = date('Y-m-d H:i:s', $file->getMTime());
                    $usedBy = $usages[$relativeUrl] ?? $usages[$fullUrl] ?? $usages[$filename] ?? [];

                    $mediaItems[] = [
                        'id' => md5($relativeUrl),
                        'file_name' => $filename,
                        'name' => pathinfo($filename, PATHINFO_FILENAME),
                        'folder' => 'general',
                        'folder_label' => 'Ressources Publiques',
                        'relative_url' => $relativeUrl,
                        'url' => $fullUrl,
                        'size' => $size,
                        'formatted_size' => $this->formatBytes($size),
                        'extension' => $ext,
                        'mime_type' => File::mimeType($file->getPathname()) ?: "image/{$ext}",
                        'updated_at' => $modifiedAt,
                        'type' => 'public_asset',
                        'is_deletable' => false, // Preserve core root public icons/assets
                        'used_in' => $usedBy,
                        'usage_count' => count($usedBy),
                    ];
                }
            }

            // 3. Include external/Cloudinary/Data-URL items recorded in the database that might not be on local disk
            foreach ($usages as $urlKey => $entityUsages) {
                // If it's not already in mediaItems
                $exists = false;
                foreach ($mediaItems as $item) {
                    if ($item['relative_url'] === $urlKey || $item['url'] === $urlKey || $item['file_name'] === $urlKey) {
                        $exists = true;
                        break;
                    }
                }

                if (!$exists && (str_starts_with($urlKey, 'http') || str_starts_with($urlKey, 'data:image'))) {
                    $isDataUrl = str_starts_with($urlKey, 'data:image');
                    $isCloudinary = str_contains($urlKey, 'cloudinary.com');
                    $sizeEst = $isDataUrl ? (int) (strlen($urlKey) * 0.75) : 0;

                    $mediaItems[] = [
                        'id' => md5($urlKey),
                        'file_name' => $isDataUrl ? 'Image intégrée (Base64)' : basename(parse_url($urlKey, PHP_URL_PATH) ?: 'image-distante'),
                        'name' => $isDataUrl ? 'Image intégrée' : basename(parse_url($urlKey, PHP_URL_PATH) ?: 'image-distante'),
                        'folder' => $isCloudinary ? 'general' : ($isDataUrl ? 'general' : 'general'),
                        'folder_label' => $isCloudinary ? 'Cloudinary' : ($isDataUrl ? 'Base64 Direct' : 'Lien Externe'),
                        'relative_url' => $urlKey,
                        'url' => $urlKey,
                        'size' => $sizeEst,
                        'formatted_size' => $sizeEst > 0 ? $this->formatBytes($sizeEst) : 'Distant',
                        'extension' => $isDataUrl ? 'webp' : pathinfo(parse_url($urlKey, PHP_URL_PATH) ?: '', PATHINFO_EXTENSION) ?: 'jpg',
                        'mime_type' => $isDataUrl ? 'image/webp' : 'image/jpeg',
                        'updated_at' => date('Y-m-d H:i:s'),
                        'type' => $isDataUrl ? 'base64' : ($isCloudinary ? 'cloudinary' : 'remote_url'),
                        'is_deletable' => false,
                        'used_in' => $entityUsages,
                        'usage_count' => count($entityUsages),
                    ];
                }
            }

            // 4. Filter by folder if requested
            if ($folderFilter && $folderFilter !== 'all' && $folderFilter !== 'tous') {
                $mediaItems = array_values(array_filter($mediaItems, function ($item) use ($folderFilter) {
                    return strtolower($item['folder']) === strtolower($folderFilter);
                }));
            }

            // 5. Filter by search keyword
            if ($search !== '') {
                $mediaItems = array_values(array_filter($mediaItems, function ($item) use ($search) {
                    $matchName = str_contains(strtolower($item['file_name']), $search);
                    $matchFolder = str_contains(strtolower($item['folder']), $search);
                    $matchUsage = false;
                    foreach ($item['used_in'] as $u) {
                        if (str_contains(strtolower($u['title'] ?? ''), $search) || str_contains(strtolower($u['entity'] ?? ''), $search)) {
                            $matchUsage = true;
                            break;
                        }
                    }
                    return $matchName || $matchFolder || $matchUsage;
                }));
            }

            // 6. Sort: items with usage first or newest first
            usort($mediaItems, function ($a, $b) {
                return strcmp($b['updated_at'], $a['updated_at']);
            });

            return $this->success([
                'items' => $mediaItems,
                'total' => count($mediaItems),
            ], 'Médiathèque récupérée avec succès.');
        } catch (\Throwable $th) {
            Log::error('AdminUploadController@index error: ' . $th->getMessage());
            return $this->error('Erreur lors de la récupération de la médiathèque : ' . $th->getMessage(), 500);
        }
    }

    /**
     * Get statistics on images and storage.
     */
    public function stats(): JsonResponse
    {
        try {
            $folders = ['articles', 'projects', 'services', 'categories', 'general'];
            $totalCount = 0;
            $totalSizeBytes = 0;
            $byFolder = [];

            foreach ($folders as $f) {
                $dirPath = public_path("uploads/{$f}");
                $count = 0;
                $size = 0;
                if (File::exists($dirPath) && File::isDirectory($dirPath)) {
                    $files = File::files($dirPath);
                    foreach ($files as $file) {
                        $ext = strtolower($file->getExtension());
                        if (in_array($ext, ['jpg', 'jpeg', 'png', 'webp', 'svg', 'gif', 'bmp', 'avif'])) {
                            $count++;
                            $size += $file->getSize();
                        }
                    }
                }
                $totalCount += $count;
                $totalSizeBytes += $size;
                $byFolder[$f] = [
                    'folder' => $f,
                    'label' => ucfirst($f),
                    'count' => $count,
                    'size' => $size,
                    'formatted_size' => $this->formatBytes($size),
                ];
            }

            return $this->success([
                'total_count' => $totalCount,
                'total_size_bytes' => $totalSizeBytes,
                'total_formatted_size' => $this->formatBytes($totalSizeBytes),
                'by_folder' => $byFolder,
            ], 'Statistiques de la médiathèque récupérées.');
        } catch (\Throwable $th) {
            Log::error('AdminUploadController@stats error: ' . $th->getMessage());
            return $this->error('Erreur lors du calcul des statistiques : ' . $th->getMessage(), 500);
        }
    }

    /**
     * Upload an image file from the computer explorer.
     */
    public function uploadImage(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'image' => ['required', 'file', 'mimes:jpeg,png,jpg,webp,svg,gif,bmp,avif', 'max:15360'],
                'folder' => ['nullable', 'string', 'in:articles,projects,services,general,categories'],
            ]);

            if (!$request->hasFile('image') || !$request->file('image')->isValid()) {
                return $this->error('Fichier image invalide ou non reçu.', 422);
            }

            $file = $request->file('image');
            $folder = $request->input('folder', 'general');

            $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
            $safeName = Str::slug($originalName);
            $extension = $file->getClientOriginalExtension() ?: $file->guessExtension() ?: 'jpg';
            $fileName = time() . '_' . Str::random(8) . ($safeName ? "_{$safeName}" : '') . ".{$extension}";

            // Option A: If Cloudinary credentials are provided
            $cloudinaryUrl = env('CLOUDINARY_URL');
            $cloudinaryCloudName = env('CLOUDINARY_CLOUD_NAME');
            $cloudinaryApiKey = env('CLOUDINARY_API_KEY');
            $cloudinaryApiSecret = env('CLOUDINARY_API_SECRET');
            $cloudinaryUploadPreset = env('CLOUDINARY_UPLOAD_PRESET');

            if ($cloudinaryUrl || ($cloudinaryCloudName && ($cloudinaryUploadPreset || ($cloudinaryApiKey && $cloudinaryApiSecret)))) {
                try {
                    $cloudName = $cloudinaryCloudName;
                    $apiKey = $cloudinaryApiKey;
                    $apiSecret = $cloudinaryApiSecret;

                    if ($cloudinaryUrl && preg_match('/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/', $cloudinaryUrl, $matches)) {
                        $apiKey = $matches[1];
                        $apiSecret = $matches[2];
                        $cloudName = $matches[3];
                    }

                    if ($cloudName) {
                        $timestamp = time();
                        $uploadData = [
                            'folder' => "greentech/{$folder}",
                        ];

                        if ($cloudinaryUploadPreset) {
                            $uploadData['upload_preset'] = $cloudinaryUploadPreset;
                        } elseif ($apiKey && $apiSecret) {
                            $paramsToSign = "folder=greentech/{$folder}&timestamp={$timestamp}{$apiSecret}";
                            $signature = sha1($paramsToSign);
                            $uploadData['timestamp'] = $timestamp;
                            $uploadData['api_key'] = $apiKey;
                            $uploadData['signature'] = $signature;
                        }

                        $response = Http::timeout(30)
                            ->attach('file', file_get_contents($file->getRealPath()), $file->getClientOriginalName())
                            ->post("https://api.cloudinary.com/v1_1/{$cloudName}/image/upload", $uploadData);

                        if ($response->successful()) {
                            $json = $response->json();
                            $secureUrl = $json['secure_url'] ?? $json['url'] ?? null;
                            if ($secureUrl) {
                                return $this->success([
                                    'url' => $secureUrl,
                                    'relative_url' => $secureUrl,
                                    'file_name' => $fileName,
                                    'original_name' => $file->getClientOriginalName(),
                                    'size' => $file->getSize() ?: 0,
                                    'formatted_size' => $this->formatBytes($file->getSize() ?: 0),
                                ], 'Image téléversée avec succès sur Cloudinary.', 201);
                            }
                        }
                    }
                } catch (\Throwable $cloudEx) {
                    Log::warning('Cloudinary upload error, falling back to local: ' . $cloudEx->getMessage());
                }
            }

            $destinationPath = public_path("uploads/{$folder}");
            $savedSuccessfully = false;
            $relativeUrl = '';
            $fullUrl = '';
            $fileSize = $file->getSize() ?: 0;

            // Direct upload to public/uploads/{folder}
            try {
                if (!file_exists($destinationPath)) {
                    @mkdir($destinationPath, 0775, true);
                }

                if (is_dir($destinationPath) && is_writable($destinationPath)) {
                    $file->move($destinationPath, $fileName);
                    $savedSuccessfully = true;
                    $relativeUrl = "/uploads/{$folder}/{$fileName}";
                    $fullUrl = url($relativeUrl);
                    if (file_exists("{$destinationPath}/{$fileName}")) {
                        $fileSize = filesize("{$destinationPath}/{$fileName}");
                    }
                }
            } catch (\Throwable $e) {
                Log::warning("Direct move to public/uploads failed, falling back to Storage disk: " . $e->getMessage());
                $savedSuccessfully = false;
            }

            if (!$savedSuccessfully) {
                $storageSubdir = "uploads/{$folder}";
                $storedPath = Storage::disk('public')->putFileAs($storageSubdir, $file, $fileName);

                if ($storedPath) {
                    $relativeUrl = "/storage/{$storedPath}";
                    $fullUrl = url($relativeUrl);
                    $fileSize = Storage::disk('public')->size($storedPath);
                    $savedSuccessfully = true;
                }
            }

            if (!$savedSuccessfully) {
                return $this->error('Impossible d\'écrire le fichier sur le serveur (erreur de permission).', 500);
            }

            return $this->success([
                'url' => $fullUrl,
                'relative_url' => $relativeUrl,
                'file_name' => $fileName,
                'original_name' => $file->getClientOriginalName(),
                'size' => $fileSize,
                'formatted_size' => $this->formatBytes($fileSize),
            ], 'Image téléversée avec succès.', 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            throw $e;
        } catch (\Throwable $th) {
            Log::error('Upload error: ' . $th->getMessage());
            return $this->error('Erreur lors du traitement de l\'image : ' . $th->getMessage(), 500);
        }
    }

    /**
     * Delete an image from storage.
     */
    public function destroy(Request $request): JsonResponse
    {
        try {
            $pathOrUrl = $request->input('path') ?? $request->input('url') ?? $request->query('path');

            if (!$pathOrUrl) {
                return $this->error('Chemin ou URL de l\'image requis.', 422);
            }

            $deleted = $this->deleteSingleFile($pathOrUrl);

            if ($deleted) {
                return $this->success(null, 'Image supprimée avec succès du serveur.');
            }

            return $this->error('Impossible de localiser ou supprimer le fichier spécifié.', 404);
        } catch (\Throwable $th) {
            Log::error('AdminUploadController@destroy error: ' . $th->getMessage());
            return $this->error('Erreur lors de la suppression de l\'image : ' . $th->getMessage(), 500);
        }
    }

    /**
     * Bulk delete images.
     */
    public function bulkDestroy(Request $request): JsonResponse
    {
        try {
            $paths = $request->input('paths', []);
            if (!is_array($paths) || empty($paths)) {
                return $this->error('Aucun fichier sélectionné pour la suppression.', 422);
            }

            $deletedCount = 0;
            foreach ($paths as $path) {
                if ($this->deleteSingleFile($path)) {
                    $deletedCount++;
                }
            }

            return $this->success([
                'deleted_count' => $deletedCount,
            ], "{$deletedCount} image(s) supprimée(s) avec succès.");
        } catch (\Throwable $th) {
            Log::error('AdminUploadController@bulkDestroy error: ' . $th->getMessage());
            return $this->error('Erreur lors de la suppression groupée : ' . $th->getMessage(), 500);
        }
    }

    /**
     * Helper to delete a file by path or URL.
     */
    private function deleteSingleFile(string $pathOrUrl): bool
    {
        // Extract relative path
        $cleanPath = ltrim(parse_url($pathOrUrl, PHP_URL_PATH) ?: $pathOrUrl, '/');

        // Security check: prevent directory traversal
        if (str_contains($cleanPath, '..')) {
            return false;
        }

        // 1. Try public path
        $publicFilePath = public_path($cleanPath);
        if (File::exists($publicFilePath) && File::isFile($publicFilePath)) {
            return File::delete($publicFilePath);
        }

        // 2. Try storage/app/public
        if (str_starts_with($cleanPath, 'storage/')) {
            $storageRelative = substr($cleanPath, strlen('storage/'));
            if (Storage::disk('public')->exists($storageRelative)) {
                return Storage::disk('public')->delete($storageRelative);
            }
        }

        return false;
    }

    /**
     * Scan DB models to see where images are actively utilized.
     */
    private function collectModelUsages(): array
    {
        $usages = [];

        try {
            // Articles
            if (\Illuminate\Support\Facades\Schema::hasTable('articles') && \Illuminate\Support\Facades\Schema::hasColumn('articles', 'cover_image')) {
                $articles = Article::select('id', 'title', 'slug', 'cover_image')->whereNotNull('cover_image')->get();
                foreach ($articles as $art) {
                    $img = $art->cover_image;
                    if ($img) {
                        $usages[$img][] = [
                            'entity' => 'Article',
                            'title' => $art->title,
                            'id' => $art->id,
                            'link' => "/actualites/{$art->slug}",
                        ];
                    }
                }
            }

            // Projects
            if (\Illuminate\Support\Facades\Schema::hasTable('projects')) {
                $cols = array_filter(['id', 'title', 'slug', 'image', 'main_image', 'image_url'], fn($c) => \Illuminate\Support\Facades\Schema::hasColumn('projects', $c));
                $projects = Project::select($cols)->get();
                foreach ($projects as $proj) {
                    foreach (array_filter([$proj->image ?? null, $proj->main_image ?? null, $proj->image_url ?? null]) as $img) {
                        $usages[$img][] = [
                            'entity' => 'Projet / Réalisation',
                            'title' => $proj->title,
                            'id' => $proj->id,
                            'link' => "/realisations/{$proj->slug}",
                        ];
                    }
                }
            }

            // Services
            if (\Illuminate\Support\Facades\Schema::hasTable('services')) {
                $cols = array_filter(['id', 'title', 'slug', 'image', 'image_url'], fn($c) => \Illuminate\Support\Facades\Schema::hasColumn('services', $c));
                $services = Service::select($cols)->get();
                foreach ($services as $srv) {
                    foreach (array_filter([$srv->image ?? null, $srv->image_url ?? null]) as $img) {
                        $usages[$img][] = [
                            'entity' => 'Prestation / Service',
                            'title' => $srv->title,
                            'id' => $srv->id,
                            'link' => "/services/{$srv->slug}",
                        ];
                    }
                }
            }

            // Categories
            if (\Illuminate\Support\Facades\Schema::hasTable('categories')) {
                $cols = array_filter(['id', 'name', 'slug', 'image', 'icon'], fn($c) => \Illuminate\Support\Facades\Schema::hasColumn('categories', $c));
                $categories = Category::select($cols)->get();
                foreach ($categories as $cat) {
                    foreach (array_filter([$cat->image ?? null, $cat->icon ?? null]) as $img) {
                        $usages[$img][] = [
                            'entity' => 'Domaine / Pôle',
                            'title' => $cat->name,
                            'id' => $cat->id,
                            'link' => "/domaines/{$cat->slug}",
                        ];
                    }
                }
            }

            // Testimonials
            if (\Illuminate\Support\Facades\Schema::hasTable('testimonials') && \Illuminate\Support\Facades\Schema::hasColumn('testimonials', 'avatar')) {
                $testimonials = Testimonial::select('id', 'author_name', 'avatar')->whereNotNull('avatar')->get();
                foreach ($testimonials as $t) {
                    if ($t->avatar) {
                        $usages[$t->avatar][] = [
                            'entity' => 'Témoignage',
                            'title' => $t->author_name,
                            'id' => $t->id,
                            'link' => "/#temoignages",
                        ];
                    }
                }
            }
        } catch (\Throwable $e) {
            Log::warning('Error collecting image usages: ' . $e->getMessage());
        }

        return $usages;
    }

    /**
     * Format bytes to human readable format.
     */
    private function formatBytes(int $bytes, int $precision = 2): string
    {
        if ($bytes <= 0) {
            return '0 B';
        }
        $units = ['B', 'Ko', 'Mo', 'Go', 'To'];
        $pow = floor(log($bytes) / log(1024));
        $pow = min($pow, count($units) - 1);
        $bytes /= pow(1024, $pow);
        return round($bytes, $precision) . ' ' . $units[$pow];
    }
}

