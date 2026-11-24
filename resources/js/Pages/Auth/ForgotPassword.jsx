import React, { useState, useEffect } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Mail, KeyRound, Sun, Moon, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function ForgotPassword() {
    const { flash } = usePage().props;
    const { data, setData, post, processing, errors } = useForm({
        email: '',
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
        post('/forgot-password/send-otp');
    };

    return (
        <div className="min-h-dvh bg-[#EDF9FC] text-slate-800 dark:bg-[#07090E] dark:text-slate-100 flex flex-col justify-center items-center px-4 py-6 sm:py-8 font-sans relative transition-colors duration-200">
            <Head title="Lupa Kata Sandi — Langit" />

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
                <div className="mb-6 flex flex-wrap gap-2 justify-between items-center">
                    <Link
                        href="/login"
                        className="min-h-11 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-[#005792] dark:hover:text-cyan-400 flex items-center gap-1.5 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Kembali ke Halaman Masuk</span>
                    </Link>

                    <button
                        type="button"
                        onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                        aria-label="Ganti Tema Tampilan"
                        className="w-11 h-11 shrink-0 rounded-full flex items-center justify-center bg-white hover:bg-slate-100 dark:bg-white/10 dark:hover:bg-white/15 text-slate-700 dark:text-amber-400 border border-slate-200 dark:border-white/10 transition-transform active:scale-95 shadow-xs cursor-pointer"
                    >
                        {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
                    </button>
                </div>

                <div className="rounded-3xl bg-white/95 dark:bg-[#090D16]/95 border border-slate-200/90 dark:border-white/10 backdrop-blur-2xl p-5 sm:p-9 shadow-2xl shadow-slate-200/60 dark:shadow-black/60 transition-colors duration-200">
                    <div className="text-center mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-[#005792]/10 dark:bg-cyan-500/15 border border-[#005792]/20 dark:border-cyan-500/30 text-[#005792] dark:text-cyan-400 flex items-center justify-center mx-auto mb-4">
                            <KeyRound className="w-6 h-6" />
                        </div>
                        <h1 className="font-heading font-black text-xl sm:text-2xl text-slate-900 dark:text-white tracking-tight">
                            Lupa Kata Sandi?
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                            Masukkan alamat email akun Anda yang terdaftar. Kami akan mengirimkan kode OTP 6 digit untuk mengatur ulang kata sandi.
                        </p>
                    </div>

                    {flash?.error && (
                        <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                            <span>{flash.error}</span>
                        </div>
                    )}

                    {flash?.success && (
                        <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
                            <span>{flash.success}</span>
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                                Email Terdaftar
                            </label>
                            <div className="relative">
                                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                <input
                                    type="email"
                                    required
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="nama@email.com"
                                    className="w-full min-w-0 min-h-11 pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700/80 bg-white dark:bg-[#0B1120] text-slate-900 dark:text-white text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#005792] dark:focus:ring-cyan-500 transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                    autoCapitalize="none"
                                />
                            </div>
                            {errors.email && (
                                <p className="text-xs text-rose-500 mt-1 font-mono">{errors.email}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full py-3 rounded-xl bg-[#005792] hover:bg-[#004270] active:bg-[#003357] text-white font-bold text-sm shadow-sm transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                            <span>{processing ? 'Mengirim Kode OTP...' : 'Kirim Kode OTP ke Email'}</span>
                        </button>
                    </form>

                    <div className="mt-6 pt-5 border-t border-slate-200/80 dark:border-white/10 text-center">
                        <p className="text-xs text-slate-600 dark:text-slate-300">
                            Sudah ingat kata sandi Anda?{' '}
                            <Link href="/login" className="text-[#005792] dark:text-cyan-400 font-bold hover:underline">
                                Masuk Sekarang
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
