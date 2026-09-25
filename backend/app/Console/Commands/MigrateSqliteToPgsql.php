<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class MigrateSqliteToPgsql extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'db:migrate-from-sqlite';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Transfère toutes les données du fichier database.sqlite vers PostgreSQL';

    /**
     * Tables à migrer dans l\'ordre des dépendances.
     */
    protected array $tables = [
        'users',
        'categories',
        'services',
        'projects',
        'quote_requests',
        'contact_messages',
        'testimonials',
        'articles',
    ];

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $sqlitePath = database_path('database.sqlite');

        if (!file_exists($sqlitePath)) {
            $this->error("Le fichier SQLite n'existe pas : {$sqlitePath}");
            return Command::FAILURE;
        }

        // Forcer le bon chemin pour la connexion SQLite
        Config::set('database.connections.sqlite.database', $sqlitePath);
        DB::purge('sqlite');

        $this->info("Début de la migration des données de SQLite vers PostgreSQL...");

        try {
            // Vérifier la connexion SQLite
            $sqliteCheck = DB::connection('sqlite')->table('users')->count();
            $this->info("Connexion SQLite OK (Utilisateurs trouvés dans SQLite : {$sqliteCheck})");
        } catch (\Exception $e) {
            $this->error("Erreur de connexion SQLite : " . $e->getMessage());
            return Command::FAILURE;
        }

        foreach ($this->tables as $table) {
            if (!Schema::connection('sqlite')->hasTable($table)) {
                $this->warn("Table SQLite '{$table}' non trouvée, ignorée.");
                continue;
            }

            if (!Schema::connection('pgsql')->hasTable($table)) {
                $this->warn("Table PostgreSQL '{$table}' non trouvée, exécutez d'abord 'php artisan migrate'.");
                continue;
            }

            $rows = DB::connection('sqlite')->table($table)->get();
            $count = $rows->count();

            $this->line("Migration de la table <comment>{$table}</comment> ({$count} enregistrements)...");

            if ($count === 0) {
                continue;
            }

            // Vider la table PostgreSQL avant import pour éviter les doublons
            DB::connection('pgsql')->statement("TRUNCATE TABLE {$table} CASCADE");

            $insertData = [];
            foreach ($rows as $row) {
                $arrayRow = (array) $row;
                // Convertir les types booléens pour PostgreSQL si nécessaire
                foreach ($arrayRow as $key => $value) {
                    if (in_array($key, ['is_active', 'is_featured', 'email_verified_at']) && is_numeric($value)) {
                        $arrayRow[$key] = (bool) $value;
                    }
                }
                $insertData[] = $arrayRow;
            }

            // Insérer par lots
            foreach (array_chunk($insertData, 100) as $chunk) {
                DB::connection('pgsql')->table($table)->insert($chunk);
            }

            // Réinitialiser la séquence auto-increment de PostgreSQL
            try {
                $maxId = DB::connection('pgsql')->table($table)->max('id');
                if ($maxId !== null) {
                    DB::connection('pgsql')->statement(
                        "SELECT setval(pg_get_serial_sequence('{$table}', 'id'), coalesce(max(id), 1)) FROM {$table}"
                    );
                }
            } catch (\Exception $e) {
                // Ignore si la table n'a pas de colonne 'id' séquentielle
            }

            $this->info("✓ Table '{$table}' migrée avec succès !");
        }

        $this->newLine();
        $this->info("🎉 Migration terminée avec succès ! Toutes vos données SQLite sont maintenant dans PostgreSQL.");

        return Command::SUCCESS;
    }
}
