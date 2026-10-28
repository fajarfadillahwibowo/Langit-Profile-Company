import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import PublicLayout from '@/Layouts/PublicLayout';
import InteractiveInternshipCards from '@/Components/InteractiveInternshipCards';
import { 
    Sparkles, Upload, CheckCircle2, ArrowRight,
    Award, Loader2, FileText, MessageSquare, Key, Camera
} from 'lucide-react';

const defaultPositions = [
    {
        id: 1,
        title: 'Videographer',
        slug: 'videographer-intern',
        division_name: 'Photography & Videography',
        work_type: 'onsite',
        quota: 2,
        duration_months: 4,
        requirements_json: [
            'Menguasai pengoperasian kamera mirrorless / cinema camera & stabilizer gimbal',
            'Memahami komposisi visual, angle sinematik, camera movement, dan lighting dasar',
            'Menyukai dokumentasi event, wedding, commercial shoot, dan traveling visual',
        ],
    },
    {
        id: 2,
        title: 'Talent / Model',
        slug: 'talent-model-intern',
        division_name: 'Creative & Visual',
        work_type: 'onsite',
        quota: 2,
        duration_months: 3,
        requirements_json: [
            'Percaya diri di depan kamera untuk pemotretan foto komersial, video promosi & konten reel',
            'Mampu berekspresi natural, luwes, komunikatif, dan memiliki artikulasi bicara yang baik',
            'Tertarik dalam bidang fashion, brand photoshoot, commercial ads, dan lifestyle digital',
        ],
    },
    {
        id: 3,
        title: 'Editor',
        slug: 'editor-intern',
        division_name: 'Post-Production',
        work_type: 'hybrid',
        quota: 2,
        duration_months: 4,
        requirements_json: [
            'Mahir menggunakan software editing (Adobe Premiere Pro, DaVinci Resolve, atau CapCut PC)',
            'Memahami ritme pacing sinematik, sound design, transisi halus, dan dasar color grading',
            'Kreatif dalam merangkai alur cerita video pendek maupun dokumenter panjang',
        ],
    },
    {
        id: 4,
        title: 'Web Dev',
        slug: 'web-dev-intern',
        division_name: 'Web Development',
        work_type: 'hybrid',
        quota: 2,
        duration_months: 4,
        requirements_json: [
            'Memahami dasar HTML, CSS, JavaScript, serta dasar PHP/Laravel atau React.js',
            'Tertarik mempelajari arsitektur web modern, responsive UI, dan integrasi API',
            'Memiliki logika pemrograman yang baik, teliti, dan semangat memecahkan masalah',
        ],
    },
];

