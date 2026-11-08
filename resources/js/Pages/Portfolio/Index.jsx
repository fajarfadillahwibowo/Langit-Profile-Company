import React, { useState, useRef, useMemo } from 'react';
import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import LightboxModal from '@/Components/LightboxModal';
import KineticPortfolioMarquee from '@/Components/KineticPortfolioMarquee';
import { 
    Camera, ArrowRight, Eye, Phone, SlidersHorizontal,
    MoveHorizontal, Grid, Sparkles, Zap, Calendar, ArrowUpDown, RotateCcw
} from 'lucide-react';
import { useQuality } from '@/Context/QualityContext';
import { getWhatsAppUrl } from '@/Utils/whatsapp';

function formatIndoDate(dateStr) {
    if (!dateStr) return '';
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return '';
        return d.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    } catch (e) {
        return '';
    }
}

export default function PortfolioIndex({ galleries = [] }) {
    const { isHd, setQuality, toggleQuality, getOptimizedImage } = useQuality();
    const [selectedTab, setSelectedTab] = useState('all');
    const [dateSort, setDateSort] = useState('newest'); // 'newest' (Foto Terbaru - default) | 'oldest' (Foto Terlama)
    const [dateFilter, setDateFilter] = useState('all'); // 'all' | 'this_month' | 'this_year' | 'custom'
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [activeLightboxItem, setActiveLightboxItem] = useState(null);
    const gridRef = useRef(null);
    const marqueeRef = useRef(null);

    const tabs = [
        { key: 'all', label: 'Semua Karya' },
        { key: 'wedding', label: 'Wedding' },
        { key: 'wisuda', label: 'Wisuda' },
        { key: 'event', label: 'Event' },
        { key: 'traveling', label: 'Traveling' },
        { key: 'drone', label: 'Jasa Drone' },
        { key: 'company_profile', label: 'Company Profile' },
    ];

    const categoryLabels = {
        'wedding': 'Wedding Photo & Video',
        'wisuda': 'Wisuda Studio & Outdoor',
        'event': 'Event & Gathering',
        'traveling': 'Traveling & Adventure',
        'drone': 'Jasa Drone Aerial 4K',
        'company_profile': 'Company Profile',
    };

    // Filter valid non-before_after photos with default newest first (scoping to Visual & Cinematography showcase)
    const photoGalleries = useMemo(() => {
        const validCategories = ['wedding', 'wisuda', 'event', 'traveling', 'drone', 'company_profile', 'showreel'];
        const list = (galleries || []).filter(g => g.media_type !== 'before_after' && (validCategories.includes(g.category) || g.service_id === 1));
        return [...list].sort((a, b) => {
            const timeA = a.created_at ? new Date(a.created_at).getTime() : (a.id || 0);
            const timeB = b.created_at ? new Date(b.created_at).getTime() : (b.id || 0);
            return timeB - timeA;
        });
    }, [galleries]);

    const displayedGalleries = useMemo(() => {
        let list = selectedTab === 'all' 
            ? [...photoGalleries] 
            : photoGalleries.filter(g => g.category === selectedTab);

        // Filter berdasarkan tanggal
        if (dateFilter === 'this_month') {
            const now = new Date();
            const curYear = now.getFullYear();
            const curMonth = now.getMonth();
            list = list.filter(item => {
                if (!item.created_at) return false;
                const d = new Date(item.created_at);
                return d.getFullYear() === curYear && d.getMonth() === curMonth;
            });
        } else if (dateFilter === 'this_year') {
            const curYear = new Date().getFullYear();
            list = list.filter(item => {
                if (!item.created_at) return false;
                const d = new Date(item.created_at);
                return d.getFullYear() === curYear;
            });
        } else if (dateFilter === 'custom' && (startDate || endDate)) {
            list = list.filter(item => {
                if (!item.created_at) return false;
                const itemTime = new Date(item.created_at).setHours(0, 0, 0, 0);
                if (startDate && itemTime < new Date(startDate).setHours(0, 0, 0, 0)) return false;
                if (endDate && itemTime > new Date(endDate).setHours(23, 59, 59, 999)) return false;
                return true;
            });
        }

        // Urutan tanggal: Default Foto Terbaru (newest first)
        list.sort((a, b) => {
            const timeA = a.created_at ? new Date(a.created_at).getTime() : (a.id || 0);
            const timeB = b.created_at ? new Date(b.created_at).getTime() : (b.id || 0);
            return dateSort === 'oldest' ? (timeA - timeB) : (timeB - timeA);
        });

        return list;
    }, [photoGalleries, selectedTab, dateFilter, startDate, endDate, dateSort]);

    const scrollToGrid = () => {
        gridRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const scrollToMarquee = () => {
        marqueeRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <PublicLayout>
            <Head>
                <title>Portofolio Foto & Sinematografi Langit</title>
                <meta name="description" content="Koleksi karya dokumentasi, fotografi profesional, dan sinematografi Langit Creative: Wedding, Wisuda, Event, Traveling, Jasa Drone, dan Company Profile dengan inspeksi metadata EXIF kamera." />
            </Head>

            <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pt-6 pb-20 space-y-12">
                {/* Unified Single Header */}
                <div className="text-center max-w-4xl mx-auto space-y-4">
                    <div className="inline-flex max-w-full items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-[10px] sm:text-xs font-mono tracking-wider font-semibold">
                        <Camera className="w-3.5 h-3.5 shrink-0" />
                        <span className="min-w-0">LANGIT VISUAL & CINEMATOGRAPHY SHOWCASE</span>
                    </div>

                    <h1 className="font-heading font-extrabold text-3xl sm:text-5xl lg:text-[46px] text-slate-900 dark:text-white tracking-tight leading-tight">
                        Mahakarya Visual & <span className="font-editorial italic font-normal text-amber-600 dark:text-amber-400">Sinema</span>, dari Momen Personal sampai Tim Korporat.
                    </h1>

                    <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed max-w-3xl mx-auto">
                        Koleksi produksi visual sinematik dan dokumentasi profesional beresolusi tinggi: Wedding, Wisuda, Event, Traveling, Jasa Drone 4K, hingga Company Profile korporat. Klik pada karya untuk membuka <strong className="text-amber-600 dark:text-amber-400">EXIF Inspector</strong>.
                    </p>

                    {/* Quick Section Navigation Menu / Mode Switcher */}
                    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                        <button
                            type="button"
                            onClick={scrollToMarquee}
                            className="w-full sm:w-auto min-w-0 inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-3 sm:py-2 rounded-xl text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 shadow-sm transition-all"
                        >
                            <MoveHorizontal className="w-3.5 h-3.5 shrink-0 text-amber-500 animate-pulse" />
                            <span>Galeri Bergerak 2 Baris</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 font-mono font-bold">Baru</span>
                        </button>

                        <button
                            type="button"
                            onClick={scrollToGrid}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-3 sm:py-2 rounded-xl text-xs font-semibold bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 shadow-sm transition-all"
                        >
                            <Grid className="w-3.5 h-3.5 text-slate-500" />
                            <span>Grid Koleksi & Filter</span>
                        </button>
                    </div>
                </div>

                {/* NEW FEATURE: 2-Row Kinetic Marquee Stream (Inspired by biz.ailene.id Program Overview) */}
                <div ref={marqueeRef} className="rounded-3xl border border-[#005792]/15 dark:border-white/10 bg-[#EDF9FC]/60 dark:bg-white/[0.02] shadow-sm overflow-hidden">
                    <KineticPortfolioMarquee
                        galleries={photoGalleries}
                        onSelectItem={setActiveLightboxItem}
                        onJumpToGrid={scrollToGrid}
                    />
                </div>

                {/* Photo & Video Showcase Grid with Category Filters */}
                <div ref={gridRef} id="photo-grid" className="space-y-6 pt-4 scroll-mt-24">
                    {/* Category Filter Tabs */}
                    <div className="flex flex-wrap items-center justify-center gap-2">
                        {tabs.map((tab) => {
                            const count = tab.key === 'all' 
                                ? photoGalleries.length 
                                : photoGalleries.filter(g => g.category === tab.key).length;

                            const isActive = selectedTab === tab.key;
                            return (
                                <button
                                    key={tab.key}
                                    type="button"
                                    onClick={() => setSelectedTab(tab.key)}
                                    aria-pressed={isActive}
                                    className={`min-h-11 max-w-full px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                                        isActive
                                            ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/25 scale-[1.02]'
                                            : 'bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 shadow-sm'
                                    }`}
                                >
                                    <span>{tab.label}</span>
                                    {count > 0 && (
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                                            isActive 
                                                ? 'bg-white/20 text-white' 
                                                : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400'
                                        }`}>
                                            {count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                {/* Photo & Video Showcase Grid */}
                <div className="space-y-6">
                    {/* Header Controls: Count, SD/HD Switcher & Link */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-white/10 pb-3">
                        <div className="min-w-0 flex flex-wrap items-center gap-3 text-sm font-bold text-slate-900 dark:text-white">
                            <div className="flex items-center gap-1.5">
                                <SlidersHorizontal className="w-4 h-4 text-amber-500" />
                                <span>Menampilkan {displayedGalleries.length} Karya</span>
                            </div>

                            {/* In-Page SD/HD Dual Pill Switcher (Ditempat Foto) */}
                            <div className="flex items-center p-0.5 rounded-full bg-slate-200/90 dark:bg-white/10 border border-slate-300 dark:border-white/10 shadow-inner">
                                <button
                                    type="button"
                                    onClick={() => setQuality('sd')}
                                    className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-mono font-bold transition-all cursor-pointer ${
                                        !isHd
                                            ? 'bg-emerald-600 text-white shadow-xs'
                                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                                    title="Mode SD: Sangat ringan, hemat kuota & render cepat"
                                >
                                    <Zap className={`w-3 h-3 shrink-0 ${!isHd ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                                    <span>SD</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setQuality('hd')}
                                    className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-mono font-bold transition-all cursor-pointer ${
                                        isHd
                                            ? 'bg-emerald-600 text-white shadow-xs'
                                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                                    title="Mode HD: Tampilan foto resolusi tinggi 100%"
                                >
                                    <Sparkles className={`w-3 h-3 shrink-0 ${isHd ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                                    <span>HD</span>
                                </button>
                            </div>
                        </div>
                        <Link 
                            href="/layanan/photography-videography" 
                            className="min-w-0 text-xs font-mono text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 font-semibold"
                        >
                            <span>Buka Detail Layanan Photo/Video</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    {/* Date Filter & Sort Control Toolbar */}
                    <div className="p-3 sm:p-4 rounded-2xl bg-white/70 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 shadow-xs backdrop-blur-md space-y-3">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                            {/* Left: Quick Date Filter Pills */}
                            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mr-1">
                                    <Calendar className="w-3.5 h-3.5 text-amber-500" />
                                    <span>Filter Tanggal:</span>
                                </span>

                                {[
                                    { id: 'all', label: 'Semua Waktu' },
                                    { id: 'this_month', label: 'Bulan Ini' },
                                    { id: 'this_year', label: 'Tahun Ini' },
                                    { id: 'custom', label: 'Pilih Tanggal' },
                                ].map(f => (
                                    <button
                                        key={f.id}
                                        type="button"
                                        onClick={() => setDateFilter(f.id)}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                                            dateFilter === f.id
                                                ? 'bg-amber-600 text-white font-bold shadow-sm'
                                                : 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10'
                                        }`}
                                    >
                                        {f.label}
                                    </button>
                                ))}

                                {(dateFilter !== 'all' || dateSort !== 'newest' || startDate || endDate) && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setDateFilter('all');
                                            setDateSort('newest');
                                            setStartDate('');
                                            setEndDate('');
                                        }}
                                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-mono text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer ml-1"
                                        title="Reset Filter Tanggal"
                                    >
                                        <RotateCcw className="w-3 h-3" />
                                        <span>Reset</span>
                                    </button>
                                )}
                            </div>

                            {/* Right: Date Sorting Order (Default: Terbaru) */}
                            <div className="flex items-center gap-1.5 shrink-0">
                                <span className="text-xs font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                    <ArrowUpDown className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">Urutan:</span>
                                </span>

                                <div className="flex items-center p-0.5 rounded-xl bg-slate-200/80 dark:bg-white/10 border border-slate-300/80 dark:border-white/10 shadow-inner">
                                    <button
                                        type="button"
                                        onClick={() => setDateSort('newest')}
                                        className={`px-3 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                                            dateSort === 'newest'
                                                ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white font-bold shadow-xs'
                                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                        }`}
                                    >
                                        Foto Terbaru (Default)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setDateSort('oldest')}
                                        className={`px-3 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                                            dateSort === 'oldest'
                                                ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white font-bold shadow-xs'
                                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                        }`}
                                    >
                                        Foto Terlama
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Custom Date Range Inputs when 'custom' is selected */}
                        {dateFilter === 'custom' && (
                            <div className="pt-2 border-t border-slate-200/60 dark:border-white/10 flex flex-wrap items-center gap-3 text-xs font-mono">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-slate-500 dark:text-slate-400">Dari:</span>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/15 text-slate-800 dark:text-slate-200 text-xs focus:ring-1 focus:ring-amber-500 outline-none"
                                    />
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-slate-500 dark:text-slate-400">Sampai:</span>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/15 text-slate-800 dark:text-slate-200 text-xs focus:ring-1 focus:ring-amber-500 outline-none"
                                    />
                                </div>
                                {(startDate || endDate) && (
                                    <span className="text-[11px] text-amber-600 dark:text-amber-400">
                                        Menyaring rentang tanggal yang dipilih
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    {displayedGalleries.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {displayedGalleries.map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => setActiveLightboxItem(item)}
                                    className="min-w-0 group relative rounded-3xl overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-900 aspect-[4/3] cursor-pointer shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                                >
                                    <img
                                        src={getOptimizedImage(item.file_webp_path, { sdWidth: 480, hdWidth: 1400 })}
                                        alt={item.title}
                                        loading="lazy"
                                        decoding="async"
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    
                                    {/* Overlay on hover & base readability */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/30 to-transparent opacity-85 group-hover:opacity-100 transition-opacity p-4 sm:p-5 flex flex-col justify-end">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider font-semibold">
                                                {categoryLabels[item.category] || item.category}
                                            </span>
                                            {item.created_at && (
                                                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/60 text-amber-300 border border-white/15 flex items-center gap-1 backdrop-blur-md">
                                                    <Calendar className="w-3 h-3 text-amber-400" />
                                                    {formatIndoDate(item.created_at)}
                                                </span>
                                            )}
                                        </div>

                                        <h3 className="break-words text-base font-bold text-white mt-2 leading-snug group-hover:text-amber-300 transition-colors">
                                            {item.title}
                                        </h3>

                                        <div className="flex items-center justify-between gap-2 text-xs font-mono text-slate-300 mt-1.5 pt-2 border-t border-white/10">
                                            <div className="flex items-center gap-1.5 truncate">
                                                <Camera className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                                <span className="truncate">
                                                    {item.exif_metadata_json?.camera || 'Sony FX3'} • {item.exif_metadata_json?.lens || '24-70mm GM II'}
                                                </span>
                                            </div>
                                            <span className="text-[10px] text-slate-300 sm:opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 shrink-0">
                                                <Eye className="w-3 h-3 text-amber-400" />
                                                <span>EXIF</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-6 sm:p-12 text-center rounded-3xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-3">
                            <Calendar className="w-8 h-8 text-slate-400 mx-auto" />
                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                Tidak ada karya foto yang cocok dengan filter tanggal ini.
                            </p>
                            <button
                                type="button"
                                onClick={() => {
                                    setDateFilter('all');
                                    setDateSort('newest');
                                    setStartDate('');
                                    setEndDate('');
                                    setSelectedTab('all');
                                }}
                                className="text-xs font-mono text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                            >
                                Reset Semua Filter Tanggal & Kategori
                            </button>
                        </div>
                    )}
                </div>
                </div>

                {/* Bottom CTA Card */}
                <div className="rounded-3xl bg-gradient-to-tr from-amber-500/10 via-slate-100 to-amber-500/5 dark:from-amber-500/10 dark:via-white/[0.02] dark:to-transparent border border-amber-500/20 p-5 sm:p-10 flex flex-col lg:flex-row items-center justify-between gap-6">
                    <div className="min-w-0 space-y-2 text-center lg:text-left">
                        <span className="text-xs font-mono text-amber-700 dark:text-amber-400 uppercase tracking-wider font-bold">
                            Konsultasi Kreatif & Booking Jadwal
                        </span>
                        <h2 className="font-heading font-extrabold text-2xl text-slate-900 dark:text-white">
                            Ingin Memproduksi Karya Visual Berkualitas Serupa?
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm max-w-xl">
                            Hubungi tim produksi Langit Creative untuk konsultasi konsep wedding, dokumentasi wisuda, event corporate, traveling adventure, hingga lisensi aerial drone berlisensi.
                        </p>
                    </div>

                    <div className="w-full lg:w-auto flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center justify-center gap-3 lg:shrink-0">
                        <a
                            href={getWhatsAppUrl('portfolio', { 
                                category: selectedTab !== 'all' ? selectedTab : 'Foto & Video Cinema',
                                title: 'Koleksi Portofolio Langit Creative'
                            })}
                            target="_blank"
                            rel="noreferrer"
                            className="px-4 py-3 rounded-xl bg-white dark:bg-white/10 hover:bg-slate-50 dark:hover:bg-white/15 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-colors"
                        >
                            <Phone className="w-3.5 h-3.5 text-emerald-500" />
                            <span>WhatsApp Tim Kreatif</span>
                        </a>

                        <Link
                            href="/konsultasi"
                            className="px-5 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-amber-600/25 transition-all"
                        >
                            <span>Jadwalkan Konsultasi</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Lightbox Modal with EXIF Inspector & Category Mini Gallery */}
            {activeLightboxItem && (
                <LightboxModal
                    albumMode
                    item={activeLightboxItem}
                    relatedGalleries={photoGalleries}
                    onSelectRelated={(newItem) => setActiveLightboxItem(newItem)}
                    onClose={() => setActiveLightboxItem(null)}
                />
            )}
        </PublicLayout>
    );
}
