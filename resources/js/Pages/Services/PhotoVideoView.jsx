import React, { useState, useRef, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import PublicLayout from '@/Layouts/PublicLayout';
import LightboxModal from '@/Components/LightboxModal';
import BeforeAfterSlider from '@/Components/BeforeAfterSlider';
import { 
    Camera, Play, Pause, Volume2, VolumeX, SlidersHorizontal, Disc,
    ArrowRight, CheckCircle2, Film, Sparkles, Layers, Images, Zap,
    Heart, GraduationCap, Award, Calendar, Compass, Sun, Navigation,
    Crosshair, Building2, MonitorPlay, ArrowUpRight
} from 'lucide-react';
import { useQuality } from '@/Context/QualityContext';
import { getWhatsAppUrl } from '@/Utils/whatsapp';

export default function PhotoVideoView({ service, galleries = [], beforeAfter = null, showreel = null }) {
    const { isHd, setQuality, toggleQuality, getOptimizedImage } = useQuality();
    const [activeTab, setActiveTab] = useState('services'); // 'services' | 'gallery'
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [activeLightboxItem, setActiveLightboxItem] = useState(null);
    const [showreelPlaying, setShowreelPlaying] = useState(true);
    const [isMuted, setIsMuted] = useState(true);
    const videoRef = useRef(null);

    const activeVideoUrl = showreel?.video_url 
        || service?.hero_config_json?.showreel_video 
        || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";

    const rawPoster = showreel?.file_webp_path 
        || service?.hero_config_json?.showreel_poster 
        || "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1600&q=80";

    const activePosterUrl = getOptimizedImage(rawPoster, { sdWidth: 640, hdWidth: 1600 });

    // Guaranteed video autoplay as soon as page is opened/visited
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        // Browser autoplay policy requires video to be muted initially
        video.muted = true;
        setIsMuted(true);

        const tryPlay = () => {
            const playPromise = video.play();
            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        setShowreelPlaying(true);
                    })
                    .catch(() => {
                        // Retry muted if browser policy blocked
                        video.muted = true;
                        video.play()
                            .then(() => setShowreelPlaying(true))
                            .catch(() => setShowreelPlaying(false));
                    });
            }
        };

        tryPlay();
    }, [activeVideoUrl]);

    const togglePlayShowreel = () => {
        if (!videoRef.current) return;
        if (showreelPlaying) {
            videoRef.current.pause();
            setShowreelPlaying(false);
        } else {
            videoRef.current.play().then(() => {
                setShowreelPlaying(true);
            }).catch(() => {
                setShowreelPlaying(true);
            });
        }
    };

    const toggleMute = (e) => {
        e.stopPropagation();
        if (!videoRef.current) return;
        videoRef.current.muted = !videoRef.current.muted;
        setIsMuted(videoRef.current.muted);
    };

    const categories = [
        { key: 'all', label: 'Semua Karya' },
        { key: 'wedding', label: '1. Wedding Photo Video' },
        { key: 'wisuda', label: '2. Wisuda' },
        { key: 'event', label: '3. Event' },
        { key: 'traveling', label: '4. Traveling' },
        { key: 'drone', label: '5. Jasa Drone' },
        { key: 'company_profile', label: '6. Company Profile' },
    ];

    const servicePillars = [
        {
            num: '01',
            title: 'Wedding Photo & Video',
            slug: 'wedding',
            badge: 'Cinema 4K',
            desc: 'Dokumentasi pernikahan sinematik dengan color grading berkelas film. Mengabadikan setiap momen sakral akad hingga kemeriahan resepsi.',
            features: ['Cinematic Highlight Film (4K)', 'Full Documentation Video', 'Unlimited Photo Shoot', 'Teaser Reel 60s Instagram/TikTok'],
            color: '#F59E0B',
            gradient: 'from-amber-100/70 via-white/70 to-orange-100/40 dark:from-amber-950/25 dark:via-slate-900/50 dark:to-orange-950/20',
            glow: 'rgba(245, 158, 11, 0.25)',
            icon1: Heart,
            icon2: Film,
        },
        {
            num: '02',
            title: 'Wisuda (Graduation)',
            slug: 'wisuda',
            badge: 'Studio & Outdoor',
            desc: 'Sesi foto wisuda sarjana & magister studio maupun outdoor. Abadikan pencapaian akademis berharga bersama keluarga dan sahabat tercinta.',
            features: ['Indoor Studio / On-Campus Outdoor', 'Foto Portrait Individu & Grup', 'Cetak Frame Kanvas Premium', 'All High-Res Edited Files'],
            color: '#EC4899',
            gradient: 'from-pink-100/70 via-white/70 to-purple-100/40 dark:from-pink-950/25 dark:via-slate-900/50 dark:to-purple-950/20',
            glow: 'rgba(236, 72, 153, 0.25)',
            icon1: GraduationCap,
            icon2: Award,
        },
        {
            num: '03',
            title: 'Event & Festival',
            slug: 'event',
            badge: 'Multi-Camera',
            desc: 'Liputan dokumentasi konser musik, seminar nasional, corporate gathering, peresmian, hingga festival budaya dengan multi-kamera.',
            features: ['Multi-Camera Setup', 'Same-Day Edit Video Reel', 'Live Feed Display Support', 'Dokumentasi Interaksi Audiens'],
            color: '#8B5CF6',
            gradient: 'from-purple-100/70 via-white/70 to-indigo-100/40 dark:from-purple-950/25 dark:via-slate-900/50 dark:to-indigo-950/20',
            glow: 'rgba(139, 92, 246, 0.25)',
            icon1: Calendar,
            icon2: Sparkles,
        },
        {
            num: '04',
            title: 'Traveling & Liburan',
            slug: 'traveling',
            badge: 'Adventure Trip',
            desc: 'Fotografer & videografer personal yang menemani perjalanan wisata, liburan keluarga, maupun trip petualangan eksotis Anda.',
            features: ['Dokumentasi Perjalanan Alami & Estetis', 'Video Sinematik Liburan', 'Pilihan Destinasi Fleksibel', 'Konten Siap Upload Medsos'],
            color: '#10B981',
            gradient: 'from-emerald-100/70 via-white/70 to-teal-100/40 dark:from-emerald-950/25 dark:via-slate-900/50 dark:to-teal-950/20',
            glow: 'rgba(16, 185, 129, 0.25)',
            icon1: Compass,
            icon2: Sun,
        },
        {
            num: '05',
            title: 'Jasa Drone Aerial 4K',
            slug: 'drone',
            badge: 'Aerial 5.1K HDR',
            desc: 'Pengambilan gambar sudut udara spektakuler menggunakan drone profesional beresolusi 4K/5.1K oleh pilot berlisensi resmi.',
            features: ['Pilot Drone Berlisensi', 'Aerial Mapping & Survey', 'Foto & Video Udara 4K/5.1K HDR', 'Izin Terbang & Safety Briefing'],
            color: '#06B6D4',
            gradient: 'from-cyan-100/70 via-white/70 to-sky-100/40 dark:from-cyan-950/25 dark:via-slate-900/50 dark:to-sky-950/20',
            glow: 'rgba(6, 182, 212, 0.25)',
            icon1: Navigation,
            icon2: Crosshair,
        },
        {
            num: '06',
            title: 'Company Profile',
            slug: 'company_profile',
            badge: 'Corporate Grade',
            desc: 'Produksi video dan foto profil perusahaan berstandar korporasi modern untuk meningkatkan kredibilitas di mata klien & investor.',
            features: ['Konsep Storyboard & Scriptwriting', 'Video Tour Kantor & Pabrik', 'Wawancara Direksi & Testimoni Klien', 'Dukungan Dubbing & Subtitle'],
            color: '#3B82F6',
            gradient: 'from-blue-100/70 via-white/70 to-indigo-100/40 dark:from-blue-950/25 dark:via-slate-900/50 dark:to-indigo-950/20',
            glow: 'rgba(59, 130, 246, 0.25)',
            icon1: Building2,
            icon2: MonitorPlay,
        },
    ];

    const filteredGalleries = selectedCategory === 'all'
        ? galleries.filter(g => g.media_type !== 'before_after')
        : galleries.filter(g => g.category === selectedCategory && g.media_type !== 'before_after');

    const gearList = [
        { name: 'Sony FX3 Cinema Line', role: 'Main Cinema Camera (4K 120p 10-bit S-Cinetone)', tag: 'Body' },
        { name: 'Sony A7 IV & A7R V', role: 'High Resolution Still & B-Roll Master (33MP / 61MP)', tag: 'Still & Hybrid' },
        { name: 'Sony G Master F2.8 & F1.4 Series', role: '24-70mm GM II, 70-200mm GM II, 85mm F1.4 GM', tag: 'Optics' },
        { name: 'DJI RS3 Pro & Ronin 4D', role: '3-Axis Motorized Stabilization & LiDAR Autofocus', tag: 'Gimbal' },
        { name: 'Aputure Light Storm Cinema Kit', role: 'LS 600d Pro, 300d II & Amaran RGB Tubes', tag: 'Lighting' },
        { name: 'DJI Mavic 3 Pro Cine', role: 'Triple Camera Aerial Drone with Apple ProRes 422 HQ', tag: 'Aerial' },
    ];

    return (
        <PublicLayout activeService="photography-videography">
            <Head>
                <title>Photography & Videography Cinema Studio</title>
                <meta name="description" content="Layanan fotografi komersial, produksi video sinematik, color grading DaVinci Resolve, dan foto udara resolusi tinggi oleh Langit Visual Studio." />
            </Head>

            {/* Atmosphere styling: Dual Theme Support */}
            <div className="bg-amber-50/20 text-slate-900 dark:bg-[#050507] dark:text-slate-100 min-h-screen pt-4 sm:pt-6 transition-colors duration-300">
                {/* 1. Unified Showcase: "6 Layanan Utama Visual Studio" & "Galeri Foto Mahakarya Langit" */}
                <section id="gallery-section" className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pt-2 sm:pt-4 pb-16 scroll-mt-28">
                    {/* Header & Dynamic Title */}
                    <div className="text-center max-w-3xl mx-auto mb-8">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-mono font-bold uppercase tracking-wider mb-3">
                            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                            <span>Katalog Layanan & Showcase Mahakarya</span>
                        </div>
                        <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white">
                            {activeTab === 'services' ? (
                                <>
                                    6 Layanan Utama <span className="font-editorial italic font-normal text-amber-600 dark:text-amber-400">Visual Studio</span>
                                </>
                            ) : (
                                <>
                                    Galeri Foto <span className="font-editorial italic font-normal text-amber-600 dark:text-amber-400">Mahakarya Langit</span>
                                </>
                            )}
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-2 max-w-xl mx-auto">
                            {activeTab === 'services'
                                ? 'Pilih jenis dokumentasi yang Anda butuhkan, dikerjakan oleh tim fotografer, videografer, dan pilot drone berpengalaman.'
                                : 'Koleksi kurasi karya visual resolusi tinggi dengan inspektur metadata kamera (Lensa, Shutter, Aperture, ISO).'
                            }
                        </p>

                        {/* Clean Executive Segmented Tab Switcher (Professional, 1-Line, Mobile & Desktop Optimized) */}
                        <div className="mt-7 sm:mt-8 flex justify-center">
                            <div className="p-1 sm:p-1.5 rounded-full bg-slate-200/80 dark:bg-white/10 border border-slate-300/80 dark:border-white/10 backdrop-blur-xl shadow-inner inline-flex items-center gap-1 max-w-full">
                                {/* Tab 1: 6 Layanan Utama */}
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('services')}
                                    className={`relative z-10 px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer select-none whitespace-nowrap ${
                                        activeTab === 'services'
                                            ? 'text-slate-950 dark:text-white font-extrabold'
                                            : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                                >
                                    {activeTab === 'services' && (
                                        <motion.div
                                            layoutId="activeViewTabPill"
                                            className="absolute inset-0 rounded-full bg-white dark:bg-slate-900 shadow-sm border border-slate-200/80 dark:border-white/15"
                                            transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                                        />
                                    )}
                                    <span className="relative z-10 flex items-center gap-1.5 sm:gap-2">
                                        <Film className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${activeTab === 'services' ? 'text-amber-500' : 'text-slate-500 dark:text-slate-400'}`} />
                                        <span className="sm:hidden">Layanan (6)</span>
                                        <span className="hidden sm:inline">6 Layanan Utama</span>
                                    </span>
                                </button>

                                {/* Tab 2: Galeri Portofolio */}
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('gallery')}
                                    className={`relative z-10 px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer select-none whitespace-nowrap ${
                                        activeTab === 'gallery'
                                            ? 'text-slate-950 dark:text-white font-extrabold'
                                            : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                                >
                                    {activeTab === 'gallery' && (
                                        <motion.div
                                            layoutId="activeViewTabPill"
                                            className="absolute inset-0 rounded-full bg-white dark:bg-slate-900 shadow-sm border border-slate-200/80 dark:border-white/15"
                                            transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                                        />
                                    )}
                                    <span className="relative z-10 flex items-center gap-1.5 sm:gap-2">
                                        <Camera className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${activeTab === 'gallery' ? 'text-amber-500' : 'text-slate-500 dark:text-slate-400'}`} />
                                        <span className="sm:hidden">Galeri Karya</span>
                                        <span className="hidden sm:inline">Galeri Portofolio</span>
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Animated View Transition Container */}
                    <AnimatePresence mode="wait">
                        {activeTab === 'services' ? (
                            <motion.div
                                key="services-view"
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -16 }}
                                transition={{ duration: 0.3, ease: 'easeOut' }}
                            >
                                {/* Glassmorphism Card Canvas with Pastel Mesh Gradient Background (Matching Pinterest Ref) */}
                                <div className="relative rounded-[32px] sm:rounded-[40px] p-4 sm:p-7 lg:p-9 bg-gradient-to-br from-emerald-100/50 via-sky-100/35 to-rose-100/45 dark:from-[#080E1B]/90 dark:via-[#070B14]/90 dark:to-[#0D101A]/90 border border-slate-200/90 dark:border-white/10 overflow-hidden shadow-sm">
                                    {/* Ambient Pastel Mesh Gradient Blobs */}
                                    <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-emerald-400/25 dark:bg-emerald-500/10 blur-[90px] pointer-events-none" />
                                    <div className="absolute top-1/4 -right-24 w-96 h-96 rounded-full bg-pink-400/25 dark:bg-pink-500/10 blur-[90px] pointer-events-none" />
                                    <div className="absolute -bottom-32 left-1/3 w-96 h-96 rounded-full bg-amber-400/25 dark:bg-amber-500/10 blur-[90px] pointer-events-none" />
                                    <div className="absolute top-2/3 left-10 w-80 h-80 rounded-full bg-cyan-400/20 dark:bg-cyan-500/10 blur-[80px] pointer-events-none" />

                                    {/* 2 Rows x 3 Columns Responsive Grid */}
                                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
                                        {servicePillars.map((pillar) => {
                                            const Icon1 = pillar.icon1;
                                            const Icon2 = pillar.icon2;

                                            return (
                                                <div 
                                                    key={pillar.slug}
                                                    onClick={() => {
                                                        setSelectedCategory(pillar.slug);
                                                        setActiveTab('gallery');
                                                    }}
                                                    className={`
                                                        group relative p-6 sm:p-7 rounded-[26px] sm:rounded-[30px]
                                                        flex flex-col justify-between cursor-pointer
                                                        bg-white/60 dark:bg-[#0C1220]/55
                                                        bg-gradient-to-br ${pillar.gradient}
                                                        backdrop-blur-2xl
                                                        border border-white/80 dark:border-white/15
                                                        hover:border-white dark:hover:border-white/30
                                                        shadow-[0_12px_32px_-10px_rgba(0,0,0,0.06)] dark:shadow-[0_16px_40px_-10px_rgba(0,0,0,0.5)]
                                                        hover:shadow-[0_24px_50px_-12px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_24px_60px_-12px_rgba(0,0,0,0.7)]
                                                        transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
                                                        hover:-translate-y-2
                                                    `}
                                                >
                                                    {/* Top Header: 2 Square Icons (Left) & Minimalist Indicator Badge (Right) */}
                                                    <div>
                                                        <div className="flex items-center justify-between mb-5">
                                                            {/* Left: 2 Rounded-Square Icons Side-by-Side */}
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-11 h-11 rounded-2xl bg-white/95 dark:bg-white/10 border border-white/90 dark:border-white/10 shadow-sm flex items-center justify-center transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-3">
                                                                    <Icon1 className="w-5 h-5 transition-colors" style={{ color: pillar.color }} />
                                                                </div>
                                                                <div className="w-11 h-11 rounded-2xl bg-white/95 dark:bg-white/10 border border-white/90 dark:border-white/10 shadow-sm flex items-center justify-center transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
                                                                    <Icon2 className="w-5 h-5 text-slate-700 dark:text-slate-200" />
                                                                </div>
                                                            </div>

                                                            {/* Right: Modern Pill Indicator / Badge */}
                                                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 dark:bg-white/10 border border-white/80 dark:border-white/10 shadow-xs backdrop-blur-md">
                                                                <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: pillar.color }} />
                                                                <span className="text-[11px] font-mono font-bold text-slate-700 dark:text-slate-200">
                                                                    {pillar.badge}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Title */}
                                                        <h3 className="font-heading font-extrabold text-xl sm:text-[22px] text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                                                            {pillar.title}
                                                        </h3>

                                                        {/* Description */}
                                                        <p className="text-xs sm:text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed mt-2.5">
                                                            {pillar.desc}
                                                        </p>

                                                        {/* Feature Highlights Grid */}
                                                        <div className="mt-4 pt-3.5 border-t border-slate-200/60 dark:border-white/10 space-y-1.5 text-[11px] text-slate-700 dark:text-slate-300 font-medium">
                                                            {pillar.features.map((feat, fIdx) => (
                                                                <div key={fIdx} className="flex items-center gap-2">
                                                                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" style={{ color: pillar.color }} />
                                                                    <span className="leading-snug">{feat}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Card Footer: Buka Galeri Link (Left) & Pill Booking Button (Right) */}
                                                    <div className="mt-6 pt-4 border-t border-slate-200/60 dark:border-white/10 flex items-center justify-between gap-3">
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedCategory(pillar.slug);
                                                                setActiveTab('gallery');
                                                            }}
                                                            className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 group-hover:text-amber-600 dark:group-hover:text-amber-400 hover:underline flex items-center gap-1 transition-colors cursor-pointer"
                                                        >
                                                            <span>Buka Galeri Foto</span>
                                                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                                                        </button>

                                                        <a
                                                            href={getWhatsAppUrl('photo-video', {
                                                                category: pillar.title,
                                                                title: pillar.title,
                                                                details: 'Saya ingin booking paket photoshoot / videography ini.'
                                                            })}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="px-4 py-2 rounded-full bg-slate-900 hover:bg-[#005792] dark:bg-white dark:hover:bg-amber-400 text-white dark:text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md transition-all duration-300 hover:scale-105 active:scale-95 group/btn cursor-pointer shrink-0"
                                                        >
                                                            <span>Booking</span>
                                                            <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                                                        </a>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="gallery-view"
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -16 }}
                                transition={{ duration: 0.3, ease: 'easeOut' }}
                            >
                                {/* Category Filter Pills Bar (styled as in user uploaded screenshot) */}
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
                                    <div className="flex items-center gap-2 text-xs font-mono text-slate-600 dark:text-slate-400">
                                        <Camera className="w-4 h-4 text-amber-500" />
                                        <span>Menampilkan <strong>{filteredGalleries.length}</strong> karya • Klik foto untuk inspeksi EXIF</span>
                                    </div>

                                    {/* Category Filter Pills */}
                                    <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-2 sm:pb-0 scrollbar-none">
                                        {categories.map((c) => (
                                            <button
                                                key={c.key}
                                                type="button"
                                                onClick={() => setSelectedCategory(c.key)}
                                                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                                                    selectedCategory === c.key
                                                        ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30 font-extrabold scale-105'
                                                        : 'bg-white dark:bg-white/5 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/10 hover:border-amber-400/50 shadow-sm'
                                                }`}
                                            >
                                                {c.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Photo Masonry Grid */}
                                {filteredGalleries.length === 0 ? (
                                    <div className="py-16 text-center rounded-3xl border border-dashed border-slate-300 dark:border-white/10 p-8">
                                        <Camera className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                                        <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">Belum ada foto untuk kategori ini</h4>
                                        <p className="text-xs text-slate-500 mt-1">Silakan pilih kategori "Semua Karya" untuk melihat portofolio lainnya.</p>
                                        <button
                                            type="button"
                                            onClick={() => setSelectedCategory('all')}
                                            className="mt-4 px-4 py-2 rounded-full bg-amber-500 text-slate-950 text-xs font-bold cursor-pointer hover:bg-amber-400 transition-colors"
                                        >
                                            Tampilkan Semua Karya
                                        </button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {filteredGalleries.map((item) => (
                                            <div
                                                key={item.id}
                                                onClick={() => setActiveLightboxItem(item)}
                                                className="group relative rounded-3xl overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-950 cursor-pointer shadow-lg aspect-[4/3]"
                                            >
                                                <img
                                                    src={getOptimizedImage(item.file_webp_path, { sdWidth: 480, hdWidth: 1400 })}
                                                    alt={item.title}
                                                    loading="lazy"
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />

                                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-85 group-hover:opacity-100 transition-opacity p-5 flex flex-col justify-end">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 uppercase font-bold">
                                                            {item.category}
                                                        </span>
                                                        <span className="text-[10px] font-mono text-slate-300">
                                                            EXIF
                                                        </span>
                                                    </div>
                                                    <h4 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                                                        {item.title}
                                                    </h4>
                                                    <div className="flex items-center gap-3 text-xs font-mono text-slate-300 mt-1">
                                                        <span>{item.exif_metadata_json?.camera || 'Sony FX3'}</span>
                                                        <span>•</span>
                                                        <span>{item.exif_metadata_json?.aperture || 'f/2.8'}</span>
                                                        <span>•</span>
                                                        <span>ISO {item.exif_metadata_json?.iso || '100'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </section>

                {/* 2. Full-Screen Showreel: "Visual Sinematik Kelas Dunia" */}
                <section className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-16 border-t border-slate-200 dark:border-white/10">
                    <div className="relative rounded-3xl overflow-hidden border border-amber-500/30 dark:border-amber-500/20 shadow-2xl bg-slate-950 min-h-[490px] sm:min-h-[520px] md:aspect-[21/9] md:min-h-[480px] flex flex-col justify-between p-4 sm:p-6 lg:p-8 group">
                        
                        {/* Real HTML5 Video Player with Guaranteed Autoplay */}
                        <video 
                            ref={videoRef}
                            src={activeVideoUrl}
                            poster={activePosterUrl}
                            autoPlay
                            muted={isMuted}
                            playsInline
                            loop
                            onPlay={() => setShowreelPlaying(true)}
                            onPause={() => setShowreelPlaying(false)}
                            className="absolute inset-0 w-full h-full object-cover transition-all duration-700 opacity-80 z-0 group-hover:scale-102"
                        />

                        {/* Dark Gradient Overlay to ensure typography readability while video plays seamlessly */}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/50 to-black/55 z-10 pointer-events-none" />

                        {/* 1. TOP HEADER BAR: BADGE (LEFT) & IN-PLACE CONTROLS (RIGHT) - NO COLLISION */}
                        <div className="relative z-30 flex items-center justify-between gap-2 w-full pointer-events-auto">
                            {/* Left: Cinema Showcase Badge */}
                            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-black/70 sm:bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[11px] sm:text-xs font-mono uppercase tracking-wider font-bold backdrop-blur-md shadow-sm shrink-0">
                                <Film className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                                <span className="hidden sm:inline">Cinema & Darkroom</span>
                                <span>Showcase</span>
                            </div>

                            {/* Right: In-Place SD/HD & Audio Pill Controls */}
                            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                                {/* In-Place SD/HD Switcher */}
                                <div className="flex items-center p-0.5 rounded-full bg-black/80 backdrop-blur-md border border-white/25 shadow-xl">
                                    <button
                                        type="button"
                                        onClick={() => setQuality('sd')}
                                        className={`flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-mono font-bold transition-all cursor-pointer ${
                                            !isHd
                                                ? 'bg-emerald-600 text-white shadow-xs'
                                                : 'text-slate-300 hover:text-white'
                                        }`}
                                        title="Mode SD: Video ringan dan hemat kuota"
                                    >
                                        <Zap className={`w-3 h-3 shrink-0 ${!isHd ? 'text-white' : 'text-slate-400'}`} />
                                        <span>SD</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setQuality('hd')}
                                        className={`flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-mono font-bold transition-all cursor-pointer ${
                                            isHd
                                                ? 'bg-emerald-600 text-white shadow-xs font-bold'
                                                : 'text-slate-300 hover:text-white'
                                        }`}
                                        title="Mode HD: Video resolusi sinema tinggi 4K"
                                    >
                                        <Sparkles className={`w-3 h-3 shrink-0 ${isHd ? 'text-white' : 'text-slate-400'}`} />
                                        <span>HD</span>
                                    </button>
                                </div>

                                {/* Audio Mute/Unmute Toggle Button */}
                                <button
                                    type="button"
                                    onClick={toggleMute}
                                    title={isMuted ? 'Nyalakan Audio Video' : 'Bisukan Audio Video'}
                                    className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-black/80 hover:bg-black/95 backdrop-blur-md border border-white/25 text-white transition-all hover:scale-105 cursor-pointer shadow-xl text-[11px] sm:text-xs font-mono"
                                >
                                    {isMuted ? (
                                        <>
                                            <VolumeX className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                            <span className="hidden sm:inline text-amber-200">Mute</span>
                                        </>
                                    ) : (
                                        <>
                                            <Volume2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                            <span className="hidden sm:inline text-emerald-200">Audio</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* 2. CENTER TYPOGRAPHY & MAIN ACTIONS (BALANCED & PROPORTIONAL) */}
                        <div className="relative z-20 text-center max-w-2xl mx-auto px-2 sm:px-6 my-auto py-4 sm:py-6 space-y-3 sm:space-y-4 pointer-events-auto">
                            <h1 className="font-heading font-extrabold text-2xl sm:text-4xl md:text-5xl lg:text-6xl text-white tracking-tight leading-tight drop-shadow-lg">
                                Visual <span className="font-editorial italic font-normal text-amber-300 tracking-wide">Sinematik</span> Kelas Dunia.
                            </h1>

                            <p className="text-slate-200 text-xs sm:text-sm md:text-base max-w-lg mx-auto leading-relaxed drop-shadow">
                                Dari storyboard komersial brand ternama hingga mahakarya pernikahan abadi, direkam dengan standar kamera sinema dan kalibrasi warna presisi.
                            </p>

                            <div className="pt-2 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5">
                                {/* Button 1: Play / Pause Showreel */}
                                <button
                                    type="button"
                                    onClick={togglePlayShowreel}
                                    className="px-4 sm:px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-500/30 transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                                >
                                    {showreelPlaying ? (
                                        <>
                                            <Pause className="w-4 h-4 fill-slate-950" />
                                            <span>Jeda Video</span>
                                        </>
                                    ) : (
                                        <>
                                            <Play className="w-4 h-4 fill-slate-950" />
                                            <span>Putar Video</span>
                                        </>
                                    )}
                                </button>

                                {/* Button 2: Booking Jadwal Shoot */}
                                <Link
                                    href="/konsultasi"
                                    className="px-4 sm:px-5 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white border border-white/30 text-xs sm:text-sm font-bold transition-all hover:scale-105 active:scale-95 backdrop-blur-md flex items-center gap-1.5 shadow-sm"
                                >
                                    <span>Booking Jadwal Shoot</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </Link>
                            </div>
                        </div>

                        {/* 3. BOTTOM BAR: LIVE STATUS PILL & METADATA (DEDICATED SLOT - NO OVERLAP) */}
                        <div className="relative z-20 flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 text-[11px] font-mono text-slate-300 pointer-events-none">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/75 border border-amber-500/40 text-amber-300 text-[11px] font-mono backdrop-blur-md shadow-md pointer-events-auto">
                                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping shrink-0" />
                                <span>
                                    {showreelPlaying ? '▶ Playing Showreel' : '⏸ Video Dijeda'} • {isHd ? '4K Cinema (HD)' : 'Mode Cepat (SD)'}
                                </span>
                            </div>

                            <div className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-300/80 font-mono">
                                <span>Master: S-Cinetone 10-bit Rec.709</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 3. Interactive Before/After Color Grading Slider (Dynamic from Backend) */}
                <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-16 border-t border-slate-200 dark:border-white/10">
                    <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-mono text-xs uppercase tracking-wider mb-1 font-bold">
                                <SlidersHorizontal className="w-4 h-4" />
                                <span>DaVinci Resolve Color Science</span>
                            </div>
                            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white">
                                Interactive Before / After <span className="font-editorial italic font-normal text-amber-600 dark:text-amber-400">Color Grading</span>
                            </h2>
                            <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-1">
                                Geser garis pemisah untuk melihat bagaimana footage RAW Log diolah menjadi tampilan sinematik dengan profil warna kustom Langit Kodak 2383.
                            </p>
                        </div>

                        {/* In-Place SD/HD Switcher for Before/After */}
                        <div className="flex items-center p-0.5 rounded-full bg-slate-200/90 dark:bg-white/10 border border-slate-300 dark:border-white/10 shadow-inner shrink-0">
                            <button
                                type="button"
                                onClick={() => setQuality('sd')}
                                className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-mono font-bold transition-all cursor-pointer ${
                                    !isHd
                                        ? 'bg-emerald-600 text-white shadow-xs'
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                }`}
                                title="Mode SD: Sangat ringan & hemat kuota"
                            >
                                <Zap className={`w-3 h-3 shrink-0 ${!isHd ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                                <span>SD</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setQuality('hd')}
                                className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-mono font-bold transition-all cursor-pointer ${
                                    isHd
                                        ? 'bg-emerald-600 text-white shadow-xs font-bold'
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                }`}
                                title="Mode HD: Tampilan color grading resolusi tinggi 100%"
                            >
                                <Sparkles className={`w-3 h-3 shrink-0 ${isHd ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                                <span>HD</span>
                            </button>
                        </div>
                    </div>

                    <BeforeAfterSlider
                        beforeImg={getOptimizedImage(beforeAfter?.before_file_path || "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1400&q=80", { sdWidth: 640, hdWidth: 1400 })}
                        afterImg={getOptimizedImage(beforeAfter?.file_webp_path || "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1400&q=80", { sdWidth: 640, hdWidth: 1400 })}
                        beforeLabel={beforeAfter?.exif_metadata_json?.before_label || "Sony S-Log3 RAW Flat"}
                        afterLabel={beforeAfter?.exif_metadata_json?.after_label || "Langit Cinema Grade (Kodak 2383)"}
                    />
                </section>

                {/* 4. Gear & Studio Showcase */}
                <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-16 border-t border-slate-200 dark:border-white/10">
                    <div className="mb-10 text-center max-w-2xl mx-auto">
                        <span className="text-xs font-mono text-amber-600 dark:text-amber-400 uppercase tracking-wider block mb-1 font-bold">
                            Production Armor & Studio Setup
                        </span>
                        <h2 className="font-heading font-extrabold text-3xl text-slate-900 dark:text-white">
                            Peralatan Tempur Berstandar Bioskop
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-2">
                            Kami berinvestasi pada teknologi sensor terbaik untuk menjamin setiap detil gambar brand Anda tampil dengan ketajaman maksimal.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {gearList.map((g, idx) => (
                            <div key={idx} className="p-4 rounded-2xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 hover:border-amber-400 dark:hover:border-amber-500/30 transition-all flex items-start gap-3.5 shadow-sm">
                                <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                                    <Disc className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{g.name}</h4>
                                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 font-semibold">{g.tag}</span>
                                    </div>
                                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{g.role}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-10 text-center">
                        <Link
                            href="/layanan/sewa-alat"
                            className="inline-flex items-center gap-2 text-xs font-mono text-teal-600 dark:text-teal-400 hover:underline font-bold"
                        >
                            <span>Ingin menyewa alat-alat di atas untuk produksi mandiri? Buka Katalog Sewa Alat Langit →</span>
                        </Link>
                    </div>
                </section>
            </div>

            {/* Lightbox Modal */}
            {activeLightboxItem && (
                <LightboxModal
                    item={activeLightboxItem}
                    onClose={() => setActiveLightboxItem(null)}
                />
            )}
        </PublicLayout>
    );
}
