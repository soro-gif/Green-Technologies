<?php

namespace App\Notifications;

use App\Models\JobApplication;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Prévient l'équipe recrutement qu'une candidature vient d'arriver par le site.
 */
class NewJobApplication extends Notification
{
    use Queueable;

    public function __construct(public JobApplication $application) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $a = $this->application;
        $url = rtrim((string) config('services.recruitment.admin_url'), '/') . '?id=' . $a->id;

        $mail = (new MailMessage)
            ->subject("Nouvelle candidature : {$a->position} ({$a->full_name})")
            ->greeting('Nouvelle candidature reçue')
            ->line("**{$a->full_name}** postule pour : **{$a->position}**.")
            ->line("E-mail : {$a->email}")
            ->line("Téléphone : {$a->phone}");

        if ($a->city) {
            $mail->line("Ville : {$a->city}");
        }
        if ($label = $a->experienceLabel()) {
            $mail->line("Expérience : {$label}");
        }

        return $mail
            ->action('Voir la candidature', $url)
            ->line('Le CV et la lettre de motivation sont accessibles depuis la fiche.');
    }
}
