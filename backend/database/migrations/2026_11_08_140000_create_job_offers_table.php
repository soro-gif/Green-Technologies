<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('job_offers', function (Blueprint $table) {
            $table->id();
            $table->string('title', 150);
            $table->string('slug', 180)->unique();
            $table->string('department', 100)->nullable(); // Eau, Énergie solaire, Agro, BTP, Administration…
            $table->string('location', 100)->default('Abidjan');
            $table->string('contract_type', 20)->default('cdi');
            $table->string('summary', 300);
            $table->text('description');
            $table->text('requirements')->nullable();
            $table->date('deadline')->nullable();
            $table->boolean('is_published')->default(false);
            $table->timestamp('published_at')->nullable();
            $table->timestamps();

            $table->index(['is_published', 'deadline']);
        });

        // Une candidature peut répondre à une offre ; supprimer l'offre garde la candidature
        Schema::table('job_applications', function (Blueprint $table) {
            $table->foreignId('job_offer_id')->nullable()->after('position')->constrained()->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('job_applications', function (Blueprint $table) {
            $table->dropConstrainedForeignId('job_offer_id');
        });

        Schema::dropIfExists('job_offers');
    }
};
