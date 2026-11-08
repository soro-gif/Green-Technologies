<?php

namespace App\Http\Requests\Recruitment;

use App\Models\JobApplication;
use Illuminate\Foundation\Http\FormRequest;

class StoreJobApplicationRequest extends FormRequest
{
    public const EXPERIENCE_LEVELS = JobApplication::EXPERIENCE_LEVELS;

    public function authorize(): bool
    {
        return true; // Candidature publique
    }

    public function rules(): array
    {
        $document = ['file', 'mimes:pdf,doc,docx', 'max:5120'];

        return [
            'full_name' => ['required', 'string', 'max:150'],
            'email' => ['required', 'string', 'email:rfc', 'max:150'],
            'phone' => ['required', 'string', 'max:50'],
            'city' => ['nullable', 'string', 'max:100'],
            'position' => ['required', 'string', 'max:150'],
            'experience' => ['nullable', 'string', 'in:' . implode(',', array_keys(self::EXPERIENCE_LEVELS))],
            'linkedin' => ['nullable', 'url:https', 'max:255'],
            'cv' => ['required', ...$document],
            'cover_letter' => ['nullable', ...$document],
            'message' => ['nullable', 'string', 'max:4000'],
            'consent' => ['accepted'],
        ];
    }

    public function messages(): array
    {
        return [
            'full_name.required' => 'Indiquez vos nom et prénoms.',
            'email.required' => 'Indiquez votre adresse e-mail.',
            'email.email' => 'Adresse e-mail invalide.',
            'phone.required' => 'Indiquez votre numéro de téléphone.',
            'position.required' => 'Indiquez le poste ou le domaine visé.',
            'experience.in' => 'Niveau d\'expérience invalide.',
            'linkedin.url' => 'Le lien LinkedIn doit commencer par https://',
            'cv.required' => 'Joignez votre CV.',
            'cv.mimes' => 'Le CV doit être au format PDF ou Word.',
            'cv.max' => 'Le CV ne doit pas dépasser 5 Mo.',
            'cover_letter.mimes' => 'La lettre de motivation doit être au format PDF ou Word.',
            'cover_letter.max' => 'La lettre de motivation ne doit pas dépasser 5 Mo.',
            'message.max' => 'Votre message ne doit pas dépasser 4000 caractères.',
            'consent.accepted' => 'Vous devez accepter la conservation de vos données pour envoyer votre candidature.',
        ];
    }
}
