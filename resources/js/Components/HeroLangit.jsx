import React, { useEffect, useRef } from 'react';
import { Link } from '@inertiajs/react';
import { gsap } from 'gsap';
import { ArrowRight, Play } from 'lucide-react';
import Hero3DCinemaStage from '@/Components/Hero3DCinemaStage';

export default function HeroLangit() {
    const heroRef = useRef(null);

    useEffect(() => {
        // Lightweight, fast entrance animation without continuous ScrollTrigger scrubbers
        const ctx = gsap.context(() => {
            gsap.from('.hlg-badge', { opacity: 0, y: -12, duration: 0.5, ease: 'power2.out' });
            gsap.from('.hlg-line', {
                opacity: 0,
                y: 35,
                stagger: 0.08,
                duration: 0.6,
                ease: 'power2.out',
            });
            gsap.from('.hlg-desc', { opacity: 0, y: 15, duration: 0.5, ease: 'power2.out', delay: 0.2 });
            gsap.from('.hlg-cta', {
                opacity: 0,
                y: 12,
                stagger: 0.08,
                duration: 0.5,
                ease: 'power2.out',
                delay: 0.25,
            });
            gsap.from('.hlg-right', {
                opacity: 0,
                scale: 0.96,
                duration: 0.65,
                ease: 'power2.out',
                delay: 0.15,
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

            {/* Aurora blobs - Lightweight radial gradients with zero GPU blur overhead */}
            <div
                className="hlg-a1 absolute -top-56 left-[18%] w-[680px] h-[680px] rounded-full pointer-events-none z-0"
                style={{ background: 'radial-gradient(circle, rgba(0,87,146,0.35) 0%, rgba(0,120,200,0.12) 35%, transparent 70%)' }}
            />
            <div
                className="hlg-a2 absolute top-[30%] -right-44 w-[600px] h-[600px] rounded-full pointer-events-none z-0"
                style={{ background: 'radial-gradient(circle, rgba(0,60,110,0.3) 0%, rgba(0,87,146,0.1) 40%, transparent 70%)' }}
            />
            <div
                className="absolute -bottom-44 left-0 w-[480px] h-[480px] rounded-full pointer-events-none z-0"
                style={{ background: 'radial-gradient(circle, rgba(0,100,180,0.2) 0%, rgba(0,50,100,0.06) 45%, transparent 70%)' }}
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
                            LANGIT DIGITAL SOLUTION &nbsp;·&nbsp; EST. 2026
                        </div>

                        {/* Giant editorial headline */}
                        <div className="hlg-title-group space-y-1 sm:space-y-2">
                            <h1 className="tracking-tight select-none" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                                <span
                                    className="hlg-line block font-extrabold text-white tracking-[-0.035em] leading-[1.02]"
                                    style={{ fontSize: 'clamp(46px, 7.5vw, 90px)' }}
                                >
                                    Satu
                                </span>
                                <span
                                    className="hlg-line block font-extrabold tracking-[-0.035em] leading-[1.02]"
                                    style={{
                                        fontSize: 'clamp(46px, 7.5vw, 90px)',
                                        background: 'linear-gradient(135deg, #FFFFFF 15%, #BAE6FD 45%, #38BDF8 75%, #00A8CC 100%)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        backgroundClip: 'text',
                                        filter: 'drop-shadow(0 4px 28px rgba(56, 189, 248, 0.28))',
                                    }}
                                >
                                    Ekosistem,
                                </span>
                                <span
                                    className="hlg-line block font-semibold text-slate-100/90 tracking-[-0.025em] leading-[1.08] mt-1 sm:mt-2"
                                    style={{ fontSize: 'clamp(30px, 4.8vw, 58px)' }}
                                >
                                    Tujuh Layanan
                                </span>
                                <span
                                    className="hlg-line block font-extrabold tracking-[-0.025em] leading-[1.08]"
                                    style={{
                                        fontSize: 'clamp(30px, 4.8vw, 58px)',
                                        background: 'linear-gradient(135deg, #38BDF8 0%, #22D3EE 45%, #E0F2FE 100%)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        backgroundClip: 'text',
                                        filter: 'drop-shadow(0 2px 20px rgba(6, 182, 212, 0.22))',
                                    }}
                                >
                                    Presisi Digital.
                                </span>
                            </h1>
                        </div>

                        {/* Description */}
                        <p className="hlg-desc text-base sm:text-lg max-w-xl leading-relaxed text-slate-300">
                            Studio kreatif dan solusi digital yang berfokus pada layanan{' '}
                            <strong className="text-white font-semibold">fotografi & videografi profesional</strong>,{' '}
                            <strong className="text-white font-semibold">pembuatan website modern</strong>, serta{' '}
                            <strong className="text-white font-semibold">program internship</strong> kreatif dan teknologi.
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

                    {/* RIGHT: VISUAL PANEL (3D Cinema Camera & Web System Stage) */}
                    <div className="hlg-right lg:col-span-5 relative overflow-visible">
                        <Hero3DCinemaStage />
                    </div>
                </div>

            </div>
        </section>
    );
}
