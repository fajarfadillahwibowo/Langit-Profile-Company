import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from '@inertiajs/react';
import { 
    GraduationCap, BookOpen, Clock, Users, ChevronDown, CheckCircle2,
    ArrowRight, Star, X, Check, Loader2, Sparkles, Award, Cpu,
    Layers, Monitor, Wrench, FileSpreadsheet, Compass, Terminal, ShieldCheck,
    Send, Laptop, Bot, Flame
} from 'lucide-react';

export default function InteractiveEducationHub({ courses = [] }) {
    const [activeTab, setActiveTab] = useState('curriculum'); // 'curriculum' | 'lab' | 'matchmaker'
    const [selectedTrack, setSelectedTrack] = useState('coding'); // 'coding' | 'office' | 'hardware'
    const [openWeek, setOpenWeek] = useState(0);

    // Matchmaker Quiz State
    const [quizAnswers, setQuizAnswers] = useState({ focus: '', goal: '' });
    const [quizResult, setQuizResult] = useState(null);

    // Inquire Modal State (No Price)
    const [inquiryCourse, setInquiryCourse] = useState(null);
    const [formInquiry, setFormInquiry] = useState({ name: '', email: '', whatsapp: '', notes: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [inquirySuccess, setInquirySuccess] = useState(false);

    const tracksData = {
        coding: {
            title: 'Kursus Coding (Robotik, Web Dev & AI)',
            tagline: 'Logika Pemrograman, IoT Mikrokontroler, Fullstack Web & AI Engineering',
            icon: Cpu,
            color: '#10B981',
            badge: 'Teknologi & Software',
            mentor: { name: 'Rian Hidayat', role: 'Principal Tech Lead @ Langit' },
            duration: '10 Minggu (30 Pertemuan Praktik)',
            workstation: 'Apple M-Series / High-End Core i7 Workstation + Kit Robotik ESP32 & Sensor IoT',
            capstone: 'Membangun Web Application Interaktif Berbasis REST API & Otomasi AI',
            syllabus: [
                { week: 'Minggu 1 - 3', title: 'Fondasi Logika Pemrograman & Robotik IoT', detail: 'Pengenalan algoritma, bahasa Python/JavaScript, serta pemrograman mikrokontroler Arduino/ESP32 dengan sensor aktuator.' },
                { week: 'Minggu 4 - 6', title: 'Modern Fullstack Web Development', detail: 'Desain antarmuka responsif dengan Tailwind v4, komponen interaktif React, pengelolaan state, dan koneksi API backend.' },
                { week: 'Minggu 7 - 8', title: 'Implementasi Artificial Intelligence (AI)', detail: 'Pemanfaatan OpenAI API, prompt engineering sistemik, dan integrasi automasi cerdas ke dalam software bisnis.' },
                { week: 'Minggu 9 - 10', title: 'Capstone Project Komersial & Deployment', detail: 'Mengerjakan studi kasus ril klien ekosistem Langit, code review mendalam, dan penerbitan portofolio online.' },
            ],
            skills: ['Python', 'JavaScript', 'React.js', 'Tailwind CSS', 'Arduino/ESP32', 'REST API', 'OpenAI API', 'Git & GitHub']
        },
        office: {
            title: 'Kursus Office (Microsoft Office & Google Workspace)',
            tagline: 'Standar Administrasi Perkantoran Modern, Spreadsheet Otomatis & Kolaborasi Cloud',
            icon: FileSpreadsheet,
            color: '#0EA5E9',
            badge: 'Administrasi Profesional',
            mentor: { name: 'Siti Nurhaliza', role: 'Office Administration & Data Specialist' },
            duration: '6 Minggu (18 Pertemuan Praktik)',
            workstation: 'Dual-Monitor Business PC + Akses Lisensi Resmi Microsoft 365 & Google Workspace',
            capstone: 'Sistem Pembukuan Kas, Rekapitulasi Data Otomatis & Dashboard Eksekutif',
            syllabus: [
                { week: 'Minggu 1 - 2', title: 'Microsoft Word Standar Korporat', detail: 'Format dokumen bisnis profesional, surat menyurat massal (Mail Merge), sitasi otomatis, dan standarisasi proposal resmi.' },
                { week: 'Minggu 3 - 4', title: 'Mastering Microsoft Excel & Data Analytics', detail: 'Rumus logika bertingkat, XLOOKUP/VLOOKUP, Pivot Table dinamis, visualisasi grafik data, dan proteksi sheet data sensitif.' },
                { week: 'Minggu 5', title: 'PowerPoint & Visual Presentation Modern', detail: 'Prinsip desain presentasi berdampak tinggi, infografis korporat, layout master slide, dan teknik pitching efektif.' },
                { week: 'Minggu 6', title: 'Kolaborasi Cloud & Automasi Form Administrasi', detail: 'Integrasi Google Docs, Sheets, Drive terpusat, pengolahan Google Forms, dan manajemen arsip digital anti-kehilangan.' },
            ],
            skills: ['MS Word', 'MS Excel Advanced', 'PowerPoint Bento', 'Google Sheets', 'Google Workspace', 'Mail Merge', 'Pivot Tables']
        },
        hardware: {
            title: 'Kursus Rakit Komputer & Hardware Lab',
            tagline: 'Perakitan PC Custom Estetik, Micro-Soldering, Thermal Service & Diagnostic Lab',
            icon: Wrench,
            color: '#F97316',
            badge: 'Teknikal & Reparasi Hardware',
            mentor: { name: 'Agus Prasetyo', role: 'Hardware Lab Specialist @ Langit' },
            duration: '4 Minggu (12 Pertemuan Praktik)',
            workstation: 'ESD Safe Workstation + Toolkit Presisi, Solder Station, Thermal Imager, dan Multi-meter',
            capstone: 'Perakitan PC Custom Estetik + Stress Test 3DMark & Diagnostic Kerusakan Komputer',
            syllabus: [
                { week: 'Minggu 1', title: 'Arsitektur Komponen & Kompatibilitas Sistem', detail: 'Memahami soket prosesor Intel/AMD, generasi RAM DDR4/DDR5, form-factor motherboard, dan efisiensi PSU modular.' },
                { week: 'Minggu 2', title: 'Praktik Rakit PC Lengkap & Cable Management', detail: 'Pemasangan prosesor aman anti-pin bengkok, thermal paste spread, watercooling AIO, dan seni cable management rapi di belakang casing.' },
                { week: 'Minggu 3', title: 'Setup BIOS/UEFI, Instalasi OS & Driver GPU', detail: 'Konfigurasi XMP/EXPO RAM, booting instalasi Windows 11 bersih tanpa bloatware, dan optimasi performa grafis gaming/editing.' },
                { week: 'Minggu 4', title: 'Troubleshooting, Micro-Soldering & Stress Testing', detail: 'Teknik analisa debug code LED, penanganan PC no display, penggantian thermal paste, dan uji stabilitas hardware.' },
            ],
            skills: ['PC Custom Assembly', 'Cable Management', 'BIOS/UEFI Tuning', 'Thermal Repasting', 'Hardware Diagnostic', 'OS Clean Install', 'Benchmarking']
        }
    };

    const labStations = [
        {
            title: 'Workstation Coding & Software Studio',
            tag: 'Fullstack & AI Lab',
            desc: 'Disediakan workstation performa tinggi dengan monitor dual-screen, keyboard mekanikal, lingkungan Linux/macOS, dan koneksi internet fiber optik stabil untuk kenyamanan coding berjam-jam.',
            equipment: ['Dual-Screen 24" IPS Display', 'High-Speed NVMe Storage', 'Akses Repo Proyek Nyata Langit', 'Workstation Siap Pakai'],
            color: '#10B981',
            icon: Laptop,
        },
        {
            title: 'Hardware Testing & Micro-Soldering Bench',
            tag: 'Hardware Diagnostic Lab',
            desc: 'Meja kerja khusus anti-statis (ESD-safe) dilengkapi solder station presisi, blower uap panas, mikroskop servis, multimeter digital, serta berbagai komponen PC untuk dibongkar pasang langsung.',
            equipment: ['Anti-Static ESD Workbench', 'Micro-Soldering Station', 'Thermal Paste Grade Industri', 'Komponen Uji Motherboard & GPU'],
            color: '#F97316',
            icon: Wrench,
        },
        {
            title: 'Executive Office & Data Command Suite',
            tag: 'Office Administration Hub',
            desc: 'Simulasi ruang kantor modern untuk melatih tata kelola administrasi dokumen, pengolahan spreadsheet keuangan, presentasi bisnis interaktif, dan kolaborasi cloud terpusat.',
            equipment: ['Multi-Tasking Workspace', 'Akses Enterprise Cloud Drive', 'Printer & Scanner Station', 'Template Dokumen Korporat Ril'],
            color: '#0EA5E9',
            icon: FileSpreadsheet,
        },
    ];

    const currentTrack = tracksData[selectedTrack];
    const TrackIcon = currentTrack.icon;

    const handleQuizSubmit = (focus, goal) => {
        let resultKey = 'coding';
        if (focus === 'hardware' || goal === 'service_shop') resultKey = 'hardware';
        else if (focus === 'admin' || goal === 'office_job') resultKey = 'office';
        else resultKey = 'coding';

        setQuizResult(tracksData[resultKey]);
    };

    const handleInquirySubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setTimeout(() => {
            setIsSubmitting(false);
            setInquirySuccess(true);
        }, 800);
    };

    return (
        <section id="education-hub" className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-16 border-t border-slate-200 dark:border-emerald-500/10">
            {/* Header Section */}
            <div className="text-center max-w-3xl mx-auto mb-10">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider mb-2 backdrop-blur-md">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>STUDIO LAB & KURIKULUM INTERAKTIF</span>
                </div>
                <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white tracking-tight">
                    Ekosistem Belajar Praktik Langsung di Industri
                </h2>
                <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-2 max-w-2xl mx-auto leading-relaxed">
                    Kami percaya keahlian lahir dari memegang langsung alat kerja industri, bukan sekadar teori. Eksplorasi kurikulum berbasis proyek ril, fasilitas lab kami, atau gunakan asisten penjurusan karir.
                </p>

                {/* 3 Main Interactive Navigation Tabs */}
                <div className="flex flex-wrap items-center justify-center gap-2 mt-7 p-1.5 bg-slate-200/70 dark:bg-white/[0.04] rounded-2xl border border-slate-300/80 dark:border-white/10 max-w-fit mx-auto shadow-sm">
                    <button
                        onClick={() => setActiveTab('curriculum')}
                        className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer ${
                            activeTab === 'curriculum'
                                ? 'bg-white dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 shadow-md border border-slate-200 dark:border-emerald-500/40'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                        <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Kurikulum & Proyek Capstone</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('lab')}
                        className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer ${
                            activeTab === 'lab'
                                ? 'bg-white dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 shadow-md border border-slate-200 dark:border-emerald-500/40'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                        <Monitor className="w-3.5 h-3.5 text-cyan-500" />
                        <span>Fasilitas Studio Lab</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('matchmaker')}
                        className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer ${
                            activeTab === 'matchmaker'
                                ? 'bg-white dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 shadow-md border border-slate-200 dark:border-emerald-500/40'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                        <Compass className="w-3.5 h-3.5 text-amber-500" />
                        <span>Asisten Penjurusan Karir</span>
                    </button>
                </div>
            </div>

            {/* TAB CONTENT WITH FLUID FRAMER MOTION ANIMATION */}
            <AnimatePresence mode="wait">
                {/* ── TAB 1: INTERACTIVE CURRICULUM & CAPSTONE BREAKDOWN ── */}
                {activeTab === 'curriculum' && (
                    <motion.div
                        key="curriculum"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        transition={{ duration: 0.35 }}
                        className="space-y-8"
                    >
                        {/* Track Selector Bar (Coding / Office / Hardware) */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {Object.entries(tracksData).map(([key, data]) => {
                                const Icon = data.icon;
                                const isSelected = selectedTrack === key;
                                return (
                                    <div
                                        key={key}
                                        onClick={() => { setSelectedTrack(key); setOpenWeek(0); }}
                                        className={`cursor-pointer p-5 rounded-3xl border transition-all duration-300 flex flex-col justify-between group ${
                                            isSelected
                                                ? 'bg-slate-50 dark:bg-[#071914] border-emerald-500 shadow-xl ring-2 ring-emerald-500/20 scale-[1.02]'
                                                : 'bg-white/70 dark:bg-white/[0.02] border-slate-200 dark:border-white/10 hover:border-emerald-500/40'
                                        }`}
                                    >
                                        <div>
                                            <div className="flex items-center justify-between mb-3">
                                                <div 
                                                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                                                    style={{ backgroundColor: `${data.color}20`, color: data.color }}
                                                >
                                                    <Icon className="w-5 h-5" />
                                                </div>
                                                <span 
                                                    className="text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold border"
                                                    style={{ 
                                                        backgroundColor: isSelected ? `${data.color}20` : 'rgba(255,255,255,0.05)',
                                                        color: isSelected ? data.color : undefined,
                                                        borderColor: isSelected ? `${data.color}50` : 'rgba(255,255,255,0.1)'
                                                    }}
                                                >
                                                    {data.badge}
                                                </span>
                                            </div>

                                            <h4 className="font-heading font-extrabold text-base text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                                {data.title}
                                            </h4>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                                                {data.tagline}
                                            </p>
                                        </div>

                                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[11px] font-mono">
                                            <span className="text-slate-500">{data.duration}</span>
                                            <span className="font-bold flex items-center gap-1" style={{ color: data.color }}>
                                                <span>Pilih Silabus</span>
                                                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Active Curriculum Detailed Showcase */}
                        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#071914]/90 border border-emerald-500/30 shadow-2xl space-y-6 relative overflow-hidden">
                            {/* Ambient Track Glow */}
                            <div 
                                className="absolute -top-20 -right-20 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none"
                                style={{ backgroundColor: currentTrack.color }}
                            />

                            {/* Header Info */}
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200/80 dark:border-white/10">
                                <div className="flex items-center gap-3.5">
                                    <div 
                                        className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg"
                                        style={{ backgroundColor: `${currentTrack.color}25`, color: currentTrack.color }}
                                    >
                                        <TrackIcon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-heading font-extrabold text-xl sm:text-2xl text-slate-900 dark:text-white">
                                            {currentTrack.title}
                                        </h3>
                                        <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-slate-500 dark:text-slate-400 mt-1">
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3.5 h-3.5 text-emerald-500" />
                                                {currentTrack.duration}
                                            </span>
                                            <span>•</span>
                                            <span className="flex items-center gap-1">
                                                <Award className="w-3.5 h-3.5 text-amber-500" />
                                                Sertifikasi Kelulusan Resmi
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 shrink-0">
                                    <button
                                        onClick={() => {
                                            setInquiryCourse(currentTrack);
                                            setInquirySuccess(false);
                                        }}
                                        className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                                    >
                                        <span>Konsultasi & Silabus Lengkap</span>
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>

                            {/* Two-Column Grid: Timeline on Left, Mentor & Capstone on Right */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                                {/* Left: Week-by-Week Timeline (8 Cols) */}
                                <div className="lg:col-span-7 space-y-3">
                                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 block mb-2">
                                        Rincian Modul & Alur Belajar Mingguan:
                                    </span>
                                    {currentTrack.syllabus.map((syl, sIdx) => {
                                        const isOpen = openWeek === sIdx;
                                        return (
                                            <div
                                                key={sIdx}
                                                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                                                    isOpen
                                                        ? 'bg-slate-50 dark:bg-white/[0.05] border-emerald-500/50 shadow-md'
                                                        : 'bg-white/50 dark:bg-white/[0.02] border-slate-200/80 dark:border-white/5 hover:border-slate-300'
                                                }`}
                                            >
                                                <button
                                                    onClick={() => setOpenWeek(isOpen ? null : sIdx)}
                                                    className="w-full p-4 text-left flex items-center justify-between gap-3 cursor-pointer"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <span 
                                                            className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md"
                                                            style={{ backgroundColor: `${currentTrack.color}20`, color: currentTrack.color }}
                                                        >
                                                            {syl.week}
                                                        </span>
                                                        <h5 className="font-heading font-bold text-sm text-slate-900 dark:text-white">
                                                            {syl.title}
                                                        </h5>
                                                    </div>
                                                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                                                </button>

                                                {isOpen && (
                                                    <div className="px-4 pb-4 pt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-white/5 mt-1">
                                                        {syl.detail}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Right: Mentor, Workstation & Capstone Box (5 Cols) */}
                                <div className="lg:col-span-5 space-y-4">
                                    {/* Capstone Card */}
                                    <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 space-y-2.5">
                                        <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                                            <Award className="w-4 h-4" />
                                            <span>Proyek Akhir (Capstone Project)</span>
                                        </div>
                                        <h5 className="font-heading font-extrabold text-sm text-slate-900 dark:text-white">
                                            {currentTrack.capstone}
                                        </h5>
                                        <p className="text-[11px] text-slate-500 leading-relaxed">
                                            Bukan sekadar latihan buku teks. Setiap siswa menyelesaikan portofolio siap kerja yang langsung dapat dipresentasikan ke calon klien atau perusahaan rekruter.
                                        </p>
                                    </div>

                                    {/* Workstation Lab Info */}
                                    <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 space-y-2">
                                        <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400 uppercase">
                                            <Monitor className="w-4 h-4" />
                                            <span>Workstation Studio Disediakan</span>
                                        </div>
                                        <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                                            {currentTrack.workstation}
                                        </p>
                                    </div>

                                    {/* Mentor Badge */}
                                    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center font-bold text-emerald-600 dark:text-emerald-300 text-sm shrink-0">
                                            {currentTrack.mentor.name.charAt(0)}
                                        </div>
                                        <div>
                                            <span className="text-xs font-bold text-slate-900 dark:text-white block">
                                                {currentTrack.mentor.name}
                                            </span>
                                            <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 block">
                                                {currentTrack.mentor.role}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Tech Badge Chips */}
                                    <div className="flex flex-wrap gap-1.5 pt-1">
                                        {currentTrack.skills.map((skill, skIdx) => (
                                            <span 
                                                key={skIdx}
                                                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[10px] font-mono text-slate-600 dark:text-slate-400 font-semibold"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ── TAB 2: INTERACTIVE STUDIO LAB FACILITIES ── */}
                {activeTab === 'lab' && (
                    <motion.div
                        key="lab"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        transition={{ duration: 0.35 }}
                        className="space-y-6"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {labStations.map((station, idx) => {
                                const StationIcon = station.icon;
                                return (
                                    <div
                                        key={idx}
                                        className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#071914]/90 border border-slate-200 dark:border-white/10 hover:border-emerald-500/50 shadow-xl transition-all flex flex-col justify-between group"
                                    >
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div 
                                                    className="w-11 h-11 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-md"
                                                    style={{ backgroundColor: `${station.color}20`, color: station.color }}
                                                >
                                                    <StationIcon className="w-5 h-5" />
                                                </div>
                                                <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 font-bold text-slate-500">
                                                    {station.tag}
                                                </span>
                                            </div>

                                            <h4 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                                                {station.title}
                                            </h4>

                                            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                                {station.desc}
                                            </p>

                                            <div className="pt-3 border-t border-slate-100 dark:border-white/5 space-y-1.5">
                                                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block mb-1">
                                                    Perangkat yang Tersedia:
                                                </span>
                                                {station.equipment.map((eq, eIdx) => (
                                                    <div key={eIdx} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                                        <span className="text-[11px]">{eq}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/5">
                                            <Link
                                                href="/konsultasi"
                                                className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-emerald-500 hover:text-slate-950 dark:bg-white/5 dark:hover:bg-emerald-500 dark:hover:text-slate-950 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                                            >
                                                <span>Jadwalkan Kunjungan Lab</span>
                                                <ArrowRight className="w-3.5 h-3.5" />
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}

                {/* ── TAB 3: INTERACTIVE COURSE & CAREER MATCHMAKER (QUIZ) ── */}
                {activeTab === 'matchmaker' && (
                    <motion.div
                        key="matchmaker"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        transition={{ duration: 0.35 }}
                        className="max-w-3xl mx-auto"
                    >
                        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#071914]/90 border border-emerald-500/30 shadow-2xl space-y-6">
                            <div className="text-center space-y-1">
                                <span className="text-xs font-mono font-bold text-emerald-500 uppercase">
                                    2-Minute Career Compass
                                </span>
                                <h3 className="font-heading font-extrabold text-2xl text-slate-900 dark:text-white">
                                    Temukan Kelas Terbaik Sesuai Minat & Target Anda
                                </h3>
                                <p className="text-xs text-slate-500 max-w-md mx-auto">
                                    Jawab 2 pertanyaan singkat di bawah untuk mendapatkan rekomendasi silabus dan jalur karir yang paling tepat.
                                </p>
                            </div>

                            {/* Question 1 */}
                            <div className="space-y-2.5">
                                <label className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 block">
                                    1. Bidang apa yang paling ingin Anda kuasai?
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {[
                                        { id: 'coding', title: 'Software & Robotik AI', desc: 'Pemrograman web, aplikasi, dan robotik IoT' },
                                        { id: 'office', title: 'Administrasi & Data', desc: 'Spreadsheet Excel, laporan Word, Google Docs' },
                                        { id: 'hardware', title: 'Teknisi PC & Hardware', desc: 'Rakit PC, diagnosa komponen, perbaikan hardware' },
                                    ].map((opt) => (
                                        <button
                                            key={opt.id}
                                            type="button"
                                            onClick={() => setQuizAnswers(prev => ({ ...prev, focus: opt.id }))}
                                            className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                                                quizAnswers.focus === opt.id
                                                    ? 'bg-emerald-500/15 border-emerald-500 text-slate-900 dark:text-white ring-2 ring-emerald-500/30'
                                                    : 'bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/10 hover:border-emerald-500/40'
                                            }`}
                                        >
                                            <span className="font-bold text-xs block">{opt.title}</span>
                                            <span className="text-[10px] text-slate-500 block mt-0.5">{opt.desc}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Question 2 */}
                            <div className="space-y-2.5">
                                <label className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 block">
                                    2. Apa tujuan utama Anda setelah lulus kelas?
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {[
                                        { id: 'work_industry', title: 'Bekerja di Industri', desc: 'Mendapat pekerjaan profesional atau freelance global' },
                                        { id: 'service_shop', title: 'Buka Jasa / Usaha Sendiri', desc: 'Mendirikan studio digital atau jasa servis rakit PC' },
                                        { id: 'upgrade_skill', title: 'Tingkatkan Produktivitas', desc: 'Efisiensi tugas kantor atau tugas perkuliahan' },
                                    ].map((opt) => (
                                        <button
                                            key={opt.id}
                                            type="button"
                                            onClick={() => setQuizAnswers(prev => ({ ...prev, goal: opt.id }))}
                                            className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                                                quizAnswers.goal === opt.id
                                                    ? 'bg-emerald-500/15 border-emerald-500 text-slate-900 dark:text-white ring-2 ring-emerald-500/30'
                                                    : 'bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/10 hover:border-emerald-500/40'
                                            }`}
                                        >
                                            <span className="font-bold text-xs block">{opt.title}</span>
                                            <span className="text-[10px] text-slate-500 block mt-0.5">{opt.desc}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Trigger Result */}
                            {quizAnswers.focus && quizAnswers.goal && (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="p-5 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 space-y-3"
                                >
                                    <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                        <CheckCircle2 className="w-4 h-4" />
                                        <span>Rekomendasi Kelas Paling Tepat untuk Anda:</span>
                                    </div>
                                    {(() => {
                                        const res = tracksData[quizAnswers.focus] || tracksData.coding;
                                        return (
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                <div>
                                                    <h4 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white">
                                                        {res.title}
                                                    </h4>
                                                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                                                        Durasi: {res.duration} • Fasilitas: Workstation Lab Khusus
                                                    </p>
                                                </div>

                                                <a
                                                    href={`https://wa.me/6281234567892?text=${encodeURIComponent(`Halo Langit Education, saya telah mencoba kuis rekomendasi kelas dan tertarik untuk konsultasi silabus serta jadwal batch baru program: ${res.title}.`)}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-transform hover:scale-105 active:scale-95 shrink-0"
                                                >
                                                    <span>Konsultasi Kelas via WhatsApp</span>
                                                    <ArrowRight className="w-3.5 h-3.5" />
                                                </a>
                                            </div>
                                        );
                                    })()}
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Inquire Silabus Modal (No Public Price Tag!) */}
            {inquiryCourse && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xl animate-in fade-in duration-200">
                    <div className="relative max-w-lg w-full bg-white dark:bg-[#071914] border border-slate-200 dark:border-emerald-500/40 rounded-3xl p-6 md:p-8 shadow-2xl">
                        <button
                            onClick={() => setInquiryCourse(null)}
                            className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-mono text-xs uppercase mb-1">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Inquiry & Silabus Portal</span>
                        </div>
                        <h3 className="font-heading font-extrabold text-2xl text-slate-900 dark:text-white mb-1">
                            Konsultasi Program & Jadwal
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mb-6">
                            Program yang dipilih: <strong className="text-emerald-600 dark:text-emerald-400">{inquiryCourse.title}</strong>
                        </p>

                        {inquirySuccess ? (
                            <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
                                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto">
                                    <Check className="w-6 h-6 stroke-[3]" />
                                </div>
                                <h4 className="text-base font-bold text-slate-900 dark:text-white">Permintaan Berhasil Terkirim!</h4>
                                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                                    Tim akademik Langit Education akan segera menghubungi WhatsApp Anda untuk mengirimkan dokumen silabus lengkap serta jadwal batch kelas terdekat.
                                </p>
                                <button
                                    onClick={() => setInquiryCourse(null)}
                                    className="mt-2 px-6 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
                                >
                                    Tutup
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleInquirySubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-mono text-slate-700 dark:text-slate-300 mb-1">Nama Lengkap *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formInquiry.name}
                                        onChange={(e) => setFormInquiry({ ...formInquiry, name: e.target.value })}
                                        placeholder="Contoh: Muhammad Raihan"
                                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-emerald-500"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-mono text-slate-700 dark:text-slate-300 mb-1">Email Aktif *</label>
                                        <input
                                            type="email"
                                            required
                                            value={formInquiry.email}
                                            onChange={(e) => setFormInquiry({ ...formInquiry, email: e.target.value })}
                                            placeholder="nama@domain.com"
                                            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-emerald-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-mono text-slate-700 dark:text-slate-300 mb-1">WhatsApp Aktif *</label>
                                        <input
                                            type="text"
                                            required
                                            value={formInquiry.whatsapp}
                                            onChange={(e) => setFormInquiry({ ...formInquiry, whatsapp: e.target.value })}
                                            placeholder="0812xxxxxxx"
                                            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-emerald-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-mono text-slate-700 dark:text-slate-300 mb-1">Target Belajar / Pertanyaan</label>
                                    <textarea
                                        rows={2}
                                        value={formInquiry.notes}
                                        onChange={(e) => setFormInquiry({ ...formInquiry, notes: e.target.value })}
                                        placeholder="Tuliskan jadwal yang Anda inginkan (weekday/weekend) atau target keahlian..."
                                        className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-emerald-500"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-transform active:scale-95 disabled:opacity-50 cursor-pointer"
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4" />
                                            <span>Kirim Permintaan Silabus & Jadwal</span>
                                        </>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </section>
    );
}
