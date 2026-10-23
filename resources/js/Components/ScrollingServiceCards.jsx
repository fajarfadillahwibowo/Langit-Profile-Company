import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { 
    Camera, Code2, GraduationCap, Cpu, Sparkles, PackageCheck, Handshake,
    ArrowRight, Check, ShieldCheck, Zap
} from 'lucide-react';

/* ── 7 INTEGRATED DIVISIONS DATA (MODELED AFTER 3D VIP CARDS REFERENCE) ───── */

const DIVISIONS_VIP_CARDS = [
    {
        id: 'photography-videography',
        divisionNumber: '01',
        title: 'Photography & Videography',
        vipLabel: 'Visual & Cinema',
        ribbonText: 'GOLD',
        ribbonColor: 'from-sky-200 via-sky-300 to-[#005792]',
        ribbonTail: 'border-b-[#002B49]',
        tagline: 'Wedding, Wisuda, Event, Traveling, Drone & Cinema',
        desc: 'Wedding, Wisuda, Event, Traveling, Drone & Cinema, serta kalibrasi warna presisi standar sinema.',
        tags: ['Sony FX3 Cinema', '4K Aerial Drone', 'Color Grading'],
        serial: '2281 ••••',
        slug: '/layanan/photography-videography',
        gradient: 'from-[#002B49] via-[#005792] to-[#0077B6]',
        glowColor: 'rgba(0,87,146,0.45)',
        icon: Camera,
        waveType: 'organic',
    },
    {
        id: 'web-development',
        divisionNumber: '02',
        title: 'Web Development',
        vipLabel: 'Cyber Architecture',
        ribbonText: 'CYBER',
        ribbonColor: 'from-cyan-200 via-sky-300 to-[#005792]',
        ribbonTail: 'border-b-[#003354]',
        tagline: 'Operasi Internal, Company Profile, Portal Pendidikan',
        desc: 'Operasi Internal, Company Profile, Portal Pendidikan, SPA 0ms reload, dan skor Lighthouse 99+.',
        tags: ['Laravel 13 & React 19', '0ms Page Reload', 'Lighthouse 99+'],
        serial: '2282 ••••',
        slug: '/layanan/web-development',
        gradient: 'from-[#003354] via-[#005792] to-[#0284C7]',
        glowColor: 'rgba(0,87,146,0.45)',
        icon: Code2,
        waveType: 'geometric',
    },
    {
        id: 'langit-education',
        divisionNumber: '03',
        title: 'Langit Education',
        vipLabel: 'Academy & Training',
        ribbonText: 'PRO',
        ribbonColor: 'from-blue-200 via-sky-300 to-[#005792]',
        ribbonTail: 'border-b-[#003B64]',
        tagline: 'Kursus Coding (Robotik/Web/AI), Office, Rakit PC',
        desc: 'Kursus Coding (Robotik/Web/AI), Office, Rakit PC, dan sertifikasi keahlian vokasi digital bersertifikat.',
        tags: ['Robotik & AI Lab', 'Sertifikat Resmi', 'Praktik Industri'],
        serial: '2283 ••••',
        slug: '/layanan/langit-education',
        gradient: 'from-[#003B64] via-[#005792] to-[#0096C7]',
        glowColor: 'rgba(0,87,146,0.45)',
        icon: GraduationCap,
        waveType: 'chevron', // Exact match to geometric reference card
    },
    {
        id: 'computer-service',
        divisionNumber: '04',
        title: 'Computer Service',
        vipLabel: 'Hardware Lab',
        ribbonText: 'QC 99%',
        ribbonColor: 'from-sky-300 via-blue-300 to-[#005792]',
        ribbonTail: 'border-b-[#00243D]',
        tagline: 'Installasi Software, Upgrade SSD, Rakit PC & Sparepart',
        desc: 'Installasi Software, Upgrade SSD, Rakit PC & Sparepart, perbaikan spesialis bergaransi resmi.',
        tags: ['Sparepart Original', 'QC 99% Teruji', 'Garansi Resmi'],
        serial: '2284 ••••',
        slug: '/layanan/computer-service',
        gradient: 'from-[#00243D] via-[#005792] to-[#0284C7]',
        glowColor: 'rgba(0,87,146,0.45)',
        icon: Cpu,
        waveType: 'circuit',
    },
    {
        id: 'internship',
        divisionNumber: '05',
        title: 'Internship',
        vipLabel: 'Career Hub',
        ribbonText: 'ELITE',
        ribbonColor: 'from-sky-200 via-indigo-300 to-[#005792]',
        ribbonTail: 'border-b-[#00365B]',
        tagline: 'Form Pendaftaran Magang / PKL Industri & Inkubasi',
        desc: 'Form Pendaftaran Magang / PKL Industri & Inkubasi nyata untuk mahasiswa dan siswa berprestasi.',
        tags: ['Proyek Klien Riil', 'Akses Studio Lab', 'Portofolio Resmi'],
        serial: '2285 ••••',
        slug: '/layanan/internship',
        gradient: 'from-[#00365B] via-[#005792] to-[#38BDF8]',
        glowColor: 'rgba(0,87,146,0.45)',
        icon: Sparkles,
        waveType: 'organic',
    },
    {
        id: 'sewa-alat',
        divisionNumber: '06',
        title: 'Sewa Alat',
        vipLabel: 'Rental Gear',
        ribbonText: 'READY',
        ribbonColor: 'from-cyan-300 via-sky-300 to-[#005792]',
        ribbonTail: 'border-b-[#004270]',
        tagline: 'Rental Proyektor + Screen, Smart TV Display & Drone 4K',
        desc: 'Rental Proyektor + Screen, Smart TV Display & Drone 4K, kamera Sony Cinema Line, dan gear studio.',
        tags: ['Unit Terawat Siap Pakai', 'Kalibrasi Presisi', 'Paket Lengkap'],
        serial: '2286 ••••',
        slug: '/layanan/sewa-alat',
        gradient: 'from-[#004270] via-[#005792] to-[#0EA5E9]',
        glowColor: 'rgba(0,87,146,0.45)',
        icon: PackageCheck,
        waveType: 'organic',
    },
    {
        id: 'kolaborasi',
        divisionNumber: '07',
        title: 'Kolaborasi',
        vipLabel: 'Strategic Partner',
        ribbonText: 'ALLIANCE',
        ribbonColor: 'from-sky-200 via-blue-300 to-[#005792]',
        ribbonTail: 'border-b-[#001E33]',
        tagline: 'Kemitraan Kampus, Sponsor Event & Vendor B2B',
        desc: 'Kemitraan Kampus, Sponsor Event & Vendor B2B, sinergi pengadaan IT serta kerja sama strategis.',
        tags: ['MoU Resmi', 'Co-Branding', 'Sinergi B2B Terpadu'],
        serial: '2287 ••••',
        slug: '/layanan/kolaborasi',
        gradient: 'from-[#001E33] via-[#005792] to-[#0077B6]',
        glowColor: 'rgba(0,87,146,0.45)',
        icon: Handshake,
        waveType: 'organic',
        isWide: true,
    },
];

