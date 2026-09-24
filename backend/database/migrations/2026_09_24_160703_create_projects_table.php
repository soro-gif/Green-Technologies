<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained('categories')->restrictOnDelete();
            $table->foreignId('service_id')->nullable()->constrained('services')->nullOnDelete();
            $table->string('title', 200);
            $table->string('slug', 200)->unique();
            $table->string('client_name', 150)->nullable();
            $table->string('location', 150);
            $table->date('completion_date')->nullable();
            $table->text('summary');
            $table->longText('description')->nullable();
            $table->string('image')->nullable();
            $table->json('gallery')->nullable();
            $table->json('highlights')->nullable();
            $table->decimal('budget_indicative', 15, 2)->nullable();
            $table->string('status', 30)->default('published');
            $table->boolean('is_featured')->default(false);
            $table->unsignedInteger('display_order')->default(0);
            $table->softDeletes();
            $table->timestamps();

            $table->index(['category_id', 'status', 'is_featured']);
            $table->index(['status', 'completion_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};
