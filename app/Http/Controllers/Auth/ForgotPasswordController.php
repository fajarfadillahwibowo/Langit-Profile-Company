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
use Illuminate\Support\Facades\RateLimiter;
use Inertia\Inertia;
use Inertia\Response;

class ForgotPasswordController extends Controller
{
    private const OTP_MAX_ATTEMPTS = 5;
    private const OTP_RESEND_COOLDOWN_SECONDS = 60;

    public function showRequestForm(): Response|RedirectResponse
    {
        if (Auth::check()) {
            $user = Auth::user();
            if ($user->role === 'admin' || $user->is_admin) {
                return redirect()->route('admin.dashboard');
            }

            return redirect()->route('scan.index');
        }

        return Inertia::render('Auth/ForgotPassword');
    }

    public function sendResetOtp(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'string', 'email:rfc', 'max:255'],
        ], [
            'email.required' => 'Alamat email wajib diisi.',
            'email.email' => 'Format alamat email tidak valid.',
        ]);

        $email = strtolower(trim($validated['email']));
        $throttleKey = 'password-reset:'.$email.'|'.$request->ip();

        if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
            $seconds = RateLimiter::availableIn($throttleKey);

            return back()->withErrors([
                'email' => "Terlalu banyak permintaan reset kata sandi. Silakan coba lagi dalam {$seconds} detik.",
            ]);
        }

        RateLimiter::hit($throttleKey, 60);

        $user = User::whereRaw('LOWER(email) = ?', [$email])->first();
        if (! $user) {
            return back()->withErrors([
                'email' => 'Email tersebut tidak terdaftar di sistem Langit. Periksa kembali atau daftar akun baru.',
            ]);
        }

        $otp = (string) random_int(100000, 999999);
        $request->session()->put('password_reset_otp', [
            'user_id' => $user->id,
            'email' => $user->email,
            'name' => $user->name ?: $user->username,
            'otp' => $otp,
            'attempts' => 0,
            'expires_at' => now()->addMinutes(10)->timestamp,
            'resend_available_at' => now()->addSeconds(self::OTP_RESEND_COOLDOWN_SECONDS)->timestamp,
        ]);

        $sent = $this->sendResetEmail($user->email, $user->name ?: $user->username, $otp);

        return redirect()->route('password.reset.form')
            ->with(
                'success',
                $sent
                    ? "Kode OTP reset kata sandi telah dikirim ke {$user->email}. Periksa kotak masuk atau folder spam."
                    : 'Kode OTP reset kata sandi berhasil dibuat. Masukkan kode OTP Anda di bawah ini.'
            );
    }

    public function showResetForm(Request $request): Response|RedirectResponse
    {
        $reset = $request->session()->get('password_reset_otp');
        if (! is_array($reset) || empty($reset['email'])) {
            return redirect()->route('password.request')
                ->with('error', 'Sesi reset kata sandi telah habis. Silakan masukkan email Anda kembali.');
        }

        $resendCooldownSeconds = max(0, (int) ($reset['resend_available_at'] ?? 0) - now()->timestamp);

        return Inertia::render('Auth/ResetPasswordOtp', [
            'email' => $reset['email'],
            'expiresInMinutes' => 10,
            'resendCooldownSeconds' => $resendCooldownSeconds,
            'devOtp' => app()->isLocal() && trim((string) config('mail.mailers.smtp.password')) === ''
                ? ($reset['otp'] ?? null)
                : null,
        ]);
    }

    public function resetPassword(Request $request): RedirectResponse
    {
        $reset = $request->session()->get('password_reset_otp');
        if (! is_array($reset) || empty($reset['user_id'])) {
            return redirect()->route('password.request')
                ->with('error', 'Sesi reset kata sandi sudah kedaluwarsa. Silakan ulangi dari awal.');
        }

        $validated = $request->validate([
            'otp' => ['required', 'digits:6'],
            'password' => ['required', 'string', 'min:8', 'regex:/[a-zA-Z]/', 'regex:/[0-9]/', 'confirmed'],
        ], [
            'otp.required' => 'Kode OTP wajib diisi.',
            'otp.digits' => 'Kode OTP harus berupa 6 digit angka.',
            'password.required' => 'Kata sandi baru wajib diisi.',
            'password.min' => 'Kata sandi minimal 8 karakter.',
            'password.regex' => 'Kata sandi wajib mengandung kombinasi huruf dan angka.',
            'password.confirmed' => 'Konfirmasi kata sandi tidak cocok.',
        ]);

        if (empty($reset['otp']) || now()->timestamp > (int) ($reset['expires_at'] ?? 0)) {
            return back()->withErrors([
                'otp' => 'Kode OTP sudah kedaluwarsa atau hangus. Silakan klik Kirim Ulang Kode OTP.',
            ]);
        }

        if (trim($validated['otp']) !== (string) $reset['otp']) {
            $attempts = (int) ($reset['attempts'] ?? 0) + 1;
            $reset['attempts'] = $attempts;

            if ($attempts >= self::OTP_MAX_ATTEMPTS) {
                $reset['otp'] = null;
                $request->session()->put('password_reset_otp', $reset);

                return back()->withErrors([
                    'otp' => 'Kode OTP salah sebanyak 5 kali dan otomatis hangus demi keamanan. Silakan klik Kirim Ulang Kode OTP.',
                ]);
            }

            $request->session()->put('password_reset_otp', $reset);
            $left = self::OTP_MAX_ATTEMPTS - $attempts;

            return back()->withErrors([
                'otp' => "Kode OTP tidak sesuai. Sisa percobaan: {$left}x.",
            ]);
        }

        $user = User::find($reset['user_id']);
        if (! $user) {
            $request->session()->forget('password_reset_otp');

            return redirect()->route('password.request')
                ->with('error', 'Akun tidak ditemukan.');
        }

        $user->update([
            'password' => Hash::make($validated['password']),
        ]);

        // Clear any previous login throttle for this account
        RateLimiter::clear('login:'.strtolower((string) $user->email).'|'.$request->ip());
        if ($user->username) {
            RateLimiter::clear('login:'.strtolower((string) $user->username).'|'.$request->ip());
        }

        $request->session()->forget('password_reset_otp');

        return redirect()->route('login')
            ->with('success', 'Kata sandi Anda berhasil diperbarui! Silakan masuk dengan kata sandi baru.');
    }

    public function resendResetOtp(Request $request): RedirectResponse
    {
        $reset = $request->session()->get('password_reset_otp');
        if (! is_array($reset) || empty($reset['email'])) {
            return redirect()->route('password.request');
        }

        $remaining = (int) ($reset['resend_available_at'] ?? 0) - now()->timestamp;
        if ($remaining > 0) {
            return back()->with('error', "Tunggu {$remaining} detik sebelum meminta kode OTP baru.");
        }

        $otp = (string) random_int(100000, 999999);
        $reset['otp'] = $otp;
        $reset['attempts'] = 0;
        $reset['expires_at'] = now()->addMinutes(10)->timestamp;
        $reset['resend_available_at'] = now()->addSeconds(self::OTP_RESEND_COOLDOWN_SECONDS)->timestamp;
        $request->session()->put('password_reset_otp', $reset);

        $sent = $this->sendResetEmail($reset['email'], $reset['name'] ?? 'Pelanggan', $otp);

        return back()->with(
            'success',
            $sent
                ? "Kode OTP reset baru telah dikirim ulang ke {$reset['email']}."
                : 'Kode OTP reset baru berhasil dibuat.'
        );
    }

    private function sendResetEmail(string $toEmail, string $name, string $otp): bool
    {
        $html = "
            <div style=\"font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; background: #090D16; color: #f8fafc; border-radius: 16px;\">
                <h2 style=\"margin: 0 0 8px; color: #38bdf8;\">Langit Studio — Reset Kata Sandi</h2>
                <p style=\"font-size: 14px; color: #cbd5e1; line-height: 1.6;\">
                    Halo <strong>{$name}</strong>,<br>
                    Kami menerima permintaan untuk mengatur ulang kata sandi akun Anda. Gunakan kode OTP 6 digit berikut:
                </p>
                <div style=\"margin: 20px 0; padding: 16px; background: #111827; border: 1px solid #0284c7; border-radius: 12px; text-align: center;\">
                    <span style=\"font-size: 28px; font-weight: bold; letter-spacing: 8px; color: #38bdf8;\">{$otp}</span>
                </div>
                <p style=\"font-size: 12px; color: #94a3b8;\">
                    Kode ini berlaku selama 10 menit dan hanya berlaku untuk 5 kali percobaan. Abaikan email ini jika Anda tidak merasa meminta reset kata sandi.
                </p>
            </div>
        ";

        try {
            if (trim((string) config('mail.mailers.smtp.password')) === '' && ! app()->runningUnitTests()) {
                Log::info("Langit Password Reset OTP for {$toEmail}: {$otp}");

                return false;
            }

            Mail::html($html, function ($message) use ($toEmail) {
                $message->to($toEmail)
                    ->subject('Kode OTP Reset Kata Sandi — Langit Studio');
            });

            return true;
        } catch (\Throwable $e) {
            Log::warning('Gagal mengirim email OTP reset kata sandi: '.$e->getMessage());

            return false;
        }
    }
}
