import React from 'react';
import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowLeft, Sun, Moon } from 'lucide-react';
import AnimatedAmbientBackdrop from '@/Components/AnimatedAmbientBackdrop';

export default function AuthStudioShell({
    mode = 'login', // 'login' | 'register'
    theme = 'dark',
    setTheme,
    backHref = '/',
    backLabel = 'Kembali',
    children,
}) {
    const isRegister = mode === 'register';

    return (
        <div className="min-h-dvh bg-[#EDF9FC] text-slate-800 dark:bg-[#050810] dark:text-slate-100 font-sans relative overflow-x-clip transition-colors duration-300 flex flex-col justify-center items-center px-4 py-6 sm:py-10">
            {/* Flowing Animated Background (Aurora + Light Ribbon + Drifting Bokeh Orbs) */}
            <AnimatedAmbientBackdrop variant="adaptive" />

            <div className="relative z-10 w-full max-w-md space-y-5">
                {/* Minimal Top Bar */}
                <div className="flex items-center justify-between gap-2">
                    <Link
                        href={backHref}
                        className="min-h-10 px-3.5 py-2 rounded-full bg-white/80 hover:bg-white dark:bg-white/[0.06] dark:hover:bg-white/[0.12] border border-slate-200/90 dark:border-white/10 backdrop-blur-md text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-[#005792] dark:hover:text-cyan-300 inline-flex items-center gap-1.5 transition-all shadow-xs"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>{backLabel}</span>
                    </Link>

                    <button
                        type="button"
                        onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                        aria-label="Ganti Tema Tampilan"
                        title={theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
                        className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center bg-white/85 hover:bg-white dark:bg-white/[0.08] dark:hover:bg-white/[0.15] text-slate-700 dark:text-amber-400 border border-slate-200/90 dark:border-white/10 backdrop-blur-md transition-all active:scale-95 shadow-xs cursor-pointer"
                    >
                        {theme === 'dark' ? (
                            <Sun className="w-4 h-4 text-amber-400" />
                        ) : (
                            <Moon className="w-4 h-4 text-slate-700" />
                        )}
                    </button>
                </div>

                {/* Centered Glassmorphic Card */}
                <motion.div
                    initial={{ opacity: 0, y: 18, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                    className="relative rounded-3xl bg-white/95 dark:bg-[#0B101D]/92 border border-slate-200/90 dark:border-white/12 backdrop-blur-md shadow-2xl shadow-[#005792]/10 dark:shadow-black/70 overflow-hidden transition-colors duration-300"
                >
                    <div className="h-1 w-full bg-gradient-to-r from-[#005792] via-cyan-400 to-indigo-500" />

                    <div className="p-6 sm:p-8">
                        {/* Brand Mark */}
                        <div className="text-center mb-5">
                            <Link href="/" className="inline-flex items-center justify-center group">
                                <span
                                    className="font-etna font-bold text-2xl sm:text-[26px] tracking-tight text-[#005792] dark:text-cyan-400 flex items-center gap-1.5 leading-none"
                                    style={{ fontFamily: "'Etna Sans Serif', 'Etna', sans-serif" }}
                                >
                                    langit
                                    <span className="w-2 h-2 rounded-full bg-cyan-500 animate-hud-pulse shadow-[0_0_8px_rgba(6,182,212,0.85)] shrink-0" />
                                </span>
                            </Link>
                        </div>

                        {/* Mode Switcher */}
                        <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-100/90 dark:bg-white/[0.05] border border-slate-200/80 dark:border-white/10 mb-6">
                            <Link
                                href="/login"
                                className={`relative py-2 rounded-xl text-xs font-bold text-center transition-colors ${
                                    !isRegister
                                        ? 'text-white'
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                }`}
                            >
                                {!isRegister && (
                                    <motion.span
                                        layoutId="auth-mode-pill"
                                        transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                                        className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#005792] to-sky-600 shadow-md shadow-[#005792]/30"
                                    />
                                )}
                                <span className="relative z-10">Masuk</span>
                            </Link>
                            <Link
                                href="/register"
                                className={`relative py-2 rounded-xl text-xs font-bold text-center transition-colors ${
                                    isRegister
                                        ? 'text-white'
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                }`}
                            >
                                {isRegister && (
                                    <motion.span
                                        layoutId="auth-mode-pill"
                                        transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                                        className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#005792] to-sky-600 shadow-md shadow-[#005792]/30"
                                    />
                                )}
                                <span className="relative z-10">Daftar</span>
                            </Link>
                        </div>

                        {children}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
