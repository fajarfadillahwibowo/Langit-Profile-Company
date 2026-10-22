import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, Sparkles, Terminal, FileSpreadsheet, Cpu, Bot, CheckCircle, Zap } from 'lucide-react';

export default function EducationTrack3DCards() {
    const [hoveredCard, setHoveredCard] = useState(null);

    const scrollToHub = (trackId) => {
        const el = document.getElementById('education-hub');
        if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-10 pt-2">
            {/* Section Header with subtle indicator */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-emerald-400">
                        3 Jalur Kejuruan Unggulan Praktik Industri
                    </span>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono hidden sm:inline-block">
                    Pilih jalur untuk eksplorasi kurikulum 3D Lab
                </span>
            </div>

            {/* 3 Colorful 3D Isometric Motion Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* ==============================================================
                    CARD 1: KURSUS CODING (ROBOTIK, WEB DEV & AI)
                    Palette: Vivid Coral Rose / Watermelon Pink (#FF4D6D / #F72585)
                   ============================================================== */}
                <motion.div
                    whileHover={{ y: -8, scale: 1.015 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                    onHoverStart={() => setHoveredCard(0)}
                    onHoverEnd={() => setHoveredCard(null)}
                    onClick={() => scrollToHub('coding')}
                    className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#FF4D6D] via-[#F72585] to-[#D90429] text-white p-7 sm:p-8 flex flex-col justify-between shadow-[0_20px_45px_-12px_rgba(247,37,133,0.45)] cursor-pointer group min-h-[460px] border border-white/20"
                >
                    {/* Background Ambient Glow & Light Flare */}
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/20 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />

                    {/* Top Content Area */}
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-3">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-[11px] font-mono font-bold tracking-wide border border-white/25 shadow-sm">
                                <Terminal className="w-3 h-3" />
                                <span>Track 01</span>
                            </span>
                            <div className="w-8 h-8 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-white group-hover:text-[#F72585] transition-colors duration-300 shadow-sm">
                                <ArrowUpRight className="w-4 h-4 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                            </div>
                        </div>

                        <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-white tracking-tight leading-snug drop-shadow-sm">
                            Kursus Coding
                        </h3>
                        <p className="text-white/90 font-mono text-xs font-semibold mt-1 flex items-center gap-1.5">
                            <Bot className="w-3.5 h-3.5 text-pink-200" />
                            Robotik / Web Dev / AI
                        </p>
                        <p className="text-white/85 text-xs leading-relaxed mt-2.5 max-w-[280px]">
                            Kuasai logika pemrograman, mikrokontroler robotik IoT, website modern React & integrasi otomasi kecerdasan buatan.
                        </p>
                    </div>

                    {/* 3D Isometric Stepped Stage with Animated Floating Screen & Code Elements */}
                    <div className="relative z-10 w-full h-56 mt-4 flex items-end justify-center pointer-events-none">
                        <svg viewBox="0 0 320 220" className="w-full h-full overflow-visible">
                            <defs>
                                {/* Shadow Filters */}
                                <filter id="clayShadowPink" x="-20%" y="-20%" width="160%" height="160%">
                                    <feDropShadow dx="0" dy="12" stdDeviation="14" floodColor="#900C3F" floodOpacity="0.45" />
                                </filter>
                                <filter id="glowPink" x="-30%" y="-30%" width="160%" height="160%">
                                    <feGaussianBlur stdDeviation="6" result="blur" />
                                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                </filter>

                                {/* Podium Gradients */}
                                <linearGradient id="podiumWhiteTop" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#FFFFFF" />
                                    <stop offset="100%" stopColor="#E2E8F0" />
                                </linearGradient>
                                <linearGradient id="podiumWhiteFront" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stopColor="#E2E8F0" />
                                    <stop offset="100%" stopColor="#CBD5E1" />
                                </linearGradient>
                                <linearGradient id="podiumWhiteSide" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#94A3B8" />
                                    <stop offset="100%" stopColor="#64748B" />
                                </linearGradient>

                                {/* Pink Tier Slab */}
                                <linearGradient id="podiumPinkTop" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#FF758F" />
                                    <stop offset="100%" stopColor="#FF4D6D" />
                                </linearGradient>
                                <linearGradient id="podiumPinkFront" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stopColor="#C9184A" />
                                    <stop offset="100%" stopColor="#800F2F" />
                                </linearGradient>

                                {/* 3D Glass Device Frame */}
                                <linearGradient id="deviceFrame" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#2B2D42" />
                                    <stop offset="100%" stopColor="#111827" />
                                </linearGradient>
                            </defs>

                            {/* Base Ambient Occlusion Floor Shadow */}
                            <ellipse cx="160" cy="195" rx="115" ry="22" fill="#59001A" opacity="0.4" />

                            {/* --- 3D ISO BLOCK 1 (Lower White Platform) --- */}
                            <g filter="url(#clayShadowPink)">
                                {/* Top Face */}
                                <polygon points="120,130 200,130 240,155 160,155" fill="url(#podiumWhiteTop)" />
                                {/* Front Face */}
                                <polygon points="120,130 160,155 160,185 120,160" fill="url(#podiumWhiteFront)" />
                                {/* Right Face */}
                                <polygon points="160,155 240,155 240,185 160,185" fill="url(#podiumWhiteSide)" />
                            </g>

                            {/* --- 3D ISO BLOCK 2 (Stepped Pink Slab, matching reference image) --- */}
                            <g>
                                {/* Left Support Block */}
                                <polygon points="75,145 135,145 155,160 95,160" fill="#FFFFFF" />
                                <polygon points="75,145 95,160 95,188 75,173" fill="#E2E8F0" />
                                <polygon points="95,160 155,160 155,188 95,188" fill="#CBD5E1" />

                                {/* Upper Pink Pedestal */}
                                <polygon points="85,125 185,125 210,143 110,143" fill="url(#podiumPinkTop)" />
                                <polygon points="85,125 110,143 110,153 85,135" fill="url(#podiumPinkFront)" />
                                <polygon points="110,143 210,143 210,153 110,153" fill="#A4133C" />
                            </g>

                            {/* --- ANIMATED FLOATING 3D GLASS SCREEN & ROBOTIC EYE (Exact reference vibe) --- */}
                            <motion.g
                                animate={{ 
                                    y: [0, -10, 0],
                                    rotateZ: [0, 1.5, 0, -1.5, 0]
                                }}
                                transition={{ 
                                    duration: 4, 
                                    repeat: Infinity, 
                                    ease: "easeInOut" 
                                }}
                            >
                                {/* Floating Shadow on the pink slab */}
                                <ellipse cx="148" cy="133" rx="42" ry="9" fill="#59001A" opacity="0.35" />

                                {/* 3D Beveled Device Housing */}
                                <rect x="112" y="48" width="75" height="72" rx="18" fill="url(#deviceFrame)" filter="url(#clayShadowPink)" />
                                
                                {/* 3D Side Depth Accent */}
                                <rect x="180" y="54" width="7" height="60" rx="3" fill="#1F2430" />
                                <circle cx="184" cy="74" r="3.5" fill="#FF4D6D" />

                                {/* Screen Gloss Glass Front */}
                                <rect x="117" y="53" width="65" height="62" rx="14" fill="#0D1117" stroke="#30363D" strokeWidth="2" />
                                
                                {/* Glowing Code Terminal / AI Robot Icon */}
                                <polygon points="144,70 144,98 165,84" fill="#FF4D6D" filter="url(#glowPink)" />
                                <rect x="127" y="62" width="10" height="2.5" rx="1" fill="#48CAE4" />
                                <rect x="140" y="62" width="6" height="2.5" rx="1" fill="#FFB703" />
                                <rect x="149" y="62" width="6" height="2.5" rx="1" fill="#52B788" />

                                {/* Code Glyphs */}
                                <text x="128" y="103" fontFamily="monospace" fontSize="8" fill="#48CAE4" fontWeight="bold">const ai = 1</text>
                            </motion.g>

                            {/* Floating Satellite Particles */}
                            <motion.g
                                animate={{ y: [0, -12, 0], x: [0, 4, 0] }}
                                transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
                            >
                                <circle cx="85" cy="80" r="14" fill="#FFFFFF" filter="url(#clayShadowPink)" />
                                <text x="80" y="84" fontFamily="monospace" fontSize="11" fill="#F72585" fontWeight="bold">&lt;/&gt;</text>
                            </motion.g>

                            <motion.g
                                animate={{ y: [0, -8, 0], x: [0, -4, 0] }}
                                transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut", delay: 0.7 }}
                            >
                                <rect x="205" y="85" width="26" height="26" rx="8" fill="#FFB703" filter="url(#clayShadowPink)" />
                                <text x="211" y="102" fontFamily="sans-serif" fontSize="12" fill="#1E293B" fontWeight="bold">AI</text>
                            </motion.g>
                        </svg>
                    </div>

                    {/* Bottom Feature Pill Badge */}
                    <div className="relative z-10 pt-3 border-t border-white/20 flex items-center justify-between text-[11px] font-mono text-white/90">
                        <span className="flex items-center gap-1.5 font-bold">
                            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                            10 Minggu Praktik Ril
                        </span>
                        <span className="underline decoration-white/50 underline-offset-4 group-hover:text-white transition-colors">
                            Lihat Silabus &rarr;
                        </span>
                    </div>
                </motion.div>


                {/* ==============================================================
                    CARD 2: KURSUS OFFICE (MICROSOFT & GOOGLE WORKSPACE)
                    Palette: Vivid Jade Mint / Emerald Teal (#06D6A0 / #2EC4B6)
                   ============================================================== */}
                <motion.div
                    whileHover={{ y: -8, scale: 1.015 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                    onHoverStart={() => setHoveredCard(1)}
                    onHoverEnd={() => setHoveredCard(null)}
                    onClick={() => scrollToHub('office')}
                    className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#06D6A0] via-[#059669] to-[#046C4E] text-white p-7 sm:p-8 flex flex-col justify-between shadow-[0_20px_45px_-12px_rgba(6,214,160,0.45)] cursor-pointer group min-h-[460px] border border-white/20"
                >
                    {/* Background Ambient Glow & Light Flare */}
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/20 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />

                    {/* Top Content Area */}
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-3">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-[11px] font-mono font-bold tracking-wide border border-white/25 shadow-sm">
                                <FileSpreadsheet className="w-3 h-3" />
                                <span>Track 02</span>
                            </span>
                            <div className="w-8 h-8 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-white group-hover:text-[#059669] transition-colors duration-300 shadow-sm">
                                <ArrowUpRight className="w-4 h-4 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                            </div>
                        </div>

                        <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-white tracking-tight leading-snug drop-shadow-sm">
                            Kursus Office
                        </h3>
                        <p className="text-white/90 font-mono text-xs font-semibold mt-1 flex items-center gap-1.5">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-200" />
                            MS Office & Google Workspace
                        </p>
                        <p className="text-white/85 text-xs leading-relaxed mt-2.5 max-w-[280px]">
                            Standar administrasi korporat: formula Excel canggih, surat massal Word, presentasi PowerPoint modern & automasi cloud.
                        </p>
                    </div>

                    {/* 3D Isometric Cylindrical Tiered Stage (Matching Card 3 in reference image!) */}
                    <div className="relative z-10 w-full h-56 mt-4 flex items-end justify-center pointer-events-none">
                        <svg viewBox="0 0 320 220" className="w-full h-full overflow-visible">
                            <defs>
                                <filter id="clayShadowMint" x="-20%" y="-20%" width="160%" height="160%">
                                    <feDropShadow dx="0" dy="12" stdDeviation="14" floodColor="#023826" floodOpacity="0.4" />
                                </filter>
                                <filter id="glowMint" x="-30%" y="-30%" width="160%" height="160%">
                                    <feGaussianBlur stdDeviation="8" result="blur" />
                                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                </filter>

                                {/* Cylindrical Gradients */}
                                <linearGradient id="cylinderWhiteTop" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#FFFFFF" />
                                    <stop offset="100%" stopColor="#E2E8F0" />
                                </linearGradient>
                                <linearGradient id="cylinderWhiteBody" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stopColor="#CBD5E1" />
                                    <stop offset="100%" stopColor="#94A3B8" />
                                </linearGradient>

                                <linearGradient id="cylinderMintTop" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#34D399" />
                                    <stop offset="100%" stopColor="#059669" />
                                </linearGradient>
                                <linearGradient id="cylinderMintBody" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stopColor="#047857" />
                                    <stop offset="100%" stopColor="#064E3B" />
                                </linearGradient>

                                <linearGradient id="bulbGlass" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#FEF08A" />
                                    <stop offset="100%" stopColor="#FACC15" />
                                </linearGradient>
                            </defs>

                            {/* Floor Shadow */}
                            <ellipse cx="160" cy="195" rx="110" ry="20" fill="#01281B" opacity="0.4" />

                            {/* --- 3D TIER 1: Lower White Curved Cylinder Base --- */}
                            <g filter="url(#clayShadowMint)">
                                <path d="M70,150 L70,175 A90,26 0 0,0 250,175 L250,150 Z" fill="url(#cylinderWhiteBody)" />
                                <ellipse cx="160" cy="150" rx="90" ry="24" fill="url(#cylinderWhiteTop)" />
                            </g>

                            {/* --- 3D TIER 2: Mint/Emerald Cylinder Column --- */}
                            <g>
                                <path d="M105,115 L105,150 A55,18 0 0,0 215,150 L215,115 Z" fill="url(#cylinderMintBody)" />
                                <ellipse cx="160" cy="115" rx="55" ry="17" fill="url(#cylinderMintTop)" />
                            </g>

                            {/* --- ANIMATED FLOATING 3D LIGHTBULB / SPREADSHEET CUBE (Exact reference visual) --- */}
                            <motion.g
                                animate={{ 
                                    y: [0, -11, 0],
                                    rotateZ: [0, -2, 0, 2, 0]
                                }}
                                transition={{ 
                                    duration: 3.6, 
                                    repeat: Infinity, 
                                    ease: "easeInOut" 
                                }}
                            >
                                {/* Shadow on mint cylinder */}
                                <ellipse cx="160" cy="116" rx="28" ry="9" fill="#022E20" opacity="0.4" />

                                {/* 3D Bulb Base Fitting */}
                                <rect x="150" y="85" width="20" height="14" rx="3" fill="#E2E8F0" />
                                <rect x="153" y="90" width="14" height="2" fill="#94A3B8" />
                                <rect x="153" y="94" width="14" height="2" fill="#94A3B8" />

                                {/* 3D Glowing Bulb Glass */}
                                <circle cx="160" cy="62" r="26" fill="url(#bulbGlass)" filter="url(#clayShadowMint)" />
                                <circle cx="160" cy="62" r="22" fill="#FEF9C3" opacity="0.8" />
                                
                                {/* Electric Lightning Filament */}
                                <motion.path
                                    animate={{ opacity: [0.7, 1, 0.7] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                    d="M162,50 L154,64 L161,64 L157,76 L169,60 L162,60 Z"
                                    fill="#EAB308"
                                    filter="url(#glowMint)"
                                />
                            </motion.g>

                            {/* 3D Isometric Bar Chart Towers Floating alongside */}
                            <motion.g
                                animate={{ y: [0, -7, 0] }}
                                transition={{ duration: 3.1, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                            >
                                {/* Bar 1 (Green) */}
                                <polygon points="85,115 102,115 109,121 92,121" fill="#6EE7B7" />
                                <polygon points="85,115 92,121 92,142 85,136" fill="#10B981" />
                                <polygon points="92,121 109,121 109,142 92,142" fill="#047857" />

                                {/* Bar 2 (Yellow) */}
                                <polygon points="215,95 232,95 239,101 222,101" fill="#FDE047" />
                                <polygon points="215,95 222,101 222,135 215,129" fill="#EAB308" />
                                <polygon points="222,101 239,101 239,135 222,135" fill="#CA8A04" />
                            </motion.g>

                            {/* Floating Analytics Spark */}
                            <motion.g
                                animate={{ rotate: [0, 15, -15, 0], scale: [0.95, 1.05, 0.95] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            >
                                <circle cx="230" cy="55" r="14" fill="#FFFFFF" filter="url(#clayShadowMint)" />
                                <text x="224" y="60" fontFamily="sans-serif" fontSize="13" fill="#059669" fontWeight="bold">📊</text>
                            </motion.g>
                        </svg>
                    </div>

                    {/* Bottom Feature Pill Badge */}
                    <div className="relative z-10 pt-3 border-t border-white/20 flex items-center justify-between text-[11px] font-mono text-white/90">
                        <span className="flex items-center gap-1.5 font-bold">
                            <Sparkles className="w-3.5 h-3.5 text-yellow-200" />
                            6 Minggu Langsung Mahir
                        </span>
                        <span className="underline decoration-white/50 underline-offset-4 group-hover:text-white transition-colors">
                            Lihat Silabus &rarr;
                        </span>
                    </div>
                </motion.div>


                {/* ==============================================================
                    CARD 3: KURSUS RAKIT KOMPUTER (HARDWARE LAB & DIAGNOSTIC)
                    Palette: Vivid Royal Purple / Electric Violet (#6C5CE7 / #7C3AED)
                   ============================================================== */}
                <motion.div
                    whileHover={{ y: -8, scale: 1.015 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                    onHoverStart={() => setHoveredCard(2)}
                    onHoverEnd={() => setHoveredCard(null)}
                    onClick={() => scrollToHub('hardware')}
                    className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#7C3AED] via-[#6C5CE7] to-[#4338CA] text-white p-7 sm:p-8 flex flex-col justify-between shadow-[0_20px_45px_-12px_rgba(108,92,231,0.45)] cursor-pointer group min-h-[460px] border border-white/20"
                >
                    {/* Background Ambient Glow & Light Flare */}
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/20 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />

                    {/* Top Content Area */}
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-3">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-[11px] font-mono font-bold tracking-wide border border-white/25 shadow-sm">
                                <Cpu className="w-3 h-3" />
                                <span>Track 03</span>
                            </span>
                            <div className="w-8 h-8 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-white group-hover:text-[#6C5CE7] transition-colors duration-300 shadow-sm">
                                <ArrowUpRight className="w-4 h-4 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                            </div>
                        </div>

                        <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-white tracking-tight leading-snug drop-shadow-sm">
                            Kursus Rakit PC
                        </h3>
                        <p className="text-white/90 font-mono text-xs font-semibold mt-1 flex items-center gap-1.5">
                            <Zap className="w-3.5 h-3.5 text-yellow-300" />
                            Hardware Lab & Diagnostic
                        </p>
                        <p className="text-white/85 text-xs leading-relaxed mt-2.5 max-w-[280px]">
                            Praktik rakit komputer dari nol, manajemen kabel estetik, penanganan motherboard no-display & micro-soldering.
                        </p>
                    </div>

                    {/* 3D Isometric Stepped Stage with Animated Rotating Fan & CPU Chip */}
                    <div className="relative z-10 w-full h-56 mt-4 flex items-end justify-center pointer-events-none">
                        <svg viewBox="0 0 320 220" className="w-full h-full overflow-visible">
                            <defs>
                                <filter id="clayShadowPurple" x="-20%" y="-20%" width="160%" height="160%">
                                    <feDropShadow dx="0" dy="12" stdDeviation="14" floodColor="#240046" floodOpacity="0.45" />
                                </filter>
                                <filter id="glowPurple" x="-30%" y="-30%" width="160%" height="160%">
                                    <feGaussianBlur stdDeviation="7" result="blur" />
                                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                </filter>

                                {/* Podium Gradients */}
                                <linearGradient id="podiumPurpTop" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#A78BFA" />
                                    <stop offset="100%" stopColor="#7C3AED" />
                                </linearGradient>
                                <linearGradient id="podiumPurpFront" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stopColor="#6D28D9" />
                                    <stop offset="100%" stopColor="#4C1D95" />
                                </linearGradient>
                                <linearGradient id="cpuGold" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#FDE047" />
                                    <stop offset="100%" stopColor="#CA8A04" />
                                </linearGradient>
                            </defs>

                            {/* Floor Shadow */}
                            <ellipse cx="160" cy="195" rx="115" ry="22" fill="#1E0038" opacity="0.45" />

                            {/* --- 3D ISO BLOCK 1 (Lower White Platform) --- */}
                            <g filter="url(#clayShadowPurple)">
                                <polygon points="120,130 200,130 240,155 160,155" fill="url(#podiumWhiteTop)" />
                                <polygon points="120,130 160,155 160,185 120,160" fill="url(#podiumWhiteFront)" />
                                <polygon points="160,155 240,155 240,185 160,185" fill="url(#podiumWhiteSide)" />
                            </g>

                            {/* --- 3D ISO BLOCK 2 (Stepped Purple Slab) --- */}
                            <g>
                                <polygon points="80,140 135,140 155,155 100,155" fill="#FFFFFF" />
                                <polygon points="80,140 100,155 100,182 80,167" fill="#E2E8F0" />
                                <polygon points="100,155 155,155 155,182 100,182" fill="#CBD5E1" />

                                <polygon points="90,122 195,122 220,140 115,140" fill="url(#podiumPurpTop)" />
                                <polygon points="90,122 115,140 115,152 90,134" fill="url(#podiumPurpFront)" />
                                <polygon points="115,140 220,140 220,152 115,152" fill="#3B0764" />
                            </g>

                            {/* --- ANIMATED FLOATING 3D CPU PROCESSOR & COOLING FAN --- */}
                            <motion.g
                                animate={{ 
                                    y: [0, -10, 0],
                                    rotateZ: [0, 1.8, 0, -1.8, 0]
                                }}
                                transition={{ 
                                    duration: 3.8, 
                                    repeat: Infinity, 
                                    ease: "easeInOut" 
                                }}
                            >
                                {/* Shadow on purple platform */}
                                <ellipse cx="155" cy="132" rx="40" ry="10" fill="#240046" opacity="0.4" />

                                {/* 3D CPU Substrate PCB */}
                                <polygon points="120,78 190,78 210,95 140,95" fill="#047857" />
                                <polygon points="120,78 140,95 140,100 120,83" fill="#064E3B" />
                                <polygon points="140,95 210,95 210,100 140,100" fill="#022C22" />

                                {/* Metallic Integrated Heat Spreader (IHS) */}
                                <polygon points="130,70 180,70 196,84 146,84" fill="#E2E8F0" />
                                <polygon points="130,70 146,84 146,89 130,75" fill="#94A3B8" />
                                <polygon points="146,84 196,84 196,89 146,89" fill="#64748B" />

                                {/* Gold Core Center */}
                                <rect x="145" y="73" width="35" height="10" rx="2" fill="url(#cpuGold)" />
                                <text x="150" y="81" fontFamily="sans-serif" fontSize="7" fill="#451A03" fontWeight="bold">LANGIT i9</text>

                                {/* 3D High-Tech Animated Rotating Cooling Fan above CPU */}
                                <g transform="translate(162, 52)">
                                    {/* Neon Outer Fan Shroud Ring */}
                                    <circle cx="0" cy="0" r="26" fill="#1E1B4B" stroke="#A78BFA" strokeWidth="2.5" filter="url(#clayShadowPurple)" />
                                    <circle cx="0" cy="0" r="22" fill="#0F172A" />

                                    {/* Rotating 4-Blade Impeller */}
                                    <motion.g
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
                                    >
                                        <path d="M0,0 L-6,-18 A7,7 0 0,1 6,-18 Z" fill="#C4B5FD" />
                                        <path d="M0,0 L18,-6 A7,7 0 0,1 18,6 Z" fill="#A78BFA" />
                                        <path d="M0,0 L6,18 A7,7 0 0,1 -6,18 Z" fill="#8B5CF6" />
                                        <path d="M0,0 L-18,6 A7,7 0 0,1 -18,-6 Z" fill="#7C3AED" />
                                        <circle cx="0" cy="0" r="5" fill="#FDE047" />
                                    </motion.g>
                                </g>
                            </motion.g>

                            {/* Floating Hardware Screwdriver & Chip Tool */}
                            <motion.g
                                animate={{ y: [0, -11, 0], rotate: [0, 8, -8, 0] }}
                                transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
                            >
                                <circle cx="85" cy="82" r="14" fill="#FFFFFF" filter="url(#clayShadowPurple)" />
                                <text x="79" y="87" fontFamily="sans-serif" fontSize="12" fill="#7C3AED" fontWeight="bold">⚡</text>
                            </motion.g>

                            <motion.g
                                animate={{ y: [0, -9, 0], x: [0, 3, 0] }}
                                transition={{ duration: 4.1, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
                            >
                                <rect x="220" y="80" width="26" height="26" rx="8" fill="#FBBF24" filter="url(#clayShadowPurple)" />
                                <text x="226" y="97" fontFamily="sans-serif" fontSize="13" fill="#1E1B4B" fontWeight="bold">🛠️</text>
                            </motion.g>
                        </svg>
                    </div>

                    {/* Bottom Feature Pill Badge */}
                    <div className="relative z-10 pt-3 border-t border-white/20 flex items-center justify-between text-[11px] font-mono text-white/90">
                        <span className="flex items-center gap-1.5 font-bold">
                            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                            4 Minggu Praktik Lab
                        </span>
                        <span className="underline decoration-white/50 underline-offset-4 group-hover:text-white transition-colors">
                            Lihat Silabus &rarr;
                        </span>
                    </div>
                </motion.div>

            </div>
        </section>
    );
}
