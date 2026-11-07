<?php

namespace App\Console\Commands;

use App\Services\CloudinaryService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Transfère vers Cloudinary les images enregistrées en base64 (data URL) dans la base,
 * puis remplace chaque valeur par l'URL Cloudinary.
 *
 * Usage :
 *   php artisan images:migrate-to-cloudinary --dry-run   (inventaire, aucune écriture)
 *   php artisan images:migrate-to-cloudinary
 */
class MigrateImagesToCloudinary extends Command
{
    protected $signature = 'images:migrate-to-cloudinary {--dry-run : Lister les images concernées sans rien modifier}';

    protected $description = 'Déplacer les images base64 stockées en base vers Cloudinary';

    /** table => [colonne => dossier Cloudinary] ; les colonnes « gallery » sont des tableaux JSON. */
    private const COLUMNS = [
        'services' => ['image' => 'services'],
        'projects' => ['image' => 'projects', 'gallery' => 'projects'],
        'articles' => ['cover_image' => 'articles'],
        'categories' => ['image' => 'categories'],
        'testimonials' => ['avatar' => 'general'],
        'users' => ['avatar' => 'general'],
    ];

    public function handle(CloudinaryService $cloudinary): int
    {
        $dryRun = (bool) $this->option('dry-run');

        if (!$dryRun && !$cloudinary->isConfigured()) {
            $this->error('Cloudinary n\'est pas configuré : définissez CLOUDINARY_URL puis relancez.');

            return self::FAILURE;
        }

        $found = 0;
        $migrated = 0;
        $failed = 0;
        $bytes = 0;

        foreach (self::COLUMNS as $table => $columns) {
            if (!Schema::hasTable($table)) {
                continue;
            }

            foreach ($columns as $column => $folder) {
                if (!Schema::hasColumn($table, $column)) {
                    continue;
                }

                $isGallery = $column === 'gallery';

                DB::table($table)
                    ->select(['id', $column])
                    // En JSON, « / » est échappé (data:image\/webp) : on filtre sans la barre.
                    ->where($column, 'like', $isGallery ? '%data:image%' : 'data:image/%')
                    ->orderBy('id')
                    ->chunkById(20, function ($rows) use (
                        $table, $column, $folder, $isGallery, $dryRun, $cloudinary,
                        &$found, &$migrated, &$failed, &$bytes
                    ) {
                        foreach ($rows as $row) {
                            $values = $isGallery ? (json_decode($row->{$column}, true) ?: []) : [$row->{$column}];
                            $changed = false;

                            foreach ($values as $i => $value) {
                                if (!is_string($value) || !str_starts_with($value, 'data:image/')) {
                                    continue;
                                }

                                $found++;
                                $bytes += strlen($value);
                                $label = "{$table}#{$row->id}.{$column}" . ($isGallery ? "[{$i}]" : '');

                                if ($dryRun) {
                                    $this->line(sprintf('  %s (%s Ko)', $label, number_format(strlen($value) / 1024, 0, ',', ' ')));
                                    continue;
                                }

                                try {
                                    $values[$i] = $cloudinary->uploadDataUrl($value, $folder);
                                    $changed = true;
                                    $migrated++;
                                    $this->info("  ✔ {$label}");
                                } catch (\Throwable $e) {
                                    $failed++;
                                    $this->error("  ✘ {$label} : {$e->getMessage()}");
                                }
                            }

                            if ($changed) {
                                DB::table($table)->where('id', $row->id)->update([
                                    $column => $isGallery ? json_encode(array_values($values)) : $values[0],
                                ]);
                            }
                        }
                    });
            }
        }

        $size = number_format($bytes / 1024 / 1024, 1, ',', ' ');

        if ($dryRun) {
            $this->newLine();
            $this->info("{$found} image(s) base64 trouvée(s), {$size} Mo au total. Aucune modification (--dry-run).");

            return self::SUCCESS;
        }

        $this->newLine();
        $this->info("{$migrated} image(s) transférée(s) vers Cloudinary, {$failed} échec(s), {$size} Mo retirés de la base.");

        return $failed > 0 ? self::FAILURE : self::SUCCESS;
    }
}
