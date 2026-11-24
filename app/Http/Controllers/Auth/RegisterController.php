<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class RegisterController extends Controller
{
    public const OTP_RESEND_COOLDOWN_SECONDS = 60;

    public const OTP_MAX_ATTEMPTS = 5;

    public function showRegister(Request $request): Response|RedirectResponse
    {
        if ($user = $request->user()) {
            if ($user->role === 'client') {
                return redirect()->route('client.gallery');
            }
            if ($user->role === 'customer') {
                return redirect()->route('scan.index');
            }

            return redirect()->route('admin.dashboard');
        }

        return Inertia::render('Auth/Register');
    }

    public function register(Request $request): RedirectResponse
    {
        $emailRule = app()->runningUnitTests() ? 'email:rfc' : 'email:rfc,dns';

        $data = $request->validate([
            'username' => ['required', 'string', 'max:100', 'alpha_dash', 'unique:users,username'],
            'email' => ['required', $emailRule, 'max:150', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'regex:/[a-zA-Z]/', 'regex:/[0-9]/', 'confirmed'],
            'name' => ['nullable', 'string', 'max:150'],
        ], [
            'username.required' => 'Username wajib diisi.',
            'username.alpha_dash' => 'Username hanya boleh huruf, angka, tanda hubung (-), atau garis bawah (_).',
            'username.unique' => 'Username sudah dipakai, silakan pilih username lain.',
            'email.required' => 'Email aktif wajib diisi.',
            'email.email' => 'Format email tidak valid atau domain email tidak aktif.',
            'email.unique' => 'Email ini sudah terdaftar.',
            'password.required' => 'Password wajib diisi.',
            'password.min' => 'Peringatan: Password minimal harus 8 karakter.',
            'password.regex' => 'Password harus mengandung kombinasi huruf dan angka agar lebih aman.',
            'password.confirmed' => 'Konfirmasi password tidak cocok.',
        ]);

        $cleanUsername = strtolower(trim($data['username']));
        $cleanEmail = strtolower(trim($data['email']));
        $displayName = trim((string) ($data['name'] ?? '')) ?: $cleanUsername;
        $otp = (string) random_int(100000, 999999);

        $request->session()->put('pending_registration', [
            'name' => $displayName,
            'username' => $cleanUsername,
            'email' => $cleanEmail,
            'password_hash' => Hash::make($data['password']),
            'otp' => $otp,
            'attempts' => 0,
            'expires_at' => now()->addMinutes(10)->timestamp,
            'resend_available_at' => now()->addSeconds(self::OTP_RESEND_COOLDOWN_SECONDS)->timestamp,
        ]);

        $sent = $this->sendOtpEmail($cleanEmail, $cleanUsername, $otp);

        return redirect()->route('register.otp')->with(
            'success',
            $sent
                ? "Kode OTP 6 digit telah dikirim ke {$cleanEmail}. Silakan cek kotak masuk atau folder Spam Anda."
                : "Kode OTP telah dibuat untuk {$cleanEmail}."
        );
    }

    public function showVerifyOtp(Request $request): Response|RedirectResponse
    {
        $pending = $request->session()->get('pending_registration');
        if (! is_array($pending) || empty($pending['email'])) {
            return redirect()->route('register')
                ->with('error', 'Silakan isi formulir pendaftaran terlebih dahulu.');
        }

        $mailPasswordConfigured = trim((string) config('mail.mailers.smtp.password')) !== '';
        $cooldownRemaining = max(0, (int) ($pending['resend_available_at'] ?? 0) - now()->timestamp);

        return Inertia::render('Auth/VerifyOtp', [
            'email' => $pending['email'],
            'username' => $pending['username'],
            'smtpReady' => $mailPasswordConfigured,
            'resendCooldownSeconds' => $cooldownRemaining,
            'fallbackOtp' => (! $mailPasswordConfigured && app()->environment('local')) ? $pending['otp'] : null,
        ]);
    }

    public function verifyOtp(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'otp' => ['required', 'string', 'size:6'],
        ], [
            'otp.required' => 'Kode OTP 6 digit wajib diisi.',
            'otp.size' => 'Kode OTP harus terdiri dari 6 angka.',
        ]);

        $pending = $request->session()->get('pending_registration');
        if (! is_array($pending) || empty($pending['email'])) {
            return redirect()->route('register')
                ->with('error', 'Sesi pendaftaran telah berakhir. Silakan daftar kembali.');
        }

        if (empty($pending['otp']) || now()->timestamp > (int) ($pending['expires_at'] ?? 0)) {
            return back()->withErrors([
                'otp' => 'Kode OTP sudah kedaluwarsa atau hangus. Silakan klik Kirim Ulang Kode OTP.',
            ]);
        }

        if (trim($validated['otp']) !== (string) $pending['otp']) {
            $attempts = (int) ($pending['attempts'] ?? 0) + 1;
            $pending['attempts'] = $attempts;

            if ($attempts >= self::OTP_MAX_ATTEMPTS) {
                $pending['otp'] = null;
                $request->session()->put('pending_registration', $pending);

                return back()->withErrors([
                    'otp' => 'Kode OTP salah sebanyak 5 kali dan otomatis hangus demi keamanan. Silakan klik Kirim Ulang Kode OTP.',
                ]);
            }

            $request->session()->put('pending_registration', $pending);
            $left = self::OTP_MAX_ATTEMPTS - $attempts;

            return back()->withErrors([
                'otp' => "Kode OTP tidak sesuai. Sisa percobaan: {$left}x.",
            ]);
        }

        if (User::where('username', $pending['username'])->orWhere('email', $pending['email'])->exists()) {
            $request->session()->forget('pending_registration');

            return redirect()->route('login')
                ->with('success', 'Akun sudah terdaftar, silakan masuk.');
        }

        $user = User::create([
            'name' => $pending['name'],
            'username' => $pending['username'],
            'email' => $pending['email'],
            'email_verified_at' => now(),
            'role' => 'customer',
            'free_photo_quota' => 1,
            'last_login_at' => now(),
            'last_login_ip' => $request->ip(),
            'password' => $pending['password_hash'],
        ]);

        $request->session()->forget('pending_registration');

        Auth::login($user);
        $request->session()->regenerate();

        return redirect()->route('scan.index')
            ->with('success', 'Verifikasi OTP berhasil! Akun Anda sudah aktif, silakan scan wajah untuk mencari foto.');
    }

    public function resendOtp(Request $request): RedirectResponse
    {
        $pending = $request->session()->get('pending_registration');
        if (! is_array($pending) || empty($pending['email'])) {
            return redirect()->route('register');
        }

        $remaining = (int) ($pending['resend_available_at'] ?? 0) - now()->timestamp;
        if ($remaining > 0) {
            return back()->with('error', "Tunggu {$remaining} detik sebelum meminta kode OTP baru.");
        }

        $otp = (string) random_int(100000, 999999);
        $pending['otp'] = $otp;
        $pending['attempts'] = 0;
        $pending['expires_at'] = now()->addMinutes(10)->timestamp;
        $pending['resend_available_at'] = now()->addSeconds(self::OTP_RESEND_COOLDOWN_SECONDS)->timestamp;
        $request->session()->put('pending_registration', $pending);

        $sent = $this->sendOtpEmail($pending['email'], $pending['username'], $otp);

        return back()->with(
            'success',
            $sent
                ? "Kode OTP baru telah dikirim ulang ke {$pending['email']}."
                : 'Kode OTP baru berhasil dibuat.'
        );
    }

    private function sendOtpEmail(string $toEmail, string $username, string $otp): bool
    {
        $html = "
            <div style=\"font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; background: #090D16; color: #f8fafc; border-radius: 16px;\">
                <h2 style=\"margin: 0 0 8px; color: #38bdf8;\">Langit Studio — Verifikasi Akun</h2>
                <p style=\"font-size: 14px; color: #cbd5e1; line-height: 1.6;\">
                    Halo <strong>{$username}</strong>,<br>
                    Gunakan kode OTP 6 digit berikut untuk mengaktifkan akun Anda:
                </p>
                <div style=\"margin: 20px 0; padding: 16px; background: #111827; border: 1px solid #0284c7; border-radius: 12px; text-align: center;\">
                    <span style=\"font-size: 28px; font-weight: bold; letter-spacing: 8px; color: #38bdf8;\">{$otp}</span>
                </div>
                <p style=\"font-size: 12px; color: #94a3b8;\">
                    Kode ini berlaku selama 10 menit. Jangan berikan kode ini kepada siapa pun.
                </p>
            </div>
        ";

        try {
            if (trim((string) config('mail.mailers.smtp.password')) === '' && ! app()->runningUnitTests()) {
                Log::info("Langit OTP for {$toEmail}: {$otp}");

                return false;
            }

            Mail::html($html, function ($message) use ($toEmail) {
                $message->to($toEmail)
                    ->subject('Kode OTP Verifikasi Akun — Langit Studio');
            });

            return true;
        } catch (\Throwable $e) {
            Log::warning('Gagal mengirim email OTP: '.$e->getMessage());

            return false;
        }
    }
}
