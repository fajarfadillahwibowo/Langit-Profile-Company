import React, { useEffect, useRef, useState } from 'react';
import { Link } from '@inertiajs/react';
import { Film, Play, Pause, Volume2, VolumeX, Zap, Sparkles, ArrowRight } from 'lucide-react';
import { useQuality } from '@/Context/QualityContext';

/**
 * Cinema-style showreel hero shared by the Photography & Videography page and
 * the Internship page. Renders an autoplaying muted video with in-place SD/HD
 * and audio controls, a toggleable text overlay, play/pause and a CTA button.
 *
 * @param {object} props
 * @param {object|null} props.service Service record (hero_config_json fallback).
 * @param {object|null} props.showreel Gallery record holding the video + poster.
 * @param {object} props.fallback Defaults used when no media is configured yet.
 */
export default function VideoShowcaseHero({ service, showreel = null, fallback = {} }) {
    const { isHd, setQuality, getOptimizedImage } = useQuality();
    const [showreelPlaying, setShowreelPlaying] = useState(true);
    const [isMuted, setIsMuted] = useState(true);
    const [showHeroText, setShowHeroText] = useState(true);
    const videoRef = useRef(null);

    const activeVideoUrl = showreel?.video_url
        || service?.hero_config_json?.showreel_video
        || fallback.video
        || '';

    const rawPoster = showreel?.file_webp_path
        || service?.hero_config_json?.showreel_poster
        || fallback.poster
        || '';

    const activePosterUrl = rawPoster ? getOptimizedImage(rawPoster, { sdWidth: 640, hdWidth: 1600 }) : undefined;

    const activeTitle = showreel?.title
        || service?.hero_config_json?.showreel_title
        || fallback.title
        || 'Visual Sinematik Kelas Dunia.';

    const activeSubtitle = service?.hero_config_json?.showreel_subtitle
        || fallback.subtitle
        || '';

    const badgeLead = fallback.badgeLead || 'Cinema & Darkroom';
    const badgeTail = fallback.badgeTail || 'Showcase';
    const ctaHref = fallback.ctaHref || '/konsultasi';
    const ctaLabel = fallback.ctaLabel || 'Booking Jadwal Shoot';
    const metaLabel = fallback.metaLabel || 'Master: S-Cinetone 10-bit Rec.709';

    const renderStyledTitle = (title) => {
        if (!title) {
            return null;
        }
        const parts = title.split(/(sinematik|cinematic)/i);
        if (parts.length > 1) {
            return parts.map((part, i) => {
                if (part.toLowerCase() === 'sinematik' || part.toLowerCase() === 'cinematic') {
                    return (
                        <span key={i} className="font-editorial italic font-normal text-amber-300 tracking-wide">
                            {part}
                        </span>
                    );
                }

                return part;
            });
        }

        return title;
    };

    // Guaranteed video autoplay as soon as page is opened/visited
    useEffect(() => {
        const video = videoRef.current;
        if (!video) {
            return;
        }

        // Browser autoplay policy requires video to be muted initially
        video.muted = true;
        setIsMuted(true);

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
    }, [activeVideoUrl]);

    const togglePlayShowreel = () => {
        if (!videoRef.current) {
            return;
        }
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
        if (!videoRef.current) {
            return;
        }
        videoRef.current.muted = !videoRef.current.muted;
        setIsMuted(videoRef.current.muted);
    };

    const ctaClassName = 'px-3.5 sm:px-4 py-2 rounded-lg sm:rounded-xl bg-white/20 hover:bg-white/30 text-white border border-white/30 text-xs font-bold transition-all hover:scale-105 active:scale-95 backdrop-blur-md flex items-center gap-1.5 shadow-sm';

    return (
        <section className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pt-2 sm:pt-3 pb-8 sm:pb-12">
            <div
                className="relative w-full min-w-0 rounded-3xl overflow-hidden border border-amber-500/30 dark:border-amber-500/20 shadow-2xl bg-slate-950 min-h-[420px] sm:min-h-[440px] lg:aspect-[21/9] lg:min-h-[460px] flex flex-col justify-between p-4 sm:p-5 md:p-6 group cursor-pointer"
                onClick={() => setShowHeroText(prev => !prev)}
                title="Klik area video untuk menyembunyikan atau menampilkan judul dan deskripsi"
            >
                {/* Real HTML5 Video Player with Guaranteed Autoplay */}
                {activeVideoUrl && (
                    <video
                        ref={videoRef}
                        src={activeVideoUrl}
                        poster={activePosterUrl}
                        preload="metadata"
                        autoPlay
                        muted={isMuted}
                        playsInline
                        loop
                        onPlay={() => setShowreelPlaying(true)}
                        onPause={() => setShowreelPlaying(false)}
                        className="absolute inset-0 w-full h-full object-cover transition-all duration-700 opacity-80 z-0 group-hover:scale-102"
                    />
                )}

                {/* Dark Gradient Overlay to ensure typography readability while video plays seamlessly */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-black/60 z-10 pointer-events-none" />

                {/* Top Area: Controls & Shifted-Up Typography */}
                <div className="relative z-30 w-full space-y-2 sm:space-y-3">
                    {/* 1. TOP HEADER BAR: BADGE (LEFT) & IN-PLACE CONTROLS (RIGHT) */}
                    <div className="flex flex-wrap items-center justify-between gap-2 w-full pointer-events-auto" onClick={(e) => e.stopPropagation()}>
                        {/* Left: Cinema Showcase Badge */}
                        <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-black/70 sm:bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[11px] sm:text-xs font-mono uppercase tracking-wider font-bold backdrop-blur-md shadow-sm shrink-0">
                            <Film className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                            <span className="hidden sm:inline">{badgeLead}</span>
                            <span>{badgeTail}</span>
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

                    {/* 2. UPPER TYPOGRAPHY: TITLE & DESCRIPTION (SHIFTED UP & REFINED SIZE) */}
                    <div className={`text-center max-w-xl mx-auto px-2 sm:px-6 pt-1 sm:pt-2 transition-all duration-500 transform pointer-events-auto ${
                        showHeroText
                            ? 'opacity-100 translate-y-0 max-h-96'
                            : 'opacity-0 -translate-y-3 pointer-events-none max-h-0 overflow-hidden'
                    }`}>
                        <h2 className="font-heading font-extrabold text-xl sm:text-2xl md:text-3xl lg:text-4xl text-white tracking-tight leading-snug drop-shadow-lg">
                            {renderStyledTitle(activeTitle)}
                        </h2>

                        <p className="mt-1.5 sm:mt-2 text-slate-200 text-[11px] sm:text-xs md:text-sm max-w-md mx-auto leading-relaxed drop-shadow">
                            {activeSubtitle}
                        </p>
                    </div>
                </div>

                {/* Visual Breathing Room: Leaves the central video subject completely open */}
                <div className="flex-1 min-h-[30px] sm:min-h-[50px] md:min-h-[60px]" />

                {/* Lower Area: Refined CTA Buttons & Bottom Status Bar */}
                <div className="relative z-20 w-full space-y-3">
                    {/* 3. MAIN ACTIONS (COMPACT BUTTONS AT LOWER-CENTER) */}
                    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 pointer-events-auto" onClick={(e) => e.stopPropagation()}>
                        {/* Button 1: Play / Pause Showreel */}
                        <button
                            type="button"
                            onClick={togglePlayShowreel}
                            className="px-3.5 sm:px-4 py-2 rounded-lg sm:rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/25 transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                        >
                            {showreelPlaying ? (
                                <>
                                    <Pause className="w-3.5 h-3.5 fill-slate-950" />
                                    <span>Jeda Video</span>
                                </>
                            ) : (
                                <>
                                    <Play className="w-3.5 h-3.5 fill-slate-950" />
                                    <span>Putar Video</span>
                                </>
                            )}
                        </button>

                        {/* Button 2: Primary Call To Action */}
                        {ctaHref.startsWith('/') ? (
                            <Link href={ctaHref} className={ctaClassName}>
                                <span>{ctaLabel}</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        ) : (
                            <a href={ctaHref} className={ctaClassName}>
                                <span>{ctaLabel}</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </a>
                        )}
                    </div>

                    {/* 4. BOTTOM BAR: LIVE STATUS PILL & METADATA (DEDICATED SLOT - NO OVERLAP) */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-1 text-[11px] font-mono text-slate-300 pointer-events-none">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/75 border border-amber-500/40 text-amber-300 text-[11px] font-mono backdrop-blur-md shadow-md pointer-events-auto" onClick={(e) => e.stopPropagation()}>
                            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping shrink-0" />
                            <span>
                                {showreelPlaying ? '▶ Playing Showreel' : '⏸ Video Dijeda'} • {isHd ? '4K Cinema (HD)' : 'Mode Cepat (SD)'}
                            </span>
                        </div>

                        {/* Click to Toggle Hint */}
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 border border-white/10 text-[10px] text-amber-200/90 font-mono backdrop-blur-md shadow pointer-events-auto">
                            <span>💡 Klik layar video untuk {showHeroText ? 'sembunyikan' : 'tampilkan'} teks</span>
                        </div>

                        <div className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-300/80 font-mono">
                            <span>{metaLabel}</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
