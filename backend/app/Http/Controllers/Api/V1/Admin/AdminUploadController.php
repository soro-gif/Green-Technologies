<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\BaseApiController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminUploadController extends BaseApiController
{
    /**
     * Upload an image file from the computer explorer.
     */
    public function uploadImage(Request $request): JsonResponse
    {
        $request->validate([
            'image' => ['required', 'file', 'image', 'mimes:jpeg,png,jpg,webp,svg,gif', 'max:10240'],
            'folder' => ['nullable', 'string', 'in:articles,projects,services,general'],
        ]);

        $file = $request->file('image');
        $folder = $request->input('folder', 'articles');
        
        $destinationPath = public_path("uploads/{$folder}");
        if (!file_exists($destinationPath)) {
            mkdir($destinationPath, 0755, true);
        }

        $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
        $safeName = Str::slug($originalName);
        $extension = $file->getClientOriginalExtension() ?: 'jpg';
        $fileName = time() . '_' . Str::random(8) . ($safeName ? "_{$safeName}" : '') . ".{$extension}";

        $file->move($destinationPath, $fileName);

        // Build relative & absolute URL
        $relativeUrl = "/uploads/{$folder}/{$fileName}";
        $fullUrl = url($relativeUrl);

        return $this->success([
            'url' => $fullUrl,
            'relative_url' => $relativeUrl,
            'file_name' => $fileName,
            'original_name' => $file->getClientOriginalName(),
            'size' => filesize("{$destinationPath}/{$fileName}"),
        ], 'Image téléversée avec succès.', 201);
    }
}
