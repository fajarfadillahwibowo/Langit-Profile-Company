import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import LightboxModal from '@/Components/LightboxModal';
import BeforeAfterSlider from '@/Components/BeforeAfterSlider';
import { 
    Camera, Video, Play, SlidersHorizontal, Disc, Aperture, Eye,
    ArrowRight, CheckCircle2, Sparkles, Filter, ShieldCheck, Film
} from 'lucide-react';

export default function PhotoVideoView({ service, galleries = [], beforeAfter = null }) {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [activeLightboxItem, setActiveLightboxItem] = useState(null);
    const [showreelPlaying, setShowreelPlaying] = useState(false);

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
                {/* 1. Full-Screen Showreel Header */}
                <section className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pt-4 pb-16">
                    <div className="relative rounded-3xl overflow-hidden border border-amber-500/30 dark:border-amber-500/20 shadow-2xl bg-slate-950 aspect-[16/9] md:aspect-[21/9] flex items-center justify-center group">
                        {/* Background Video Reel Still */}
                        <img 
                            src="https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1600&q=80" 
                            alt="Langit Cinema Showreel" 
                            className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-black/40 to-black/30"></div>

                        {/* Centered Play Button & Typography */}
                        <div className="relative z-10 text-center max-w-3xl px-6 space-y-4">
                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-mono uppercase tracking-widest font-bold">
                                <Film className="w-3.5 h-3.5" />
                                <span>Cinema & Darkroom Showcase</span>
                            </div>

                            <h1 className="font-heading font-extrabold text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-tight">
                                Visual <span className="font-editorial italic font-normal text-amber-300 tracking-wide">Sinematik</span> Kelas Dunia.
                            </h1>

                            <p className="text-slate-200 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
                                Dari storyboard komersial brand ternama hingga mahakarya pernikahan abadi, direkam dengan standar kamera sinema dan kalibrasi warna presisi.
                            </p>

                            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                                <button
                                    onClick={() => setShowreelPlaying(!showreelPlaying)}
                                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-sm flex items-center gap-2.5 shadow-lg shadow-amber-500/30 transition-transform hover:scale-105 active:scale-95"
                                >
                                    <Play className="w-4 h-4 fill-slate-950" />
                                    <span>{showreelPlaying ? 'Pause Showreel' : 'Play Full Reel with Audio'}</span>
                                </button>
                                
                                <Link
                                    href="/konsultasi"
                                    className="px-5 py-3 rounded-xl bg-white/15 hover:bg-white/20 text-white border border-white/20 text-sm font-bold transition-colors"
                                >
                                    Booking Jadwal Shoot
                                </Link>
                            </div>
                        </div>

                        {showreelPlaying && (
                            <div className="absolute bottom-4 left-6 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/80 border border-amber-500/50 text-amber-400 text-xs font-mono animate-pulse">
                                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                                <span>Showreel Audio Stream: 48kHz 24-bit Hi-Fi</span>
                            </div>
                        )}
                    </div>
                </section>

                {/* 2. Interactive Before/After Color Grading Slider */}
                <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-12">
                    <div className="mb-6">
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

                    <BeforeAfterSlider
                        beforeImg="https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1400&q=80"
                        afterImg="https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1400&q=80"
                        beforeLabel="Sony S-Log3 RAW Flat"
                        afterLabel="Langit Cinema Grade (Kodak 2383)"
                    />
                </section>

                {/* 2.5 6 Layanan Spesialisasi Photography & Videography */}
                <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-16 border-t border-slate-200 dark:border-white/10">
                    <div className="text-center max-w-2xl mx-auto mb-12">
                        <span className="text-xs font-mono text-amber-600 dark:text-amber-400 uppercase tracking-wider block mb-1 font-bold">
                            Layanan Terpadu & Portofolio
                        </span>
                        <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white">
                            6 Layanan Utama <span className="font-editorial italic font-normal text-amber-600 dark:text-amber-400">Visual Studio</span>
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-2">
                            Pilih jenis dokumentasi yang Anda butuhkan, dikerjakan oleh tim fotografer, videografer, dan pilot drone berpengalaman.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {servicePillars.map((pillar) => (
                            <div 
                                key={pillar.slug}
                                onClick={() => setSelectedCategory(pillar.slug)}
                                className={`group p-6 rounded-3xl border transition-all duration-300 flex flex-col justify-between cursor-pointer ${
                                    selectedCategory === pillar.slug
                                        ? 'bg-amber-500/10 border-amber-500 shadow-xl shadow-amber-500/10'
                                        : 'bg-white dark:bg-white/[0.02] border-slate-200 dark:border-white/5 hover:border-amber-400/60 hover:shadow-lg'
                                }`}
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-400">
                                            {pillar.num}
                                        </span>
                                        <span className="text-[10px] font-mono text-slate-600 dark:text-slate-400 uppercase tracking-widest font-bold">
                                            Klik Filter Galeri
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

                                <div className="mt-6 pt-4 flex items-center justify-between">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedCategory(pillar.slug);
                                            const gal = document.getElementById('gallery-section');
                                            if (gal) gal.scrollIntoView({ behavior: 'smooth' });
                                        }}
                                        className="text-xs font-mono font-bold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1"
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
                </section>

                {/* 3. Langit Photo Gallery (Masonry Grid + EXIF Inspector) */}
                <section id="gallery-section" className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-16">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                        <div>
                            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-mono text-xs uppercase tracking-wider mb-1 font-bold">
                                <Camera className="w-4 h-4" />
                                <span>Curated Showcase & EXIF Inspector</span>
                            </div>
                            <h2 className="font-heading font-extrabold text-2xl sm:text-4xl text-slate-900 dark:text-white">
                                Galeri Foto Mahakarya Langit
                            </h2>
                            <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-1">
                                Klik foto apa pun untuk membuka Lightbox resolusi tinggi dengan inspektur metadata kamera (Lensa, Shutter, Aperture, ISO).
                            </p>
                        </div>

                        {/* Category Filter Pills */}
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0">
                            {categories.map((c) => (
                                <button
                                    key={c.key}
                                    onClick={() => setSelectedCategory(c.key)}
                                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                                        selectedCategory === c.key
                                            ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                                            : 'bg-white dark:bg-white/5 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/5 shadow-sm'
                                    }`}
                                >
                                    {c.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Photo Masonry Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredGalleries.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => setActiveLightboxItem(item)}
                                className="group relative rounded-3xl overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-950 cursor-pointer shadow-lg aspect-[4/3]"
                            >
                                <img
                                    src={item.file_webp_path}
                                    alt={item.title}
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
