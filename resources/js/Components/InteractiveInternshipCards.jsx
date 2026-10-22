import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, MapPin, Check, ArrowRight, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

// Color palettes matching the vibrant Pinterest flashcard reference
const PALETTES = [
    {
        bg: '#FF6B6B', // Coral Red
        border: '#EE5253',
        tagBg: 'rgba(0, 0, 0, 0.12)',
        textColor: '#18181B',
        accentGlow: 'rgba(255, 107, 107, 0.35)',
    },
    {
        bg: '#FFA14E', // Warm Peach Orange
        border: '#FA8231',
        tagBg: 'rgba(0, 0, 0, 0.12)',
        textColor: '#18181B',
        accentGlow: 'rgba(255, 161, 78, 0.35)',
    },
    {
        bg: '#FFD15C', // Sunny Yellow
        border: '#F7B731',
        tagBg: 'rgba(0, 0, 0, 0.12)',
        textColor: '#18181B',
        accentGlow: 'rgba(255, 209, 92, 0.35)',
    },
    {
        bg: '#4ADE80', // Mint Emerald Green
        border: '#20BF6B',
        tagBg: 'rgba(0, 0, 0, 0.12)',
        textColor: '#18181B',
        accentGlow: 'rgba(74, 222, 128, 0.35)',
    },
    {
        bg: '#B8F255', // Electric Lime
        border: '#94D82D',
        tagBg: 'rgba(0, 0, 0, 0.12)',
        textColor: '#18181B',
        accentGlow: 'rgba(184, 242, 85, 0.35)',
    },
    {
        bg: '#62CDFF', // Sky Cyan
        border: '#2D9CDB',
        tagBg: 'rgba(0, 0, 0, 0.12)',
        textColor: '#18181B',
        accentGlow: 'rgba(98, 205, 255, 0.35)',
    },
];

