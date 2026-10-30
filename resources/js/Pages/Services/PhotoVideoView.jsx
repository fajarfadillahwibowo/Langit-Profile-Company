import React, { useState, useRef, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import PublicLayout from '@/Layouts/PublicLayout';
import LightboxModal from '@/Components/LightboxModal';
import BeforeAfterSlider from '@/Components/BeforeAfterSlider';
import { 
    Camera, Play, Pause, Volume2, VolumeX, SlidersHorizontal, Disc,
    ArrowRight, CheckCircle2, Film, Sparkles, Layers, Images, Zap
} from 'lucide-react';
import { useQuality } from '@/Context/QualityContext';

export default function PhotoVideoView({ service, galleries = [], beforeAfter = null, showreel = null }) {
    const { isHd, toggleQuality, getOptimizedImage } = useQuality();
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
            desc: 'Dokumentasi pernikahan sinematik dengan color grading berkelas film. Mengabadikan setiap momen sakral akad hingga kemeriahan resepsi.',
            features: ['Cinematic Highlight Film (4K)', 'Full Documentation Video', 'Unlimited Photo Shoot', 'Teaser Reel 60s Instagram/TikTok'],
            color: '#F59E0B',
        },
        {
            num: '02',
            title: 'Wisuda (Graduation)',
            slug: 'wisuda',
            desc: 'Sesi foto wisuda sarjana & magister studio maupun outdoor. Abadikan pencapaian akademis berharga bersama keluarga dan sahabat tercinta.',
            features: ['Indoor Studio / On-Campus Outdoor', 'Foto Portrait Individu & Grup', 'Cetak Frame Kanvas Premium', 'All High-Res Edited Files'],
            color: '#EC4899',
        },
        {
            num: '03',
            title: 'Event & Festival',
            slug: 'event',
            desc: 'Liputan dokumentasi konser musik, seminar nasional, corporate gathering, peresmian, hingga festival budaya dengan multi-kamera.',
            features: ['Multi-Camera Setup', 'Same-Day Edit Video Reel', 'Live Feed Display Support', 'Dokumentasi Interaksi Audiens'],
            color: '#8B5CF6',
        },
        {
            num: '04',
            title: 'Traveling & Liburan',
            slug: 'traveling',
            desc: 'Fotografer & videografer personal yang menemani perjalanan wisata, liburan keluarga, maupun trip petualangan eksotis Anda.',
            features: ['Dokumentasi Perjalanan Alami & Estetis', 'Video Sinematik Liburan', 'Pilihan Destinasi Fleksibel', 'Konten Siap Upload Medsos'],
            color: '#10B981',
        },
        {
            num: '05',
            title: 'Jasa Drone Aerial 4K',
            slug: 'drone',
            desc: 'Pengambilan gambar sudut udara spektakuler menggunakan drone profesional beresolusi 4K/5.1K oleh pilot berlisensi resmi.',
            features: ['Pilot Drone Berlisensi', 'Aerial Mapping & Survey', 'Foto & Video Udara 4K/5.1K HDR', 'Izin Terbang & Safety Briefing'],
            color: '#06B6D4',
        },
        {
            num: '06',
            title: 'Company Profile',
            slug: 'company_profile',
            desc: 'Produksi video dan foto profil perusahaan berstandar korporasi modern untuk meningkatkan kredibilitas di mata klien & investor.',
            features: ['Konsep Storyboard & Scriptwriting', 'Video Tour Kantor & Pabrik', 'Wawancara Direksi & Testimoni Klien', 'Dukungan Dubbing & Subtitle'],
            color: '#3B82F6',
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
            <div className="bg-amber-50/20 text-slate-900 dark:bg-[#050507] dark:text-slate-100 min-h-screen -mt-6 pt-6 transition-colors duration-300">
                {/* 1. Full-Screen Showreel Header with Real Video Playback */}
                <section className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pt-4 pb-16">
                    <div className="relative rounded-3xl overflow-hidden border border-amber-500/30 dark:border-amber-500/20 shadow-2xl bg-slate-950 aspect-[16/9] md:aspect-[21/9] flex items-center justify-center group">
                        
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
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/45 to-black/40 z-10 pointer-events-none" />

                        {/* Centered Typography & Controls (Always clear & readable over the moving video) */}
                        <div className="relative z-20 text-center max-w-3xl px-6 space-y-4 pointer-events-auto">
                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-mono uppercase tracking-widest font-bold backdrop-blur-md">
                                <Film className="w-3.5 h-3.5" />
                                <span>Cinema & Darkroom Showcase</span>
                            </div>

                            <h1 className="font-heading font-extrabold text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-tight drop-shadow-lg">
                                Visual <span className="font-editorial italic font-normal text-amber-300 tracking-wide">Sinematik</span> Kelas Dunia.
                            </h1>

                            <p className="text-slate-200 text-sm sm:text-base max-w-xl mx-auto leading-relaxed drop-shadow">
                                Dari storyboard komersial brand ternama hingga mahakarya pernikahan abadi, direkam dengan standar kamera sinema dan kalibrasi warna presisi.
                            </p>

                            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                                <button
                                    type="button"
                                    onClick={togglePlayShowreel}
                                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-lg shadow-amber-500/30 transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                                >
                                    {showreelPlaying ? (
                                        <>
                                            <Pause className="w-4 h-4 fill-slate-950" />
                                            <span>Jeda Video (Pause)</span>
                                        </>
                                    ) : (
                                        <>
                                            <Play className="w-4 h-4 fill-slate-950" />
                                            <span>Putar Video (Play)</span>
                                        </>
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={toggleMute}
                                    className="px-4 py-2.5 rounded-xl bg-black/60 hover:bg-black/80 text-white border border-white/20 text-sm font-semibold flex items-center gap-2 backdrop-blur-md transition-all hover:scale-105 cursor-pointer"
                                    title={isMuted ? 'Nyalakan Audio' : 'Bisukan Audio'}
                                >
                                    {isMuted ? (
                                        <>
                                            <VolumeX className="w-4 h-4 text-amber-400" />
                                            <span>Nyalakan Audio</span>
                                        </>
                                    ) : (
                                        <>
                                            <Volume2 className="w-4 h-4 text-emerald-400" />
                                            <span>Bisukan Audio</span>
                                        </>
                                    )}
                                </button>
                                
                                {/* Video HD Quality Toggle Button */}
                                <button
                                    type="button"
                                    onClick={toggleQuality}
                                    className={`px-4 py-2.5 rounded-xl border text-sm font-bold flex items-center gap-2 backdrop-blur-md transition-all hover:scale-105 cursor-pointer ${
                                        isHd
                                            ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/30'
                                            : 'bg-black/60 text-emerald-300 border-white/20 hover:bg-black/80'
                                    }`}
                                    title="Klik untuk mengubah kualitas video & foto (SD Cepat / HD)"
                                >
                                    {isHd ? (
                                        <>
                                            <Sparkles className="w-4 h-4" />
                                            <span>Kualitas: HD Penuh</span>
                                        </>
                                    ) : (
                                        <>
                                            <Zap className="w-4 h-4 text-emerald-400" />
                                            <span>Kualitas: SD Cepat</span>
                                        </>
                                    )}
                                </button>
                                
                                <Link
                                    href="/konsultasi"
                                    className="px-5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/25 text-sm font-bold transition-colors backdrop-blur-md"
                                >
                                    Booking Jadwal Shoot
                                </Link>
                            </div>
                        </div>

                        {/* Top-Right Audio & Quality Floating Pill Controls */}
                        <div className="absolute top-5 right-5 z-30 flex items-center gap-2">
                            <button
                                type="button"
                                onClick={toggleQuality}
                                title={isHd ? 'Sedang Kualitas HD. Klik untuk Mode Ringan (SD)' : 'Sedang Mode SD. Klik untuk Resolusi HD'}
                                className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-md border text-xs font-mono transition-all hover:scale-105 cursor-pointer shadow-lg ${
                                    isHd
                                        ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                                        : 'bg-black/70 hover:bg-black/90 text-emerald-300 border-white/20'
                                }`}
                            >
                                {isHd ? <Sparkles className="w-3.5 h-3.5" /> : <Zap className="w-3.5 h-3.5 text-emerald-400" />}
                                <span>{isHd ? 'Mode: HD' : 'Mode: SD'}</span>
                            </button>

                            <button
                                type="button"
                                onClick={toggleMute}
                                title={isMuted ? 'Nyalakan Audio Video' : 'Bisukan Audio Video'}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/70 hover:bg-black/90 backdrop-blur-md border border-white/20 text-white transition-all hover:scale-105 cursor-pointer shadow-lg text-xs font-mono"
                            >
                                {isMuted ? (
                                    <>
                                        <VolumeX className="w-3.5 h-3.5 text-amber-400" />
                                        <span className="hidden sm:inline text-amber-200">Audio: Mute</span>
                                    </>
                                ) : (
                                    <>
                                        <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                                        <span className="hidden sm:inline text-emerald-200">Audio: Nyala</span>
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Bottom-Left Floating Video Autoplay Status Badge */}
                        <div className="absolute bottom-4 left-6 z-30 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/80 border border-amber-500/50 text-amber-300 text-xs font-mono backdrop-blur-md">
                            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                            <span>{showreelPlaying ? '▶ Auto-Playing Reel' : '⏸ Video Dijeda'} • {isHd ? '4K Cinema Footage (HD)' : 'Mode Ringan (SD Cepat)'}</span>
                        </div>
                    </div>
                </section>

                {/* 2. Unified Showcase: "6 Layanan Utama Visual Studio" & "Galeri Foto Mahakarya Langit" */}
                <section id="gallery-section" className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-16 border-t border-slate-200 dark:border-white/10">
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

                        {/* Creative & Animative Pill Menu Switcher (Pemisah 2 Menu) */}
                        <div className="mt-8 flex flex-col items-center">
                            <div className="relative p-1.5 rounded-full bg-slate-100/95 dark:bg-white/[0.06] backdrop-blur-xl border border-slate-200/90 dark:border-white/10 shadow-lg shadow-black/5 dark:shadow-amber-500/5 inline-flex items-center gap-1.5 sm:gap-2">
                                {/* Button 1: 6 Layanan Utama Visual Studio */}
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('services')}
                                    className={`relative z-10 px-4 sm:px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 flex items-center gap-2 sm:gap-2.5 cursor-pointer ${
                                        activeTab === 'services'
                                            ? 'text-slate-950 font-extrabold'
                                            : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                                >
                                    {activeTab === 'services' && (
                                        <motion.div
                                            layoutId="activeViewTabPill"
                                            className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 shadow-md shadow-amber-500/30"
                                            transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                                        />
                                    )}
                                    <span className="relative z-10 flex items-center gap-2">
                                        <Film className={`w-4 h-4 ${activeTab === 'services' ? 'text-slate-950' : 'text-amber-500'}`} />
                                        <span>6 Layanan Utama Visual Studio</span>
                                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                                            activeTab === 'services' 
                                                ? 'bg-black/15 text-slate-950 font-bold' 
                                                : 'bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-400'
                                        }`}>
                                            6 Divisi
                                        </span>
                                    </span>
                                </button>

                                {/* Button 2: Galeri Foto Mahakarya Langit */}
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('gallery')}
                                    className={`relative z-10 px-4 sm:px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 flex items-center gap-2 sm:gap-2.5 cursor-pointer ${
                                        activeTab === 'gallery'
                                            ? 'text-slate-950 font-extrabold'
                                            : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                                >
                                    {activeTab === 'gallery' && (
                                        <motion.div
                                            layoutId="activeViewTabPill"
                                            className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 shadow-md shadow-amber-500/30"
                                            transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                                        />
                                    )}
                                    <span className="relative z-10 flex items-center gap-2">
                                        <Camera className={`w-4 h-4 ${activeTab === 'gallery' ? 'text-slate-950' : 'text-amber-500'}`} />
                                        <span>Galeri Foto Mahakarya Langit</span>
                                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                                            activeTab === 'gallery' 
                                                ? 'bg-black/15 text-slate-950 font-bold' 
                                                : 'bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-400'
                                        }`}>
                                            Showcase
                                        </span>
                                    </span>
                                </button>
                            </div>

                            {/* Animated bottom track line indicator (inspired by user screenshot's line) */}
                            <div className="w-56 sm:w-72 h-1 mt-3 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden relative">
                                <motion.div
                                    className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-amber-400 to-amber-500 rounded-full shadow-sm shadow-amber-500/50"
                                    animate={{ x: activeTab === 'services' ? '0%' : '100%' }}
                                    transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                                />
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
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {servicePillars.map((pillar) => (
                                        <div 
                                            key={pillar.slug}
                                            onClick={() => {
                                                setSelectedCategory(pillar.slug);
                                                setActiveTab('gallery');
                                            }}
                                            className="group p-6 rounded-3xl border transition-all duration-300 flex flex-col justify-between cursor-pointer bg-white dark:bg-white/[0.02] border-slate-200 dark:border-white/5 hover:border-amber-400/60 hover:shadow-xl hover:shadow-amber-500/10"
                                        >
                                            <div>
                                                <div className="flex items-center justify-between mb-4">
                                                    <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-400">
                                                        {pillar.num}
                                                    </span>
                                                    <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 uppercase tracking-widest font-bold group-hover:underline flex items-center gap-1">
                                                        <span>Buka Galeri</span>
                                                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                                                    </span>
                                                </div>

                                                <h3 className="font-heading font-bold text-xl text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                                                    {pillar.title}
                                                </h3>

                                                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mt-2.5">
                                                    {pillar.desc}
                                                </p>

                                                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-white/10 space-y-2">
                                                    {pillar.features.map((feat, fIdx) => (
                                                        <div key={fIdx} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                                                            <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                                                            <span>{feat}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="mt-6 pt-4 flex items-center justify-between border-t border-slate-100 dark:border-white/5">
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedCategory(pillar.slug);
                                                        setActiveTab('gallery');
                                                    }}
                                                    className="text-xs font-mono font-bold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                                                >
                                                    <span>Lihat Contoh Hasil</span>
                                                    <ArrowRight className="w-3.5 h-3.5" />
                                                </button>

                                                <Link
                                                    href="/konsultasi"
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-sm transition-transform hover:scale-105"
                                                >
                                                    Booking
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
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

                {/* 2.5 Interactive Before/After Color Grading Slider (Dynamic from Backend) */}
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

                        {/* HD toggle button for before/after */}
                        <button
                            type="button"
                            onClick={toggleQuality}
                            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold border transition-all flex items-center gap-1.5 shadow-sm shrink-0 ${
                                isHd
                                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-700 dark:text-amber-300 hover:bg-amber-500/25'
                                    : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20'
                            }`}
                        >
                            {isHd ? <Sparkles className="w-3.5 h-3.5 text-amber-500" /> : <Zap className="w-3.5 h-3.5 text-emerald-500" />}
                            <span>{isHd ? 'Resolusi: HD (100%)' : 'Resolusi: SD (Cepat)'}</span>
                        </button>
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
