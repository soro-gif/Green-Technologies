<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Service;
use Illuminate\Database\Seeder;

class ServiceSeeder extends Seeder
{
    public function run(): void
    {
        $eau = Category::where('slug', 'eau-hydraulique')->first();
        $energie = Category::where('slug', 'energie-solaire')->first();
        $agro = Category::where('slug', 'agrotechnologies')->first();
        $btp = Category::where('slug', 'btp-genie-civil')->first();

        $services = [
            // EAU
            [
                'category_id' => $eau?->id,
                'title' => 'Forages hydrauliques et pompage solaire',
                'slug' => 'forages-hydrauliques-pompage-solaire',
                'summary' => 'Réalisation de forages profonds équipés de pompes solaires immergées pour un approvisionnement continu.',
                'description' => 'Étude géophysique, foration grand diamètre, tubage certifié, installation de pompes solaires et châteaux d\'eau métalliques ou béton.',
                'features' => ['Étude hydrogéologique certifiée', 'Pompes solaires Grundfos/Lorentz', 'Garantie de débit continu'],
                'icon' => 'droplet',
                'display_order' => 1,
                'is_active' => true,
            ],
            [
                'category_id' => $eau?->id,
                'title' => 'Stations de filtration et traitement d\'eau OMS',
                'slug' => 'stations-filtration-traitement-eau-oms',
                'summary' => 'Unités de potabilisation d\'eau aux normes OMS pour collectivités, complexes industriels et résidences.',
                'description' => 'Filtration membranaire, osmose inverse, déferrisation, désinfection UV et traitement automatique sans surconsommation chimique.',
                'features' => ['Conformité stricte OMS', 'Système autonettoyant', 'Analyse bactériologique fournie'],
                'icon' => 'filter',
                'display_order' => 2,
                'is_active' => true,
            ],

            // ENERGIE
            [
                'category_id' => $energie?->id,
                'title' => 'Centrales solaires photovoltaïques hybrides',
                'slug' => 'centrales-solaires-photovoltaiques-hybrides',
                'summary' => 'Conception et installation de centrales solaires avec stockage lithium pour entreprises et sites isolés.',
                'description' => 'Dimensionnement sur mesure, onduleurs hybrides de pointe, batteries LiFePO4 longue durée et supervision connectée en temps réel.',
                'features' => ['Réduction jusqu\'à 75% des factures CIE', 'Batteries Lithium garantie 10 ans', 'Zéro coupure de courant'],
                'icon' => 'sun',
                'display_order' => 1,
                'is_active' => true,
            ],
            [
                'category_id' => $energie?->id,
                'title' => 'Éclairage public solaire autonome',
                'slug' => 'eclairage-public-solaire-autonome',
                'summary' => 'Lampadaires solaires tout-en-un haute intensité pour voiries, communes, lotissements et sites industriels.',
                'description' => 'Lampadaires solaires intelligents avec capteurs crépusculaires et de mouvement, batterie intégrée et LED haute luminosité.',
                'features' => ['Autonomie de 3 nuits consécutives', 'Résistance aux intempéries IP67', 'Installation rapide sans câblage'],
                'icon' => 'lamp',
                'display_order' => 2,
                'is_active' => true,
            ],

            // AGRO
            [
                'category_id' => $agro?->id,
                'title' => 'Irrigation goutte-à-goutte connectée',
                'slug' => 'irrigation-goutte-a-goutte-connectee',
                'summary' => 'Réseaux d\'irrigation de précision pilotés par capteurs d\'humidité pour exploitations maraîchères et plantations.',
                'description' => 'Optimisation de la ressource en eau, fertigation dosée, gain de rendement agricole supérieur à 40% et pilotage simplifié.',
                'features' => ['Économie de 60% d\'eau', 'Gain de productivité agricole', 'Distribution homogène des nutriments'],
                'icon' => 'sprout',
                'display_order' => 1,
                'is_active' => true,
            ],

            // BTP
            [
                'category_id' => $btp?->id,
                'title' => 'Ouvrages de génie civil et BTP écologique',
                'slug' => 'ouvrages-genie-civil-btp-ecologique',
                'summary' => 'Construction de structures durables, plateformes logistiques, voiries et terrassement avec approche bas-carbone.',
                'description' => 'Ingénierie structurelle, fondations spéciales, voiries et réseaux divers (VRD), aménagement paysager et constructions éco-conçues.',
                'features' => ['Respect des normes EUROCODES / DTU', 'Suivi de chantier rigoureux', 'Matériaux certifiés durables'],
                'icon' => 'building-2',
                'display_order' => 1,
                'is_active' => true,
            ],
        ];

        foreach ($services as $service) {
            if ($service['category_id']) {
                Service::firstOrCreate(['slug' => $service['slug']], $service);
            }
        }
    }
}