export default function InteractiveInternshipCards({
    positions = [],
    selectedPositionId,
    onSelectPosition,
}) {
    const [hoveredIdx, setHoveredIdx] = useState(null);
    const total = positions.length;

    // Base fan rotation for idle cards
    const getBaseRotation = (index) => {
        if (total <= 1) return 0;
        const mid = (total - 1) / 2;
        return (index - mid) * 2.6; // gentle fanned spread
    };

    // Calculate dynamic transform based on hovered card (Accordion push effect)
    const getCardMotion = (index) => {
        const baseRot = getBaseRotation(index);

        if (hoveredIdx === null) {
            return {
                x: 0,
                y: 0,
                rotate: baseRot,
                scale: 1,
                zIndex: index + 1,
            };
        }

        if (hoveredIdx === index) {
            // Hovered card: pops up, straightens, scales, comes to front
            return {
                x: 0,
                y: -26,
                rotate: 0,
                scale: 1.05,
                zIndex: 40,
            };
        }

        if (index < hoveredIdx) {
            // Cards to the left: push further left and tilt slightly left
            const dist = hoveredIdx - index;
            return {
                x: -Math.min(65, 28 + dist * 14),
                y: 6,
                rotate: baseRot - 2,
                scale: 0.98,
                zIndex: index + 1,
            };
        } else {
            // Cards to the right: push further right and tilt slightly right
            const dist = index - hoveredIdx;
            return {
                x: Math.min(65, 28 + dist * 14),
                y: 6,
                rotate: baseRot + 2,
                scale: 0.98,
                zIndex: index + 1,
            };
        }
    };

    const handleApplyClick = (e, posId) => {
        e.stopPropagation();
        onSelectPosition(posId);
        const formEl = document.getElementById('form-pendaftaran');
        if (formEl) {
            formEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <section id="open-roles" className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-16">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
                <div>
                    <span className="inline-flex items-center gap-1.5 text-xs font-mono text-purple-600 dark:text-purple-400 font-bold uppercase tracking-wider mb-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        KUOTA BATCH AKTIF 2026
                    </span>
                    <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white tracking-tight">
                        Posisi Magang yang Terbuka
                    </h2>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-slate-600 dark:text-slate-300 bg-white/80 dark:bg-white/5 px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-white/10 shadow-xs backdrop-blur-md">
                        Onsite Studio & Hybrid Working Available
                    </span>
                </div>
            </div>

            {/* Theatrical Light Purple & White Glassmorphic Stage Container */}
            <div className="relative rounded-3xl bg-gradient-to-br from-purple-100/70 via-white/80 to-purple-50/70 dark:from-purple-950/40 dark:via-purple-900/20 dark:to-white/[0.05] backdrop-blur-2xl border border-purple-200/80 dark:border-purple-500/20 shadow-2xl shadow-purple-500/10 p-6 sm:p-10 lg:p-14 overflow-hidden">
                {/* Background Ambient Glow Spots */}
                <div className="absolute -top-10 left-1/4 w-80 h-80 bg-purple-300/35 dark:bg-purple-600/20 rounded-full blur-[90px] pointer-events-none" />
                <div className="absolute -bottom-10 right-1/4 w-96 h-96 bg-white/80 dark:bg-purple-400/15 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-r from-transparent via-purple-100/40 dark:via-purple-500/5 to-transparent pointer-events-none" />

                {/* Subtitle guidance inside stage */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-8 text-xs font-mono text-purple-950/80 dark:text-purple-200/80">
                    <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-xs shadow-emerald-500/50 animate-pulse"></span>
                        Hover atau klik kartu untuk membuka kualifikasi & memilih posisi
                    </span>
                    <span className="hidden sm:inline text-purple-800/60 dark:text-purple-300/60">
                        {total} Posisi Terbuka • Batch Genap 2026
                    </span>
                </div>

                {/* Desktop/Tablet: Animated Fanned Overlapping Cards Deck */}
                <div className="hidden md:flex items-center justify-center pt-8 pb-10 min-h-[500px]">
                    <div 
                        className="relative flex items-center justify-center -space-x-10 lg:-space-x-14"
                        onMouseLeave={() => setHoveredIdx(null)}
                    >
                        {positions.map((pos, idx) => {
                            const palette = PALETTES[idx % PALETTES.length];
                            const isSelected = selectedPositionId === pos.id;
                            const isHovered = hoveredIdx === idx;
                            const reqs = pos.requirements_json || [];

                            return (
                                <motion.div
                                    key={pos.id}
                                    animate={getCardMotion(idx)}
                                    transition={{
                                        type: 'spring',
                                        stiffness: 360,
                                        damping: 25,
                                        mass: 0.8,
                                    }}
                                    onMouseEnter={() => setHoveredIdx(idx)}
                                    onClick={() => onSelectPosition(pos.id)}
                                    style={{
                                        backgroundColor: palette.bg,
                                        color: palette.textColor,
                                    }}
                                    className={`relative w-[280px] lg:w-[310px] h-[450px] rounded-3xl p-6 flex flex-col justify-between cursor-pointer border select-none transition-shadow duration-300 ${
                                        isSelected 
                                            ? 'ring-4 ring-purple-600 dark:ring-white shadow-2xl shadow-purple-500/25' 
                                            : isHovered 
                                                ? 'shadow-2xl' 
                                                : 'shadow-xl'
                                    }`}
                                >
                                    {/* Top Metadata Header */}
                                    <div>
                                        <div className="flex items-center justify-between gap-2 mb-4">
                                            <span 
                                                style={{ backgroundColor: palette.tagBg }}
                                                className="text-[10px] font-mono px-2.5 py-1 rounded-full uppercase font-bold tracking-wider truncate max-w-[170px]"
                                            >
                                                {pos.division_name}
                                            </span>
                                            <span 
                                                style={{ backgroundColor: palette.tagBg }}
                                                className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold whitespace-nowrap"
                                            >
                                                Kuota: {pos.quota}
                                            </span>
                                        </div>

                                        {/* Big Title (Sticky Note Quote Style) */}
                                        <h3 className="font-heading font-black text-2xl lg:text-3xl tracking-tight leading-tight mb-2">
                                            {pos.title}
                                        </h3>

                                        {/* Duration & Work Type */}
                                        <div className="flex items-center gap-2.5 text-[11px] font-mono opacity-85 mb-4 font-semibold">
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3.5 h-3.5" />
                                                {pos.duration_months} Bulan
                                            </span>
                                            <span>•</span>
                                            <span className="flex items-center gap-1 uppercase">
                                                <MapPin className="w-3.5 h-3.5" />
                                                {pos.work_type}
                                            </span>
                                        </div>

                                        {/* Qualifications / Core Responsibilities */}
                                        <div className="space-y-2 text-xs leading-relaxed">
                                            <span className="font-mono text-[10px] uppercase font-bold opacity-60 block tracking-wider">
                                                Kualifikasi Utama:
                                            </span>
                                            {reqs.slice(0, 3).map((r, i) => (
                                                <div key={i} className="flex items-start gap-2">
                                                    <span className="font-bold shrink-0 mt-0.5 opacity-70">•</span>
                                                    <span className="line-clamp-2 text-[11.5px] leading-snug opacity-90 font-medium">
                                                        {r}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Bottom Sticky Note Footer (Matching Pinterest reference) */}
                                    <div className="pt-3 border-t border-black/15 flex items-center justify-between">
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onSelectPosition(pos.id);
                                            }}
                                            className="text-[11px] font-mono font-bold flex items-center gap-1 hover:underline"
                                        >
                                            {isSelected ? (
                                                <span className="flex items-center gap-1 font-black">
                                                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                                                    Posisi Terpilih
                                                </span>
                                            ) : (
                                                <span>Pilih Posisi Ini</span>
                                            )}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={(e) => handleApplyClick(e, pos.id)}
                                            className="px-3.5 py-1.5 rounded-xl bg-slate-950 text-white font-bold text-xs hover:bg-black transition-transform active:scale-95 shadow-md flex items-center gap-1"
                                        >
                                            <span>Lamar</span>
                                            <ArrowRight className="w-3 h-3" />
                                        </button>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* Mobile / Small Screens: Horizontal Smooth Scrollable Snap Deck */}
                <div className="md:hidden flex gap-4 overflow-x-auto pb-4 pt-2 snap-x snap-mandatory no-scrollbar">
                    {positions.map((pos, idx) => {
                        const palette = PALETTES[idx % PALETTES.length];
                        const isSelected = selectedPositionId === pos.id;
                        const reqs = pos.requirements_json || [];

                        return (
                            <div
                                key={pos.id}
                                onClick={() => onSelectPosition(pos.id)}
                                style={{
                                    backgroundColor: palette.bg,
                                    color: palette.textColor,
                                }}
                                className={`snap-center shrink-0 w-[270px] rounded-3xl p-6 flex flex-col justify-between shadow-xl transition-all ${
                                    isSelected ? 'ring-4 ring-purple-600 dark:ring-white scale-[1.02] shadow-2xl shadow-purple-500/25' : 'opacity-95'
                                }`}
                            >
                                <div>
                                    <div className="flex items-center justify-between gap-2 mb-3">
                                        <span 
                                            style={{ backgroundColor: palette.tagBg }}
                                            className="text-[10px] font-mono px-2 py-0.5 rounded-full uppercase font-bold truncate max-w-[140px]"
                                        >
                                            {pos.division_name}
                                        </span>
                                        <span 
                                            style={{ backgroundColor: palette.tagBg }}
                                            className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold"
                                        >
                                            Kuota: {pos.quota}
                                        </span>
                                    </div>

                                    <h3 className="font-heading font-black text-2xl tracking-tight leading-tight mb-2">
                                        {pos.title}
                                    </h3>

                                    <div className="flex items-center gap-2 text-[11px] font-mono opacity-85 mb-3 font-semibold">
                                        <span>{pos.duration_months} Bulan</span>
                                        <span>•</span>
                                        <span className="uppercase">{pos.work_type}</span>
                                    </div>

                                    <div className="space-y-1.5 text-xs">
                                        {reqs.slice(0, 3).map((r, i) => (
                                            <div key={i} className="flex items-start gap-1.5 text-[11px] leading-snug opacity-90">
                                                <span>•</span>
                                                <span className="line-clamp-2">{r}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-5 pt-3 border-t border-black/15 flex items-center justify-between">
                                    <span className="text-[11px] font-mono font-bold">
                                        {isSelected ? '✓ Terpilih' : 'Pilih Posisi'}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={(e) => handleApplyClick(e, pos.id)}
                                        className="px-3 py-1.5 rounded-lg bg-slate-950 text-white font-bold text-xs"
                                    >
                                        Lamar →
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
