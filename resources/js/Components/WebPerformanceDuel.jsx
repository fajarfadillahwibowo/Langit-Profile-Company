import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from '@inertiajs/react';
import { 
    Zap, Gauge, RefreshCw, Play, ArrowRight, Sparkles, 
    CheckCircle2, XCircle, Cpu, Layers, Activity, ShieldCheck, 
    ShieldAlert, Clock, Workflow, Award, Database, Globe
} from 'lucide-react';

export default function WebPerformanceDuel() {
    const [activeView, setActiveView] = useState('duel'); // 'duel' | 'lifecycle'
    const [isRacing, setIsRacing] = useState(false);
    const [raceProgressLangit, setRaceProgressLangit] = useState(100);
    const [raceProgressOld, setRaceProgressOld] = useState(100);
    const [activeStage, setActiveStage] = useState(0);

    const startRace = () => {
        if (isRacing) return;
        setIsRacing(true);
        setRaceProgressLangit(0);
        setRaceProgressOld(0);

        // Langit finishes in 0.5s
        let currentLangit = 0;
        const intervalLangit = setInterval(() => {
            currentLangit += 20;
            if (currentLangit >= 100) {
                setRaceProgressLangit(100);
                clearInterval(intervalLangit);
            } else {
                setRaceProgressLangit(currentLangit);
            }
        }, 80);

        // Old template CMS takes 3.2s
        let currentOld = 0;
        const intervalOld = setInterval(() => {
            currentOld += 5;
            if (currentOld >= 100) {
                setRaceProgressOld(100);
                setIsRacing(false);
                clearInterval(intervalOld);
            } else {
                setRaceProgressOld(currentOld);
            }
        }, 140);
    };

    const workflowStages = [
        {
            num: '01',
            title: 'Discovery & Cyber Architecture Blueprint',
            duration: '3 - 5 Hari',
            tag: 'Foundation Phase',
            desc: 'Analisa mendalam alur bisnis, pemetaan relasi database (ERD), spesifikasi endpoint API, dan wireframe arsitektur sistem.',
            deliverables: ['Dokumen SRS & Arsitektur', 'ERD Schema MySQL / PostgreSQL', 'Wireframe Flowchart Interaktif'],
            color: '#0EA5E9',
            icon: Database,
        },
        {
            num: '02',
            title: 'High-Fidelity UI/UX & Bento Prototyping',
            duration: '4 - 7 Hari',
            tag: 'Design System',
            desc: 'Perancangan antarmuka visual eksklusif berstandar Bento Modern dengan micro-interactions, responsive tokens, dan prototipe Figma 60 FPS.',
            deliverables: ['Figma Design System Komprehensif', 'Prototipe Interaktif Mobile & Desktop', 'Asset Iconography & Motion Tokens'],
            color: '#6366F1',
            icon: Layers,
        },
        {
            num: '03',
            title: 'Full-Stack Sprint & Micro-Caching',
            duration: '7 - 14 Hari',
            tag: 'Engineering Phase',
            desc: 'Pengembangan backend tangguh Laravel 13, integrasi antarmuka React SPA reaktif, setup Redis cache, serta integrasi Payment Gateway & WhatsApp API.',
            deliverables: ['Clean Code Laravel 13 & React 19', 'Sub-millisecond Redis Caching', 'Integrasi API Gateway Real-Time'],
            color: '#10B981',
            icon: Cpu,
        },
        {
            num: '04',
            title: 'Security Hardening & Core Web Vitals Audit',
            duration: '2 - 4 Hari',
            tag: 'QA & Penetration',
            desc: 'Audit kepatuhan standar OWASP, penutupan celah SQLi/XSS, proteksi CSRF ketat, dan optimasi tree-shaking hingga skor Google Lighthouse di atas 95+.',
            deliverables: ['Skor Google Lighthouse 95+ Garansi', 'Laporan OWASP Security Compliance', 'Validasi Cross-Browser & Multi-Device'],
            color: '#F59E0B',
            icon: ShieldCheck,
        },
        {
            num: '05',
            title: 'Zero-Downtime Launch & Garansi 6 Bulan',
            duration: '1 - 2 Hari',
            tag: 'Deployment & SLA',
            desc: 'Peluncuran ke cloud server produksi dengan SSL otomatis, backup database berkala, pelatihan staf admin, dan garansi pemeliharaan 6 bulan penuh.',
            deliverables: ['Server Production CI/CD Pipeline', 'Dokumentasi Manual Back-Office', 'Garansi SLA Pemeliharaan 6 Bulan'],
            color: '#EC4899',
            icon: Award,
        },
    ];

    return (
        <section id="interactive-arena" className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-16 border-t border-slate-200 dark:border-white/10">
            {/* Header Section */}
            <div className="text-center max-w-3xl mx-auto mb-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider mb-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Arena Interaktif Kinerja & Alur Rekayasa</span>
                </div>
                <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white tracking-tight">
                    Mengapa Arsitektur Langit Berbeda?
                </h2>
                <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-2 max-w-2xl mx-auto leading-relaxed">
                    Uji langsung simulasi balap performa antara arsitektur modern Langit melawan template CMS konvensional, atau jelajahi 5 tahapan rekayasa berstandar industri kami.
                </p>

                {/* Cyber Mode Switcher Tabs */}
                <div className="inline-flex p-1 bg-slate-200/70 dark:bg-white/[0.04] rounded-2xl border border-slate-300/80 dark:border-white/10 mt-6 shadow-sm">
                    <button
                        onClick={() => setActiveView('duel')}
                        className={`px-5 py-2.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer ${
                            activeView === 'duel'
                                ? 'bg-white dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 shadow-md border border-slate-200 dark:border-cyan-500/40'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                        <span>Simulasi Balap Performa</span>
                    </button>

                    <button
                        onClick={() => setActiveView('lifecycle')}
                        className={`px-5 py-2.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer ${
                            activeView === 'lifecycle'
                                ? 'bg-white dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 shadow-md border border-slate-200 dark:border-cyan-500/40'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                        <Workflow className="w-3.5 h-3.5 text-cyan-500" />
                        <span>Alur Rekayasa & Garansi Mutu</span>
                    </button>
                </div>
            </div>

            {/* Content Container */}
            <AnimatePresence mode="wait">
                {activeView === 'duel' ? (
                    /* ── 1. SPEED & PERFORMANCE DUEL ARENA ── */
                    <motion.div
                        key="duel"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        transition={{ duration: 0.35 }}
                        className="space-y-8"
                    >
                        {/* Simulation Launch Banner */}
                        <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-cyan-500/30 text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
                            {/* Ambient Light streaks */}
                            <div className="absolute top-0 right-1/4 w-72 h-36 bg-cyan-500/20 blur-3xl pointer-events-none" />
                            <div className="absolute bottom-0 left-1/4 w-72 h-36 bg-rose-500/15 blur-3xl pointer-events-none" />

                            <div className="relative z-10 text-center md:text-left space-y-1">
                                <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-mono text-cyan-400 font-bold">
                                    <Activity className="w-4 h-4 animate-pulse" />
                                    <span>SIMULASI BALAPAN LOADING MULTI-CLIENT</span>
                                </div>
                                <h3 className="font-heading font-extrabold text-xl sm:text-2xl text-white">
                                    Lihat Perbandingan Kecepatan Nyata di Layar Anda
                                </h3>
                                <p className="text-xs text-slate-300 max-w-xl">
                                    Klik tombol untuk menyimulasikan beban request bersamaan dan perhatikan waktu respon serta stabilitas antarmuka.
                                </p>
                            </div>

                            <button
                                onClick={startRace}
                                disabled={isRacing}
                                className="relative z-10 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 to-sky-500 hover:from-cyan-300 hover:to-sky-400 text-slate-950 font-extrabold text-sm flex items-center gap-2.5 shadow-lg shadow-cyan-500/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-60 cursor-pointer shrink-0"
                            >
                                <Play className={`w-4 h-4 fill-slate-950 ${isRacing ? 'animate-spin' : ''}`} />
                                <span>{isRacing ? 'Menyimulasikan...' : 'Mulai Balapan Kecepatan'}</span>
                            </button>
                        </div>

                        {/* Head-to-Head Cards */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Left: Template Tradisional CMS */}
                            <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#070D18]/90 border border-rose-500/30 shadow-xl space-y-5 relative overflow-hidden flex flex-col justify-between">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 flex items-center justify-center">
                                                <XCircle className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-mono text-rose-500 font-bold uppercase block">
                                                    Teknologi Konvensional
                                                </span>
                                                <h4 className="font-heading font-extrabold text-base text-slate-900 dark:text-white">
                                                    Website Template / CMS Usang
                                                </h4>
                                            </div>
                                        </div>

                                        <span className="text-xs font-mono font-extrabold px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                                            Skor: 38/100
                                        </span>
                                    </div>

                                    {/* Race Progress Bar */}
                                    <div className="space-y-1.5 p-3 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30">
                                        <div className="flex justify-between text-xs font-mono">
                                            <span className="text-slate-600 dark:text-slate-400">Loading Render:</span>
                                            <span className="text-rose-600 font-bold">{raceProgressOld < 100 ? `${(raceProgressOld * 0.035).toFixed(1)}s` : '3.8s (Lambat)'}</span>
                                        </div>
                                        <div className="w-full h-2.5 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-rose-500 transition-all duration-150"
                                                style={{ width: `${raceProgressOld}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Characteristic Disadvantages */}
                                    <div className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                                        <div className="flex items-start gap-2.5">
                                            <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                                            <span><strong>Kedip Putih & Full Page Reload</strong> pada setiap klik menu, memutus alur pengguna.</span>
                                        </div>
                                        <div className="flex items-start gap-2.5">
                                            <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                                            <span><strong>Plugin Menumpuk & Lambat</strong>: 40+ request HTTP dan bundle CSS/JS membengkak hingga 8MB.</span>
                                        </div>
                                        <div className="flex items-start gap-2.5">
                                            <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                                            <span><strong>Rentan Exploit & Pembobolan</strong>: CMS populer sering menjadi sasaran malware otomatis.</span>
                                        </div>
                                        <div className="flex items-start gap-2.5">
                                            <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                                            <span><strong>Database Tidak Terindeks</strong>: Server mudah crash saat traffic promosi melonjak.</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-500">
                                    <span>First Contentful Paint: ~3.8s</span>
                                    <span className="text-rose-500 font-bold">Rasio Bounce Tinggi</span>
                                </div>
                            </div>

                            {/* Right: Arsitektur Langit (Modern) */}
                            <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#070D18]/90 border border-cyan-500/50 shadow-2xl space-y-5 relative overflow-hidden flex flex-col justify-between ring-2 ring-cyan-500/20">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                                                <Zap className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 font-bold uppercase block">
                                                    Standar Rekayasa Langit
                                                </span>
                                                <h4 className="font-heading font-extrabold text-base text-slate-900 dark:text-white">
                                                    Laravel 13 + React SPA + Redis
                                                </h4>
                                            </div>
                                        </div>

                                        <span className="text-xs font-mono font-extrabold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                                            Skor: 99/100
                                        </span>
                                    </div>

                                    {/* Race Progress Bar */}
                                    <div className="space-y-1.5 p-3 rounded-2xl bg-cyan-50/50 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-900/30">
                                        <div className="flex justify-between text-xs font-mono">
                                            <span className="text-slate-600 dark:text-slate-400">Loading Render:</span>
                                            <span className="text-cyan-600 dark:text-cyan-400 font-bold">{raceProgressLangit < 100 ? `${(raceProgressLangit * 0.004).toFixed(2)}s` : '0.4s (Kilat)'}</span>
                                        </div>
                                        <div className="w-full h-2.5 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-100 shadow-[0_0_8px_#38bdf8]"
                                                style={{ width: `${raceProgressLangit}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Characteristic Advantages */}
                                    <div className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                                        <div className="flex items-start gap-2.5">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                            <span><strong>Zero-Reload SPA Reaktif</strong>: Navigasi secepat aplikasi mobile native tanpa refresh layar.</span>
                                        </div>
                                        <div className="flex items-start gap-2.5">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                            <span><strong>Micro-Caching Redis & Indexed DB</strong>: Kecepatan query ~0.8ms, stabil ribuan pengunjung serentak.</span>
                                        </div>
                                        <div className="flex items-start gap-2.5">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                            <span><strong>Standar Keamanan OWASP Enkripsi</strong>: Terlindungi dari CSRF, SQL Injection, dan sanitasi payload ketat.</span>
                                        </div>
                                        <div className="flex items-start gap-2.5">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                            <span><strong>Automated WebP Pipeline & Tree-Shaking</strong>: Bobot CSS sangat ramping (&lt;12KB) tanpa sampah script.</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-500">
                                    <span>First Contentful Paint: ~0.4s</span>
                                    <span className="text-emerald-500 font-bold">Retensi & Konversi Optimal</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    /* ── 2. ENGINEERING LIFECYCLE & SLA GUARANTEE ── */
                    <motion.div
                        key="lifecycle"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        transition={{ duration: 0.35 }}
                        className="space-y-8"
                    >
                        {/* 5-Stage Interactive Sequencer Bar */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                            {workflowStages.map((stage, idx) => {
                                const Icon = stage.icon;
                                const isCurrent = activeStage === idx;
                                return (
                                    <button
                                        key={stage.num}
                                        onClick={() => setActiveStage(idx)}
                                        className={`cursor-pointer p-4 rounded-2xl border text-left transition-all duration-300 flex flex-col justify-between group ${
                                            isCurrent
                                                ? 'bg-slate-50 dark:bg-white/[0.08] border-cyan-500 ring-2 ring-cyan-500/20 shadow-lg scale-[1.02]'
                                                : 'bg-white/60 dark:bg-white/[0.02] border-slate-200 dark:border-white/10 hover:border-cyan-500/40'
                                        }`}
                                    >
                                        <div>
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="text-xs font-mono font-bold text-slate-400 group-hover:text-cyan-500 transition-colors">
                                                    PHASE {stage.num}
                                                </span>
                                                <div 
                                                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                                                    style={{ backgroundColor: `${stage.color}15`, color: stage.color }}
                                                >
                                                    <Icon className="w-3.5 h-3.5" />
                                                </div>
                                            </div>

                                            <h5 className="font-heading font-bold text-xs sm:text-sm text-slate-900 dark:text-white line-clamp-2">
                                                {stage.title}
                                            </h5>
                                        </div>

                                        <div className="mt-3 pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[10px] font-mono">
                                            <span className="text-slate-500">{stage.duration}</span>
                                            <span 
                                                className="font-bold"
                                                style={{ color: isCurrent ? stage.color : undefined }}
                                            >
                                                {isCurrent ? 'Aktif' : 'Pilih'}
                                            </span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Active Stage Detailed Inspector Card */}
                        {(() => {
                            const cur = workflowStages[activeStage];
                            const StageIcon = cur.icon;
                            return (
                                <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#070D18]/90 border border-slate-200 dark:border-white/10 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                                    {/* Ambient Glow */}
                                    <div 
                                        className="absolute -top-10 -right-10 w-60 h-60 rounded-full blur-3xl opacity-20 pointer-events-none"
                                        style={{ backgroundColor: cur.color }}
                                    />

                                    <div className="space-y-4 max-w-2xl relative z-10">
                                        <div className="flex items-center gap-3">
                                            <div 
                                                className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-md"
                                                style={{ backgroundColor: `${cur.color}20`, color: cur.color, borderColor: `${cur.color}40` }}
                                            >
                                                <StageIcon className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10">
                                                        Tahap {cur.num} // {cur.tag}
                                                    </span>
                                                    <span className="text-xs font-mono text-cyan-600 dark:text-cyan-400 font-bold">
                                                        Durasi: {cur.duration}
                                                    </span>
                                                </div>
                                                <h4 className="font-heading font-extrabold text-xl sm:text-2xl text-slate-900 dark:text-white mt-1">
                                                    {cur.title}
                                                </h4>
                                            </div>
                                        </div>

                                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                            {cur.desc}
                                        </p>

                                        {/* Deliverables Checklist */}
                                        <div className="space-y-2 pt-2">
                                            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold block">
                                                Hasil & Output Terverifikasi:
                                            </span>
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                                {cur.deliverables.map((del, dIdx) => (
                                                    <div 
                                                        key={dIdx}
                                                        className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/5 text-xs text-slate-800 dark:text-slate-200 flex items-center gap-2"
                                                    >
                                                        <CheckCircle2 
                                                            className="w-4 h-4 shrink-0" 
                                                            style={{ color: cur.color }}
                                                        />
                                                        <span className="text-[11px] leading-tight">{del}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Right */}
                                    <div className="relative z-10 w-full md:w-auto shrink-0 flex flex-col gap-3">
                                        <Link
                                            href={`/konsultasi?layanan=web-development&tahap=${encodeURIComponent(cur.title)}`}
                                            className="px-6 py-3.5 rounded-xl text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-105 active:scale-95"
                                            style={{ backgroundColor: cur.color }}
                                        >
                                            <span>Mulai Tahap Ini</span>
                                            <ArrowRight className="w-4 h-4" />
                                        </Link>

                                        <span className="text-[10px] text-center font-mono text-slate-400">
                                            Garansi transparansi & update progres berkala
                                        </span>
                                    </div>
                                </div>
                            );
                        })()}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Bottom Guarantee Banner */}
            <div className="mt-12 p-6 rounded-3xl bg-slate-100/80 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <Award className="w-6 h-6" />
                    </div>
                    <div>
                        <h5 className="font-heading font-bold text-sm text-slate-900 dark:text-white">
                            Garansi SLA & Pemeliharaan Sistem 6 Bulan Penuh
                        </h5>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Setiap proyek dilengkapi perlindungan bug fixing gratis, optimasi backup data, dan pendampingan operasional staf Anda.
                        </p>
                    </div>
                </div>

                <Link
                    href="/konsultasi"
                    className="px-5 py-2.5 rounded-xl bg-white dark:bg-white/10 hover:bg-slate-50 dark:hover:bg-white/20 text-slate-900 dark:text-white border border-slate-300 dark:border-white/10 text-xs font-bold transition-all shrink-0"
                >
                    Konsultasi Proyek Sekarang
                </Link>
            </div>
        </section>
    );
}
