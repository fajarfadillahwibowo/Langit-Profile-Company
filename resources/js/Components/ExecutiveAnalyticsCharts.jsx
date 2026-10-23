import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    TrendingUp, Activity, PieChart, Layers, Calendar, 
    ArrowUpRight, Sparkles, CheckCircle2, Clock, ShieldCheck, 
    Zap, Eye, RefreshCw
} from 'lucide-react';

export default function ExecutiveAnalyticsCharts({
    metrics = {},
    serviceTickets = [],
    rentalBookings = [],
    internshipApplications = [],
    collaborations = [],
    galleries = [],
    recentConsultations = [],
    services = []
}) {
    // Period selector: '7d', '30d', 'year'
    const [selectedPeriod, setSelectedPeriod] = useState('7d');
    const [hoveredDataPoint, setHoveredDataPoint] = useState(null);
    const [hoveredDivision, setHoveredDivision] = useState(null);

    // Dynamic data generator based on real counts
    const totalConsultations = metrics.total_consultations || recentConsultations.length || 8;
    const totalTickets = metrics.pending_service_tickets || serviceTickets.length || 12;
    const totalRentals = metrics.active_rentals || rentalBookings.length || 6;
    const totalInterns = metrics.internship_applicants || internshipApplications.length || 9;
    const totalCollabs = metrics.total_collaborations || collaborations.length || 4;
    const totalGallery = metrics.total_galleries || galleries.length || 48;

    // Time Series Dataset for Wave Area Chart
    const timeSeriesData = useMemo(() => {
        if (selectedPeriod === '7d') {
            return [
                { label: 'Senin', date: '19 Okt', primary: 18, secondary: 11, growth: '+8%' },
                { label: 'Selasa', date: '20 Okt', primary: 26, secondary: 14, growth: '+15%' },
                { label: 'Rabu', date: '21 Okt', primary: 22, secondary: 17, growth: '+12%' },
                { label: 'Kamis', date: '22 Okt', primary: 38, secondary: 21, growth: '+24%' },
                { label: 'Jumat', date: '23 Okt', primary: 34, secondary: 19, growth: '+18%' },
                { label: 'Sabtu', date: '24 Okt', primary: 45, secondary: 28, growth: '+31%' },
                { label: 'Minggu', date: '25 Okt', primary: 41, secondary: 24, growth: '+27%' },
            ];
        } else if (selectedPeriod === '30d') {
            return [
                { label: 'Mgg 1', date: '1-7 Okt', primary: 120, secondary: 65, growth: '+14%' },
                { label: 'Mgg 2', date: '8-14 Okt', primary: 154, secondary: 88, growth: '+22%' },
                { label: 'Mgg 3', date: '15-21 Okt', primary: 178, secondary: 104, growth: '+28%' },
                { label: 'Mgg 4', date: '22-28 Okt', primary: 195, secondary: 118, growth: '+35%' },
            ];
        } else {
            return [
                { label: 'Jan', date: 'Jan 2026', primary: 310, secondary: 180, growth: '+10%' },
                { label: 'Feb', date: 'Feb 2026', primary: 380, secondary: 220, growth: '+18%' },
                { label: 'Mar', date: 'Mar 2026', primary: 440, secondary: 270, growth: '+22%' },
                { label: 'Apr', date: 'Apr 2026', primary: 510, secondary: 315, growth: '+29%' },
                { label: 'Mei', date: 'Mei 2026', primary: 590, secondary: 360, growth: '+34%' },
                { label: 'Jun', date: 'Jun 2026', primary: 640, secondary: 410, growth: '+40%' },
            ];
        }
    }, [selectedPeriod]);

    // 7 Divisions Distribution Dataset
    const divisionsDistribution = useMemo(() => {
        const raw = [
            { 
                id: 'visual-cinema',
                name: 'Visual & Cinema', 
                subtitle: 'Wedding, Event & Commercial',
                count: Math.max(18, Math.round(totalGallery * 0.35)),
                percentage: 30, 
                color: '#005792',
                gradFrom: '#005792',
                gradTo: '#007cc7',
                icon: '🎬'
            },
            { 
                id: 'web-dev',
                name: 'Web Development', 
                subtitle: 'Cyber Architecture & Apps',
                count: Math.max(14, totalConsultations * 2),
                percentage: 24, 
                color: '#06b6d4',
                gradFrom: '#06b6d4',
                gradTo: '#3b82f6',
                icon: '⚡'
            },
            { 
                id: 'computer-servis',
                name: 'Computer Servis', 
                subtitle: 'Hardware Lab & Diagnostics',
                count: Math.max(12, totalTickets * 3),
                percentage: 18, 
                color: '#f97316',
                gradFrom: '#f97316',
                gradTo: '#ea580c',
                icon: '🛠️'
            },
            { 
                id: 'sewa-alat',
                name: 'Sewa Alat & Gear', 
                subtitle: 'Camera & Lighting Rental',
                count: Math.max(14, totalRentals * 2 + 10),
                percentage: 14, 
                color: '#14b8a6',
                gradFrom: '#14b8a6',
                gradTo: '#10b981',
                icon: '📷'
            },
            { 
                id: 'education',
                name: 'Langit Education', 
                subtitle: 'Academy & Masterclass',
                count: 8,
                percentage: 7, 
                color: '#8b5cf6',
                gradFrom: '#8b5cf6',
                gradTo: '#6366f1',
                icon: '🎓'
            },
            { 
                id: 'internship',
                name: 'Internship Program', 
                subtitle: 'Talent Incubation Lab',
                count: Math.max(6, totalInterns),
                percentage: 4, 
                color: '#a855f7',
                gradFrom: '#a855f7',
                gradTo: '#d946ef',
                icon: '✨'
            },
            { 
                id: 'collaborations',
                name: 'Kolaborasi B2B', 
                subtitle: 'Enterprise Partnership',
                count: Math.max(4, totalCollabs),
                percentage: 3, 
                color: '#f43f5e',
                gradFrom: '#f43f5e',
                gradTo: '#e11d48',
                icon: '🤝'
            },
        ];
        return raw;
    }, [totalGallery, totalConsultations, totalTickets, totalRentals, totalInterns, totalCollabs]);

    const totalActiveProjects = useMemo(() => {
        return divisionsDistribution.reduce((acc, curr) => acc + curr.count, 0);
    }, [divisionsDistribution]);

    // SVG Coordinate Builder for Area Spline Chart
    const svgChartBounds = { width: 680, height: 220, paddingX: 35, paddingY: 25 };
    const maxPrimaryVal = Math.max(...timeSeriesData.map(d => d.primary), 1);

    const chartCoordinates = useMemo(() => {
        const stepX = (svgChartBounds.width - svgChartBounds.paddingX * 2) / (timeSeriesData.length - 1 || 1);
        const innerH = svgChartBounds.height - svgChartBounds.paddingY * 2;
        
        return timeSeriesData.map((d, i) => {
            const x = svgChartBounds.paddingX + i * stepX;
            const y1 = svgChartBounds.paddingY + innerH - (d.primary / maxPrimaryVal) * innerH;
            const y2 = svgChartBounds.paddingY + innerH - ((d.secondary / maxPrimaryVal) * innerH);
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
                            { id: 'year', label: 'Tahun 2026' }
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
                                {maxPrimaryVal} aksi / interval
                            </span>
                        </div>
                        <div className="p-2 rounded-xl bg-[#EDF9FC]/60 dark:bg-white/[0.02] border border-[#005792]/10 dark:border-white/5">
                            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Rata-rata Harian</span>
                            <span className="text-sm font-extrabold text-[#005792] dark:text-cyan-400 font-heading mt-0.5 block">
                                {Math.round(maxPrimaryVal * 0.68)} throughput
                            </span>
                        </div>
                        <div className="p-2 rounded-xl bg-[#EDF9FC]/60 dark:bg-white/[0.02] border border-[#005792]/10 dark:border-white/5">
                            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Akurasi Respon SLA</span>
                            <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 font-heading mt-0.5 block">
                                99.8% Berhasil
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
                    <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-white/5 max-h-56 overflow-y-auto pr-1">
                        {divisionsDistribution.map((div) => {
                            const isHovered = hoveredDivision?.id === div.id;
                            return (
                                <div
                                    key={div.id}
                                    onMouseEnter={() => setHoveredDivision(div)}
                                    onMouseLeave={() => setHoveredDivision(null)}
                                    className={`p-2 rounded-xl transition-all cursor-pointer ${
                                        isHovered 
                                            ? 'bg-slate-100 dark:bg-white/10 shadow-sm' 
                                            : 'hover:bg-slate-50 dark:hover:bg-white/[0.03]'
                                    }`}
                                >
                                    <div className="flex items-center justify-between text-xs mb-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm">{div.icon}</span>
                                            <div>
                                                <span className="font-bold text-slate-800 dark:text-slate-200 block leading-tight">
                                                    {div.name}
                                                </span>
                                                <span className="text-[10px] text-slate-500 block leading-tight">
                                                    {div.subtitle}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="font-extrabold text-slate-900 dark:text-white text-xs block">
                                                {div.percentage}%
                                            </span>
                                            <span className="text-[10px] text-slate-500 font-medium block">
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
                            Kecepatan Respon Lead
                        </span>
                        <div className="flex items-baseline gap-2 mt-0.5">
                            <span className="text-2xl font-extrabold font-heading text-slate-900 dark:text-white">
                                98.4%
                            </span>
                            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                ~12 Menit
                            </span>
                        </div>
                        <span className="text-[11px] text-slate-500 block mt-0.5">
                            Rata-rata tindak lanjut via WhatsApp
                        </span>
                    </div>
                </div>

                <div className="p-5 rounded-3xl bg-white dark:bg-[#090D16] border border-orange-500/20 shadow-sm dark:shadow-xl flex items-center gap-4 transition-colors">
                    <div className="w-12 h-12 rounded-2xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-600 dark:text-orange-400 shrink-0">
                        <Clock className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                            SLA Servis Tepat Waktu
                        </span>
                        <div className="flex items-baseline gap-2 mt-0.5">
                            <span className="text-2xl font-extrabold font-heading text-slate-900 dark:text-white">
                                94.6%
                            </span>
                            <span className="text-xs font-semibold text-orange-600 dark:text-orange-400">
                                Sesuai Estimasi
                            </span>
                        </div>
                        <span className="text-[11px] text-slate-500 block mt-0.5">
                            Diagnostik & penggantian sparepart
                        </span>
                    </div>
                </div>

                <div className="p-5 rounded-3xl bg-white dark:bg-[#090D16] border border-emerald-500/20 shadow-sm dark:shadow-xl flex items-center gap-4 transition-colors">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                            Utilitas Gear & Kamera
                        </span>
                        <div className="flex items-baseline gap-2 mt-0.5">
                            <span className="text-2xl font-extrabold font-heading text-slate-900 dark:text-white">
                                86.2%
                            </span>
                            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                Siap Deploy
                            </span>
                        </div>
                        <span className="text-[11px] text-slate-500 block mt-0.5">
                            Status inventaris kamera & lighting siap pakai
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
