import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Terminal, Play, RefreshCw, Check, Copy, Zap, ShieldCheck, 
    Database, Layers, Cpu, Globe, Server, CheckCircle2, ArrowRight,
    Activity, Gauge, Code2, MonitorCheck, Sparkles, Box
} from 'lucide-react';

import ArchingArchitectureCards from '@/Components/ArchingArchitectureCards';

export default function WebArchitectureCockpit() {
    const [activeTab, setActiveTab] = useState('pipeline'); // 'pipeline' | 'code' | 'benchmark'
    const [activeNode, setActiveNode] = useState('laravel');
    const [isBenchmarking, setIsBenchmarking] = useState(false);
    const [benchmarkProgress, setBenchmarkProgress] = useState(100);
    const [copied, setCopied] = useState(false);

    const pipelineNodes = [
        {
            id: 'client',
            label: 'Edge & Client',
            sub: 'Chrome / Safari / Mobile',
            badge: 'HTTP/3 + Brotli',
            desc: 'Akses multi-device dengan kompresi WebP otomatis, caching static asset, dan prefetching rute.',
            latency: '12ms',
            color: '#0EA5E9',
            icon: Globe,
        },
        {
            id: 'spa',
            label: 'React + Inertia SPA',
            sub: 'Zero Page Reload Client',
            badge: '60 FPS Transitions',
            desc: 'Navigasi tanpa kedip (zero-reload) dengan bundle terbagi otomatis (code-splitting) <12KB CSS.',
            latency: '0ms (Cache)',
            color: '#6366F1',
            icon: Layers,
        },
        {
            id: 'backend',
            label: 'Laravel 13 Core',
            sub: 'Robust Business Logic & API',
            badge: 'PHP 8.4 JIT Engine',
            desc: 'Validasi ketat OWASP, proteksi CSRF otomatis, queuing background jobs, dan RESTful endpoints.',
            latency: '8.4ms',
            color: '#EC4899',
            icon: Server,
        },
        {
            id: 'storage',
            label: 'MySQL 8 Enterprise',
            sub: 'ACID Relational Storage',
            badge: 'Indexed ACID Query',
            desc: 'Struktur database relasional tervirtualisasi dengan integritas ACID penuh dan query terindeks sub-milidetik.',
            latency: '0.8ms',
            color: '#00758F',
            icon: Database,
        },
    ];

    const codeSnippet = `// Langit Cyber-Architecture Core: Zero-Reload High Throughput Pipeline
import { createEngine, defineRoutes } from '@langit/enterprise-core';

export const LangitApp = createEngine({
  framework: 'Laravel 13 & PHP 8.4',
  clientUI: 'React 19 + Inertia SPA',
  designSystem: 'Tailwind CSS v4 (Zero-Runtime)',
  databaseTier: {
    engine: 'MySQL 8 Enterprise (ACID Compliant)',
    latencyTarget: '< 1ms',
  },
  metrics: {
    targetLighthouseScore: 99.4,
    coreWebVitals: 'All Pass (Good Threshold)',
    owaspSecurityAudit: 'Enterprise Grade Compliant'
  }
});`;

    const handleCopy = () => {
        navigator.clipboard?.writeText(codeSnippet);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleRunBenchmark = () => {
        if (isBenchmarking) return;
        setIsBenchmarking(true);
        setBenchmarkProgress(0);

        const interval = setInterval(() => {
            setBenchmarkProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setIsBenchmarking(false);
                    return 100;
                }
                return prev + 25;
            });
        }, 250);
    };

    return (
        <div className="relative w-full max-w-5xl mx-auto mt-8">
            {/* Ambient Background Glowing Orb behind Cockpit */}
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 via-sky-500/10 to-violet-500/20 rounded-3xl blur-2xl opacity-75 group-hover:opacity-100 transition duration-1000 -z-10" />

            {/* Floating Live Metric Pills */}
            <div className="hidden lg:flex items-center justify-between absolute -top-5 left-6 right-6 pointer-events-none z-20">
                <motion.div 
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: [0, -6, 0], opacity: 1 }}
                    transition={{ y: { duration: 4, repeat: Infinity, ease: "easeInOut" }, opacity: { duration: 0.5 } }}
                    className="pointer-events-auto px-3.5 py-1.5 rounded-full bg-white/90 dark:bg-slate-900/90 border border-cyan-500/30 shadow-lg shadow-cyan-500/10 backdrop-blur-xl flex items-center gap-2 text-xs font-mono"
                >
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-slate-700 dark:text-slate-300 font-semibold">Lighthouse 99+ Ready</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">100% PERF</span>
                </motion.div>

                <motion.div 
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: [0, 6, 0], opacity: 1 }}
                    transition={{ y: { duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 }, opacity: { duration: 0.5 } }}
                    className="pointer-events-auto px-3.5 py-1.5 rounded-full bg-white/90 dark:bg-slate-900/90 border border-violet-500/30 shadow-lg shadow-violet-500/10 backdrop-blur-xl flex items-center gap-2 text-xs font-mono"
                >
                    <Zap className="w-3.5 h-3.5 text-violet-500" />
                    <span className="text-slate-700 dark:text-slate-300 font-semibold">Inertia SPA Reaktif</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-violet-500/10 text-violet-600 dark:text-violet-400 font-bold">0ms RELOAD</span>
                </motion.div>
            </div>

            {/* Main Cyber IDE Window Frame */}
            <div className="rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white/85 dark:bg-[#070D18]/90 backdrop-blur-2xl shadow-2xl overflow-hidden transition-all duration-300">
                {/* Window Topbar */}
                <div className="flex flex-wrap items-center justify-between px-4 sm:px-6 py-3 border-b border-slate-200/80 dark:border-white/10 bg-slate-100/60 dark:bg-white/[0.02]">
                    {/* Window Controls */}
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded-full bg-rose-500/80 border border-rose-600/40 inline-block hover:opacity-100 transition-opacity" />
                            <span className="w-3 h-3 rounded-full bg-amber-500/80 border border-amber-600/40 inline-block hover:opacity-100 transition-opacity" />
                            <span className="w-3 h-3 rounded-full bg-emerald-500/80 border border-emerald-600/40 inline-block hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono text-slate-500 dark:text-slate-400 border-l border-slate-300 dark:border-white/10 pl-3">
                            <Terminal className="w-3 h-3 text-cyan-500" />
                            <span>langit-engine/core-blueprint.config.ts</span>
                        </div>
                    </div>

                    {/* Mode Navigation Tabs */}
                    <div className="flex items-center gap-1 p-1 bg-slate-200/70 dark:bg-black/40 rounded-xl border border-slate-300/60 dark:border-white/10 text-xs font-mono">
                        <button
                            onClick={() => setActiveTab('pipeline')}
                            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                                activeTab === 'pipeline'
                                    ? 'bg-white dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 font-bold shadow-sm border border-slate-200 dark:border-cyan-500/30'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                        >
                            <Activity className="w-3.5 h-3.5" />
                            <span>Topology Pipeline</span>
                        </button>

                        <button
                            onClick={() => setActiveTab('benchmark')}
                            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                                activeTab === 'benchmark'
                                    ? 'bg-white dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 font-bold shadow-sm border border-slate-200 dark:border-emerald-500/30'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                        >
                            <Gauge className="w-3.5 h-3.5" />
                            <span>Lighthouse Audit</span>
                        </button>

                        <button
                            onClick={() => setActiveTab('code')}
                            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                                activeTab === 'code'
                                    ? 'bg-white dark:bg-violet-500/20 text-violet-600 dark:text-violet-300 font-bold shadow-sm border border-slate-200 dark:border-violet-500/30'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                        >
                            <Code2 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Source Code</span>
                            <span className="sm:hidden">Code</span>
                        </button>
                    </div>
                </div>

                {/* Window Body Content */}
                <div className="p-4 sm:p-6 lg:p-8 min-h-[340px] flex flex-col justify-center">
                    <AnimatePresence mode="wait">
                        {/* TAB 1: TOPOLOGY PIPELINE (Pinterest Reference 3D Arching Carousel) */}
                        {activeTab === 'pipeline' && (
                            <motion.div
                                key="pipeline"
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.25 }}
                                className="space-y-6"
                            >
                                <div className="text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-slate-200/60 dark:border-white/5">
                                    <div>
                                        <h4 className="font-heading font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
                                            <Sparkles className="w-4 h-4 text-cyan-500" />
                                            <span>Arsitektur Full-Stack Reaktif Tanpa Refresh</span>
                                        </h4>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                            Eksplorasi ekosistem teknologi modern dengan kartu lengkung 3D interaktif. Klik kartu atau navigasi untuk memeriksa spesifikasi teknis.
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-xs font-mono font-medium">
                                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-ping" />
                                        <span>Live Routing Sync: 60 FPS</span>
                                    </div>
                                </div>

                                {/* 3D Arching Carousel of 8 Core Technologies (Pinterest Reference Style) */}
                                <ArchingArchitectureCards
                                    activeTechId={activeNode}
                                    onSelectTech={(id) => setActiveNode(id)}
                                />
                            </motion.div>
                        )}

                        {/* TAB 2: LIGHTHOUSE AUDIT */}
                        {activeTab === 'benchmark' && (
                            <motion.div
                                key="benchmark"
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.25 }}
                                className="space-y-6"
                            >
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-slate-200/60 dark:border-white/5">
                                    <div>
                                        <h4 className="font-heading font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
                                            <Gauge className="w-4 h-4 text-emerald-500" />
                                            <span>Google Lighthouse & Core Web Vitals Benchmark</span>
                                        </h4>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                            Skor performa nyata yang dioptimasi untuk kecepatan indeks Google dan konversi maksimal.
                                        </p>
                                    </div>

                                    <button
                                        onClick={handleRunBenchmark}
                                        disabled={isBenchmarking}
                                        className="px-4 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-mono text-xs flex items-center gap-2 transition-all disabled:opacity-50"
                                    >
                                        <RefreshCw className={`w-3.5 h-3.5 ${isBenchmarking ? 'animate-spin text-emerald-500' : ''}`} />
                                        <span>{isBenchmarking ? 'Running Audit...' : 'Uji Benchmark Live'}</span>
                                    </button>
                                </div>

                                {isBenchmarking && (
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between text-xs font-mono text-slate-500 dark:text-slate-400">
                                            <span>Menganalisa DOM, mengevaluasi TTFB & CSS tree-shaking...</span>
                                            <span>{benchmarkProgress}%</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-emerald-500 transition-all duration-300"
                                                style={{ width: `${benchmarkProgress}%` }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* 4 Lighthouse Score Rings */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    {[
                                        { title: 'Performance', score: 99, color: '#10B981', note: 'Skor Kecepatan Kritis' },
                                        { title: 'Accessibility', score: 100, color: '#10B981', note: 'Standar WCAG 2.1 AA' },
                                        { title: 'Best Practices', score: 100, color: '#10B981', note: 'OWASP & Modern Spec' },
                                        { title: 'SEO Score', score: 100, color: '#10B981', note: 'Schema & Meta Tags' },
                                    ].map((item, idx) => (
                                        <div 
                                            key={idx}
                                            className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 text-center flex flex-col items-center justify-center group hover:border-emerald-500/40 transition-all"
                                        >
                                            <div className="relative w-16 h-16 flex items-center justify-center mb-2">
                                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                                    <path
                                                        className="text-slate-200 dark:text-white/10"
                                                        strokeWidth="3.2"
                                                        stroke="currentColor"
                                                        fill="none"
                                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                    />
                                                    <path
                                                        className="text-emerald-500"
                                                        strokeDasharray={`${item.score}, 100`}
                                                        strokeWidth="3.2"
                                                        strokeLinecap="round"
                                                        stroke="currentColor"
                                                        fill="none"
                                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                    />
                                                </svg>
                                                <span className="absolute font-mono font-extrabold text-base text-slate-900 dark:text-white">
                                                    {item.score}
                                                </span>
                                            </div>
                                            <span className="font-heading font-bold text-xs text-slate-800 dark:text-slate-200">
                                                {item.title}
                                            </span>
                                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                                                {item.note}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {/* Core Web Vitals Micro Spec Bar */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-200/60 dark:border-white/5 text-center">
                                    <div className="p-2 rounded-lg bg-slate-100/70 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5">
                                        <span className="text-[10px] text-slate-500 font-mono block">First Contentful Paint</span>
                                        <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">0.4s (Super Fast)</span>
                                    </div>
                                    <div className="p-2 rounded-lg bg-slate-100/70 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5">
                                        <span className="text-[10px] text-slate-500 font-mono block">Largest Contentful Paint</span>
                                        <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">0.8s (Zero Lag)</span>
                                    </div>
                                    <div className="p-2 rounded-lg bg-slate-100/70 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5">
                                        <span className="text-[10px] text-slate-500 font-mono block">Cumulative Layout Shift</span>
                                        <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">0.00 (Zero Shift)</span>
                                    </div>
                                    <div className="p-2 rounded-lg bg-slate-100/70 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5">
                                        <span className="text-[10px] text-slate-500 font-mono block">Time To First Byte</span>
                                        <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">38ms (Optimized)</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* TAB 3: SOURCE CODE */}
                        {activeTab === 'code' && (
                            <motion.div
                                key="code"
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.25 }}
                                className="space-y-4"
                            >
                                <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-white/5">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                                            Typescript Enterprise Spec Definition
                                        </span>
                                    </div>

                                    <button
                                        onClick={handleCopy}
                                        className="px-3 py-1 rounded-lg bg-slate-200/80 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-800 dark:text-slate-200 font-mono text-xs flex items-center gap-1.5 transition-colors"
                                    >
                                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                        <span>{copied ? 'Tersalin!' : 'Salin Snippet'}</span>
                                    </button>
                                </div>

                                <div className="p-4 rounded-xl bg-slate-900 dark:bg-black/70 border border-slate-800 text-slate-200 font-mono text-xs overflow-x-auto leading-relaxed shadow-inner">
                                    <pre className="text-slate-300 font-mono">{codeSnippet}</pre>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Bottom Window Status Strip */}
                <div className="px-4 sm:px-6 py-2.5 border-t border-slate-200/80 dark:border-white/10 bg-slate-100/50 dark:bg-black/30 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Production Server: 99.98% Uptime
                        </span>
                        <span className="hidden md:inline text-slate-400 dark:text-slate-600">|</span>
                        <span className="hidden md:inline">PHP 8.4 JIT + MySQL 8 Enterprise ACID Storage</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <span>Latency: ~0.8ms</span>
                        <span className="text-cyan-600 dark:text-cyan-400 font-bold">Inertia v3 Protocol Ready</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
