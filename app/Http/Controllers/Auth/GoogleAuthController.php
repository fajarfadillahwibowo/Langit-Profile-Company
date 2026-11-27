<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\LangitLens\CustomerFaceProfileService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class GoogleAuthController extends Controller
{
    public function redirect(Request $request): RedirectResponse|\Symfony\Component\HttpFoundation\RedirectResponse
    {
        $clientId = trim((string) config('services.google.client_id'));
        $clientSecret = trim((string) config('services.google.client_secret'));

        if ($clientId === '' || $clientSecret === '') {
            return back()->with(
                'error',
                'Kredensial Google OAuth (GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET) belum diisi di file .env. Silakan isi terlebih dahulu atau gunakan Username & Email.'
            );
        }

        $mode = $request->query('mode') === 'register' ? 'register' : 'login';
        $request->session()->put('google_auth_mode', $mode);

        return Socialite::driver('google')
            ->with(['prompt' => 'select_account'])
            ->redirect();
    }

    public function callback(Request $request): RedirectResponse
    {
        $mode = $request->session()->pull('google_auth_mode', 'login');
        $fallbackRoute = $mode === 'register' ? 'register' : 'login';

        $clientId = trim((string) config('services.google.client_id'));
        $clientSecret = trim((string) config('services.google.client_secret'));

        if ($clientId === '' || $clientSecret === '') {
            return redirect()->route($fallbackRoute)->with(
                'error',
                'Kredensial Google OAuth belum dikonfigurasi di file .env.'
            );
        }

        try {
            $driver = Socialite::driver('google');
            if (app()->environment('local')) {
                $driver->setHttpClient(new \GuzzleHttp\Client(['verify' => false]));
            }

            try {
                $googleUser = $driver->user();
            } catch (\Throwable) {
                $googleUser = $driver->stateless()->user();
            }
        } catch (\Throwable) {
            return redirect()->route($fallbackRoute)->with(
                'error',
                'Proses autentikasi dengan Google dibatalkan atau gagal. Silakan coba lagi.'
            );
        }

        $googleEmail = strtolower(trim((string) $googleUser->getEmail()));
        $googleId = (string) $googleUser->getId();

        if ($googleEmail === '') {
            return redirect()->route($fallbackRoute)->with(
                'error',
                'Akun Google Anda tidak menyertakan alamat email yang valid.'
            );
        }

        $user = User::where('google_id', $googleId)
            ->orWhere('email', $googleEmail)
            ->first();

        // ATURAN KETAT HALAMAN MASUK (/login): hanya akun yang sudah terdaftar yang boleh masuk
        if ($mode === 'login') {
            if (! $user) {
                return redirect()->route('register')->with(
                    'error',
                    "Akun Google ({$googleEmail}) belum terdaftar. Silakan daftar akun terlebih dahulu."
                );
            }

            $updates = [
                'last_login_at' => now(),
                'last_login_ip' => $request->ip(),
            ];
            if (! $user->google_id) {
                $updates['google_id'] = $googleId;
            }
            if (! $user->avatar && $googleUser->getAvatar()) {
                $updates['avatar'] = $googleUser->getAvatar();
            }
            $user->update($updates);

            Auth::login($user, true);
            $request->session()->regenerate();

            if ($user->role === 'client') {
                return redirect()->intended(route('client.gallery'));
            }

            if (in_array($user->role, ['admin', 'superadmin'], true)) {
                return redirect()->intended(route('admin.dashboard'));
            }

            $target = app(CustomerFaceProfileService::class)->hasPermanentScan($user)
                ? route('scan.photos')
                : route('scan.index');

            return redirect()->intended($target);
        }

        // ATURAN KETAT HALAMAN DAFTAR (/register): hanya untuk akun baru, lalu otomatis masuk ke portal
        if ($user) {
            return redirect()->route('login')->with(
                'error',
                "Akun Google ({$googleEmail}) sudah terdaftar. Silakan masuk melalui halaman Masuk."
            );
        }

        $baseUsername = Str::slug(str_replace(['.', '-'], ' ', Str::before($googleEmail, '@')), '_');
        if ($baseUsername === '') {
            $baseUsername = 'pelanggan';
        }

        $uniqueUsername = $baseUsername;
        $counter = 1;
        while (User::where('username', $uniqueUsername)->exists()) {
            $uniqueUsername = "{$baseUsername}_{$counter}";
            $counter++;
        }

        $user = User::create([
            'name' => trim((string) $googleUser->getName()) ?: $uniqueUsername,
            'username' => $uniqueUsername,
            'email' => $googleEmail,
            'email_verified_at' => now(),
            'google_id' => $googleId,
            'avatar' => $googleUser->getAvatar(),
            'role' => 'customer',
            'free_photo_quota' => 1,
            'last_login_at' => now(),
            'last_login_ip' => $request->ip(),
            'password' => Hash::make(Str::random(24)),
        ]);

        Auth::login($user, true);
        $request->session()->regenerate();

        return redirect()->route('scan.index')
            ->with('success', 'Pendaftaran dengan akun Google berhasil! Silakan scan wajah Anda untuk mencari foto.');
    }
}
