<?php

namespace App\Http\Requests\Quote;

use App\Enums\QuoteStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateQuoteStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasPermission('quotes.manage') ?? false;
    }

    public function rules(): array
    {
        return [
            'status' => ['required', Rule::enum(QuoteStatus::class)],
            'admin_notes' => ['nullable', 'string', 'max:2000'],
            'contacted' => ['nullable', 'boolean'],
        ];
    }
}
