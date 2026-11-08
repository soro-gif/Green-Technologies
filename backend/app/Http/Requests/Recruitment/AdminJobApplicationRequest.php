<?php

namespace App\Http\Requests\Recruitment;

use App\Enums\ApplicationStatus;
use App\Models\JobApplication;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Ajout ou modification d'une candidature depuis l'admin (candidature reçue
 * par e-mail, sur papier, en salon…). CV facultatif : fichier ou lien.
 */
class AdminJobApplicationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Contrôlé par la policy dans le contrôleur
    }

    public function rules(): array
    {
        // La mise à jour passe aussi en POST (multipart, pour les fichiers) : on distingue
        // l'ajout de la modification par la présence de la candidature dans l'URL.
        $creating = $this->route('application') === null;
        $required = $creating ? 'required' : 'sometimes';
        $document = ['nullable', 'file', 'mimes:pdf,doc,docx', 'max:5120'];

        return [
            'full_name' => [$required, 'string', 'max:150'],
            'email' => [$required, 'string', 'email:rfc', 'max:150'],
            'phone' => [$required, 'string', 'max:50'],
            'city' => ['nullable', 'string', 'max:100'],
            'position' => [$required, 'string', 'max:150'],
            'job_offer_id' => ['nullable', 'integer', 'exists:job_offers,id'],
            'experience' => ['nullable', 'string', Rule::in(array_keys(JobApplication::EXPERIENCE_LEVELS))],
            'linkedin' => ['nullable', 'url', 'max:255'],
            'cv' => $document,
            'cover_letter' => $document,
            'cv_url' => ['nullable', 'url', 'max:2000'],
            'cover_letter_url' => ['nullable', 'url', 'max:2000'],
            'message' => ['nullable', 'string', 'max:4000'],
            'status' => ['sometimes', Rule::enum(ApplicationStatus::class)],
            'notes' => ['nullable', 'string', 'max:4000'],
        ];
    }

    public function messages(): array
    {
        return [
            'full_name.required' => 'Indiquez les nom et prénoms du candidat.',
            'email.required' => 'Indiquez l\'adresse e-mail du candidat.',
            'email.email' => 'Adresse e-mail invalide.',
            'phone.required' => 'Indiquez le téléphone du candidat.',
            'position.required' => 'Indiquez le poste ou le domaine visé.',
            'cv.mimes' => 'Le CV doit être au format PDF ou Word.',
            'cv.max' => 'Le CV ne doit pas dépasser 5 Mo.',
            'cover_letter.mimes' => 'La lettre doit être au format PDF ou Word.',
            'cover_letter.max' => 'La lettre ne doit pas dépasser 5 Mo.',
            'cv_url.url' => 'Le lien du CV doit être une adresse web valide.',
            'linkedin.url' => 'Le lien LinkedIn doit être une adresse web valide.',
        ];
    }
}
