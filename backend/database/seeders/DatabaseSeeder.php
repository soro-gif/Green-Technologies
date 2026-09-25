<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Reference Data
        $this->call([
            CategorySeeder::class,
            ServiceSeeder::class,
            ProjectSeeder::class,
        ]);

        // 2. Demo Accounts
        User::updateOrCreate(
            ['email' => 'admin@greentechnologies.ci'],
            [
                'name' => 'Direction Technique Green Tech',
                'password' => Hash::make('password'),
                'role' => UserRole::SuperAdmin,
                'is_active' => true,
            ]
        );

        User::updateOrCreate(
            ['email' => 'client@greentechnologies.ci'],
            [
                'name' => 'Client Démo Green Tech',
                'password' => Hash::make('password'),
                'role' => UserRole::User,
                'is_active' => true,
            ]
        );
    }
}
