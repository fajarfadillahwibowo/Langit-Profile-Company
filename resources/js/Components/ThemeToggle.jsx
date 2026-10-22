import React from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle({ theme, setTheme, className = '', showLabel = true }) {
    return (
        <div className={`flex items-center p-0.5 sm:p-1 rounded-full bg-slate-200/80 dark:bg-slate-800/80 border border-slate-300/80 dark:border-white/10 shadow-inner ${className}`}>
            <button
                type="button"
                onClick={() => setTheme('light')}
                className={`flex items-center justify-center gap-1.5 rounded-full text-xs font-semibold transition-all duration-200 px-2.5 sm:px-3 py-1 ${
                    theme === 'light'
                        ? 'bg-white text-amber-600 shadow-sm font-bold scale-[1.02]'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
                title="Pilih Tema Terang (Tema Utama)"
            >
                <Sun className="w-3.5 h-3.5 shrink-0" />
                {showLabel && <span className="text-[11px]">Terang</span>}
            </button>
            <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`flex items-center justify-center gap-1.5 rounded-full text-xs font-semibold transition-all duration-200 px-2.5 sm:px-3 py-1 ${
                    theme === 'dark'
                        ? 'bg-slate-900 text-indigo-300 shadow-sm font-bold scale-[1.02]'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
                title="Pilih Tema Gelap (Tema Kedua)"
            >
                <Moon className="w-3.5 h-3.5 shrink-0" />
                {showLabel && <span className="text-[11px]">Gelap</span>}
            </button>
        </div>
    );
}
