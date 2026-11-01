<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
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
            return redirect()->route('admin.dashboard');
        }

        return Inertia::render('Auth/Login');
    }

    /**
     * Proses Login Terpadu (Admin & Pelanggan)
     * Mengidentifikasi apakah pengguna adalah admin atau pelanggan berdasarkan username/email
     */
    public function login(Request $request)
    {
        $validated = $request->validate([
            'login' => 'required|string',
            'password' => 'required|string',
        ]);

        $loginInput = trim($validated['login']);
        $password = $validated['password'];

        // Cari pengguna berdasarkan username atau email
        $user = User::where('username', $loginInput)
            ->orWhere('email', $loginInput)
            ->first();

        if ($user && Hash::check($password, $user->password)) {
            Auth::login($user, $request->boolean('remember'));
            $request->session()->regenerate();

            // Pelanggan diarahkan ke galeri unduh foto
            if ($user->role === 'client') {
                return redirect()->intended(route('client.gallery'));
            }

            // Administrator diarahkan ke dashboard back-office CMS
            return redirect()->intended(route('admin.dashboard'));
        }

        return back()->withErrors([
            'login' => 'Username, email, atau kata sandi yang Anda masukkan tidak sesuai.',
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
