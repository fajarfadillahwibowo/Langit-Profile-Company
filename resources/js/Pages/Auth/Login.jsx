import React, { useState, useEffect } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { Lock, User, ArrowLeft, Eye, EyeOff, LogIn, Shield, Camera, Sparkles } from 'lucide-react';
import ThemeToggle from '@/Components/ThemeToggle';

export default function UnifiedLogin() {
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing, errors } = useForm({
        login: '',
        password: '',
        remember: true,
    });

    // Theme Management: Light or Dark
    const [theme, setTheme] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('langit_theme') || 'light';
        }
        return 'light';
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
        localStorage.setItem('langit_theme', theme);
    }, [theme]);

    const submit = (e) => {
        e.preventDefault();
        post('/login');
    };

    return (
        <div className="min-h-screen bg-[#EDF9FC] text-slate-800 dark:bg-[#07090E] dark:text-slate-100 flex flex-col justify-center items-center px-4 py-8 font-sans relative overflow-hidden transition-colors duration-200">
            <Head title="Login Akun — Langit" />

            {/* Ambient Background Glows */}
            <div className="absolute -top-32 -left-32 w-96 h-96 bg-cyan-500/15 dark:bg-cyan-600/20 rounded-full blur-[140px] pointer-events-none"></div>
            <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-500/15 dark:bg-indigo-600/20 rounded-full blur-[140px] pointer-events-none"></div>

            <div className="w-full max-w-md relative z-10">
                {/* Top Bar Navigation */}
                <div className="mb-6 flex flex-wrap gap-2 justify-between items-center">
                    <Link
                        href="/"
                        className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-[#005792] dark:hover:text-cyan-400 flex items-center gap-1.5 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Kembali ke Beranda</span>
                    </Link>

                    <div className="flex items-center gap-2">
                        <ThemeToggle theme={theme} setTheme={setTheme} />
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#005792]/10 text-[#005792] dark:bg-cyan-500/20 dark:text-cyan-300 border border-[#005792]/20 dark:border-cyan-500/30">
                            Portal Akses
                        </span>
                    </div>
                </div>

                <div className="rounded-3xl bg-white/95 dark:bg-[#090D16]/95 border border-slate-200/90 dark:border-white/10 backdrop-blur-2xl p-7 sm:p-9 shadow-2xl shadow-slate-200/60 dark:shadow-black/60 transition-colors duration-200">
                    {/* Header Brand */}
                    <div className="text-center mb-7">
                        <Link href="/" className="inline-flex items-center justify-center group mb-2.5">
                            <span 
                                className="font-etna font-bold text-4xl sm:text-5xl tracking-tight text-[#005792] dark:text-cyan-400 flex items-center gap-2 leading-none transition-all duration-300 group-hover:text-cyan-600 dark:group-hover:text-cyan-300"
                                style={{ fontFamily: "'Etna Sans Serif', 'Etna', sans-serif" }}
                            >
                                langit
                                <span className="w-3 h-3 rounded-full bg-cyan-500 animate-hud-pulse shadow-[0_0_10px_rgba(6,182,212,0.8)] shrink-0"></span>
                            </span>
                        </Link>
                        <h1 className="font-heading font-black text-2xl text-slate-900 dark:text-white tracking-tight">
                            Portal Login
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
                            Satu portal masuk untuk Administrator dan Pelanggan Studio Langit.
                        </p>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                                Username atau Email
                            </label>
                            <div className="relative">
                                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    required
                                    value={data.login}
                                    onChange={(e) => setData('login', e.target.value)}
                                    placeholder="admin@langit.id atau username pelanggan"
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50/50 dark:bg-black/30 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#005792] dark:focus:ring-cyan-500 transition-all placeholder:text-slate-400"
                                    autoCapitalize="none"
                                />
                            </div>
                            {errors.login && (
                                <p className="text-xs text-rose-500 mt-1 font-mono">{errors.login}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                                Kata Sandi
                            </label>
                            <div className="relative">
                                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="Masukkan kata sandi"
                                    className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50/50 dark:bg-black/30 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#005792] dark:focus:ring-cyan-500 transition-all placeholder:text-slate-400"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 cursor-pointer"
                                    title={showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-xs text-rose-500 mt-1 font-mono">{errors.password}</p>
                            )}
                        </div>

                        <div className="flex items-center justify-between text-xs pt-1">
                            <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400">
                                <input
                                    type="checkbox"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="rounded border-slate-300 text-[#005792] focus:ring-[#005792] dark:bg-black/30 dark:border-white/10"
                                />
                                <span>Ingat saya di perangkat ini</span>
                            </label>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#005792] via-sky-500 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-sky-500/25 transition-all duration-200 active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                            >
                                <LogIn className="w-4 h-4" />
                                <span>{processing ? 'Memverifikasi...' : 'Masuk'}</span>
                            </button>
                        </div>
                    </form>

                    {/* Footer WhatsApp Link */}
                    <div className="mt-6 pt-5 border-t border-slate-200/80 dark:border-white/10 text-center">
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                            Kendala akun atau login? Hubungi kami via{' '}
                            <a 
                                href="https://wa.me/6282246142791" 
                                target="_blank" 
                                rel="noreferrer"
                                className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                            >
                                WhatsApp Official
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
