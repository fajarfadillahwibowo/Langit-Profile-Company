import React, { useState, useEffect } from 'react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    KeyRound,
    ArrowLeft,
    CheckCircle2,
    AlertCircle,
    RefreshCw,
    Sun,
    Moon,
    Mail,
} from 'lucide-react';

export default function VerifyOtp({ email, username, smtpReady, fallbackOtp, resendCooldownSeconds = 0 }) {
    const { flash } = usePage().props;
    const [resending, setResending] = useState(false);
    const [cooldown, setCooldown] = useState(resendCooldownSeconds);

    useEffect(() => {
        setCooldown(resendCooldownSeconds);
    }, [resendCooldownSeconds]);

    useEffect(() => {
        if (cooldown <= 0) return undefined;
        const timer = setInterval(() => {
            setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, [cooldown]);

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
        otp: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post('/register/verify-otp');
    };

    const handleResend = () => {
        if (cooldown > 0 || resending) return;
        setResending(true);
        router.post(
            '/register/resend-otp',
            {},
            {
                preserveScroll: true,
                onFinish: () => setResending(false),
            }
        );
    };

    return (
        <div className="min-h-dvh bg-[#EDF9FC] text-slate-800 dark:bg-[#07090E] dark:text-slate-100 flex flex-col justify-center items-center px-4 py-8 font-sans transition-colors duration-200">
            <Head title="Verifikasi Kode OTP Email — Langit" />

            <div className="w-full max-w-md space-y-5">
                <div className="flex items-center justify-between">
                    <Link
                        href="/register"
                        className="min-h-10 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-[#005792] dark:hover:text-cyan-400 inline-flex items-center gap-1.5"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Ganti Email / Daftar Ulang</span>
                    </Link>

                    <button
                        type="button"
                        onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                        aria-label="Ganti Tema Tampilan"
                        className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center bg-white hover:bg-slate-100 dark:bg-white/10 dark:hover:bg-white/15 text-slate-700 dark:text-amber-400 border border-slate-200 dark:border-white/10 cursor-pointer"
                    >
                        {theme === 'dark' ? (
                            <Sun className="w-4 h-4 text-amber-400" />
                        ) : (
                            <Moon className="w-4 h-4 text-slate-700" />
                        )}
                    </button>
                </div>

                <div className="rounded-3xl bg-white/95 dark:bg-[#090D16]/95 border border-slate-200/90 dark:border-white/10 p-6 sm:p-8 shadow-xl space-y-5">
                    <div className="text-center space-y-2">
                        <div className="w-12 h-12 rounded-2xl bg-[#005792]/10 dark:bg-cyan-500/15 border border-[#005792]/20 dark:border-cyan-500/30 flex items-center justify-center mx-auto text-[#005792] dark:text-cyan-400">
                            <Mail className="w-6 h-6" />
                        </div>
                        <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                            Verifikasi Kode OTP Email
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                            Kami telah mengirimkan kode 6 digit untuk akun <strong>{username}</strong> ke email:{' '}
                            <span className="font-semibold text-[#005792] dark:text-cyan-400">{email}</span>
                        </p>
                    </div>

                    {flash?.success && (
                        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
                            <span>{flash.success}</span>
                        </div>
                    )}

                    {flash?.error && (
                        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                            <span>{flash.error}</span>
                        </div>
                    )}

                    {!smtpReady && fallbackOtp && (
                        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs space-y-1">
                            <p className="font-bold">Mode Lokal (MAIL_PASSWORD belum diisi di .env):</p>
                            <p>
                                Kode OTP sementara Anda: <strong className="font-mono text-sm tracking-widest">{fallbackOtp}</strong>
                            </p>
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 text-center">
                                Masukkan 6 Digit Kode OTP
                            </label>
                            <div className="relative">
                                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={6}
                                    value={data.otp}
                                    onChange={(e) => setData('otp', e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    required
                                    placeholder="000000"
                                    className="w-full min-h-12 pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-[#0B1120] border border-slate-300 dark:border-slate-700/80 text-slate-900 dark:text-white text-center font-mono text-xl tracking-[0.5em] font-bold focus:outline-none focus:border-[#005792] dark:focus:border-cyan-400"
                                />
                            </div>
                            {errors.otp && (
                                <p className="text-xs text-rose-500 mt-1.5 flex items-center justify-center gap-1">
                                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                    <span>{errors.otp}</span>
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={processing || data.otp.length !== 6}
                            className="w-full py-3 rounded-xl bg-[#005792] hover:bg-[#004270] text-white font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>{processing ? 'Memverifikasi...' : 'Verifikasi & Aktifkan Akun'}</span>
                        </button>
                    </form>

                    <div className="text-center pt-2 border-t border-slate-200/80 dark:border-white/10">
                        <button
                            type="button"
                            disabled={resending || cooldown > 0}
                            onClick={handleResend}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#005792] dark:text-cyan-400 hover:underline cursor-pointer disabled:opacity-50 disabled:no-underline"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                            <span>
                                {cooldown > 0
                                    ? `Kirim ulang OTP dalam ${cooldown} detik`
                                    : resending
                                    ? 'Mengirim ulang...'
                                    : 'Belum menerima email? Kirim Ulang Kode OTP'}
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
