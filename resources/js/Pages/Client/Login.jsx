import React, { useState, useEffect } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { Lock, User, ArrowLeft, Eye, EyeOff, Camera, Sparkles, Download } from 'lucide-react';
import ThemeToggle from '@/Components/ThemeToggle';

export default function ClientLogin() {
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing, errors } = useForm({
        login: '',
        password: '',
        remember: true,
    });

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
        post('/pelanggan/login');
    };

    return (
        <div className="min-h-screen bg-[#EDF9FC] text-slate-800 dark:bg-[#07090E] dark:text-slate-100 flex flex-col justify-center items-center px-4 py-8 font-sans relative overflow-hidden transition-colors duration-200">
            <Head title="Login Pelanggan — Portal Ambil Foto Studio Langit" />

            {/* Ambient Background Glows */}
            <div className="absolute -top-32 -left-32 w-96 h-96 bg-cyan-500/15 dark:bg-cyan-600/20 rounded-full blur-[140px] pointer-events-none"></div>
            <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-500/15 dark:bg-amber-600/20 rounded-full blur-[140px] pointer-events-none"></div>

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
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300 border border-cyan-500/30">
                            Portal Pelanggan
                        </span>
                    </div>
                </div>

                <div className="rounded-3xl bg-white/95 dark:bg-[#090D16]/95 border border-slate-200/90 dark:border-white/10 backdrop-blur-2xl p-7 sm:p-9 shadow-2xl shadow-slate-200/60 dark:shadow-black/50 transition-colors duration-200">
                    <div className="text-center mb-7">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#005792] via-sky-500 to-indigo-600 text-white shadow-lg shadow-sky-500/25 mb-3.5">
                            <Camera className="w-7 h-7" />
                        </div>
                        <h1 className="font-heading font-black text-2xl text-slate-900 dark:text-white tracking-tight">
                            Portal Ambil Foto
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed max-w-xs mx-auto">
                            Masukkan username dan kata sandi yang telah diberikan oleh admin Studio Langit untuk mengunduh foto Anda.
                        </p>
                    </div>

                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                                Username Pelanggan
                            </label>
                            <div className="relative">
                                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    required
                                    value={data.login}
                                    onChange={(e) => setData('login', e.target.value)}
                                    placeholder="Contoh: rina_dimas atau email"
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
                                    placeholder="••••••••"
                                    className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50/50 dark:bg-black/30 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#005792] dark:focus:ring-cyan-500 transition-all placeholder:text-slate-400"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white p-1"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-xs text-rose-500 mt-1 font-mono">{errors.password}</p>
                            )}
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#005792] via-sky-500 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-sky-500/25 transition-all duration-200 active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                            >
                                <Download className="w-4 h-4" />
                                <span>{processing ? 'Memverifikasi...' : 'Masuk & Ambil Foto'}</span>
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 pt-5 border-t border-slate-200/80 dark:border-white/10 text-center">
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                            Belum memiliki username & password atau masa unduh habis? Hubungi Studio Langit via{' '}
                            <a 
                                href="https://wa.me/6282246142791" 
                                target="_blank" 
                                rel="noreferrer"
                                className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                            >
                                WhatsApp Official
                            </a>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
