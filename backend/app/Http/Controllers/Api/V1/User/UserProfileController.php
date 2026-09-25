<?php

namespace App\Http\Controllers\Api\V1\User;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Resources\UserResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class UserProfileController extends BaseApiController
{
    /**
     * Get the authenticated user's profile.
     */
    public function show(Request $request): JsonResponse
    {
        return $this->success(
            new UserResource($request->user()),
            'Profil utilisateur récupéré avec succès.'
        );
    }

    /**
     * Update the authenticated user's profile.
     * Prevents any privilege escalation (ignores role, is_admin, permissions).
     */
    public function update(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                Rule::unique('users')->ignore($user->id),
            ],
            'current_password' => ['nullable', 'string', 'required_with:new_password'],
            'new_password' => ['nullable', 'string', Password::defaults(), 'confirmed'],
        ]);

        if (!empty($validated['new_password'])) {
            if (!Hash::check($validated['current_password'] ?? '', $user->password)) {
                return $this->error('Le mot de passe actuel est incorrect.', 422, [
                    'current_password' => ['Le mot de passe actuel est incorrect.'],
                ]);
            }
            $user->password = Hash::make($validated['new_password']);
        }

        $user->name = $validated['name'];
        $user->email = strtolower(trim($validated['email']));
        // role is intentionally never updated from user profile endpoint
        $user->save();

        return $this->success(
            new UserResource($user),
            'Votre profil a été mis à jour avec succès.'
        );
    }
}
