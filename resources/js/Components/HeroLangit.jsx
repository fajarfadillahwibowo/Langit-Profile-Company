import React, { useEffect, useRef } from 'react';
import { Link } from '@inertiajs/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
    Camera, ArrowRight, Play, Layers,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function HeroLangit() {
    const heroRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // ── Main entrance timeline ──────────────────────────────────────
            const tl = gsap.timeline({
                defaults: { ease: 'power3.out' },
                delay: 0.08,
            });

            tl.from('.hlg-badge', { opacity: 0, y: -18, duration: 0.7 })
              .from('.hlg-line', {
                  opacity: 0, y: 90, stagger: 0.11,
                  duration: 0.85, ease: 'power4.out',
              }, '-=0.45')
              .from('.hlg-desc', { opacity: 0, y: 22, duration: 0.65 }, '-=0.5')
              .from('.hlg-cta', {
                  opacity: 0, y: 16, stagger: 0.1, duration: 0.55,
              }, '-=0.4')
              .from('.hlg-right', {
                  opacity: 0, x: 55, duration: 0.95, ease: 'power3.out',
              }, 0.35)
              .from('.hlg-float', {
                  opacity: 0, scale: 0.75, stagger: 0.09,
                  duration: 0.55, ease: 'back.out(1.7)',
              }, 0.85);


            // ── ScrollTrigger parallax ──────────────────────────────────────
            gsap.to('.hlg-a1', {
                y: -130,
                scrollTrigger: { trigger: heroRef.current, start: 'top top', end: 'bottom top', scrub: 1.5 },
            });
            gsap.to('.hlg-a2', {
                y: -75,
                scrollTrigger: { trigger: heroRef.current, start: 'top top', end: 'bottom top', scrub: 2.2 },
            });
            gsap.to('.hlg-title-group', {
                y: 95,
                scrollTrigger: { trigger: heroRef.current, start: 'top top', end: 'bottom top', scrub: 0.9 },
            });
            gsap.to('.hlg-right', {
                y: 50,
                scrollTrigger: { trigger: heroRef.current, start: 'top top', end: 'bottom top', scrub: 1.1 },
            });
        }, heroRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={heroRef}
            className="relative min-h-[100svh] flex flex-col justify-center overflow-hidden"
            style={{ backgroundColor: '#002B4A' }}
        >
            {/* ── BACKGROUND ───────────────────────────────────────────────── */}

            {/* Dot grid */}
            <div
                className="absolute inset-0 pointer-events-none z-0"
                style={{
                    backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)',
                    backgroundSize: '28px 28px',
                    opacity: 0.35,
                }}
            />

            {/* Aurora blobs */}
            <div
                className="hlg-a1 absolute -top-56 left-[18%] w-[720px] h-[720px] rounded-full blur-[130px] pointer-events-none z-0 animate-aurora-1"
                style={{ background: 'radial-gradient(circle, rgba(0,87,146,0.55) 0%, rgba(0,120,200,0.2) 55%, transparent 100%)' }}
            />
            <div
                className="hlg-a2 absolute top-[30%] -right-44 w-[640px] h-[640px] rounded-full blur-[150px] pointer-events-none z-0 animate-aurora-2"
                style={{ background: 'radial-gradient(circle, rgba(0,60,110,0.5) 0%, rgba(0,87,146,0.15) 55%, transparent 100%)' }}
            />
            <div
                className="absolute -bottom-44 left-0 w-[520px] h-[520px] rounded-full blur-[120px] pointer-events-none z-0 animate-aurora-3"
                style={{ background: 'radial-gradient(circle, rgba(0,100,180,0.3) 0%, rgba(0,50,100,0.1) 60%, transparent 100%)' }}
            />

            {/* Large watermark text */}
            <div
                className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden"
                aria-hidden="true"
            >
                <span
                    className="font-heading font-black tracking-tighter leading-none whitespace-nowrap"
                    style={{ fontSize: '22vw', color: 'rgba(255,255,255,0.016)' }}
                >
                    LANGIT
                </span>
            </div>

            {/* Bottom fade */}
            <div
                className="absolute bottom-0 left-0 right-0 h-28 pointer-events-none z-0"
                style={{ background: 'linear-gradient(to bottom, transparent, rgba(0,28,52,0.98))' }}
            />

            {/* ── MAIN CONTENT ─────────────────────────────────────────────── */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-16 md:py-24">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

                    {/* LEFT: COPY */}
                    <div className="lg:col-span-7 space-y-8">

                        {/* Badge */}
                        <div
                            className="hlg-badge inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-[11px] font-mono tracking-[0.14em]"
                            style={{
                                border: '1px solid rgba(255,255,255,0.1)',
                                background: 'rgba(255,255,255,0.04)',
                                backdropFilter: 'blur(12px)',
                                color: '#67E8F9',
                            }}
                        >
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
                            </span>
                            LANGIT DIGITAL ECOSYSTEM &nbsp;·&nbsp; EST. 2022
                        </div>

                        {/* Giant editorial headline */}
                        <div className="hlg-title-group">
                            <h1 className="font-heading font-black leading-[0.92] tracking-tighter">
                                <span
                                    className="hlg-line block text-white"
                                    style={{ fontSize: 'clamp(52px,9vw,108px)' }}
                                >
                                    Satu
                                </span>
                                <span
                                    className="hlg-line block"
                                    style={{
                                        fontSize: 'clamp(52px,9vw,108px)',
                                        background: 'linear-gradient(135deg, #38BDF8 0%, #818CF8 48%, #C084FC 100%)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        backgroundClip: 'text',
                                    }}
                                >
                                    Ekosistem,
                                </span>
                                <span
                                    className="hlg-line block"
                                    style={{ fontSize: 'clamp(36px,6.2vw,78px)', color: 'rgba(255,255,255,0.52)' }}
                                >
                                    Tujuh Layanan
                                </span>
                                <span
                                    className="hlg-line block font-editorial italic font-normal tracking-wide text-cyan-200/80"
                                    style={{ fontSize: 'clamp(40px,7vw,88px)' }}
                                >
                                    Presisi Digital.
                                </span>
                            </h1>
                        </div>

                        {/* Description */}
                        <p
                            className="hlg-desc text-base sm:text-lg max-w-xl leading-relaxed"
                            style={{ color: '#94A3B8' }}
                        >
                            Platform terpadu untuk{' '}
                            <strong className="text-white font-semibold">produksi visual sinematik</strong>,
                            arsitektur software premium, lab hardware, dan inkubasi talenta —
                            semuanya dalam satu ekosistem adaptif.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-wrap items-center gap-4">
                            <Link
                                href="/konsultasi"
                                className="hlg-cta group px-7 py-4 rounded-2xl text-white font-bold text-sm flex items-center gap-2.5 transition-all duration-300 hover:scale-[1.04] active:scale-[0.97]"
                                style={{
                                    background: 'linear-gradient(135deg, #06B6D4 0%, #4F46E5 100%)',
                                    boxShadow: '0 20px 50px rgba(6,182,212,0.28), 0 0 0 1px rgba(255,255,255,0.08) inset',
                                }}
                            >
                                Mulai Konsultasi
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link
                                href="/portofolio"
                                className="hlg-cta group px-7 py-4 rounded-2xl font-semibold text-sm flex items-center gap-2.5 transition-all duration-300 hover:scale-[1.02]"
                                style={{
                                    border: '1px solid rgba(255,255,255,0.13)',
                                    background: 'rgba(255,255,255,0.04)',
                                    backdropFilter: 'blur(12px)',
                                    color: 'rgba(255,255,255,0.88)',
                                }}
                            >
                                <Play className="w-4 h-4" style={{ opacity: 0.55 }} />
                                Lihat Portofolio
                            </Link>
                        </div>


                    </div>

                    {/* RIGHT: VISUAL PANEL */}
                    <div className="hlg-right lg:col-span-5 relative h-[460px] lg:h-[560px]">

                        {/* Main image */}
                        <div
                            className="absolute inset-8 rounded-3xl overflow-hidden"
                            style={{
                                border: '1px solid rgba(255,255,255,0.08)',
                                boxShadow: '0 35px 90px rgba(0,0,0,0.65)',
                            }}
                        >
                            <img
                                src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80"
                                alt="Langit Sinema & Visual Production"
                                className="w-full h-full object-cover"
                                loading="eager"
                            />
                            <div
                                className="absolute inset-0"
                                style={{ background: 'linear-gradient(to top, rgba(0,25,50,0.9) 0%, transparent 55%)' }}
                            />

                            {/* Caption */}
                            <div className="absolute bottom-5 left-5 right-14">
                                <span
                                    className="text-xs font-editorial italic tracking-wider block"
                                    style={{ color: '#FBBF24' }}
                                >
                                    Sinema & Visual Narrative
                                </span>
                                <h4 className="text-sm font-bold text-white mt-0.5">
                                    Langit Visual Production
                                </h4>
                            </div>

                            {/* Play button */}
                            <Link
                                href="/layanan/photography-videography"
                                className="absolute top-5 right-5 w-11 h-11 rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-110 active:scale-95"
                                style={{
                                    background: 'rgba(255,255,255,0.14)',
                                    backdropFilter: 'blur(16px)',
                                    border: '1px solid rgba(255,255,255,0.22)',
                                    boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                                }}
                            >
                                <Play className="w-4 h-4 fill-white translate-x-0.5" />
                            </Link>
                        </div>

                        {/* Floating badge — top-left: Studio projects */}
                        <div
                            className="hlg-float absolute top-2 left-2 rounded-2xl p-3.5 shadow-2xl"
                            style={{
                                background: 'rgba(0,30,58,0.92)',
                                backdropFilter: 'blur(20px)',
                                border: '1px solid rgba(255,255,255,0.1)',
                            }}
                        >
                            <div className="flex items-center gap-2.5">
                                <div
                                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                                    style={{ background: 'rgba(217,119,6,0.18)' }}
                                >
                                    <Camera className="w-4 h-4" style={{ color: '#FBBF24' }} />
                                </div>
                                <div>
                                    <div className="text-[10px] font-mono" style={{ color: '#64748B' }}>Sinema Studio</div>
                                    <div className="text-xs font-bold text-white">240+ Projects</div>
                                </div>
                            </div>
                        </div>

                        {/* Floating badge — bottom-left: Rating */}
                        <div
                            className="hlg-float absolute bottom-2 left-2 rounded-2xl p-3.5 shadow-2xl"
                            style={{
                                background: 'rgba(0,30,58,0.92)',
                                backdropFilter: 'blur(20px)',
                                border: '1px solid rgba(255,255,255,0.1)',
                            }}
                        >
                            <div className="flex items-center gap-2.5">
                                <div
                                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                                    style={{ background: 'rgba(16,185,129,0.18)' }}
                                >
                                    <span className="font-mono font-black text-xs" style={{ color: '#4ADE80' }}>99%</span>
                                </div>
                                <div>
                                    <div className="text-[10px] font-mono" style={{ color: '#64748B' }}>Client Satisfaction</div>
                                    <div className="text-xs font-bold text-white">★ 5.0 Rating</div>
                                </div>
                            </div>
                        </div>

                        {/* Floating badge — top-right: Live status */}
                        <div
                            className="hlg-float absolute top-12 -right-2 rounded-2xl px-3.5 py-2.5 shadow-2xl"
                            style={{
                                background: 'rgba(0,30,58,0.92)',
                                backdropFilter: 'blur(20px)',
                                border: '1px solid rgba(255,255,255,0.1)',
                            }}
                        >
                            <div className="flex items-center gap-1.5">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                                </span>
                                <span className="text-[11px] font-mono font-semibold" style={{ color: '#4ADE80' }}>
                                    Studio Open
                                </span>
                            </div>
                        </div>

                        {/* Floating badge — bottom-right: Stack */}
                        <div
                            className="hlg-float absolute bottom-12 -right-2 rounded-2xl px-3.5 py-2.5 shadow-2xl"
                            style={{
                                background: 'rgba(0,30,58,0.92)',
                                backdropFilter: 'blur(20px)',
                                border: '1px solid rgba(255,255,255,0.1)',
                            }}
                        >
                            <div className="text-[10px] font-mono leading-relaxed">
                                <div className="text-white font-bold text-[11px] mb-0.5 flex items-center gap-1">
                                    <Layers className="w-3 h-3 text-cyan-400" />
                                    Enterprise Stack
                                </div>
                                <div style={{ color: '#64748B' }}>Laravel 13 + React SPA</div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
}


