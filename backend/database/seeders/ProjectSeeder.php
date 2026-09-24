<?php

namespace Database\Seeders;

use App\Enums\ProjectStatus;
use App\Models\Category;
use App\Models\Project;
use App\Models\Service;
use Illuminate\Database\Seeder;

class ProjectSeeder extends Seeder
{
    public function run(): void
    {
        $eau = Category::where('slug', 'eau-hydraulique')->first();
        $energie = Category::where('slug', 'energie-solaire')->first();
        $agro = Category::where('slug', 'agrotechnologies')->first();
        $btp = Category::where('slug', 'btp-genie-civil')->first();

        $forageService = Service::where('slug', 'forages-hydrauliques-pompage-solaire')->first();
        $solaireService = Service::where('slug', 'centrales-solaires-photovoltaiques-hybrides')->first();
        $irrigationService = Service::where('slug', 'irrigation-goutte-a-goutte-connectee')->first();
        $btpService = Service::where('slug', 'ouvrages-genie-civil-btp-ecologique')->first();

        $projects = [
            [
                'category_id' => $eau?->id,
                'service_id' => $forageService?->id,
                'title' => 'Système d\'Adduction d\'Eau Potable & Forage Solaire',
                'slug' => 'systeme-adduction-eau-potable-forage-solaire-bouake',
                'client_name' => 'Communauté Villageoise & Coopérative',
                'location' => 'Région de Bouaké',
                'completion_date' => '2025-11-15',
                'summary' => 'Forage à 95m de profondeur avec château d\'eau métallique de 25m³ et 8 bornes fontaines connectées.',
                'description' => 'Fourniture en eau potable saine pour plus de 4 500 habitants grâce à une pompe solaire Lorentz sans aucun coût de carburant récurrent.',
                'image' => 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=800',
                'highlights' => ['Débit garanti de 12 m³/h', 'Château d\'eau 25 m³ à 12m de hauteur', 'Alimentation 100% solaire'],
                'budget_indicative' => 28500000,
                'status' => ProjectStatus::Published,
                'is_featured' => true,
                'display_order' => 1,
            ],
            [
                'category_id' => $energie?->id,
                'service_id' => $solaireService?->id,
                'title' => 'Centrale Photovoltaïque Hybride Industrielle 120 kWc',
                'slug' => 'centrale-photovoltaique-hybride-industrielle-korhogo',
                'client_name' => 'Complexe Agro-industriel du Nord',
                'location' => 'Korhogo',
                'completion_date' => '2026-02-20',
                'summary' => 'Autonomie énergétique diurne et réduction drastique de l\'utilisation des groupes électrogènes diesel.',
                'description' => 'Installation de 260 panneaux solaires haute performance couplés à un parc batterie lithium de 200 kWh et onduleurs synchronisés au réseau.',
                'image' => 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800',
                'highlights' => ['Puissance crête : 120 kWc', 'Économie annuelle de 18 millions FCFA', 'Supervision cloud 24/7'],
                'budget_indicative' => 65000000,
                'status' => ProjectStatus::Published,
                'is_featured' => true,
                'display_order' => 2,
            ],
            [
                'category_id' => $agro?->id,
                'service_id' => $irrigationService?->id,
                'title' => 'Aménagement Hydro-Agricole & Irrigation Goutte-à-Goutte (30 Ha)',
                'slug' => 'amenagement-hydro-agricole-irrigation-yamoussoukro',
                'client_name' => 'Ferme Maraîchère & Exportation',
                'location' => 'Yamoussoukro',
                'completion_date' => '2026-05-10',
                'summary' => 'Système d\'irrigation automatisé par secteurs avec station de pompage solaire et fertigation intégrée.',
                'description' => 'Distribution d\'eau ultra-précise permettant 3 cycles de récolte par an sans dépendre de la saison des pluies.',
                'image' => 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=800',
                'highlights' => ['30 hectares équipés', 'Économie de 55% d\'eau', 'Rendement maraîcher multiplié par 2.2'],
                'budget_indicative' => 42000000,
                'status' => ProjectStatus::Published,
                'is_featured' => true,
                'display_order' => 3,
            ],
            [
                'category_id' => $btp?->id,
                'service_id' => $btpService?->id,
                'title' => 'Plateforme Logistique & Bâtiment Bas-Carbone',
                'slug' => 'plateforme-logistique-batiment-bas-carbone-abidjan',
                'client_name' => 'Groupe Logistique International',
                'location' => 'Zone Industrielle Yopougon, Abidjan',
                'completion_date' => '2026-07-30',
                'summary' => 'Construction d\'un entrepôt de 3 500 m² avec dallage industriel haute résistance et toiture solaire intégrée.',
                'description' => 'Génie civil complet, voiries poids lourds VRD, récupération des eaux pluviales et isolation thermique performante.',
                'image' => 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800',
                'highlights' => ['Superficie couverte : 3 500 m²', 'Dallage 5T/m²', 'Certifié éco-responsable'],
                'budget_indicative' => 180000000,
                'status' => ProjectStatus::Published,
                'is_featured' => false,
                'display_order' => 4,
            ],
        ];

        foreach ($projects as $proj) {
            if ($proj['category_id']) {
                Project::updateOrCreate(['slug' => $proj['slug']], $proj);
            }
        }
    }
}
