import React, { useRef, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence, useSpring, useMotionValue } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { Link } from '@inertiajs/react';

// Preset HUD notifications for Langit's 7 divisions
const DIVISION_PRESETS = {
    'photography-videography': {
        text: '🎬 120+ Project Selesai • Klik untuk Lihat Showreel',
        accent: '#F59E0B',
        rgb: '245, 158, 11',
    },
    'web-development': {
        text: '⚡ Lighthouse 99% Ready • Estimasi Harga Instan',
        accent: '#0EA5E9',
        rgb: '14, 165, 233',
    },
    'computer-service': {
        text: '🛠️ Teknisi Siaga • Lacak Nota Servis Real-time',
        accent: '#F97316',
        rgb: '249, 115, 22',
    },
    'sewa-alat': {
        text: '📷 45+ Unit Kamera & Lensa Ready Hari Ini',
        accent: '#14B8A6',
        rgb: '20, 184, 166',
    },
    'langit-education': {
        text: '🎓 Batch Baru Dibuka • Sisa 5 Kuota Kelas',
        accent: '#10B981',
        rgb: '16, 185, 129',
    },
    'internship': {
        text: '🚀 Open Recruitment • Magang Berbasis Real Project',
        accent: '#8B5CF6',
        rgb: '139, 92, 246',
    },
    'kolaborasi': {
        text: '🤝 Terbuka untuk Event, Kampus & Partnership B2B',
        accent: '#EC4899',
        rgb: '236, 72, 153',
    },
};

// Helper to convert hex to RGB triplet
function hexToRgb(hex) {
    if (!hex) return '14, 165, 233';
    let cleanHex = hex.replace('#', '');
    if (cleanHex.length === 3) {
        cleanHex = cleanHex.split('').map(c => c + c).join('');
    }
    const num = parseInt(cleanHex, 16);
    if (isNaN(num)) return '14, 165, 233';
    return `${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}`;
}

export default function InteractiveBentoCard({
    as: Component = 'div',
    href,
    serviceSlug,
    accentColor,
    notificationText,
    badge,
    children,
    className = '',
    enableTilt = true,
    enableMagneticHUD = true,
    onClick,
    ...props
}) {
    const cardRef = useRef(null);
    const [isHovered, setIsHovered] = useState(false);
    const rafId = useRef(null);

    // Division preset fallback
    const preset = serviceSlug ? DIVISION_PRESETS[serviceSlug] : null;
    const finalAccent = accentColor || preset?.accent || '#0EA5E9';
    const finalRgb = preset?.rgb || hexToRgb(finalAccent);
    const hudNotification = notificationText || preset?.text || '✨ Klik untuk Eksplorasi Layanan Terpadu';

    // Magnetic HUD X position with high-responsiveness physics spring
    const mouseXPos = useMotionValue(0);
    const springX = useSpring(mouseXPos, { stiffness: 450, damping: 25 });

    // Handle high performance mousemove without React re-renders
    const handleMouseMove = useCallback((e) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Cancel previous frame if any
        if (rafId.current) cancelAnimationFrame(rafId.current);

        rafId.current = requestAnimationFrame(() => {
            if (!cardRef.current) return;
            cardRef.current.style.setProperty('--mouse-x', `${x}px`);
            cardRef.current.style.setProperty('--mouse-y', `${y}px`);
            cardRef.current.style.setProperty('--accent-rgb', finalRgb);

            // Center-relative offset for magnetic HUD (clamped to prevent overflowing)
            if (enableMagneticHUD) {
                const relativeX = x - rect.width / 2;
                const clampedX = Math.max(-rect.width * 0.35, Math.min(rect.width * 0.35, relativeX * 0.4));
                mouseXPos.set(clampedX);
            }
        });
    }, [finalRgb, enableMagneticHUD, mouseXPos]);

    const handleMouseEnter = () => {
        setIsHovered(true);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        if (rafId.current) cancelAnimationFrame(rafId.current);
        mouseXPos.set(0);
    };

    useEffect(() => {
        return () => {
            if (rafId.current) cancelAnimationFrame(rafId.current);
        };
    }, []);

    // Determine wrapping element: if href is provided and no custom Component passed, use Inertia Link
    const Element = href && Component === 'div' ? Link : Component;
    const elementProps = href ? { href, ...props } : props;

    return (
        <div className="relative group isolate w-full h-full flex flex-col">
            {/* FLOATING HUD NOTIFICATION PILL */}
            <AnimatePresence>
                {isHovered && (
                    <motion.div
                        initial={{ opacity: 0, y: 12, scale: 0.88, filter: 'blur(6px)' }}
                        animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, y: 6, scale: 0.94, filter: 'blur(4px)' }}
                        transition={{ type: 'spring', stiffness: 450, damping: 28 }}
                        style={enableMagneticHUD ? { x: springX } : {}}
                        className="pointer-events-none absolute -top-11 left-1/2 -translate-x-1/2 z-40 whitespace-nowrap hidden sm:flex items-center"
                    >
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/92 dark:bg-[#07090E]/95 backdrop-blur-2xl border border-white/20 text-white shadow-2xl shadow-black/80 ring-1 ring-white/10">
                            {/* Animated Pulse Dot with dynamic division accent */}
                            <span className="relative flex h-2 w-2">
                                <span 
                                    className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                                    style={{ backgroundColor: finalAccent }}
                                />
                                <span 
                                    className="relative inline-flex rounded-full h-2 w-2 shadow-[0_0_8px]"
                                    style={{ backgroundColor: finalAccent, boxShadow: `0 0 10px ${finalAccent}` }}
                                />
                            </span>

                            {/* Dynamic 1-line Notification text */}
                            <span className="text-[11px] font-mono font-medium tracking-tight text-slate-100 flex items-center gap-1.5">
                                {hudNotification}
                            </span>

                            {/* Micro Action Icon */}
                            <ArrowUpRight 
                                className="w-3 h-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" 
                                style={{ color: finalAccent }}
                            />
                        </div>

                        {/* Subtle pointer chevron down */}
                        <div 
                            className="w-2 h-2 bg-slate-950/92 border-r border-b border-white/20 rotate-45 mx-auto -mt-1"
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* INTERACTIVE BENTO CARD BODY */}
            <Element
                ref={cardRef}
                onMouseEnter={handleMouseEnter}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                onClick={onClick}
                style={{
                    '--accent-rgb': finalRgb,
                }}
                className={`
                    spotlight-card block w-full h-full relative overflow-hidden rounded-2xl sm:rounded-3xl
                    ${className.includes('bg-') ? '' : 'bg-white dark:bg-[#0D131F]/90'}
                    ${className.includes('border') ? '' : 'border border-slate-200/90 dark:border-white/10'}
                    shadow-sm dark:shadow-none
                    hover:shadow-xl hover:shadow-[rgba(0,0,0,0.08)] dark:hover:shadow-[rgba(0,0,0,0.5)]
                    transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
                    hover:-translate-y-0.5 will-change-transform
                    ${className}
                `}
                {...elementProps}
            >
                {/* Micro Ambient Accent Corner Light */}
                <div 
                    className="absolute -top-12 -right-12 w-28 h-28 rounded-full blur-3xl opacity-0 group-hover:opacity-30 dark:group-hover:opacity-25 transition-opacity duration-500 pointer-events-none"
                    style={{ backgroundColor: finalAccent }}
                />

                {/* Card Content Slot */}
                <div className="relative z-10 w-full h-full">
                    {children}
                </div>
            </Element>
        </div>
    );
}
