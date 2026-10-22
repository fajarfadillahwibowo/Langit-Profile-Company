import React, { useState, useEffect, useRef } from 'react';
import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import LightboxModal from '@/Components/LightboxModal';
import InteractiveBentoCard from '@/Components/InteractiveBentoCard';
import ScrollingServiceCards from '@/Components/ScrollingServiceCards';
import HeroLangit from '@/Components/HeroLangit';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
    Camera, Code2, GraduationCap, Cpu, Sparkles, PackageCheck, Handshake,
    ChevronRight, Activity, ArrowRight,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function HomeIndex({
    services = [],
    featuredGalleries = [],
    rentalHighlights = [],
    internshipOpenings = [],
    stats = {},
}) {
    const [activeLightboxItem, setActiveLightboxItem] = useState(null);
    const pageRef = useRef(null);

    const serviceAccentMap = {
        'photography-videography': { color: '#D97706', icon: Camera, badge: 'Cinema & Studio' },
        'web-development': { color: '#0284C7', icon: Code2, badge: 'Cyber Architecture' },
        'langit-education': { color: '#059669', icon: GraduationCap, badge: 'Academy' },
        'computer-service': { color: '#EA580C', icon: Cpu, badge: 'Hardware Lab' },
        'internship': { color: '#7C3AED', icon: Sparkles, badge: 'Career Hub' },
        'sewa-alat': { color: '#0D9488', icon: PackageCheck, badge: 'Rental Gear' },
        'kolaborasi': { color: '#DB2777', icon: Handshake, badge: 'B2B & Campus' },
    };

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.utils.toArray('.reveal-header').forEach((el) => {
                gsap.from(el, {
                    opacity: 0, y: 32, duration: 0.7, ease: 'power3.out',
                    scrollTrigger: { trigger: el, start: 'top 88%' },
                });
            });

            gsap.from('.gallery-item', {
                opacity: 0, y: 45, scale: 0.96, stagger: 0.07, duration: 0.65, ease: 'power3.out',
                scrollTrigger: { trigger: '.gallery-grid', start: 'top 82%' },
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


                {/* GALLERY */}
                <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-20 lg:py-24">
                    <div className="reveal-header flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
                        <div>
                            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-mono text-[11px] uppercase tracking-widest mb-2 font-bold">
                                <Camera className="w-3.5 h-3.5" />
                                <span>Langit Photo & Video Gallery</span>
                            </div>
                            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl text-slate-900 dark:text-white tracking-tight">
                                Mahakarya Visual
                                <span className="block text-gradient-gold">
                                    & <span className="font-editorial italic font-normal tracking-normal text-amber-500 dark:text-amber-400">Sinematografi</span>
                                </span>
                            </h2>
                        </div>
                        <Link href="/layanan/photography-videography" className="group text-xs font-mono text-amber-600 dark:text-amber-400 flex items-center gap-1.5 font-bold transition-all">
                            Lihat Semua Foto & Before/After Color Grade
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    <div className="gallery-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {featuredGalleries.map((item, i) => (
                            <div
                                key={item.id}
                                onClick={() => setActiveLightboxItem(item)}
                                className={`gallery-item group relative overflow-hidden rounded-3xl border border-slate-200 dark:border-white/10 bg-slate-950 cursor-pointer shadow-lg ${i === 0 ? 'sm:col-span-2 lg:col-span-1' : ''}`}
                                style={{ aspectRatio: i === 0 ? '16/9' : '4/3' }}
                            >
                                <img src={item.file_webp_path} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent opacity-85 group-hover:opacity-100 transition-opacity" />
                                <div className="absolute inset-0 p-5 flex flex-col justify-end">
                                    <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider font-bold">{item.category} • EXIF Inspector</span>
                                    <h4 className="text-sm font-bold text-white mt-0.5">{item.title}</h4>
                                    <span className="text-[11px] text-slate-300 font-mono mt-1 flex items-center gap-1">
                                        <Camera className="w-3 h-3 text-amber-400" />
                                        {item.exif_metadata_json?.camera || 'Sony FX3'}
                                    </span>
                                </div>
                                <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ArrowRight className="w-3.5 h-3.5 text-white -rotate-45" />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

            </div>

            {activeLightboxItem && (
                <LightboxModal item={activeLightboxItem} onClose={() => setActiveLightboxItem(null)} />
            )}
        </PublicLayout>
    );
}