/* ── INTERACTIVE 3D VIP CARD COMPONENT ──────────────────────────────────── */

function VIP3DCard({ card }) {
    const [rotateX, setRotateX] = useState(0);
    const [rotateY, setRotateY] = useState(0);
    const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });
    const CardIcon = card.icon;

    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        // Subtle 3D tilt angle (-7 to +7 deg)
        const rotX = -((y - centerY) / centerY) * 7.5;
        const rotY = ((x - centerX) / centerX) * 7.5;

        setRotateX(rotX);
        setRotateY(rotY);
        setGlare({
            x: (x / rect.width) * 100,
            y: (y / rect.height) * 100,
            opacity: 0.35,
        });
    };

    const handleMouseLeave = () => {
        setRotateX(0);
        setRotateY(0);
        setGlare({ x: 50, y: 50, opacity: 0 });
    };

    return (
        <motion.div
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            animate={{
                rotateX,
                rotateY,
                transformPerspective: 1000,
            }}
            transition={{ type: 'spring', stiffness: 320, damping: 25 }}
            style={{ transformStyle: 'preserve-3d' }}
            className={`group relative rounded-[28px] p-6 sm:p-7 bg-gradient-to-br ${card.gradient} text-white transition-all duration-300 hover:shadow-2xl select-none flex flex-col justify-between overflow-hidden border border-white/25 ${card.isWide ? 'lg:col-span-3 min-h-[260px]' : 'min-h-[290px]'}`}
        >
            {/* 3D Physical Embossed Plastic Bevel Highlight & Shadow */}
            <div 
                className="absolute inset-0 pointer-events-none rounded-[28px]" 
                style={{
                    boxShadow: 'inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.45), inset 0 -2px 4px 0 rgba(0, 0, 0, 0.35)'
                }}
            />

            {/* Specular Glossy Glare Reflection (Tracks cursor) */}
            <div 
                className="absolute inset-0 pointer-events-none rounded-[28px] transition-opacity duration-300"
                style={{
                    background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,0.42) 0%, rgba(255,255,255,0) 60%)`,
                    opacity: glare.opacity,
                }}
            />

            {/* Reference Image Bookmark Ribbon at Top-Right */}
            <div className="absolute top-0 right-7 w-8 h-10 pointer-events-none drop-shadow-md z-20">
                <div className={`w-full h-full bg-gradient-to-b ${card.ribbonColor} rounded-b-xs relative flex items-center justify-center`}>
                    <div className={`absolute bottom-0 left-0 w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-b-[8px] ${card.ribbonTail}`} />
                    <span className="text-[8px] font-mono font-black text-slate-950 uppercase -mt-1 tracking-tighter">
                        {card.ribbonText}
                    </span>
                </div>
            </div>

            {/* Organic / Geometric Background Layers (Directly from Reference Image!) */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[28px] opacity-15">
                {card.waveType === 'chevron' ? (
                    // Chevron/Triangular geometric layers (Like the Green Reference Card!)
                    <svg className="w-full h-full object-cover" viewBox="0 0 400 240" fill="none">
                        <path d="M200 20 L380 180 L20 180 Z" stroke="white" strokeWidth="24" strokeOpacity="0.4" />
                        <path d="M200 70 L350 210 L50 210 Z" stroke="white" strokeWidth="20" strokeOpacity="0.6" />
                        <path d="M200 120 L320 230 L80 230 Z" stroke="white" strokeWidth="16" strokeOpacity="0.8" />
                    </svg>
                ) : (
                    // Smooth contour waves (Like the Purple Reference Card!)
                    <svg className="w-full h-full object-cover" viewBox="0 0 400 240" fill="none">
                        <path d="M-20 70 C80 140, 150 30, 260 90 C360 150, 410 50, 480 100 L480 260 L-20 260 Z" fill="white" />
                        <path d="M-40 130 C60 190, 170 90, 270 150 C370 210, 430 120, 500 170 L500 260 L-40 260 Z" fill="white" fillOpacity="0.5" />
                    </svg>
                )}
                {/* Large Watermark Icon */}
                <div className="absolute -right-5 -bottom-5 w-36 h-36 text-white/10 flex items-center justify-center pointer-events-none">
                    <CardIcon className="w-32 h-32 stroke-[1.2]" />
                </div>
            </div>

            {/* ── CARD CONTENT ── */}
            <div className="relative z-10">
                {/* Top Header: Title & VIP Subtitle */}
                <div className="flex items-start justify-between pr-12">
                    <div>
                        <h3 className="font-heading font-extrabold text-xl sm:text-2xl text-white tracking-tight leading-snug drop-shadow-sm group-hover:translate-x-0.5 transition-transform">
                            {card.title}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-0.5 text-white/80 font-mono text-[11px] font-semibold tracking-wider uppercase">
                            <span>{card.vipLabel}</span>
                            {/* Golden Crown Icon */}
                            <svg className="w-3.5 h-3.5 text-amber-300 drop-shadow-[0_1px_4px_rgba(251,191,36,0.6)]" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/>
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Body: Description */}
                <p className="text-white/85 text-xs sm:text-[13px] leading-relaxed mt-4 line-clamp-3">
                    {card.desc}
                </p>

                {/* 3 Highlights Tag Pills */}
                <div className="flex flex-wrap items-center gap-1.5 mt-3.5">
                    {card.tags.map((tag, i) => (
                        <span 
                            key={i} 
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#001E33]/40 backdrop-blur-sm border border-sky-300/20 text-[10px] sm:text-[11px] font-mono text-sky-100"
                        >
                            <span className="w-1 h-1 rounded-full bg-sky-300/80" />
                            <span>{tag}</span>
                        </span>
                    ))}
                </div>
            </div>

            {/* ── CARD FOOTER (Matching Reference Image) ── */}
            <div className="relative z-10 pt-5 mt-4 border-t border-white/15 flex items-center justify-between">
                {/* Left: Serial Code (like 2286 ••••) */}
                <div className="flex items-center gap-2">
                    <span className="font-mono text-sm sm:text-base font-bold text-white/90 tracking-widest drop-shadow-sm">
                        {card.serial}
                    </span>
                </div>

                {/* Right: Golden Diamond Badge (Exactly like reference image!) & Action Link */}
                <Link
                    href={card.slug}
                    className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#005792] hover:bg-[#004270] text-white border border-sky-300/40 hover:border-white shadow-md shadow-[#001E33]/30 backdrop-blur-md transition-all duration-200 group-hover:scale-105 font-heading font-bold text-xs"
                >
                    <span>Buka Divisi</span>
                    {/* Diamond Icon (Faceted 3D Gem) */}
                    <svg className="w-4 h-4 text-sky-200 drop-shadow-[0_2px_6px_rgba(56,189,248,0.7)] shrink-0" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2L2 9l10 13 10-13-10-7zm0 2.5l7.5 5.5-4.5 9-3-14.5zm-1 0v14.5l-3-14.5 4-5.5z"/>
                    </svg>
                </Link>
            </div>
        </motion.div>
    );
}

/* ── MAIN COMPONENT ─────────────────────────────────────────────────────── */

export default function ScrollingServiceCards({ services = [] }) {
    return (
        <section className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-16 lg:py-24">
            {/* Header info */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
                <div>
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
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm max-w-sm leading-relaxed">
                        Tiap divisi dikemas dalam kartu 3D bertekstur VIP. Arahkan kursor untuk melihat pendaran cahaya dinamis dan efek kemiringan giroskopis.
                    </p>
                </div>
            </div>

            {/* 3D VIP CARDS GRID (Clean, Accessible & Vibrant, Sesuai Referensi Gambar) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
                {DIVISIONS_VIP_CARDS.map((card) => (
                    <VIP3DCard key={card.id} card={card} />
                ))}
            </div>
        </section>
    );
}
