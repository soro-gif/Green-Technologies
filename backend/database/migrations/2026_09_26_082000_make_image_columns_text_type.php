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
        if (Schema::hasTable('categories') && Schema::hasColumn('categories', 'image')) {
            Schema::table('categories', function (Blueprint $table) {
                $table->text('image')->nullable()->change();
            });
        }

        if (Schema::hasTable('services') && Schema::hasColumn('services', 'image')) {
            Schema::table('services', function (Blueprint $table) {
                $table->text('image')->nullable()->change();
            });
        }

        if (Schema::hasTable('projects') && Schema::hasColumn('projects', 'image')) {
            Schema::table('projects', function (Blueprint $table) {
                $table->text('image')->nullable()->change();
            });
        }

        if (Schema::hasTable('articles') && Schema::hasColumn('articles', 'cover_image')) {
            Schema::table('articles', function (Blueprint $table) {
                $table->text('cover_image')->nullable()->change();
            });
        }

        if (Schema::hasTable('testimonials') && Schema::hasColumn('testimonials', 'avatar')) {
            Schema::table('testimonials', function (Blueprint $table) {
                $table->text('avatar')->nullable()->change();
            });
        }

        if (Schema::hasTable('users')) {
            Schema::table('users', function (Blueprint $table) {
                if (Schema::hasColumn('users', 'avatar')) {
                    $table->text('avatar')->nullable()->change();
                } else {
                    $table->text('avatar')->nullable();
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('categories') && Schema::hasColumn('categories', 'image')) {
            Schema::table('categories', function (Blueprint $table) {
                $table->string('image', 2048)->nullable()->change();
            });
        }

        if (Schema::hasTable('services') && Schema::hasColumn('services', 'image')) {
            Schema::table('services', function (Blueprint $table) {
                $table->string('image', 2048)->nullable()->change();
            });
        }

        if (Schema::hasTable('projects') && Schema::hasColumn('projects', 'image')) {
            Schema::table('projects', function (Blueprint $table) {
                $table->string('image', 2048)->nullable()->change();
            });
        }

        if (Schema::hasTable('articles') && Schema::hasColumn('articles', 'cover_image')) {
            Schema::table('articles', function (Blueprint $table) {
                $table->string('cover_image', 255)->nullable()->change();
            });
        }

        if (Schema::hasTable('testimonials') && Schema::hasColumn('testimonials', 'avatar')) {
            Schema::table('testimonials', function (Blueprint $table) {
                $table->string('avatar', 255)->nullable()->change();
            });
        }

        if (Schema::hasTable('users') && Schema::hasColumn('users', 'avatar')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('avatar');
            });
        }
    }
};
