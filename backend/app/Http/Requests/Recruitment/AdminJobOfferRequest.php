<?php

namespace App\Http\Requests\Recruitment;

use App\Enums\ContractType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Création ou modification d'une offre d'emploi depuis l'administration.
 */
class AdminJobOfferRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Contrôlé par la policy dans le contrôleur
    }

    public function rules(): array
    {
        $creating = $this->route('offer') === null;
        $required = $creating ? 'required' : 'sometimes';

        return [
            'title' => [$required, 'string', 'max:150'],
            'department' => ['nullable', 'string', 'max:100'],
            'location' => [$required, 'string', 'max:100'],
            'contract_type' => [$required, Rule::enum(ContractType::class)],
            'summary' => [$required, 'string', 'max:300'],
            'description' => [$required, 'string', 'max:10000'],
            'requirements' => ['nullable', 'string', 'max:10000'],
            // Une date passée est refusée à la création ; une offre existante peut garder la sienne
            'deadline' => array_values(array_filter(['nullable', 'date', $creating ? 'after_or_equal:today' : null])),
            'is_published' => ['sometimes', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => 'Indiquez l\'intitulé du poste.',
            'location.required' => 'Indiquez le lieu de travail.',
            'contract_type.required' => 'Choisissez le type de contrat.',
            'contract_type.enum' => 'Type de contrat invalide.',
            'summary.required' => 'Rédigez un résumé de l\'offre.',
            'summary.max' => 'Le résumé ne doit pas dépasser 300 caractères.',
            'description.required' => 'Décrivez les missions du poste.',
            'deadline.date' => 'Date limite invalide.',
            'deadline.after_or_equal' => 'La date limite ne peut pas être déjà passée.',
        ];
    }
}
