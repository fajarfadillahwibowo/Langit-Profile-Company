import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, Code, GraduationCap, Sparkles } from 'lucide-react';

export default function Hero3DCinemaStage() {
    // 3D Mouse Parallax Tilt state
    const [rotateX, setRotateX] = useState(0);
    const [rotateY, setRotateY] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    // Active view mode: 'dual' (Kamera & Laptop terpisah) | 'camera' (Kamera 3D fokus) | 'laptop' (Laptop 3D fokus)
    const [viewMode, setViewMode] = useState('dual');

    const containerRef = useRef(null);

    const handleMouseMove = (e) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        // Smooth 3D tilt calculation (-9 to +9 degrees)
        const rotX = -((y - centerY) / centerY) * 9;
        const rotY = ((x - centerX) / centerX) * 9;

        setRotateX(rotX);
        setRotateY(rotY);
    };

    const handleMouseLeave = () => {
        setRotateX(0);
        setRotateY(0);
        setIsHovered(false);
    };

    return (
        <div 
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={handleMouseLeave}
            className="relative w-full h-[520px] lg:h-[580px] select-none flex items-center justify-center cursor-grab active:cursor-grabbing overflow-visible"
            style={{
                perspective: '1400px',
            }}
        >
            {/* Ambient Volumetric Glow Spotlights */}
            <div 
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full pointer-events-none opacity-35 blur-[100px] transition-all duration-700"
                style={{
                    background: 'radial-gradient(circle, rgba(56, 189, 248, 0.3) 0%, rgba(99, 102, 241, 0.2) 50%, transparent 75%)',
                }}
            />

            {/* 3D TILT STAGE (Preserve 3D, No Box/Background) */}
            <motion.div
                animate={{
                    rotateX,
                    rotateY,
                    scale: isHovered ? 1.02 : 1,
                }}
                transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                style={{ transformStyle: 'preserve-3d' }}
                className="relative w-full h-full"
            >
                {/* ── TOP CONTROL PILL: Switcher Icon-only (Simpel & Minimalis, Button + Logo Saja Tanpa Kata-kata) ── */}
                <div 
                    className="absolute -top-6 sm:-top-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1.5 p-1.5 rounded-full border border-white/20 backdrop-blur-xl shadow-2xl"
                    style={{ 
                        transform: 'translateZ(130px) translateX(-50%)',
                        background: 'rgba(0, 20, 42, 0.92)',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.55), 0 0 20px rgba(56,189,248,0.2)',
                    }}
                >
                    {[
                        { id: 'dual', label: 'Kamera & Laptop 3D', icon: Sparkles, color: 'text-cyan-300' },
                        { id: 'camera', label: 'Kamera 3D', icon: Camera, color: 'text-amber-300' },
                        { id: 'laptop', label: 'Website 3D', icon: Code, color: 'text-sky-400' },
                    ].map((item) => {
                        const Icon = item.icon;
                        const isActive = viewMode === item.id;
                        return (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => setViewMode(item.id)}
                                aria-label={item.label}
                                title={item.label}
                                className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center cursor-pointer transition-transform duration-200 active:scale-95 group"
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="heroModeActiveBg"
                                        className="absolute inset-0 rounded-full bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 shadow-[0_0_16px_rgba(56,189,248,0.55)]"
                                        transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                                    />
                                )}
                                <Icon 
                                    className={`relative z-10 w-4 h-4 sm:w-4.5 sm:h-4.5 transition-all duration-200 ${
                                        isActive 
                                            ? 'text-white scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.7)]' 
                                            : `${item.color} opacity-75 group-hover:opacity-100 group-hover:scale-110`
                                    }`} 
                                />
                            </button>
                        );
                    })}
                </div>

                {/* ── MODE 1: DUAL 3D (Kamera di Samping Kiri & Laptop di Kanan yang Dikecilkan, Tidak Bertabrakan) ── */}
                {viewMode === 'dual' && (
                    <div className="relative w-full h-full" style={{ transformStyle: 'preserve-3d' }}>
                        
                        {/* 1. 3D LAPTOP (Dikecilkan ukurannya & ditaruh di sisi kanan) */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.85, y: -15 }}
                            animate={{ 
                                opacity: 1, 
                                scale: 1,
                                y: [-8, 8, -8],
                                rotateZ: [-0.6, 0.6, -0.6],
                            }}
                            transition={{
                                opacity: { duration: 0.4 },
                                scale: { duration: 0.4 },
                                y: { duration: 5.8, repeat: Infinity, ease: 'easeInOut' },
                                rotateZ: { duration: 7, repeat: Infinity, ease: 'easeInOut' },
                            }}
                            style={{ 
                                transform: 'translateZ(40px)',
                                transformStyle: 'preserve-3d',
                            }}
                            className="absolute top-[20%] sm:top-[16%] right-0 sm:right-1 lg:right-2 z-10 w-[230px] sm:w-[270px] lg:w-[295px] pointer-events-auto"
                        >
                            <img
                                src="/images/laptop-3d-transparent.png"
                                alt="3D Laptop Website Showcase"
                                className="w-full h-auto object-contain drop-shadow-[0_25px_45px_rgba(0,0,0,0.65)] hover:scale-105 transition-transform duration-500"
                                draggable="false"
                            />

                            {/* Floating Cyber Highlight on Laptop Screen */}
                            <div 
                                className="absolute top-[28%] left-[45%] w-20 h-20 rounded-full pointer-events-none opacity-30 blur-2xl animate-pulse"
                                style={{ background: '#38BDF8' }}
                            />
                        </motion.div>

                        {/* 2. 3D CAMERA (Digeser ke samping kiri, posisi tengah-kiri tidak ke bawah) */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.85, x: -30 }}
                            animate={{ 
                                opacity: 1, 
                                scale: 1,
                                y: [8, -8, 8],
                                rotateZ: [-1, 1, -1],
                            }}
                            transition={{
                                opacity: { duration: 0.4, delay: 0.1 },
                                scale: { duration: 0.4, delay: 0.1 },
                                y: { duration: 5.2, repeat: Infinity, ease: 'easeInOut', delay: 0.3 },
                                rotateZ: { duration: 6.5, repeat: Infinity, ease: 'easeInOut' },
                            }}
                            style={{ 
                                transform: 'translateZ(75px)',
                                transformStyle: 'preserve-3d',
                            }}
                            className="absolute top-[28%] sm:top-[24%] left-[-15px] sm:left-[-30px] lg:left-[-45px] z-20 w-[190px] sm:w-[225px] lg:w-[245px] pointer-events-auto"
                        >
                            <img
                                src="/images/camera-3d-transparent.png"
                                alt="3D DSLR Camera Showcase"
                                className="w-full h-auto object-contain drop-shadow-[0_30px_50px_rgba(0,0,0,0.75)] hover:scale-105 hover:-rotate-2 transition-transform duration-500"
                                draggable="false"
                            />

                            {/* Red ring specular glow pulse */}
                            <div 
                                className="absolute top-[38%] left-[28%] w-12 h-12 rounded-full pointer-events-none opacity-40 blur-xl animate-pulse"
                                style={{ background: '#EF4444' }}
                            />
                        </motion.div>

                    </div>
                )}

                {/* ── MODE 2: CAMERA 3D FOCUS (DSLR Camera Centered) ── */}
                {viewMode === 'camera' && (
                    <div className="relative w-full h-full flex items-center justify-center" style={{ transformStyle: 'preserve-3d' }}>
                        <motion.div
                            key="camera-solo"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ 
                                opacity: 1, 
                                scale: 1.15,
                                y: [-10, 10, -10],
                                rotateZ: [-1.5, 1.5, -1.5],
                            }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{
                                opacity: { duration: 0.4 },
                                scale: { duration: 0.4 },
                                y: { duration: 5, repeat: Infinity, ease: 'easeInOut' },
                                rotateZ: { duration: 6, repeat: Infinity, ease: 'easeInOut' },
                            }}
                            style={{ transform: 'translateZ(65px)', transformStyle: 'preserve-3d' }}
                            className="relative z-20 w-[280px] sm:w-[340px] lg:w-[390px] pointer-events-auto"
                        >
                            <img
                                src="/images/camera-3d-transparent.png"
                                alt="3D Camera Showcase"
                                className="w-full h-auto object-contain drop-shadow-[0_35px_65px_rgba(0,0,0,0.85)] hover:scale-105 transition-transform duration-500"
                                draggable="false"
                            />

                            {/* Floating Lens Ring Accent */}
                            <div 
                                className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-44 h-44 rounded-full border border-sky-400/40 pointer-events-none animate-ping opacity-25"
                            />
                        </motion.div>
                    </div>
                )}

                {/* ── MODE 3: LAPTOP 3D FOCUS (Laptop & Website Screen Centered) ── */}
                {viewMode === 'laptop' && (
                    <div className="relative w-full h-full flex items-center justify-center" style={{ transformStyle: 'preserve-3d' }}>
                        <motion.div
                            key="laptop-solo"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ 
                                opacity: 1, 
                                scale: 1.15,
                                y: [-8, 8, -8],
                                rotateZ: [-0.8, 0.8, -0.8],
                            }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{
                                opacity: { duration: 0.4 },
                                scale: { duration: 0.4 },
                                y: { duration: 5.5, repeat: Infinity, ease: 'easeInOut' },
                                rotateZ: { duration: 6.5, repeat: Infinity, ease: 'easeInOut' },
                            }}
                            style={{ transform: 'translateZ(65px)', transformStyle: 'preserve-3d' }}
                            className="relative z-20 w-[320px] sm:w-[390px] lg:w-[440px] pointer-events-auto"
                        >
                            <img
                                src="/images/laptop-3d-transparent.png"
                                alt="3D Laptop Showcase"
                                className="w-full h-auto object-contain drop-shadow-[0_35px_65px_rgba(0,0,0,0.85)] hover:scale-105 transition-transform duration-500"
                                draggable="false"
                            />
                        </motion.div>
                    </div>
                )}

                {/* ── 4 FLOATING STUDIO BADGES (Clean Outer Frame Positioning) ── */}

                {/* Badge 1: Top-Left Photography & Videography */}
                <motion.div
                    animate={{
                        y: [-4, 6, -4],
                    }}
                    transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
                    onClick={() => window.location.href = '/layanan/photography-videography'}
                    className="absolute top-10 left-0 sm:left-1 z-30 rounded-2xl p-2.5 sm:p-3 shadow-2xl cursor-pointer transition-all duration-300 hover:scale-105 group"
                    style={{
                        transform: 'translateZ(95px)',
                        background: 'rgba(0, 25, 52, 0.94)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(245, 158, 11, 0.35)',
                        boxShadow: '0 15px 35px rgba(0,0,0,0.5), 0 0 20px rgba(245,158,11,0.15)',
                    }}
                >
                    <div className="flex items-center gap-2 sm:gap-2.5">
                        <div
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center shrink-0 group-hover:rotate-6 transition-transform"
                            style={{ background: 'rgba(245,158,11,0.2)' }}
                        >
                            <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
                        </div>
                        <div>
                            <div className="text-[9px] font-mono text-slate-400">Photography & Videography</div>
                            <div className="text-[11px] sm:text-xs font-bold text-white">Wedding, Wisuda & Event</div>
                        </div>
                    </div>
                </motion.div>

                {/* Badge 2: Top-Right Langit Education */}
                <motion.div
                    animate={{
                        y: [6, -4, 6],
                    }}
                    transition={{ duration: 5.1, repeat: Infinity, ease: 'easeInOut' }}
                    onClick={() => window.location.href = '/layanan/langit-education'}
                    className="absolute top-10 right-0 sm:right-1 z-30 rounded-2xl p-2.5 sm:p-3 shadow-2xl cursor-pointer transition-all duration-300 hover:scale-105 group"
                    style={{
                        transform: 'translateZ(90px)',
                        background: 'rgba(0, 25, 52, 0.94)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(16, 185, 129, 0.4)',
                        boxShadow: '0 15px 35px rgba(0,0,0,0.5), 0 0 20px rgba(16,185,129,0.18)',
                    }}
                >
                    <div className="flex items-center gap-2 sm:gap-2.5">
                        <div
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center shrink-0 group-hover:rotate-6 transition-transform"
                            style={{ background: 'rgba(16,185,129,0.2)' }}
                        >
                            <GraduationCap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
                        </div>
                        <div>
                            <div className="text-[9px] font-mono text-emerald-300">Langit Education</div>
                            <div className="text-[11px] sm:text-xs font-bold text-white">Kursus Coding & AI</div>
                        </div>
                    </div>
                </motion.div>

                {/* Badge 3: Bottom-Left Web Development */}
                <motion.div
                    animate={{
                        y: [-5, 5, -5],
                    }}
                    transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut' }}
                    onClick={() => window.location.href = '/layanan/web-development'}
                    className="absolute bottom-1 left-0 sm:left-1 z-30 rounded-2xl p-2.5 sm:p-3 shadow-2xl cursor-pointer transition-all duration-300 hover:scale-105 group"
                    style={{
                        transform: 'translateZ(95px)',
                        background: 'rgba(0, 25, 52, 0.94)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(14, 165, 233, 0.4)',
                        boxShadow: '0 15px 35px rgba(0,0,0,0.5), 0 0 20px rgba(14,165,233,0.18)',
                    }}
                >
                    <div className="flex items-center gap-2 sm:gap-2.5">
                        <div
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center shrink-0 group-hover:-rotate-6 transition-transform"
                            style={{ background: 'rgba(14,165,233,0.2)' }}
                        >
                            <Code className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-400" />
                        </div>
                        <div>
                            <div className="text-[9px] font-mono text-slate-400">Web Development</div>
                            <div className="text-[11px] sm:text-xs font-bold text-white">Company Profile & Web Sistem</div>
                        </div>
                    </div>
                </motion.div>

                {/* Badge 4: Bottom-Right Program Internship */}
                <motion.div
                    animate={{
                        y: [5, -5, 5],
                    }}
                    transition={{ duration: 5.4, repeat: Infinity, ease: 'easeInOut' }}
                    onClick={() => window.location.href = '/layanan/internship'}
                    className="absolute bottom-1 right-0 sm:right-1 z-30 rounded-2xl p-2.5 sm:p-3 shadow-2xl cursor-pointer transition-all duration-300 hover:scale-105 group"
                    style={{
                        transform: 'translateZ(90px)',
                        background: 'rgba(0, 25, 52, 0.94)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(168, 85, 247, 0.35)',
                        boxShadow: '0 15px 35px rgba(0,0,0,0.5), 0 0 20px rgba(168,85,247,0.15)',
                    }}
                >
                    <div className="flex items-center gap-2 sm:gap-2.5">
                        <div
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center shrink-0 group-hover:rotate-6 transition-transform"
                            style={{ background: 'rgba(168,85,247,0.2)' }}
                        >
                            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400" />
                        </div>
                        <div>
                            <div className="text-[9px] font-mono text-purple-300">Program Internship</div>
                            <div className="text-[11px] sm:text-xs font-bold text-white">Pendaftaran Terbuka</div>
                        </div>
                    </div>
                </motion.div>

            </motion.div>
        </div>
    );
}
