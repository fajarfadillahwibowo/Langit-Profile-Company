import React from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle({ theme, setTheme, className = '', showLabel = false, variant = 'default' }) {
    const isSidebar = variant === 'sidebar';

    const inactiveClass = isSidebar
        ? 'text-white/80 hover:text-white'
        : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white';

    const containerBg = isSidebar
        ? 'bg-black/25 border-white/20'
        : 'bg-slate-200/80 dark:bg-white/10 border-slate-300/80 dark:border-white/10';

    return (
        <>
        <button type="button" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label={theme === 'dark' ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'}
            className={`sm:hidden min-w-11 min-h-11 shrink-0 inline-flex items-center justify-center rounded-full border ${containerBg} ${inactiveClass} ${className}`}>
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
        <div className={`hidden sm:flex items-center p-0.5 rounded-full border shadow-inner ${containerBg} ${className}`}>
            <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`p-1.5 rounded-full transition-all duration-200 cursor-pointer ${
                    theme === 'dark'
                        ? 'bg-slate-900 text-indigo-300 shadow-sm font-bold scale-[1.05]'
                        : inactiveClass
                }`}
                title="Mode Gelap (Tema Utama)"
                aria-label="Mode Gelap"
            >
                <Moon className="w-3.5 h-3.5 shrink-0" />
                {showLabel && <span className="text-[11px]">Gelap</span>}
            </button>
            <button
                type="button"
                onClick={() => setTheme('light')}
                className={`p-1.5 rounded-full transition-all duration-200 cursor-pointer ${
                    theme === 'light'
                        ? 'bg-white text-amber-500 shadow-sm font-bold scale-[1.05]'
                        : inactiveClass
                }`}
                title="Mode Terang (Tema Kedua)"
                aria-label="Mode Terang"
            >
                <Sun className="w-3.5 h-3.5 shrink-0" />
                {showLabel && <span className="text-[11px]">Terang</span>}
            </button>
        </div>
        </>
    );
}
