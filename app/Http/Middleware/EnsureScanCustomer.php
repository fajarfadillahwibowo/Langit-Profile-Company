<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureScanCustomer
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user) {
            return redirect()->route('login');
        }

        if ($user->role === 'customer') {
            return $next($request);
        }

        if ($user->role === 'client') {
            return redirect()->route('client.gallery');
        }

        if (in_array($user->role, ['admin', 'superadmin'], true)) {
            return redirect()->route('admin.dashboard');
        }

        abort(403, 'Akses ditolak.');
    }
}
