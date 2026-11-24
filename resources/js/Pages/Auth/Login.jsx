import React, { useState, useEffect } from 'react';
import { Head, useForm, Link, usePage } from '@inertiajs/react';
import { Lock, User, ArrowLeft, Eye, EyeOff, LogIn, Sun, Moon, AlertCircle, CheckCircle2 } from 'lucide-react';
import { getWhatsAppUrl } from '@/Utils/whatsapp';

export default function UnifiedLogin() {
    const { flash } = usePage().props;
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing, errors } = useForm({
        login: '',
        password: '',
        remember: true,
    });

    // Theme Management: Primary is Dark, Secondary is Light
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
        <div className="min-h-dvh bg-[#EDF9FC] text-slate-800 dark:bg-[#07090E] dark:text-slate-100 flex flex-col justify-center items-center px-4 py-6 sm:py-8 font-sans relative transition-colors duration-200">
            <Head title="Masuk ke Akun — Langit" />

            {/* Ambient Background Glows (Zero-cost radial gradients, no GPU blur penalty) */}
            <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none">
                <div
                    className="absolute -top-32 -left-32 w-96 h-96 rounded-full"
                    style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.18) 0%, rgba(6,182,212,0.05) 45%, transparent 70%)' }}
                />
                <div
                    className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full"
                    style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.16) 0%, rgba(99,102,241,0.04) 45%, transparent 70%)' }}
                />
            </div>

            <div className="w-full min-w-0 max-w-md relative z-10">
                {/* Top Bar Navigation */}
                <div className="mb-6 flex flex-wrap gap-2 justify-between items-center">
                    <Link
                        href="/"
                        className="min-h-11 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-[#005792] dark:hover:text-cyan-400 flex items-center gap-1.5 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Kembali ke Beranda</span>
                    </Link>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                            aria-label="Ganti Tema Tampilan"
                            title={theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
                            className="w-11 h-11 shrink-0 rounded-full flex items-center justify-center bg-white hover:bg-slate-100 dark:bg-white/10 dark:hover:bg-white/15 text-slate-700 dark:text-amber-400 border border-slate-200 dark:border-white/10 transition-transform active:scale-95 shadow-xs cursor-pointer"
                        >
                            {theme === 'dark' ? (
                                <Sun className="w-4 h-4 text-amber-400" />
                            ) : (
                                <Moon className="w-4 h-4 text-slate-700" />
                            )}
                        </button>
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#005792]/10 text-[#005792] dark:bg-cyan-500/20 dark:text-cyan-300 border border-[#005792]/20 dark:border-cyan-500/30">
                            Akses Akun
                        </span>
                    </div>
                </div>

                <div className="rounded-3xl bg-white/95 dark:bg-[#090D16]/95 border border-slate-200/90 dark:border-white/10 backdrop-blur-2xl p-5 sm:p-9 shadow-2xl shadow-slate-200/60 dark:shadow-black/60 transition-colors duration-200">
                    {/* Header Brand */}
                    <div className="text-center mb-6 sm:mb-7">
                        <Link href="/" className="inline-flex items-center justify-center group mb-5 sm:mb-6">
                            <span 
                                className="font-etna font-bold text-2xl sm:text-[28px] tracking-tight text-[#005792] dark:text-cyan-400 flex items-center gap-1.5 leading-none transition-all duration-300 group-hover:text-cyan-600 dark:group-hover:text-cyan-300"
                                style={{ fontFamily: "'Etna Sans Serif', 'Etna', sans-serif" }}
                            >
                                langit
                                <span className="w-2 h-2 rounded-full bg-cyan-500 animate-hud-pulse shadow-[0_0_8px_rgba(6,182,212,0.8)] shrink-0"></span>
                            </span>
                        </Link>
                        <h1 className="font-heading font-black text-xl sm:text-2xl text-slate-900 dark:text-white tracking-tight">
                            Masuk ke Akun
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-xs mx-auto leading-relaxed">
                            Akses terpadu pengelolaan layanan dan dokumentasi Studio Langit.
                        </p>
                    </div>

                    {flash?.success && (
                        <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
                            <span>{flash.success}</span>
                        </div>
                    )}

                    {flash?.error && (
                        <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                            <span>{flash.error}</span>
                        </div>
                    )}

                    {/* Login Form */}
                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                                Nama Pengguna atau Email
                            </label>
                            <div className="relative">
                                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    required
                                    value={data.login}
                                    onChange={(e) => setData('login', e.target.value)}
                                    placeholder="Masukkan nama pengguna atau email"
                                    className="w-full min-w-0 min-h-11 pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700/80 bg-white dark:bg-[#0B1120] text-slate-900 dark:text-white text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#005792] dark:focus:ring-cyan-500 transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-500"
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
                                    className="w-full min-w-0 min-h-11 pl-10 pr-12 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700/80 bg-white dark:bg-[#0B1120] text-slate-900 dark:text-white text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#005792] dark:focus:ring-cyan-500 transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-0.5 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                                    title={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-xs text-rose-500 mt-1 font-mono">{errors.password}</p>
                            )}
                        </div>

                        <div className="flex items-center justify-between gap-2 text-xs pt-1">
                            <label className="min-h-11 flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400">
                                <input
                                    type="checkbox"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="shrink-0 rounded border-slate-300 text-[#005792] focus:ring-[#005792] dark:bg-black/30 dark:border-white/10"
                                />
                                <span>Ingat saya di perangkat ini</span>
                            </label>
                            <Link
                                href="/forgot-password"
                                className="min-h-11 inline-flex items-center text-xs font-semibold text-[#005792] dark:text-cyan-400 hover:underline shrink-0"
                            >
                                Lupa Kata Sandi?
                            </Link>
                        </div>

                        <div className="pt-2 space-y-2.5">
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full py-3 rounded-xl bg-[#005792] hover:bg-[#004270] active:bg-[#003357] text-white font-bold text-sm shadow-sm hover:shadow transition-all duration-200 active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                            >
                                <LogIn className="w-4 h-4" />
                                <span>{processing ? 'Memverifikasi...' : 'Masuk'}</span>
                            </button>

                            <a
                                href="/auth/google/redirect?mode=login"
                                className="w-full min-h-11 py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 dark:bg-[#0B1120] dark:hover:bg-slate-800/90 border border-slate-300 dark:border-slate-700/80 text-slate-800 dark:text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-2xs transition-all active:scale-98"
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
                                <span>Masuk dengan Akun Google</span>
                            </a>
                        </div>
                    </form>

                    {/* Footer Register & WhatsApp Link */}
                    <div className="mt-6 pt-5 border-t border-slate-200/80 dark:border-white/10 text-center space-y-2.5">
                        <p className="text-xs text-slate-600 dark:text-slate-300">
                            Belum punya akun?{' '}
                            <Link href="/register" className="text-[#005792] dark:text-cyan-400 font-bold hover:underline">
                                Daftar Akun Baru
                            </Link>
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                            Kendala akun atau login? Hubungi kami via{' '}
                            <a 
                                href={getWhatsAppUrl('login-help', {
                                    clientName: data.login || '',
                                    details: 'Kendala masuk akun / butuh verifikasi kredensial'
                                })} 
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
