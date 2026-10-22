import React, { useState, useEffect } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { ShieldCheck, Lock, Mail, ArrowRight, ArrowLeft } from 'lucide-react';
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
        <div className="min-h-screen bg-slate-100 text-slate-800 dark:bg-[#07090E] dark:text-slate-100 flex flex-col justify-center items-center px-4 font-sans relative overflow-hidden transition-colors duration-200">
            <Head title="Admin CMS Portal Login — Langit" />

            {/* Ambient Background Glows */}
            <div className="absolute -top-32 -left-32 w-96 h-96 bg-cyan-500/10 dark:bg-cyan-600/15 rounded-full blur-[140px] pointer-events-none"></div>
            <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none"></div>

            <div className="w-full max-w-md relative z-10">
                {/* Top Bar Navigation & Theme Switcher */}
                <div className="mb-6 flex flex-wrap gap-2 justify-between items-center">
                    <Link
                        href="/"
                        className="text-xs font-mono text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 flex items-center gap-1.5 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Kembali ke Website Publik</span>
                    </Link>

                    {/* Dual Theme Switcher (Terang / Gelap) */}
                    <div className="flex items-center gap-2">
                        <ThemeToggle theme={theme} setTheme={setTheme} />
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                            Back-Office CMS
                        </span>
                    </div>
                </div>

                <div className="rounded-3xl bg-white/95 dark:bg-[#090D16]/90 border border-slate-200/90 dark:border-white/10 backdrop-blur-2xl p-8 shadow-2xl shadow-slate-200/60 dark:shadow-2xl transition-colors duration-200">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 rounded-2xl overflow-hidden border border-slate-200 dark:border-white/15 mx-auto mb-3 shadow-xl bg-slate-100 dark:bg-slate-900">
                            <img 
                                src="/images/logo-langit-creative.jpg" 
                                alt="Langit Creative Logo" 
                                className="w-full h-full object-cover" 
                            />
                        </div>
                        <h1 className="font-heading font-extrabold text-2xl text-slate-900 dark:text-white">
                            Langit CMS Portal
                        </h1>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                            Sistem Manajemen Terpadu 7 Divisi Layanan
                        </p>
                    </div>

                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-mono text-slate-700 dark:text-slate-300 mb-1">Email Administrator</label>
                            <div className="relative">
                                <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                <input
                                    type="email"
                                    required
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="admin@langit.id"
                                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm focus:outline-none focus:border-cyan-500 focus:bg-white dark:focus:bg-slate-900 font-mono transition-colors"
                                />
                            </div>
                            {errors.email && <p className="text-xs text-rose-500 dark:text-rose-400 mt-1 font-mono">{errors.email}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-mono text-slate-700 dark:text-slate-300 mb-1">Kata Sandi</label>
                            <div className="relative">
                                <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                <input
                                    type="password"
                                    required
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm focus:outline-none focus:border-cyan-500 focus:bg-white dark:focus:bg-slate-900 font-mono transition-colors"
                                />
                            </div>
                            {errors.password && <p className="text-xs text-rose-500 dark:text-rose-400 mt-1 font-mono">{errors.password}</p>}
                        </div>

                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 text-[11px] font-mono text-slate-600 dark:text-slate-400 flex items-center justify-between">
                            <span>Akun Demo Admin:</span>
                            <span className="text-cyan-600 dark:text-cyan-400 font-bold">admin@langit.id / admin123</span>
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 via-sky-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/25 transition-transform active:scale-95 disabled:opacity-50"
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
