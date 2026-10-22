import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import { motion, useSpring, useMotionValue } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

// Preset HUD metadata and themes for the 7 divisions
const DIVISION_CONFIG = {
    'photography-videography': {
        badge: 'CINEMA & STUDIO',
        accent: '#F59E0B',
        accentRgb: '245, 158, 11',
        tagline: 'Wedding, Wisuda, Event, Traveling, Drone & Compro',
        desc: 'Layanan dokumentasi lengkap: Wedding sinematik, wisuda portrait, liputan event, dokumentasi traveling, jasa drone aerial 4K, dan video company profile korporat.',
    },
    'web-development': {
        badge: 'CYBER ARCHITECTURE',
        accent: '#0EA5E9',
        accentRgb: '14, 165, 233',
        tagline: 'Operasi Internal, Profil, Pendidikan & Toko Online',
        desc: 'Pengembangan website operasi internal perusahaan, profil perusahaan modern, portal pendidikan (absensi & akademik), toko online, dan web kustom berkinerja tinggi.',
    },
    'langit-education': {
        badge: 'ACADEMY & TRAINING',
        accent: '#10B981',
        accentRgb: '16, 185, 129',
        tagline: 'Coding (Robotik/Web/AI), Office & Rakit Komputer',
        desc: 'Pelatihan praktis bersertifikat: Kursus Coding (Robotik, Web Dev, AI), Kursus Administrasi Office profesional, dan Kursus Rakit Komputer & Diagnostic Lab.',
    },
    'computer-service': {
        badge: 'HARDWARE LAB',
        accent: '#F97316',
        accentRgb: '249, 115, 22',
        tagline: 'Installasi Software, Upgrade SSD, Rakit PC & Part',
        desc: 'Reparasi dan tuning hardware: Installasi software clean OS, upgrade SSD NVMe kecepatan tinggi, perakitan PC custom estetik, dan penggantian sparepart bergaransi.',
    },
    'internship': {
        badge: 'CAREER HUB',
        accent: '#8B5CF6',
        accentRgb: '139, 92, 246',
        tagline: 'Form Pendaftaran Magang / PKL Industri',
        desc: 'Pendaftaran program magang & PKL industri nyata untuk mahasiswa dan siswa berprestasi di divisi Web Dev, Multimedia/Drone, dan Hardware Lab.',
    },
    'sewa-alat': {
        badge: 'RENTAL GEAR',
        accent: '#14B8A6',
        accentRgb: '20, 184, 166',
        tagline: 'Rental Proyektor, Smart TV Display & Drone 4K',
        desc: 'Penyewaan proyektor lumens tinggi + screen tripod, Smart TV 55"/65" dengan standing bracket beroda untuk pameran, serta drone aerial 4K siap pakai.',
    },
    'kolaborasi': {
        badge: 'STRATEGIC PARTNER',
        accent: '#EC4899',
        accentRgb: '236, 72, 153',
        tagline: 'Kemitraan Kampus, Sponsor Event & Vendor B2B',
        desc: 'Kolaborasi kemitraan institusi kampus/SMK, sponsorship acara kreatif, media partner, serta kerjasama vendor subkontrak proyek B2B.',
    },
};

/* ── 3D VISUAL ILLUSTRATION WIDGETS (Claymorphic + Glassmorphic) ─────── */

