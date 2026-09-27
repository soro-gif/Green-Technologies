<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\BaseApiController;
use App\Models\Article;
use App\Models\Category;
use App\Models\Project;
use App\Models\Service;
use App\Models\Testimonial;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
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
            $folderFilter = strtolower(trim((string) $request->query('folder', 'all')));
            $search = strtolower(trim((string) $request->query('search', '')));

            // Ensure destination directories exist
            $this->ensureUploadDirectoriesExist();

            // 1. Collect model usages across DB
            $usages = $this->collectModelUsages();

            // 2. Scan physical uploads on public and storage disk
            $mediaItems = [];
            $seenPaths = [];
            $folders = ['articles', 'projects', 'services', 'categories', 'general'];

            foreach ($folders as $folder) {
                // Public uploads path
                $dirPath = public_path("uploads/{$folder}");
                if (File::exists($dirPath) && File::isDirectory($dirPath)) {
                    try {
                        $files = File::files($dirPath);
                        foreach ($files as $file) {
                            $item = $this->buildMediaItemFromFile($file, $folder, 'local_upload', true, $usages);
                            if ($item && !isset($seenPaths[$item['relative_url']])) {
                                $seenPaths[$item['relative_url']] = true;
                                $mediaItems[] = $item;
                            }
                        }
                    } catch (\Throwable $fe) {
                        Log::warning("Could not scan directory {$dirPath}: " . $fe->getMessage());
                    }
                }

                // Storage disk path
                try {
                    $storageFiles = Storage::disk('public')->files("uploads/{$folder}");
                    foreach ($storageFiles as $storageFile) {
                        $relativeUrl = "/storage/{$storageFile}";
                        if (!isset($seenPaths[$relativeUrl])) {
                            $filename = basename($storageFile);
                            $ext = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
                            if (in_array($ext, ['jpg', 'jpeg', 'png', 'webp', 'svg', 'gif', 'bmp', 'avif'])) {
                                $size = 0;
                                $modifiedAt = date('Y-m-d H:i:s');
                                try {
                                    $size = Storage::disk('public')->size($storageFile);
                                    $modifiedAt = date('Y-m-d H:i:s', Storage::disk('public')->lastModified($storageFile));
                                } catch (\Throwable $e) {
                                    // ignore size error
                                }

                                $fullUrl = url($relativeUrl);
                                $usedBy = $this->findUsagesForUrl($relativeUrl, $fullUrl, $filename, $usages);

                                $seenPaths[$relativeUrl] = true;
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
                                    'mime_type' => "image/{$ext}",
                                    'updated_at' => $modifiedAt,
                                    'type' => 'local_upload',
                                    'is_deletable' => true,
                                    'used_in' => $usedBy,
                                    'usage_count' => count($usedBy),
                                ];
                            }
                        }
                    }
                } catch (\Throwable $se) {
                    // Storage disk scan fallback
                }
            }

            // 3. Scan public root images safely (e.g. Fontaine.png, forage.jpg, solaire.jpg, etc.)
            try {
                $publicPath = public_path();
                if (File::exists($publicPath) && File::isDirectory($publicPath)) {
                    $rootFiles = File::files($publicPath);
                    foreach ($rootFiles as $file) {
                        try {
                            $filename = $file->getFilename();
                            $ext = strtolower($file->getExtension());
                            if (in_array($ext, ['jpg', 'jpeg', 'png', 'webp', 'svg', 'gif', 'bmp', 'avif'])) {
                                $relativeUrl = "/{$filename}";
                                if (!isset($seenPaths[$relativeUrl])) {
                                    $fullUrl = url($relativeUrl);
                                    $size = 0;
                                    $modifiedAt = date('Y-m-d H:i:s');
                                    try {
                                        $size = $file->getSize();
                                        $modifiedAt = date('Y-m-d H:i:s', $file->getMTime());
                                    } catch (\Throwable $e) {
                                        // Ignore stat issues
                                    }

                                    $usedBy = $this->findUsagesForUrl($relativeUrl, $fullUrl, $filename, $usages);

                                    // Deduce smarter default folder based on model usage or filename
                                    $inferredFolder = $this->inferFolderFromUsageOrName($filename, $usedBy);

                                    $seenPaths[$relativeUrl] = true;
                                    $mediaItems[] = [
                                        'id' => md5($relativeUrl),
                                        'file_name' => $filename,
                                        'name' => pathinfo($filename, PATHINFO_FILENAME),
                                        'folder' => $inferredFolder,
                                        'folder_label' => ucfirst($inferredFolder),
                                        'relative_url' => $relativeUrl,
                                        'url' => $fullUrl,
                                        'size' => $size,
                                        'formatted_size' => $this->formatBytes($size),
                                        'extension' => $ext,
                                        'mime_type' => "image/{$ext}",
                                        'updated_at' => $modifiedAt,
                                        'type' => 'public_asset',
                                        'is_deletable' => false,
                                        'used_in' => $usedBy,
                                        'usage_count' => count($usedBy),
                                    ];
                                }
                            }
                        } catch (\Throwable $itemEx) {
                            // skip single problematic file
                        }
                    }
                }
            } catch (\Throwable $re) {
                Log::warning('Could not scan public root files: ' . $re->getMessage());
            }

            // 4. Include DB recorded images that may be remote or Base64
            foreach ($usages as $urlKey => $entityUsages) {
                if (!isset($seenPaths[$urlKey])) {
                    $isDataUrl = str_starts_with($urlKey, 'data:image');
                    $isCloudinary = str_contains($urlKey, 'cloudinary.com');
                    $isRemote = str_starts_with($urlKey, 'http://') || str_starts_with($urlKey, 'https://');
                    $isRelative = str_starts_with($urlKey, '/');

                    if ($isDataUrl || $isCloudinary || $isRemote || $isRelative) {
                        $sizeEst = $isDataUrl ? (int) (strlen($urlKey) * 0.75) : 0;
                        $filename = $isDataUrl ? 'Image intégrée (Base64)' : basename(parse_url($urlKey, PHP_URL_PATH) ?: $urlKey);
                        $inferredFolder = $this->inferFolderFromUsageOrName($filename, $entityUsages);

                        $seenPaths[$urlKey] = true;
                        $mediaItems[] = [
                            'id' => md5($urlKey),
                            'file_name' => $filename ?: 'image-ressource',
                            'name' => pathinfo($filename, PATHINFO_FILENAME) ?: 'image-ressource',
                            'folder' => $inferredFolder,
                            'folder_label' => ucfirst($inferredFolder),
                            'relative_url' => $urlKey,
                            'url' => $urlKey,
                            'size' => $sizeEst,
                            'formatted_size' => $sizeEst > 0 ? $this->formatBytes($sizeEst) : 'Distant',
                            'extension' => $isDataUrl ? 'webp' : (pathinfo(parse_url($urlKey, PHP_URL_PATH) ?: '', PATHINFO_EXTENSION) ?: 'jpg'),
                            'mime_type' => $isDataUrl ? 'image/webp' : 'image/jpeg',
                            'updated_at' => date('Y-m-d H:i:s'),
                            'type' => $isDataUrl ? 'base64' : ($isCloudinary ? 'cloudinary' : ($isRemote ? 'remote_url' : 'public_asset')),
                            'is_deletable' => false,
                            'used_in' => $entityUsages,
                            'usage_count' => count($entityUsages),
                        ];
                    }
                }
            }

            // 5. Filter by folder if requested
            if ($folderFilter && $folderFilter !== 'all' && $folderFilter !== 'tous') {
                $mediaItems = array_values(array_filter($mediaItems, function ($item) use ($folderFilter) {
                    if (strtolower($item['folder']) === $folderFilter) {
                        return true;
                    }
                    // Also check if any model usage matches this folder category!
                    foreach ($item['used_in'] as $usage) {
                        $entity = strtolower($usage['entity'] ?? '');
                        if ($folderFilter === 'articles' && str_contains($entity, 'article')) return true;
                        if ($folderFilter === 'projects' && (str_contains($entity, 'projet') || str_contains($entity, 'réalisation'))) return true;
                        if ($folderFilter === 'services' && (str_contains($entity, 'service') || str_contains($entity, 'prestation'))) return true;
                        if ($folderFilter === 'categories' && (str_contains($entity, 'domaine') || str_contains($entity, 'pôle') || str_contains($entity, 'catégorie'))) return true;
                    }
                    return false;
                }));
            }

            // 6. Filter by search keyword
            if ($search !== '') {
                $mediaItems = array_values(array_filter($mediaItems, function ($item) use ($search) {
                    $matchName = str_contains(strtolower($item['file_name']), $search);
                    $matchFolder = str_contains(strtolower($item['folder']), $search);
                    $matchUrl = str_contains(strtolower($item['relative_url']), $search);
                    $matchUsage = false;
                    foreach ($item['used_in'] as $u) {
                        if (str_contains(strtolower($u['title'] ?? ''), $search) || str_contains(strtolower($u['entity'] ?? ''), $search)) {
                            $matchUsage = true;
                            break;
                        }
                    }
                    return $matchName || $matchFolder || $matchUrl || $matchUsage;
                }));
            }

            // 7. Sort: items with active usage or newest first
            usort($mediaItems, function ($a, $b) {
                if ($a['usage_count'] !== $b['usage_count']) {
                    return $b['usage_count'] <=> $a['usage_count'];
                }
                return strcmp($b['updated_at'], $a['updated_at']);
            });

            return $this->success([
                'items' => $mediaItems,
                'total' => count($mediaItems),
            ], 'Médiathèque récupérée avec succès.');
        } catch (\Throwable $th) {
            Log::error('AdminUploadController@index error: ' . $th->getMessage() . ' in ' . $th->getFile() . ':' . $th->getLine());
            return $this->error('Erreur lors de la récupération de la médiathèque : ' . $th->getMessage(), 500);
        }
    }

    /**
     * Get statistics on images and storage.
     */
    public function stats(): JsonResponse
    {
        try {
            $this->ensureUploadDirectoriesExist();

            $folders = ['articles', 'projects', 'services', 'categories', 'general'];
            $totalCount = 0;
            $totalSizeBytes = 0;
            $byFolder = [];

            foreach ($folders as $f) {
                $dirPath = public_path("uploads/{$f}");
                $count = 0;
                $size = 0;

                if (File::exists($dirPath) && File::isDirectory($dirPath)) {
                    try {
                        $files = File::files($dirPath);
                        foreach ($files as $file) {
                            $ext = strtolower($file->getExtension());
                            if (in_array($ext, ['jpg', 'jpeg', 'png', 'webp', 'svg', 'gif', 'bmp', 'avif'])) {
                                $count++;
                                try {
                                    $size += $file->getSize();
                                } catch (\Throwable $e) {}
                            }
                        }
                    } catch (\Throwable $e) {}
                }

                // Storage disk additions
                try {
                    $storageFiles = Storage::disk('public')->files("uploads/{$f}");
                    foreach ($storageFiles as $sf) {
                        $ext = strtolower(pathinfo($sf, PATHINFO_EXTENSION));
                        if (in_array($ext, ['jpg', 'jpeg', 'png', 'webp', 'svg', 'gif', 'bmp', 'avif'])) {
                            $count++;
                            try {
                                $size += Storage::disk('public')->size($sf);
                            } catch (\Throwable $e) {}
                        }
                    }
                } catch (\Throwable $e) {}

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
     * Build media item safely from physical SplFileInfo.
     */
    private function buildMediaItemFromFile(\SplFileInfo $file, string $folder, string $type, bool $isDeletable, array $usages): ?array
    {
        try {
            $filename = $file->getFilename();
            $ext = strtolower($file->getExtension());
            if (!in_array($ext, ['jpg', 'jpeg', 'png', 'webp', 'svg', 'gif', 'bmp', 'avif'])) {
                return null;
            }

            $relativeUrl = "/uploads/{$folder}/{$filename}";
            $fullUrl = url($relativeUrl);
            $size = 0;
            $modifiedAt = date('Y-m-d H:i:s');

            try {
                $size = $file->getSize();
                $modifiedAt = date('Y-m-d H:i:s', $file->getMTime());
            } catch (\Throwable $e) {}

            $usedBy = $this->findUsagesForUrl($relativeUrl, $fullUrl, $filename, $usages);

            return [
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
                'mime_type' => "image/{$ext}",
                'updated_at' => $modifiedAt,
                'type' => $type,
                'is_deletable' => $isDeletable,
                'used_in' => $usedBy,
                'usage_count' => count($usedBy),
            ];
        } catch (\Throwable $e) {
            return null;
        }
    }

    /**
     * Find usages from collected dictionary with normalized path lookups.
     */
    private function findUsagesForUrl(string $relativeUrl, string $fullUrl, string $filename, array $usages): array
    {
        $results = [];
        $candidates = [
            $relativeUrl,
            $fullUrl,
            $filename,
            ltrim($relativeUrl, '/'),
            basename($relativeUrl),
        ];

        foreach ($candidates as $cand) {
            if (!empty($usages[$cand])) {
                foreach ($usages[$cand] as $u) {
                    $results[$u['entity'] . '_' . $u['id']] = $u;
                }
            }
        }

        return array_values($results);
    }

    /**
     * Infer folder classification from usage entity or filename.
     */
    private function inferFolderFromUsageOrName(string $filename, array $usedBy): string
    {
        foreach ($usedBy as $u) {
            $entity = strtolower($u['entity'] ?? '');
            if (str_contains($entity, 'service') || str_contains($entity, 'prestation')) return 'services';
            if (str_contains($entity, 'projet') || str_contains($entity, 'réalisation')) return 'projects';
            if (str_contains($entity, 'article') || str_contains($entity, 'blog')) return 'articles';
            if (str_contains($entity, 'domaine') || str_contains($entity, 'pôle') || str_contains($entity, 'catégorie')) return 'categories';
        }

        $lowerName = strtolower($filename);
        if (str_contains($lowerName, 'service') || str_contains($lowerName, 'fontaine') || str_contains($lowerName, 'forage') || str_contains($lowerName, 'solaire') || str_contains($lowerName, 'eclairage') || str_contains($lowerName, 'prefiltre')) {
            return 'services';
        }
        if (str_contains($lowerName, 'project') || str_contains($lowerName, 'projet') || str_contains($lowerName, 'chantier')) {
            return 'projects';
        }
        if (str_contains($lowerName, 'article') || str_contains($lowerName, 'news') || str_contains($lowerName, 'blog')) {
            return 'articles';
        }
        if (str_contains($lowerName, 'category') || str_contains($lowerName, 'domaine') || str_contains($lowerName, 'pole')) {
            return 'categories';
        }

        return 'general';
    }

    /**
     * Ensure upload subdirectories exist.
     */
    private function ensureUploadDirectoriesExist(): void
    {
        $folders = ['articles', 'projects', 'services', 'categories', 'general'];
        foreach ($folders as $f) {
            $path = public_path("uploads/{$f}");
            if (!file_exists($path)) {
                @mkdir($path, 0775, true);
            }
        }
    }

    /**
     * Helper to delete a file by path or URL.
     */
    private function deleteSingleFile(string $pathOrUrl): bool
    {
        $cleanPath = ltrim(parse_url($pathOrUrl, PHP_URL_PATH) ?: $pathOrUrl, '/');

        if (str_contains($cleanPath, '..')) {
            return false;
        }

        $publicFilePath = public_path($cleanPath);
        if (File::exists($publicFilePath) && File::isFile($publicFilePath)) {
            return File::delete($publicFilePath);
        }

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
            if (Schema::hasTable('articles') && Schema::hasColumn('articles', 'cover_image')) {
                $articles = Article::select('id', 'title', 'slug', 'cover_image')->whereNotNull('cover_image')->get();
                foreach ($articles as $art) {
                    $img = $art->cover_image;
                    if ($img) {
                        $usageData = [
                            'entity' => 'Article',
                            'title' => $art->title,
                            'id' => $art->id,
                            'link' => "/actualites/{$art->slug}",
                        ];
                        $usages[$img][] = $usageData;
                        $usages[basename($img)][] = $usageData;
                    }
                }
            }

            // Projects
            if (Schema::hasTable('projects')) {
                $cols = array_values(array_filter(['id', 'title', 'slug', 'image', 'main_image', 'image_url'], fn($c) => Schema::hasColumn('projects', $c)));
                if (!empty($cols)) {
                    $projects = Project::select($cols)->get();
                    foreach ($projects as $proj) {
                        foreach (array_filter([$proj->image ?? null, $proj->main_image ?? null, $proj->image_url ?? null]) as $img) {
                            $usageData = [
                                'entity' => 'Projet / Réalisation',
                                'title' => $proj->title,
                                'id' => $proj->id,
                                'link' => "/realisations/{$proj->slug}",
                            ];
                            $usages[$img][] = $usageData;
                            $usages[basename($img)][] = $usageData;
                        }
                    }
                }
            }

            // Services
            if (Schema::hasTable('services')) {
                $cols = array_values(array_filter(['id', 'title', 'slug', 'image', 'image_url'], fn($c) => Schema::hasColumn('services', $c)));
                if (!empty($cols)) {
                    $services = Service::select($cols)->get();
                    foreach ($services as $srv) {
                        foreach (array_filter([$srv->image ?? null, $srv->image_url ?? null]) as $img) {
                            $usageData = [
                                'entity' => 'Prestation / Service',
                                'title' => $srv->title,
                                'id' => $srv->id,
                                'link' => "/services/{$srv->slug}",
                            ];
                            $usages[$img][] = $usageData;
                            $usages[basename($img)][] = $usageData;
                        }
                    }
                }
            }

            // Categories
            if (Schema::hasTable('categories')) {
                $cols = array_values(array_filter(['id', 'name', 'slug', 'image', 'icon'], fn($c) => Schema::hasColumn('categories', $c)));
                if (!empty($cols)) {
                    $categories = Category::select($cols)->get();
                    foreach ($categories as $cat) {
                        foreach (array_filter([$cat->image ?? null, $cat->icon ?? null]) as $img) {
                            $usageData = [
                                'entity' => 'Domaine / Pôle',
                                'title' => $cat->name,
                                'id' => $cat->id,
                                'link' => "/domaines/{$cat->slug}",
                            ];
                            $usages[$img][] = $usageData;
                            $usages[basename($img)][] = $usageData;
                        }
                    }
                }
            }

            // Testimonials
            if (Schema::hasTable('testimonials') && Schema::hasColumn('testimonials', 'avatar')) {
                $testimonials = Testimonial::select('id', 'author_name', 'avatar')->whereNotNull('avatar')->get();
                foreach ($testimonials as $t) {
                    if ($t->avatar) {
                        $usageData = [
                            'entity' => 'Témoignage',
                            'title' => $t->author_name,
                            'id' => $t->id,
                            'link' => "/#temoignages",
                        ];
                        $usages[$t->avatar][] = $usageData;
                        $usages[basename($t->avatar)][] = $usageData;
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
