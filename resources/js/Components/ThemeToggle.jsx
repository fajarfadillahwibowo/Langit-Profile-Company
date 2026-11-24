import React from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle({ theme, setTheme, className = '', variant = 'default' }) {
    const isSidebar = variant === 'sidebar';

    const containerClass = isSidebar
        ? 'bg-black/25 border-white/20 text-white hover:bg-black/35'
        : 'bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 border-slate-300/80 dark:border-white/10 text-slate-700 dark:text-amber-400';

    return (
        <button
            type="button"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label={theme === 'dark' ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'}
            title={theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
            className={`w-9 h-9 shrink-0 inline-flex items-center justify-center rounded-full border transition-transform active:scale-95 cursor-pointer ${containerClass} ${className}`}
        >
            {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
            ) : (
                <Moon className="w-4 h-4" />
            )}
        </button>
    );
}
