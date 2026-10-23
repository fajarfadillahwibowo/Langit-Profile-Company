import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { 
    Code2, Server, ShieldCheck, Database, CreditCard, Gauge, Cloud,
    ChevronUp, ChevronDown, ArrowRight, Play, Pause, Sparkles, Zap, Layers
} from 'lucide-react';

/* ── 3D CLAYMORPHIC & GLASSMORPHIC VISUAL ASSETS (WEB DEV PILLARS) ───────── */

// 1. Visual SPA & Zero-Reload
function VisualSPA() {
    return (
        <div className="relative w-full h-full min-h-[140px] sm:min-h-[170px] flex items-center justify-center select-none overflow-hidden rounded-2xl bg-black/15 dark:bg-black/30 backdrop-blur-sm border border-white/20">
            <div className="absolute w-24 h-24 rounded-full bg-cyan-400/30 blur-2xl pointer-events-none" />
            <div className="relative z-10 flex items-center justify-center scale-90 sm:scale-100">
                {/* 3D Browser Window */}
                <div className="relative w-28 h-20 rounded-2xl bg-gradient-to-b from-sky-500 via-sky-700 to-slate-950 p-1 border border-sky-300/40 shadow-xl">
                    <div className="w-full h-full rounded-xl bg-slate-950 relative overflow-hidden flex flex-col justify-between p-1.5">
                        <div className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        </div>
                        {/* Dynamic Wave */}
                        <div className="py-0.5">
                            <svg viewBox="0 0 100 28" className="w-full h-6 overflow-visible">
                                <path
                                    d="M 5,14 Q 25,2 45,14 T 85,14 Q 95,24 100,14"
                                    fill="none"
                                    stroke="#38BDF8"
                                    strokeWidth="3.5"
                                    strokeLinecap="round"
                                />
                            </svg>
                        </div>
                    </div>
                    {/* Monitor Stand */}
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-2 rounded-t bg-sky-900" />
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-12 h-1 rounded-full bg-sky-950 border border-sky-400/30" />
                </div>

                {/* Floating 0ms Pill */}
                <motion.div 
                    animate={{ y: [0, -5, 0], rotate: [4, 8, 4] }}
                    transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute -right-2 -bottom-2 px-2 py-0.5 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-600 text-white font-mono font-bold text-[10px] shadow-md border border-white/40 flex items-center gap-1"
                >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-ping" />
                    <span>0ms SPA</span>
                </motion.div>
                
                {/* Floating Code Tag */}
                <motion.div 
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
                    className="absolute -top-2 -left-2 w-7 h-7 rounded-lg bg-gradient-to-br from-sky-400 to-indigo-600 text-white font-mono font-bold text-[10px] flex items-center justify-center shadow-md border border-white/40"
                >
                    &lt;/&gt;
                </motion.div>
            </div>
        </div>
    );
}

// 2. Visual Backend & Laravel Core
function VisualBackend() {
    return (
        <div className="relative w-full h-full min-h-[140px] sm:min-h-[170px] flex items-center justify-center select-none overflow-hidden rounded-2xl bg-black/15 dark:bg-black/30 backdrop-blur-sm border border-white/20">
            <div className="absolute w-24 h-24 rounded-full bg-orange-500/30 blur-2xl pointer-events-none" />
            <div className="relative z-10 flex items-center justify-center scale-90 sm:scale-100">
                {/* 3D Server Node Stack */}
                <div className="relative flex flex-col gap-1.5">
                    {[1, 2, 3].map((rack) => (
                        <div key={rack} className="w-24 h-5 rounded-lg bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-orange-500/30 p-1 flex items-center justify-between shadow-md">
                            <div className="flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            </div>
                            <div className="w-10 h-1 rounded-full bg-slate-700" />
                        </div>
                    ))}
                </div>

                {/* Laravel Artisan Badge */}
                <motion.div 
                    animate={{ y: [0, -5, 0], rotate: [-4, 2, -4] }}
                    transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute -right-3 -top-1 px-2 py-0.5 rounded-lg bg-gradient-to-r from-orange-500 to-red-600 text-white font-mono font-bold text-[9px] shadow-lg border border-white/40"
                >
                    Laravel 13
                </motion.div>

                {/* Async Queue Indicator */}
                <motion.div 
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 2.9, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
                    className="absolute -left-3 -bottom-1 px-2 py-0.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-mono font-bold text-[9px] shadow-md border border-white/50 flex items-center gap-1"
                >
                    <Zap className="w-2.5 h-2.5" />
                    <span>Queue OK</span>
                </motion.div>
            </div>
        </div>
    );
}

