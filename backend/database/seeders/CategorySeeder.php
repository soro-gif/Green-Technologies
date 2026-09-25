<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Eau et hydraulique',
                'slug' => 'eau-hydraulique',
                'description' => 'Forages hydrauliques, stations de traitement d\'eau potable aux normes OMS, châteaux d\'eau et réseaux d\'adduction.',
                'icon' => 'droplets',
                'display_order' => 1,
                'is_active' => true,
            ],
            [
                'name' => 'Énergie solaire',
                'slug' => 'energie-solaire',
                'description' => 'Centrales photovoltaïques, kits solaires autonomes, pompage solaire et éclairage public autonome.',
                'icon' => 'sun',
                'display_order' => 2,
                'is_active' => true,
            ],
            [
                'name' => 'Agrotechnologies',
                'slug' => 'agrotechnologies',
                'description' => 'Systèmes d\'irrigation goutte-à-goutte connectés, serres agricoles modernes et fertigation intelligente.',
                'icon' => 'sprout',
                'display_order' => 3,
                'is_active' => true,
            ],
            [
                'name' => 'BTP et génie civil',
                'slug' => 'btp-genie-civil',
                'description' => 'Infrastructures durables, voiries, hangars industriels et construction de bâtiments écologiques.',
                'icon' => 'building-2',
                'display_order' => 4,
                'is_active' => true,
            ],
        ];

        foreach ($categories as $cat) {
            Category::updateOrCreate(['slug' => $cat['slug']], $cat);
        }
    }
}
