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
        Schema::table('categories', function (Blueprint $table) {
            $table->text('image')->nullable()->change();
        });

        Schema::table('services', function (Blueprint $table) {
            $table->text('image')->nullable()->change();
        });

        Schema::table('projects', function (Blueprint $table) {
            $table->text('image')->nullable()->change();
        });

        Schema::table('articles', function (Blueprint $table) {
            $table->text('cover_image')->nullable()->change();
        });

        Schema::table('testimonials', function (Blueprint $table) {
            $table->text('avatar')->nullable()->change();
        });

        Schema::table('users', function (Blueprint $table) {
            $table->text('avatar')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            $table->string('image', 2048)->nullable()->change();
        });

        Schema::table('services', function (Blueprint $table) {
            $table->string('image', 2048)->nullable()->change();
        });

        Schema::table('projects', function (Blueprint $table) {
            $table->string('image', 2048)->nullable()->change();
        });

        Schema::table('articles', function (Blueprint $table) {
            $table->string('cover_image', 255)->nullable()->change();
        });

        Schema::table('testimonials', function (Blueprint $table) {
            $table->string('avatar', 255)->nullable()->change();
        });

        Schema::table('users', function (Blueprint $table) {
            $table->string('avatar', 255)->nullable()->change();
        });
    }
};
