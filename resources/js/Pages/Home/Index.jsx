import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import LightboxModal from '@/Components/LightboxModal';
import ScrollingServiceCards from '@/Components/ScrollingServiceCards';
import HeroLangit from '@/Components/HeroLangit';
import CircularCarousel from '@/Components/CircularCarousel';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Camera, Sparkles, Activity, ArrowRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function HomeIndex({
    services = [],
    featuredGalleries = [],
    rentalHighlights = [],
    internshipOpenings = [],
    stats = {},
}) {
    const [activeLightboxItem, setActiveLightboxItem] = useState(null);
    const [activeCarouselIndex, setActiveCarouselIndex] = useState(0);
    const [carouselPreset, setCarouselPreset] = useState('cylinder');
    const [isDrifting, setIsDrifting] = useState(true);
    const [isDark, setIsDark] = useState(false);
    const pageRef = useRef(null);

    // Dynamic dark mode tracking for accurate 3D carousel fadeColor
    useEffect(() => {
        const updateTheme = () => {
            setIsDark(document.documentElement.classList.contains('dark'));
        };
        updateTheme();
        const observer = new MutationObserver(updateTheme);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme'] });
        return () => observer.disconnect();
    }, []);

    // Format items for CircularCarousel with Langit photography & cinematic metadata
    const carouselItems = useMemo(() => {
        if (featuredGalleries && featuredGalleries.length > 0) {
            return featuredGalleries.map((item) => ({
                src: item.file_webp_path,
                alt: item.title,
                title: item.title,
                subtitle: `${(item.category || 'CINEMA').replace('_', ' ').toUpperCase()} • ${item.exif_metadata_json?.camera || 'Sony Cinema Line'}`,
                raw: item,
            }));
        }
        return undefined;
    }, [featuredGalleries]);

    const currentActiveItem = useMemo(() => {
        if (carouselItems && carouselItems[activeCarouselIndex]) {
            return carouselItems[activeCarouselIndex].raw;
        }
        return featuredGalleries[activeCarouselIndex] || featuredGalleries[0];
    }, [carouselItems, activeCarouselIndex, featuredGalleries]);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.utils.toArray('.reveal-header').forEach((el) => {
                gsap.from(el, {
                    opacity: 0, y: 32, duration: 0.7, ease: 'power3.out',
                    scrollTrigger: { trigger: el, start: 'top 88%' },
                });
            });

            gsap.from('.carousel-wrapper', {
                opacity: 0, y: 35, duration: 0.8, ease: 'power3.out',
                scrollTrigger: { trigger: '.carousel-wrapper', start: 'top 85%' },
            });

        }, pageRef);

        return () => ctx.revert();
    }, []);

    return (
        <PublicLayout>
            <Head>
                <title>Ekosistem Digital Terpadu & Multi-Layanan</title>
                <meta name="description" content="Langit adalah ekosistem digital modern yang menaungi 7 divisi layanan: Fotografi/Videografi sinematik, Web Development, Edukasi, Servis Komputer, Sewa Alat, Magang, dan Kolaborasi B2B." />
            </Head>

            <div ref={pageRef}>
                <HeroLangit />

                {/* 7 SERVICES (Pinterest Reference Scrolling Cards Animation by Abron Studio) */}
                <ScrollingServiceCards services={services} />

                {/* GALLERY / MAHAKARYA VISUAL & SINEMATOGRAFI (CircularCarousel 3D Ring) */}
                <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-20 lg:py-24 relative overflow-hidden">
                    <div className="reveal-header flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                        <div>
                            <div className="flex items-center gap-2 text-[#005792] dark:text-[#38BDF8] font-mono text-[11px] uppercase tracking-widest mb-2 font-bold">
                                <Camera className="w-3.5 h-3.5" />
                                <span>Langit Photo & Video Gallery</span>
                            </div>
                            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl text-slate-900 dark:text-white tracking-tight">
                                Mahakarya Visual
                                <span className="block text-[#005792] dark:text-[#38BDF8]">
                                    & <span className="font-editorial italic font-normal tracking-normal text-[#005792] dark:text-[#38BDF8]">Sinematografi</span>
                                </span>
                            </h2>
                        </div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            <Link href="/layanan/photography-videography" className="group text-xs font-mono text-[#005792] dark:text-[#38BDF8] hover:text-[#004270] dark:hover:text-white flex items-center gap-1.5 font-bold transition-all">
                                Lihat Semua Foto & Before/After Color Grade
                                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>

                    {/* Interactive 3D Mode Bar & Controls */}
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-6 px-1">
                        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-200/70 dark:bg-white/[0.06] border border-slate-300/60 dark:border-white/10 backdrop-blur-md">
                            <span className="text-[11px] font-mono font-semibold px-2.5 text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-[#005792] dark:text-[#38BDF8]" />
                                3D Mode:
                            </span>
                            {[
                                { id: 'cylinder', label: 'Cylinder' },
                                { id: 'orbit', label: 'Orbit' },
                                { id: 'wheel', label: 'Wheel' },
                                { id: 'panorama', label: 'Panorama' },
                            ].map(p => (
                                <button
                                    key={p.id}
                                    type="button"
                                    onClick={() => setCarouselPreset(p.id)}
                                    className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
                                        carouselPreset === p.id
                                            ? 'bg-[#005792] text-white shadow-sm font-semibold shadow-[#005792]/25'
                                            : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/10'
                                    }`}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setIsDrifting(prev => !prev)}
                                className="px-3 py-1.5 rounded-xl text-xs font-mono font-medium border border-slate-300/60 dark:border-white/10 bg-white/70 dark:bg-white/[0.04] hover:bg-white dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 transition-all flex items-center gap-1.5 shadow-sm"
                                title="Toggle Autoplay Rotation"
                            >
                                <Activity className="w-3.5 h-3.5 text-[#005792] dark:text-[#38BDF8]" />
                                <span>{isDrifting ? 'Auto-Rotate: ON' : 'Auto-Rotate: OFF'}</span>
                            </button>

                            {currentActiveItem && (
                                <button
                                    type="button"
                                    onClick={() => setActiveLightboxItem(currentActiveItem)}
                                    className="px-3.5 py-1.5 rounded-xl text-xs font-mono font-semibold bg-[#005792] hover:bg-[#004270] text-white transition-all flex items-center gap-1.5 shadow-md shadow-[#005792]/30"
                                >
                                    <Camera className="w-3.5 h-3.5" />
                                    <span>Inspeksi EXIF</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* CIRCULAR CAROUSEL 3D VIEWPORT */}
                    <div className="carousel-wrapper relative rounded-3xl border border-slate-200 dark:border-white/10 bg-slate-100/40 dark:bg-white/[0.02] backdrop-blur-sm p-2 sm:p-4 shadow-xl overflow-hidden">
                        <div style={{ width: '100%', height: '560px', position: 'relative' }}>
                            <CircularCarousel
                                items={carouselItems}
                                preset={carouselPreset}
                                intro="rise"
                                cardWidth={240}
                                aspectRatio={1}
                                speed={14}
                                autoplay={isDrifting ? 'drift' : 'off'}
                                fadeColor={isDark ? '#07090e' : '#f8fafc'}
                                cornerRadius={16}
                                captions
                                onChange={(idx) => setActiveCarouselIndex(idx)}
                                onItemClick={(item, idx) => {
                                    if (activeCarouselIndex === idx) {
                                        setActiveLightboxItem(item.raw || item);
                                    } else {
                                        setActiveCarouselIndex(idx);
                                    }
                                }}
                            />
                        </div>

                        {/* Interactive Drag Hint */}
                        <div className="absolute top-4 right-4 z-10 pointer-events-none hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/60 dark:bg-black/60 text-slate-300 border border-white/10 backdrop-blur-md text-[11px] font-mono">
                            <span>🖱️ Tarik kursor / scroll horizontal untuk memutar • Klik foto untuk fokus</span>
                        </div>
                    </div>
                </section>

            </div>

            {activeLightboxItem && (
                <LightboxModal item={activeLightboxItem} onClose={() => setActiveLightboxItem(null)} />
            )}
        </PublicLayout>
    );
}
