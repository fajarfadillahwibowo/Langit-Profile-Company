import React, { useState, useMemo } from 'react';
import { 
    Play, Pause, Sparkles, Eye, Camera, Sliders, 
    ArrowDown, Layers, CheckCircle2 
} from 'lucide-react';
import { useQuality } from '@/Context/QualityContext';

export default function KineticPortfolioMarquee({ 
    galleries = [], 
    onSelectItem = () => {},
    onJumpToGrid = () => {}
}) {
    const { isHd, getOptimizedImage } = useQuality();
    const [isPaused, setIsPaused] = useState(false);
    const [speedMultiplier, setSpeedMultiplier] = useState(1); // 0.6 = santai, 1 = normal, 1.6 = cepat

    // Base speed in seconds (higher = slower)
    const baseDuration = 48;
    const currentDuration = Math.round(baseDuration / speedMultiplier);

    const categoryLabels = {
        'wedding': 'Wedding',
        'wisuda': 'Wisuda',
        'event': 'Event',
        'traveling': 'Traveling',
        'drone': 'Aerial Drone',
        'company_profile': 'Company Profile',
        'commercial': 'Commercial',
        'product': 'Product Studio',
    };

    const categoryColors = {
        'wedding': 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30',
        'wisuda': 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30',
        'event': 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
        'traveling': 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30',
        'drone': 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30',
        'company_profile': 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
        'commercial': 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30',
        'product': 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
    };

    // Filter valid photo items
    const photoItems = useMemo(() => {
        const valid = galleries.filter(g => g.file_webp_path && g.media_type !== 'before_after');
        return valid.length > 0 ? valid : galleries;
    }, [galleries]);

    // Split into 2 balanced rows
    const { row1Items, row2Items } = useMemo(() => {
        if (!photoItems.length) return { row1Items: [], row2Items: [] };

        const r1 = [];
        const r2 = [];
        photoItems.forEach((item, index) => {
            if (index % 2 === 0) {
                r1.push(item);
            } else {
                r2.push(item);
            }
        });

        // Ensure minimum items per row for smooth infinite loop width
        const padList = (list) => {
            let padded = [...list];
            while (padded.length < 8 && list.length > 0) {
                padded = [...padded, ...list];
            }
            return padded;
        };

        const finalR1 = padList(r1.length ? r1 : photoItems);
        const finalR2 = padList(r2.length ? r2 : photoItems);

        // Duplicate each row array for seamless 0% -> -50% CSS infinite marquee
        return {
            row1Items: [...finalR1, ...finalR1],
            row2Items: [...finalR2, ...finalR2],
        };
    }, [photoItems]);

    const renderCard = (item, uniqueKey) => {
        const catBadgeClass = categoryColors[item.category] || 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30';
        const cameraName = item.exif_metadata_json?.camera || 'Sony Cinema';
        const lensName = item.exif_metadata_json?.lens || 'G Master Prime';

        return (
            <div
                key={uniqueKey}
                onClick={() => onSelectItem(item)}
                className="group relative shrink-0 h-52 sm:h-64 md:h-72 aspect-[4/3] sm:aspect-[16/11] rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200/90 dark:border-white/10 bg-slate-900 shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer mr-3 sm:mr-4 select-none"
            >
                <img
                    src={getOptimizedImage(item.file_webp_path, { sdWidth: 380, hdWidth: 1200 })}
                    alt={item.title}
                    loading="lazy"
                    draggable={false}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />

                {/* Subtle gradient vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent opacity-75 group-hover:opacity-95 transition-opacity" />

                {/* Top Category Badge */}
                <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10">
                    <span className={`text-[10px] sm:text-[11px] font-mono px-2.5 py-1 rounded-full border backdrop-blur-md font-semibold tracking-wider uppercase ${catBadgeClass}`}>
                        {categoryLabels[item.category] || item.category}
                    </span>
                </div>

                {/* Top Right Quick Hint */}
                <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-1 rounded-full bg-white/90 dark:bg-black/80 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 shadow-sm backdrop-blur-md font-semibold">
                        <Eye className="w-3 h-3 text-amber-500" />
                        <span>Buka EXIF</span>
                    </span>
                </div>

                {/* Bottom Details (Always readable + enhanced on hover) */}
                <div className="absolute inset-x-0 bottom-0 p-3.5 sm:p-5 z-10 flex flex-col justify-end">
                    <h4 className="text-xs sm:text-sm font-bold text-white leading-snug line-clamp-1 group-hover:text-amber-300 transition-colors">
                        {item.title}
                    </h4>

                    <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-mono text-slate-300 mt-1 sm:mt-1.5 pt-1.5 border-t border-white/10">
                        <Camera className="w-3 h-3 text-amber-400 shrink-0" />
                        <span className="truncate">{cameraName} • {lensName}</span>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <section 
            id="program-overview" 
            className={`relative overflow-hidden py-6 sm:py-8 transition-all duration-300 ${isPaused ? 'marquee-paused' : ''}`}
            style={{ '--marquee-speed': `${currentDuration}s` }}
        >
            {/* Kinetic Stream Toolbar (Clean replacement for redundant second header) */}
            <div className="mx-auto mb-6 max-w-5xl px-4 sm:px-6">
                <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 sm:p-3 rounded-2xl bg-white/70 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10 backdrop-blur-xl shadow-sm text-xs">
                    <div className="flex items-center gap-2">
                        <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                        </span>
                        <span className="font-mono text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                            Galeri Bergerak 2 Baris Dinamis
                        </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        {/* Play / Pause Toggle */}
                        <button
                            type="button"
                            onClick={() => setIsPaused(!isPaused)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold border transition-all duration-200 ${
                                isPaused
                                    ? 'bg-amber-600 text-white border-amber-500 shadow-md shadow-amber-600/20'
                                    : 'bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 shadow-sm'
                            }`}
                            title={isPaused ? 'Lanjutkan gerakan otomatis' : 'Jeda gerakan'}
                        >
                            {isPaused ? (
                                <>
                                    <Play className="w-3.5 h-3.5 fill-current" />
                                    <span>Lanjutkan</span>
                                </>
                            ) : (
                                <>
                                    <Pause className="w-3.5 h-3.5" />
                                    <span>Jeda</span>
                                </>
                            )}
                        </button>

                        {/* Speed Multiplier segmented buttons */}
                        <div className="inline-flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 px-2 flex items-center gap-1 font-semibold">
                                <Sliders className="w-3 h-3" />
                                <span className="hidden sm:inline">Kecepatan:</span>
                            </span>
                            {[
                                { value: 0.6, label: '0.6x' },
                                { value: 1.0, label: '1.0x' },
                                { value: 1.6, label: '1.6x' },
                            ].map((spd) => (
                                <button
                                    key={spd.value}
                                    type="button"
                                    onClick={() => setSpeedMultiplier(spd.value)}
                                    className={`px-2 py-0.5 rounded-lg text-[11px] font-mono font-bold transition-all ${
                                        speedMultiplier === spd.value
                                            ? 'bg-white dark:bg-amber-600 text-slate-900 dark:text-white shadow-sm'
                                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                                >
                                    {spd.label}
                                </button>
                            ))}
                        </div>

                        {/* Quick jump to grid */}
                        <button
                            type="button"
                            onClick={onJumpToGrid}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-transparent hover:border-slate-200 dark:hover:border-white/10 text-xs font-semibold transition-colors"
                        >
                            <span>Filter & Grid</span>
                            <ArrowDown className="w-3.5 h-3.5 text-amber-500" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Two-Row Infinite Moving Marquee Container */}
            <div className="flex flex-col gap-3 sm:gap-4 select-none">
                {/* ROW 1: Moves Leftwards */}
                <div className="overflow-hidden marquee-mask">
                    <div className="animate-marquee-left flex py-1">
                        {row1Items.map((item, idx) => renderCard(item, `r1-${item.id}-${idx}`))}
                    </div>
                </div>

                {/* ROW 2: Moves Rightwards (Reverse direction like biz.ailene.id) */}
                <div className="overflow-hidden marquee-mask">
                    <div className="animate-marquee-right flex py-1">
                        {row2Items.map((item, idx) => renderCard(item, `r2-${item.id}-${idx}`))}
                    </div>
                </div>
            </div>

            {/* Bottom Caption Pill */}
            <div className="mt-4 flex items-center justify-center gap-4 text-center px-4">
                <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Baris atas bergerak ke kiri • Baris bawah bergerak ke kanan • Hover foto untuk menjeda</span>
                </span>
            </div>
        </section>
    );
}
