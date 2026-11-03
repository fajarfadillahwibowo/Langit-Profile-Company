import React from 'react';
import { Link } from '@inertiajs/react';

/**
 * Lightweight, Clean Bento Card for Header & Navigation Menus
 * Tanpa animasi pop-up HUD / tooltip mengambang yang berat,
 * memberikan interaktivitas yang cepat, bersih, dan hemat memori browser.
 */
export default function InteractiveBentoCard({
    as: Component = 'div',
    href,
    serviceSlug,
    accentColor,
    notificationText,
    badge,
    children,
    className = '',
    enableTilt = false,
    enableMagneticHUD = false,
    onClick,
    ...props
}) {
    // Determine wrapping element: if href is provided and no custom Component passed, use Inertia Link
    const Element = href && Component === 'div' ? Link : Component;
    const elementProps = href ? { href, ...props } : props;

    return (
        <Element
            onClick={onClick}
            className={`
                group block w-full h-full relative overflow-hidden rounded-2xl
                ${className.includes('bg-') ? '' : 'bg-white dark:bg-[#0D131F]/90'}
                ${className.includes('border') ? '' : 'border border-slate-200/90 dark:border-white/10'}
                shadow-xs hover:shadow-md
                transition-all duration-200 ease-out
                hover:-translate-y-0.5
                ${className}
            `}
            {...elementProps}
        >
            {/* Card Content Slot */}
            <div className="relative z-10 w-full h-full">
                {children}
            </div>
        </Element>
    );
}
