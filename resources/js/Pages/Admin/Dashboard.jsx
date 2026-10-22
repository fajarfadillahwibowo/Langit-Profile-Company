import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import ThemeToggle from '@/Components/ThemeToggle';
import { 
    LayoutDashboard, Cpu, PackageCheck, Camera, Sparkles, Handshake,
    Ticket, LogOut, Check, X, Plus, Trash2, Edit3, ExternalLink,
    Phone, Mail, Calendar, Clock, AlertCircle, CheckCircle2, ShieldCheck,
    Search, Layers, ArrowUpRight, FileText, Download, Eye, Building2, User, Filter,
    Sun, Moon
} from 'lucide-react';

export default function AdminDashboard({
    metrics = {},
    serviceTickets = [],
    rentalBookings = [],
    internshipApplications = [],
    collaborations = [],
    galleries = [],
    equipments = [],
    courses = [],
    webPortfolios = [],
    recentConsultations = [],
}) {
    // Theme Management: Primary is 'light', Secondary is 'dark'
    const [theme, setTheme] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('langit_theme') || 'light';
        }
        return 'light';
    });

    useEffect(() => {
        if (typeof window === 'undefined') return;
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            document.documentElement.classList.remove('light');
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.classList.add('light');
            document.documentElement.classList.remove('dark');
            document.documentElement.setAttribute('data-theme', 'light');
        }
        localStorage.setItem('langit_theme', theme);
    }, [theme]);

    const [activeTab, setActiveTab] = useState('overview'); // overview, tickets, rentals, galleries, internships, collaborations, consultations

    // Collaboration Detail & Filter State
    const [selectedCollabDetail, setSelectedCollabDetail] = useState(null);
    const [collabFilter, setCollabFilter] = useState('all');

    // New Ticket Modal State
    const [ticketModalOpen, setTicketModalOpen] = useState(false);
    const [newTicketData, setNewTicketData] = useState({
        customer_name: '',
        whatsapp: '',
        device_type: 'Laptop Windows',
        device_brand_model: '',
        problem_reported: '',
        estimated_cost: 250000,
    });

    // New Gallery Modal State
    const [galleryModalOpen, setGalleryModalOpen] = useState(false);
    const [newGalleryData, setNewGalleryData] = useState({
        title: '',
        category: 'commercial',
        media_type: 'photo',
        file_webp_path: '',
        camera: 'Sony FX3 Cinema Line',
        lens: 'Sony FE 24-70mm F2.8 GM II',
        shutter: '1/500s',
        aperture: 'f/2.8',
        iso: '100',
    });

    const formatRupiah = (val) => {
        if (!val) return 'Rp 0';
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(val);
    };

    // Actions
    const handleUpdateTicketStatus = (id, newStatus) => {
        router.put(`/admin/tickets/${id}/status`, { status: newStatus }, { preserveScroll: true });
    };

    const handleUpdateRentalStatus = (id, newStatus) => {
        router.put(`/admin/rentals/${id}/status`, { status: newStatus }, { preserveScroll: true });
    };

    const handleUpdateInternshipStatus = (id, newStatus) => {
        router.put(`/admin/internships/${id}/status`, { status: newStatus }, { preserveScroll: true });
    };

    const handleUpdateConsultationStatus = (id, newStatus) => {
        router.put(`/admin/consultations/${id}/status`, { status: newStatus }, { preserveScroll: true });
    };

    const handleDeleteGallery = (id) => {
        if (confirm('Yakin ingin menghapus item galeri ini?')) {
            router.delete(`/admin/galleries/${id}`, { preserveScroll: true });
        }
    };

    const handleUpdateCollaborationStatus = (id, newStatus) => {
        router.put(`/admin/collaborations/${id}/status`, { status: newStatus }, { preserveScroll: true });
    };

    const handleDeleteCollaboration = (id) => {
        if (confirm('Yakin ingin menghapus berkas pengajuan kerja sama ini?')) {
            router.delete(`/admin/collaborations/${id}`, { preserveScroll: true });
        }
    };

    const getCollabTypeInfo = (type) => {
        switch (type) {
            case 'media_partner':
                return { label: 'Media Partner & Coverage', color: 'bg-rose-500/20 text-rose-300 border-rose-500/30' };
            case 'sponsorship':
                return { label: 'Sponsorship Kegiatan', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
            case 'campus_visit':
                return { label: 'Company Visit / Kuliah Tamu', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' };
            case 'b2b_project':
                return { label: 'Proyek Vendor Kreatif B2B', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' };
            default:
                return { label: 'Kemitraan Lainnya', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' };
        }
    };

    const filteredCollaborations = collaborations.filter((c) => {
        if (collabFilter === 'all') return true;
        return c.status === collabFilter;
    });

    const handleCreateTicketSubmit = (e) => {
        e.preventDefault();
        router.post('/admin/tickets', newTicketData, {
            preserveScroll: true,
            onSuccess: () => {
                setTicketModalOpen(false);
                setNewTicketData({
                    customer_name: '',
                    whatsapp: '',
                    device_type: 'Laptop Windows',
                    device_brand_model: '',
                    problem_reported: '',
                    estimated_cost: 250000,
                });
            }
        });
    };

    const handleCreateGallerySubmit = (e) => {
        e.preventDefault();
        router.post('/admin/galleries', newGalleryData, {
            preserveScroll: true,
            onSuccess: () => {
                setGalleryModalOpen(false);
                setNewGalleryData({
                    title: '',
                    category: 'commercial',
                    media_type: 'photo',
                    file_webp_path: '',
                    camera: 'Sony FX3 Cinema Line',
                    lens: 'Sony FE 24-70mm F2.8 GM II',
                    shutter: '1/500s',
                    aperture: 'f/2.8',
                    iso: '100',
                });
            }
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-[#07090E] dark:text-slate-100 flex font-sans transition-colors duration-200">
            <Head title="Admin CMS Executive Dashboard — Langit" />

            {/* Sidebar Navigation */}
            <aside className="w-64 border-r border-slate-200 dark:border-white/10 bg-white dark:bg-[#090D16] flex flex-col justify-between p-4 shrink-0 hidden md:flex transition-colors duration-200 shadow-sm dark:shadow-none">
                <div className="space-y-6">
                    {/* Header Logo */}
                    <div className="flex items-center gap-2.5 px-2">
                        <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 shrink-0 bg-slate-100 dark:bg-slate-900 shadow-md">
                            <img 
                                src="/images/logo-langit-creative.jpg" 
                                alt="Langit Creative Logo" 
                                className="w-full h-full object-cover" 
                            />
                        </div>
                        <div>
                            <span className="font-heading font-extrabold text-lg text-slate-900 dark:text-white block">LANGIT</span>
                            <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 block -mt-1">Back-Office CMS</span>
                        </div>
                    </div>

                    {/* Nav Items */}
                    <nav className="space-y-1 text-xs font-medium">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                                activeTab === 'overview'
                                    ? 'bg-cyan-50 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 font-bold border border-cyan-200 dark:border-cyan-500/30 shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5'
                            }`}
                        >
                            <LayoutDashboard className="w-4 h-4" />
                            <span>Executive Overview</span>
                        </button>

                        <button
                            onClick={() => setActiveTab('tickets')}
                            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                                activeTab === 'tickets'
                                    ? 'bg-orange-50 dark:bg-orange-500/20 text-orange-700 dark:text-orange-300 font-bold border border-orange-200 dark:border-orange-500/30 shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <Cpu className="w-4 h-4 text-orange-500 dark:text-orange-400" />
                                <span>Computer Servis</span>
                            </div>
                            <span className="px-1.5 py-0.5 rounded bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400 font-mono text-[10px]">
                                {serviceTickets.length}
                            </span>
                        </button>

                        <button
                            onClick={() => setActiveTab('rentals')}
                            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                                activeTab === 'rentals'
                                    ? 'bg-teal-50 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300 font-bold border border-teal-200 dark:border-teal-500/30 shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <PackageCheck className="w-4 h-4 text-teal-500 dark:text-teal-400" />
                                <span>Sewa Alat & Gear</span>
                            </div>
                            <span className="px-1.5 py-0.5 rounded bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-400 font-mono text-[10px]">
                                {rentalBookings.length}
                            </span>
                        </button>

                        <button
                            onClick={() => setActiveTab('galleries')}
                            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                                activeTab === 'galleries'
                                    ? 'bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold border border-amber-200 dark:border-amber-500/30 shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <Camera className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                                <span>Galeri & EXIF Media</span>
                            </div>
                            <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 font-mono text-[10px]">
                                {galleries.length}
                            </span>
                        </button>

                        <button
                            onClick={() => setActiveTab('internships')}
                            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                                activeTab === 'internships'
                                    ? 'bg-purple-50 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 font-bold border border-purple-200 dark:border-purple-500/30 shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <Sparkles className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                                <span>Internship Pelamar</span>
                            </div>
                            <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400 font-mono text-[10px]">
                                {internshipApplications.length}
                            </span>
                        </button>

                        <button
                            onClick={() => setActiveTab('collaborations')}
                            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                                activeTab === 'collaborations'
                                    ? 'bg-rose-50 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 font-bold border border-rose-200 dark:border-rose-500/30 shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <Handshake className="w-4 h-4 text-rose-500 dark:text-rose-400" />
                                <span>Proposal Kerja Sama</span>
                            </div>
                            <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 font-mono text-[10px]">
                                {collaborations.length}
                            </span>
                        </button>

                        <button
                            onClick={() => setActiveTab('consultations')}
                            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                                activeTab === 'consultations'
                                    ? 'bg-cyan-50 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 font-bold border border-cyan-200 dark:border-cyan-500/30 shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <Ticket className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
                                <span>Jadwal Konsultasi</span>
                            </div>
                            <span className="px-1.5 py-0.5 rounded bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-400 font-mono text-[10px]">
                                {recentConsultations.length}
                            </span>
                        </button>
                    </nav>
                </div>

                {/* Footer Actions & Theme Toggle */}
                <div className="pt-4 border-t border-slate-200 dark:border-white/10 space-y-3">
                    <div className="px-1">
                        <ThemeToggle theme={theme} setTheme={setTheme} className="w-full justify-center" />
                    </div>

                    <Link
                        href="/"
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                    >
                        <ExternalLink className="w-4 h-4" />
                        <span>Lihat Website Publik</span>
                    </Link>

                    <Link
                        href="/admin/logout"
                        method="post"
                        as="button"
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Keluar / Logout</span>
                    </Link>
                </div>
            </aside>

            {/* Main Content Dashboard */}
            <main className="flex-1 min-w-0 p-6 md:p-8 overflow-y-auto">
                {/* Topbar Info */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-200 dark:border-white/10">
                    <div>
                        <h1 className="font-heading font-extrabold text-2xl text-slate-900 dark:text-white">
                            {activeTab === 'overview' && 'Executive Dashboard & Metrics'}
                            {activeTab === 'tickets' && 'Manajemen Tiket Servis Komputer'}
                            {activeTab === 'rentals' && 'Manajemen Sewa Alat & Inventaris Gear'}
                            {activeTab === 'galleries' && 'Manajemen Galeri Mahakarya & EXIF'}
                            {activeTab === 'internships' && 'Review Pelamar Magang & CV'}
                            {activeTab === 'collaborations' && 'Manajemen Pengajuan Kerja Sama & Kemitraan (B2B)'}
                            {activeTab === 'consultations' && 'Manajemen Tiket Jadwal Konsultasi'}
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                            Status Server: Online 200 OK • Laravel 13 • MySQL phpMyAdmin Connected
                        </p>
                    </div>

                    {/* Topbar Theme Toggle & Actions */}
                    <div className="flex items-center gap-2.5 flex-wrap">
                        {/* Theme Toggle in Header */}
                        <ThemeToggle theme={theme} setTheme={setTheme} />

                        {activeTab === 'tickets' && (
                            <button
                                onClick={() => setTicketModalOpen(true)}
                                className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-orange-500/25 transition-transform active:scale-95"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Buat Nota Servis Baru</span>
                            </button>
                        )}
                        {activeTab === 'galleries' && (
                            <button
                                onClick={() => setGalleryModalOpen(true)}
                                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/25 transition-transform active:scale-95"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Tambah Foto / EXIF Baru</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Mobile Tabs Switcher */}
                <div className="flex md:hidden items-center gap-1.5 overflow-x-auto pb-3 mb-6 no-scrollbar text-xs font-mono">
                    {[
                        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
                        { id: 'tickets', label: `Servis (${serviceTickets.length})`, icon: Cpu },
                        { id: 'rentals', label: `Rental (${rentalBookings.length})`, icon: PackageCheck },
                        { id: 'galleries', label: `Galeri (${galleries.length})`, icon: Camera },
                        { id: 'internships', label: `Magang (${internshipApplications.length})`, icon: Sparkles },
                        { id: 'collaborations', label: `Kerja Sama (${collaborations.length})`, icon: Handshake },
                        { id: 'consultations', label: `Konsultasi (${recentConsultations.length})`, icon: Ticket },
                    ].map(tab => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl whitespace-nowrap shrink-0 transition-all ${
                                    activeTab === tab.id
                                        ? 'bg-cyan-600 text-white font-bold shadow-md shadow-cyan-600/25'
                                        : 'bg-slate-200/80 dark:bg-white/5 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                }`}
                            >
                                <Icon className="w-3.5 h-3.5" />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* TAB 1: EXECUTIVE OVERVIEW (PRD 6.1) */}
                {activeTab === 'overview' && (
                    <div className="space-y-8">
                        {/* 7 Key Executive Metric Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
                            <div onClick={() => setActiveTab('consultations')} className="p-4 rounded-2xl bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/30 cursor-pointer hover:border-cyan-400 dark:hover:border-cyan-500/60 transition-all shadow-sm">
                                <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 uppercase block font-semibold">Leads Konsultasi</span>
                                <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1 block">{metrics.total_consultations || 0}</span>
                            </div>
                            <div onClick={() => setActiveTab('tickets')} className="p-4 rounded-2xl bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/30 cursor-pointer hover:border-orange-400 dark:hover:border-orange-500/60 transition-all shadow-sm">
                                <span className="text-[10px] font-mono text-orange-600 dark:text-orange-400 uppercase block font-semibold">Tiket Servis Aktif</span>
                                <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1 block">{metrics.pending_service_tickets || 0}</span>
                            </div>
                            <div onClick={() => setActiveTab('rentals')} className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-500/30 cursor-pointer hover:border-teal-400 dark:hover:border-teal-500/60 transition-all shadow-sm">
                                <span className="text-[10px] font-mono text-teal-600 dark:text-teal-400 uppercase block font-semibold">Alat Sedang Disewa</span>
                                <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1 block">{metrics.active_rentals || 0}</span>
                            </div>
                            <div onClick={() => setActiveTab('internships')} className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/30 cursor-pointer hover:border-purple-400 dark:hover:border-purple-500/60 transition-all shadow-sm">
                                <span className="text-[10px] font-mono text-purple-600 dark:text-purple-400 uppercase block font-semibold">Pelamar Magang</span>
                                <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1 block">{metrics.internship_applicants || 0}</span>
                            </div>
                            <div onClick={() => setActiveTab('collaborations')} className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 cursor-pointer hover:border-rose-400 dark:hover:border-rose-500/60 transition-all hover:scale-[1.02] shadow-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-mono text-rose-600 dark:text-rose-400 uppercase block font-semibold">Kerja Sama & B2B</span>
                                    <Handshake className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
                                </div>
                                <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1 block">{metrics.total_collaborations || collaborations.length}</span>
                                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono block mt-0.5">{metrics.pending_collaborations || 0} Perlu Respon</span>
                            </div>
                            <div onClick={() => setActiveTab('galleries')} className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 cursor-pointer hover:border-amber-400 dark:hover:border-amber-500/60 transition-all shadow-sm">
                                <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 uppercase block font-semibold">Koleksi Galeri</span>
                                <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1 block">{metrics.total_galleries || 0}</span>
                            </div>
                            <div onClick={() => setActiveTab('rentals')} className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 cursor-pointer hover:border-emerald-400 dark:hover:border-emerald-500/60 transition-all shadow-sm">
                                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 uppercase block font-semibold">Katalog Rental</span>
                                <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1 block">{metrics.total_equipments || 0}</span>
                            </div>
                        </div>

                        {/* Recent Consultations Table */}
                        <div className="p-6 rounded-3xl bg-white dark:bg-[#090D16] border border-slate-200/90 dark:border-white/10 shadow-sm dark:shadow-xl space-y-4 transition-colors">
                            <div className="flex items-center justify-between">
                                <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                                    <Ticket className="w-5 h-5 text-cyan-500 dark:text-cyan-400" />
                                    <span>Jadwal Konsultasi Terbaru Masuk</span>
                                </h3>
                                <button onClick={() => setActiveTab('consultations')} className="text-xs font-mono text-cyan-600 dark:text-cyan-400 hover:underline">
                                    Lihat Semua →
                                </button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs font-mono">
                                    <thead className="border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 uppercase text-[10px]">
                                        <tr>
                                            <th className="py-2.5 px-3">No. Tiket</th>
                                            <th className="py-2.5 px-3">Klien & Instansi</th>
                                            <th className="py-2.5 px-3">Topik</th>
                                            <th className="py-2.5 px-3">Metode</th>
                                            <th className="py-2.5 px-3">Jadwal</th>
                                            <th className="py-2.5 px-3">Status</th>
                                            <th className="py-2.5 px-3">Follow-Up</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-slate-700 dark:text-slate-300">
                                        {recentConsultations.map((c) => (
                                            <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02]">
                                                <td className="py-3 px-3 font-bold text-cyan-600 dark:text-cyan-400">{c.ticket_code}</td>
                                                <td className="py-3 px-3">
                                                    <span className="font-bold text-slate-900 dark:text-white block">{c.client_name}</span>
                                                    <span className="text-[10px] text-slate-500">{c.company_or_institution || '-'}</span>
                                                </td>
                                                <td className="py-3 px-3 text-slate-700 dark:text-slate-200">{c.service_topic}</td>
                                                <td className="py-3 px-3">
                                                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 text-[10px]">
                                                        {c.meeting_method === 'online_meet' ? 'Online Meet' : 'Studio'}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-3 text-slate-600 dark:text-slate-400">{c.preferred_date} ({c.preferred_time})</td>
                                                <td className="py-3 px-3">
                                                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold uppercase text-[10px]">
                                                        {c.status}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-3">
                                                    <a
                                                        href={`https://wa.me/${c.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Halo ${c.client_name}, kami dari Langit mengonfirmasi tiket konsultasi ${c.ticket_code}`)}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="px-2.5 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center gap-1 w-fit font-semibold"
                                                    >
                                                        <Phone className="w-3 h-3" />
                                                        <span>WA</span>
                                                    </a>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Recent Collaborations Table */}
                        <div className="p-6 rounded-3xl bg-white dark:bg-[#090D16] border border-slate-200/90 dark:border-white/10 shadow-sm dark:shadow-xl space-y-4 transition-colors">
                            <div className="flex items-center justify-between">
                                <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                                    <Handshake className="w-5 h-5 text-rose-500 dark:text-rose-400" />
                                    <span>Pengajuan Proposal Kerja Sama Terbaru</span>
                                </h3>
                                <button onClick={() => setActiveTab('collaborations')} className="text-xs font-mono text-rose-600 dark:text-rose-400 hover:underline">
                                    Kelola Semua Proposal ({collaborations.length}) →
                                </button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs font-mono">
                                    <thead className="border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 uppercase text-[10px]">
                                        <tr>
                                            <th className="py-2.5 px-3">Instansi / Perusahaan</th>
                                            <th className="py-2.5 px-3">PIC Penanggung Jawab</th>
                                            <th className="py-2.5 px-3">Skema Kemitraan</th>
                                            <th className="py-2.5 px-3">Target Waktu</th>
                                            <th className="py-2.5 px-3">Status</th>
                                            <th className="py-2.5 px-3">Proposal</th>
                                            <th className="py-2.5 px-3">Follow-Up</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-slate-700 dark:text-slate-300">
                                        {collaborations.slice(0, 5).map((c) => {
                                            const typeInfo = getCollabTypeInfo(c.collab_type);
                                            return (
                                                <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02]">
                                                    <td className="py-3 px-3">
                                                        <span className="font-bold text-slate-900 dark:text-white block">{c.organization_name}</span>
                                                        <span className="text-[10px] text-slate-500">{c.email}</span>
                                                    </td>
                                                    <td className="py-3 px-3 text-slate-800 dark:text-slate-200 font-medium">{c.pic_name}</td>
                                                    <td className="py-3 px-3">
                                                        <span className={`px-2 py-0.5 rounded text-[10px] border ${typeInfo.color}`}>
                                                            {typeInfo.label}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                                                        {c.event_date ? new Date(c.event_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Fleksibel'}
                                                    </td>
                                                    <td className="py-3 px-3">
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                                            c.status === 'approved' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' :
                                                            c.status === 'in_discussion' ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400' :
                                                            c.status === 'declined' ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400' :
                                                            'bg-blue-500/20 text-blue-600 dark:text-blue-400'
                                                        }`}>
                                                            {c.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-3">
                                                        {c.proposal_pdf_path ? (
                                                            <a
                                                                href={c.proposal_pdf_path}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 font-bold"
                                                            >
                                                                <FileText className="w-3.5 h-3.5" />
                                                                <span>PDF</span>
                                                            </a>
                                                        ) : (
                                                            <span className="text-slate-400 dark:text-slate-600">-</span>
                                                        )}
                                                    </td>
                                                    <td className="py-3 px-3">
                                                        <a
                                                            href={`https://wa.me/${c.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Halo ${c.pic_name} (${c.organization_name}), kami dari Tim Partnership Langit ingin berdiskusi mengenai proposal kerja sama Anda.`)}`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="px-2.5 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center gap-1 w-fit font-semibold"
                                                        >
                                                            <Phone className="w-3 h-3" />
                                                            <span>WA</span>
                                                        </a>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {collaborations.length === 0 && (
                                            <tr>
                                                <td colSpan="7" className="py-6 text-center text-slate-500">
                                                    Belum ada berkas proposal kerja sama yang masuk.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 2: COMPUTER SERVICE TICKETS (PRD 6.5) */}
                {activeTab === 'tickets' && (
                    <div className="space-y-6">
                        <div className="p-6 rounded-3xl bg-white dark:bg-[#090D16] border border-slate-200/90 dark:border-white/10 shadow-sm dark:shadow-xl">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs font-mono">
                                    <thead className="border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 uppercase text-[10px]">
                                        <tr>
                                            <th className="py-3 px-3">Nota Servis</th>
                                            <th className="py-3 px-3">Pelanggan</th>
                                            <th className="py-3 px-3">Perangkat</th>
                                            <th className="py-3 px-3">Keluhan</th>
                                            <th className="py-3 px-3">Tahap Perbaikan (Update Live)</th>
                                            <th className="py-3 px-3">Biaya</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-slate-700 dark:text-slate-300">
                                        {serviceTickets.map((t) => (
                                            <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                                                <td className="py-3.5 px-3 font-bold text-orange-600 dark:text-orange-400">{t.receipt_number}</td>
                                                <td className="py-3.5 px-3">
                                                    <span className="font-bold text-slate-900 dark:text-white block">{t.customer_name}</span>
                                                    <span className="text-[10px] text-slate-500">{t.whatsapp}</span>
                                                </td>
                                                <td className="py-3.5 px-3">
                                                    <span className="text-slate-800 dark:text-slate-200 block">{t.device_brand_model}</span>
                                                    <span className="text-[10px] text-slate-500">{t.device_type}</span>
                                                </td>
                                                <td className="py-3.5 px-3 max-w-xs truncate text-slate-600 dark:text-slate-400">{t.problem_reported}</td>
                                                <td className="py-3.5 px-3">
                                                    {/* Pipeline Status Selector */}
                                                    <select
                                                        value={t.status}
                                                        onChange={(e) => handleUpdateTicketStatus(t.id, e.target.value)}
                                                        className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-orange-500/40 text-orange-700 dark:text-orange-300 font-bold text-xs uppercase focus:outline-none"
                                                    >
                                                        <option value="received">Diterima & Diagnosa</option>
                                                        <option value="waiting_part">Menunggu Sparepart</option>
                                                        <option value="repairing">Dalam Perbaikan</option>
                                                        <option value="qc_testing">Uji Fungsi (QC)</option>
                                                        <option value="ready">Siap Diambil</option>
                                                        <option value="completed">Selesai / Diambil</option>
                                                    </select>
                                                </td>
                                                <td className="py-3.5 px-3 font-bold text-emerald-600 dark:text-emerald-400">
                                                    {formatRupiah(t.final_cost || t.estimated_cost)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 3: RENTAL GEAR & BOOKINGS (PRD 6.4) */}
                {activeTab === 'rentals' && (
                    <div className="space-y-6">
                        <div className="p-6 rounded-3xl bg-white dark:bg-[#090D16] border border-slate-200/90 dark:border-white/10 shadow-sm dark:shadow-xl">
                            <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white mb-4">Daftar Booking Sewa Alat</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs font-mono">
                                    <thead className="border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 uppercase text-[10px]">
                                        <tr>
                                            <th className="py-3 px-3">Kode Booking</th>
                                            <th className="py-3 px-3">Penyewa</th>
                                            <th className="py-3 px-3">Durasi</th>
                                            <th className="py-3 px-3">Item Sewa</th>
                                            <th className="py-3 px-3">Total Biaya</th>
                                            <th className="py-3 px-3">Status Booking</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-slate-700 dark:text-slate-300">
                                        {rentalBookings.map((b) => (
                                            <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                                                <td className="py-3 px-3 font-bold text-teal-600 dark:text-teal-400">{b.booking_code}</td>
                                                <td className="py-3 px-3">
                                                    <span className="font-bold text-slate-900 dark:text-white block">{b.customer_name}</span>
                                                    <span className="text-[10px] text-slate-500">{b.whatsapp} • {b.identity_card_type}</span>
                                                </td>
                                                <td className="py-3 px-3 text-slate-700 dark:text-slate-300">
                                                    {b.total_days} Hari ({b.start_date} s/d {b.end_date})
                                                </td>
                                                <td className="py-3 px-3 text-slate-600 dark:text-slate-400 max-w-xs truncate">
                                                    {(b.rented_items_json || []).map(i => `${i.name} (${i.qty}x)`).join(', ')}
                                                </td>
                                                <td className="py-3 px-3 font-bold text-emerald-600 dark:text-emerald-400">
                                                    {formatRupiah(b.total_price)}
                                                </td>
                                                <td className="py-3 px-3">
                                                    <select
                                                        value={b.status}
                                                        onChange={(e) => handleUpdateRentalStatus(b.id, e.target.value)}
                                                        className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-teal-500/40 text-teal-700 dark:text-teal-300 font-bold text-xs uppercase focus:outline-none"
                                                    >
                                                        <option value="pending">Pending Approval</option>
                                                        <option value="approved">Approved</option>
                                                        <option value="picked_up">Picked Up (Alat Dibawa)</option>
                                                        <option value="returned">Returned (Dikembalikan)</option>
                                                        <option value="cancelled">Cancelled</option>
                                                    </select>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 4: GALLERIES & EXIF MEDIA (PRD 6.2) */}
                {activeTab === 'galleries' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                            {galleries.map((g) => (
                                <div key={g.id} className="p-3 rounded-2xl bg-white dark:bg-[#090D16] border border-slate-200/90 dark:border-white/10 group shadow-sm dark:shadow-lg flex flex-col justify-between">
                                    <div>
                                        <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-950 mb-2">
                                            <img src={g.file_webp_path} alt={g.title} className="w-full h-full object-cover" />
                                            <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-mono text-amber-400">
                                                {g.category}
                                            </span>
                                        </div>
                                        <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">{g.title}</h4>
                                        <span className="text-[10px] font-mono text-slate-500 block">
                                            {g.exif_metadata_json?.camera || 'Sony FX3'}
                                        </span>
                                    </div>

                                    <div className="mt-3 pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                                        <span className="text-[9px] font-mono text-slate-500 dark:text-slate-600">ID: #{g.id}</span>
                                        <button
                                            onClick={() => handleDeleteGallery(g.id)}
                                            className="p-1 rounded text-rose-500 dark:text-rose-400 hover:bg-rose-500/10"
                                            title="Hapus Foto"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* TAB 5: INTERNSHIP APPLICANTS (PRD 6.6) */}
                {activeTab === 'internships' && (
                    <div className="space-y-6">
                        <div className="p-6 rounded-3xl bg-white dark:bg-[#090D16] border border-slate-200/90 dark:border-white/10 shadow-sm dark:shadow-xl">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs font-mono">
                                    <thead className="border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 uppercase text-[10px]">
                                        <tr>
                                            <th className="py-3 px-3">Nama Pelamar</th>
                                            <th className="py-3 px-3">Instansi & Jurusan</th>
                                            <th className="py-3 px-3">Posisi</th>
                                            <th className="py-3 px-3">Berkas CV & Portofolio</th>
                                            <th className="py-3 px-3">Status Review</th>
                                            <th className="py-3 px-3">Kontak</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-slate-700 dark:text-slate-300">
                                        {internshipApplications.map((app) => (
                                            <tr key={app.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                                                <td className="py-3.5 px-3">
                                                    <span className="font-bold text-slate-900 dark:text-white block">{app.full_name}</span>
                                                    <span className="text-[10px] text-slate-500">{app.email}</span>
                                                </td>
                                                <td className="py-3.5 px-3">
                                                    <span className="text-slate-800 dark:text-slate-200 block">{app.institution_name}</span>
                                                    <span className="text-[10px] text-slate-500">{app.major}</span>
                                                </td>
                                                <td className="py-3.5 px-3 text-purple-700 dark:text-purple-300 font-bold">
                                                    {app.position?.title || 'Divisi Terkait'}
                                                </td>
                                                <td className="py-3.5 px-3">
                                                    <div className="flex items-center gap-2">
                                                        {app.cv_pdf_path ? (
                                                            <a
                                                                href={app.cv_pdf_path}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="px-2 py-1 rounded bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 hover:underline text-[10px] font-semibold"
                                                            >
                                                                Buka CV PDF
                                                            </a>
                                                        ) : (
                                                            <span className="text-slate-400 dark:text-slate-600 text-[10px]">-</span>
                                                        )}
                                                        {app.portfolio_url && (
                                                            <a
                                                                href={app.portfolio_url}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="text-cyan-600 dark:text-cyan-400 hover:underline text-[10px] font-semibold"
                                                            >
                                                                Portofolio ↗
                                                            </a>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-3.5 px-3">
                                                    <select
                                                        value={app.status}
                                                        onChange={(e) => handleUpdateInternshipStatus(app.id, e.target.value)}
                                                        className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-purple-500/40 text-purple-700 dark:text-purple-300 font-bold text-xs uppercase focus:outline-none"
                                                    >
                                                        <option value="submitted">Submitted</option>
                                                        <option value="reviewed">Reviewed</option>
                                                        <option value="interview">Interview</option>
                                                        <option value="accepted">Accepted (Diterima)</option>
                                                        <option value="rejected">Rejected</option>
                                                    </select>
                                                </td>
                                                <td className="py-3.5 px-3">
                                                    <a
                                                        href={`https://wa.me/${app.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Halo ${app.full_name}, kami dari Langit mengonfirmasi lamaran magang Anda.`)}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="px-2.5 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center gap-1 w-fit font-semibold"
                                                    >
                                                        <Phone className="w-3 h-3" />
                                                        <span>WA</span>
                                                    </a>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 6: CONSULTATIONS & PROPOSALS (PRD 6.7) */}
                {activeTab === 'consultations' && (
                    <div className="space-y-6">
                        <div className="p-6 rounded-3xl bg-white dark:bg-[#090D16] border border-slate-200/90 dark:border-white/10 shadow-sm dark:shadow-xl">
                            <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white mb-4">Seluruh Tiket Jadwal Konsultasi Klien</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs font-mono">
                                    <thead className="border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 uppercase text-[10px]">
                                        <tr>
                                            <th className="py-3 px-3">Tiket</th>
                                            <th className="py-3 px-3">Klien & Instansi</th>
                                            <th className="py-3 px-3">Topik & Brief</th>
                                            <th className="py-3 px-3">Jadwal & Metode</th>
                                            <th className="py-3 px-3">Budget</th>
                                            <th className="py-3 px-3">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-slate-700 dark:text-slate-300">
                                        {recentConsultations.map((c) => (
                                            <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                                                <td className="py-3.5 px-3 font-bold text-cyan-600 dark:text-cyan-400">{c.ticket_code}</td>
                                                <td className="py-3.5 px-3">
                                                    <span className="font-bold text-slate-900 dark:text-white block">{c.client_name}</span>
                                                    <span className="text-[10px] text-slate-500">{c.company_or_institution} • {c.whatsapp}</span>
                                                </td>
                                                <td className="py-3.5 px-3 max-w-xs">
                                                    <span className="text-cyan-700 dark:text-cyan-300 font-semibold block">{c.service_topic}</span>
                                                    <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate block">{c.project_brief || '-'}</span>
                                                </td>
                                                <td className="py-3.5 px-3">
                                                    <span className="text-slate-800 dark:text-slate-200 block">{c.preferred_date}</span>
                                                    <span className="text-[10px] text-slate-500">{c.preferred_time} • {c.meeting_method}</span>
                                                </td>
                                                <td className="py-3.5 px-3 text-amber-600 dark:text-amber-300 font-mono">
                                                    {c.budget_estimation || '-'}
                                                </td>
                                                <td className="py-3.5 px-3">
                                                    <select
                                                        value={c.status}
                                                        onChange={(e) => handleUpdateConsultationStatus(c.id, e.target.value)}
                                                        className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-cyan-500/40 text-cyan-700 dark:text-cyan-300 font-bold text-xs uppercase focus:outline-none"
                                                    >
                                                        <option value="scheduled">Scheduled</option>
                                                        <option value="completed">Completed</option>
                                                        <option value="rescheduled">Rescheduled</option>
                                                        <option value="cancelled">Cancelled</option>
                                                    </select>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 7: COLLABORATION PROPOSALS (B2B & KEMITRAAN) */}
                {activeTab === 'collaborations' && (
                    <div className="space-y-6">
                        {/* Header Filters & Stats */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-[#090D16] border border-slate-200/90 dark:border-white/10 shadow-sm dark:shadow-md">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-mono text-slate-500 dark:text-slate-400 mr-1 flex items-center gap-1.5">
                                    <Filter className="w-3.5 h-3.5" /> Filter Status:
                                </span>
                                {[
                                    { id: 'all', label: 'Semua', count: collaborations.length },
                                    { id: 'new', label: 'Baru Masuk', count: collaborations.filter(c => c.status === 'new').length },
                                    { id: 'in_discussion', label: 'Sedang Diskusi', count: collaborations.filter(c => c.status === 'in_discussion').length },
                                    { id: 'approved', label: 'Disetujui', count: collaborations.filter(c => c.status === 'approved').length },
                                    { id: 'declined', label: 'Ditolak', count: collaborations.filter(c => c.status === 'declined').length },
                                ].map(f => (
                                    <button
                                        key={f.id}
                                        onClick={() => setCollabFilter(f.id)}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all ${
                                            collabFilter === f.id
                                                ? 'bg-rose-500 text-white font-bold shadow-lg shadow-rose-500/25'
                                                : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10'
                                        }`}
                                    >
                                        {f.label} ({f.count})
                                    </button>
                                ))}
                            </div>

                            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                                Menampilkan {filteredCollaborations.length} dari {collaborations.length} pengajuan
                            </span>
                        </div>

                        {/* Collaborations Table */}
                        <div className="p-6 rounded-3xl bg-white dark:bg-[#090D16] border border-slate-200/90 dark:border-white/10 shadow-sm dark:shadow-xl">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs font-mono">
                                    <thead className="border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 uppercase text-[10px]">
                                        <tr>
                                            <th className="py-3 px-3">Instansi / Perusahaan</th>
                                            <th className="py-3 px-3">PIC Penanggung Jawab</th>
                                            <th className="py-3 px-3">Skema Kerja Sama</th>
                                            <th className="py-3 px-3">Target Tanggal</th>
                                            <th className="py-3 px-3">Berkas Proposal</th>
                                            <th className="py-3 px-3">Status Pipeline</th>
                                            <th className="py-3 px-3 text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-slate-700 dark:text-slate-300">
                                        {filteredCollaborations.length === 0 ? (
                                            <tr>
                                                <td colSpan="7" className="py-8 text-center text-slate-500">
                                                    Belum ada berkas proposal kerja sama dengan filter ini.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredCollaborations.map((c) => {
                                                const typeInfo = getCollabTypeInfo(c.collab_type);
                                                return (
                                                    <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                                                        <td className="py-3.5 px-3">
                                                            <span className="font-bold text-slate-900 dark:text-white block text-sm">{c.organization_name}</span>
                                                            <span className="text-[10px] text-slate-500 block font-mono">
                                                                Diterima: {c.created_at ? new Date(c.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                                                            </span>
                                                        </td>
                                                        <td className="py-3.5 px-3">
                                                            <span className="text-slate-800 dark:text-slate-200 font-semibold block">{c.pic_name}</span>
                                                            <span className="text-[10px] text-slate-500 block">{c.email}</span>
                                                            <a
                                                                href={`https://wa.me/${c.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Halo ${c.pic_name} (${c.organization_name}), kami dari Tim Partnership Langit ingin berdiskusi terkait proposal kerja sama yang diajukan.`)}`}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="inline-flex items-center gap-1.5 mt-1 px-2 py-0.5 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] transition-colors font-semibold"
                                                            >
                                                                <Phone className="w-3 h-3" />
                                                                <span>{c.whatsapp}</span>
                                                            </a>
                                                        </td>
                                                        <td className="py-3.5 px-3">
                                                            <span className={`inline-block px-2.5 py-1 rounded-lg border text-[11px] font-medium ${typeInfo.color}`}>
                                                                {typeInfo.label}
                                                            </span>
                                                        </td>
                                                        <td className="py-3.5 px-3 text-slate-700 dark:text-slate-300">
                                                            {c.event_date ? (
                                                                <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                                                                    <Calendar className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
                                                                    <span>{new Date(c.event_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                                                </div>
                                                            ) : (
                                                                <span className="text-slate-400 dark:text-slate-500 italic">Fleksibel / Sesuai Kesepakatan</span>
                                                            )}
                                                        </td>
                                                        <td className="py-3.5 px-3">
                                                            {c.proposal_pdf_path ? (
                                                                <a
                                                                    href={c.proposal_pdf_path}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-500/15 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-500/25 transition-all text-[11px] font-bold"
                                                                >
                                                                    <FileText className="w-3.5 h-3.5" />
                                                                    <span>Unduh PDF</span>
                                                                </a>
                                                            ) : (
                                                                <span className="text-slate-400 dark:text-slate-600 italic text-[11px]">Tanpa Berkas PDF</span>
                                                            )}
                                                        </td>
                                                        <td className="py-3.5 px-3">
                                                            <select
                                                                value={c.status}
                                                                onChange={(e) => handleUpdateCollaborationStatus(c.id, e.target.value)}
                                                                className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-rose-500/40 text-rose-700 dark:text-rose-300 font-bold text-xs uppercase focus:outline-none"
                                                            >
                                                                <option value="new">Baru Masuk</option>
                                                                <option value="in_discussion">Sedang Diskusi</option>
                                                                <option value="approved">Disetujui</option>
                                                                <option value="declined">Ditolak</option>
                                                            </select>
                                                        </td>
                                                        <td className="py-3.5 px-3 text-right">
                                                            <div className="flex items-center justify-end gap-1.5">
                                                                <button
                                                                    onClick={() => setSelectedCollabDetail(c)}
                                                                    className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-800 dark:text-white flex items-center gap-1 text-[11px] transition-colors font-medium"
                                                                    title="Lihat Detail Lengkap"
                                                                >
                                                                    <Eye className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                                                                    <span>Detail</span>
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteCollaboration(c.id)}
                                                                    className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 dark:text-rose-400 transition-colors"
                                                                    title="Hapus Data"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Modal: New Service Ticket */}
            {ticketModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/85 backdrop-blur-xl animate-in fade-in">
                    <div className="relative max-w-lg w-full bg-white dark:bg-[#090D16] border border-orange-500/30 rounded-3xl p-6 md:p-8 shadow-2xl text-slate-900 dark:text-slate-100">
                        <button onClick={() => setTicketModalOpen(false)} className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                        <h3 className="font-heading font-bold text-xl text-slate-900 dark:text-white mb-4">Terbitkan Nota Servis Baru</h3>
                        <form onSubmit={handleCreateTicketSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-mono text-slate-700 dark:text-slate-300 mb-1">Nama Pelanggan *</label>
                                <input
                                    type="text"
                                    required
                                    value={newTicketData.customer_name}
                                    onChange={(e) => setNewTicketData({ ...newTicketData, customer_name: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-orange-500"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-mono text-slate-700 dark:text-slate-300 mb-1">WhatsApp *</label>
                                    <input
                                        type="text"
                                        required
                                        value={newTicketData.whatsapp}
                                        onChange={(e) => setNewTicketData({ ...newTicketData, whatsapp: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-orange-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-mono text-slate-700 dark:text-slate-300 mb-1">Tipe Perangkat *</label>
                                    <input
                                        type="text"
                                        required
                                        value={newTicketData.device_type}
                                        onChange={(e) => setNewTicketData({ ...newTicketData, device_type: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-orange-500"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-mono text-slate-700 dark:text-slate-300 mb-1">Merek & Model Perangkat *</label>
                                <input
                                    type="text"
                                    required
                                    value={newTicketData.device_brand_model}
                                    onChange={(e) => setNewTicketData({ ...newTicketData, device_brand_model: e.target.value })}
                                    placeholder="Contoh: ASUS ROG Zephyrus G14 (2024)"
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-orange-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-mono text-slate-700 dark:text-slate-300 mb-1">Keluhan Kerusakan *</label>
                                <textarea
                                    rows={2}
                                    required
                                    value={newTicketData.problem_reported}
                                    onChange={(e) => setNewTicketData({ ...newTicketData, problem_reported: e.target.value })}
                                    className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-orange-500"
                                />
                            </div>
                            <button type="submit" className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 font-bold text-slate-950 text-xs transition-colors shadow-lg shadow-orange-500/25">
                                Terbitkan Nota Servis
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: New Gallery */}
            {galleryModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/85 backdrop-blur-xl animate-in fade-in">
                    <div className="relative max-w-lg w-full bg-white dark:bg-[#090D16] border border-amber-500/30 rounded-3xl p-6 md:p-8 shadow-2xl text-slate-900 dark:text-slate-100">
                        <button onClick={() => setGalleryModalOpen(false)} className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                        <h3 className="font-heading font-bold text-xl text-slate-900 dark:text-white mb-4">Tambah Item Galeri & EXIF</h3>
                        <form onSubmit={handleCreateGallerySubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-mono text-slate-700 dark:text-slate-300 mb-1">Judul Karya *</label>
                                <input
                                    type="text"
                                    required
                                    value={newGalleryData.title}
                                    onChange={(e) => setNewGalleryData({ ...newGalleryData, title: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-amber-500"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-mono text-slate-700 dark:text-slate-300 mb-1">Kategori *</label>
                                    <select
                                        value={newGalleryData.category}
                                        onChange={(e) => setNewGalleryData({ ...newGalleryData, category: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-amber-500"
                                    >
                                        <option value="commercial">Commercial</option>
                                        <option value="wedding">Wedding</option>
                                        <option value="product">Product</option>
                                        <option value="drone">Drone Aerial</option>
                                        <option value="event">Music & Event</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-mono text-slate-700 dark:text-slate-300 mb-1">Tipe Media *</label>
                                    <select
                                        value={newGalleryData.media_type}
                                        onChange={(e) => setNewGalleryData({ ...newGalleryData, media_type: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-amber-500"
                                    >
                                        <option value="photo">Foto Standar</option>
                                        <option value="before_after">Before / After Pair</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-mono text-slate-700 dark:text-slate-300 mb-1">URL Foto WebP *</label>
                                <input
                                    type="url"
                                    required
                                    value={newGalleryData.file_webp_path}
                                    onChange={(e) => setNewGalleryData({ ...newGalleryData, file_webp_path: e.target.value })}
                                    placeholder="https://images.unsplash.com/..."
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-amber-500"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-mono text-slate-700 dark:text-slate-300 mb-1">Camera Body</label>
                                    <input
                                        type="text"
                                        value={newGalleryData.camera}
                                        onChange={(e) => setNewGalleryData({ ...newGalleryData, camera: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-amber-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-mono text-slate-700 dark:text-slate-300 mb-1">Lens Optics</label>
                                    <input
                                        type="text"
                                        value={newGalleryData.lens}
                                        onChange={(e) => setNewGalleryData({ ...newGalleryData, lens: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-amber-500"
                                    />
                                </div>
                            </div>
                            <button type="submit" className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 font-bold text-slate-950 text-xs transition-colors shadow-lg shadow-amber-500/25">
                                Simpan ke Galeri Langit
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Collaboration Detail */}
            {selectedCollabDetail && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/85 backdrop-blur-xl animate-in fade-in">
                    <div className="relative max-w-2xl w-full bg-white dark:bg-[#090D16] border border-rose-500/30 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto text-slate-900 dark:text-slate-100">
                        <button
                            onClick={() => setSelectedCollabDetail(null)}
                            className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-500 dark:text-rose-400 shrink-0">
                                <Handshake className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-heading font-extrabold text-xl text-slate-900 dark:text-white">
                                    {selectedCollabDetail.organization_name}
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                                    Pengajuan Kerja Sama #{selectedCollabDetail.id} • Diterima {selectedCollabDetail.created_at ? new Date(selectedCollabDetail.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                                </p>
                            </div>
                        </div>

                        {/* Meta Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 text-xs font-mono">
                            <div>
                                <span className="text-slate-500 block text-[10px] uppercase">PIC Penanggung Jawab</span>
                                <span className="text-slate-900 dark:text-white font-bold text-sm block mt-0.5">{selectedCollabDetail.pic_name}</span>
                            </div>
                            <div>
                                <span className="text-slate-500 block text-[10px] uppercase">Email Resmi</span>
                                <a href={`mailto:${selectedCollabDetail.email}`} className="text-rose-600 dark:text-rose-400 hover:underline block mt-0.5 font-semibold">
                                    {selectedCollabDetail.email}
                                </a>
                            </div>
                            <div>
                                <span className="text-slate-500 block text-[10px] uppercase">Nomor WhatsApp</span>
                                <a
                                    href={`https://wa.me/${selectedCollabDetail.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Halo ${selectedCollabDetail.pic_name} (${selectedCollabDetail.organization_name}), kami dari Tim Partnership Langit ingin menindaklanjuti proposal kerja sama.`)}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-emerald-600 dark:text-emerald-400 hover:underline block mt-0.5 flex items-center gap-1 font-semibold"
                                >
                                    <Phone className="w-3 h-3" />
                                    <span>{selectedCollabDetail.whatsapp}</span>
                                </a>
                            </div>
                            <div>
                                <span className="text-slate-500 block text-[10px] uppercase">Target Waktu / Pelaksanaan</span>
                                <span className="text-slate-800 dark:text-slate-200 block mt-0.5">
                                    {selectedCollabDetail.event_date ? new Date(selectedCollabDetail.event_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Fleksibel / Sesuai Kesepakatan'}
                                </span>
                            </div>
                            <div>
                                <span className="text-slate-500 block text-[10px] uppercase">Skema Kemitraan</span>
                                <span className={`inline-block mt-1 px-2.5 py-1 rounded-lg border text-[11px] font-medium ${getCollabTypeInfo(selectedCollabDetail.collab_type).color}`}>
                                    {getCollabTypeInfo(selectedCollabDetail.collab_type).label}
                                </span>
                            </div>
                            <div>
                                <span className="text-slate-500 block text-[10px] uppercase">Status Saat Ini</span>
                                <div className="mt-1">
                                    <select
                                        value={selectedCollabDetail.status}
                                        onChange={(e) => {
                                            handleUpdateCollaborationStatus(selectedCollabDetail.id, e.target.value);
                                            setSelectedCollabDetail({ ...selectedCollabDetail, status: e.target.value });
                                        }}
                                        className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-rose-500/40 text-rose-700 dark:text-rose-300 font-bold text-xs uppercase focus:outline-none"
                                    >
                                        <option value="new">Baru Masuk</option>
                                        <option value="in_discussion">Sedang Diskusi</option>
                                        <option value="approved">Disetujui</option>
                                        <option value="declined">Ditolak</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Ringkasan Konsep / Harapan Kerja Sama */}
                        <div className="space-y-2">
                            <h4 className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                Ringkasan Konsep & Harapan Kerja Sama:
                            </h4>
                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">
                                {selectedCollabDetail.description || 'Tidak ada keterangan tambahan.'}
                            </div>
                        </div>

                        {/* Berkas Proposal PDF */}
                        <div className="space-y-2">
                            <h4 className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                Dokumen Proposal PDF:
                            </h4>
                            {selectedCollabDetail.proposal_pdf_path ? (
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <span className="font-bold text-xs text-slate-900 dark:text-white block">Berkas Proposal Terlampir (.PDF)</span>
                                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono block">Tersimpan aman di non-public storage server</span>
                                        </div>
                                    </div>
                                    <a
                                        href={selectedCollabDetail.proposal_pdf_path}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-lg shadow-rose-500/25 shrink-0"
                                    >
                                        <Download className="w-4 h-4" />
                                        <span>Buka Dokumen PDF</span>
                                    </a>
                                </div>
                            ) : (
                                <p className="text-xs text-slate-500 italic">Pendaftar tidak melampirkan berkas PDF pada formulir ini.</p>
                            )}
                        </div>

                        {/* Quick Action Buttons */}
                        <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                            <a
                                href={`https://wa.me/${selectedCollabDetail.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Halo ${selectedCollabDetail.pic_name} (${selectedCollabDetail.organization_name}), kami dari Tim Partnership Langit ingin menindaklanjuti proposal kerja sama terkait "${selectedCollabDetail.organization_name}".`)}`}
                                target="_blank"
                                rel="noreferrer"
                                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/25"
                            >
                                <Phone className="w-4 h-4" />
                                <span>Hubungi PIC via WhatsApp</span>
                            </a>

                            <button
                                onClick={() => setSelectedCollabDetail(null)}
                                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-700 dark:text-slate-300 font-medium text-xs transition-colors"
                            >
                                Tutup Detail
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
