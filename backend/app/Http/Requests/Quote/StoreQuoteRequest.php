<?php

namespace App\Http\Requests\Quote;

use Illuminate\Foundation\Http\FormRequest;

class StoreQuoteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Public submission allowed
    }

    public function rules(): array
    {
        return [
            'category_id' => ['nullable', 'integer', 'exists:categories,id'],
            'service_id' => ['nullable', 'integer', 'exists:services,id'],
            'full_name' => ['required', 'string', 'max:150'],
            'company' => ['nullable', 'string', 'max:150'],
            'email' => ['required', 'string', 'email:rfc', 'max:150'],
            'phone' => ['required', 'string', 'max:50'],
            'city' => ['required', 'string', 'max:100'],
            'service_type' => ['nullable', 'string', 'max:150'],
            'estimated_budget' => ['nullable', 'numeric', 'min:0'],
            'details' => ['nullable', 'string', 'max:3000'],
        ];
    }

    public function messages(): array
    {
        return [
            'full_name.required' => 'Veuillez renseigner votre nom complet.',
            'full_name.max' => 'Le nom ne peut pas dépasser 150 caractères.',
            'email.required' => 'Veuillez indiquer une adresse email de contact.',
            'email.email' => 'Veuillez renseigner une adresse email valide.',
            'email.max' => 'L\'adresse email ne peut pas dépasser 150 caractères.',
            'phone.required' => 'Veuillez indiquer un numéro de téléphone pour vous joindre.',
            'phone.max' => 'Le numéro de téléphone ne peut pas dépasser 50 caractères.',
            'city.required' => 'Veuillez préciser la ville ou la localisation du projet.',
            'city.max' => 'La ville ne peut pas dépasser 100 caractères.',
            'category_id.exists' => 'Le pôle sélectionné est invalide.',
            'service_id.exists' => 'La prestation sélectionnée est invalide.',
            'estimated_budget.numeric' => 'Le budget estimé doit être un montant numérique.',
            'estimated_budget.min' => 'Le budget estimé ne peut pas être négatif.',
            'details.max' => 'Les détails du projet ne peuvent pas dépasser 3000 caractères.',
        ];
    }
}
