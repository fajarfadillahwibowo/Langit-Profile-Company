<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdmin
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || ! in_array($user->role, ['admin', 'superadmin'], true)) {
            if ($request->expectsJson() || $request->is('api/*') || ! $request->isMethod('GET')) {
                abort(403, 'Akses ditolak: Akun Anda tidak memiliki hak akses administrator.');
            }

            if ($user && $user->role === 'client') {
                return redirect()->route('client.gallery');
            }

            return redirect()->route('login');
        }

        return $next($request);
    }
}
