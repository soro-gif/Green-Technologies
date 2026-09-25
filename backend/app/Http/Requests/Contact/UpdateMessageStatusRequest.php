<?php

namespace App\Http\Requests\Contact;

use App\Enums\MessageStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateMessageStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasPermission('messages.manage') ?? false;
    }

    public function rules(): array
    {
        return [
            'status' => ['required', Rule::enum(MessageStatus::class)],
            'reply_notes' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
