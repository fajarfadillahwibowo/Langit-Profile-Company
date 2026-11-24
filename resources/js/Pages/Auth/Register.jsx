import React, { useState, useEffect } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Eye, EyeOff, UserPlus, AlertCircle } from 'lucide-react';
import PasswordStrengthMeter, { evaluatePasswordStrength } from '@/Components/PasswordStrengthMeter';
import AuthStudioShell from '@/Components/AuthStudioShell';

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
            setClientPasswordWarning('Password minimal 8 karakter (kombinasi huruf dan angka).');
            return;
        }
        setClientPasswordWarning('');
        post('/register');
    };

    const inputBaseClass =
        'w-full min-h-11 py-2.5 rounded-xl bg-white dark:bg-[#070C17] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#005792]/30 dark:focus:ring-cyan-400/30 transition-all';

    return (
        <AuthStudioShell
            mode="register"
            theme={theme}
            setTheme={setTheme}
            backHref="/login"
            backLabel="Kembali"
        >
            <Head title="Daftar Akun — Langit" />

            <div className="text-center mb-5">
                <h1 className="font-heading font-black text-xl text-slate-900 dark:text-white">
                    Daftar Akun
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Daftar dengan Google atau email aktif Anda.
                </p>
            </div>

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

            <motion.a
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                href="/auth/google/redirect?mode=register"
                className="w-full min-h-11 py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 dark:bg-white/[0.04] dark:hover:bg-white/[0.09] border border-slate-300/90 dark:border-white/12 text-slate-800 dark:text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-2xs transition-all"
            >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.2-.9 2.3-2 3l3.2 2.5c1.9-1.7 3-4.3 3-7.3 0-.7-.1-1.4-.2-2.1H12z" />
                    <path fill="#34A853" d="M12 22c2.7 0 5-.9 6.7-2.4l-3.2-2.5c-.9.6-2.1 1-3.5 1-2.7 0-5-1.8-5.8-4.3H2.9v2.6C4.6 19.8 8 22 12 22z" />
                    <path fill="#FBBC05" d="M6.2 13.8c-.2-.6-.3-1.2-.3-1.8s.1-1.2.3-1.8V7.6H2.9C2.3 8.9 2 10.4 2 12s.3 3.1.9 4.4l3.3-2.6z" />
                    <path fill="#4285F4" d="M12 5.9c1.5 0 2.8.5 3.9 1.5l2.9-2.9C17 2.9 14.7 2 12 2 8 2 4.6 4.2 2.9 7.6l3.3 2.6C7 7.7 9.3 5.9 12 5.9z" />
                </svg>
                <span>Daftar dengan Google</span>
            </motion.a>

            <div className="relative my-5 flex items-center justify-center">
                <div className="border-t border-slate-200 dark:border-white/10 w-full" />
                <span className="bg-white dark:bg-[#0B101D] px-3 text-[11px] text-slate-400 whitespace-nowrap">
                    atau
                </span>
                <div className="border-t border-slate-200 dark:border-white/10 w-full" />
            </div>

            <form onSubmit={submit} className="space-y-3.5" noValidate>
                <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Username
                    </label>
                    <div className="relative group">
                        <User className="w-4 h-4 text-slate-400 group-focus-within:text-[#005792] dark:group-focus-within:text-cyan-400 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors" />
                        <input
                            type="text"
                            value={data.username}
                            onChange={(e) => setData('username', e.target.value)}
                            required
                            autoCapitalize="none"
                            placeholder="Contoh: budi_pratama"
                            className={`${inputBaseClass} pl-10 pr-4 border border-slate-300/90 dark:border-white/12 focus:border-[#005792] dark:focus:border-cyan-400`}
                        />
                    </div>
                    {errors.username && <p className="text-xs text-rose-500 mt-1">{errors.username}</p>}
                </div>

                <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Email
                    </label>
                    <div className="relative group">
                        <Mail className="w-4 h-4 text-slate-400 group-focus-within:text-[#005792] dark:group-focus-within:text-cyan-400 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors" />
                        <input
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            required
                            placeholder="nama@email.com"
                            className={`${inputBaseClass} pl-10 pr-4 border border-slate-300/90 dark:border-white/12 focus:border-[#005792] dark:focus:border-cyan-400`}
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
                            {passwordLen}/8
                        </span>
                    </div>
                    <div className="relative group">
                        <Lock className="w-4 h-4 text-slate-400 group-focus-within:text-[#005792] dark:group-focus-within:text-cyan-400 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors" />
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
                            placeholder="Min. 8 karakter (huruf & angka)"
                            className={`${inputBaseClass} pl-10 pr-11 border ${
                                isPasswordTooShort || clientPasswordWarning || errors.password
                                    ? 'border-amber-500 dark:border-amber-500/80 focus:border-amber-500'
                                    : isPasswordValidLen
                                      ? 'border-emerald-500/60 dark:border-emerald-500/60 focus:border-emerald-500'
                                      : 'border-slate-300/90 dark:border-white/12 focus:border-[#005792] dark:focus:border-cyan-400'
                            }`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((v) => !v)}
                            className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
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
                        <p className="text-xs text-rose-500 mt-1.5">{errors.password}</p>
                    )}
                </div>

                <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Ulangi Password
                    </label>
                    <div className="relative group">
                        <Lock className="w-4 h-4 text-slate-400 group-focus-within:text-[#005792] dark:group-focus-within:text-cyan-400 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors" />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            required
                            minLength={8}
                            placeholder="Ulangi password"
                            className={`${inputBaseClass} pl-10 pr-4 border border-slate-300/90 dark:border-white/12 focus:border-[#005792] dark:focus:border-cyan-400`}
                        />
                    </div>
                </div>

                <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={processing}
                    className="w-full min-h-11 py-3 rounded-xl bg-gradient-to-r from-[#005792] via-sky-600 to-cyan-600 hover:from-[#004677] hover:to-cyan-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#005792]/25 transition-all cursor-pointer disabled:opacity-50 mt-2"
                >
                    <UserPlus className="w-4 h-4" />
                    <span>{processing ? 'Mendaftarkan...' : 'Daftar'}</span>
                </motion.button>
            </form>

            <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-5 pt-4 border-t border-slate-200/80 dark:border-white/10">
                Sudah punya akun?{' '}
                <Link href="/login" className="text-[#005792] dark:text-cyan-400 font-bold hover:underline">
                    Masuk
                </Link>
            </p>
        </AuthStudioShell>
    );
}
