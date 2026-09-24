<?php

namespace App\Models;

use App\Enums\Permission;
use App\Enums\UserRole;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'is_active',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'role' => UserRole::class,
            'is_active' => 'boolean',
        ];
    }

    /**
     * Determine if the user has a specific role.
     */
    public function hasRole(UserRole|string $role): bool
    {
        $roleValue = is_string($role) ? $role : $role->value;
        return $this->role->value === $roleValue;
    }

    /**
     * Determine if the user has a specific permission based on role.
     */
    public function hasPermission(Permission|string $permission): bool
    {
        if (!$this->is_active) {
            return false;
        }

        $permissionValue = is_string($permission) ? $permission : $permission->value;

        // SuperAdmin has all permissions
        if ($this->role === UserRole::SuperAdmin) {
            return true;
        }

        // Admin has operational management permissions
        if ($this->role === UserRole::Admin) {
            return in_array($permissionValue, [
                Permission::ServicesManage->value,
                Permission::ProjectsManage->value,
                Permission::QuotesManage->value,
                Permission::MessagesManage->value,
                Permission::ArticlesManage->value,
            ], true);
        }

        // Editor has content management permissions
        if ($this->role === UserRole::Editor) {
            return in_array($permissionValue, [
                Permission::ProjectsManage->value,
                Permission::ArticlesManage->value,
            ], true);
        }

        return false;
    }

    /**
     * Get all computed permissions for this user.
     *
     * @return string[]
     */
    public function getPermissionsList(): array
    {
        return array_values(array_filter(
            array_map(fn (Permission $p) => $p->value, Permission::cases()),
            fn (string $permission) => $this->hasPermission($permission)
        ));
    }

    /**
     * Articles authored by this user.
     */
    public function articles(): HasMany
    {
        return $this->hasMany(Article::class);
    }
}
