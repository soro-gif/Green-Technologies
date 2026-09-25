<?php

namespace App\Policies;

use App\Enums\Permission;
use App\Models\Testimonial;
use App\Models\User;

class TestimonialPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission(Permission::ProjectsManage) || $user->hasPermission(Permission::ServicesManage);
    }

    public function view(User $user, Testimonial $testimonial): bool
    {
        return $user->hasPermission(Permission::ProjectsManage) || $user->hasPermission(Permission::ServicesManage);
    }

    public function create(User $user): bool
    {
        return $user->hasPermission(Permission::ProjectsManage) || $user->hasPermission(Permission::ServicesManage);
    }

    public function update(User $user, Testimonial $testimonial): bool
    {
        return $user->hasPermission(Permission::ProjectsManage) || $user->hasPermission(Permission::ServicesManage);
    }

    public function delete(User $user, Testimonial $testimonial): bool
    {
        return $user->hasPermission(Permission::ProjectsManage) || $user->hasPermission(Permission::ServicesManage);
    }
}
