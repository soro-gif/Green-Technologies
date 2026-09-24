<?php

namespace Database\Factories;

use App\Enums\MessageStatus;
use App\Models\ContactMessage;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ContactMessage>
 */
class ContactMessageFactory extends Factory
{
    protected $model = ContactMessage::class;

    public function definition(): array
    {
        return [
            'full_name' => fake()->name(),
            'email' => fake()->safeEmail(),
            'phone' => fake()->phoneNumber(),
            'subject' => fake()->sentence(4),
            'message' => fake()->paragraph(3),
            'status' => MessageStatus::Unread,
            'ip_address' => fake()->ipv4(),
            'reply_notes' => null,
            'replied_at' => null,
        ];
    }
}
