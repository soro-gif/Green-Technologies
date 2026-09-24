<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

class EnsureUserHasPermission
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next, string $permission): Response
    {
        $user = $request->user();

        if (!$user || !$user->is_active) {
            throw new AccessDeniedHttpException('Compte inactif ou non autorisé.');
        }

        if (!$user->hasPermission($permission)) {
            throw new AccessDeniedHttpException("Accès refusé : permission requise ($permission).");
        }

        return $next($request);
    }
}