function VisualPhotoVideo() {
    return (
        <div className="relative w-full h-40 sm:h-44 flex items-center justify-center select-none overflow-hidden rounded-2xl bg-gradient-to-b from-[#005792]/10 via-[#F59E0B]/5 to-transparent">
            {/* Ambient depth glow */}
            <div className="absolute w-28 h-28 rounded-full bg-amber-500/20 blur-2xl pointer-events-none" />

            {/* Frosted glass backdrop tray */}
            <div className="absolute inset-x-6 inset-y-4 rounded-2xl bg-white/10 dark:bg-white/[0.03] backdrop-blur-md border border-white/20 dark:border-white/10 shadow-inner" />

            {/* 3D Camera Body (Claymorphic) */}
            <div className="relative z-10 flex items-center justify-center">
                {/* Main Camera Block */}
                <div 
                    className="relative w-28 h-20 rounded-2xl bg-gradient-to-br from-slate-700 via-slate-800 to-slate-950 border border-slate-600/50 shadow-[0_16px_24px_-6px_rgba(0,0,0,0.5),_inset_0_2px_2px_rgba(255,255,255,0.25)] flex items-center justify-center"
                >
                    {/* Viewfinder hump */}
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-9 h-4 rounded-t-lg bg-gradient-to-b from-slate-600 to-slate-800 border-t border-x border-slate-500/50 shadow-sm" />

                    {/* Red REC dot */}
                    <div className="absolute top-2.5 right-3 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_6px_#f43f5e]" />
                    </div>

                    {/* Concentric 3D Lens Barrel */}
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-slate-900 via-slate-950 to-black p-1 border border-slate-700 shadow-[0_6px_12px_rgba(0,0,0,0.6),_inset_0_2px_3px_rgba(255,255,255,0.2)] flex items-center justify-center">
                        {/* Metallic accent ring */}
                        <div className="w-11 h-11 rounded-full p-0.5 bg-gradient-to-tr from-amber-500 via-amber-300 to-amber-600 flex items-center justify-center shadow-inner">
                            {/* Multi-coated glass element reflection */}
                            <div className="w-full h-full rounded-full bg-gradient-to-br from-cyan-400/40 via-indigo-900 to-black relative overflow-hidden flex items-center justify-center">
                                {/* Lens glare streak */}
                                <div className="absolute -top-1 left-1 w-4 h-2 rounded-full bg-white/60 blur-[0.5px] rotate-[-25deg]" />
                                <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-amber-400 to-rose-400 opacity-70" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Floating 3D Polaroid Card */}
                <motion.div 
                    animate={{ y: [0, -6, 0], rotate: [-8, -5, -8] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute -right-2 -bottom-2 w-14 h-16 rounded-lg bg-white dark:bg-slate-900 p-1 border border-white/60 dark:border-white/20 shadow-[0_12px_20px_-4px_rgba(0,0,0,0.35)] flex flex-col"
                >
                    <div className="w-full h-10 rounded bg-gradient-to-br from-amber-400 via-rose-400 to-indigo-600" />
                    <div className="flex-1 flex items-center justify-center">
                        <span className="w-6 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                    </div>
                </motion.div>

                {/* Floating 3D Sparkle Star */}
                <motion.div 
                    animate={{ y: [0, -8, 0], scale: [1, 1.1, 1] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                    className="absolute -top-2 -left-2 w-7 h-7 rounded-full bg-gradient-to-tr from-amber-400 to-amber-200 border border-white/60 shadow-[0_6px_14px_rgba(245,158,11,0.5)] flex items-center justify-center text-amber-900 font-bold"
                >
                    <Sparkles className="w-3.5 h-3.5" />
                </motion.div>
            </div>
        </div>
    );
}

function VisualWebDev() {
    return (
        <div className="relative w-full h-40 sm:h-44 flex items-center justify-center select-none overflow-hidden rounded-2xl bg-gradient-to-b from-[#005792]/10 via-[#0EA5E9]/5 to-transparent">
            {/* Ambient depth glow */}
            <div className="absolute w-28 h-28 rounded-full bg-cyan-500/20 blur-2xl pointer-events-none" />

            {/* Frosted glass backdrop tray */}
            <div className="absolute inset-x-6 inset-y-4 rounded-2xl bg-white/10 dark:bg-white/[0.03] backdrop-blur-md border border-white/20 dark:border-white/10 shadow-inner" />

            {/* 3D Monitor / Display (Pinterest reference match!) */}
            <div className="relative z-10 flex items-center justify-center">
                {/* Monitor frame */}
                <div className="relative w-32 h-22 rounded-2xl bg-gradient-to-b from-indigo-500 via-indigo-600 to-slate-900 p-1.5 border border-indigo-300/40 shadow-[0_18px_30px_-6px_rgba(14,165,233,0.35),_inset_0_2px_2px_rgba(255,255,255,0.3)]">
                    {/* Screen surface with grid */}
                    <div className="w-full h-full rounded-xl bg-slate-950 relative overflow-hidden flex flex-col justify-between p-2">
                        {/* Background subtle grid pattern */}
                        <div 
                            className="absolute inset-0 opacity-20"
                            style={{
                                backgroundImage: 'linear-gradient(to right, #0ea5e9 1px, transparent 1px), linear-gradient(to bottom, #0ea5e9 1px, transparent 1px)',
                                backgroundSize: '10px 10px',
                            }}
                        />

                        {/* Top window controls */}
                        <div className="relative z-10 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        </div>

                        {/* 3D Sine Wave Chart (Matching Pinterest reference!) */}
                        <div className="relative z-10 py-1">
                            <svg viewBox="0 0 100 32" className="w-full h-8 overflow-visible">
                                <defs>
                                    <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#06b6d4" />
                                        <stop offset="50%" stopColor="#f43f5e" />
                                        <stop offset="100%" stopColor="#8b5cf6" />
                                    </linearGradient>
                                    <filter id="waveGlow" x="-20%" y="-20%" width="140%" height="140%">
                                        <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#f43f5e" floodOpacity="0.6" />
                                    </filter>
                                </defs>
                                <path
                                    d="M 5,16 Q 25,2 45,16 T 85,16 Q 95,28 100,16"
                                    fill="none"
                                    stroke="url(#waveGrad)"
                                    strokeWidth="4"
                                    strokeLinecap="round"
                                    filter="url(#waveGlow)"
                                />
                            </svg>
                        </div>
                    </div>

                    {/* Monitor stand */}
                    <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-8 h-2.5 rounded-t bg-gradient-to-b from-indigo-700 to-indigo-950 border-t border-indigo-400/30" />
                    <div className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 w-14 h-1.5 rounded-full bg-indigo-900 border border-indigo-400/20 shadow-sm" />
                </div>

                {/* Floating 3D Code Pill (Claymorphic) */}
                <motion.div 
                    animate={{ y: [0, -6, 0], rotate: [4, 8, 4] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute -right-3 -bottom-2 px-2.5 py-1 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 border border-cyan-200/50 text-white font-mono font-bold text-[11px] shadow-[0_10px_20px_-3px_rgba(14,165,233,0.5)] flex items-center gap-1"
                >
                    <span>&lt; / &gt;</span>
                </motion.div>

                {/* Floating 3D Clay Buttons (+, x, o) */}
                <motion.div 
                    animate={{ y: [0, -7, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
                    className="absolute -top-2 -left-2 w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-700 border border-indigo-300/50 shadow-[0_8px_16px_rgba(79,70,229,0.45)] flex items-center justify-center text-white font-black text-xs"
                >
                    +
                </motion.div>
            </div>
        </div>
    );
}

function VisualEducation() {
    return (
        <div className="relative w-full h-40 sm:h-44 flex items-center justify-center select-none overflow-hidden rounded-2xl bg-gradient-to-b from-[#005792]/10 via-[#10B981]/5 to-transparent">
            {/* Ambient depth glow */}
            <div className="absolute w-28 h-28 rounded-full bg-emerald-500/20 blur-2xl pointer-events-none" />

            {/* Frosted glass backdrop tray */}
            <div className="absolute inset-x-6 inset-y-4 rounded-2xl bg-white/10 dark:bg-white/[0.03] backdrop-blur-md border border-white/20 dark:border-white/10 shadow-inner" />

            {/* 3D Mortarboard / Graduation Cap & Book */}
            <div className="relative z-10 flex flex-col items-center justify-center">
                {/* 3D Graduation Cap (Claymorphic) */}
                <motion.div 
                    animate={{ y: [0, -5, 0], rotateX: [12, 16, 12] }}
                    transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}
                    className="relative z-20 flex flex-col items-center"
                >
                    {/* Diamond cap top */}
                    <div 
                        className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-900 border border-emerald-300/50 shadow-[0_16px_25px_-5px_rgba(16,185,129,0.4),_inset_0_2px_3px_rgba(255,255,255,0.4)] flex items-center justify-center rotate-45"
                    >
                        {/* Center gold button */}
                        <div className="w-3 h-3 rounded-full bg-amber-300 border border-amber-100 shadow-md" />
                    </div>

                    {/* Skull cap base */}
                    <div className="w-10 h-4 rounded-b-xl bg-gradient-to-b from-emerald-800 to-teal-950 border-x border-b border-emerald-600/30 -mt-2.5 shadow-sm" />
                </motion.div>

                {/* 3D Open Holographic Book */}
                <div className="relative z-10 -mt-2 w-28 h-9 rounded-xl bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 border border-emerald-500/30 shadow-[0_10px_20px_rgba(0,0,0,0.5)] flex items-center justify-around px-3">
                    <span className="w-8 h-1 rounded-full bg-emerald-400/60" />
                    <span className="w-1 h-4 rounded-full bg-emerald-500/40" />
                    <span className="w-8 h-1 rounded-full bg-emerald-400/60" />
                </div>

                {/* Floating AI Chip badge */}
                <motion.div 
                    animate={{ y: [0, -6, 0], rotate: [-6, -2, -6] }}
                    transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
                    className="absolute -right-3 top-2 px-2 py-1 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-950 font-mono font-black text-[10px] border border-amber-100 shadow-md flex items-center gap-1"
                >
                    <span>AI / ROBOTIK</span>
                </motion.div>
            </div>
        </div>
    );
}

function VisualComputerService() {
    return (
        <div className="relative w-full h-40 sm:h-44 flex items-center justify-center select-none overflow-hidden rounded-2xl bg-gradient-to-b from-[#005792]/10 via-[#F97316]/5 to-transparent">
            {/* Ambient depth glow */}
            <div className="absolute w-28 h-28 rounded-full bg-orange-500/20 blur-2xl pointer-events-none" />

            {/* Frosted glass backdrop tray */}
            <div className="absolute inset-x-6 inset-y-4 rounded-2xl bg-white/10 dark:bg-white/[0.03] backdrop-blur-md border border-white/20 dark:border-white/10 shadow-inner" />

            {/* 3D CPU Chipset with Heatspreader */}
            <div className="relative z-10 flex items-center justify-center">
                {/* Outer PCB substrate with pins */}
                <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-orange-600 via-amber-700 to-slate-900 p-2 border border-orange-400/50 shadow-[0_18px_30px_-6px_rgba(249,115,22,0.4),_inset_0_2px_3px_rgba(255,255,255,0.35)] flex items-center justify-center">
                    {/* Metallic CPU Heatspreader */}
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-slate-200 via-slate-300 to-slate-400 dark:from-slate-700 dark:via-slate-800 dark:to-slate-900 border border-white/60 dark:border-white/20 shadow-[0_4px_10px_rgba(0,0,0,0.3),_inset_0_1px_2px_rgba(255,255,255,0.7)] flex flex-col items-center justify-center p-1.5 text-center">
                        <span className="text-[9px] font-mono font-black tracking-wider text-slate-800 dark:text-orange-400">
                            LANGIT
                        </span>
                        <span className="text-[7px] font-mono text-slate-500 dark:text-slate-400">
                            HARDWARE LAB
                        </span>
                        {/* Chip Core Dot */}
                        <div className="w-3 h-3 rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 mt-1 shadow-[0_0_8px_#f97316]" />
                    </div>

                    {/* Corner golden alignment notch */}
                    <div className="absolute top-1 left-1 w-2 h-2 bg-amber-300 rounded-sm shadow-sm" />
                </div>

                {/* Floating 3D Diagnostic Gauge Pill */}
                <motion.div 
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute -right-3 -bottom-2 px-2.5 py-1 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 border border-orange-200/50 text-white font-mono font-bold text-[10px] shadow-[0_10px_20px_-3px_rgba(249,115,22,0.5)] flex items-center gap-1.5"
                >
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>NVMe 99% QC</span>
                </motion.div>

                {/* Floating RAM Stick 3D */}
                <motion.div 
                    animate={{ y: [0, -8, 0], rotate: [-10, -6, -10] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
                    className="absolute -top-3 -left-2 w-14 h-4 rounded-md bg-gradient-to-r from-slate-800 via-slate-900 to-black border border-orange-500/40 shadow-md flex items-center justify-around px-1"
                >
                    <span className="w-2 h-2 rounded-sm bg-orange-500/80" />
                    <span className="w-2 h-2 rounded-sm bg-orange-500/80" />
                    <span className="w-2 h-2 rounded-sm bg-orange-500/80" />
                </motion.div>
            </div>
        </div>
    );
}

function VisualInternship() {
    return (
        <div className="relative w-full h-40 sm:h-44 flex items-center justify-center select-none overflow-hidden rounded-2xl bg-gradient-to-b from-[#005792]/10 via-[#8B5CF6]/5 to-transparent">
            {/* Ambient depth glow */}
            <div className="absolute w-28 h-28 rounded-full bg-purple-500/20 blur-2xl pointer-events-none" />

            {/* Frosted glass backdrop tray */}
            <div className="absolute inset-x-6 inset-y-4 rounded-2xl bg-white/10 dark:bg-white/[0.03] backdrop-blur-md border border-white/20 dark:border-white/10 shadow-inner" />

            {/* 3D Rocket Launch & Glass ID Badge */}
            <div className="relative z-10 flex items-center justify-center">
                {/* 3D Claymorphic Rocket */}
                <motion.div 
                    animate={{ y: [0, -8, 0], rotate: [-2, 2, -2] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="relative z-20 flex flex-col items-center"
                >
                    {/* Rocket Nosecone & Body */}
                    <div className="w-12 h-20 rounded-t-full rounded-b-2xl bg-gradient-to-b from-purple-400 via-purple-600 to-indigo-900 border border-purple-300/50 shadow-[0_16px_28px_-6px_rgba(139,92,246,0.45),_inset_0_2px_3px_rgba(255,255,255,0.4)] flex flex-col items-center pt-3 relative">
                        {/* Circular cabin window */}
                        <div className="w-5 h-5 rounded-full bg-cyan-300 border border-white shadow-inner flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-cyan-600" />
                        </div>
                        {/* Rocket fins */}
                        <div className="absolute -bottom-1 -left-3 w-4 h-7 rounded-l-full bg-gradient-to-l from-purple-700 to-rose-500" />
                        <div className="absolute -bottom-1 -right-3 w-4 h-7 rounded-r-full bg-gradient-to-r from-purple-700 to-rose-500" />
                    </div>

                    {/* Rocket exhaust plume */}
                    <div className="w-4 h-4 rounded-full bg-gradient-to-b from-amber-400 to-rose-500 blur-[1px] animate-pulse -mt-1" />
                </motion.div>

                {/* Floating 3D ID Badge Card */}
                <motion.div 
                    animate={{ y: [0, -5, 0], rotate: [6, 10, 6] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
                    className="absolute -right-4 -bottom-1 w-16 h-20 rounded-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-1.5 border border-purple-300/40 shadow-[0_12px_24px_rgba(0,0,0,0.3)] flex flex-col justify-between"
                >
                    <div className="w-4 h-1.5 rounded-full bg-purple-500 mx-auto" />
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-400 mx-auto" />
                    <div className="space-y-1">
                        <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-700 mx-auto" />
                        <div className="w-7 h-1 rounded-full bg-purple-400 mx-auto" />
                    </div>
                </motion.div>

                {/* Floating 3D Star Badge */}
                <motion.div 
                    animate={{ y: [0, -7, 0], scale: [1, 1.1, 1] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute -top-2 -left-2 w-7 h-7 rounded-full bg-gradient-to-tr from-purple-400 to-pink-400 border border-white/60 shadow-lg flex items-center justify-center text-white"
                >
                    <Sparkles className="w-3.5 h-3.5" />
                </motion.div>
            </div>
        </div>
    );
}

function VisualRentalGear() {
    return (
        <div className="relative w-full h-40 sm:h-44 flex items-center justify-center select-none overflow-hidden rounded-2xl bg-gradient-to-b from-[#005792]/10 via-[#14B8A6]/5 to-transparent">
            {/* Ambient depth glow */}
            <div className="absolute w-28 h-28 rounded-full bg-teal-500/20 blur-2xl pointer-events-none" />

            {/* Frosted glass backdrop tray */}
            <div className="absolute inset-x-6 inset-y-4 rounded-2xl bg-white/10 dark:bg-white/[0.03] backdrop-blur-md border border-white/20 dark:border-white/10 shadow-inner" />

            {/* 3D 4K Drone & Smart Display Gear */}
            <div className="relative z-10 flex items-center justify-center">
                {/* 3D Drone Body */}
                <motion.div 
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
                    className="relative z-20 flex flex-col items-center"
                >
                    {/* Drone center pod */}
                    <div className="relative w-20 h-10 rounded-2xl bg-gradient-to-br from-teal-500 via-teal-700 to-slate-950 border border-teal-300/50 shadow-[0_16px_26px_-6px_rgba(20,184,166,0.4),_inset_0_2px_2px_rgba(255,255,255,0.4)] flex items-center justify-center">
                        {/* 4K Camera Gimbal */}
                        <div className="w-6 h-6 rounded-full bg-slate-950 border border-teal-400 shadow-inner flex items-center justify-center">
                            <div className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_6px_#06b6d4]" />
                        </div>
                    </div>

                    {/* 4 Propeller Arms & Rotors */}
                    <div className="absolute -top-3 -left-5 w-8 h-8 rounded-full border border-teal-400/40 bg-teal-400/10 flex items-center justify-center">
                        <div className="w-6 h-1 rounded-full bg-slate-700 dark:bg-slate-300" />
                    </div>
                    <div className="absolute -top-3 -right-5 w-8 h-8 rounded-full border border-teal-400/40 bg-teal-400/10 flex items-center justify-center">
                        <div className="w-6 h-1 rounded-full bg-slate-700 dark:bg-slate-300" />
                    </div>
                    <div className="absolute -bottom-3 -left-5 w-8 h-8 rounded-full border border-teal-400/40 bg-teal-400/10 flex items-center justify-center">
                        <div className="w-6 h-1 rounded-full bg-slate-700 dark:bg-slate-300" />
                    </div>
                    <div className="absolute -bottom-3 -right-5 w-8 h-8 rounded-full border border-teal-400/40 bg-teal-400/10 flex items-center justify-center">
                        <div className="w-6 h-1 rounded-full bg-slate-700 dark:bg-slate-300" />
                    </div>
                </motion.div>

                {/* Floating 3D TV Screen Stand */}
                <motion.div 
                    animate={{ y: [0, -7, 0], rotate: [4, 8, 4] }}
                    transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
                    className="absolute -right-3 -bottom-2 w-14 h-10 rounded-lg bg-gradient-to-br from-slate-800 to-black p-1 border border-teal-300/40 shadow-lg flex items-center justify-center"
                >
                    <span className="text-[8px] font-mono font-bold text-teal-400">TV 65"</span>
                </motion.div>

                {/* Floating Projector Lens Pill */}
                <motion.div 
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                    className="absolute -top-3 -left-2 px-2 py-0.5 rounded-full bg-teal-500 text-white font-mono font-bold text-[9px] shadow-md border border-white/40"
                >
                    4K PROYEKSI
                </motion.div>
            </div>
        </div>
    );
}

function VisualCollaboration() {
    return (
        <div className="relative w-full h-40 sm:h-44 flex items-center justify-center select-none overflow-hidden rounded-2xl bg-gradient-to-b from-[#005792]/10 via-[#EC4899]/5 to-transparent">
            {/* Ambient depth glow */}
            <div className="absolute w-28 h-28 rounded-full bg-pink-500/20 blur-2xl pointer-events-none" />

            {/* Frosted glass backdrop tray */}
            <div className="absolute inset-x-6 inset-y-4 rounded-2xl bg-white/10 dark:bg-white/[0.03] backdrop-blur-md border border-white/20 dark:border-white/10 shadow-inner" />

            {/* 3D Interlocking Puzzle Spheres & Handshake Rings */}
            <div className="relative z-10 flex items-center justify-center">
                {/* Brand Blue #005792 Sphere */}
                <motion.div 
                    animate={{ x: [0, 4, 0], y: [0, -4, 0] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#003B64] via-[#005792] to-cyan-400 border border-cyan-200/50 shadow-[0_16px_28px_-6px_rgba(0,87,146,0.5),_inset_0_3px_4px_rgba(255,255,255,0.4)] flex items-center justify-center -mr-4 relative z-10"
                >
                    {/* Inner glossy highlight */}
                    <div className="w-5 h-5 rounded-full bg-white/40 blur-[1px] absolute top-2 left-3" />
                </motion.div>

                {/* Rose Pink #EC4899 Sphere */}
                <motion.div 
                    animate={{ x: [0, -4, 0], y: [0, 4, 0] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#9D174D] via-[#EC4899] to-pink-300 border border-pink-200/50 shadow-[0_16px_28px_-6px_rgba(236,72,153,0.5),_inset_0_3px_4px_rgba(255,255,255,0.4)] flex items-center justify-center relative z-20"
                >
                    {/* Inner glossy highlight */}
                    <div className="w-5 h-5 rounded-full bg-white/40 blur-[1px] absolute top-2 left-3" />
                </motion.div>

                {/* Floating Partnership Node Pill */}
                <motion.div 
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
                    className="absolute -bottom-2 px-3 py-1 rounded-full bg-gradient-to-r from-[#005792] to-pink-500 text-white font-mono font-bold text-[10px] border border-white/50 shadow-[0_8px_16px_rgba(0,87,146,0.4)] z-30"
                >
                    B2B & CAMPUS
                </motion.div>
            </div>
        </div>
    );
}

// Map service slug to its 3D Visual component
const VISUAL_COMPONENTS = {
    'photography-videography': VisualPhotoVideo,
    'web-development': VisualWebDev,
    'langit-education': VisualEducation,
    'computer-service': VisualComputerService,
    'internship': VisualInternship,
    'sewa-alat': VisualRentalGear,
    'kolaborasi': VisualCollaboration,
};

/* ── MAIN 3D GLASS CARD COMPONENT ─────────────────────────────────────── */

export default function Glass3DServiceCard({
    service,
    index,
    accentColor,
    badge,
    isWide = false,
}) {
    const cardRef = useRef(null);
    const [isHovered, setIsHovered] = useState(false);
    const rafId = useRef(null);

    const config = DIVISION_CONFIG[service.slug] || {
        badge: badge || 'DIVISI SPESIALIS',
        accent: accentColor || '#005792',
        accentRgb: '0, 87, 146',
        tagline: service.tagline || 'Layanan Profesional Langit',
        desc: service.hero_config_json?.subtitle || 'Solusi terintegrasi berskala industri oleh spesialis Langit.',
    };

    const finalBadge = badge || config.badge;
    const finalAccent = accentColor || config.accent;
    const VisualWidget = VISUAL_COMPONENTS[service.slug] || VisualWebDev;

    // 3D Tilt motion values
    const rotateX = useMotionValue(0);
    const rotateY = useMotionValue(0);
    const springRotateX = useSpring(rotateX, { stiffness: 260, damping: 20 });
    const springRotateY = useSpring(rotateY, { stiffness: 260, damping: 20 });

    const handleMouseMove = useCallback((e) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (rafId.current) cancelAnimationFrame(rafId.current);

        rafId.current = requestAnimationFrame(() => {
            if (!cardRef.current) return;
            // Set CSS variables for cursor glare spotlight
            cardRef.current.style.setProperty('--mouse-x', `${x}px`);
            cardRef.current.style.setProperty('--mouse-y', `${y}px`);

            // Compute 3D tilt angles (clamped to [-8deg, 8deg])
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotX = ((y - centerY) / centerY) * -7;
            const rotY = ((x - centerX) / centerX) * 7;
            rotateX.set(rotX);
            rotateY.set(rotY);
        });
    }, [rotateX, rotateY]);

    const handleMouseEnter = () => {
        setIsHovered(true);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        if (rafId.current) cancelAnimationFrame(rafId.current);
        rotateX.set(0);
        rotateY.set(0);
    };

    useEffect(() => {
        return () => {
            if (rafId.current) cancelAnimationFrame(rafId.current);
        };
    }, []);

    return (
        <motion.div
            style={{
                perspective: 1200,
            }}
            className="w-full h-full"
        >
            <Link
                href={`/layanan/${service.slug}`}
                ref={cardRef}
                onMouseEnter={handleMouseEnter}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                className={`
                    group relative block w-full h-full rounded-[28px] sm:rounded-[32px] p-6 sm:p-7
                    transition-all duration-300 ease-out will-change-transform
                    flex flex-col justify-between overflow-hidden
                    backdrop-blur-2xl
                    ${isWide ? 'lg:flex-row lg:items-center lg:gap-8' : ''}
                `}
                style={{
                    /* 3D Glassmorphism with #005792 blue transparency requested by user */
                    background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.78) 0%, rgba(0, 87, 146, 0.08) 45%, rgba(0, 87, 146, 0.22) 100%)',
                    border: '1.5px solid rgba(0, 87, 146, 0.3)',
                    boxShadow: isHovered
                        ? '0 25px 50px -12px rgba(0, 87, 146, 0.38), inset 0 1.5px 1.5px 0 rgba(255, 255, 255, 0.8), inset 0 -1.5px 2px 0 rgba(0, 87, 146, 0.35)'
                        : '0 16px 36px -10px rgba(0, 87, 146, 0.22), inset 0 1.5px 1.5px 0 rgba(255, 255, 255, 0.6), inset 0 -1.5px 2px 0 rgba(0, 87, 146, 0.25)',
                    transform: isHovered ? 'translateY(-6px)' : 'translateY(0)',
                }}
            >
                {/* Dark mode override via inline CSS class detection */}
                <div 
                    className="absolute inset-0 pointer-events-none opacity-0 dark:opacity-100 transition-opacity duration-300 rounded-[28px] sm:rounded-[32px]"
                    style={{
                        background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.12) 0%, rgba(0, 87, 146, 0.25) 45%, rgba(0, 87, 146, 0.45) 100%)',
                        border: '1.5px solid rgba(255, 255, 255, 0.22)',
                        boxShadow: isHovered
                            ? '0 30px 60px -12px rgba(0, 87, 146, 0.55), inset 0 1.5px 1.5px 0 rgba(255, 255, 255, 0.4), inset 0 -1.5px 2px 0 rgba(0, 87, 146, 0.5)'
                            : '0 18px 40px -10px rgba(0, 0, 0, 0.6), inset 0 1.5px 1.5px 0 rgba(255, 255, 255, 0.25), inset 0 -1.5px 2px 0 rgba(0, 87, 146, 0.3)',
                    }}
                />

                {/* Glare spotlight following cursor on frosted glass */}
                <div
                    className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                        background: 'radial-gradient(400px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255, 255, 255, 0.22), transparent 70%)',
                    }}
                />

                {/* Corner ambient division glow */}
                <div
                    className="absolute -top-14 -right-14 w-36 h-36 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none"
                    style={{ backgroundColor: finalAccent }}
                />

                {isWide ? (
                    <div className="relative z-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                        <div className="lg:col-span-7 flex flex-col justify-between h-full">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span 
                                        className="text-[10px] sm:text-[11px] font-mono uppercase tracking-widest px-3 py-1 rounded-full font-bold border shadow-sm backdrop-blur-md"
                                        style={{
                                            backgroundColor: `${finalAccent}18`,
                                            color: finalAccent,
                                            borderColor: `${finalAccent}40`,
                                        }}
                                    >
                                        {finalBadge}
                                    </span>
                                    <span className="text-xs font-mono font-bold text-slate-400 dark:text-cyan-400/60">
                                        0{index + 1}
                                    </span>
                                </div>
                                <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white group-hover:text-[#005792] dark:group-hover:text-cyan-300 transition-colors tracking-tight">
                                    {service.name}
                                </h3>
                                <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-1">
                                    {service.tagline}
                                </p>
                                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mt-4 max-w-xl">
                                    {config.desc}
                                </p>
                            </div>

                            <div className="mt-6 pt-4 border-t border-[#005792]/15 dark:border-white/10 flex items-center justify-between">
                                <span 
                                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full font-bold text-xs shadow-md transition-all duration-200 group-hover:scale-105 active:scale-95"
                                    style={{
                                        background: `linear-gradient(135deg, ${finalAccent} 0%, #005792 100%)`,
                                        color: '#ffffff',
                                        boxShadow: `0 8px 18px -4px ${finalAccent}55`,
                                    }}
                                >
                                    <span>Buka Divisi Kemitraan</span>
                                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                </span>
                                <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 group-hover:text-[#005792] dark:group-hover:text-cyan-400 font-semibold transition-colors">
                                    Mulai Kolaborasi Kampus & B2B →
                                </span>
                            </div>
                        </div>

                        <div className="lg:col-span-5 flex items-center justify-center group-hover:scale-[1.04] transition-transform duration-300">
                            <VisualWidget />
                        </div>
                    </div>
                ) : (
                    <>
                        {/* 1. TOP HEADER: Category Pill & Title */}
                        <div className="relative z-10 mb-4">
                            <div className="flex items-center justify-between gap-2 mb-2">
                                <span 
                                    className="text-[10px] sm:text-[11px] font-mono uppercase tracking-widest px-3 py-1 rounded-full font-bold border shadow-sm backdrop-blur-md"
                                    style={{
                                        backgroundColor: `${finalAccent}18`,
                                        color: finalAccent,
                                        borderColor: `${finalAccent}40`,
                                    }}
                                >
                                    {finalBadge}
                                </span>

                                <span className="text-xs font-mono font-bold text-slate-400 dark:text-cyan-400/60">
                                    0{index + 1}
                                </span>
                            </div>

                            <h3 className="font-heading font-extrabold text-2xl sm:text-[26px] leading-tight text-slate-900 dark:text-white group-hover:text-[#005792] dark:group-hover:text-cyan-300 transition-colors tracking-tight">
                                {service.name}
                            </h3>
                            <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                                {service.tagline}
                            </p>
                        </div>

                        {/* 2. CENTERPIECE 3D VOLUMETRIC VISUAL */}
                        <div className="relative z-10 my-2 group-hover:scale-[1.03] transition-transform duration-300">
                            <VisualWidget />
                        </div>

                        {/* 3. BOTTOM: Description & Interactive Action Pill */}
                        <div className="relative z-10 mt-4 pt-3 border-t border-[#005792]/15 dark:border-white/10 flex flex-col justify-between">
                            <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed mb-4">
                                {config.desc}
                            </p>

                            <div className="flex items-center justify-between">
                                <span 
                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full font-bold text-xs shadow-md transition-all duration-200 group-hover:scale-105 active:scale-95"
                                    style={{
                                        background: `linear-gradient(135deg, ${finalAccent} 0%, #005792 100%)`,
                                        color: '#ffffff',
                                        boxShadow: `0 8px 18px -4px ${finalAccent}55`,
                                    }}
                                >
                                    <span>Buka Divisi</span>
                                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                </span>

                                <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 group-hover:text-[#005792] dark:group-hover:text-cyan-400 font-semibold transition-colors">
                                    Jelajahi →
                                </span>
                            </div>
                        </div>
                    </>
                )}
            </Link>
        </motion.div>
    );
}
