<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Inertia\Inertia;

class LoginController extends Controller
{
    /**
     * Tampilan Halaman Login Tunggal (Admin & Pelanggan)
     */
    public function showLogin()
    {
        if (Auth::check()) {
            $user = Auth::user();
            if ($user->role === 'client') {
                return redirect()->route('client.gallery');
            }
            if ($user->role === 'customer') {
                return redirect()->route('scan.index');
            }

            return redirect()->route('admin.dashboard');
        }

        return Inertia::render('Auth/Login');
    }

    /**
     * Proses Login Terpadu (Admin & Pelanggan) dengan Proteksi Brute-Force (Max 5x / menit)
     */
    public function login(Request $request)
    {
        $validated = $request->validate([
            'login' => 'required|string',
            'password' => 'required|string',
        ], [
            'login.required' => 'Nama pengguna atau email wajib diisi.',
            'password.required' => 'Kata sandi wajib diisi.',
        ]);

        $loginInput = trim($validated['login']);
        $password = $validated['password'];
        $throttleKey = 'login:'.Str::lower($loginInput).'|'.$request->ip();

        if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
            $seconds = RateLimiter::availableIn($throttleKey);

            return back()->withErrors([
                'login' => "Terlalu banyak percobaan masuk. Silakan coba lagi dalam {$seconds} detik.",
            ]);
        }

        $user = User::where('username', $loginInput)
            ->orWhere('email', $loginInput)
            ->first();

        if ($user && Hash::check($password, $user->password)) {
            RateLimiter::clear($throttleKey);

            $user->forceFill([
                'last_login_at' => now(),
                'last_login_ip' => $request->ip(),
            ])->save();

            Auth::login($user, $request->boolean('remember'));
            $request->session()->regenerate();

            if ($user->role === 'client') {
                return redirect()->intended(route('client.gallery'));
            }

            if ($user->role === 'customer') {
                return redirect()->intended(route('scan.index'));
            }

            return redirect()->intended(route('admin.dashboard'));
        }

        RateLimiter::hit($throttleKey, 60);
        $remaining = RateLimiter::remaining($throttleKey, 5);

        return back()->withErrors([
            'login' => $remaining > 0
                ? "Nama pengguna, email, atau kata sandi tidak sesuai. Sisa percobaan: {$remaining}x."
                : 'Terlalu banyak percobaan masuk gagal. Silakan tunggu 60 detik sebelum mencoba lagi.',
        ]);
    }

    /**
     * Logout Terpadu
     */
    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login');
    }
}
