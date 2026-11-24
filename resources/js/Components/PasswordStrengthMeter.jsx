import React from 'react';
import { Check, X } from 'lucide-react';

export function evaluatePasswordStrength(password = '') {
    const hasMinLength = password.length >= 8;
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasExtra = /[^a-zA-Z0-9]/.test(password) || (/[a-z]/.test(password) && /[A-Z]/.test(password));

    const isValid = hasMinLength && hasLetter && hasNumber;

    let score = 0;
    if (hasMinLength) score += 1;
    if (hasLetter) score += 1;
    if (hasNumber) score += 1;
    if (hasMinLength && hasLetter && hasNumber && (password.length >= 10 || hasExtra)) {
        score = 4;
    }

    let level = 'Kosong';
    let colorClass = 'bg-slate-300 dark:bg-slate-700';
    let textClass = 'text-slate-500 dark:text-slate-400';

    if (password.length === 0) {
        level = '';
    } else if (!isValid) {
        level = 'Lemah';
        colorClass = 'bg-rose-500';
        textClass = 'text-rose-600 dark:text-rose-400';
    } else if (score === 3) {
        level = 'Sedang';
        colorClass = 'bg-amber-500';
        textClass = 'text-amber-600 dark:text-amber-400';
    } else {
        level = 'Kuat';
        colorClass = 'bg-emerald-500';
        textClass = 'text-emerald-600 dark:text-emerald-400';
    }

    return { hasMinLength, hasLetter, hasNumber, isValid, score, level, colorClass, textClass };
}

export default function PasswordStrengthMeter({ password = '' }) {
    const { hasMinLength, hasLetter, hasNumber, level, colorClass, textClass, score } =
        evaluatePasswordStrength(password);

    if (!password) {
        return (
            <p className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                Minimal 8 karakter dengan kombinasi huruf dan angka.
            </p>
        );
    }

    const activeBars = level === 'Lemah' ? 1 : level === 'Sedang' ? 2 : 3;

    return (
        <div className="mt-2 space-y-1.5">
            <div className="flex items-center gap-1.5">
                {[1, 2, 3].map((idx) => (
                    <div
                        key={idx}
                        className={`h-1.5 flex-1 rounded-full transition-colors duration-200 ${
                            idx <= activeBars ? colorClass : 'bg-slate-200 dark:bg-slate-800'
                        }`}
                    />
                ))}
                <span className={`ml-1 text-[11px] font-bold ${textClass}`}>
                    {level}
                </span>
            </div>

            <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px]">
                <span className={`inline-flex items-center gap-1 ${hasMinLength ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}>
                    {hasMinLength ? <Check className="w-3 h-3" /> : <X className="w-3 h-3 text-rose-400" />}
                    Min. 8 karakter
                </span>
                <span className={`inline-flex items-center gap-1 ${hasLetter ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}>
                    {hasLetter ? <Check className="w-3 h-3" /> : <X className="w-3 h-3 text-rose-400" />}
                    Huruf (A-Z)
                </span>
                <span className={`inline-flex items-center gap-1 ${hasNumber ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}>
                    {hasNumber ? <Check className="w-3 h-3" /> : <X className="w-3 h-3 text-rose-400" />}
                    Angka (0-9)
                </span>
            </div>
        </div>
    );
}
