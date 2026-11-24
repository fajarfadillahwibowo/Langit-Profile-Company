import React, { useState, useEffect } from 'react';
import { Head, useForm, Link, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Lock, User, Eye, EyeOff, LogIn, AlertCircle, CheckCircle2 } from 'lucide-react';
import { getWhatsAppUrl } from '@/Utils/whatsapp';
import AuthStudioShell from '@/Components/AuthStudioShell';

export default function UnifiedLogin() {
    const { flash } = usePage().props;
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing, errors } = useForm({
        login: '',
        password: '',
        remember: true,
    });

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

    const submit = (e) => {
        e.preventDefault();
        post('/login');
    };

    return (
        <AuthStudioShell
            mode="login"
            theme={theme}
            setTheme={setTheme}
            backHref="/"
            backLabel="Beranda"
        >
            <Head title="Masuk — Langit" />

            <div className="text-center mb-5">
                <h1 className="font-heading font-black text-xl text-slate-900 dark:text-white">
                    Masuk Akun
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Masukkan username atau email Anda.
                </p>
            </div>

            {flash?.success && (
                <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-start gap-2"
                >
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
                    <span>{flash.success}</span>
                </motion.div>
            )}

            {flash?.error && (
                <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs flex items-start gap-2"
                >
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                    <span>{flash.error}</span>
                </motion.div>
            )}

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Username atau Email
                    </label>
                    <div className="relative group">
                        <User className="w-4 h-4 text-slate-400 group-focus-within:text-[#005792] dark:group-focus-within:text-cyan-400 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors" />
                        <input
                            type="text"
                            required
                            value={data.login}
                            onChange={(e) => setData('login', e.target.value)}
                            placeholder="Username atau email"
                            className="w-full min-w-0 min-h-11 pl-10 pr-4 py-2.5 rounded-xl border border-slate-300/90 dark:border-white/12 bg-white dark:bg-[#070C17] text-slate-900 dark:text-white text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#005792]/30 dark:focus:ring-cyan-400/30 focus:border-[#005792] dark:focus:border-cyan-400 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
                            autoCapitalize="none"
                        />
                    </div>
                    {errors.login && (
                        <p className="text-xs text-rose-500 mt-1">{errors.login}</p>
                    )}
                </div>

                <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Kata Sandi
                    </label>
                    <div className="relative group">
                        <Lock className="w-4 h-4 text-slate-400 group-focus-within:text-[#005792] dark:group-focus-within:text-cyan-400 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors" />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="Kata sandi"
                            className="w-full min-w-0 min-h-11 pl-10 pr-12 py-2.5 rounded-xl border border-slate-300/90 dark:border-white/12 bg-white dark:bg-[#070C17] text-slate-900 dark:text-white text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#005792]/30 dark:focus:ring-cyan-400/30 focus:border-[#005792] dark:focus:border-cyan-400 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-0.5 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer transition-colors"
                            title={showPassword ? 'Sembunyikan' : 'Tampilkan'}
                        >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                    {errors.password && (
                        <p className="text-xs text-rose-500 mt-1">{errors.password}</p>
                    )}
                </div>

                <div className="flex items-center justify-between gap-2 text-xs">
                    <label className="min-h-10 flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400">
                        <input
                            type="checkbox"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                            className="shrink-0 rounded border-slate-300 text-[#005792] focus:ring-[#005792] dark:bg-black/30 dark:border-white/15"
                        />
                        <span>Ingat saya</span>
                    </label>
                    <Link
                        href="/forgot-password"
                        className="min-h-10 inline-flex items-center text-xs font-semibold text-[#005792] dark:text-cyan-400 hover:underline shrink-0"
                    >
                        Lupa Sandi?
                    </Link>
                </div>

                <div className="pt-1 space-y-3">
                    <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={processing}
                        className="w-full min-h-11 py-3 rounded-xl bg-gradient-to-r from-[#005792] via-sky-600 to-cyan-600 hover:from-[#004677] hover:to-cyan-500 text-white font-bold text-sm shadow-lg shadow-[#005792]/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                        <LogIn className="w-4 h-4" />
                        <span>{processing ? 'Memverifikasi...' : 'Masuk'}</span>
                    </motion.button>

                    <div className="relative flex items-center justify-center">
                        <div className="border-t border-slate-200 dark:border-white/10 w-full" />
                        <span className="bg-white dark:bg-[#0B101D] px-3 text-[11px] text-slate-400 whitespace-nowrap">
                            atau
                        </span>
                        <div className="border-t border-slate-200 dark:border-white/10 w-full" />
                    </div>

                    <motion.a
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        href="/auth/google/redirect?mode=login"
                        className="w-full min-h-11 py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 dark:bg-white/[0.04] dark:hover:bg-white/[0.09] border border-slate-300/90 dark:border-white/12 text-slate-800 dark:text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-2xs transition-all"
                    >
                        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                            <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.2-.9 2.3-2 3l3.2 2.5c1.9-1.7 3-4.3 3-7.3 0-.7-.1-1.4-.2-2.1H12z" />
                            <path fill="#34A853" d="M12 22c2.7 0 5-.9 6.7-2.4l-3.2-2.5c-.9.6-2.1 1-3.5 1-2.7 0-5-1.8-5.8-4.3H2.9v2.6C4.6 19.8 8 22 12 22z" />
                            <path fill="#FBBC05" d="M6.2 13.8c-.2-.6-.3-1.2-.3-1.8s.1-1.2.3-1.8V7.6H2.9C2.3 8.9 2 10.4 2 12s.3 3.1.9 4.4l3.3-2.6z" />
                            <path fill="#4285F4" d="M12 5.9c1.5 0 2.8.5 3.9 1.5l2.9-2.9C17 2.9 14.7 2 12 2 8 2 4.6 4.2 2.9 7.6l3.3 2.6C7 7.7 9.3 5.9 12 5.9z" />
                        </svg>
                        <span>Masuk dengan Google</span>
                    </motion.a>
                </div>
            </form>

            <div className="mt-5 pt-4 border-t border-slate-200/80 dark:border-white/10 text-center space-y-2">
                <p className="text-xs text-slate-600 dark:text-slate-300">
                    Belum punya akun?{' '}
                    <Link href="/register" className="text-[#005792] dark:text-cyan-400 font-bold hover:underline">
                        Daftar
                    </Link>
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Butuh bantuan?{' '}
                    <a
                        href={getWhatsAppUrl('login-help', {
                            clientName: data.login || '',
                            details: 'Kendala masuk akun',
                        })}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
                    >
                        WhatsApp Admin
                    </a>
                </p>
            </div>
        </AuthStudioShell>
    );
}
