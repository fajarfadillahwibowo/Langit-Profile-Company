import React, { useState, useEffect } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { Lock, Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import ThemeToggle from '@/Components/ThemeToggle';

export default function AdminLogin() {
    const { data, setData, post, processing, errors } = useForm({
        email: 'admin@langit.id',
        password: 'admin123',
        remember: true,
    });

    // Theme Management: Primary is 'light', Secondary is 'dark'
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
        post('/admin/login');
    };

    return (
        <div className="min-h-screen bg-[#EDF9FC] text-slate-800 dark:bg-[#07090E] dark:text-slate-100 flex flex-col justify-center items-center px-4 font-sans relative overflow-hidden transition-colors duration-200">
            <Head title="Admin CMS Portal Login — Langit" />

            {/* Ambient Background Glows */}
            <div className="absolute -top-32 -left-32 w-96 h-96 bg-cyan-500/10 dark:bg-cyan-600/15 rounded-full blur-[140px] pointer-events-none"></div>
            <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none"></div>

            <div className="w-full max-w-md relative z-10">
                {/* Top Bar Navigation & Theme Switcher */}
                <div className="mb-6 flex flex-wrap gap-2 justify-between items-center">
                    <Link
                        href="/"
                        className="text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-[#005792] dark:hover:text-cyan-400 flex items-center gap-1.5 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Kembali ke Website Publik</span>
                    </Link>

                    {/* Dual Theme Switcher (Terang / Gelap) */}
                    <div className="flex items-center gap-2">
                        <ThemeToggle theme={theme} setTheme={setTheme} />
                        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#005792]/10 text-[#005792] dark:bg-cyan-500/20 dark:text-cyan-300 border border-[#005792]/20 dark:border-cyan-500/30">
                            Back-Office CMS
                        </span>
                    </div>
                </div>

                <div className="rounded-3xl bg-white/95 dark:bg-[#090D16]/90 border border-slate-200/90 dark:border-white/10 backdrop-blur-2xl p-8 shadow-2xl shadow-slate-200/60 dark:shadow-2xl transition-colors duration-200">
                    <div className="text-center mb-8">
                        <Link href="/" className="inline-flex items-center justify-center group mb-3">
                            <span 
                                className="font-etna font-bold text-4xl sm:text-5xl tracking-tight text-[#005792] dark:text-cyan-400 flex items-center gap-2 leading-none transition-all duration-300 group-hover:text-cyan-600 dark:group-hover:text-cyan-300"
                                style={{ fontFamily: "'Etna Sans Serif', 'Etna', sans-serif" }}
                            >
                                langit
                                <span className="w-3 h-3 rounded-full bg-cyan-500 animate-hud-pulse shadow-[0_0_10px_rgba(6,182,212,0.8)] shrink-0"></span>
                            </span>
                        </Link>
                        <h1 className="font-heading font-extrabold text-xl text-slate-900 dark:text-white">
                            Back-Office CMS Portal
                        </h1>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">
                            Sistem Manajemen Terpadu 7 Divisi Layanan
                        </p>
                    </div>

                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Email Administrator</label>
                            <div className="relative">
                                <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                <input
                                    type="email"
                                    required
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="admin@langit.id"
                                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm focus:outline-none focus:border-[#005792] focus:ring-1 focus:ring-[#005792] focus:bg-white dark:focus:bg-slate-900 font-sans transition-colors"
                                />
                            </div>
                            {errors.email && <p className="text-xs text-rose-500 dark:text-rose-400 mt-1 font-medium">{errors.email}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Kata Sandi</label>
                            <div className="relative">
                                <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                <input
                                    type="password"
                                    required
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm focus:outline-none focus:border-[#005792] focus:ring-1 focus:ring-[#005792] focus:bg-white dark:focus:bg-slate-900 font-sans transition-colors"
                                />
                            </div>
                            {errors.password && <p className="text-xs text-rose-500 dark:text-rose-400 mt-1 font-medium">{errors.password}</p>}
                        </div>

                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between font-medium">
                            <span>Akun Demo Admin:</span>
                            <span className="text-[#005792] dark:text-cyan-400 font-bold">admin@langit.id / admin123</span>
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full py-3.5 rounded-xl bg-[#005792] hover:bg-[#004270] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-[#005792]/25 transition-all hover:shadow-[#005792]/40 active:scale-[0.99] disabled:opacity-50"
                        >
                            <span>Masuk ke Dashboard CMS</span>
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
