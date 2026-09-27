<?php

namespace App\Console\Commands;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

class CreateAdminUser extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'admin:create 
                            {email=admin@greentechnologies.ci : Email de l\'administrateur} 
                            {password=password : Mot de passe}
                            {name=Direction Technique Green Tech : Nom complet}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Créer ou réinitialiser le compte administrateur Green Technologies';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $email = strtolower(trim($this->argument('email')));
        $password = $this->argument('password');
        $name = $this->argument('name');

        $user = User::updateOrCreate(
            ['email' => $email],
            [
                'name' => $name,
                'password' => Hash::make($password),
                'role' => UserRole::SuperAdmin,
                'is_active' => true,
            ]
        );

        $this->info("✅ Compte administrateur prêt !");
        $this->table(
            ['Champ', 'Valeur'],
            [
                ['Nom', $user->name],
                ['Email', $user->email],
                ['Mot de passe', $password],
                ['Rôle', $user->role->value],
                ['Statut', $user->is_active ? 'Actif' : 'Inactif'],
            ]
        );

        return Command::SUCCESS;
    }
}
