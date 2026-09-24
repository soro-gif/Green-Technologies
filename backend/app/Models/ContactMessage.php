<?php

namespace App\Models;

use App\Enums\MessageStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ContactMessage extends Model
{
    use HasFactory;

    protected $fillable = [
        'full_name',
        'email',
        'phone',
        'subject',
        'message',
        'status',
        'ip_address',
        'reply_notes',
        'replied_at',
    ];

    protected function casts(): array
    {
        return [
            'status' => MessageStatus::class,
            'replied_at' => 'datetime',
        ];
    }

    public function scopeUnread(Builder $query): Builder
    {
        return $query->where('status', MessageStatus::Unread);
    }
}