export default function InternshipView({ service, positions = [], galleries = [] }) {
    const activePositions = positions && positions.length > 0 ? positions : defaultPositions;
    const [selectedPositionId, setSelectedPositionId] = useState(activePositions[0]?.id || 1);
    
    // Application Form State
    const [formData, setFormData] = useState({
        full_name: '',
        institution_name: '',
        major: '',
        email: '',
        whatsapp: '',
        portfolio_url: '',
        motivation_letter: '',
    });
    const [cvFile, setCvFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);

    const journeySteps = [
        { 
            step: '01', 
            phase: 'FASE 01',
            tag: 'PORTFOLIO DROP',
            title: 'Submit CV & Portofolio', 
            desc: 'Unggah formulir pendaftaran, tautan showreel sinematik, GitHub repo, atau portofolio visual terbaik Anda tanpa birokrasi berbelit.',
            badge: '100% Digital Fast-Track',
            color: '#8B5CF6',
            rgb: '139, 92, 246',
            icon: Upload,
            deliverable: 'PDF / Showreel / Git'
        },
        { 
            step: '02', 
            phase: 'FASE 02',
            tag: 'CREATIVE INTERVIEW',
            title: 'Review & Creative Dialogue', 
            desc: 'Sesi bincang santai mengupas proses berpikir kreatif, taste estetika, dan keselarasan visi proyek bersama mentor divisi.',
            badge: '1-on-1 Mentor Session',
            color: '#EC4899',
            rgb: '236, 72, 153',
            icon: MessageSquare,
            deliverable: 'Creative Alignment'
        },
        { 
            step: '03', 
            phase: 'FASE 03',
            tag: 'STUDIO IMMERSION',
            title: 'Onboarding & Studio Access', 
            desc: 'Pengenalan ekosistem studio Langit, workstation spesifikasi tinggi, alur kerja Git/cloud, dan briefing standar industri.',
            badge: 'Studio Pass & Tool Access',
            color: '#005792',
            rgb: '0, 87, 146',
            icon: Key,
            deliverable: 'Workstation & Gear Access'
        },
        { 
            step: '04', 
            phase: 'FASE 04',
            tag: 'LIVE PRODUCTION',
            title: 'Real Client Commercial Project', 
            desc: 'Terjun langsung ke set komersial klien berbayar, mengoperasikan kamera sinema, atau menulis sistem produksi bersama tim inti.',
            badge: 'Commercial Production Credit',
            color: '#F59E0B',
            rgb: '245, 158, 11',
            icon: Camera,
            deliverable: 'Commercial Credit & Fee',
            isLive: true
        },
        { 
            step: '05', 
            phase: 'FASE 05',
            tag: 'OFFICIAL GRADUATION',
            title: 'Sertifikasi & Golden Ticket', 
            desc: 'Penerbitan surat keterangan magang resmi bernomor lisensi, portofolio rilisan komersial, serta prioritas rekrutmen tim tetap.',
            badge: 'Career Fast-Track & Hiring',
            color: '#10B981',
            rgb: '16, 185, 129',
            icon: Award,
            deliverable: 'Sertifikat & Golden Ticket'
        },
    ];

    const selectedPosition = activePositions.find(p => p.id === selectedPositionId) || activePositions[0];

    const handleSubmitApplication = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage(null);

        const data = new FormData();
        data.append('position_id', selectedPositionId);
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        if (cvFile) {
            data.append('cv_file', cvFile);
        }

        try {
            const res = await axios.post('/internship/apply', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.data.success) {
                setSuccessMessage(res.data.message);
                setFormData({
                    full_name: '',
                    institution_name: '',
                    major: '',
                    email: '',
                    whatsapp: '',
                    portfolio_url: '',
                    motivation_letter: '',
                });
                setCvFile(null);
            }
        } catch (err) {
            setErrorMessage(err.response?.data?.message || 'Gagal mengirim lamaran. Pastikan CV berformat PDF maksimal 5MB.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <PublicLayout activeService="internship">
            <Head>
                <title>Internship Program & Career Incubator</title>
                <meta name="description" content="Program magang bersertifikat Langit untuk mahasiswa dan siswa berprestasi di divisi Web Development, Fotografi/Videografi, dan Teknisi Komputer." />
            </Head>

            {/* Atmosphere: Startup Talent & Career Portal with Dual Theme Support */}
            <div className="bg-[#EDF9FC] text-slate-900 dark:bg-[#070b14] dark:text-slate-100 min-h-screen -mt-6 pt-6 transition-colors duration-300 relative overflow-hidden">
                {/* Artistic Volumetric Lighting Blobs */}
                <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[650px] sm:w-[900px] h-[400px] bg-gradient-to-tr from-[#005792]/20 via-purple-600/15 to-pink-500/10 blur-3xl rounded-full pointer-events-none -z-0" />
                <div className="absolute top-[480px] -left-20 w-[400px] h-[400px] bg-[#005792]/10 blur-3xl rounded-full pointer-events-none -z-0" />
                <div className="absolute top-[520px] -right-20 w-[400px] h-[400px] bg-purple-600/10 blur-3xl rounded-full pointer-events-none -z-0" />

                {/* Hero Header */}
                <section className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pt-8 pb-16 text-center space-y-6">
                    {/* Artistic Frosted Glass Badge with Live Pulse */}
                    <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/80 dark:bg-slate-900/80 border border-[#005792]/25 dark:border-sky-500/30 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,87,146,0.12)] text-xs font-mono tracking-wider font-semibold text-slate-700 dark:text-slate-200">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="text-[#005792] dark:text-sky-400 font-bold">NEXT-GEN INCUBATOR</span>
                        <span className="text-slate-300 dark:text-slate-600">/</span>
                        <span className="text-purple-600 dark:text-purple-300">BATCH 2026 OPEN ADMISSION</span>
                    </div>

                    {/* Headline with font-editorial italic */}
                    <h1 className="font-heading font-extrabold text-3xl sm:text-5xl lg:text-6xl xl:text-7xl text-slate-900 dark:text-white tracking-tight leading-[1.14] max-w-5xl mx-auto">
                        Akselerasi Karier Nyata di{' '}
                        <br className="hidden sm:inline" />
                        <span className="font-editorial italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-[#005792] via-purple-600 to-pink-500 dark:from-sky-300 dark:via-purple-300 dark:to-pink-300">
                            Garis Depan
                        </span>{' '}
                        Industri Kreatif & Digital.
                    </h1>

                    {/* Editorial Subheading */}
                    <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base lg:text-lg max-w-3xl mx-auto leading-relaxed">
                        Kami tidak menyuruh anak magang fotokopi dokumen atau sekadar merapikan file. Di Studio Langit, Anda mengoperasikan kamera sinema, mendeploy arsitektur kode produksi skala riil, dan mengeksekusi proyek komersial nyata bersama para mentor inti.
                    </p>

                    {/* Feature Highlight Pills */}
                    <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/70 dark:bg-white/5 border border-[#005792]/20 dark:border-white/10 text-xs font-medium text-slate-700 dark:text-slate-300 backdrop-blur-md shadow-sm">
                            <Camera className="w-3.5 h-3.5 text-[#005792] dark:text-sky-400" />
                            <span>Kamera Sinema & Studio Gear 4K</span>
                        </div>
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/70 dark:bg-white/5 border border-purple-500/20 dark:border-white/10 text-xs font-medium text-slate-700 dark:text-slate-300 backdrop-blur-md shadow-sm">
                            <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                            <span>Kode Produksi & Arsitektur Nyata</span>
                        </div>
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/70 dark:bg-white/5 border border-emerald-500/20 dark:border-white/10 text-xs font-medium text-slate-700 dark:text-slate-300 backdrop-blur-md shadow-sm">
                            <Award className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span>Proyek Komersial Berbayar & Rekrutmen</span>
                        </div>
                    </div>

                    {/* CTAs */}
                    <div className="pt-3 flex flex-wrap items-center justify-center gap-3.5">
                        <a
                            href="#form-pendaftaran"
                            className="group px-7 py-3.5 rounded-2xl bg-gradient-to-r from-[#005792] via-purple-600 to-indigo-600 hover:from-[#004270] hover:to-indigo-500 text-white font-bold text-sm sm:text-base flex items-center gap-2.5 shadow-xl shadow-[#005792]/25 hover:shadow-purple-600/35 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <span>Buka Form Pendaftaran Magang / PKL</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </a>
                        <a
                            href="#open-roles"
                            className="px-6 py-3.5 rounded-2xl bg-white/80 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-800 dark:text-white border border-[#005792]/25 dark:border-white/10 hover:border-[#005792]/60 text-sm sm:text-base font-semibold transition-all shadow-sm backdrop-blur-md flex items-center gap-2"
                        >
                            <span>Lihat 4 Posisi Divisi</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-[#005792] dark:bg-sky-400"></span>
                        </a>
                    </div>
                </section>

                {/* 1. Interactive Artistic Internship Journey Stepper */}
                <section className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-16 border-t border-slate-200/80 dark:border-white/10">
                    <div className="text-center max-w-3xl mx-auto mb-14">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#005792]/10 dark:bg-[#005792]/20 border border-[#005792]/30 text-[#005792] dark:text-sky-300 text-xs font-mono tracking-wider font-semibold uppercase mb-3">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Alur Perjalanan Magang</span>
                        </div>
                        <h2 className="font-heading font-extrabold text-2xl sm:text-4xl lg:text-5xl text-slate-900 dark:text-white tracking-tight">
                            Tahapan Seleksi hingga{' '}
                            <span className="font-editorial italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-[#005792] via-purple-600 to-pink-500 dark:from-sky-300 dark:via-purple-300 dark:to-pink-300">
                                Kelulusan & Karir.
                            </span>
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm max-w-xl mx-auto mt-2 leading-relaxed">
                            Proses seleksi transparan dan terukur tanpa tes hafalan teoritis. Kami menilai kreativitas, portofolio, dan semangat kolaborasi nyata.
                        </p>
                    </div>

                    {/* Creative Milestone Grid with Connected Transit Track on Desktop */}
                    <div className="relative">
                        {/* Connecting Trajectory Beam on Desktop */}
                        <div className="hidden lg:block absolute top-[52px] left-[7%] right-[7%] h-[2px] bg-gradient-to-r from-purple-500/40 via-[#005792]/50 to-emerald-500/50 pointer-events-none z-0" />

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 relative z-10">
                            {journeySteps.map((j) => {
                                const IconComponent = j.icon;
                                return (
                                    <div
                                        key={j.step}
                                        className="group relative rounded-3xl p-6 bg-white/85 dark:bg-[#0c1322]/85 backdrop-blur-2xl border border-[#005792]/20 dark:border-[#005792]/30 hover:border-[#005792]/70 dark:hover:border-sky-400/60 shadow-[0_10px_30px_-10px_rgba(0,87,146,0.08)] dark:shadow-[0_10px_35px_-10px_rgba(0,0,0,0.5)] hover:shadow-[0_20px_45px_-12px_rgba(0,87,146,0.25)] hover:-translate-y-2.5 transition-all duration-500 flex flex-col justify-between overflow-hidden"
                                    >
                                        {/* Desktop Milestone Node Dot */}
                                        <div
                                            className="hidden lg:flex absolute -top-[10px] left-1/2 -translate-x-1/2 w-5 h-5 rounded-full items-center justify-center border-2 border-white dark:border-[#070b14] shadow-md transition-transform duration-300 group-hover:scale-125 z-20"
                                            style={{ backgroundColor: j.color }}
                                        >
                                            <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                                        </div>

                                        {/* 3D Specular Sheen on Hover */}
                                        <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-transparent dark:from-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                                        {/* Ambient Color Glow matching card milestone */}
                                        <div
                                            className="absolute -top-10 -right-10 w-28 h-28 rounded-full blur-2xl opacity-15 group-hover:opacity-35 transition-opacity duration-500 pointer-events-none"
                                            style={{ backgroundColor: j.color }}
                                        />

                                        {/* Giant Artistic Watermark Number in background */}
                                        <div className="absolute top-1 right-3 text-6xl sm:text-7xl font-editorial italic font-normal text-slate-900/[0.04] dark:text-white/[0.06] group-hover:text-slate-900/[0.09] dark:group-hover:text-white/[0.12] transition-colors pointer-events-none select-none">
                                            {j.step}
                                        </div>

                                        {/* Top Card Content: Emblem & Phase */}
                                        <div className="relative z-10">
                                            <div className="flex items-center justify-between gap-2 mb-4">
                                                {/* 3D Glass Emblem Orb */}
                                                <div
                                                    className="w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-500 group-hover:scale-110 group-hover:rotate-3"
                                                    style={{
                                                        backgroundColor: `rgba(${j.rgb}, 0.12)`,
                                                        borderColor: `rgba(${j.rgb}, 0.35)`,
                                                        boxShadow: `0 8px 20px -4px rgba(${j.rgb}, 0.25)`
                                                    }}
                                                >
                                                    <IconComponent className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" style={{ color: j.color }} />
                                                </div>

                                                {/* Phase Badge */}
                                                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase border border-slate-200/80 dark:border-white/10 bg-slate-100/80 dark:bg-white/5 text-slate-700 dark:text-slate-300">
                                                    {j.isLive && (
                                                        <span className="relative flex h-1.5 w-1.5 mr-0.5">
                                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500"></span>
                                                        </span>
                                                    )}
                                                    <span>{j.phase}</span>
                                                </div>
                                            </div>

                                            {/* Milestone Title */}
                                            <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white group-hover:text-[#005792] dark:group-hover:text-sky-300 transition-colors tracking-tight leading-snug mb-2">
                                                {j.title}
                                            </h4>

                                            {/* Description */}
                                            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                                                {j.desc}
                                            </p>
                                        </div>

                                        {/* Bottom Card Content: Deliverable & Verified Status */}
                                        <div className="relative z-10 mt-6 pt-3.5 border-t border-slate-200/60 dark:border-white/10 flex flex-col gap-2">
                                            <div className="flex items-center justify-between text-[11px]">
                                                <span className="text-slate-400 dark:text-slate-500 font-mono text-[10px] uppercase tracking-wider">
                                                    Target:
                                                </span>
                                                <span className="font-semibold text-slate-700 dark:text-slate-300 text-[11px] truncate max-w-[125px]">
                                                    {j.deliverable}
                                                </span>
                                            </div>
                                            <div
                                                className="flex items-center gap-1.5 text-[11px] font-semibold transition-colors"
                                                style={{ color: j.color }}
                                            >
                                                <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                                                <span className="truncate">{j.badge}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* 2. Open Role Cards Deck (Pinterest Reference Animation) */}
                <InteractiveInternshipCards
                    positions={activePositions}
                    selectedPositionId={selectedPositionId}
                    onSelectPosition={(posId) => setSelectedPositionId(posId)}
                />

                {/* 4 Foto Dokumentasi Aktivitas & Fasilitas Magang (Konsisten dengan Backend Admin Galeri) */}
                {galleries && galleries.length > 0 && (
                    <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-12 border-t border-slate-200/80 dark:border-white/10">
                        <div className="text-center max-w-2xl mx-auto mb-8">
                            <span className="text-xs font-mono uppercase tracking-wider text-purple-600 dark:text-purple-400 font-semibold block mb-1">
                                Kultur & Pengalaman Magang Riil
                            </span>
                            <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white">
                                Suasana Onsite & Proyek Produksi Komersial
                            </h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                            {galleries.map((item) => (
                                <div key={item.id} className="group relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-white/10 shadow-md">
                                    <div className="relative aspect-[4/3] overflow-hidden">
                                        <img src={item.file_webp_path} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                                    </div>
                                    <div className="p-3.5 bg-white dark:bg-[#0c1322]">
                                        <span className="text-[10px] font-mono text-purple-600 dark:text-purple-400 uppercase font-semibold">{item.category}</span>
                                        <h4 className="font-heading font-bold text-xs text-slate-900 dark:text-white mt-1 line-clamp-1">{item.title}</h4>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* 3. Direct Application Form with CV Upload */}
                <section id="form-pendaftaran" className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto py-16 border-t border-slate-200 dark:border-white/10">
                    <div className="rounded-3xl bg-white dark:bg-[#120B24]/90 border border-slate-200 dark:border-purple-500/30 p-6 md:p-8 backdrop-blur-2xl shadow-xl dark:shadow-2xl">
                        <div className="mb-6">
                            <span className="text-xs font-mono text-purple-600 dark:text-purple-400 uppercase tracking-wider block mb-1 font-bold">
                                1. Form Pendaftaran Magang / PKL
                            </span>
                            <h3 className="font-heading font-bold text-2xl sm:text-3xl text-slate-900 dark:text-white">
                                Formulir Pendaftaran Program Magang Industri
                            </h3>
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                                Lengkapi data diri Anda di bawah ini dan unggah Curriculum Vitae (CV) terbaru dalam format PDF.
                            </p>

                            <div className="mt-4 p-3.5 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <label className="text-xs font-mono text-purple-800 dark:text-purple-300 font-bold">
                                    Pilih Posisi / Divisi Magang Pilihan:
                                </label>
                                <select
                                    value={selectedPositionId || ''}
                                    onChange={(e) => setSelectedPositionId(parseInt(e.target.value, 10))}
                                    className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-purple-300 dark:border-purple-500/40 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
                                >
                                    {activePositions.map((pos) => (
                                        <option key={pos.id} value={pos.id}>
                                            {pos.title} ({pos.division_name})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {successMessage ? (
                            <div className="p-8 rounded-2xl bg-purple-500/10 border border-purple-500/40 text-center space-y-4">
                                <div className="w-14 h-14 rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-300 flex items-center justify-center mx-auto">
                                    <Check className="w-8 h-8 stroke-[3]" />
                                </div>
                                <h4 className="text-xl font-bold text-slate-900 dark:text-white">Lamaran Berhasil Diterima!</h4>
                                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-md mx-auto">{successMessage}</p>
                                <button
                                    onClick={() => setSuccessMessage(null)}
                                    className="px-6 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs"
                                >
                                    Kirim Lamaran Lain
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmitApplication} className="space-y-4">
                                {errorMessage && (
                                    <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs">
                                        {errorMessage}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-mono text-slate-700 dark:text-slate-300 mb-1 font-medium">Nama Lengkap *</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.full_name}
                                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                            placeholder="Nama lengkap Anda..."
                                            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-purple-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-mono text-slate-700 dark:text-slate-300 mb-1 font-medium">Asal Sekolah / Kampus *</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.institution_name}
                                            onChange={(e) => setFormData({ ...formData, institution_name: e.target.value })}
                                            placeholder="Contoh: Universitas Gadjah Mada"
                                            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-purple-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-mono text-slate-700 dark:text-slate-300 mb-1 font-medium">Jurusan / Program Studi *</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.major}
                                            onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                                            placeholder="Contoh: Teknik Informatika / DKV"
                                            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-purple-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-mono text-slate-700 dark:text-slate-300 mb-1 font-medium">Nomor WhatsApp Aktif *</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.whatsapp}
                                            onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                                            placeholder="0812xxxxxxx"
                                            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-purple-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-mono text-slate-700 dark:text-slate-300 mb-1 font-medium">Email Aktif *</label>
                                        <input
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="nama@email.com"
                                            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-purple-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-mono text-slate-700 dark:text-slate-300 mb-1 font-medium">Tautan Portofolio (GitHub / Behance / Drive)</label>
                                        <input
                                            type="url"
                                            value={formData.portfolio_url}
                                            onChange={(e) => setFormData({ ...formData, portfolio_url: e.target.value })}
                                            placeholder="https://..."
                                            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-purple-500"
                                        />
                                    </div>
                                </div>

                                {/* PDF Upload Box */}
                                <div>
                                    <label className="block text-xs font-mono text-slate-700 dark:text-slate-300 mb-1 font-medium">Unggah Berkas CV (.PDF Maks 5MB) *</label>
                                    <div className="border-2 border-dashed border-purple-400 dark:border-purple-500/30 hover:border-purple-600 dark:hover:border-purple-500/60 rounded-2xl p-5 text-center cursor-pointer transition-colors bg-purple-50/50 dark:bg-white/[0.01]">
                                        <input
                                            type="file"
                                            id="cv_upload"
                                            accept=".pdf"
                                            onChange={(e) => setCvFile(e.target.files[0])}
                                            className="hidden"
                                        />
                                        <label htmlFor="cv_upload" className="cursor-pointer flex flex-col items-center">
                                            <Upload className="w-6 h-6 text-purple-600 dark:text-purple-400 mb-2" />
                                            {cvFile ? (
                                                <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                                                    <FileText className="w-4 h-4" />
                                                    {cvFile.name} ({(cvFile.size / 1024 / 1024).toFixed(2)} MB)
                                                </span>
                                            ) : (
                                                <>
                                                    <span className="text-xs text-slate-800 dark:text-slate-300 font-bold">Klik untuk memilih berkas CV PDF</span>
                                                    <span className="text-[10px] text-slate-500 font-mono mt-0.5">Format PDF sesuai standar PRD</span>
                                                </>
                                            )}
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-mono text-slate-700 dark:text-slate-300 mb-1 font-medium">Pesan Motivasi / Mengapa Ingin Magang di Langit?</label>
                                    <textarea
                                        rows={3}
                                        value={formData.motivation_letter}
                                        onChange={(e) => setFormData({ ...formData, motivation_letter: e.target.value })}
                                        placeholder="Ceritakan ketertarikan Anda dan apa yang ingin Anda ciptakan bersama kami..."
                                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-purple-500"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition-transform active:scale-98 disabled:opacity-50"
                                >
                                    {loading ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <>
                                            <span>Kirim Berkas Lamaran Magang</span>
                                            <ArrowRight className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>
                </section>
            </div>
        </PublicLayout>
    );
}
