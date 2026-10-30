import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { 
    Camera, Code2, GraduationCap, Cpu, Sparkles, PackageCheck, Handshake,
    ArrowRight, Check, ShieldCheck, Zap
} from 'lucide-react';
import { useQuality } from '@/Context/QualityContext';

/* ── 7 INTEGRATED DIVISIONS PALETTES & THEMES ───────────────────────────── */

const PALETTES_BY_SLUG = {
    'photography-videography': {
        divisionNumber: '01',
        vipLabel: 'Visual & Cinema',
        ribbonText: 'GOLD',
        ribbonColor: 'from-yellow-100 via-yellow-300 to-amber-400',
        ribbonTail: 'border-b-[#2A2002]',
        gradient: 'from-[#2A2002] via-[#634803] to-[#EAB308]',
        cardBorder: 'border-yellow-400/40 hover:border-yellow-300/80',
        glowColor: 'rgba(234, 179, 8, 0.55)',
        badgeBg: 'bg-yellow-950/70 text-yellow-200 border-yellow-400/30',
        tagBg: 'bg-yellow-950/60 border-yellow-400/30 text-yellow-100',
        dotColor: 'bg-yellow-400',
        btnBg: 'bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-300 hover:to-amber-300 text-slate-950 font-black border-yellow-200/60 shadow-yellow-950/50',
        gemColor: 'text-slate-950',
        defaultImage: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80',
        defaultDesc: 'Wedding, Wisuda, Event, Traveling, Drone & Cinema, serta kalibrasi warna presisi standar sinema.',
        defaultTags: ['Sony FX3 Cinema', '4K Aerial Drone', 'Color Grading'],
        serial: '2281 ••••',
        icon: Camera,
        waveType: 'organic',
    },
    'web-development': {
        divisionNumber: '02',
        vipLabel: 'Cyber Architecture',
        ribbonText: 'CYBER',
        ribbonColor: 'from-cyan-200 via-sky-300 to-[#0284C7]',
        ribbonTail: 'border-b-[#02182B]',
        gradient: 'from-[#02182B] via-[#053F61] to-[#0284C7]',
        cardBorder: 'border-sky-400/30 hover:border-sky-400/70',
        glowColor: 'rgba(14, 165, 233, 0.45)',
        badgeBg: 'bg-sky-950/70 text-sky-200 border-sky-400/30',
        tagBg: 'bg-sky-950/60 border-sky-400/25 text-sky-100',
        dotColor: 'bg-sky-400',
        btnBg: 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold border-sky-300/40 shadow-sky-950/40',
        gemColor: 'text-sky-200',
        defaultImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
        defaultDesc: 'Operasi Internal, Company Profile, Portal Pendidikan, SPA 0ms reload, dan skor Lighthouse 99+.',
        defaultTags: ['Laravel 13 & React 19', '0ms Page Reload', 'Lighthouse 99+'],
        serial: '2282 ••••',
        icon: Code2,
        waveType: 'geometric',
    },
    'langit-education': {
        divisionNumber: '03',
        vipLabel: 'Academy & Training',
        ribbonText: 'PRO',
        ribbonColor: 'from-green-100 via-emerald-200 to-green-600',
        ribbonTail: 'border-b-[#03210F]',
        gradient: 'from-[#03210F] via-[#0B4F25] to-[#16A34A]',
        cardBorder: 'border-green-400/35 hover:border-green-300/75',
        glowColor: 'rgba(34, 197, 94, 0.5)',
        badgeBg: 'bg-green-950/70 text-green-200 border-green-400/30',
        tagBg: 'bg-green-950/60 border-green-400/25 text-green-100',
        dotColor: 'bg-green-400',
        btnBg: 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold border-green-300/40 shadow-green-950/40',
        gemColor: 'text-green-200',
        defaultImage: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80',
        defaultDesc: 'Kursus Coding (Robotik/Web/AI), Office, Rakit PC, dan sertifikasi keahlian vokasi digital bersertifikat.',
        defaultTags: ['Robotik & AI Lab', 'Sertifikat Resmi', 'Praktik Industri'],
        serial: '2283 ••••',
        icon: GraduationCap,
        waveType: 'chevron',
    },
    'computer-service': {
        divisionNumber: '04',
        vipLabel: 'Hardware Lab',
        ribbonText: 'QC 99%',
        ribbonColor: 'from-orange-200 via-amber-300 to-orange-600',
        ribbonTail: 'border-b-[#290E01]',
        gradient: 'from-[#290E01] via-[#6B2401] to-[#EA580C]',
        cardBorder: 'border-orange-400/35 hover:border-orange-400/75',
        glowColor: 'rgba(234, 88, 12, 0.5)',
        badgeBg: 'bg-orange-950/70 text-orange-200 border-orange-400/30',
        tagBg: 'bg-orange-950/60 border-orange-400/25 text-orange-100',
        dotColor: 'bg-orange-400',
        btnBg: 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold border-orange-300/40 shadow-orange-950/40',
        gemColor: 'text-orange-200',
        defaultImage: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=1200&q=80',
        defaultDesc: 'Installasi Software, Upgrade SSD, Rakit PC & Sparepart, perbaikan spesialis bergaransi resmi.',
        defaultTags: ['Sparepart Original', 'QC 99% Teruji', 'Garansi Resmi'],
        serial: '2284 ••••',
        icon: Cpu,
        waveType: 'circuit',
    },
    'internship': {
        divisionNumber: '05',
        vipLabel: 'Career Hub',
        ribbonText: 'ELITE',
        ribbonColor: 'from-purple-200 via-fuchsia-300 to-purple-600',
        ribbonTail: 'border-b-[#1A0B2E]',
        gradient: 'from-[#1A0B2E] via-[#3B1261] to-[#7C3AED]',
        cardBorder: 'border-purple-400/30 hover:border-purple-400/70',
        glowColor: 'rgba(139, 92, 246, 0.45)',
        badgeBg: 'bg-purple-950/70 text-purple-200 border-purple-400/30',
        tagBg: 'bg-purple-950/60 border-purple-400/25 text-purple-100',
        dotColor: 'bg-purple-400',
        btnBg: 'bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white font-bold border-purple-300/40 shadow-purple-950/40',
        gemColor: 'text-purple-200',
        defaultImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
        defaultDesc: 'Form Pendaftaran Magang / PKL Industri & Inkubasi nyata untuk mahasiswa dan siswa berprestasi.',
        defaultTags: ['Proyek Klien Riil', 'Akses Studio Lab', 'Portofolio Resmi'],
        serial: '2285 ••••',
        icon: Sparkles,
        waveType: 'organic',
    },
    'sewa-alat': {
        divisionNumber: '06',
        vipLabel: 'Rental Gear',
        ribbonText: 'READY',
        ribbonColor: 'from-cyan-100 via-teal-200 to-cyan-500',
        ribbonTail: 'border-b-[#012229]',
        gradient: 'from-[#012229] via-[#054E5E] to-[#06B6D4]',
        cardBorder: 'border-cyan-300/45 hover:border-cyan-300/85',
        glowColor: 'rgba(6, 182, 212, 0.5)',
        badgeBg: 'bg-cyan-950/70 text-cyan-200 border-cyan-400/30',
        tagBg: 'bg-cyan-950/60 border-cyan-400/25 text-cyan-100',
        dotColor: 'bg-cyan-400',
        btnBg: 'bg-gradient-to-r from-cyan-400 via-teal-400 to-cyan-500 hover:from-cyan-300 hover:to-teal-400 text-slate-950 font-black border-cyan-200/60 shadow-cyan-950/50',
        gemColor: 'text-slate-950',
        defaultImage: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1200&q=80',
        defaultDesc: 'Rental Proyektor + Screen, Smart TV Display & Drone 4K, kamera Sony Cinema Line, dan gear studio.',
        defaultTags: ['Unit Terawat Siap Pakai', 'Kalibrasi Presisi', 'Paket Lengkap'],
        serial: '2286 ••••',
        icon: PackageCheck,
        waveType: 'organic',
    },
    'kolaborasi': {
        divisionNumber: '07',
        vipLabel: 'Strategic Partner',
        ribbonText: 'ALLIANCE',
        ribbonColor: 'from-pink-200 via-rose-300 to-pink-600',
        ribbonTail: 'border-b-[#2B0518]',
        gradient: 'from-[#2B0518] via-[#5C0A33] to-[#BE185D]',
        cardBorder: 'border-pink-400/30 hover:border-pink-400/70',
        glowColor: 'rgba(236, 72, 153, 0.45)',
        badgeBg: 'bg-pink-950/70 text-pink-200 border-pink-400/30',
        tagBg: 'bg-pink-950/60 border-pink-400/25 text-pink-100',
        dotColor: 'bg-pink-400',
        btnBg: 'bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-bold border-pink-300/40 shadow-pink-950/40',
        gemColor: 'text-pink-200',
        defaultImage: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1200&q=80',
        defaultDesc: 'Kemitraan Kampus, Sponsor Event & Vendor B2B, sinergi pengadaan IT serta kerja sama strategis.',
        defaultTags: ['MoU Resmi', 'Co-Branding', 'Sinergi B2B Terpadu'],
        serial: '2287 ••••',
        icon: Handshake,
        waveType: 'organic',
        isWide: true,
    },
};

