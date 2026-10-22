import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { 
    Camera, Code2, GraduationCap, Cpu, Sparkles, PackageCheck, Handshake,
    ChevronUp, ChevronDown, ArrowRight, Play, Pause
} from 'lucide-react';

/* ── 3D CLAYMORPHIC & GLASSMORPHIC VISUAL ASSETS ────────────────────────── */

function VisualPhotoVideo() {
    return (
        <div className="relative w-full h-full min-h-[140px] sm:min-h-[170px] flex items-center justify-center select-none overflow-hidden rounded-2xl bg-black/10 dark:bg-black/25 backdrop-blur-sm border border-white/20">
            <div className="absolute w-24 h-24 rounded-full bg-amber-400/30 blur-2xl pointer-events-none" />
            <div className="relative z-10 flex items-center justify-center scale-90 sm:scale-100">
                {/* 3D Camera Body */}
                <div className="relative w-24 h-16 rounded-2xl bg-gradient-to-br from-slate-800 via-slate-900 to-black border border-slate-700 shadow-[0_14px_24px_-4px_rgba(0,0,0,0.5),_inset_0_2px_2px_rgba(255,255,255,0.25)] flex items-center justify-center">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-3.5 rounded-t-lg bg-gradient-to-b from-slate-700 to-slate-900 border-t border-x border-slate-600 shadow-sm" />
                    <div className="absolute top-2 right-2.5 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_6px_#f43f5e]" />
                    </div>
                    {/* Concentric 3D Lens Barrel */}
                    <div className="w-12 h-12 rounded-full bg-slate-950 p-1 border border-slate-700 shadow-inner flex items-center justify-center">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 via-amber-300 to-amber-600 p-0.5 flex items-center justify-center">
                            <div className="w-full h-full rounded-full bg-gradient-to-br from-cyan-400/40 via-indigo-950 to-black relative overflow-hidden flex items-center justify-center">
                                <div className="absolute -top-1 left-1 w-3 h-1.5 rounded-full bg-white/70 blur-[0.5px] -rotate-45" />
                                <div className="w-3 h-3 rounded-full bg-gradient-to-tr from-amber-400 to-rose-400 opacity-80" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Floating Polaroid */}
                <motion.div 
                    animate={{ y: [0, -5, 0], rotate: [-8, -4, -8] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute -right-2 -bottom-2 w-11 h-14 rounded-lg bg-white dark:bg-slate-900 p-1 border border-white/60 shadow-lg flex flex-col"
                >
                    <div className="w-full h-8 rounded bg-gradient-to-br from-amber-400 via-rose-400 to-indigo-600" />
                    <div className="flex-1 flex items-center justify-center">
                        <span className="w-5 h-0.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                    </div>
                </motion.div>

                {/* Sparkle */}
                <motion.div 
                    animate={{ y: [0, -6, 0], scale: [1, 1.15, 1] }}
                    transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
                    className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-gradient-to-tr from-amber-400 to-amber-200 border border-white/80 shadow-md flex items-center justify-center text-amber-950"
                >
                    <Sparkles className="w-3 h-3" />
                </motion.div>
            </div>
        </div>
    );
}

function VisualWebDev() {
    return (
        <div className="relative w-full h-full min-h-[140px] sm:min-h-[170px] flex items-center justify-center select-none overflow-hidden rounded-2xl bg-black/15 dark:bg-black/30 backdrop-blur-sm border border-white/20">
            <div className="absolute w-24 h-24 rounded-full bg-cyan-400/30 blur-2xl pointer-events-none" />
            <div className="relative z-10 flex items-center justify-center scale-90 sm:scale-100">
                {/* 3D Monitor Frame */}
                <div className="relative w-28 h-20 rounded-2xl bg-gradient-to-b from-indigo-500 via-indigo-700 to-slate-950 p-1 border border-indigo-300/40 shadow-xl">
                    <div className="w-full h-full rounded-xl bg-slate-950 relative overflow-hidden flex flex-col justify-between p-1.5">
                        <div className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        </div>
                        {/* 3D Wave SVG */}
                        <div className="py-0.5">
                            <svg viewBox="0 0 100 28" className="w-full h-6 overflow-visible">
                                <path
                                    d="M 5,14 Q 25,2 45,14 T 85,14 Q 95,24 100,14"
                                    fill="none"
                                    stroke="#38BDF8"
                                    strokeWidth="3.5"
                                    strokeLinecap="round"
                                />
                            </svg>
                        </div>
                    </div>
                    {/* Stand */}
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-2 rounded-t bg-indigo-900" />
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-12 h-1 rounded-full bg-indigo-950 border border-indigo-400/30" />
                </div>

                {/* Floating Code Pill */}
                <motion.div 
                    animate={{ y: [0, -5, 0], rotate: [4, 8, 4] }}
                    transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute -right-2 -bottom-2 px-2 py-0.5 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-600 text-white font-mono font-bold text-[10px] shadow-md border border-white/40"
                >
                    &lt;/&gt;
                </motion.div>
                
                {/* Floating Plus Badge */}
                <motion.div 
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
                    className="absolute -top-2 -left-2 w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-black text-xs flex items-center justify-center shadow-md border border-white/40"
                >
                    +
                </motion.div>
            </div>
        </div>
    );
}

function VisualEducation() {
    return (
        <div className="relative w-full h-full min-h-[140px] sm:min-h-[170px] flex items-center justify-center select-none overflow-hidden rounded-2xl bg-black/10 dark:bg-black/25 backdrop-blur-sm border border-white/20">
            <div className="absolute w-24 h-24 rounded-full bg-emerald-400/30 blur-2xl pointer-events-none" />
            <div className="relative z-10 flex flex-col items-center justify-center scale-90 sm:scale-100">
                {/* 3D Cap */}
                <motion.div 
                    animate={{ y: [0, -5, 0], rotateX: [10, 16, 10] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="relative z-20 flex flex-col items-center"
                >
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-900 border border-emerald-300/60 shadow-xl flex items-center justify-center rotate-45">
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-300 border border-amber-100 shadow" />
                    </div>
                    <div className="w-8 h-3 rounded-b-xl bg-gradient-to-b from-emerald-800 to-teal-950 -mt-2 shadow-sm" />
                </motion.div>

                {/* Book Base */}
                <div className="relative z-10 -mt-1 w-24 h-7 rounded-xl bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 border border-emerald-500/40 shadow-lg flex items-center justify-around px-2">
                    <span className="w-6 h-1 rounded-full bg-emerald-400/70" />
                    <span className="w-1 h-3 rounded-full bg-emerald-500/50" />
                    <span className="w-6 h-1 rounded-full bg-emerald-400/70" />
                </div>

                {/* AI Chip */}
                <motion.div 
                    animate={{ y: [0, -5, 0], rotate: [-6, -2, -6] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
                    className="absolute -right-2 top-1 px-1.5 py-0.5 rounded-lg bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-950 font-mono font-black text-[9px] shadow-md border border-white/60"
                >
                    AI / LAB
                </motion.div>
            </div>
        </div>
    );
}

function VisualComputerService() {
    return (
        <div className="relative w-full h-full min-h-[140px] sm:min-h-[170px] flex items-center justify-center select-none overflow-hidden rounded-2xl bg-black/15 dark:bg-black/30 backdrop-blur-sm border border-white/20">
            <div className="absolute w-24 h-24 rounded-full bg-orange-400/30 blur-2xl pointer-events-none" />
            <div className="relative z-10 flex items-center justify-center scale-90 sm:scale-100">
                {/* PCB Substrate */}
                <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-600 via-amber-700 to-slate-950 p-1.5 border border-orange-300/50 shadow-xl flex items-center justify-center">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-slate-200 via-slate-300 to-slate-400 dark:from-slate-700 dark:via-slate-800 dark:to-slate-900 border border-white/70 shadow-md flex flex-col items-center justify-center p-1 text-center">
                        <span className="text-[8px] font-mono font-black tracking-wider text-slate-900 dark:text-orange-400">
                            LANGIT
                        </span>
                        <span className="text-[6px] font-mono text-slate-600 dark:text-slate-300">
                            HW LAB
                        </span>
                        <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 mt-0.5 shadow-[0_0_6px_#f97316]" />
                    </div>
                </div>

                {/* NVMe Badge */}
                <motion.div 
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute -right-3 -bottom-1 px-2 py-0.5 rounded-lg bg-gradient-to-r from-orange-500 to-amber-600 border border-white/50 text-white font-mono font-bold text-[9px] shadow-md flex items-center gap-1"
                >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>NVMe 99% QC</span>
                </motion.div>

                {/* RAM Stick */}
                <motion.div 
                    animate={{ y: [0, -6, 0], rotate: [-8, -4, -8] }}
                    transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
                    className="absolute -top-2 -left-2 w-12 h-3.5 rounded bg-slate-900 border border-orange-400/40 shadow flex items-center justify-around px-1"
                >
                    <span className="w-1.5 h-1.5 rounded-xs bg-orange-400" />
                    <span className="w-1.5 h-1.5 rounded-xs bg-orange-400" />
                    <span className="w-1.5 h-1.5 rounded-xs bg-orange-400" />
                </motion.div>
            </div>
        </div>
    );
}

function VisualInternship() {
    return (
        <div className="relative w-full h-full min-h-[140px] sm:min-h-[170px] flex items-center justify-center select-none overflow-hidden rounded-2xl bg-black/15 dark:bg-black/30 backdrop-blur-sm border border-white/20">
            <div className="absolute w-24 h-24 rounded-full bg-purple-400/30 blur-2xl pointer-events-none" />
            <div className="relative z-10 flex items-center justify-center scale-90 sm:scale-100">
                {/* 3D Rocket */}
                <motion.div 
                    animate={{ y: [0, -7, 0], rotate: [-2, 2, -2] }}
                    transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
                    className="relative z-20 flex flex-col items-center"
                >
                    <div className="w-10 h-16 rounded-t-full rounded-b-xl bg-gradient-to-b from-purple-400 via-purple-600 to-indigo-900 border border-purple-300/60 shadow-xl flex flex-col items-center pt-2 relative">
                        <div className="w-4 h-4 rounded-full bg-cyan-300 border border-white shadow-inner flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-cyan-700" />
                        </div>
                        <div className="absolute -bottom-1 -left-2.5 w-3.5 h-6 rounded-l-full bg-gradient-to-l from-purple-700 to-rose-500" />
                        <div className="absolute -bottom-1 -right-2.5 w-3.5 h-6 rounded-r-full bg-gradient-to-r from-purple-700 to-rose-500" />
                    </div>
                    <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-b from-amber-400 to-rose-500 blur-[1px] animate-pulse -mt-1" />
                </motion.div>

                {/* ID Badge Card */}
                <motion.div 
                    animate={{ y: [0, -4, 0], rotate: [6, 10, 6] }}
                    transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
                    className="absolute -right-3 -bottom-1 w-12 h-16 rounded-lg bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-1 border border-purple-300/50 shadow-lg flex flex-col justify-between"
                >
                    <div className="w-3.5 h-1 rounded-full bg-purple-500 mx-auto" />
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-400 mx-auto" />
                    <div className="w-8 h-1 rounded-full bg-purple-300 mx-auto" />
                </motion.div>

                <motion.div 
                    animate={{ y: [0, -6, 0], scale: [1, 1.15, 1] }}
                    transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-gradient-to-tr from-purple-400 to-pink-400 border border-white/70 shadow-md flex items-center justify-center text-white"
                >
                    <Sparkles className="w-3 h-3" />
                </motion.div>
            </div>
        </div>
    );
}

function VisualRentalGear() {
    return (
        <div className="relative w-full h-full min-h-[140px] sm:min-h-[170px] flex items-center justify-center select-none overflow-hidden rounded-2xl bg-black/10 dark:bg-black/25 backdrop-blur-sm border border-white/20">
            <div className="absolute w-24 h-24 rounded-full bg-teal-400/30 blur-2xl pointer-events-none" />
            <div className="relative z-10 flex items-center justify-center scale-90 sm:scale-100">
                {/* 3D Drone Body */}
                <motion.div 
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
                    className="relative z-20 flex flex-col items-center"
                >
                    <div className="relative w-18 h-9 rounded-2xl bg-gradient-to-br from-teal-500 via-teal-700 to-slate-950 border border-teal-300/60 shadow-xl flex items-center justify-center">
                        <div className="w-5 h-5 rounded-full bg-slate-950 border border-teal-400 shadow-inner flex items-center justify-center">
                            <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#06b6d4]" />
                        </div>
                    </div>
                    {/* Propellers */}
                    <div className="absolute -top-2.5 -left-4 w-7 h-7 rounded-full border border-teal-400/40 bg-teal-400/10 flex items-center justify-center">
                        <div className="w-5 h-0.5 rounded-full bg-slate-200" />
                    </div>
                    <div className="absolute -top-2.5 -right-4 w-7 h-7 rounded-full border border-teal-400/40 bg-teal-400/10 flex items-center justify-center">
                        <div className="w-5 h-0.5 rounded-full bg-slate-200" />
                    </div>
                </motion.div>

                {/* TV Card */}
                <motion.div 
                    animate={{ y: [0, -5, 0], rotate: [4, 8, 4] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
                    className="absolute -right-2 -bottom-2 w-12 h-9 rounded-lg bg-gradient-to-br from-slate-900 to-black p-1 border border-teal-300/40 shadow-md flex items-center justify-center"
                >
                    <span className="text-[7px] font-mono font-bold text-teal-300">TV 65"</span>
                </motion.div>
                
                <motion.div 
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
                    className="absolute -top-2 -left-2 px-1.5 py-0.5 rounded-full bg-teal-500 text-white font-mono font-bold text-[8px] shadow-sm border border-white/40"
                >
                    4K PROYEKSI
                </motion.div>
            </div>
        </div>
    );
}

function VisualCollaboration() {
    return (
        <div className="relative w-full h-full min-h-[140px] sm:min-h-[170px] flex items-center justify-center select-none overflow-hidden rounded-2xl bg-black/15 dark:bg-black/30 backdrop-blur-sm border border-white/20">
            <div className="absolute w-24 h-24 rounded-full bg-pink-400/30 blur-2xl pointer-events-none" />
            <div className="relative z-10 flex items-center justify-center scale-90 sm:scale-100">
                {/* Blue Sphere */}
                <motion.div 
                    animate={{ x: [0, 3, 0], y: [0, -3, 0] }}
                    transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
                    className="w-13 h-13 rounded-full bg-gradient-to-tr from-[#003B64] via-[#005792] to-cyan-400 border border-cyan-200/50 shadow-xl flex items-center justify-center -mr-3 relative z-10"
                >
                    <div className="w-4 h-4 rounded-full bg-white/40 blur-[1px] absolute top-1.5 left-2" />
                </motion.div>

                {/* Pink Sphere */}
                <motion.div 
                    animate={{ x: [0, -3, 0], y: [0, 3, 0] }}
                    transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
                    className="w-13 h-13 rounded-full bg-gradient-to-tr from-[#9D174D] via-[#EC4899] to-pink-300 border border-pink-200/50 shadow-xl flex items-center justify-center relative z-20"
                >
                    <div className="w-4 h-4 rounded-full bg-white/40 blur-[1px] absolute top-1.5 left-2" />
                </motion.div>

                {/* Handshake Badge */}
                <motion.div 
                    animate={{ y: [0, -5, 0], scale: [1, 1.1, 1] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
                    className="absolute -right-2 -bottom-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-950 font-mono font-black text-[8px] shadow-md border border-white/70 flex items-center gap-1 z-30"
                >
                    <span>B2B & KAMPUS</span>
                </motion.div>
            </div>
        </div>
    );
}

/* ── 7 SERVICES DEFINITION (Matching Pinterest Reference Palettes) ──────── */

const SERVICES_DECK = [
    {
        id: 'photo-video',
        slug: 'photography-videography',
        divisionNumber: '01',
        badge: 'CINEMA & STUDIO',
        title: 'Photography & Videography',
        shortDesc: 'Dokumentasi sinematik wedding, portrait wisuda, after-movie event, liputan traveling, dan video company profile korporat dengan grading warna profesional.',
        highlight: 'Kamera Sinema 4K • Drone Pilot Berlisensi',
        // Pinterest Video Card 1: Warm Radiant Yellow (Davie Cade)
        bg: '#FEE440',
        textColor: '#0F172A',
        descColor: '#334155',
        tagBg: 'rgba(15, 23, 42, 0.08)',
        tagTextColor: '#0F172A',
        btnBg: '#0F172A',
        btnTextColor: '#FFFFFF',
        accentGlow: 'rgba(254, 228, 64, 0.45)',
        icon: Camera,
        visual: VisualPhotoVideo,
    },
    {
        id: 'web-dev',
        slug: 'web-development',
        divisionNumber: '02',
        badge: 'CYBER ARCHITECTURE',
        title: 'Web Development',
        shortDesc: 'Pengembangan website operasi internal perusahaan, profil bisnis modern, portal pendidikan terintegrasi, dan aplikasi web custom dengan arsitektur modern.',
        highlight: 'Next.js / Laravel • Kecepatan Tinggi • API Terbuka',
        // Pinterest Video Card 4: Electric Cyan / Azure (Titus Bright)
        bg: '#0284C7',
        textColor: '#FFFFFF',
        descColor: '#E0F2FE',
        tagBg: 'rgba(255, 255, 255, 0.18)',
        tagTextColor: '#FFFFFF',
        btnBg: '#FFFFFF',
        btnTextColor: '#0284C7',
        accentGlow: 'rgba(2, 132, 199, 0.45)',
        icon: Code2,
        visual: VisualWebDev,
    },
    {
        id: 'education',
        slug: 'langit-education',
        divisionNumber: '03',
        badge: 'ACADEMY & TRAINING',
        title: 'Langit Education',
        shortDesc: 'Pelatihan praktis bersertifikasi: Kursus Coding (Robotik, Web Dev, AI), Administrasi Office tingkat mahir, dan Lab Diagnostik & Rakit Komputer.',
        highlight: 'Kurikulum Industri • Modul Praktek Langsung',
        // Pinterest Video Card 5: Mint Emerald (Hank Stone)
        bg: '#10B981',
        textColor: '#022C22',
        descColor: '#064E3B',
        tagBg: 'rgba(2, 44, 34, 0.1)',
        tagTextColor: '#022C22',
        btnBg: '#022C22',
        btnTextColor: '#FFFFFF',
        accentGlow: 'rgba(16, 185, 129, 0.45)',
        icon: GraduationCap,
        visual: VisualEducation,
    },
    {
        id: 'computer-service',
        slug: 'computer-service',
        divisionNumber: '04',
        badge: 'HARDWARE LAB',
        title: 'Computer Service',
        shortDesc: 'Reparasi dan tuning hardware: Installasi software clean OS, upgrade SSD NVMe kecepatan tinggi, perakitan PC custom estetik, dan penggantian sparepart bergaransi.',
        highlight: 'Sparepart Original • Garansi Servis Nyata',
        // Pinterest Video Card 3: Punchy Tangerine Orange (Kayla Rogers)
        bg: '#F97316',
        textColor: '#FFFFFF',
        descColor: '#FFEDD5',
        tagBg: 'rgba(255, 255, 255, 0.18)',
        tagTextColor: '#FFFFFF',
        btnBg: '#FFFFFF',
        btnTextColor: '#EA580C',
        accentGlow: 'rgba(249, 115, 22, 0.45)',
        icon: Cpu,
        visual: VisualComputerService,
    },
    {
        id: 'internship',
        slug: 'internship',
        divisionNumber: '05',
        badge: 'CAREER HUB',
        title: 'Internship Program',
        shortDesc: 'Pendaftaran program magang & PKL industri nyata untuk mahasiswa dan siswa berprestasi di divisi Web Dev, Multimedia/Drone, dan Hardware Lab.',
        highlight: 'Sertifikat Resmi • Akses Studio & Portofolio Klien',
        // Vivid Violet / Royal Purple
        bg: '#8B5CF6',
        textColor: '#FFFFFF',
        descColor: '#EDE9FE',
        tagBg: 'rgba(255, 255, 255, 0.18)',
        tagTextColor: '#FFFFFF',
        btnBg: '#FFFFFF',
        btnTextColor: '#7C3AED',
        accentGlow: 'rgba(139, 92, 246, 0.45)',
        icon: Sparkles,
        visual: VisualInternship,
    },
    {
        id: 'sewa-alat',
        slug: 'sewa-alat',
        divisionNumber: '06',
        badge: 'RENTAL GEAR',
        title: 'Sewa Alat Multimedia',
        shortDesc: 'Penyewaan proyektor lumens tinggi + screen tripod, Smart TV 55"/65" dengan standing bracket beroda untuk pameran, serta drone aerial 4K siap pakai.',
        highlight: 'Unit Terawat • Siap Antar Jemput Lokasi',
        // Aqua Marine Teal
        bg: '#14B8A6',
        textColor: '#042F2E',
        descColor: '#134E4A',
        tagBg: 'rgba(4, 47, 46, 0.1)',
        tagTextColor: '#042F2E',
        btnBg: '#042F2E',
        btnTextColor: '#FFFFFF',
        accentGlow: 'rgba(20, 184, 166, 0.45)',
        icon: PackageCheck,
        visual: VisualRentalGear,
    },
    {
        id: 'kolaborasi',
        slug: 'kolaborasi',
        divisionNumber: '07',
        badge: 'STRATEGIC PARTNER',
        title: 'Kolaborasi & Kemitraan',
        shortDesc: 'Kolaborasi kemitraan institusi kampus/SMK, sponsorship acara kreatif, media partner, serta kerjasama vendor subkontrak proyek B2B.',
        highlight: 'MoU Resmi • Co-branding & Sinergi Bisnis',
        // Pinterest Video Card 2: Hot Bubblegum Pink (Katy Cate)
        bg: '#EC4899',
        textColor: '#FFFFFF',
        descColor: '#FCE7F3',
        tagBg: 'rgba(255, 255, 255, 0.18)',
        tagTextColor: '#FFFFFF',
        btnBg: '#FFFFFF',
        btnTextColor: '#BE185D',
        accentGlow: 'rgba(236, 72, 153, 0.45)',
        icon: Handshake,
        visual: VisualCollaboration,
    },
];

export default function ScrollingServiceCards({ services = [] }) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [isUserHovering, setIsUserHovering] = useState(false);
    const containerRef = useRef(null);
    const wheelLockRef = useRef(false);
    const touchStartYRef = useRef(null);

    const total = SERVICES_DECK.length;

    // Navigation functions
    const goToNext = useCallback(() => {
        setActiveIndex((prev) => (prev + 1) % total);
    }, [total]);

    const goToPrev = useCallback(() => {
        setActiveIndex((prev) => (prev - 1 + total) % total);
    }, [total]);

    // Auto-play interval matching Pinterest video pace (~3.6s)
    useEffect(() => {
        if (isPaused || isUserHovering) return;
        const timer = setInterval(() => {
            goToNext();
        }, 3600);
        return () => clearInterval(timer);
    }, [isPaused, isUserHovering, goToNext]);

    // Mouse wheel navigation handler
    const handleWheel = (e) => {
        if (Math.abs(e.deltaY) < 18) return;
        
        // Prevent default window scrolling only when interacting directly with the deck
        if (wheelLockRef.current) return;
        wheelLockRef.current = true;

        if (e.deltaY > 0) {
            goToNext();
        } else {
            goToPrev();
        }

        setTimeout(() => {
            wheelLockRef.current = false;
        }, 380);
    };

    // Touch swipe handling for mobile
    const handleTouchStart = (e) => {
        touchStartYRef.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e) => {
        if (touchStartYRef.current === null) return;
        const deltaY = e.changedTouches[0].clientY - touchStartYRef.current;
        touchStartYRef.current = null;

        if (Math.abs(deltaY) > 35) {
            if (deltaY < 0) {
                goToNext();
            } else {
                goToPrev();
            }
        }
    };

    const activeItem = SERVICES_DECK[activeIndex];

    return (
        <section className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-16 lg:py-24">
            {/* Header info */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
                <div>
                    <div className="flex items-center gap-2 text-[#005792] dark:text-cyan-400 font-mono text-[11px] uppercase tracking-widest mb-2 font-bold">
                        <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                        <span>Interactive Card Scrolling Experience</span>
                    </div>
                    <h2 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl text-slate-900 dark:text-white tracking-tight">
                        Tujuh Divisi
                        <span className="block text-gradient-cyan-violet">
                            Layanan <span className="font-editorial italic font-normal tracking-normal">Terintegrasi</span>
                        </span>
                    </h2>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm max-w-xs leading-relaxed">
                        Scroll dengan mouse wheel, klik kartu, atau geser untuk melihat animasi kartu 3D tiap divisi.
                    </p>
                </div>
            </div>

            {/* STAGE CONTAINER (Matches Pinterest Reference Video Aesthetic with Peach/Terracotta Ribbon) */}
            <div 
                ref={containerRef}
                onMouseEnter={() => setIsUserHovering(true)}
                onMouseLeave={() => setIsUserHovering(false)}
                onWheel={handleWheel}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                className="relative rounded-[32px] sm:rounded-[40px] bg-gradient-to-br from-amber-50/40 via-white/80 to-purple-50/40 dark:from-[#0f0919] dark:via-[#130d22] dark:to-[#0a0614] border border-amber-200/60 dark:border-purple-500/20 p-6 sm:p-10 lg:p-12 shadow-2xl overflow-hidden min-h-[580px] sm:min-h-[640px] md:min-h-[660px] flex flex-col justify-between select-none"
            >
                {/* Organic Peach/Terracotta Ribbon SVG Path (Directly from Pinterest Video Background!) */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <svg 
                        viewBox="0 0 1000 700" 
                        fill="none" 
                        className="w-full h-full object-cover opacity-65 dark:opacity-20"
                        preserveAspectRatio="none"
                    >
                        <path 
                            d="M -80 380 C 140 320, 160 520, 320 540 C 480 560, 480 220, 680 180 C 860 140, 920 480, 1100 450" 
                            stroke="#E77E57" 
                            strokeWidth="56" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                        />
                    </svg>

                    {/* Ambient Glow Orbs */}
                    <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-amber-400/10 blur-[100px]" />
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-purple-500/10 blur-[120px]" />
                </div>

                {/* Stage Header Toolbar */}
                <div className="relative z-40 flex items-center justify-between gap-3 text-xs font-mono">
                    <div className="flex items-center gap-2 bg-white/80 dark:bg-black/40 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-white/10 shadow-xs">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                            Divisi {activeItem.divisionNumber} dari 07
                        </span>
                        <span className="text-slate-400 dark:text-slate-500">•</span>
                        <span className="hidden sm:inline text-slate-600 dark:text-slate-300 font-semibold">
                            {activeItem.badge}
                        </span>
                    </div>

                    {/* Navigation Buttons and Autoplay Status */}
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setIsPaused((prev) => !prev)}
                            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 dark:bg-black/40 backdrop-blur-md border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 text-[11px] font-bold hover:bg-white dark:hover:bg-black/60 transition-colors shadow-xs"
                            title={isPaused ? "Lanjutkan Putar Otomatis" : "Jeda Putar Otomatis"}
                        >
                            {isPaused ? <Play className="w-3 h-3 text-emerald-500" /> : <Pause className="w-3 h-3 text-amber-500" />}
                            <span>{isPaused ? "Play" : "Pause"}</span>
                        </button>

                        <div className="flex items-center gap-1 bg-white/80 dark:bg-black/40 backdrop-blur-md p-1 rounded-full border border-slate-200 dark:border-white/10 shadow-xs">
                            <button
                                type="button"
                                onClick={goToPrev}
                                className="w-7 h-7 rounded-full flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
                                aria-label="Divisi Sebelumnya"
                            >
                                <ChevronUp className="w-4 h-4" />
                            </button>
                            <button
                                type="button"
                                onClick={goToNext}
                                className="w-7 h-7 rounded-full flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
                                aria-label="Divisi Selanjutnya"
                            >
                                <ChevronDown className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* VERTICAL SCROLL CAROUSEL STACK (Identical to Pinterest Video Animation) */}
                <div className="relative z-30 flex-1 flex items-center justify-center my-4 min-h-[380px] sm:min-h-[420px] md:min-h-[440px]">
                    <div className="relative w-full max-w-2xl h-[260px] sm:h-[280px] md:h-[300px] flex items-center justify-center">
                        {SERVICES_DECK.map((service, idx) => {
                            // Calculate shortest circular distance
                            let diff = idx - activeIndex;
                            if (diff > total / 2) diff -= total;
                            if (diff < -total / 2) diff += total;

                            const isActive = diff === 0;
                            const isNear = Math.abs(diff) === 1;
                            const isFar = Math.abs(diff) === 2;

                            // Calculate motion properties based on vertical position
                            let yOffset = 0;
                            let scale = 1;
                            let opacity = 1;
                            let zIndex = 30;

                            if (isActive) {
                                yOffset = 0;
                                scale = 1;
                                opacity = 1;
                                zIndex = 30;
                            } else if (isNear) {
                                yOffset = diff > 0 ? 110 : -110;
                                scale = 0.88;
                                opacity = 0.65;
                                zIndex = 20;
                            } else if (isFar) {
                                yOffset = diff > 0 ? 190 : -190;
                                scale = 0.74;
                                opacity = 0.25;
                                zIndex = 10;
                            } else {
                                yOffset = diff > 0 ? 270 : -270;
                                scale = 0.6;
                                opacity = 0;
                                zIndex = 0;
                            }

                            const IconComp = service.icon;
                            const VisualComp = service.visual;

                            return (
                                <motion.div
                                    key={service.id}
                                    initial={false}
                                    animate={{
                                        y: yOffset,
                                        scale: scale,
                                        opacity: opacity,
                                        zIndex: zIndex,
                                    }}
                                    transition={{
                                        type: 'spring',
                                        stiffness: 280,
                                        damping: 26,
                                        mass: 0.8,
                                    }}
                                    onClick={() => {
                                        if (!isActive) setActiveIndex(idx);
                                    }}
                                    style={{
                                        backgroundColor: service.bg,
                                        color: service.textColor,
                                        boxShadow: isActive 
                                            ? `0 24px 48px -12px ${service.accentGlow}, 0 12px 24px -8px rgba(0,0,0,0.15)` 
                                            : '0 8px 20px -6px rgba(0,0,0,0.1)',
                                    }}
                                    className={`absolute w-[92%] sm:w-[540px] md:w-[620px] lg:w-[660px] h-[220px] sm:h-[240px] md:h-[260px] rounded-[28px] sm:rounded-[36px] p-5 sm:p-7 flex flex-col justify-between transition-shadow duration-300 border border-black/10 select-none ${
                                        isActive 
                                            ? 'cursor-default ring-4 ring-white/80 dark:ring-white/40' 
                                            : 'cursor-pointer hover:opacity-80'
                                    }`}
                                >
                                    {/* Card Content Interior: Split into Text Details (Left) & 3D Visual (Right) */}
                                    <div className="flex items-center justify-between gap-4 h-full">
                                        {/* Left Side: Category Badge, Title, Description, Link */}
                                        <div className="flex-1 flex flex-col justify-between h-full pr-2">
                                            <div>
                                                {/* Category Pill with Icon */}
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span 
                                                        style={{ 
                                                            backgroundColor: service.tagBg, 
                                                            color: service.tagTextColor 
                                                        }}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-mono font-bold tracking-wider uppercase backdrop-blur-xs"
                                                    >
                                                        <IconComp className="w-3 h-3" />
                                                        <span>{service.badge}</span>
                                                    </span>
                                                    <span 
                                                        style={{ color: service.descColor }}
                                                        className="text-[10px] font-mono font-semibold opacity-75 hidden sm:inline"
                                                    >
                                                        #{service.divisionNumber}
                                                    </span>
                                                </div>

                                                {/* Bold Headline (Playful Editorial typography like Davie Cade in Pinterest video) */}
                                                <h3 className="font-heading font-black text-xl sm:text-2xl md:text-3xl tracking-tight leading-tight line-clamp-1 mb-1.5">
                                                    {service.title}
                                                </h3>

                                                {/* Short Quote / Description */}
                                                <p 
                                                    style={{ color: service.descColor }}
                                                    className="text-xs sm:text-sm font-medium leading-relaxed line-clamp-2 sm:line-clamp-3 mb-2"
                                                >
                                                    {service.shortDesc}
                                                </p>
                                            </div>

                                            {/* Bottom CTA Row */}
                                            <div className="flex items-center justify-between gap-2 pt-2 border-t border-black/10">
                                                <span 
                                                    style={{ color: service.descColor }}
                                                    className="text-[11px] font-mono font-semibold truncate max-w-[170px] sm:max-w-[240px] hidden sm:inline"
                                                >
                                                    {service.highlight}
                                                </span>

                                                {/* Active Link Button */}
                                                <Link
                                                    href={`/layanan/${service.slug}`}
                                                    onClick={(e) => {
                                                        if (!isActive) {
                                                            e.preventDefault();
                                                            setActiveIndex(idx);
                                                        }
                                                    }}
                                                    style={{
                                                        backgroundColor: service.btnBg,
                                                        color: service.btnTextColor,
                                                    }}
                                                    className="group/btn ml-auto inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold tracking-tight shadow-md hover:scale-105 active:scale-95 transition-all"
                                                >
                                                    <span>Buka Divisi</span>
                                                    <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                                                </Link>
                                            </div>
                                        </div>

                                        {/* Right Side: 3D Illustration Widget (With Wavy Organic Cutout Tray) */}
                                        <div className="w-[110px] sm:w-[160px] md:w-[190px] h-full shrink-0 flex items-center justify-center">
                                            <div className="w-full h-full relative">
                                                <VisualComp />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* Stage Bottom Footer: Division Progress Dots & Indicator */}
                <div className="relative z-40 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200/60 dark:border-white/10 text-xs font-mono">
                    <span className="text-slate-500 dark:text-slate-400 text-center sm:text-left flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                        Gunakan tombol panah atau scroll mouse untuk berpindah kartu
                    </span>

                    {/* 7 Division Indicator Dots (Interactive) */}
                    <div className="flex items-center gap-1.5 sm:gap-2">
                        {SERVICES_DECK.map((srv, i) => {
                            const isCur = i === activeIndex;
                            return (
                                <button
                                    key={srv.id}
                                    type="button"
                                    onClick={() => setActiveIndex(i)}
                                    className={`group flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all duration-300 ${
                                        isCur
                                            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md scale-105'
                                            : 'bg-white/60 dark:bg-white/10 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-white/20'
                                    }`}
                                    title={srv.title}
                                >
                                    <span>{srv.divisionNumber}</span>
                                    {isCur && (
                                        <span className="hidden md:inline font-mono text-[10px] uppercase font-semibold">
                                            • {srv.badge}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}
