import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { 
    SlidersHorizontal, Edit3, Image as ImageIcon, Upload, Check, X,
    Sparkles, Camera, Code2, GraduationCap, Cpu, PackageCheck, Handshake,
    ExternalLink, Eye, RefreshCw, Palette, Tag, Hash, FileText
} from 'lucide-react';

const SERVICE_ICONS = {
    'photography-videography': Camera,
    'web-development': Code2,
    'langit-education': GraduationCap,
    'computer-service': Cpu,
    'internship': Sparkles,
    'sewa-alat': PackageCheck,
    'kolaborasi': Handshake,
};

const COLOR_PRESETS = [
    { label: 'Kuning Emas', value: '#EAB308' },
    { label: 'Cyber Sky', value: '#0EA5E9' },
    { label: 'Hijau Daun Segar', value: '#16A34A' },
    { label: 'Hardware Orange', value: '#EA580C' },
    { label: 'Electric Violet', value: '#8B5CF6' },
    { label: 'Hijau Telur Asin / Tosca', value: '#06B6D4' },
    { label: 'Rose Pink', value: '#EC4899' },
    { label: 'Indigo Blue', value: '#6366F1' },
];

export default function AdminServiceCardsManager({ services = [] }) {
    const [editingService, setEditingService] = useState(null);
    const [inputMode, setInputMode] = useState('url'); // 'url' or 'upload'
    const [filePhoto, setFilePhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [tagInput, setTagInput] = useState('');
    const [toastMessage, setToastMessage] = useState('');

    const openEditModal = (service) => {
        let parsedTags = service.tags || [];
        if (typeof parsedTags === 'string') {
            try {
                parsedTags = JSON.parse(parsedTags);
            } catch (e) {
                parsedTags = parsedTags.split(',').map(t => t.trim()).filter(Boolean);
            }
        }

        setEditingService({
            id: service.id,
            name: service.name || '',
            slug: service.slug || '',
            tagline: service.tagline || '',
            description: service.description || '',
            image_url: service.image_url || '',
            accent_color: service.accent_color || '#0EA5E9',
            vip_label: service.vip_label || '',
            ribbon_text: service.ribbon_text || 'PRO',
            serial_number: service.serial_number || '2280 ••••',
            tags: Array.isArray(parsedTags) ? parsedTags : [],
            is_active: service.is_active ?? true,
        });

        setPhotoPreview(service.image_url || '');
        setFilePhoto(null);
        setInputMode('url');
        setTagInput('');
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFilePhoto(file);
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const handleAddTag = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const trimmed = tagInput.trim().replace(/^,|,$/g, '');
            if (trimmed && !editingService.tags.includes(trimmed)) {
                setEditingService(prev => ({
                    ...prev,
                    tags: [...prev.tags, trimmed],
                }));
                setTagInput('');
            }
        }
    };

    const handleRemoveTag = (tagToRemove) => {
        setEditingService(prev => ({
            ...prev,
            tags: prev.tags.filter(t => t !== tagToRemove),
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!editingService) return;

        setIsSubmitting(true);
        const formData = new FormData();
        formData.append('name', editingService.name);
        formData.append('tagline', editingService.tagline || '');
        formData.append('description', editingService.description || '');
        formData.append('image_url', editingService.image_url || '');
        formData.append('accent_color', editingService.accent_color || '#0EA5E9');
        formData.append('vip_label', editingService.vip_label || '');
        formData.append('ribbon_text', editingService.ribbon_text || '');
        formData.append('serial_number', editingService.serial_number || '');
        formData.append('is_active', editingService.is_active ? '1' : '0');

        // Tags as comma-separated or JSON
        if (editingService.tags && editingService.tags.length > 0) {
            formData.append('tags', JSON.stringify(editingService.tags));
        }

        if (filePhoto) {
            formData.append('file_photo', filePhoto);
        }

        router.post(`/admin/services/${editingService.id}/update`, formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setIsSubmitting(false);
                setEditingService(null);
                setToastMessage('Kartu layanan berhasil diperbarui!');
                setTimeout(() => setToastMessage(''), 4000);
            },
            onError: () => {
                setIsSubmitting(false);
            },
        });
    };

    return (
        <div className="space-y-6">
            {/* Header info bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white dark:bg-[#090D16] border border-slate-200/90 dark:border-white/10 shadow-sm dark:shadow-md">
                <div>
                    <div className="flex items-center gap-2 text-[#005792] dark:text-[#38BDF8] font-mono text-xs uppercase tracking-widest font-bold mb-1">
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                        <span>Homepage 3D VIP Cards Manager</span>
                    </div>
                    <h3 className="font-heading font-extrabold text-xl text-slate-900 dark:text-white">
                        Manajemen 7 Divisi Layanan Terintegrasi
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Ubah foto visual card bagian atas, deskripsi bagian bawah, warna tema, label VIP, dan tag fitur yang tampil pada halaman beranda.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <span className="px-3 py-1.5 rounded-xl bg-sky-50 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/20 text-xs font-mono font-semibold text-[#005792] dark:text-[#38BDF8]">
                        {services.length} Divisi Aktif
                    </span>
                    <a
                        href="/#services"
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1.5 border border-slate-200 dark:border-white/10"
                    >
                        <span>Pratinjau Beranda</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                </div>
            </div>

            {/* Notification Toast */}
            {toastMessage && (
                <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center justify-between shadow-sm animate-fade-in">
                    <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>{toastMessage}</span>
                    </div>
                    <button onClick={() => setToastMessage('')} className="p-1 hover:opacity-75">
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}

            {/* 7 Services Grid Preview & Management */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service, idx) => {
                    const ServiceIcon = SERVICE_ICONS[service.slug] || Camera;
                    let tags = service.tags || [];
                    if (typeof tags === 'string') {
                        try {
                            tags = JSON.parse(tags);
                        } catch (e) {
                            tags = tags.split(',').map(t => t.trim()).filter(Boolean);
                        }
                    }

                    return (
                        <div
                            key={service.id || idx}
                            className="group relative rounded-3xl bg-white dark:bg-[#090D16] border border-slate-200 dark:border-white/10 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between"
                        >
                            {/* Card Top: Photo Thumbnail */}
                            <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
                                {service.image_url ? (
                                    <img
                                        src={service.image_url}
                                        alt={service.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 gap-1.5 p-4 text-center">
                                        <ImageIcon className="w-8 h-8 opacity-40" />
                                        <span className="text-[11px] font-mono">Belum ada foto visual</span>
                                    </div>
                                )}

                                {/* Overlay gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                                {/* Ribbon badge top-right */}
                                <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-md font-mono text-[10px] font-black uppercase text-slate-950 shadow-md"
                                     style={{ backgroundColor: service.accent_color || '#F59E0B' }}>
                                    {service.ribbon_text || 'PRO'}
                                </div>

                                {/* Division badge top-left */}
                                <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-[10px] font-mono font-semibold">
                                    <ServiceIcon className="w-3 h-3" style={{ color: service.accent_color || '#38BDF8' }} />
                                    <span>Divisi {String(idx + 1).padStart(2, '0')}</span>
                                </div>

                                {/* Color swatch pill bottom-left */}
                                <div className="absolute bottom-2.5 left-3 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-mono text-slate-200 border border-white/10">
                                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: service.accent_color || '#0EA5E9' }} />
                                    <span>{service.accent_color || '#0EA5E9'}</span>
                                </div>
                            </div>

                            {/* Card Body: Title & Description */}
                            <div className="p-5 flex-1 flex flex-col justify-between">
                                <div>
                                    <div className="flex items-start justify-between gap-2 mb-1.5">
                                        <h4 className="font-heading font-extrabold text-base text-slate-900 dark:text-white leading-snug">
                                            {service.name}
                                        </h4>
                                        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 shrink-0">
                                            {service.serial_number || `${2281 + idx} ••••`}
                                        </span>
                                    </div>

                                    {service.vip_label && (
                                        <p className="text-[11px] font-mono font-semibold uppercase tracking-wider mb-2 text-[#005792] dark:text-[#38BDF8]">
                                            {service.vip_label}
                                        </p>
                                    )}

                                    {/* Description */}
                                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3 mb-3">
                                        {service.description || 'Belum ada deskripsi yang diatur untuk card ini.'}
                                    </p>

                                    {/* Tags */}
                                    {Array.isArray(tags) && tags.length > 0 && (
                                        <div className="flex flex-wrap items-center gap-1 mb-4">
                                            {tags.map((t, i) => (
                                                <span key={i} className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[10px] font-mono text-slate-600 dark:text-slate-400">
                                                    {t}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Card Footer: Edit Button */}
                                <div className="pt-3 border-t border-slate-100 dark:border-white/10 flex items-center justify-between">
                                    <span className="text-[10px] font-mono text-slate-600 dark:text-slate-300 font-medium">
                                        slug: <span className="font-semibold text-slate-700 dark:text-slate-200">/{service.slug}</span>
                                    </span>

                                    <button
                                        type="button"
                                        onClick={() => openEditModal(service)}
                                        className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#005792] hover:bg-[#004270] text-white transition-all shadow-sm flex items-center gap-1.5 hover:scale-[1.02]"
                                    >
                                        <Edit3 className="w-3.5 h-3.5" />
                                        <span>Edit Card</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* ── MODAL EDIT KARTU LAYANAN ──────────────────────────────── */}
            {editingService && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
                    <div className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-[#0E131F] border border-slate-200 dark:border-white/10 shadow-2xl p-6 sm:p-8 my-8 max-h-[92vh] overflow-y-auto">
                        {/* Header */}
                        <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-200 dark:border-white/10">
                            <div>
                                <div className="flex items-center gap-2 text-[#005792] dark:text-[#38BDF8] font-mono text-xs uppercase tracking-wider font-bold">
                                    <SlidersHorizontal className="w-3.5 h-3.5" />
                                    <span>Edit Kartu Divisi Layanan</span>
                                </div>
                                <h3 className="font-heading font-extrabold text-xl text-slate-900 dark:text-white mt-1">
                                    {editingService.name}
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setEditingService(null)}
                                className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* 1. Judul & VIP Subtitle */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-mono font-bold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
                                        Nama Divisi Layanan
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={editingService.name}
                                        onChange={(e) => setEditingService(prev => ({ ...prev, name: e.target.value }))}
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#005792]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-mono font-bold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
                                        VIP Subtitle / Label
                                    </label>
                                    <input
                                        type="text"
                                        value={editingService.vip_label}
                                        onChange={(e) => setEditingService(prev => ({ ...prev, vip_label: e.target.value }))}
                                        placeholder="Contoh: Visual & Cinema"
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#005792]"
                                    />
                                </div>
                            </div>

                            {/* 2. Ribbon Text, Warna Aksen & Serial Number */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-mono font-bold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
                                        Ribbon Tag (Top Right)
                                    </label>
                                    <input
                                        type="text"
                                        value={editingService.ribbon_text}
                                        onChange={(e) => setEditingService(prev => ({ ...prev, ribbon_text: e.target.value }))}
                                        placeholder="GOLD / CYBER / PRO"
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs font-semibold uppercase focus:outline-none focus:ring-2 focus:ring-[#005792]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-mono font-bold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
                                        Serial Code
                                    </label>
                                    <input
                                        type="text"
                                        value={editingService.serial_number}
                                        onChange={(e) => setEditingService(prev => ({ ...prev, serial_number: e.target.value }))}
                                        placeholder="2281 ••••"
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-[#005792]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-mono font-bold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
                                        Warna Aksen Card
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            value={editingService.accent_color}
                                            onChange={(e) => setEditingService(prev => ({ ...prev, accent_color: e.target.value }))}
                                            className="w-10 h-9 p-0.5 rounded-lg border border-slate-300 dark:border-white/10 bg-transparent cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            value={editingService.accent_color}
                                            onChange={(e) => setEditingService(prev => ({ ...prev, accent_color: e.target.value }))}
                                            className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs font-mono uppercase focus:outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Color presets quick buttons */}
                            <div>
                                <span className="block text-[11px] font-mono text-slate-600 dark:text-slate-300 font-medium mb-1.5">
                                    Preset Warna Cepat:
                                </span>
                                <div className="flex flex-wrap items-center gap-1.5">
                                    {COLOR_PRESETS.map((cp) => (
                                        <button
                                            key={cp.value}
                                            type="button"
                                            onClick={() => setEditingService(prev => ({ ...prev, accent_color: cp.value }))}
                                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono border transition-all"
                                            style={{
                                                borderColor: editingService.accent_color === cp.value ? cp.value : 'rgba(255,255,255,0.15)',
                                                backgroundColor: editingService.accent_color === cp.value ? `${cp.value}25` : 'transparent',
                                            }}
                                        >
                                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cp.value }} />
                                            <span className="text-slate-700 dark:text-slate-300 font-medium">{cp.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* 3. FOTO BAGIAN ATAS CARD */}
                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-mono font-bold uppercase text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                        <ImageIcon className="w-4 h-4 text-[#005792] dark:text-[#38BDF8]" />
                                        <span>Foto Visual Card Bagian Atas</span>
                                    </label>

                                    {/* Mode switcher: Upload vs URL */}
                                    <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-200 dark:bg-white/10 text-xs font-mono">
                                        <button
                                            type="button"
                                            onClick={() => setInputMode('url')}
                                            className={`px-2.5 py-1 rounded-md transition-all ${
                                                inputMode === 'url' ? 'bg-white dark:bg-[#005792] text-[#005792] dark:text-white font-bold shadow-xs' : 'text-slate-600 dark:text-slate-300'
                                            }`}
                                        >
                                            Tautan URL
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setInputMode('upload')}
                                            className={`px-2.5 py-1 rounded-md transition-all ${
                                                inputMode === 'upload' ? 'bg-white dark:bg-[#005792] text-[#005792] dark:text-white font-bold shadow-xs' : 'text-slate-600 dark:text-slate-300'
                                            }`}
                                        >
                                            Upload File
                                        </button>
                                    </div>
                                </div>

                                {inputMode === 'url' ? (
                                    <div>
                                        <input
                                            type="url"
                                            value={editingService.image_url}
                                            onChange={(e) => {
                                                const url = e.target.value;
                                                setEditingService(prev => ({ ...prev, image_url: url }));
                                                setPhotoPreview(url);
                                            }}
                                            placeholder="https://images.unsplash.com/... atau /images/..."
                                            className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-black/30 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#005792]"
                                        />
                                        <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium mt-1">
                                            Masukkan tautan URL foto beresolusi tinggi (Unsplash, CDN, atau path internal).
                                        </p>
                                    </div>
                                ) : (
                                    <div>
                                        <label className="flex flex-col items-center justify-center p-5 rounded-xl border-2 border-dashed border-slate-300 dark:border-white/20 hover:border-[#005792] dark:hover:border-[#38BDF8] bg-white dark:bg-black/20 cursor-pointer transition-colors">
                                            <Upload className="w-6 h-6 text-[#005792] dark:text-[#38BDF8] mb-1.5" />
                                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                                                Klik untuk memilih berkas foto baru
                                            </span>
                                            <span className="text-[10px] text-slate-600 dark:text-slate-300 font-medium mt-0.5">
                                                Format didukung: JPG, PNG, WEBP (Maksimal 10 MB)
                                            </span>
                                            <input
                                                type="file"
                                                accept="image/jpeg,image/png,image/webp,image/jpg"
                                                onChange={handleFileChange}
                                                className="hidden"
                                            />
                                        </label>
                                        {filePhoto && (
                                            <p className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 mt-1.5 flex items-center gap-1">
                                                <Check className="w-3.5 h-3.5" />
                                                <span>File dipilih: {filePhoto.name}</span>
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Live Image Preview Box */}
                                {photoPreview && (
                                    <div className="relative h-40 w-full rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-inner bg-black">
                                        <img
                                            src={photoPreview}
                                            alt="Pratinjau Foto Card"
                                            className="w-full h-full object-cover"
                                            onError={() => setPhotoPreview('')}
                                        />
                                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 text-white font-mono text-[10px] font-semibold backdrop-blur-sm">
                                            Pratinjau Bagian Atas Card
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* 4. DESKRIPSI BAGIAN BAWAH CARD */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="block text-xs font-mono font-bold uppercase text-slate-700 dark:text-slate-300">
                                        Deskripsi Card (Bagian Bawah)
                                    </label>
                                    <span className="text-[11px] font-mono text-slate-600 dark:text-slate-300 font-medium">
                                        {editingService.description.length} karakter
                                    </span>
                                </div>
                                <textarea
                                    required
                                    rows={3}
                                    value={editingService.description}
                                    onChange={(e) => setEditingService(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Tuliskan deskripsi ringkas, tajam, dan persuasif untuk kartu divisi layanan ini..."
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#005792]"
                                />
                                <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium mt-1">
                                    Rekomendasi: 80 - 150 karakter agar tinggi kartu tetap proporsional dan elegan di semua layar.
                                </p>
                            </div>

                            {/* 5. Tag Fitur / Highlights */}
                            <div>
                                <label className="block text-xs font-mono font-bold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
                                    Tag Fitur / Highlights (Pills)
                                </label>
                                <div className="flex items-center gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={tagInput}
                                        onChange={(e) => setTagInput(e.target.value)}
                                        onKeyDown={handleAddTag}
                                        placeholder="Ketik tag lalu tekan Enter (contoh: Sony FX3, 4K Drone)"
                                        className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#005792]"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const trimmed = tagInput.trim().replace(/^,|,$/g, '');
                                            if (trimmed && !editingService.tags.includes(trimmed)) {
                                                setEditingService(prev => ({ ...prev, tags: [...prev.tags, trimmed] }));
                                                setTagInput('');
                                            }
                                        }}
                                        className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-800 dark:text-white transition-colors"
                                    >
                                        Tambah
                                    </button>
                                </div>

                                <div className="flex flex-wrap items-center gap-1.5 min-h-[32px] p-2 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10">
                                    {editingService.tags.length === 0 ? (
                                        <span className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">Belum ada tag fitur.</span>
                                    ) : (
                                        editingService.tags.map((tag, i) => (
                                            <span
                                                key={i}
                                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-50 dark:bg-sky-500/10 border border-sky-300 dark:border-sky-500/30 text-sky-800 dark:text-sky-300 text-xs font-mono font-medium"
                                            >
                                                <span>{tag}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveTag(tag)}
                                                    className="p-0.5 hover:text-red-500"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </span>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setEditingService(null)}
                                    className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#005792] hover:bg-[#004270] text-white transition-all shadow-md shadow-[#005792]/30 flex items-center gap-2 disabled:opacity-50"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                            <span>Menyimpan Perubahan...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Check className="w-4 h-4" />
                                            <span>Simpan Perubahan Card</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
