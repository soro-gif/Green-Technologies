<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('job_applications', function (Blueprint $table) {
            $table->id();
            $table->string('full_name', 150);
            $table->string('email', 150);
            $table->string('phone', 50);
            $table->string('city', 100)->nullable();
            $table->string('position', 150);
            $table->string('experience', 20)->nullable();
            $table->string('linkedin', 255)->nullable();
            $table->text('cv_url')->nullable();
            $table->text('cover_letter_url')->nullable();
            $table->text('message')->nullable();
            $table->string('status', 30)->default('new');
            $table->text('notes')->nullable();
            $table->string('source', 20)->default('site'); // site | admin
            $table->timestamp('consent_at')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->timestamps();

            $table->index(['status', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('job_applications');
    }
};
