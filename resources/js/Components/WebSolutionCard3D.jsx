import React, { useRef, useState, useCallback, useEffect } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';
import { Link } from '@inertiajs/react';
import { 
    CheckCircle2, ArrowRight, Sparkles, ShieldCheck, 
    CreditCard, QrCode, Cpu, Zap, Activity, Clock, Layers
} from 'lucide-react';

/* ── 3D VISUAL ILLUSTRATION WIDGETS (Matching Bogdan Zhuk 3D Cards Reference) ── */

// 01. Enterprise & ERP Widget
function VisualEnterprise({ color }) {
    return (
        <div className="relative w-full h-28 rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900/90 via-slate-950 to-slate-900 border border-sky-500/20 flex items-center justify-center p-3 select-none">
            {/* Ambient colored glow */}
            <div className="absolute w-24 h-24 rounded-full bg-sky-500/20 blur-xl pointer-events-none" />
            
            {/* 3D Dashboard Slab */}
            <div className="relative z-10 w-full max-w-[210px] rounded-xl bg-slate-800/80 backdrop-blur-md border border-sky-400/30 p-2.5 shadow-[0_12px_24px_rgba(0,0,0,0.5)]">
                <div className="flex items-center justify-between border-b border-white/10 pb-1.5 mb-2">
                    <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                        <span className="text-[10px] font-mono font-bold text-sky-300">ERP_CORE // ACTIVE</span>
                    </div>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 font-bold border border-sky-400/30">
                        KPI 99.4%
                    </span>
                </div>

                {/* 3 Data Metric Bars */}
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[9px] font-mono text-slate-400">
                        <span>Database Sync</span>
                        <span className="text-emerald-400 font-bold">0.8ms</span>
                    </div>
                    <div className="w-full h-1 bg-slate-700/80 rounded-full overflow-hidden">
                        <motion.div 
                            animate={{ width: ['40%', '95%', '70%', '95%'] }}
                            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                            className="h-full bg-gradient-to-r from-sky-400 to-emerald-400 rounded-full"
                        />
                    </div>
                </div>
            </div>

            {/* Floating 3D Badge */}
            <motion.div 
                animate={{ y: [0, -5, 0], rotate: [-2, 3, -2] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -right-2 top-2 px-2 py-0.5 rounded-lg bg-sky-500 text-slate-950 font-mono font-black text-[9px] shadow-lg shadow-sky-500/40 border border-sky-200"
            >
                APPROVAL OK
            </motion.div>
        </div>
    );
}

// 02. Corporate Branding Widget
function VisualCompanyProfile({ color }) {
    return (
        <div className="relative w-full h-28 rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-950/90 via-slate-950 to-purple-950/80 border border-indigo-500/20 flex items-center justify-center p-3 select-none">
            <div className="absolute w-24 h-24 rounded-full bg-indigo-500/25 blur-xl pointer-events-none" />

            {/* Iridescent Corporate Glass Slab */}
            <div className="relative z-10 w-full max-w-[210px] rounded-xl bg-gradient-to-br from-white/10 via-indigo-500/10 to-purple-500/20 backdrop-blur-md border border-indigo-300/30 p-3 shadow-[0_12px_24px_rgba(0,0,0,0.5)]">
                <div className="flex items-center justify-between mb-2">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-[10px] font-black shadow-md">
                        L
                    </div>
                    <div className="flex items-center gap-1 text-[9px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                        <span>BILINGUAL ID/EN</span>
                    </div>
                </div>

                <div className="space-y-1">
                    <div className="w-20 h-1.5 rounded bg-white/40" />
                    <div className="w-32 h-1.5 rounded bg-white/20" />
                </div>
            </div>

            {/* Floating Gold Crown/Award Chip */}
            <motion.div 
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
                className="absolute -left-1 bottom-2 px-2 py-0.5 rounded-lg bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-950 font-mono font-bold text-[9px] shadow-md border border-amber-200"
            >
                PREMIUM BENTO
            </motion.div>
        </div>
    );
}

// 03. EdTech & SIAKAD Widget
function VisualEdTech({ color }) {
    return (
        <div className="relative w-full h-28 rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-950/90 via-slate-950 to-teal-950/80 border border-emerald-500/20 flex items-center justify-center p-3 select-none">
            <div className="absolute w-24 h-24 rounded-full bg-emerald-500/20 blur-xl pointer-events-none" />

            {/* 3D Student Holographic ID Card */}
            <div className="relative z-10 w-full max-w-[210px] rounded-xl bg-slate-900/90 backdrop-blur-md border border-emerald-400/30 p-2.5 shadow-[0_12px_24px_rgba(0,0,0,0.5)] flex items-center gap-3">
                {/* QR Scanner Area with Laser Line */}
                <div className="relative w-12 h-12 rounded-lg bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center overflow-hidden shrink-0">
                    <QrCode className="w-7 h-7 text-emerald-400" />
                    <motion.div 
                        animate={{ y: [-18, 18, -18] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        className="absolute inset-x-0 h-0.5 bg-emerald-300 shadow-[0_0_8px_#34d399]"
                    />
                </div>

                <div className="space-y-1">
                    <div className="text-[10px] font-mono font-bold text-white leading-tight">
                        PORTAL SIAKAD
                    </div>
                    <div className="flex items-center gap-1 text-[9px] font-mono text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Presensi QR Auto</span>
                    </div>
                </div>
            </div>

            {/* Floating Live Time badge */}
            <motion.div 
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute right-2 top-2 px-2 py-0.5 rounded-lg bg-emerald-500 text-slate-950 font-mono font-bold text-[9px] shadow-md border border-emerald-200"
            >
                HADIR: 07:14
            </motion.div>
        </div>
    );
}

// 04. Online Retail & E-Commerce Widget (DIRECT HOMAGE TO BOGDAN ZHUK PINTEREST REFERENCE!)
function VisualECommerce({ color }) {
    return (
        <div className="relative w-full h-28 rounded-2xl overflow-hidden bg-gradient-to-br from-amber-950/80 via-slate-950 to-orange-950/80 border border-amber-500/20 flex items-center justify-center p-3 select-none">
            <div className="absolute w-28 h-28 rounded-full bg-amber-500/25 blur-xl pointer-events-none" />

            {/* 3D Bank/Payment Card in Bogdan Zhuk Style */}
            <motion.div 
                whileHover={{ scale: 1.05, rotateZ: -1 }}
                className="relative z-10 w-full max-w-[210px] rounded-xl bg-gradient-to-tr from-amber-600 via-orange-600 to-yellow-500 p-2.5 shadow-[0_16px_32px_rgba(245,158,11,0.35)] border border-amber-300/40 text-white"
            >
                <div className="flex items-center justify-between mb-2">
                    {/* Metallic EMV Chip */}
                    <div className="w-5 h-3.5 rounded-sm bg-gradient-to-br from-yellow-200 via-amber-300 to-yellow-500 border border-amber-100 shadow-inner" />
                    <CreditCard className="w-4 h-4 text-white/90" />
                </div>

                <div className="font-mono text-[9px] tracking-widest text-amber-100 mb-1">
                    •••• 8829
                </div>

                <div className="flex items-center justify-between text-[8px] font-mono text-amber-200">
                    <span>INSTANT QRIS / VA</span>
                    <span className="font-bold text-white">AUTO GATEWAY</span>
                </div>
            </motion.div>

            {/* Floating Price Pill */}
            <motion.div 
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut', delay: 0.1 }}
                className="absolute -right-1 bottom-2 px-2 py-0.5 rounded-lg bg-slate-900/90 text-amber-300 font-mono font-bold text-[9px] shadow-lg border border-amber-500/40"
            >
                1-STEP CHECKOUT
            </motion.div>
        </div>
    );
}

// 05. Scheduling & Booking Hub Widget
function VisualBooking({ color }) {
    return (
        <div className="relative w-full h-28 rounded-2xl overflow-hidden bg-gradient-to-br from-pink-950/80 via-slate-950 to-rose-950/80 border border-pink-500/20 flex items-center justify-center p-3 select-none">
            <div className="absolute w-24 h-24 rounded-full bg-pink-500/20 blur-xl pointer-events-none" />

            {/* 3D Interactive Calendar Slot Block */}
            <div className="relative z-10 w-full max-w-[210px] rounded-xl bg-slate-900/90 backdrop-blur-md border border-pink-400/30 p-2.5 shadow-[0_12px_24px_rgba(0,0,0,0.5)]">
                <div className="flex items-center justify-between border-b border-white/10 pb-1 mb-2 text-[9px] font-mono text-pink-300">
                    <span className="font-bold">SLOT RESERVASI</span>
                    <span className="text-emerald-400">AVAILABLE</span>
                </div>

                {/* 3 Time Slots */}
                <div className="grid grid-cols-3 gap-1.5 text-center">
                    <div className="py-1 px-1 rounded bg-slate-800 text-[9px] font-mono text-slate-400 line-through">09:00</div>
                    <div className="py-1 px-1 rounded bg-gradient-to-r from-pink-500 to-rose-500 text-[9px] font-mono font-bold text-white shadow-sm ring-1 ring-pink-300">13:00</div>
                    <div className="py-1 px-1 rounded bg-slate-800 text-[9px] font-mono text-slate-300">16:30</div>
                </div>
            </div>

            {/* Floating WA Reminder Pin */}
            <motion.div 
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute right-2 top-2 px-2 py-0.5 rounded-lg bg-pink-500 text-white font-mono font-bold text-[9px] shadow-md border border-pink-200"
            >
                WA REMINDER OK
            </motion.div>
        </div>
    );
}

// 06. Publishing & Media Widget
function VisualPublishing({ color }) {
    return (
        <div className="relative w-full h-28 rounded-2xl overflow-hidden bg-gradient-to-br from-violet-950/80 via-slate-950 to-purple-950/80 border border-violet-500/20 flex items-center justify-center p-3 select-none">
            <div className="absolute w-24 h-24 rounded-full bg-violet-500/20 blur-xl pointer-events-none" />

            {/* 3D Digital Magazine Article Mock */}
            <div className="relative z-10 w-full max-w-[210px] rounded-xl bg-slate-900/90 backdrop-blur-md border border-violet-400/30 p-2.5 shadow-[0_12px_24px_rgba(0,0,0,0.5)]">
                <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[9px] font-mono font-bold text-violet-300 uppercase">Google News Ready</span>
                    <span className="w-2 h-2 rounded-full bg-violet-400 animate-ping" />
                </div>
                <div className="w-full h-1.5 bg-violet-500/20 rounded-full mb-1">
                    <motion.div 
                        animate={{ width: ['20%', '80%', '50%', '80%'] }}
                        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                        className="h-full bg-violet-400 rounded-full"
                    />
                </div>
                <div className="text-[9px] font-mono text-slate-400 flex items-center justify-between">
                    <span>AMP Cache Speed</span>
                    <span className="text-violet-300 font-bold">&lt;0.5s</span>
                </div>
            </div>

            {/* Floating Live Feed Badge */}
            <motion.div 
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute left-2 -top-1 px-2 py-0.5 rounded-lg bg-gradient-to-r from-violet-500 to-purple-600 text-white font-mono font-bold text-[9px] shadow-md border border-violet-200"
            >
                AUTO CMS
            </motion.div>
        </div>
    );
}

// 07. High-Converting Landing Page Widget
function VisualLandingPage({ color }) {
    return (
        <div className="relative w-full h-28 rounded-2xl overflow-hidden bg-gradient-to-br from-teal-950/80 via-slate-950 to-emerald-950/80 border border-teal-500/20 flex items-center justify-center p-3 select-none">
            <div className="absolute w-24 h-24 rounded-full bg-teal-500/20 blur-xl pointer-events-none" />

            {/* 3D Rocket Speed Gauge Slab */}
            <div className="relative z-10 w-full max-w-[210px] rounded-xl bg-slate-900/90 backdrop-blur-md border border-teal-400/30 p-2.5 shadow-[0_12px_24px_rgba(0,0,0,0.5)]">
                <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[9px] font-mono font-bold text-teal-300">CORE WEB VITALS</span>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-teal-500/20 text-teal-300 font-bold">99/100</span>
                </div>
                <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
                    <span className="text-xs font-mono font-extrabold text-white">Load Time: 0.4s</span>
                </div>
            </div>

            {/* Floating Conversion Chip */}
            <motion.div 
                animate={{ y: [0, -5, 0], scale: [1, 1.04, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute right-2 -bottom-1 px-2 py-0.5 rounded-lg bg-gradient-to-r from-teal-400 to-emerald-500 text-slate-950 font-mono font-black text-[9px] shadow-md border border-teal-100"
            >
                HIGH CONVERSION
            </motion.div>
        </div>
    );
}

// 08. Custom SaaS & Scalable Software Widget
function VisualSaaS({ color }) {
    return (
        <div className="relative w-full h-28 rounded-2xl overflow-hidden bg-gradient-to-br from-orange-950/80 via-slate-950 to-red-950/80 border border-orange-500/20 flex items-center justify-center p-3 select-none">
            <div className="absolute w-24 h-24 rounded-full bg-orange-500/20 blur-xl pointer-events-none" />

            {/* 3D Server Node Cluster */}
            <div className="relative z-10 w-full max-w-[210px] rounded-xl bg-slate-900/90 backdrop-blur-md border border-orange-400/30 p-2.5 shadow-[0_12px_24px_rgba(0,0,0,0.5)]">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] font-mono font-bold text-orange-300">MICROSERVICES API</span>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="grid grid-cols-3 gap-1">
                    <div className="h-2 rounded bg-orange-500/30 border border-orange-400/40" />
                    <div className="h-2 rounded bg-orange-500/30 border border-orange-400/40" />
                    <div className="h-2 rounded bg-emerald-500/40 border border-emerald-400/40" />
                </div>
            </div>

            {/* Floating OWASP Badge */}
            <motion.div 
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute left-2 -top-1 px-2 py-0.5 rounded-lg bg-orange-500 text-white font-mono font-bold text-[9px] shadow-md border border-orange-200"
            >
                OWASP ENCRYPTED
            </motion.div>
        </div>
    );
}

const VISUAL_MAPPINGS = {
    '01': VisualEnterprise,
    '02': VisualCompanyProfile,
    '03': VisualEdTech,
    '04': VisualECommerce,
    '05': VisualBooking,
    '06': VisualPublishing,
    '07': VisualLandingPage,
    '08': VisualSaaS,
};

/* ── MAIN 3D INTERACTIVE CARD COMPONENT ── */

export default function WebSolutionCard3D({ sol, idx }) {
    const cardRef = useRef(null);
    const [isHovered, setIsHovered] = useState(false);
    const rafId = useRef(null);

    // 3D Tilt motion values
    const rotateX = useMotionValue(0);
    const rotateY = useMotionValue(0);
    const springRotateX = useSpring(rotateX, { stiffness: 280, damping: 22 });
    const springRotateY = useSpring(rotateY, { stiffness: 280, damping: 22 });

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
            const rotX = ((y - centerY) / centerY) * -8;
            const rotY = ((x - centerX) / centerX) * 8;
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

    const VisualComponent = VISUAL_MAPPINGS[sol.num] || VisualEnterprise;
    const Icon = sol.icon;

    return (
        <motion.div
            style={{
                perspective: 1200,
            }}
            className="w-full h-full"
        >
            <motion.div
                ref={cardRef}
                onMouseEnter={handleMouseEnter}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{
                    rotateX: springRotateX,
                    rotateY: springRotateY,
                    transformStyle: 'preserve-3d',
                }}
                className={`
                    group relative w-full h-full rounded-[28px] p-5 sm:p-6
                    transition-all duration-300 ease-out will-change-transform
                    flex flex-col justify-between overflow-hidden
                    backdrop-blur-xl border
                    ${isHovered 
                        ? 'border-cyan-500/60 shadow-2xl scale-[1.02]' 
                        : 'border-slate-200/90 dark:border-white/10 shadow-lg'
                    }
                `}
            >
                {/* Dual-Theme Background Surface with Subtle Glare */}
                <div 
                    className="absolute inset-0 pointer-events-none rounded-[28px] transition-opacity duration-300 bg-white/95 dark:bg-[#070D1A]/95"
                    style={{
                        boxShadow: isHovered 
                            ? `0 24px 48px -12px ${sol.color}30, inset 0 1px 2px rgba(255,255,255,0.8)` 
                            : 'none'
                    }}
                />

                {/* Glare spotlight following cursor (Bogdan Zhuk specular gloss effect) */}
                <div 
                    className="absolute inset-0 pointer-events-none rounded-[28px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
                    style={{
                        background: 'radial-gradient(circle 240px at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255, 255, 255, 0.25) 0%, transparent 80%)',
                    }}
                />

                {/* Ambient Colored Backing Glow */}
                <div 
                    className="absolute -top-12 -right-12 w-36 h-36 rounded-full blur-2xl pointer-events-none opacity-20 group-hover:opacity-40 transition-opacity"
                    style={{ backgroundColor: sol.color }}
                />

                {/* Relative Card Content with preserve-3d */}
                <div className="relative z-20 space-y-4">
                    {/* Top 3D Visual Illustration Widget (Bogdan Zhuk Aesthetic) */}
                    <div style={{ transform: 'translateZ(25px)' }} className="transition-transform duration-300">
                        <VisualComponent color={sol.color} />
                    </div>

                    {/* Metadata Header: Icon, Number, & Badge */}
                    <div style={{ transform: 'translateZ(18px)' }} className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-2.5">
                            <div 
                                className="w-9 h-9 rounded-xl flex items-center justify-center border shadow-sm group-hover:scale-110 transition-transform"
                                style={{ 
                                    backgroundColor: `${sol.color}18`, 
                                    borderColor: `${sol.color}35`, 
                                    color: sol.color 
                                }}
                            >
                                <Icon className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500">
                                #{sol.num}
                            </span>
                        </div>

                        <span 
                            className="text-[10px] font-mono px-2.5 py-1 rounded-full font-bold border transition-colors shadow-sm"
                            style={{ 
                                backgroundColor: isHovered ? `${sol.color}20` : 'rgba(255,255,255,0.06)',
                                borderColor: isHovered ? `${sol.color}60` : 'rgba(255,255,255,0.1)',
                                color: isHovered ? sol.color : undefined
                            }}
                        >
                            {sol.badge}
                        </span>
                    </div>

                    {/* Title & Description */}
                    <div style={{ transform: 'translateZ(15px)' }}>
                        <h3 className="font-heading font-extrabold text-base text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors leading-snug">
                            {sol.title}
                        </h3>

                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mt-1.5 line-clamp-3">
                            {sol.desc}
                        </p>
                    </div>

                    {/* Features List with Micro-Checkmarks */}
                    <div style={{ transform: 'translateZ(12px)' }} className="pt-2 border-t border-slate-100 dark:border-white/5 space-y-1.5">
                        {sol.features.map((feat, fIdx) => (
                            <div key={fIdx} className="flex items-start gap-2 text-[11px] text-slate-700 dark:text-slate-300">
                                <CheckCircle2 
                                    className="w-3.5 h-3.5 shrink-0 mt-0.5 transition-colors"
                                    style={{ color: sol.color }}
                                />
                                <span className="leading-tight">{feat}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom CTA Button: Elevated 3D Magnetic Action */}
                <div style={{ transform: 'translateZ(20px)' }} className="relative z-20 mt-5 pt-3 border-t border-slate-100 dark:border-white/5">
                    <Link
                        href={`/konsultasi?layanan=web-development&solusi=${encodeURIComponent(sol.title)}`}
                        className="group/btn relative w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all duration-300 overflow-hidden shadow-sm"
                        style={{
                            backgroundColor: isHovered ? sol.color : undefined,
                            color: isHovered ? '#060B14' : undefined,
                        }}
                    >
                        {/* Fallback styling for non-hovered */}
                        {!isHovered && (
                            <span className="absolute inset-0 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl" />
                        )}

                        <span className="relative z-10 font-bold transition-transform group-hover/btn:translate-x-[-2px]">
                            Konsultasikan Solusi Ini
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 relative z-10 transition-transform group-hover/btn:translate-x-1" />

                        {/* Button Shimmer on Hover */}
                        {isHovered && (
                            <div className="absolute inset-0 bg-white/30 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                        )}
                    </Link>
                </div>
            </motion.div>
        </motion.div>
    );
}
