import React, { useState, useRef } from 'react';
import { Head, Link } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import PublicLayout from '@/Layouts/PublicLayout';
import { 
    Handshake, Building2, GraduationCap, Award, Upload, FileText,
    ArrowRight, CheckCircle2, Check, Loader2, Sparkles, HeartHandshake,
    ShieldCheck, Zap, Clock, Users, Calendar, Phone, Mail, FileCheck,
    X, ExternalLink, ChevronRight, MessageSquare, BadgeCheck, AlertCircle
} from 'lucide-react';

export default function CollaborationView({ service }) {
    const [formData, setFormData] = useState({
        organization_name: '',
        pic_name: '',
        email: '',
        whatsapp: '',
        collab_type: 'media_partner',
        event_date: '',
        description: '',
    });
    const [proposalFile, setProposalFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);
    const formRef = useRef(null);

    // 4 Model Sinergi & Skema Kerja Sama (Bento Grid)
    const schemes = [
        {
            id: 'campus_visit',
            title: 'Kemitraan Kampus, SMK & Perguruan Tinggi',
            category: 'Pendidikan & Akademik',
            color: 'from-purple-500 to-indigo-600',
            borderGlow: 'hover:border-purple-500/50 hover:shadow-purple-500/10',
            bgBadge: 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300 border-purple-200 dark:border-purple-500/30',
            icon: GraduationCap,
            tagline: 'Membuka jembatan nyata antara dunia industri teknologi dengan kurikulum akademik masa depan.',
            highlights: [
                'Kunjungan Industri (Company Visit) & Sesi Kuliah Tamu Praktisi',
                'Program Magang & PKL Terstruktur Bersertifikat Industri',
                'Sinkronisasi Kurikulum & Kelas Industri Coding / Desain / AI',
                'Workshop Perakitan Hardware Komputer & Produksi Studio',
            ],
            metrics: '20+ Kampus & Sekolah Telah Berkolaborasi',
        },
        {
            id: 'media_partner',
            title: 'Media Partner & Event Sponsorship',
            category: 'Festival, Konser & Event',
            color: 'from-pink-500 to-rose-600',
            borderGlow: 'hover:border-pink-500/50 hover:shadow-pink-500/10',
            bgBadge: 'bg-pink-100 text-pink-700 dark:bg-pink-500/20 dark:text-pink-300 border-pink-200 dark:border-pink-500/30',
            icon: Sparkles,
            tagline: 'Dukungan publikasi visual sinematik skala besar untuk melipatgandakan antusiasme audiens.',
            highlights: [
                'Produksi Video Teaser, Reels, & Aftermovie Sinematik 4K',
                'Liputan Drone Aerial & Multi-Camera Photography Acara',
                'Dukungan Sewa Layar TV Display, Sound System, & Gear Studio',
                'Amplifikasi Media Sosial & Publikasi Jaringan Komunitas Kreatif',
            ],
            metrics: '45+ Event & Festival Terlaksana',
        },
        {
            id: 'b2b_project',
            title: 'Kerjasama Vendor B2B & Subkontrak (White-Label)',
            category: 'Enterprise & Agensi',
            color: 'from-blue-500 to-cyan-600',
            borderGlow: 'hover:border-cyan-500/50 hover:shadow-cyan-500/10',
            bgBadge: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300 border-cyan-200 dark:border-cyan-500/30',
            icon: Building2,
            tagline: 'Partner eksekusi terpercaya untuk agensi periklanan, software house, dan konsultan bisnis.',
            highlights: [
                'White-Label Web Architecture & Custom Application Development',
                'Subkontrak Kru Produksi Video Company Profile & Komersial TVC',
                'Pilot Drone Bersertifikat FPV & Aerial Inspection',
                'Jaminan Kerahasiaan Penuh (Strict Non-Disclosure Agreement)',
            ],
            metrics: '100% On-Time Delivery & SLA Terjamin',
        },
        {
            id: 'other',
            title: 'Komunitas Kreatif & Co-Creation Hub',
            category: 'Ekosistem & Komunitas',
            color: 'from-amber-500 to-orange-600',
            borderGlow: 'hover:border-amber-500/50 hover:shadow-amber-500/10',
            bgBadge: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 border-amber-200 dark:border-amber-500/30',
            icon: Award,
            tagline: 'Ruang kolaborasi terbuka untuk penggiat teknologi, kreator konten, dan komunitas lokal.',
            highlights: [
                'Co-hosting Workshop Teknologi, Hackathon, & Seminar IT',
                'Akses Fasilitas Studio Multimedia & Hardware Testing Lab',
                'Program Inkubasi Karya Kreatif & Mentoring Eksklusif',
                'Networking Session Bersama Praktisi dan Founder Startup',
            ],
            metrics: 'Open Sharing & Coworking Synergy',
        },
    ];

    // 4 Alur Pengajuan Kolaborasi yang Terstruktur
    const workflowSteps = [
        {
            step: '01',
            title: 'Pengiriman Berkas',
            desc: 'Unggah proposal resmi instansi atau event Anda via Dropzone Portal dalam format PDF.',
            icon: Upload,
        },
        {
            step: '02',
            title: 'Review Kilat 1x24 Jam',
            desc: 'Tim Partnership kami menelaah kesesuaian visi, jadwal, dan skema sinergi yang diajukan.',
            icon: Clock,
        },
        {
            step: '03',
            title: 'Diskusi & MoU Resmi',
            desc: 'Penyelarasan teknis, penandatanganan kesepakatan (MoU/PKS), serta penentuan PIC teknis.',
            icon: Handshake,
        },
        {
            step: '04',
            title: 'Eksekusi Kolaborasi',
            desc: 'Implementasi program berjalan dengan dukungan penuh infrastruktur dan talenta Langit.',
            icon: Zap,
        },
    ];

    // Quick Select Scheme and Scroll to Form
    const handleSelectScheme = (schemeId) => {
        setFormData(prev => ({ ...prev, collab_type: schemeId }));
        if (formRef.current) {
            formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    // File Drag & Drop Handlers
    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        validateAndSetFile(file);
    };

    const handleFileInput = (e) => {
        const file = e.target.files?.[0];
        validateAndSetFile(file);
    };

    const validateAndSetFile = (file) => {
        if (!file) return;
        if (file.type !== 'application/pdf') {
            setErrorMessage('Format berkas harus berupa dokumen PDF (.pdf).');
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            setErrorMessage('Ukuran berkas melebihi batas maksimal 10MB.');
            return;
        }
        setErrorMessage(null);
        setProposalFile(file);
    };

    const handleSubmitProposal = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage(null);

        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        if (proposalFile) {
            data.append('proposal_file', proposalFile);
        }

        try {
            const res = await axios.post('/kolaborasi/submit', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.data.success) {
                setSuccessMessage(res.data.message);
                setFormData({
                    organization_name: '',
                    pic_name: '',
                    email: '',
                    whatsapp: '',
                    collab_type: 'media_partner',
                    event_date: '',
                    description: '',
                });
                setProposalFile(null);
            }
        } catch (err) {
            setErrorMessage(err.response?.data?.message || 'Gagal mengirim pengajuan proposal. Mohon periksa kembali formulir Anda.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <PublicLayout activeService="kolaborasi">
            <Head>
                <title>Kemitraan Strategis, B2B & Kolaborasi Kampus — Langit Creative Ecosystem</title>
                <meta 
                    name="description" 
                    content="Portal kemitraan resmi Langit Creative: Media Partner, Sponsorship Event, Kunjungan Industri Kampus/SMK, dan White-Label Production Partner berstandar profesional." 
                />
            </Head>

            {/* Main Outer Container with Dynamic Atmosphere */}
            <div className="relative min-h-screen bg-[#EDF9FC] text-slate-800 dark:bg-[#080206] dark:text-slate-100 overflow-hidden transition-colors duration-300">
                {/* Ambient Blurred Glowing Blobs & Dot Grid Pattern */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[650px] pointer-events-none overflow-hidden z-0">
                    <div className="absolute -top-32 left-1/4 w-[500px] h-[500px] bg-rose-500/10 dark:bg-rose-600/15 rounded-full blur-[140px]" />
                    <div className="absolute top-20 right-10 w-[420px] h-[420px] bg-purple-500/10 dark:bg-purple-600/15 rounded-full blur-[140px]" />
                    <div className="absolute top-60 left-10 w-[360px] h-[360px] bg-amber-500/10 dark:bg-amber-600/10 rounded-full blur-[120px]" />
                </div>

                {/* Subtle Geometric Dot Mesh Overlay */}
                <div 
                    className="absolute inset-0 pointer-events-none opacity-[0.25] dark:opacity-[0.18] z-0"
                    style={{
                        backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
                        backgroundSize: '36px 36px',
                        maskImage: 'radial-gradient(ellipse 70% 60% at 50% 15%, black 30%, transparent 80%)',
                        WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 15%, black 30%, transparent 80%)',
                    }}
                />

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-24 space-y-24">
                    {/* SECTION 1: HERO HEADER (Awwwards / Linear Aesthetic) */}
                    <motion.section 
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                        className="text-center space-y-6 pt-4 sm:pt-8"
                    >
                        {/* Floating Live Indicator Badge */}
                        <motion.div 
                            animate={{ y: [0, -4, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 dark:bg-white/[0.04] border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-mono shadow-sm backdrop-blur-md"
                        >
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                            </span>
                            <span className="font-semibold tracking-wide uppercase text-[11px]">
                                Ekosistem Kemitraan & Sinergi B2B Nasional
                            </span>
                        </motion.div>

                        {/* Expressive Headline with Text-Gradient */}
                        <h1 className="font-heading font-extrabold text-4xl sm:text-6xl lg:text-7xl text-slate-900 dark:text-white tracking-tight leading-[1.1] max-w-5xl mx-auto">
                            Kolaborasi Nyata, <br className="hidden sm:inline" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 via-pink-500 to-amber-600 dark:from-rose-400 dark:via-pink-300 dark:to-amber-300">
                                Ciptakan Dampak Bersama Langit.
                            </span>
                        </h1>

                        {/* Persuasive Narrative */}
                        <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg max-w-3xl mx-auto leading-relaxed">
                            Kami menggabungkan kekuatan infrastruktur multimedia sinematik, kapabilitas software engineering, dan jejaring talenta digital untuk melipatgandakan nilai program Anda—mulai dari kampus, brand korporat, hingga event berskala besar.
                        </p>

                        {/* Action CTA Buttons */}
                        <div className="pt-4 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
                            <a
                                href="#dropzone-proposal"
                                className="group relative inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-600 to-rose-600 hover:from-rose-600 hover:to-pink-500 text-white font-bold text-sm shadow-xl shadow-rose-500/25 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
                            >
                                {/* Shimmer Sweep Effect */}
                                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
                                
                                <Upload className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
                                <span>Ajukan Proposal Kerja Sama</span>
                                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </a>

                            <a
                                href="https://wa.me/6282246142791?text=Halo%20Tim%20Partnership%20Langit,%20kami%20ingin%20berdiskusi%20mengenai%20peluang%20kerja%20sama."
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-white/80 hover:bg-white dark:bg-white/5 dark:hover:bg-white/10 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 text-sm font-semibold shadow-sm backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <Phone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                <span>Fast-Track WhatsApp PIC</span>
                            </a>
                        </div>

                        {/* Trust & Velocity Guarantee Bar */}
                        <div className="pt-6 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto">
                            {[
                                { icon: Clock, label: 'Telaah Cepat', desc: 'Respon awal < 24 Jam' },
                                { icon: ShieldCheck, label: 'Kerahasiaan Berkas', desc: '100% Non-Disclosure (NDA)' },
                                { icon: Users, label: 'Dedicated PIC', desc: 'Pendampingan langsung' },
                                { icon: BadgeCheck, label: 'Sinergi Terukur', desc: 'Benefit timbal balik nyata' },
                            ].map((item, idx) => {
                                const Icon = item.icon;
                                return (
                                    <div 
                                        key={idx}
                                        className="p-3.5 rounded-2xl bg-white/70 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5 backdrop-blur-md shadow-xs text-left flex items-center gap-3 transition-colors"
                                    >
                                        <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                                            <Icon className="w-4 h-4" />
                                        </div>
                                        <div className="min-w-0">
                                            <span className="font-bold text-xs text-slate-900 dark:text-white block truncate">{item.label}</span>
                                            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono block truncate">{item.desc}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.section>

                    {/* SECTION 2: 4 MODEL SINERGI & BENTO GRID (Awwwards Caliber) */}
                    <section className="space-y-8">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-6">
                            <div>
                                <span className="inline-flex items-center gap-1.5 text-xs font-mono text-rose-600 dark:text-rose-400 font-bold uppercase tracking-wider mb-2">
                                    <Sparkles className="w-3.5 h-3.5" />
                                    Model Kemitraan Strategis
                                </span>
                                <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white tracking-tight">
                                    4 Skema Kolaborasi Unggulan
                                </h2>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md">
                                Pilih skema yang paling sesuai dengan kebutuhan lembaga Anda. Klik kartu untuk langsung mengisi formulir terkait.
                            </p>
                        </div>

                        {/* Bento Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {schemes.map((scheme, idx) => {
                                const Icon = scheme.icon;
                                return (
                                    <motion.div
                                        key={scheme.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.5, delay: idx * 0.1 }}
                                        whileHover={{ y: -6 }}
                                        className={`group relative p-7 sm:p-8 rounded-3xl bg-white dark:bg-[#12050E]/80 border border-slate-200/90 dark:border-white/10 ${scheme.borderGlow} backdrop-blur-2xl shadow-lg dark:shadow-2xl transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer`}
                                        onClick={() => handleSelectScheme(scheme.id)}
                                    >
                                        {/* Corner Accent Glow on Hover */}
                                        <div className={`absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br ${scheme.color} rounded-full blur-[80px] opacity-0 group-hover:opacity-25 transition-opacity duration-500 pointer-events-none`} />

                                        <div>
                                            {/* Header Card */}
                                            <div className="flex items-center justify-between gap-3 mb-5">
                                                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${scheme.color} text-white flex items-center justify-center shadow-md shadow-rose-500/20 group-hover:scale-110 transition-transform duration-300`}>
                                                    <Icon className="w-6 h-6" />
                                                </div>
                                                <span className={`text-[11px] font-mono px-3 py-1 rounded-full font-semibold border ${scheme.bgBadge}`}>
                                                    {scheme.category}
                                                </span>
                                            </div>

                                            {/* Title & Tagline */}
                                            <h3 className="font-heading font-extrabold text-xl sm:text-2xl text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-300 transition-colors duration-200">
                                                {scheme.title}
                                            </h3>
                                            <p className="text-sm text-slate-600 dark:text-slate-300 mt-2.5 leading-relaxed">
                                                {scheme.tagline}
                                            </p>

                                            {/* Key Offerings Checklist */}
                                            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-white/5 space-y-2.5">
                                                {scheme.highlights.map((item, i) => (
                                                    <div key={i} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                                                        <div className="w-4 h-4 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                                                            <Check className="w-3 h-3 stroke-[3]" />
                                                        </div>
                                                        <span className="leading-snug">{item}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Bottom Action Footer */}
                                        <div className="mt-8 pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs font-mono">
                                            <span className="text-slate-500 dark:text-slate-400 font-medium">
                                                {scheme.metrics}
                                            </span>
                                            <div className="inline-flex items-center gap-1.5 font-bold text-rose-600 dark:text-rose-400 group-hover:translate-x-1 transition-transform">
                                                <span>Pilih Skema Ini</span>
                                                <ChevronRight className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </section>

                    {/* SECTION 3: STEP-BY-STEP WORKFLOW PIPELINE */}
                    <section className="p-8 sm:p-12 rounded-3xl bg-white/70 dark:bg-white/[0.02] border border-slate-200/90 dark:border-white/10 backdrop-blur-xl shadow-sm">
                        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
                            <span className="text-xs font-mono text-rose-600 dark:text-rose-400 font-bold uppercase tracking-wider block">
                                Transparan, Cepat & Terstruktur
                            </span>
                            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white">
                                Alur Kolaborasi dari Awal Hingga Eksekusi
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                                Setiap proposal ditangani secara profesional dengan jaminan kepastian waktu respons.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
                            {workflowSteps.map((step, idx) => {
                                const StepIcon = step.icon;
                                return (
                                    <div key={idx} className="relative p-6 rounded-2xl bg-white dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5 flex flex-col justify-between group hover:border-rose-500/40 transition-colors">
                                        <div>
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
                                                    <StepIcon className="w-5 h-5" />
                                                </div>
                                                <span className="font-mono text-2xl font-black text-slate-300 dark:text-white/15">
                                                    {step.step}
                                                </span>
                                            </div>
                                            <h4 className="font-heading font-bold text-base text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                                                {step.title}
                                            </h4>
                                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                                                {step.desc}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    {/* SECTION 4: PROPOSAL DROPZONE PORTAL & SUBMISSION FORM */}
                    <section id="dropzone-proposal" ref={formRef} className="scroll-mt-24">
                        <div className="relative rounded-3xl bg-white dark:bg-[#10040C]/90 border border-slate-200/90 dark:border-rose-500/30 p-6 sm:p-10 md:p-12 backdrop-blur-2xl shadow-2xl overflow-hidden">
                            {/* Ambient Form Glow */}
                            <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full blur-[120px] pointer-events-none" />

                            <div className="max-w-3xl mb-8 space-y-2">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-mono font-bold tracking-wider">
                                    <FileCheck className="w-3.5 h-3.5" />
                                    PROPOSAL DROPZONE PORTAL
                                </span>
                                <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white">
                                    Formulir Pengajuan Proposal Kemitraan
                                </h3>
                                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                    Kirimkan dokumen proposal resmi acara, sponsorship, atau kemitraan instansi Anda. Berkas PDF yang diunggah akan masuk langsung ke antrean tinjauan tim direksi dan partnership kami.
                                </p>
                            </div>

                            <AnimatePresence mode="wait">
                                {successMessage ? (
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="p-8 sm:p-12 rounded-2xl bg-gradient-to-b from-rose-500/10 to-transparent border border-rose-500/40 text-center space-y-5"
                                    >
                                        <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-600 dark:text-rose-300 flex items-center justify-center mx-auto shadow-lg shadow-rose-500/20">
                                            <Check className="w-9 h-9 stroke-[3]" />
                                        </div>
                                        <h4 className="text-2xl font-heading font-extrabold text-slate-900 dark:text-white">
                                            Proposal Berhasil Diterima!
                                        </h4>
                                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg mx-auto">
                                            {successMessage}
                                        </p>
                                        <div className="pt-3">
                                            <button
                                                onClick={() => setSuccessMessage(null)}
                                                className="px-6 py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-md shadow-rose-500/25 transition-transform active:scale-95"
                                            >
                                                Kirim Pengajuan Proposal Lain
                                            </button>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <form onSubmit={handleSubmitProposal} className="space-y-6">
                                        {errorMessage && (
                                            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                                                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                                                <span>{errorMessage}</span>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase">
                                                    Nama Instansi / Perusahaan / Kampus *
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={formData.organization_name}
                                                    onChange={(e) => setFormData({ ...formData, organization_name: e.target.value })}
                                                    placeholder="Contoh: BEM Fakultas Ilmu Komputer UGM"
                                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition-all placeholder:text-slate-400"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase">
                                                    Nama Lengkap PIC Penanggung Jawab *
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={formData.pic_name}
                                                    onChange={(e) => setFormData({ ...formData, pic_name: e.target.value })}
                                                    placeholder="Nama lengkap dan gelar/jabatan PIC..."
                                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition-all placeholder:text-slate-400"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase">
                                                    Email Resmi Komunikasi *
                                                </label>
                                                <input
                                                    type="email"
                                                    required
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                    placeholder="partnership@instansi.ac.id"
                                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition-all placeholder:text-slate-400"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase">
                                                    Nomor WhatsApp Aktif PIC *
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={formData.whatsapp}
                                                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                                                    placeholder="Contoh: 081234567890"
                                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition-all placeholder:text-slate-400"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase">
                                                    Skema Kolaborasi yang Diminati *
                                                </label>
                                                <select
                                                    value={formData.collab_type}
                                                    onChange={(e) => setFormData({ ...formData, collab_type: e.target.value })}
                                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition-all"
                                                >
                                                    <option value="campus_visit">Kemitraan Kampus, SMK & Perguruan Tinggi</option>
                                                    <option value="media_partner">Media Partner & Event Coverage 4K</option>
                                                    <option value="sponsorship">Sponsorship Acara / Kompetisi</option>
                                                    <option value="b2b_project">Kerjasama Vendor B2B & White-Label</option>
                                                    <option value="other">Komunitas Kreatif & Sinergi Lainnya</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase">
                                                    Target Waktu Pelaksanaan / Deadline Acara
                                                </label>
                                                <input
                                                    type="date"
                                                    value={formData.event_date}
                                                    onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition-all"
                                                />
                                            </div>
                                        </div>

                                        {/* World-Class Drag & Drop PDF Dropzone */}
                                        <div>
                                            <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase">
                                                Dokumen Proposal Resmi (.PDF Maksimal 10MB) *
                                            </label>
                                            
                                            <div
                                                onDragOver={handleDragOver}
                                                onDragLeave={handleDragLeave}
                                                onDrop={handleDrop}
                                                className={`relative border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all duration-200 ${
                                                    isDragging 
                                                        ? 'border-rose-500 bg-rose-500/10 scale-[1.01]' 
                                                        : proposalFile 
                                                            ? 'border-emerald-500/50 bg-emerald-500/5 dark:bg-emerald-500/[0.03]'
                                                            : 'border-slate-300 dark:border-white/15 hover:border-rose-500/50 bg-slate-50 dark:bg-white/[0.01]'
                                                }`}
                                            >
                                                <input
                                                    type="file"
                                                    id="proposal_upload"
                                                    accept=".pdf"
                                                    onChange={handleFileInput}
                                                    className="hidden"
                                                />

                                                {proposalFile ? (
                                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm">
                                                        <div className="flex items-center gap-3 text-left">
                                                            <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                                                                <FileText className="w-5 h-5" />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <span className="font-bold text-xs text-slate-900 dark:text-white block truncate max-w-xs">
                                                                    {proposalFile.name}
                                                                </span>
                                                                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono block">
                                                                    {(proposalFile.size / 1024 / 1024).toFixed(2)} MB • Berkas Terverifikasi Siap Dikirim
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <button
                                                            type="button"
                                                            onClick={() => setProposalFile(null)}
                                                            className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-1 transition-colors"
                                                        >
                                                            <X className="w-3.5 h-3.5" />
                                                            <span>Ganti Berkas</span>
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <label htmlFor="proposal_upload" className="cursor-pointer flex flex-col items-center justify-center space-y-2">
                                                        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                                                            <Upload className="w-6 h-6" />
                                                        </div>
                                                        <span className="font-heading font-bold text-sm text-slate-900 dark:text-white">
                                                            Tarik & Lepas Berkas Proposal ke Sini, atau <span className="text-rose-600 dark:text-rose-400 underline">Pilih Berkas</span>
                                                        </span>
                                                        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                                                            Format dokumen yang didukung: Dokumen PDF resmi (Maksimal 10MB)
                                                        </span>
                                                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono flex items-center gap-1 mt-1">
                                                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                                                            Tersimpan aman di server non-public storage Langit
                                                        </span>
                                                    </label>
                                                )}
                                            </div>
                                        </div>

                                        {/* Brief Concept Summary Textarea */}
                                        <div>
                                            <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase">
                                                Ringkasan Konsep & Harapan Kerja Sama *
                                            </label>
                                            <textarea
                                                rows={4}
                                                required
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                placeholder="Deskripsikan secara ringkas latar belakang acara/program, tujuan kolaborasi, serta bentuk benefit timbal balik yang ditawarkan..."
                                                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition-all placeholder:text-slate-400 leading-relaxed"
                                            />
                                        </div>

                                        {/* Submit Action */}
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-600 to-rose-600 hover:from-rose-600 hover:to-pink-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-rose-500/25 transition-all duration-300 hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                    <span>Mengunggah & Mengirimkan Berkas Proposal...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span>Kirimkan Proposal Kemitraan Sekarang</span>
                                                    <ArrowRight className="w-4 h-4" />
                                                </>
                                            )}
                                        </button>
                                    </form>
                                )}
                            </AnimatePresence>
                        </div>
                    </section>

                    {/* SECTION 5: FAST-TRACK DIRECT PARTNERSHIP CONTACT */}
                    <section className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-rose-500/10 via-pink-500/5 to-purple-500/10 border border-rose-500/20 backdrop-blur-xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="space-y-1 text-center md:text-left">
                            <span className="text-xs font-mono text-rose-600 dark:text-rose-400 font-bold uppercase tracking-wider block">
                                Butuh Diskusi Cepat Hari Ini?
                            </span>
                            <h3 className="font-heading font-extrabold text-xl sm:text-2xl text-slate-900 dark:text-white">
                                Hubungi Langsung Head of Strategic Partnership Kami
                            </h3>
                            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xl">
                                Jika instansi Anda memiliki kebutuhan mendesak atau ingin mengundang tim Langit sebagai pembicara, silakan kontak langsung melalui WhatsApp atau Email resmi.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
                            <a
                                href="https://wa.me/6282246142791?text=Halo%20Tim%20Partnership%20Langit,%20kami%20ingin%20berdiskusi%20mengenai%20peluang%20kerja%20sama."
                                target="_blank"
                                rel="noreferrer"
                                className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95"
                            >
                                <Phone className="w-4 h-4" />
                                <span>WhatsApp Partnership</span>
                            </a>
                            <a
                                href="mailto:langitbelitang@gmail.com"
                                className="px-5 py-3 rounded-xl bg-white dark:bg-white/10 hover:bg-slate-100 dark:hover:bg-white/15 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 text-xs font-semibold flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
                            >
                                <Mail className="w-4 h-4 text-rose-500" />
                                <span>partnership@langit.id</span>
                            </a>
                        </div>
                    </section>
                </div>
            </div>
        </PublicLayout>
    );
}
