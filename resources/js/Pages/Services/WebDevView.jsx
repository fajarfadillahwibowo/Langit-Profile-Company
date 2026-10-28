import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import PublicLayout from '@/Layouts/PublicLayout';
import MultiDeviceMockup from '@/Components/MultiDeviceMockup';
import WebPerformanceDuel from '@/Components/WebPerformanceDuel';
import WebArchitectureCockpit from '@/Components/WebArchitectureCockpit';
import WebSolutionCard3D from '@/Components/WebSolutionCard3D';
import ScrollingWebDevPillars from '@/Components/ScrollingWebDevPillars';
import { 
    Terminal, Zap, ShieldCheck, Layers, Database,
    ArrowRight, Sparkles,
    Building2, Briefcase, GraduationCap, ShoppingBag, Calendar, Newspaper, Rocket, Server
} from 'lucide-react';

export default function WebDevView({ service, portfolios = [], estimatorComponents = [] }) {
    const [selectedCategory, setSelectedCategory] = useState('all');

    const categories = [
        { id: 'all', label: 'Semua Solusi', count: 8 },
        { id: 'enterprise', label: 'Enterprise & ERP', count: 3 },
        { id: 'commerce', label: 'E-Commerce & Promosi', count: 2 },
        { id: 'services', label: 'Pendidikan & Booking', count: 3 },
    ];

    const webSolutions = [
        {
            num: '01',
            title: 'Website Operasi Internal Perusahaan',
            badge: 'Enterprise & ERP',
            category: 'enterprise',
            desc: 'Sistem manajemen operasional terpusat untuk efisiensi bisnis: absensi karyawan, inventaris stok, approval hierarki, dan monitoring KPI real-time.',
            icon: Building2,
            features: ['Multi-Level User Roles & Permissions', 'Manajemen Inventori & Gudang', 'Dashboard Laporan & Ekspor Excel/PDF', 'Sistem Absensi & Notifikasi WhatsApp'],
            color: '#0EA5E9',
        },
        {
            num: '02',
            title: 'Website Profile Perusahaan (Company Profile)',
            badge: 'Corporate Branding',
            category: 'enterprise',
            desc: 'Website representasi korporasi berdesain modern, elegan, dan berbobot. Meningkatkan reputasi serta kepercayaan klien, mitra, dan calon investor.',
            icon: Briefcase,
            features: ['Desain Bento Eksklusif & Interaktif', 'Bilingual (Indonesia & English)', 'Optimasi SEO & Google Search Console', 'Panel CMS Manajemen Berita/Artikel'],
            color: '#6366F1',
        },
        {
            num: '03',
            title: 'Website Pendidikan (Akademik & Absensi)',
            badge: 'EdTech & SIAKAD',
            category: 'services',
            desc: 'Platform digital terintegrasi untuk sekolah, kampus, dan bimbel: absensi siswa/guru berbasis QR/kartu, portal nilai, raport online, dan PPDB.',
            icon: GraduationCap,
            features: ['Absensi QR & Notifikasi Otomatis ke Ortu', 'SIAKAD & Rekap Raport Digital', 'Portal Pembayaran SPP / Tagihan', 'Sistem Pendaftaran Siswa Baru (PPDB)'],
            color: '#10B981',
        },
        {
            num: '04',
            title: 'Toko Online & E-Commerce Terpadu',
            badge: 'Online Retail',
            category: 'commerce',
            desc: 'Platform jual-beli digital berkonversi tinggi dengan katalog modern, keranjang belanja, integrasi payment gateway QRIS/VA otomatis, dan hitung ongkir.',
            icon: ShoppingBag,
            features: ['Payment Gateway Otomatis (QRIS, VA, CC)', 'Integrasi Tarif Ongkir Seluruh Ekspedisi', 'Manajemen Varian & Stok Real-Time', 'One-Step Checkout Cepat'],
            color: '#F59E0B',
        },
        {
            num: '05',
            title: 'Sistem Booking & Reservasi Online',
            badge: 'Scheduling Hub',
            category: 'services',
            desc: 'Aplikasi reservasi jadwal layanan untuk studio fotografi, persewaan alat, dokter/klinik, maupun reservasi ruang dengan kalender interaktif.',
            icon: Calendar,
            features: ['Kalender Slot Waktu Real-Time Anti Bentrok', 'Deposit / Down Payment Gateway', 'Reminder Otomatis via WhatsApp', 'Tiket & Barcode Booking Digital'],
            color: '#EC4899',
        },
        {
            num: '06',
            title: 'Portal Berita, Media & Majalah Digital',
            badge: 'Publishing & Media',
            category: 'services',
            desc: 'Platform publikasi artikel dan media massa dengan CMS editor cepat, optimasi Google News, AMP support, dan penempatan banner periklanan.',
            icon: Newspaper,
            features: ['Editor Artikel Cepat & Kaya Fitur', 'Optimasi Indeksasi Google News', 'Slot Iklan Terstruktur & Analytics', 'Sistem Komentar & Multi-Author'],
            color: '#8B5CF6',
        },
        {
            num: '07',
            title: 'Landing Page Produk & Kampanye Promosi',
            badge: 'High-Converting Page',
            category: 'commerce',
            desc: 'Halaman promosi fokus penjualan dengan copywriting persuasif, animasi micro-interactions, loading kilat di bawah 1 detik, dan integrasi WhatsApp CS.',
            icon: Rocket,
            features: ['Loading Kilat Skor Core Web Vitals 95+', 'A/B Testing Ready & Analytics Tracking', 'Integrasi Tombol Direct WhatsApp', 'Visual 3D / Mockup Interaktif'],
            color: '#14B8A6',
        },
        {
            num: '08',
            title: 'Custom Web Application & SaaS',
            badge: 'Scalable Software',
            category: 'enterprise',
            desc: 'Pengembangan web app kustom sesuai alur bisnis unik Anda. Arsitektur backend yang siap diskalakan melayani ribuan request per detik.',
            icon: Server,
            features: ['Arsitektur API RESTful / GraphQL', 'Integrasi AI (OpenAI API, Automation)', 'Keamanan Standar OWASP & Enkripsi', 'Server Deployment & Maintenance'],
            color: '#F97316',
        },
    ];

    const filteredSolutions = selectedCategory === 'all' 
        ? webSolutions 
        : webSolutions.filter(s => s.category === selectedCategory);

    return (
        <PublicLayout activeService="web-development">
            <Head>
                <title>Web Development & Cyber-Architecture</title>
                <meta name="description" content="Arsitektur web modern berkinerja tinggi oleh Langit: Single Page Application (SPA), Custom CMS, integrasi Payment Gateway, dan skor kecepatan Google Lighthouse 95+." />
            </Head>

            {/* Atmosphere: IDE & Cyber-Architecture Blueprint Layout */}
            <div className="bg-[#EDF9FC] dark:bg-[#060B14] min-h-screen text-slate-800 dark:text-slate-100 bg-grid-pattern -mt-6 pt-6 transition-colors duration-300">
                {/* Hero Header: Cyber Blueprint & Modern Kinetic Atmosphere */}
                <section className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pt-8 pb-20 text-center overflow-hidden">
                    {/* Ambient Aurora Glow Layers */}
                    <div 
                        className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] sm:w-[840px] h-[480px] rounded-full blur-3xl pointer-events-none -z-10 animate-aurora-1"
                        style={{
                            background: 'radial-gradient(circle, rgba(14,165,233,0.18) 0%, rgba(99,102,241,0.12) 45%, transparent 70%)'
                        }}
                    />
                    <div 
                        className="absolute top-1/3 -right-20 w-[420px] h-[420px] rounded-full blur-3xl pointer-events-none -z-10 animate-aurora-2"
                        style={{
                            background: 'radial-gradient(circle, rgba(168,85,247,0.14) 0%, rgba(14,165,233,0.08) 50%, transparent 70%)'
                        }}
                    />

                    {/* Corner Blueprint Crosshairs / Tech Metadata */}
                    <div className="hidden xl:flex items-center justify-between absolute top-4 left-6 right-6 pointer-events-none text-[10px] font-mono text-slate-400 dark:text-slate-600">
                        <span className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-ping"></span>
                            COORD: 07°47'44"S 110°22'10"E [LANGIT_CORE]
                        </span>
                        <span>STACK: LARAVEL 13 • REACT 19 SPA • TAILWIND V4</span>
                    </div>

                    <div className="space-y-5 max-w-4xl mx-auto">
                        {/* Interactive Animated Badge */}
                        <motion.div 
                            initial={{ opacity: 0, y: -12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/80 dark:bg-cyan-500/10 border border-cyan-500/30 text-cyan-700 dark:text-cyan-300 text-xs font-mono tracking-wider shadow-sm backdrop-blur-md hover:border-cyan-400/60 transition-all cursor-default"
                        >
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <Terminal className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                            <span className="font-semibold">IDE & CYBER-ARCHITECTURE BLUEPRINT</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-800 dark:text-cyan-200 font-bold border border-cyan-500/30">
                                60 FPS SPA
                            </span>
                        </motion.div>

                        {/* Revised Headline without "Arsitektur Skala Jutaan Pengguna." */}
                        <motion.h1 
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="font-heading font-extrabold text-3xl sm:text-5xl lg:text-6xl text-slate-900 dark:text-white tracking-tight leading-[1.14]"
                        >
                            Aplikasi Web Super Cepat, <br className="hidden sm:inline" />
                            <span className="relative inline-block mt-1">
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 via-sky-500 to-violet-600 dark:from-cyan-300 dark:via-sky-200 dark:to-violet-400">
                                    Arsitektur Modern, Andal & Skalabel.
                                </span>
                                <motion.span
                                    initial={{ width: 0 }}
                                    animate={{ width: '100%' }}
                                    transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
                                    className="absolute -bottom-1 left-0 h-[2.5px] bg-gradient-to-r from-cyan-500 via-sky-400 to-violet-500 rounded-full opacity-60 dark:opacity-80"
                                />
                            </span>
                        </motion.h1>

                        {/* Subtitle */}
                        <motion.p 
                            initial={{ opacity: 0, y: 14 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.55, delay: 0.2 }}
                            className="text-slate-600 dark:text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed"
                        >
                            Kami tidak membuat website lambat berbasis template usang. Setiap proyek direkayasa dengan <span className="font-semibold text-slate-800 dark:text-slate-100">Laravel 13</span>, <span className="font-semibold text-slate-800 dark:text-slate-100">React SPA reaktif</span>, dan <span className="font-semibold text-slate-800 dark:text-slate-100">Tailwind v4</span> untuk skor Google Lighthouse di atas 95 serta kecepatan tanpa jeda reload.
                        </motion.p>

                        {/* CTA Buttons */}
                        <motion.div 
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.28 }}
                            className="pt-2 flex flex-wrap items-center justify-center gap-3"
                        >
                            <a
                                href="#interactive-arena"
                                className="relative group px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-lg shadow-cyan-500/25 transition-all hover:scale-105 active:scale-95 overflow-hidden"
                            >
                                <span className="relative z-10">Uji Balap Kinerja & Alur Sistem</span>
                                <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
                                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                            </a>

                            <Link
                                href="/konsultasi"
                                className="px-5 py-3 rounded-xl bg-white/80 hover:bg-white dark:bg-white/5 dark:hover:bg-white/10 text-slate-900 dark:text-white border border-slate-300 dark:border-white/10 text-sm font-semibold transition-all hover:border-cyan-500/50 shadow-sm"
                            >
                                Konsultasi Arsitektur Web
                            </Link>
                        </motion.div>

                        {/* 4 Feature Key Highlights */}
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.35 }}
                            className="pt-4 flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-[11px] sm:text-xs font-mono text-slate-600 dark:text-slate-400"
                        >
                            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100/80 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/5">
                                <Zap className="w-3.5 h-3.5 text-amber-500" />
                                <span>Skor Lighthouse 99+</span>
                            </span>
                            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100/80 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/5">
                                <Layers className="w-3.5 h-3.5 text-cyan-500" />
                                <span>SPA 0ms Page Reload</span>
                            </span>
                            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100/80 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/5">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                                <span>OWASP Security Hardened</span>
                            </span>
                            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100/80 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/5">
                                <Database className="w-3.5 h-3.5 text-teal-500" />
                                <span>Enterprise MySQL 8 ACID Storage</span>
                            </span>
                        </motion.div>
                    </div>

                    {/* Interactive Live Architecture Cockpit & Benchmark Terminal */}
                    <WebArchitectureCockpit />
                </section>

                {/* 0. Jenis Solusi Website yang Kami Kembangkan (3D Animated Cards Bogdan Zhuk Style) */}
                <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-16 border-t border-slate-200 dark:border-white/10">
                    <div className="text-center max-w-3xl mx-auto mb-12">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider mb-2">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Katalog Solusi Pengembangan Web</span>
                        </div>
                        <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white tracking-tight">
                            Jenis Website & Sistem Digital yang Kami Buat
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-2 max-w-2xl mx-auto leading-relaxed">
                            Setiap solusi direkayasa dengan kartu 3D berinteraktivitas penuh: efek kemiringan giroskopis, pantulan cahaya dinamis, dan visual preview miniatur interaktif.
                        </p>

                        {/* Interactive Category Filter Pills */}
                        <div className="flex flex-wrap items-center justify-center gap-2 mt-7">
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={`relative px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                                        selectedCategory === cat.id
                                            ? 'text-cyan-700 dark:text-cyan-300 shadow-sm border border-cyan-500/40 bg-cyan-500/10 dark:bg-cyan-500/20'
                                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200/80 dark:border-white/10 bg-white/60 dark:bg-white/[0.02]'
                                    }`}
                                >
                                    <span>{cat.label}</span>
                                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                                        selectedCategory === cat.id 
                                            ? 'bg-cyan-500/30 text-cyan-800 dark:text-cyan-200' 
                                            : 'bg-slate-100 dark:bg-white/5 text-slate-500'
                                    }`}>
                                        {cat.count}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 3D Interactive Cards Grid */}
                    <motion.div 
                        layout 
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                    >
                        <AnimatePresence mode="popLayout">
                            {filteredSolutions.map((sol, idx) => (
                                <motion.div
                                    key={sol.num}
                                    layout
                                    initial={{ opacity: 0, scale: 0.92, y: 15 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.92, y: 15 }}
                                    transition={{ duration: 0.35, delay: idx * 0.05 }}
                                    className="h-full"
                                >
                                    <WebSolutionCard3D sol={sol} idx={idx} />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                </section>

                {/* 3D Stacked Card Scrolling Experience: 7 Pilar Rekayasa Web & Sistem Digital */}
                <ScrollingWebDevPillars />

                {/* 1. Interactive Multi-Device Mockup Previewer (PRD 4.2) */}
                <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-12">
                    <div className="mb-6 text-center max-w-2xl mx-auto">
                        <span className="text-xs font-mono text-cyan-600 dark:text-cyan-400 uppercase tracking-wider block mb-1">
                            Live Multi-Device Viewport Tester
                        </span>
                        <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white">
                            Uji Responsivitas Langsung di Layar Anda
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-1">
                            Pilih proyek dan ganti mode viewport antara Desktop, Tablet, dan Mobile untuk melihat adaptasi layout sistem secara real-time.
                        </p>
                    </div>

                    <MultiDeviceMockup portfolios={portfolios} />
                </section>

                {/* 2. Interactive Performance Duel & Engineering Lifecycle Arena */}
                <WebPerformanceDuel />
            </div>
        </PublicLayout>
    );
}
