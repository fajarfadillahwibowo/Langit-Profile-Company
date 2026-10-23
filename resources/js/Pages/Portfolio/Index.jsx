import React, { useState, useRef } from 'react';
import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import LightboxModal from '@/Components/LightboxModal';
import KineticPortfolioMarquee from '@/Components/KineticPortfolioMarquee';
import { 
    Layers, Camera, Sparkles, ArrowRight, Eye, Phone, SlidersHorizontal,
    MoveHorizontal, Grid
} from 'lucide-react';

export default function PortfolioIndex({ galleries = [] }) {
    const [selectedTab, setSelectedTab] = useState('all');
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

    const photoGalleries = galleries.filter(g => g.media_type !== 'before_after');
    const displayedGalleries = selectedTab === 'all' 
        ? photoGalleries 
        : photoGalleries.filter(g => g.category === selectedTab);

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
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs font-mono tracking-wider font-semibold">
                        <Camera className="w-3.5 h-3.5" />
                        <span>LANGIT VISUAL & CINEMATOGRAPHY SHOWCASE</span>
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
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 shadow-sm transition-all"
                        >
                            <MoveHorizontal className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                            <span>Galeri Bergerak 2 Baris</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 font-mono font-bold">Baru</span>
                        </button>

                        <button
                            type="button"
                            onClick={scrollToGrid}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 shadow-sm transition-all"
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
                                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
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
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                            <SlidersHorizontal className="w-4 h-4 text-amber-500" />
                            <span>Menampilkan {displayedGalleries.length} Karya Visual</span>
                        </div>
                        <Link 
                            href="/layanan/photography-videography" 
                            className="text-xs font-mono text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 font-semibold"
                        >
                            <span>Buka Detail Layanan Photo/Video</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    {displayedGalleries.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {displayedGalleries.map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => setActiveLightboxItem(item)}
                                    className="group relative rounded-3xl overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-900 aspect-[4/3] cursor-pointer shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                                >
                                    <img
                                        src={item.file_webp_path}
                                        alt={item.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    
                                    {/* Overlay on hover & base readability */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/30 to-transparent opacity-85 group-hover:opacity-100 transition-opacity p-5 flex flex-col justify-end">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider font-semibold">
                                                {categoryLabels[item.category] || item.category}
                                            </span>
                                            <span className="text-[10px] font-mono text-slate-300 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Eye className="w-3 h-3 text-amber-400" />
                                                Buka EXIF
                                            </span>
                                        </div>

                                        <h3 className="text-base font-bold text-white mt-2 leading-snug group-hover:text-amber-300 transition-colors">
                                            {item.title}
                                        </h3>

                                        <div className="flex items-center gap-2 text-xs font-mono text-slate-300 mt-1.5 pt-2 border-t border-white/10">
                                            <Camera className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                            <span className="truncate">
                                                {item.exif_metadata_json?.camera || 'Sony FX3'} • {item.exif_metadata_json?.lens || '24-70mm GM II'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-12 text-center rounded-3xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-3">
                            <Camera className="w-8 h-8 text-slate-400 mx-auto" />
                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                Belum ada karya di kategori ini.
                            </p>
                            <button
                                onClick={() => setSelectedTab('all')}
                                className="text-xs font-mono text-cyan-600 dark:text-cyan-400 hover:underline"
                            >
                                Kembali ke Semua Karya
                            </button>
                        </div>
                    )}
                </div>
                </div>

                {/* Bottom CTA Card */}
                <div className="rounded-3xl bg-gradient-to-tr from-amber-500/10 via-slate-100 to-amber-500/5 dark:from-amber-500/10 dark:via-white/[0.02] dark:to-transparent border border-amber-500/20 p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="space-y-2 text-center md:text-left">
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

                    <div className="flex flex-wrap items-center gap-3 shrink-0">
                        <a
                            href="https://wa.me/6281234567890?text=Halo%20Langit,%20saya%20tertarik%20dengan%20portofolio%20karya%20foto%20dan%20video"
                            target="_blank"
                            rel="noreferrer"
                            className="px-4 py-2.5 rounded-xl bg-white dark:bg-white/10 hover:bg-slate-50 dark:hover:bg-white/15 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 text-xs font-semibold flex items-center gap-2 shadow-sm transition-colors"
                        >
                            <Phone className="w-3.5 h-3.5 text-emerald-500" />
                            <span>WhatsApp Tim Kreatif</span>
                        </a>

                        <Link
                            href="/konsultasi"
                            className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-amber-600/25 transition-all"
                        >
                            <span>Jadwalkan Konsultasi</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Lightbox Modal with EXIF Inspector */}
            {activeLightboxItem && (
                <LightboxModal
                    item={activeLightboxItem}
                    onClose={() => setActiveLightboxItem(null)}
                />
            )}
        </PublicLayout>
    );
}
