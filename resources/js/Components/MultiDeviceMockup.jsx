import React, { useState } from 'react';
import { Monitor, Tablet, Smartphone, ExternalLink, Zap, CheckCircle2 } from 'lucide-react';

export default function MultiDeviceMockup({ portfolios = [] }) {
    const [selectedProjectIndex, setSelectedProjectIndex] = useState(0);
    const [deviceMode, setDeviceMode] = useState('desktop'); // desktop, tablet, mobile

    const activeProject = portfolios[selectedProjectIndex] || portfolios[0];

    if (!activeProject) return null;

    const deviceStyles = {
        desktop: {
            container: 'w-full max-w-4xl aspect-[16/10]',
            frame: 'rounded-xl border-4 border-slate-700 bg-slate-900 shadow-2xl',
            header: true,
            label: 'Desktop Screen (1920x1080)',
        },
        tablet: {
            container: 'w-[480px] max-w-full aspect-[4/5]',
            frame: 'rounded-2xl border-4 border-slate-700 bg-slate-900 shadow-2xl',
            header: true,
            label: 'Tablet Screen (768x1024)',
        },
        mobile: {
            container: 'w-[300px] max-w-full aspect-[9/19]',
            frame: 'rounded-[32px] border-4 border-slate-700 bg-slate-900 shadow-2xl p-1.5',
            header: false,
            label: 'Mobile Screen (390x844)',
        },
    };

    return (
        <div className="flex flex-col items-center w-full">
            {/* Top Control Bar */}
            <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4 p-4 mb-6 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-none backdrop-blur-xl transition-colors">
                {/* Project Selector Pills */}
                <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
                    {portfolios.map((p, idx) => (
                        <button
                            key={p.id || idx}
                            onClick={() => setSelectedProjectIndex(idx)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                                selectedProjectIndex === idx
                                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                                    : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10'
                            }`}
                        >
                            {p.title}
                        </button>
                    ))}
                </div>

                {/* Device Switcher Mode */}
                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-white/10 shrink-0">
                    <button
                        onClick={() => setDeviceMode('desktop')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            deviceMode === 'desktop'
                                ? 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-500/40 shadow'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                        <Monitor className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Desktop</span>
                    </button>

                    <button
                        onClick={() => setDeviceMode('tablet')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            deviceMode === 'tablet'
                                ? 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-500/40 shadow'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                        <Tablet className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Tablet</span>
                    </button>

                    <button
                        onClick={() => setDeviceMode('mobile')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            deviceMode === 'mobile'
                                ? 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-500/40 shadow'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                        <Smartphone className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Mobile</span>
                    </button>
                </div>
            </div>

            {/* Device Canvas Frame Container */}
            <div className="w-full flex justify-center py-4 min-h-[460px] md:min-h-[580px] items-center">
                <div className={`transition-all duration-300 flex flex-col ${deviceStyles[deviceMode].container}`}>
                    <div className={`w-full h-full flex flex-col overflow-hidden ${deviceStyles[deviceMode].frame}`}>
                        {/* Browser / Device Chrome Header */}
                        {deviceStyles[deviceMode].header ? (
                            <div className="px-4 py-2.5 bg-slate-800/90 border-b border-white/10 flex items-center justify-between shrink-0">
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></span>
                                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
                                </div>
                                <div className="px-4 py-0.5 rounded-md bg-slate-950/60 text-[10px] font-mono text-slate-400 border border-white/5 truncate max-w-xs">
                                    https://langit.id/showcase/{activeProject.slug}
                                </div>
                                <div className="text-[10px] font-mono text-cyan-400">
                                    SSL Verified
                                </div>
                            </div>
                        ) : (
                            /* Mobile Notch */
                            <div className="h-5 bg-slate-900 flex justify-center items-center shrink-0">
                                <div className="w-20 h-3 rounded-full bg-slate-950"></div>
                            </div>
                        )}

                        {/* Screen Content Preview */}
                        <div className="relative flex-1 bg-slate-950 overflow-hidden group">
                            <img
                                src={deviceMode === 'mobile' ? (activeProject.mobile_preview_img || activeProject.desktop_preview_img) : activeProject.desktop_preview_img}
                                alt={activeProject.title}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />

                            {/* Floating Overlay Badge on Hover */}
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-6 flex flex-col justify-end">
                                <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">{activeProject.client_name}</span>
                                <h4 className="text-lg font-bold text-white mb-2">{activeProject.title}</h4>
                                <div className="flex items-center gap-3">
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 text-xs font-mono border border-emerald-500/30">
                                        <Zap className="w-3.5 h-3.5" />
                                        Score: {activeProject.lighthouse_score} / 100
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Project Details Footer */}
            <div className="w-full max-w-4xl mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 p-5 rounded-2xl bg-white dark:bg-[#090D16] border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-none text-xs transition-colors">
                <div>
                    <span className="text-slate-500 dark:text-slate-400 font-mono uppercase tracking-wider text-[10px]">Tantangan Klien</span>
                    <p className="text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">{activeProject.challenge_text || 'Optimasi performa & responsive UX berkecepatan tinggi.'}</p>
                </div>
                <div>
                    <span className="text-slate-500 dark:text-slate-400 font-mono uppercase tracking-wider text-[10px]">Solusi Rekayasa Langit</span>
                    <p className="text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">{activeProject.solution_text || 'Arsitektur komponen modular dan caching micro-frontend.'}</p>
                </div>
                <div>
                    <span className="text-slate-500 dark:text-slate-400 font-mono uppercase tracking-wider text-[10px]">Teknologi Digunakan</span>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {(activeProject.tech_stack_json || ['Laravel 13', 'React', 'Tailwind']).map((t, i) => (
                            <span key={i} className="px-2 py-0.5 rounded bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 font-mono text-[11px]">
                                {t}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