// 3. Visual Cyber Security
function VisualSecurity() {
    return (
        <div className="relative w-full h-full min-h-[140px] sm:min-h-[170px] flex items-center justify-center select-none overflow-hidden rounded-2xl bg-black/15 dark:bg-black/30 backdrop-blur-sm border border-white/20">
            <div className="absolute w-24 h-24 rounded-full bg-emerald-400/30 blur-2xl pointer-events-none" />
            <div className="relative z-10 flex flex-col items-center justify-center scale-90 sm:scale-100">
                {/* 3D Shield Base */}
                <motion.div 
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="relative w-20 h-22 rounded-t-2xl rounded-b-[28px] bg-gradient-to-br from-emerald-400 via-emerald-600 to-teal-950 p-1 border border-emerald-300/60 shadow-xl flex items-center justify-center"
                >
                    <div className="w-full h-full rounded-t-xl rounded-b-[24px] bg-slate-950/80 flex flex-col items-center justify-center p-2 relative">
                        {/* Padlock Icon */}
                        <div className="w-7 h-5 rounded-md bg-gradient-to-tr from-emerald-400 to-teal-300 shadow-md flex items-center justify-center mt-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />
                        </div>
                        <div className="w-4 h-3.5 rounded-t-full border-2 border-emerald-300 -mt-7 -mb-0.5 pointer-events-none" />
                    </div>
                </motion.div>

                {/* OWASP Badge */}
                <motion.div 
                    animate={{ y: [0, -5, 0], rotate: [6, 10, 6] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
                    className="absolute -right-2 top-0 px-2 py-0.5 rounded-lg bg-gradient-to-r from-emerald-400 to-teal-500 text-emerald-950 font-mono font-black text-[9px] shadow-md border border-white/60"
                >
                    OWASP Top 10
                </motion.div>

                {/* SSL Grade A+ */}
                <motion.div 
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute -left-2 bottom-1 px-1.5 py-0.5 rounded-lg bg-white/90 text-emerald-800 font-mono font-bold text-[9px] shadow-md border border-emerald-300"
                >
                    SSL A+
                </motion.div>
            </div>
        </div>
    );
}

// 4. Visual Database & Storage
function VisualDatabase() {
    return (
        <div className="relative w-full h-full min-h-[140px] sm:min-h-[170px] flex items-center justify-center select-none overflow-hidden rounded-2xl bg-black/15 dark:bg-black/30 backdrop-blur-sm border border-white/20">
            <div className="absolute w-24 h-24 rounded-full bg-purple-500/30 blur-2xl pointer-events-none" />
            <div className="relative z-10 flex items-center justify-center scale-90 sm:scale-100">
                {/* 3D Cylinder Disks */}
                <div className="relative flex flex-col items-center">
                    {[1, 2, 3].map((disk, idx) => (
                        <div 
                            key={disk} 
                            className={`w-20 h-6 rounded-full bg-gradient-to-r from-purple-600 via-indigo-500 to-purple-800 border border-purple-300/50 shadow-md flex items-center justify-between px-3 ${idx > 0 ? '-mt-2' : ''}`}
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                            <span className="w-8 h-1 rounded-full bg-white/40" />
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        </div>
                    ))}
                </div>

                {/* Redis Badge */}
                <motion.div 
                    animate={{ y: [0, -5, 0], rotate: [-6, 0, -6] }}
                    transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute -right-3 -top-1 px-2 py-0.5 rounded-lg bg-gradient-to-r from-red-500 to-purple-600 text-white font-mono font-bold text-[9px] shadow-lg border border-white/40 flex items-center gap-1"
                >
                    <Zap className="w-2.5 h-2.5 text-amber-300" />
                    <span>Redis Cache</span>
                </motion.div>

                {/* ACID Badge */}
                <motion.div 
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
                    className="absolute -left-3 -bottom-1 px-2 py-0.5 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-mono font-bold text-[9px] shadow-md border border-white/50"
                >
                    ACID 100%
                </motion.div>
            </div>
        </div>
    );
}

// 5. Visual Payment Gateway
function VisualPayment() {
    return (
        <div className="relative w-full h-full min-h-[140px] sm:min-h-[170px] flex items-center justify-center select-none overflow-hidden rounded-2xl bg-black/15 dark:bg-black/30 backdrop-blur-sm border border-white/20">
            <div className="absolute w-24 h-24 rounded-full bg-amber-400/30 blur-2xl pointer-events-none" />
            <div className="relative z-10 flex items-center justify-center scale-90 sm:scale-100">
                {/* 3D Phone & QRIS Card */}
                <div className="relative w-16 h-24 rounded-2xl bg-gradient-to-b from-amber-500 via-amber-600 to-slate-950 p-1 border border-amber-300/60 shadow-xl flex flex-col justify-between">
                    <div className="w-6 h-1 rounded-full bg-black/40 mx-auto" />
                    <div className="w-full h-14 rounded-xl bg-slate-950 p-1.5 flex flex-col items-center justify-center">
                        <div className="w-8 h-8 rounded-lg bg-white p-0.5 flex flex-wrap gap-0.5 items-center justify-center shadow-inner">
                            <span className="w-2.5 h-2.5 bg-black rounded-xs" />
                            <span className="w-2.5 h-2.5 bg-black rounded-xs" />
                            <span className="w-2.5 h-2.5 bg-black rounded-xs" />
                            <span className="w-2.5 h-2.5 bg-amber-500 rounded-xs" />
                        </div>
                    </div>
                    <div className="w-3 h-3 rounded-full bg-black/30 mx-auto" />
                </div>

                {/* Floating Credit Card */}
                <motion.div 
                    animate={{ y: [0, -6, 0], rotate: [-8, -4, -8] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute -right-3 top-2 w-16 h-10 rounded-lg bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-500 p-1 border border-white/80 shadow-lg flex flex-col justify-between"
                >
                    <div className="w-3 h-2 rounded bg-amber-700/60" />
                    <span className="w-8 h-0.5 rounded-full bg-amber-950/40" />
                </motion.div>

                {/* QRIS / Xendit Badge */}
                <motion.div 
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
                    className="absolute -left-3 -bottom-1 px-2 py-0.5 rounded-lg bg-white dark:bg-slate-900 border border-amber-400/50 text-amber-700 dark:text-amber-400 font-mono font-bold text-[9px] shadow"
                >
                    QRIS & VA
                </motion.div>
            </div>
        </div>
    );
}

// 6. Visual Performance & Lighthouse
function VisualLighthouse() {
    return (
        <div className="relative w-full h-full min-h-[140px] sm:min-h-[170px] flex items-center justify-center select-none overflow-hidden rounded-2xl bg-black/15 dark:bg-black/30 backdrop-blur-sm border border-white/20">
            <div className="absolute w-24 h-24 rounded-full bg-teal-400/30 blur-2xl pointer-events-none" />
            <div className="relative z-10 flex flex-col items-center justify-center scale-90 sm:scale-100">
                {/* 3D Speedometer Gauge */}
                <motion.div 
                    animate={{ rotate: [-2, 2, -2] }}
                    transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
                    className="relative w-22 h-14 rounded-t-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 p-1 border-t-2 border-x-2 border-white/40 shadow-xl flex items-end justify-center pb-1"
                >
                    <div className="w-18 h-10 rounded-t-full bg-slate-950 relative overflow-hidden flex items-end justify-center">
                        <div className="w-1 h-8 bg-emerald-400 rounded-full origin-bottom rotate-45 shadow-[0_0_8px_#34d399]" />
                        <div className="w-4 h-4 rounded-full bg-slate-900 border-2 border-emerald-400 absolute -bottom-2" />
                    </div>
                </motion.div>

                {/* Score 99+ Badge */}
                <motion.div 
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute -right-3 top-0 px-2 py-0.5 rounded-lg bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 font-mono font-black text-[10px] shadow-lg border border-white/60"
                >
                    100 / 100
                </motion.div>

                {/* Core Web Vitals */}
                <motion.div 
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
                    className="absolute -left-3 -bottom-1 px-2 py-0.5 rounded-lg bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-mono font-bold text-[9px] shadow-md border border-white/50"
                >
                    LCP &lt; 1.2s
                </motion.div>
            </div>
        </div>
    );
}

// 7. Visual Cloud & DevOps
function VisualDevOps() {
    return (
        <div className="relative w-full h-full min-h-[140px] sm:min-h-[170px] flex items-center justify-center select-none overflow-hidden rounded-2xl bg-black/15 dark:bg-black/30 backdrop-blur-sm border border-white/20">
            <div className="absolute w-24 h-24 rounded-full bg-pink-500/30 blur-2xl pointer-events-none" />
            <div className="relative z-10 flex items-center justify-center scale-90 sm:scale-100">
                {/* 3D Cloud Node */}
                <motion.div 
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
                    className="relative w-22 h-14 rounded-2xl bg-gradient-to-tr from-pink-600 via-rose-500 to-indigo-600 border border-pink-300/60 shadow-xl flex items-center justify-center"
                >
                    <Cloud className="w-8 h-8 text-white drop-shadow" />
                </motion.div>

                {/* CI/CD Infinity Badge */}
                <motion.div 
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
                    className="absolute -right-2 -top-1 w-7 h-7 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-[10px] flex items-center justify-center shadow-lg border border-white/60"
                >
                    ∞
                </motion.div>

                {/* Docker / Cloudflare Tag */}
                <motion.div 
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
                    className="absolute -left-3 -bottom-1 px-2 py-0.5 rounded-lg bg-gradient-to-r from-pink-500 to-rose-600 text-white font-mono font-bold text-[9px] shadow-md border border-white/50"
                >
                    Zero-Downtime
                </motion.div>
            </div>
        </div>
    );
}

/* ── 7 WEB DEVELOPMENT ARCHITECTURE PILLARS DECK DATA ───────────────────── */

const WEB_PILLARS_DECK = [
    {
        id: 'spa-frontend',
        pillarNumber: '01',
        badge: 'FRONTEND ARCHITECTURE',
        title: 'Single Page Application (SPA) & 0ms Reload',
        desc: 'Navigasi instan secepat kilat tanpa layar putih menggunakan Inertia.js v3, React 19, dan prefetching rute otomatis untuk pengalaman pengguna layaknya aplikasi mobile native.',
        highlights: 'Inertia.js v3 • React 19 • Instant Page Transitions',
        gradient: 'from-[#0284C7] via-[#0369A1] to-[#075985]',
        accent: '#0284C7',
        ctaText: 'Konsultasi Arsitektur SPA',
        link: '/konsultasi?topik=spa-frontend',
        visual: VisualSPA,
    },
    {
        id: 'laravel-backend',
        pillarNumber: '02',
        badge: 'BACKEND CORE',
        title: 'Laravel 13 Enterprise Backend & Microservices',
        desc: 'Fondasi server kokoh berbasis Laravel 13 & PHP 8.4 dengan arsitektur modular, asynchronous background queue, dependency injection, dan RESTful / GraphQL API siap integrasi ribuan request.',
        highlights: 'Laravel 13 • Async Queue Jobs • REST & GraphQL API',
        gradient: 'from-[#EA580C] via-[#C2410C] to-[#9A3412]',
        accent: '#EA580C',
        ctaText: 'Jelajahi Solusi Backend',
        link: '/konsultasi?topik=laravel-backend',
        visual: VisualBackend,
    },
    {
        id: 'cyber-security',
        pillarNumber: '03',
        badge: 'CYBER SECURITY',
        title: 'OWASP Top 10 Hardened & Enkripsi Multi-Tier',
        desc: 'Perlindungan menyeluruh terhadap ancaman SQL Injection, Cross-Site Scripting (XSS), CSRF attack, Brute Force rate limiting, proteksi DDoS Cloudflare, serta enkripsi data sensitif AES-256.',
        highlights: 'OWASP Top 10 • Bcrypt 12 Rounds • CSRF & DDoS Guard',
        gradient: 'from-[#059669] via-[#047857] to-[#065F46]',
        accent: '#059669',
        ctaText: 'Audit Keamanan Web',
        link: '/konsultasi?topik=web-security',
        visual: VisualSecurity,
    },
    {
        id: 'database-scaling',
        pillarNumber: '04',
        badge: 'DATABASE & STORAGE',
        title: 'High-Concurrency MySQL & In-Memory Redis Cache',
        desc: 'Struktur database relasional terindeks penuh dengan ACID compliance, relasi Eloquent teroptimasi bebas masalah N+1, serta Redis memory caching untuk pemrosesan jutaan data per menit.',
        highlights: 'ACID Compliant • Redis Memory Cache • Zero N+1 Queries',
        gradient: 'from-[#7C3AED] via-[#6D28D9] to-[#5B21B6]',
        accent: '#7C3AED',
        ctaText: 'Optimasi Database',
        link: '/konsultasi?topik=database-scaling',
        visual: VisualDatabase,
    },
    {
        id: 'payment-gateway',
        pillarNumber: '05',
        badge: 'PAYMENT & GATEWAY',
        title: 'Payment Gateway & Multi-Channel API Automation',
        desc: 'Penyelesaian transaksi otomatis melalui integrasi resmi Midtrans & Xendit (QRIS, Virtual Account, Kartu Kredit, E-Wallet), rekonsiliasi webhook otomatis, dan pembuatan invoice PDF instan.',
        highlights: 'QRIS & Semua Bank VA • Webhook Otomatis • Split Payment',
        gradient: 'from-[#D97706] via-[#B45309] to-[#92400E]',
        accent: '#D97706',
        ctaText: 'Integrasikan Pembayaran',
        link: '/konsultasi?topik=payment-gateway',
        visual: VisualPayment,
    },
    {
        id: 'lighthouse-performance',
        pillarNumber: '06',
        badge: 'PERFORMANCE & SEO',
        title: 'Skor Google Lighthouse 99+ & Core Web Vitals',
        desc: 'Arsitektur web yang lolos uji Core Web Vitals (LCP < 1.2s, CLS 0, INP cepat), kompresi WebP gambar modern, CSS minification Tailwind v4, serta metadata SEO OpenGraph & Schema.org rich snippets.',
        highlights: 'Lighthouse 99-100 • Core Web Vitals • Schema.org SEO',
        gradient: 'from-[#0D9488] via-[#0F766E] to-[#115E59]',
        accent: '#0D9488',
        ctaText: 'Cek Kinerja Website',
        link: '/konsultasi?topik=lighthouse-performance',
        visual: VisualLighthouse,
    },
    {
        id: 'cloud-devops',
        pillarNumber: '07',
        badge: 'DEVOPS & CLOUD',
        title: 'Cloud Deployment & Zero-Downtime CI/CD Pipeline',
        desc: 'Penyebaran otomatis berbasis GitHub Actions CI/CD tanpa downtime (zero-downtime deployment), isolasi container Docker, jaringan CDN global Cloudflare, dan pemantauan uptime server 24/7.',
        highlights: 'Zero-Downtime Deploy • Docker Container • Uptime 99.9%',
        gradient: 'from-[#DB2777] via-[#BE185D] to-[#9D174D]',
        accent: '#DB2777',
        ctaText: 'Konsultasi Infrastruktur Cloud',
        link: '/konsultasi?topik=cloud-devops',
        visual: VisualDevOps,
    },
];

/* ── MAIN COMPONENT: SCROLLING WEB DEV PILLARS ──────────────────────────── */

export default function ScrollingWebDevPillars() {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [isUserHovering, setIsUserHovering] = useState(false);
    const containerRef = useRef(null);
    const wheelLockRef = useRef(false);
    const touchStartYRef = useRef(null);
    const total = WEB_PILLARS_DECK.length;

    // Navigation functions
    const goToNext = useCallback(() => {
        setActiveIndex((prev) => (prev + 1) % total);
    }, [total]);

    const goToPrev = useCallback(() => {
        setActiveIndex((prev) => (prev - 1 + total) % total);
    }, [total]);

    const goToIndex = useCallback((idx) => {
        setActiveIndex(idx);
    }, []);

    // Autoplay ticker (4.5s)
    useEffect(() => {
        if (isPaused || isUserHovering) return;
        const interval = setInterval(() => {
            goToNext();
        }, 4500);
        return () => clearInterval(interval);
    }, [isPaused, isUserHovering, goToNext]);

    // Keyboard navigation when user is on the section
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            const isInView = rect.top < window.innerHeight && rect.bottom > 0;
            if (!isInView) return;

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                goToNext();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                goToPrev();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [goToNext, goToPrev]);

    // Mouse wheel handling with lock for smooth card transitions
    const handleWheel = (e) => {
        if (wheelLockRef.current) return;
        const delta = e.deltaY;
        if (Math.abs(delta) < 20) return;

        wheelLockRef.current = true;
        if (delta > 0) {
            goToNext();
        } else {
            goToPrev();
        }

        setTimeout(() => {
            wheelLockRef.current = false;
        }, 380);
    };

    // Touch swipe handling for mobile
    const handleTouchStart = (e) => {
        touchStartYRef.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e) => {
        if (touchStartYRef.current === null) return;
        const deltaY = e.changedTouches[0].clientY - touchStartYRef.current;
        touchStartYRef.current = null;

        if (Math.abs(deltaY) > 35) {
            if (deltaY < 0) {
                goToNext();
            } else {
                goToPrev();
            }
        }
    };

    const activeItem = WEB_PILLARS_DECK[activeIndex];

    return (
        <section className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-16 lg:py-24">
            {/* Header Info */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
                <div>
                    <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 font-mono text-[11px] uppercase tracking-widest mb-2 font-bold">
                        <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                        <span>Interactive Engineering Architecture Experience</span>
                    </div>
                    <h2 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl text-slate-900 dark:text-white tracking-tight">
                        Tujuh Pilar Rekayasa
                        <span className="block text-gradient-cyan-violet">
                            Web & <span className="font-editorial italic font-normal tracking-normal text-cyan-500 dark:text-cyan-400">Sistem Digital</span>
                        </span>
                    </h2>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm max-w-xs leading-relaxed">
                        Scroll dengan mouse wheel, klik kartu, atau geser untuk melihat 7 standar arsitektur sistem web modern yang kami bangun.
                    </p>
                </div>
            </div>

            {/* STAGE CONTAINER (Matches Pinterest Reference Aesthetic with Tech Cyan-Indigo Cyber Ribbon) */}
            <div 
                ref={containerRef}
                onMouseEnter={() => setIsUserHovering(true)}
                onMouseLeave={() => setIsUserHovering(false)}
                onWheel={handleWheel}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                className="relative rounded-[32px] sm:rounded-[40px] bg-gradient-to-br from-sky-50/50 via-white/80 to-indigo-50/40 dark:from-[#070e1b] dark:via-[#0a1224] dark:to-[#060b16] border border-cyan-200/60 dark:border-cyan-500/20 p-6 sm:p-10 lg:p-12 shadow-2xl overflow-hidden min-h-[580px] sm:min-h-[640px] md:min-h-[660px] flex flex-col justify-between select-none"
            >
                {/* Cyber Ribbon SVG Path */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <svg 
                        viewBox="0 0 1000 700" 
                        fill="none" 
                        className="w-full h-full object-cover opacity-65 dark:opacity-20"
                        preserveAspectRatio="none"
                    >
                        <path 
                            d="M -80 380 C 140 320, 160 520, 320 540 C 480 560, 480 220, 680 180 C 860 140, 920 480, 1100 450" 
                            stroke="#0284C7" 
                            strokeWidth="56" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                        />
                    </svg>

                    {/* Ambient Glow Orbs */}
                    <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-cyan-400/10 blur-[100px]" />
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-indigo-500/10 blur-[120px]" />
                </div>

                {/* Stage Header Toolbar */}
                <div className="relative z-40 flex items-center justify-between gap-3 text-xs font-mono">
                    <div className="flex items-center gap-2 bg-white/80 dark:bg-black/40 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-white/10 shadow-xs">
                        <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                            Pilar {activeItem.pillarNumber} dari 07
                        </span>
                        <span className="text-slate-400 dark:text-slate-500">•</span>
                        <span className="hidden sm:inline text-slate-600 dark:text-slate-300 font-semibold">
                            {activeItem.badge}
                        </span>
                    </div>

                    {/* Navigation Buttons and Autoplay Status */}
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setIsPaused((prev) => !prev)}
                            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 dark:bg-black/40 backdrop-blur-md border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 text-[11px] font-bold hover:bg-white dark:hover:bg-black/60 transition-colors shadow-xs"
                            title={isPaused ? "Lanjutkan Putar Otomatis" : "Jeda Putar Otomatis"}
                        >
                            {isPaused ? <Play className="w-3 h-3 text-cyan-500" /> : <Pause className="w-3 h-3 text-amber-500" />}
                            <span>{isPaused ? "Play" : "Pause"}</span>
                        </button>

                        <div className="flex items-center gap-1 bg-white/80 dark:bg-black/40 backdrop-blur-md p-1 rounded-full border border-slate-200 dark:border-white/10 shadow-xs">
                            <button
                                type="button"
                                onClick={goToPrev}
                                className="w-7 h-7 rounded-full flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
                                aria-label="Pilar Sebelumnya"
                            >
                                <ChevronUp className="w-4 h-4" />
                            </button>
                            <button
                                type="button"
                                onClick={goToNext}
                                className="w-7 h-7 rounded-full flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
                                aria-label="Pilar Selanjutnya"
                            >
                                <ChevronDown className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* VERTICAL SCROLL CAROUSEL STACK */}
                <div className="relative z-30 flex-1 flex items-center justify-center my-4 min-h-[380px] sm:min-h-[420px] md:min-h-[440px]">
                    <div className="relative w-full max-w-2xl h-[260px] sm:h-[280px] md:h-[300px] flex items-center justify-center">
                        {WEB_PILLARS_DECK.map((pillar, idx) => {
                            // Calculate shortest circular distance
                            let diff = idx - activeIndex;
                            if (diff > total / 2) diff -= total;
                            if (diff < -total / 2) diff += total;

                            const isActive = diff === 0;
                            const isNear = Math.abs(diff) === 1;

                            // Calculate vertical positioning & perspective transforms
                            let yOffset = 0;
                            let scale = 1;
                            let opacity = 1;
                            let zIndex = 30;

                            if (isActive) {
                                yOffset = 0;
                                scale = 1;
                                opacity = 1;
                                zIndex = 30;
                            } else if (diff === -1) {
                                yOffset = -95;
                                scale = 0.88;
                                opacity = 0.45;
                                zIndex = 20;
                            } else if (diff === 1) {
                                yOffset = 95;
                                scale = 0.88;
                                opacity = 0.45;
                                zIndex = 20;
                            } else if (diff === -2) {
                                yOffset = -165;
                                scale = 0.76;
                                opacity = 0.18;
                                zIndex = 10;
                            } else if (diff === 2) {
                                yOffset = 165;
                                scale = 0.76;
                                opacity = 0.18;
                                zIndex = 10;
                            } else {
                                yOffset = diff < 0 ? -220 : 220;
                                scale = 0.65;
                                opacity = 0;
                                zIndex = 0;
                            }

                            const VisualComponent = pillar.visual;

                            return (
                                <motion.div
                                    key={pillar.id}
                                    onClick={() => goToIndex(idx)}
                                    animate={{
                                        y: yOffset,
                                        scale,
                                        opacity,
                                        zIndex,
                                        filter: isActive 
                                            ? 'blur(0px) brightness(1)' 
                                            : isNear 
                                            ? 'blur(1px) brightness(0.95)' 
                                            : 'blur(3px) brightness(0.85)',
                                    }}
                                    transition={{
                                        type: 'spring',
                                        stiffness: 260,
                                        damping: 24,
                                        mass: 0.8,
                                    }}
                                    style={{
                                        pointerEvents: isActive ? 'auto' : 'auto',
                                        transformOrigin: 'center center',
                                    }}
                                    className={`absolute inset-0 w-full rounded-[28px] sm:rounded-[34px] p-6 sm:p-7 md:p-8 bg-gradient-to-r ${pillar.gradient} text-white shadow-[0_20px_50px_-10px_rgba(0,0,0,0.45)] border border-white/25 backdrop-blur-xl flex flex-col justify-between cursor-pointer transition-shadow hover:shadow-[0_25px_60px_-8px_rgba(0,0,0,0.55)] overflow-hidden`}
                                >
                                    {/* Glass reflection gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-white/15 via-white/5 to-transparent pointer-events-none rounded-[28px] sm:rounded-[34px]" />
                                    
                                    {/* Dynamic Background Noise / Pattern */}
                                    <div className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full bg-white/10 blur-2xl pointer-events-none" />

                                    {/* Card Top: Pillar Tag & Number */}
                                    <div className="relative z-10 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="px-3 py-1 rounded-full bg-black/25 backdrop-blur-md border border-white/20 text-[10px] sm:text-xs font-mono font-bold tracking-wider uppercase text-cyan-200">
                                                {pillar.badge}
                                            </span>
                                            <span className="text-white/60 font-mono text-xs font-bold">
                                                #{pillar.pillarNumber}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Card Content & 3D Visual Asset */}
                                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-4 items-center my-auto">
                                        <div className="md:col-span-8 space-y-2">
                                            <h3 className="font-heading font-extrabold text-xl sm:text-2xl md:text-3xl text-white tracking-tight leading-tight">
                                                {pillar.title}
                                            </h3>
                                            <p className="text-white/85 text-xs sm:text-sm line-clamp-2 sm:line-clamp-3 leading-relaxed">
                                                {pillar.desc}
                                            </p>
                                        </div>

                                        {/* Right Column: 3D Visual Artwork */}
                                        <div className="hidden md:flex md:col-span-4 items-center justify-center">
                                            <div className="w-full max-w-[190px] h-[130px]">
                                                <VisualComponent />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Card Footer: Metric & Action CTA */}
                                    <div className="relative z-10 flex items-center justify-between gap-3 pt-3 border-t border-white/15">
                                        <div className="flex items-center gap-2 text-[11px] sm:text-xs font-mono text-white/80">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                            <span className="truncate max-w-[200px] sm:max-w-none">
                                                {pillar.highlights}
                                            </span>
                                        </div>

                                        <Link
                                            href={pillar.link}
                                            onClick={(e) => e.stopPropagation()}
                                            className="px-4 py-2 rounded-xl bg-white text-slate-950 font-heading font-bold text-xs sm:text-sm shadow-md hover:bg-slate-100 transition-all flex items-center gap-1.5 shrink-0 group hover:scale-105 active:scale-95"
                                        >
                                            <span>{pillar.ctaText}</span>
                                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* Stage Footer: Hint and Pagination Indicators */}
                <div className="relative z-40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono pt-2">
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-[11px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                        <span>Gunakan tombol panah atau scroll mouse untuk berpindah pilar arsitektur</span>
                    </div>

                    {/* Pagination Number Pills */}
                    <div className="flex items-center gap-1.5 flex-wrap justify-center">
                        {WEB_PILLARS_DECK.map((p, idx) => {
                            const isCurrent = idx === activeIndex;
                            return (
                                <button
                                    key={p.id}
                                    type="button"
                                    onClick={() => goToIndex(idx)}
                                    className={`transition-all duration-300 rounded-full cursor-pointer flex items-center gap-1 font-mono ${
                                        isCurrent 
                                            ? 'px-3 py-1 bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold text-xs shadow-md scale-105' 
                                            : 'w-7 h-7 justify-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/10 text-xs'
                                    }`}
                                    aria-label={`Pilar ${p.pillarNumber}`}
                                >
                                    <span>{p.pillarNumber}</span>
                                    {isCurrent && (
                                        <span className="hidden sm:inline text-[10px] uppercase font-bold text-cyan-400 dark:text-cyan-700">
                                            • {p.badge.split(' ')[0]}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}
