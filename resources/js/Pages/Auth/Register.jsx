import React, { useState, useEffect } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    User,
    Mail,
    Lock,
    ArrowLeft,
    Eye,
    EyeOff,
    UserPlus,
    AlertCircle,
    Sun,
    Moon,
} from 'lucide-react';
import PasswordStrengthMeter, { evaluatePasswordStrength } from '@/Components/PasswordStrengthMeter';

export default function Register() {
    const { flash } = usePage().props;
    const [showPassword, setShowPassword] = useState(false);
    const [clientPasswordWarning, setClientPasswordWarning] = useState('');

    const [theme, setTheme] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('langit_theme_v2') || 'dark';
        }
        return 'dark';
    });

    useEffect(() => {
        if (typeof window === 'undefined') return;
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            document.documentElement.classList.remove('light');
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.classList.add('light');
            document.documentElement.classList.remove('dark');
            document.documentElement.setAttribute('data-theme', 'light');
        }
        localStorage.setItem('langit_theme_v2', theme);
        localStorage.setItem('langit_theme', theme);
    }, [theme]);

    const { data, setData, post, processing, errors } = useForm({
        username: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const passwordLen = (data.password || '').length;
    const passwordStrength = evaluatePasswordStrength(data.password);
    const isPasswordTooShort = passwordLen > 0 && !passwordStrength.isValid;
    const isPasswordValidLen = passwordStrength.isValid;

    const submit = (e) => {
        e.preventDefault();
        if (!passwordStrength.isValid) {
            setClientPasswordWarning('Peringatan: Password wajib minimal 8 karakter dengan kombinasi huruf dan angka.');
            return;
        }
        setClientPasswordWarning('');
        post('/register');
    };

    const inputBaseClass =
        'w-full min-h-11 py-2.5 rounded-xl bg-white dark:bg-[#0B1120] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm focus:outline-none transition-colors';

    return (
        <div className="min-h-dvh bg-[#EDF9FC] text-slate-800 dark:bg-[#07090E] dark:text-slate-100 flex flex-col justify-center items-center px-4 py-8 font-sans transition-colors duration-200">
            <Head title="Daftar Akun — Langit" />

            <div className="w-full max-w-md space-y-5">
                <div className="flex items-center justify-between">
                    <Link
                        href="/login"
                        className="min-h-10 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-[#005792] dark:hover:text-cyan-400 inline-flex items-center gap-1.5"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Kembali ke Login</span>
                    </Link>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                            aria-label="Ganti Tema Tampilan"
                            title={theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
                            className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center bg-white hover:bg-slate-100 dark:bg-white/10 dark:hover:bg-white/15 text-slate-700 dark:text-amber-400 border border-slate-200 dark:border-white/10 transition-transform active:scale-95 shadow-xs cursor-pointer"
                        >
                            {theme === 'dark' ? (
                                <Sun className="w-4 h-4 text-amber-400" />
                            ) : (
                                <Moon className="w-4 h-4 text-slate-700" />
                            )}
                        </button>
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#005792]/10 text-[#005792] dark:bg-cyan-500/20 dark:text-cyan-300 border border-[#005792]/20 dark:border-cyan-500/30">
                            Daftar Akun
                        </span>
                    </div>
                </div>

                <div className="rounded-3xl bg-white/95 dark:bg-[#090D16]/95 border border-slate-200/90 dark:border-white/10 p-6 sm:p-8 shadow-xl transition-colors duration-200">
                    <div className="text-center mb-6">
                        <span
                            className="font-bold text-2xl text-[#005792] dark:text-cyan-400 inline-flex items-center gap-1.5"
                            style={{ fontFamily: "'Etna Sans Serif', 'Etna', sans-serif" }}
                        >
                            langit
                            <span className="w-2 h-2 rounded-full bg-cyan-500" />
                        </span>
                        <h1 className="text-lg font-bold text-slate-900 dark:text-white mt-2">
                            Daftar Akun
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Pilih daftar cepat dengan Akun Google atau gunakan Username &amp; Email
                        </p>
                    </div>

                    {flash?.error && (
                        <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                            <span>{flash.error}</span>
                        </div>
                    )}

                    {/* Tombol Daftar dengan Akun Google (Laravel Socialite) */}
                    <a
                        href="/auth/google/redirect?mode=register"
                        className="w-full min-h-11 py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 dark:bg-[#0B1120] dark:hover:bg-slate-800/90 border border-slate-300 dark:border-slate-700/80 text-slate-800 dark:text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-2xs transition-all active:scale-[0.99]"
                    >
                        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                            <path
                                fill="#EA4335"
                                d="M12 10.2v3.9h5.5c-.2 1.2-.9 2.3-2 3l3.2 2.5c1.9-1.7 3-4.3 3-7.3 0-.7-.1-1.4-.2-2.1H12z"
                            />
                            <path
                                fill="#34A853"
                                d="M12 22c2.7 0 5-.9 6.7-2.4l-3.2-2.5c-.9.6-2.1 1-3.5 1-2.7 0-5-1.8-5.8-4.3H2.9v2.6C4.6 19.8 8 22 12 22z"
                            />
                            <path
                                fill="#FBBC05"
                                d="M6.2 13.8c-.2-.6-.3-1.2-.3-1.8s.1-1.2.3-1.8V7.6H2.9C2.3 8.9 2 10.4 2 12s.3 3.1.9 4.4l3.3-2.6z"
                            />
                            <path
                                fill="#4285F4"
                                d="M12 5.9c1.5 0 2.8.5 3.9 1.5l2.9-2.9C17 2.9 14.7 2 12 2 8 2 4.6 4.2 2.9 7.6l3.3 2.6C7 7.7 9.3 5.9 12 5.9z"
                            />
                        </svg>
                        <span>Daftar dengan Akun Google</span>
                    </a>

                    <div className="relative my-5 flex items-center justify-center">
                        <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
                        <span className="bg-white dark:bg-[#090D16] px-3 text-[11px] font-medium text-slate-400 whitespace-nowrap">
                            atau daftar dengan email
                        </span>
                        <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
                    </div>

                    <form onSubmit={submit} className="space-y-4" noValidate>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                Username
                            </label>
                            <div className="relative">
                                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    value={data.username}
                                    onChange={(e) => setData('username', e.target.value)}
                                    required
                                    autoCapitalize="none"
                                    placeholder="Contoh: budi_pratama"
                                    className={`${inputBaseClass} pl-10 pr-4 border border-slate-300 dark:border-slate-700/80 focus:border-[#005792] dark:focus:border-cyan-400`}
                                />
                            </div>
                            {errors.username && <p className="text-xs text-rose-500 mt-1">{errors.username}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                Email Aktif
                            </label>
                            <div className="relative">
                                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    required
                                    placeholder="nama@email.com"
                                    className={`${inputBaseClass} pl-10 pr-4 border border-slate-300 dark:border-slate-700/80 focus:border-[#005792] dark:focus:border-cyan-400`}
                                />
                            </div>
                            {errors.email && <p className="text-xs text-rose-500 mt-1">{errors.email}</p>}
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                                    Password
                                </label>
                                <span
                                    className={`text-[11px] font-semibold ${
                                        isPasswordValidLen
                                            ? 'text-emerald-600 dark:text-emerald-400'
                                            : isPasswordTooShort
                                              ? 'text-amber-600 dark:text-amber-400'
                                              : 'text-slate-400'
                                    }`}
                                >
                                    {passwordLen}/8 karakter
                                </span>
                            </div>
                            <div className="relative">
                                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={data.password}
                                    onChange={(e) => {
                                        setData('password', e.target.value);
                                        if (evaluatePasswordStrength(e.target.value).isValid) {
                                            setClientPasswordWarning('');
                                        }
                                    }}
                                    required
                                    minLength={8}
                                    placeholder="Minimal 8 karakter (huruf & angka)"
                                    className={`${inputBaseClass} pl-10 pr-11 border ${
                                        isPasswordTooShort || clientPasswordWarning || errors.password
                                            ? 'border-amber-500 dark:border-amber-500/80 focus:border-amber-500'
                                            : isPasswordValidLen
                                              ? 'border-emerald-500/60 dark:border-emerald-500/60 focus:border-emerald-500'
                                              : 'border-slate-300 dark:border-slate-700/80 focus:border-[#005792] dark:focus:border-cyan-400'
                                    }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((v) => !v)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>

                            <PasswordStrengthMeter password={data.password} />

                            {clientPasswordWarning && (
                                <div className="mt-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 shrink-0 text-amber-500 dark:text-amber-400" />
                                    <span>{clientPasswordWarning}</span>
                                </div>
                            )}

                            {errors.password && (
                                <p className="text-xs text-rose-500 mt-1.5 font-medium">{errors.password}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                Ulangi Password
                            </label>
                            <div className="relative">
                                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    required
                                    minLength={8}
                                    placeholder="Ulangi password Anda"
                                    className={`${inputBaseClass} pl-10 pr-4 border border-slate-300 dark:border-slate-700/80 focus:border-[#005792] dark:focus:border-cyan-400`}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full py-3 rounded-xl bg-[#005792] hover:bg-[#004270] text-white font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                        >
                            <UserPlus className="w-4 h-4" />
                            <span>{processing ? 'Mendaftarkan...' : 'Daftar'}</span>
                        </button>
                    </form>

                    <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-5">
                        Sudah punya akun?{' '}
                        <Link href="/login" className="text-[#005792] dark:text-cyan-400 font-bold hover:underline">
                            Masuk di sini
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
