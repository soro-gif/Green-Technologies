<?php

namespace App\Http\Requests\Contact;

use Illuminate\Foundation\Http\FormRequest;

class StoreContactMessageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Public submission
    }

    public function rules(): array
    {
        return [
            'full_name' => ['required', 'string', 'max:150'],
            'email' => ['required', 'string', 'email:rfc', 'max:150'],
            'phone' => ['nullable', 'string', 'max:50'],
            'subject' => ['required', 'string', 'max:200'],
            'message' => ['required', 'string', 'max:5000'],
        ];
    }

    public function messages(): array
    {
        return [
            'full_name.required' => 'Veuillez renseigner votre nom complet.',
            'full_name.max' => 'Le nom ne peut pas dépasser 150 caractères.',
            'email.required' => 'Veuillez saisir votre adresse email.',
            'email.email' => 'Veuillez saisir une adresse email valide.',
            'email.max' => 'L\'adresse email ne peut pas dépasser 150 caractères.',
            'phone.max' => 'Le numéro de téléphone ne peut pas dépasser 50 caractères.',
            'subject.required' => 'Veuillez indiquer l\'objet de votre message.',
            'subject.max' => 'L\'objet ne peut pas dépasser 200 caractères.',
            'message.required' => 'Veuillez rédiger votre message.',
            'message.max' => 'Votre message ne peut pas dépasser 5000 caractères.',
        ];
    }
}
