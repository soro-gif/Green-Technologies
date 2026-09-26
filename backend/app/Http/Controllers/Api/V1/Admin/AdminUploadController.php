<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\BaseApiController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AdminUploadController extends BaseApiController
{
    /**
     * Upload an image file from the computer explorer.
     */
    public function uploadImage(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'image' => ['required', 'file', 'mimes:jpeg,png,jpg,webp,svg,gif,bmp,avif', 'max:10240'],
                'folder' => ['nullable', 'string', 'in:articles,projects,services,general,categories'],
            ]);

            if (!$request->hasFile('image') || !$request->file('image')->isValid()) {
                return $this->error('Fichier image invalide ou non reçu.', 422);
            }

            $file = $request->file('image');
            $folder = $request->input('folder', 'articles');
            
            $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
            $safeName = Str::slug($originalName);
            $extension = $file->getClientOriginalExtension() ?: $file->guessExtension() ?: 'jpg';
            $fileName = time() . '_' . Str::random(8) . ($safeName ? "_{$safeName}" : '') . ".{$extension}";

            $destinationPath = public_path("uploads/{$folder}");
            $savedSuccessfully = false;
            $relativeUrl = '';
            $fullUrl = '';
            $fileSize = $file->getSize() ?: 0;

            // Strategy 1: Attempt direct upload to public/uploads/{folder}
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

            // Strategy 2: Fallback to Storage::disk('public')
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
            ], 'Image téléversée avec succès.', 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            throw $e;
        } catch (\Throwable $th) {
            Log::error('Upload error: ' . $th->getMessage(), [
                'exception' => $th,
            ]);
            return $this->error('Erreur lors du traitement de l\'image : ' . $th->getMessage(), 500);
        }
    }
}