/* ── INTERACTIVE 3D VIP CARD COMPONENT WITH TOP PHOTO & DISTINCT COLORS ──── */

function VIP3DCard({ card }) {
    const { isHd, getOptimizedImage } = useQuality();
    const cardRef = useRef(null);
    const rafId = useRef(null);
    const rotateX = useMotionValue(0);
    const rotateY = useMotionValue(0);
    const springRotateX = useSpring(rotateX, { stiffness: 280, damping: 24 });
    const springRotateY = useSpring(rotateY, { stiffness: 280, damping: 24 });
    const CardIcon = card.icon || Camera;

    const handleMouseMove = useCallback((e) => {
        if (!cardRef.current || !isHd) return; // In SD mode, skip mouse RAF to keep 60fps silky smooth
        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        if (rafId.current) cancelAnimationFrame(rafId.current);
        rafId.current = requestAnimationFrame(() => {
            // Subtle 3D tilt angle (-5.5 to +5.5 deg)
            const rotX = -((y - centerY) / centerY) * 5.5;
            const rotY = ((x - centerX) / centerX) * 5.5;
            rotateX.set(rotX);
            rotateY.set(rotY);

            if (cardRef.current) {
                cardRef.current.style.setProperty('--glare-x', `${(x / rect.width) * 100}%`);
                cardRef.current.style.setProperty('--glare-y', `${(y / rect.height) * 100}%`);
                cardRef.current.style.setProperty('--glare-op', '0.32');
            }
        });
    }, [rotateX, rotateY, isHd]);

    const handleMouseLeave = useCallback(() => {
        if (rafId.current) cancelAnimationFrame(rafId.current);
        rotateX.set(0);
        rotateY.set(0);
        if (cardRef.current) {
            cardRef.current.style.setProperty('--glare-op', '0');
        }
    }, [rotateX, rotateY]);

    useEffect(() => {
        return () => {
            if (rafId.current) cancelAnimationFrame(rafId.current);
        };
    }, []);

    return (
        <motion.div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ 
                rotateX: isHd ? springRotateX : 0,
                rotateY: isHd ? springRotateY : 0,
                transformStyle: isHd ? 'preserve-3d' : 'flat',
                transformPerspective: isHd ? 1000 : 0,
            }}
            className={`group relative rounded-[28px] bg-gradient-to-br ${card.gradient} text-white transition-all duration-300 hover:shadow-2xl hover:-translate-y-1.5 select-none flex flex-col justify-between overflow-hidden border ${card.cardBorder} ${card.isWide ? 'lg:col-span-3 min-h-[380px]' : 'min-h-[440px]'} will-change-transform`}
        >
            {/* 3D Physical Embossed Plastic Bevel Highlight & Shadow */}
            <div 
                className="absolute inset-0 pointer-events-none rounded-[28px] z-20" 
                style={{
                    boxShadow: 'inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.4), inset 0 -2px 4px 0 rgba(0, 0, 0, 0.45)'
                }}
            />

            {/* Specular Glossy Glare Reflection (Tracks cursor via CSS var, zero re-renders) */}
            <div 
                className="absolute inset-0 pointer-events-none rounded-[28px] transition-opacity duration-300 z-20"
                style={{
                    background: `radial-gradient(circle at var(--glare-x, 50%) var(--glare-y, 50%), rgba(255,255,255,0.38) 0%, rgba(255,255,255,0) 65%)`,
                    opacity: 'var(--glare-op, 0)',
                }}
            />

            {/* Ambient Background Glow on Hover */}
            <div 
                className="absolute -inset-1 rounded-[30px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl pointer-events-none -z-10"
                style={{ backgroundColor: card.glowColor }}
            />

            {/* ── BAGIAN ATAS: FOTO VISUAL CARD ──────────────────────────── */}
            <div className={`relative w-full ${card.isWide ? 'h-48 sm:h-56' : 'h-44 sm:h-48'} overflow-hidden rounded-t-[26px] bg-black/40 shrink-0`}>
                <img
                    src={getOptimizedImage(card.image_url || card.defaultImage, { sdWidth: 480, hdWidth: 1200 })}
                    alt={card.title}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                    loading="lazy"
                />

                {/* Dark Vignette & Gradient Overlay to smoothly blend into the card body */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent pointer-events-none" />

                {/* Top-Left: Division Badge with Icon */}
                <div className="absolute top-3.5 left-4 z-10 flex items-center gap-1.5 px-3 py-1 rounded-full backdrop-blur-md border shadow-md transition-transform group-hover:translate-x-0.5"
                     style={{ backgroundColor: 'rgba(0, 0, 0, 0.55)', borderColor: 'rgba(255, 255, 255, 0.25)' }}>
                    <CardIcon className="w-3.5 h-3.5" style={{ color: card.accentColor || '#38BDF8' }} />
                    <span className="text-[10px] sm:text-[11px] font-mono font-bold tracking-wider uppercase text-white/95">
                        {card.divisionNumber} • {card.vipLabel}
                    </span>
                </div>

                {/* Top-Right: Bookmark VIP Ribbon */}
                <div className="absolute top-0 right-6 w-9 h-11 pointer-events-none drop-shadow-lg z-20 transition-transform group-hover:translate-y-0.5">
                    <div className={`w-full h-full bg-gradient-to-b ${card.ribbonColor} rounded-b-xs relative flex items-center justify-center shadow-md`}>
                        <div className={`absolute bottom-0 left-0 w-0 h-0 border-l-[18px] border-l-transparent border-r-[18px] border-r-transparent border-b-[9px] ${card.ribbonTail}`} />
                        <span className="text-[8.5px] font-mono font-black text-slate-950 uppercase -mt-1 tracking-tighter">
                            {card.ribbonText}
                        </span>
                    </div>
                </div>

                {/* Subtle Organic / Wave Overlay */}
                <div className="absolute bottom-0 inset-x-0 h-6 pointer-events-none opacity-20">
                    <svg className="w-full h-full object-cover" viewBox="0 0 400 30" fill="none" preserveAspectRatio="none">
                        <path d="M0 15 C100 0, 200 30, 400 10 L400 30 L0 30 Z" fill="white" />
                    </svg>
                </div>
            </div>

            {/* ── BAGIAN BAWAH: DESKRIPSI & INFORMASI CARD ───────────────── */}
            <div className="relative z-10 p-5 sm:p-6 flex-1 flex flex-col justify-between">
                <div>
                    {/* Header: Title & VIP Subtitle */}
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="font-heading font-extrabold text-xl sm:text-2xl text-white tracking-tight leading-snug drop-shadow-sm group-hover:translate-x-0.5 transition-transform">
                                {card.title}
                            </h3>
                            <div className="flex items-center gap-1.5 mt-1 text-white/80 font-mono text-[11px] font-semibold tracking-wider uppercase">
                                <span>{card.vipLabel}</span>
                                {/* Golden Crown Icon */}
                                <svg className="w-3.5 h-3.5 text-amber-300 drop-shadow-[0_1px_4px_rgba(251,191,36,0.6)]" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/>
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Body: Deskripsi Card (Editable from Admin Portal) */}
                    <p className="text-white/85 text-xs sm:text-[13px] leading-relaxed mt-3 line-clamp-3">
                        {card.description || card.defaultDesc}
                    </p>

                    {/* Tag Highlights / Key Features */}
                    {card.tags && card.tags.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 mt-3.5">
                            {card.tags.map((tag, i) => (
                                <span 
                                    key={i} 
                                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full backdrop-blur-sm border text-[10px] sm:text-[11px] font-mono shadow-xs ${card.tagBg}`}
                                >
                                    <span className={`w-1 h-1 rounded-full ${card.dotColor}`} />
                                    <span>{tag}</span>
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── FOOTER: SERIAL CODE & ACTION BUTTON ────────────────── */}
                <div className="pt-4 mt-4 border-t border-white/15 flex items-center justify-between">
                    {/* Left: Serial Code */}
                    <div className="flex items-center gap-2">
                        <span className="font-mono text-xs sm:text-sm font-bold text-white/80 tracking-widest drop-shadow-sm">
                            {card.serial_number || card.serial}
                        </span>
                    </div>

                    {/* Right: Buka Divisi Action Button with Diamond Gem Icon */}
                    <Link
                        href={card.slug ? (card.slug.startsWith('/') ? card.slug : `/layanan/${card.slug}`) : '#'}
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-full border shadow-md transition-all duration-200 group-hover:scale-105 font-heading text-xs uppercase tracking-wider ${card.btnBg}`}
                    >
                        <span>Buka Divisi</span>
                        {/* 3D Faceted Diamond Gem Icon */}
                        <svg className={`w-3.5 h-3.5 shrink-0 drop-shadow-xs ${card.gemColor}`} viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2L2 9l10 13 10-13-10-7zm0 2.5l7.5 5.5-4.5 9-3-14.5zm-1 0v14.5l-3-14.5 4-5.5z"/>
                        </svg>
                    </Link>
                </div>
            </div>
        </motion.div>
    );
}

/* ── MAIN COMPONENT ─────────────────────────────────────────────────────── */

export default function ScrollingServiceCards({ services = [] }) {
    // Merge database services with our tailored VIP card palettes
    const integratedCards = useMemo(() => {
        // Base slug order for canonical 7 divisions
        const canonicalSlugs = [
            'photography-videography',
            'web-development',
            'langit-education',
            'computer-service',
            'internship',
            'sewa-alat',
            'kolaborasi',
        ];

        return canonicalSlugs.map((slug) => {
            const palette = PALETTES_BY_SLUG[slug] || PALETTES_BY_SLUG['photography-videography'];
            // Find matched service from database props
            const dbService = services.find((s) => s.slug === slug);

            if (dbService) {
                // Parse tags if stored as string or array
                let parsedTags = dbService.tags;
                if (typeof parsedTags === 'string') {
                    try {
                        parsedTags = JSON.parse(parsedTags);
                    } catch (e) {
                        parsedTags = parsedTags.split(',').map((t) => t.trim());
                    }
                }

                return {
                    id: dbService.id || slug,
                    slug: dbService.slug || slug,
                    title: dbService.name || palette.title,
                    description: dbService.description || palette.defaultDesc,
                    image_url: dbService.image_url || palette.defaultImage,
                    accentColor: dbService.accent_color || '#0EA5E9',
                    vipLabel: dbService.vip_label || palette.vipLabel,
                    ribbonText: dbService.ribbon_text || palette.ribbonText,
                    serial_number: dbService.serial_number || palette.serial,
                    tags: Array.isArray(parsedTags) && parsedTags.length > 0 ? parsedTags : palette.defaultTags,
                    ...palette,
                };
            }

            // Fallback to static defaults if DB record not passed
            return {
                id: slug,
                slug,
                title: slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
                description: palette.defaultDesc,
                image_url: palette.defaultImage,
                tags: palette.defaultTags,
                serial_number: palette.serial,
                ...palette,
            };
        });
    }, [services]);

    return (
        <section className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-16 lg:py-24">
            {/* Header info */}
            <div className="mb-10">
                <div className="flex items-center gap-2 text-[#005792] dark:text-[#38BDF8] font-mono text-[11px] uppercase tracking-widest mb-2 font-bold">
                    <span className="w-2 h-2 rounded-full bg-[#005792] dark:bg-[#38BDF8] animate-pulse" />
                    <span>3D VIP Membership Pass & Integrated Divisions</span>
                </div>
                <h2 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl text-slate-900 dark:text-white tracking-tight">
                    Tujuh Divisi
                    <span className="block text-[#005792] dark:text-[#38BDF8]">
                        Layanan <span className="font-editorial italic font-normal tracking-normal text-[#005792] dark:text-[#38BDF8]">Terintegrasi</span>
                    </span>
                </h2>
            </div>

            {/* 3D VIP CARDS GRID (With Top Photos, Bottom Descriptions & Distinct Service Colors) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
                {integratedCards.map((card) => (
                    <VIP3DCard key={card.id} card={card} />
                ))}
            </div>
        </section>
    );
}
