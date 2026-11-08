<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Les notes internes passent d'un champ texte unique (écrasé à chaque saisie)
 * à un journal : une ligne par note, avec son auteur et sa date.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('job_application_notes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('job_application_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->text('body');
            $table->timestamps();

            $table->index(['job_application_id', 'created_at']);
        });

        // Reprise des notes saisies avant le journal
        DB::table('job_applications')
            ->whereNotNull('notes')
            ->where('notes', '!=', '')
            ->orderBy('id')
            ->each(function ($application) {
                DB::table('job_application_notes')->insert([
                    'job_application_id' => $application->id,
                    'user_id' => null,
                    'body' => $application->notes,
                    'created_at' => $application->updated_at,
                    'updated_at' => $application->updated_at,
                ]);
            });

        Schema::table('job_applications', function (Blueprint $table) {
            $table->dropColumn('notes');
        });
    }

    public function down(): void
    {
        Schema::table('job_applications', function (Blueprint $table) {
            $table->text('notes')->nullable();
        });

        DB::table('job_application_notes')
            ->orderBy('id')
            ->get()
            ->groupBy('job_application_id')
            ->each(function ($notes, $applicationId) {
                DB::table('job_applications')
                    ->where('id', $applicationId)
                    ->update(['notes' => $notes->pluck('body')->implode("\n\n")]);
            });

        Schema::dropIfExists('job_application_notes');
    }
};
