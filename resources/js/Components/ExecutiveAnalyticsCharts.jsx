import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    TrendingUp, Activity, PieChart, Layers, Calendar, 
    ArrowUpRight, Sparkles, CheckCircle2, Clock, ShieldCheck, 
    Zap, Eye, RefreshCw
} from 'lucide-react';

export default function ExecutiveAnalyticsCharts({
    metrics = {},
    analytics = {},
    serviceTickets = [],
    rentalBookings = [],
    internshipApplications = [],
    collaborations = [],
    galleries = [],
    recentConsultations = [],
    services = [],
    equipments = [],
    courses = [],
    clientDeliveries = [],
}) {
    // Period selector: '7d', '30d', 'year'
    const [selectedPeriod, setSelectedPeriod] = useState('7d');
    const [hoveredDataPoint, setHoveredDataPoint] = useState(null);
    const [hoveredDivision, setHoveredDivision] = useState(null);

    // Real Time Series Dataset from Backend
    const timeSeriesData = useMemo(() => {
        if (analytics?.time_series?.[selectedPeriod] && analytics.time_series[selectedPeriod].length > 0) {
            return analytics.time_series[selectedPeriod];
        }

        // Fallback default calculation based on real counts
        const now = new Date();
        const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
        return Array.from({ length: 7 }).map((_, idx) => {
            const d = new Date();
            d.setDate(now.getDate() - (6 - idx));
            return {
                label: days[d.getDay()],
                date: `${d.getDate()} ${d.toLocaleString('id-ID', { month: 'short' })}`,
                primary: 0,
                secondary: 0,
                growth: '0 Aksi',
            };
        });
    }, [analytics, selectedPeriod]);

    // Real 7 Divisions Distribution Dataset from Backend
    const divisionsDistribution = useMemo(() => {
        if (analytics?.divisions_distribution && analytics.divisions_distribution.length > 0) {
            return analytics.divisions_distribution;
        }

        // Dynamic fallback calculated directly from available props
        const photoService = services.find(s => s.slug === 'photography-videography');
        const webService = services.find(s => s.slug === 'web-development');
        const compService = services.find(s => s.slug === 'computer-service');
        const sewaService = services.find(s => s.slug === 'sewa-alat');
        const eduService = services.find(s => s.slug === 'langit-education');
        const internService = services.find(s => s.slug === 'internship');

        const divVisualCount = galleries.filter(g => g.service_id === photoService?.id).length + clientDeliveries.length;
        const divWebCount = galleries.filter(g => g.service_id === webService?.id).length;
        const divCompCount = serviceTickets.length + galleries.filter(g => g.service_id === compService?.id).length;
        const divSewaCount = (equipments.length || 7) + rentalBookings.length + galleries.filter(g => g.service_id === sewaService?.id).length;
        const divEduCount = (courses.length || 3) + galleries.filter(g => g.service_id === eduService?.id).length;
        const divInternCount = internshipApplications.length + galleries.filter(g => g.service_id === internService?.id).length;
        const divCollabCount = collaborations.length;

        const total = divVisualCount + divWebCount + divCompCount + divSewaCount + divEduCount + divInternCount + divCollabCount;

        return [
            { 
                id: 'visual-cinema',
                name: 'Visual & Cinema', 
                subtitle: 'Wedding, Event & Commercial',
                count: divVisualCount,
                percentage: total > 0 ? Math.round((divVisualCount / total) * 100) : 0, 
                color: '#005792',
                gradFrom: '#005792',
                gradTo: '#007cc7',
                icon: '🎬'
            },
            { 
                id: 'web-dev',
                name: 'Web Development', 
                subtitle: 'Aplikasi Web & Portofolio',
                count: divWebCount,
                percentage: total > 0 ? Math.round((divWebCount / total) * 100) : 0, 
                color: '#06b6d4',
                gradFrom: '#06b6d4',
                gradTo: '#3b82f6',
                icon: '⚡'
            },
            { 
                id: 'computer-servis',
                name: 'Computer Servis', 
                subtitle: 'Hardware Lab & Diagnostik',
                count: divCompCount,
                percentage: total > 0 ? Math.round((divCompCount / total) * 100) : 0, 
                color: '#f97316',
                gradFrom: '#f97316',
                gradTo: '#ea580c',
                icon: '🛠️'
            },
            { 
                id: 'sewa-alat',
                name: 'Sewa Alat & Gear', 
                subtitle: 'Kamera, Lensa & Lighting',
                count: divSewaCount,
                percentage: total > 0 ? Math.round((divSewaCount / total) * 100) : 0, 
                color: '#14b8a6',
                gradFrom: '#14b8a6',
                gradTo: '#10b981',
                icon: '📷'
            },
            { 
                id: 'education',
                name: 'Langit Education', 
                subtitle: 'Kursus & Sertifikasi IT',
                count: divEduCount,
                percentage: total > 0 ? Math.round((divEduCount / total) * 100) : 0, 
                color: '#8b5cf6',
                gradFrom: '#8b5cf6',
                gradTo: '#6366f1',
                icon: '🎓'
            },
            { 
                id: 'internship',
                name: 'Internship Program', 
                subtitle: 'Talenta Magang & Pelamar',
                count: divInternCount,
                percentage: total > 0 ? Math.round((divInternCount / total) * 100) : 0, 
                color: '#a855f7',
                gradFrom: '#a855f7',
                gradTo: '#d946ef',
                icon: '✨'
            },
            { 
                id: 'collaborations',
                name: 'Kolaborasi B2B', 
                subtitle: 'Kemitraan & Proposal Masuk',
                count: divCollabCount,
                percentage: total > 0 ? Math.round((divCollabCount / total) * 100) : 0, 
                color: '#f43f5e',
                gradFrom: '#f43f5e',
                gradTo: '#e11d48',
                icon: '🤝'
            },
        ];
    }, [analytics, services, galleries, clientDeliveries, serviceTickets, equipments, rentalBookings, courses, internshipApplications, collaborations]);

    const totalActiveProjects = useMemo(() => {
        if (analytics?.total_active_projects !== undefined) {
            return analytics.total_active_projects;
        }
        return divisionsDistribution.reduce((acc, curr) => acc + curr.count, 0);
    }, [analytics, divisionsDistribution]);

    // KPI Metrics Real Values
    const kpi = useMemo(() => {
        if (analytics?.kpi) {
            return analytics.kpi;
        }
        return {
            lead_response_rate: 100,
            leads_responded: recentConsultations.length + collaborations.length,
            leads_total: recentConsultations.length + collaborations.length,
            service_completion_rate: 100,
            tickets_completed: serviceTickets.filter(t => ['ready', 'completed'].includes(t.status)).length,
            tickets_total: serviceTickets.length,
            gear_utility_rate: 100,
            stock_available: 28,
            stock_total: 28,
        };
    }, [analytics, recentConsultations, collaborations, serviceTickets]);

    // SVG Coordinate Builder for Area Spline Chart
    const svgChartBounds = { width: 680, height: 220, paddingX: 35, paddingY: 25 };
    const maxPrimaryVal = Math.max(...timeSeriesData.map(d => Math.max(d.primary || 0, d.secondary || 0)), 1);
    const peakVolume = Math.max(...timeSeriesData.map(d => (d.primary || 0) + (d.secondary || 0)), 0);
    const totalThroughput = timeSeriesData.reduce((acc, d) => acc + (d.primary || 0) + (d.secondary || 0), 0);
    const dailyAverage = (totalThroughput / (timeSeriesData.length || 1)).toFixed(1);

    const chartCoordinates = useMemo(() => {
        const stepX = (svgChartBounds.width - svgChartBounds.paddingX * 2) / (timeSeriesData.length - 1 || 1);
        const innerH = svgChartBounds.height - svgChartBounds.paddingY * 2;
        
        return timeSeriesData.map((d, i) => {
            const x = svgChartBounds.paddingX + i * stepX;
            const y1 = svgChartBounds.paddingY + innerH - ((d.primary || 0) / maxPrimaryVal) * innerH;
            const y2 = svgChartBounds.paddingY + innerH - (((d.secondary || 0) / maxPrimaryVal) * innerH);
            return { x, y1, y2, data: d };
        });
    }, [timeSeriesData, maxPrimaryVal]);

    // Create smooth curved SVG Path (Bezier Spline)
    const splinePathPrimary = useMemo(() => {
        if (!chartCoordinates.length) return '';
        let d = `M ${chartCoordinates[0].x} ${chartCoordinates[0].y1}`;
        for (let i = 0; i < chartCoordinates.length - 1; i++) {
            const p0 = chartCoordinates[i];
            const p1 = chartCoordinates[i + 1];
            const mx = (p0.x + p1.x) / 2;
            d += ` C ${mx} ${p0.y1}, ${mx} ${p1.y1}, ${p1.x} ${p1.y1}`;
        }
        return d;
    }, [chartCoordinates]);

    const areaPathPrimary = useMemo(() => {
        if (!chartCoordinates.length) return '';
        const baseH = svgChartBounds.height - svgChartBounds.paddingY;
        const last = chartCoordinates[chartCoordinates.length - 1];
        const first = chartCoordinates[0];
        return `${splinePathPrimary} L ${last.x} ${baseH} L ${first.x} ${baseH} Z`;
    }, [splinePathPrimary, chartCoordinates]);

    const splinePathSecondary = useMemo(() => {
        if (!chartCoordinates.length) return '';
        let d = `M ${chartCoordinates[0].x} ${chartCoordinates[0].y2}`;
        for (let i = 0; i < chartCoordinates.length - 1; i++) {
            const p0 = chartCoordinates[i];
            const p1 = chartCoordinates[i + 1];
            const mx = (p0.x + p1.x) / 2;
            d += ` C ${mx} ${p0.y2}, ${mx} ${p1.y2}, ${p1.x} ${p1.y2}`;
        }
        return d;
    }, [chartCoordinates]);

    // Donut SVG Calculations
    const donutRadius = 78;
    const donutCircumference = 2 * Math.PI * donutRadius;

    return (
        <div className="space-y-6">
            {/* Header Telemetry Bar & Period Controls */}
            <div className="p-5 md:p-6 rounded-3xl bg-white dark:bg-[#090D16] border border-slate-200/90 dark:border-white/10 shadow-sm dark:shadow-xl transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                                Live Telemetry & Kinerja Sistem
                            </span>
                            <span className="text-slate-300 dark:text-white/20">•</span>
                            <span className="text-xs text-slate-500 font-medium">Auto Refresh Active</span>
                        </div>
                        <h2 className="font-heading font-extrabold text-xl text-slate-900 dark:text-white flex items-center gap-2">
                            <Activity className="w-5 h-5 text-[#005792] dark:text-cyan-400" />
                            <span>Analisis Tren & Performa Operasional 7 Divisi</span>
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-0.5">
                            Visualisasi volume throughput layanan, distribusi permintaan proyek, dan status SLA Langit Ecosystem
                        </p>
                    </div>

                    {/* Period Switcher Pills */}
                    <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#EDF9FC] dark:bg-white/5 border border-[#005792]/15 dark:border-white/10 self-start lg:self-auto">
                        {[
                            { id: '7d', label: '7 Hari Terakhir' },
                            { id: '30d', label: '30 Hari Terakhir' },
                            { id: 'year', label: `Tahun ${new Date().getFullYear()}` }
                        ].map((btn) => (
                            <button
                                key={btn.id}
                                onClick={() => {
                                    setSelectedPeriod(btn.id);
                                    setHoveredDataPoint(null);
                                }}
                                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                                    selectedPeriod === btn.id
                                        ? 'bg-[#005792] text-white shadow-md shadow-[#005792]/25'
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                }`}
                            >
                                {btn.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Dual Analytics Grid: Line/Area Trend + Donut Composition */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* 1. AREA SPLINE WAVE CHART (7 COLS ON LARGE) */}
                <div className="lg:col-span-7 p-6 rounded-3xl bg-white dark:bg-[#090D16] border border-slate-200/90 dark:border-white/10 shadow-sm dark:shadow-xl flex flex-col justify-between transition-colors">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                                Throughput Transaksi & Reservasi
                            </span>
                            <h3 className="font-heading font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2 mt-0.5">
                                <TrendingUp className="w-4 h-4 text-[#005792] dark:text-cyan-400" />
                                <span>Kurva Aktivitas Layanan Terpadu</span>
                            </h3>
                        </div>

                        {/* Legend Indicators */}
                        <div className="flex items-center gap-3 text-xs font-sans">
                            <div className="flex items-center gap-1.5">
                                <span className="w-3 h-3 rounded-md bg-[#005792] dark:bg-cyan-400 shadow-sm"></span>
                                <span className="text-slate-700 dark:text-slate-300 font-medium text-[11px]">Servis & Order</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="w-3 h-3 rounded-md bg-amber-500 shadow-sm"></span>
                                <span className="text-slate-700 dark:text-slate-300 font-medium text-[11px]">Leads & Konsultasi</span>
                            </div>
                        </div>
                    </div>

                    {/* SVG Interactive Chart Box */}
                    <div className="relative w-full aspect-[16/8] min-h-[220px] rounded-2xl bg-gradient-to-b from-slate-50 to-white dark:from-slate-900/40 dark:to-transparent border border-slate-100 dark:border-white/5 p-2 overflow-hidden">
                        <svg
                            viewBox={`0 0 ${svgChartBounds.width} ${svgChartBounds.height}`}
                            className="w-full h-full overflow-visible"
                            preserveAspectRatio="none"
                        >
                            <defs>
                                {/* Linear Gradient for Primary Wave */}
                                <linearGradient id="langitPrimaryGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#005792" stopOpacity="0.45" />
                                    <stop offset="60%" stopColor="#06b6d4" stopOpacity="0.15" />
                                    <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                                </linearGradient>
                                {/* Glow Filter for Paths */}
                                <filter id="glowWave" x="-20%" y="-20%" width="140%" height="140%">
                                    <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#005792" floodOpacity="0.3" />
                                </filter>
                            </defs>

                            {/* Background Horizontal Gridlines */}
                            {[0.2, 0.5, 0.8].map((ratio, idx) => {
                                const yPos = svgChartBounds.paddingY + (svgChartBounds.height - svgChartBounds.paddingY * 2) * ratio;
                                return (
                                    <line
                                        key={idx}
                                        x1={svgChartBounds.paddingX}
                                        y1={yPos}
                                        x2={svgChartBounds.width - svgChartBounds.paddingX}
                                        y2={yPos}
                                        stroke="currentColor"
                                        className="text-slate-200 dark:text-white/5"
                                        strokeDasharray="4 4"
                                    />
                                );
                            })}

                            {/* Gradient Area Fill */}
                            <motion.path
                                initial={{ opacity: 0, d: splinePathPrimary }}
                                animate={{ opacity: 1, d: areaPathPrimary }}
                                transition={{ duration: 0.8, ease: 'easeOut' }}
                                fill="url(#langitPrimaryGrad)"
                            />

                            {/* Secondary Wave Spline */}
                            <motion.path
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 1, ease: 'easeInOut' }}
                                d={splinePathSecondary}
                                fill="none"
                                stroke="#f59e0b"
                                strokeWidth="2.5"
                                strokeDasharray="5 3"
                                strokeLinecap="round"
                            />

                            {/* Primary Wave Spline Line */}
                            <motion.path
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 1.2, ease: 'easeInOut' }}
                                d={splinePathPrimary}
                                fill="none"
                                stroke="#005792"
                                className="dark:stroke-cyan-400"
                                strokeWidth="3.5"
                                strokeLinecap="round"
                                filter="url(#glowWave)"
                            />

                            {/* Data Points & Interactive Target Nodes */}
                            {chartCoordinates.map((coord, idx) => {
                                const isHovered = hoveredDataPoint?.idx === idx;
                                return (
                                    <g key={idx} className="cursor-pointer">
                                        {/* Invisible touch/hover area */}
                                        <rect
                                            x={coord.x - 20}
                                            y={0}
                                            width={40}
                                            height={svgChartBounds.height}
                                            fill="transparent"
                                            onMouseEnter={() => setHoveredDataPoint({ idx, ...coord })}
                                            onMouseLeave={() => setHoveredDataPoint(null)}
                                        />

                                        {/* Vertical dashed guide line on hover */}
                                        {isHovered && (
                                            <line
                                                x1={coord.x}
                                                y1={svgChartBounds.paddingY}
                                                x2={coord.x}
                                                y2={svgChartBounds.height - svgChartBounds.paddingY}
                                                stroke="#005792"
                                                className="dark:stroke-cyan-400"
                                                strokeWidth="1.5"
                                                strokeDasharray="3 3"
                                            />
                                        )}

                                        {/* Outer Halo on primary point */}
                                        <circle
                                            cx={coord.x}
                                            cy={coord.y1}
                                            r={isHovered ? 8 : 4}
                                            className={`transition-all duration-300 ${
                                                isHovered
                                                    ? 'fill-[#005792] dark:fill-cyan-400 fill-opacity-30 stroke-[#005792] dark:stroke-cyan-300'
                                                    : 'fill-white dark:fill-slate-900 stroke-[#005792] dark:stroke-cyan-400'
                                            }`}
                                            strokeWidth="2.5"
                                        />

                                        {/* Secondary Point node */}
                                        <circle
                                            cx={coord.x}
                                            cy={coord.y2}
                                            r={isHovered ? 6 : 3}
                                            className="fill-white dark:fill-slate-900 stroke-amber-500"
                                            strokeWidth="2"
                                        />
                                    </g>
                                );
                            })}
                        </svg>

                        {/* Interactive Floating Tooltip */}
                        <AnimatePresence>
                            {hoveredDataPoint && (
                                <motion.div
                                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 4, scale: 0.95 }}
                                    transition={{ duration: 0.15 }}
                                    style={{
                                        position: 'absolute',
                                        left: `${(hoveredDataPoint.x / svgChartBounds.width) * 100}%`,
                                        top: '12%',
                                        transform: 'translateX(-50%)',
                                        pointerEvents: 'none'
                                    }}
                                    className="z-20 min-w-36 p-3 rounded-2xl bg-white/95 dark:bg-[#0c101d]/95 backdrop-blur-xl border border-slate-200 dark:border-white/15 shadow-xl text-xs space-y-1.5"
                                >
                                    <div className="flex items-center justify-between gap-3 border-b border-slate-100 dark:border-white/10 pb-1">
                                        <span className="font-bold text-slate-800 dark:text-white">
                                            {hoveredDataPoint.data.date}
                                        </span>
                                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                            {hoveredDataPoint.data.growth}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-[11px]">
                                        <span className="text-slate-500">Servis & Order:</span>
                                        <span className="font-extrabold text-[#005792] dark:text-cyan-400">
                                            {hoveredDataPoint.data.primary} aksi
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-[11px]">
                                        <span className="text-slate-500">Leads Konsultasi:</span>
                                        <span className="font-bold text-amber-500">
                                            {hoveredDataPoint.data.secondary} prospek
                                        </span>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Bottom Axis Date Labels */}
                    <div className="flex items-center justify-between px-2 pt-3 text-[11px] font-sans font-medium text-slate-500 dark:text-slate-400">
                        {timeSeriesData.map((d, i) => (
                            <span 
                                key={i}
                                className={`transition-colors ${
                                    hoveredDataPoint?.idx === i ? 'text-[#005792] dark:text-cyan-400 font-bold' : ''
                                }`}
                            >
                                {d.label}
                            </span>
                        ))}
                    </div>

                    {/* Footer KPI Summary Bar */}
                    <div className="grid grid-cols-3 gap-3 pt-4 mt-3 border-t border-slate-100 dark:border-white/5 text-center">
                        <div className="p-2 rounded-xl bg-[#EDF9FC]/60 dark:bg-white/[0.02] border border-[#005792]/10 dark:border-white/5">
                            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Volume Tertinggi</span>
                            <span className="text-sm font-extrabold text-slate-900 dark:text-white font-heading mt-0.5 block">
                                {peakVolume} aksi / interval
                            </span>
                        </div>
                        <div className="p-2 rounded-xl bg-[#EDF9FC]/60 dark:bg-white/[0.02] border border-[#005792]/10 dark:border-white/5">
                            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Rata-rata Harian</span>
                            <span className="text-sm font-extrabold text-[#005792] dark:text-cyan-400 font-heading mt-0.5 block">
                                {dailyAverage} Throughput
                            </span>
                        </div>
                        <div className="p-2 rounded-xl bg-[#EDF9FC]/60 dark:bg-white/[0.02] border border-[#005792]/10 dark:border-white/5">
                            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Tingkat Layanan Selesai</span>
                            <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 font-heading mt-0.5 block">
                                {kpi.service_completion_rate}% Tuntas
                            </span>
                        </div>
                    </div>
                </div>

                {/* 2. DONUT / RADIAL 7 DIVISIONS COMPOSITION (5 COLS ON LARGE) */}
                <div className="lg:col-span-5 p-6 rounded-3xl bg-white dark:bg-[#090D16] border border-slate-200/90 dark:border-white/10 shadow-sm dark:shadow-xl flex flex-col justify-between transition-colors">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                                Portfolio Share & Workload
                            </span>
                            <h3 className="font-heading font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2 mt-0.5">
                                <PieChart className="w-4 h-4 text-cyan-500" />
                                <span>Distribusi Porsi 7 Divisi</span>
                            </h3>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#005792]/10 text-[#005792] dark:bg-cyan-500/15 dark:text-cyan-300 border border-[#005792]/20 dark:border-cyan-500/30">
                            {totalActiveProjects} Unit Kerja
                        </span>
                    </div>

                    {/* Donut Graphic + Center Callout */}
                    <div className="relative flex items-center justify-center my-2">
                        <svg width="200" height="200" viewBox="0 0 200 200" className="transform -rotate-90">
                            {divisionsDistribution.map((div, i) => {
                                const strokeDasharray = `${(div.percentage / 100) * donutCircumference} ${donutCircumference}`;
                                const precedingOffset = divisionsDistribution
                                    .slice(0, i)
                                    .reduce((sum, item) => sum + (item.percentage / 100) * donutCircumference, 0);
                                const strokeDashoffset = -precedingOffset;
                                const isCurrent = hoveredDivision?.id === div.id;

                                return (
                                    <circle
                                        key={div.id}
                                        cx="100"
                                        cy="100"
                                        r={donutRadius}
                                        fill="transparent"
                                        stroke={div.color}
                                        strokeWidth={isCurrent ? 24 : 18}
                                        strokeDasharray={strokeDasharray}
                                        strokeDashoffset={strokeDashoffset}
                                        className="transition-all duration-300 cursor-pointer"
                                        strokeLinecap="round"
                                        onMouseEnter={() => setHoveredDivision(div)}
                                        onMouseLeave={() => setHoveredDivision(null)}
                                        style={{
                                            filter: isCurrent ? `drop-shadow(0px 0px 8px ${div.color})` : 'none'
                                        }}
                                    />
                                );
                            })}
                        </svg>

                        {/* Center Hole Content */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                                {hoveredDivision ? hoveredDivision.name : 'Total Proyek'}
                            </span>
                            <span className="text-2xl font-extrabold font-heading text-slate-900 dark:text-white leading-none my-0.5">
                                {hoveredDivision ? `${hoveredDivision.percentage}%` : totalActiveProjects}
                            </span>
                            <span className="text-[11px] font-semibold text-[#005792] dark:text-cyan-400">
                                {hoveredDivision ? `${hoveredDivision.count} Proyek/Item` : 'Aktif Berjalan'}
                            </span>
                        </div>
                    </div>

                    {/* Division Breakdown Progress Bars List */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-2 border-t border-slate-100 dark:border-white/5 max-h-64 overflow-y-auto pr-1">
                        {divisionsDistribution.map((div) => {
                            const isHovered = hoveredDivision?.id === div.id;
                            return (
                                <div
                                    key={div.id}
                                    onMouseEnter={() => setHoveredDivision(div)}
                                    onMouseLeave={() => setHoveredDivision(null)}
                                    className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                                        isHovered 
                                            ? 'bg-slate-100 dark:bg-white/10 shadow-sm' 
                                            : 'hover:bg-slate-50 dark:hover:bg-white/[0.03]'
                                    }`}
                                >
                                    <div className="flex items-center justify-between text-xs mb-1">
                                        <div className="flex items-center gap-1.5 min-w-0">
                                            <span className="text-xs shrink-0">{div.icon}</span>
                                            <div className="min-w-0">
                                                <span className="font-bold text-slate-800 dark:text-slate-200 block text-[11px] truncate leading-tight">
                                                    {div.name}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0 ml-1">
                                            <span className="font-extrabold text-slate-900 dark:text-white text-[11px] block">
                                                {div.percentage}%
                                            </span>
                                            <span className="text-[9.5px] text-slate-500 font-medium block">
                                                {div.count} unit
                                            </span>
                                        </div>
                                    </div>
                                    <div className="w-full h-1.5 rounded-full bg-slate-200/80 dark:bg-white/10 overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${div.percentage}%` }}
                                            transition={{ duration: 0.8, ease: 'easeOut' }}
                                            className="h-full rounded-full"
                                            style={{ backgroundColor: div.color }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

            </div>

            {/* 3. THREE VELOCITY & EFFICIENCY METERS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 rounded-3xl bg-white dark:bg-[#090D16] border border-cyan-500/20 shadow-sm dark:shadow-xl flex items-center gap-4 transition-colors">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400 shrink-0">
                        <Zap className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                            Respon Lead & Konsultasi
                        </span>
                        <div className="flex items-baseline gap-2 mt-0.5">
                            <span className="text-2xl font-extrabold font-heading text-slate-900 dark:text-white">
                                {kpi.lead_response_rate}%
                            </span>
                            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                {kpi.leads_responded} / {kpi.leads_total} Terkelola
                            </span>
                        </div>
                        <span className="text-[11px] text-slate-500 block mt-0.5">
                            {kpi.leads_total > 0 ? 'Konsultasi & Kemitraan terespon via WhatsApp' : 'Belum ada permintaan konsultasi pending'}
                        </span>
                    </div>
                </div>

                <div className="p-5 rounded-3xl bg-white dark:bg-[#090D16] border border-orange-500/20 shadow-sm dark:shadow-xl flex items-center gap-4 transition-colors">
                    <div className="w-12 h-12 rounded-2xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-600 dark:text-orange-400 shrink-0">
                        <Clock className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                            Penyelesaian Servis Komputer
                        </span>
                        <div className="flex items-baseline gap-2 mt-0.5">
                            <span className="text-2xl font-extrabold font-heading text-slate-900 dark:text-white">
                                {kpi.service_completion_rate}%
                            </span>
                            <span className="text-xs font-semibold text-orange-600 dark:text-orange-400">
                                {kpi.tickets_completed} / {kpi.tickets_total} Selesai
                            </span>
                        </div>
                        <span className="text-[11px] text-slate-500 block mt-0.5">
                            {kpi.tickets_total - kpi.tickets_completed > 0 
                                ? `${kpi.tickets_total - kpi.tickets_completed} unit sedang dalam pengerjaan teknisi`
                                : 'Semua unit servis telah rampung'}
                        </span>
                    </div>
                </div>

                <div className="p-5 rounded-3xl bg-white dark:bg-[#090D16] border border-emerald-500/20 shadow-sm dark:shadow-xl flex items-center gap-4 transition-colors">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                            Kesiapan Gear & Kamera
                        </span>
                        <div className="flex items-baseline gap-2 mt-0.5">
                            <span className="text-2xl font-extrabold font-heading text-slate-900 dark:text-white">
                                {kpi.gear_utility_rate}%
                            </span>
                            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                {kpi.stock_available} / {kpi.stock_total} Standby
                            </span>
                        </div>
                        <span className="text-[11px] text-slate-500 block mt-0.5">
                            {kpi.stock_total - kpi.stock_available > 0
                                ? `${kpi.stock_available} unit siap pakai (${kpi.stock_total - kpi.stock_available} unit booked / standby)`
                                : 'Seluruh inventaris kamera & lighting standby 100%'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
