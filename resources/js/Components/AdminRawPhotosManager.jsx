import React, { useState, useRef, useMemo } from 'react';
import { router } from '@inertiajs/react';
import { 
    Camera, Upload, Sparkles, Tag, Percent, Settings, 
    Trash2, Eye, X, Check, RefreshCw, AlertCircle, 
    Plus, Image as ImageIcon, ExternalLink, ShieldCheck,
    CheckCircle2, ChevronRight, Zap
} from 'lucide-react';
import { uploadRawPhotosBatch, formatUploadBytes } from '@/Utils/rawPhotoUploader.mjs';

export default function AdminRawPhotosManager({ clientDeliveries = [] }) {
    // Modals state
    const [uploadModalDelivery, setUploadModalDelivery] = useState(null);
    const [viewPhotosDelivery, setViewPhotosDelivery] = useState(null);
    const [viewPhotosLimit, setViewPhotosLimit] = useState(48);
    const [settingsModalDelivery, setSettingsModalDelivery] = useState(null);

    // Upload Form State
    const [uploadFiles, setUploadFiles] = useState([]);
    const [uploadPrice, setUploadPrice] = useState(15000);
    const [uploadDesc, setUploadDesc] = useState('Rp 15.000 / foto');
    const [uploadDisc5, setUploadDisc5] = useState(10);
    const [uploadDisc10, setUploadDisc10] = useState(20);
    const [uploadNotes, setUploadNotes] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadProgressText, setUploadProgressText] = useState('');
    const abortControllerRef = useRef(null);

    // Settings Form State
    const [settingsForm, setSettingsForm] = useState({
        raw_price_per_photo: 15000,
        raw_price_description: 'Rp 15.000 / foto',
        raw_discount_5_percent: 10,
        raw_discount_10_percent: 20,
        raw_notes: '',
    });
    const [isSavingSettings, setIsSavingSettings] = useState(false);

    // Selected photo to preview full in inspect modal
    const [inspectPhoto, setInspectPhoto] = useState(null);

    // Metrics
    const totalRawPhotos = clientDeliveries.reduce((sum, d) => sum + (d.raw_photos?.length || 0), 0);
    const deliveriesWithRaw = clientDeliveries.filter(d => (d.raw_photos?.length || 0) > 0).length;

    // Open upload modal
    const openUploadModal = (delivery) => {
        setUploadModalDelivery(delivery);
        setUploadFiles([]);
        setUploadPrice(delivery.raw_price_per_photo || 15000);
        setUploadDesc(delivery.raw_price_description || 'Rp 15.000 / foto');
        setUploadDisc5(delivery.raw_discount_5_percent || 10);
        setUploadDisc10(delivery.raw_discount_10_percent || 20);
        setUploadNotes(delivery.raw_notes || '');
        setUploadProgress(0);
        setUploadProgressText('');
    };

    // Open settings modal
    const openSettingsModal = (delivery) => {
        setSettingsModalDelivery(delivery);
        setSettingsForm({
            raw_price_per_photo: delivery.raw_price_per_photo || 15000,
            raw_price_description: delivery.raw_price_description || 'Rp 15.000 / foto',
            raw_discount_5_percent: delivery.raw_discount_5_percent || 10,
            raw_discount_10_percent: delivery.raw_discount_10_percent || 20,
            raw_notes: delivery.raw_notes || '',
        });
    };

    // Handle upload raw photos (Streaming batch intake with in-browser compression for 100-1000+ files)
    const handleUploadSubmit = async (e) => {
        e.preventDefault();
        if (!uploadModalDelivery || uploadFiles.length === 0) return;

        setIsUploading(true);
        setUploadProgress(0);
        setUploadProgressText(`Menyiapkan ${uploadFiles.length} foto mentahan...`);

        const controller = new AbortController();
        abortControllerRef.current = controller;

        try {
            const result = await uploadRawPhotosBatch({
                deliveryId: uploadModalDelivery.id,
                files: uploadFiles,
                settings: {
                    raw_price_per_photo: uploadPrice,
                    raw_price_description: uploadDesc,
                    raw_discount_5_percent: uploadDisc5,
                    raw_discount_10_percent: uploadDisc10,
                    raw_notes: uploadNotes,
                },
                batchSize: 10,
                concurrency: 2,
                signal: controller.signal,
                onProgress: (p) => {
                    setUploadProgress(p.percent);
                    setUploadProgressText(p.statusText);
                },
            });

            if (result.success) {
                setUploadProgressText(`${result.uploadedCount} foto mentahan berhasil dikompresi & diunggah.`);
                setTimeout(() => {
                    setIsUploading(false);
                    setUploadModalDelivery(null);
                    setUploadFiles([]);
                    router.reload({ only: ['clientDeliveries'] });
                }, 800);
            } else {
                setIsUploading(false);
                setUploadProgressText(result.errors?.[0] || 'Gagal mengunggah foto.');
            }
        } catch (err) {
            setIsUploading(false);
            if (err.name === 'AbortError') {
                setUploadProgressText('Proses upload dibatalkan oleh admin.');
            } else {
                setUploadProgressText('Kendala jaringan: ' + (err.message || 'Silakan coba lagi.'));
            }
        } finally {
            abortControllerRef.current = null;
        }
    };

    // Handle save settings
    const handleSettingsSubmit = (e) => {
        e.preventDefault();
        if (!settingsModalDelivery) return;

        setIsSavingSettings(true);
        router.put(`/admin/client-deliveries/${settingsModalDelivery.id}/raw-settings`, settingsForm, {
            preserveScroll: true,
            onSuccess: () => {
                setIsSavingSettings(false);
                setSettingsModalDelivery(null);
            },
            onError: () => {
                setIsSavingSettings(false);
            }
        });
    };

    // Delete single raw photo
    const handleDeletePhoto = (photoId) => {
        if (!confirm('Yakin ingin menghapus foto mentahan ini? File fisik dan pratinjau thumbnail akan dihapus permanen.')) {
            return;
        }

        router.delete(`/admin/client-raw-photos/${photoId}`, {
            preserveScroll: true,
            onSuccess: () => {
                // Update local modal state if open
                if (viewPhotosDelivery) {
                    setViewPhotosDelivery(prev => ({
                        ...prev,
                        raw_photos: prev.raw_photos.filter(p => p.id !== photoId)
                    }));
                }
            }
        });
    };

    return (
        <div className="space-y-6">
            {/* Header Description & Metrics */}
            <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-[#090D16] border border-slate-200/90 dark:border-white/10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                            <Sparkles className="w-5 h-5" />
                        </span>
                        <h2 className="font-heading font-black text-xl text-slate-900 dark:text-white">
                            Manajemen Foto Mentahan & Diskon Pelanggan
                        </h2>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
                        Unggah foto mentahan untuk dipilih oleh pelanggan. Setiap foto mentahan otomatis dikompresi ber-watermark <strong>Langit Creative</strong>, dilindungi anti-download, serta dihitung dengan harga dan diskon berjenjang (minimal 5 foto dan 10 foto) yang Anda atur.
                    </p>
                </div>

                <div className="flex items-center gap-2.5">
                    <span className="px-3 py-1.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-700 dark:text-cyan-300 font-mono text-xs font-bold">
                        {totalRawPhotos} Foto Mentahan Tersimpan
                    </span>
                </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-white dark:bg-[#090D16] border border-slate-200/80 dark:border-white/10 shadow-xs">
                    <span className="text-[11px] font-mono text-slate-500 block">Total Foto Mentahan</span>
                    <span className="font-heading font-black text-2xl text-cyan-600 dark:text-cyan-400 mt-1 block">
                        {totalRawPhotos} Foto
                    </span>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-[#090D16] border border-slate-200/80 dark:border-white/10 shadow-xs">
                    <span className="text-[11px] font-mono text-slate-500 block">Album Memiliki Mentahan</span>
                    <span className="font-heading font-black text-2xl text-emerald-600 dark:text-emerald-400 mt-1 block">
                        {deliveriesWithRaw} dari {clientDeliveries.length}
                    </span>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-[#090D16] border border-slate-200/80 dark:border-white/10 shadow-xs">
                    <span className="text-[11px] font-mono text-slate-500 block">Aturan Diskon Min 5</span>
                    <span className="font-heading font-black text-2xl text-amber-500 mt-1 block">
                        Diskon 10%
                    </span>
                    <span className="text-[10px] text-slate-400 block font-mono mt-0.5">Dapat diubah per album</span>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-[#090D16] border border-slate-200/80 dark:border-white/10 shadow-xs">
                    <span className="text-[11px] font-mono text-slate-500 block">Aturan Diskon Min 10</span>
                    <span className="font-heading font-black text-2xl text-indigo-500 mt-1 block">
                        Diskon 20%
                    </span>
                    <span className="text-[10px] text-slate-400 block font-mono mt-0.5">Dapat diubah per album</span>
                </div>
            </div>

            {/* Deliveries Table for Raw Photos */}
            {clientDeliveries.length === 0 ? (
                <div className="text-center py-16 rounded-3xl bg-white dark:bg-[#090D16] border border-slate-200 dark:border-white/10 p-8">
                    <Camera className="w-12 h-12 text-slate-400 mx-auto mb-2 opacity-60" />
                    <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">
                        Belum Ada Pelanggan Terdaftar
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Buat akses pelanggan terlebih dahulu di tab "Foto Jadi" sebelum mengunggah foto mentahan.
                    </p>
                </div>
            ) : (
                <div className="rounded-3xl bg-white dark:bg-[#090D16] border border-slate-200/90 dark:border-white/10 overflow-hidden shadow-sm">
                    <div className="min-w-0 max-w-full overflow-x-auto overscroll-x-contain" tabIndex={0} role="region" aria-label="Tabel foto mentahan pelanggan">
                        <table className="w-full min-w-[62rem] text-left border-collapse [&_td]:max-w-xs">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02] text-[11px] font-mono uppercase text-slate-500">
                                    <th className="px-5 py-3.5">Pelanggan</th>
                                    <th className="px-5 py-3.5">Judul Sesi / Album</th>
                                    <th className="px-5 py-3.5">Foto Mentahan</th>
                                    <th className="px-5 py-3.5">Harga per Foto</th>
                                    <th className="px-5 py-3.5">Diskon Min. 5 & 10</th>
                                    <th className="px-5 py-3.5 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-xs">
                                {clientDeliveries.map((delivery) => {
                                    const rawCount = delivery.raw_photos?.length || 0;
                                    const price = delivery.raw_price_per_photo || 15000;
                                    const disc5 = delivery.raw_discount_5_percent || 10;
                                    const disc10 = delivery.raw_discount_10_percent || 20;

                                    return (
                                        <tr key={delivery.id} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors">
                                            <td className="px-5 py-4">
                                                <span className="font-bold text-slate-900 dark:text-white block text-sm">
                                                    {delivery.client_name}
                                                </span>
                                                <span className="text-[11px] font-mono text-slate-500 block">
                                                    @{delivery.client_username || delivery.user?.username}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4">
                                                <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                                                    {delivery.title}
                                                </span>
                                                <span className="text-[10px] text-slate-400 block truncate max-w-xs">
                                                    {delivery.raw_notes || 'Tidak ada catatan khusus'}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4">
                                                {rawCount > 0 ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 font-mono font-bold text-xs">
                                                        <Sparkles className="w-3.5 h-3.5" />
                                                        <span>{rawCount} Foto Mentahan</span>
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400 italic text-xs">
                                                        Belum ada mentahan
                                                    </span>
                                                )}
                                            </td>

                                            <td className="px-5 py-4 font-mono">
                                                <span className="font-bold text-slate-900 dark:text-white block">
                                                    Rp {price.toLocaleString('id-ID')}
                                                </span>
                                                <span className="text-[10px] text-slate-500 block">
                                                    {delivery.raw_price_description || 'Rp 15.000 / foto'}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-1.5 font-mono text-[11px]">
                                                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                                                        5 Foto: {disc5}%
                                                    </span>
                                                    <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold">
                                                        10 Foto: {disc10}%
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="px-5 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => openUploadModal(delivery)}
                                                        className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                                                        title="Upload Foto Mentahan"
                                                    >
                                                        <Plus className="w-3.5 h-3.5" />
                                                        <span>Upload</span>
                                                    </button>

                                                    {rawCount > 0 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setViewPhotosDelivery(delivery)}
                                                            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-700 dark:text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
                                                            title="Lihat Galeri Foto Mentahan"
                                                        >
                                                            <Eye className="w-3.5 h-3.5" />
                                                            <span>Lihat ({rawCount})</span>
                                                        </button>
                                                    )}

                                                    <button
                                                        type="button"
                                                        onClick={() => openSettingsModal(delivery)}
                                                        className="p-1.5 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-600 dark:text-slate-300 cursor-pointer"
                                                        title="Atur Harga & Diskon"
                                                    >
                                                        <Settings className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ── MODAL: UPLOAD FOTO MENTAHAN ── */}
            {uploadModalDelivery && (
                <div 
                    className="fixed inset-0 h-dvh overflow-y-auto overscroll-contain z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
                    onClick={() => !isUploading && setUploadModalDelivery(null)}
                >
                    <div 
                        className="w-full max-w-xl rounded-3xl bg-white dark:bg-[#0c1220] border border-slate-200 dark:border-white/10 p-6 sm:p-7 shadow-2xl space-y-5"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
                            <div className="flex items-center gap-2.5">
                                <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                                    <Upload className="w-5 h-5" />
                                </span>
                                <div>
                                    <h3 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white">
                                        Upload Foto Mentahan
                                    </h3>
                                    <span className="text-[11px] font-mono text-slate-500">
                                        {uploadModalDelivery.client_name} • {uploadModalDelivery.title}
                                    </span>
                                </div>
                            </div>
                            <button
                                type="button"
                                disabled={isUploading}
                                onClick={() => setUploadModalDelivery(null)}
                                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleUploadSubmit} className="space-y-4">
                            {/* File Selector */}
                            <div className="space-y-1.5">
                                <div className="flex flex-wrap items-center justify-between gap-1">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                                        Pilih Berkas Foto Mentahan:
                                    </label>
                                    <span className="text-[10px] font-mono font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20">
                                        ⚡ Auto-Kompres Cepat (Bebas 100 - 1000+ Foto)
                                    </span>
                                </div>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    disabled={isUploading}
                                    onChange={(e) => setUploadFiles(Array.from(e.target.files || []))}
                                    className="w-full text-xs file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-cyan-500 file:text-slate-950 hover:file:bg-cyan-400 text-slate-600 dark:text-slate-400 cursor-pointer"
                                />
                                <span className="text-[11px] font-mono text-slate-500 block">
                                    {uploadFiles.length > 0 
                                        ? `${uploadFiles.length} foto dipilih (Kapasitas asli: ${formatUploadBytes(uploadFiles.reduce((s, f) => s + (f.size || 0), 0))}, otomatis dikompres Full HD sebelum dikirim agar kilat)` 
                                        : 'Mendukung multi-file upload beresolusi kamera tanpa batas jumlah.'}
                                </span>
                            </div>

                            {/* Price Settings in same form */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200 dark:border-white/10">
                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                                        Harga Satuan per Foto (Rp):
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="1000"
                                        value={uploadPrice}
                                        onChange={(e) => setUploadPrice(Number(e.target.value))}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/10 text-xs font-mono font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                                        Deskripsi Label Harga:
                                    </label>
                                    <input
                                        type="text"
                                        value={uploadDesc}
                                        onChange={(e) => setUploadDesc(e.target.value)}
                                        placeholder="Contoh: Rp 15.000 / foto"
                                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/10 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500"
                                    />
                                </div>
                            </div>

                            {/* Discount Tiers in same form */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 block">
                                        Diskon Min. 5 Foto (%):
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={uploadDisc5}
                                        onChange={(e) => setUploadDisc5(Number(e.target.value))}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/10 text-xs font-mono font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 block">
                                        Diskon Min. 10 Foto (%):
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={uploadDisc10}
                                        onChange={(e) => setUploadDisc10(Number(e.target.value))}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/10 text-xs font-mono font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>

                            {/* Notes */}
                            <div className="space-y-1">
                                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                                    Catatan untuk Pelanggan (Opsional):
                                </label>
                                <textarea
                                    rows={2}
                                    value={uploadNotes}
                                    onChange={(e) => setUploadNotes(e.target.value)}
                                    placeholder="Contoh: Silakan pilih minimal 5 foto untuk diskon khusus."
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/10 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500"
                                />
                            </div>

                            {/* Live Streaming Progress Bar */}
                            {isUploading && (
                                <div className="space-y-2 p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30">
                                    <div className="flex items-center justify-between text-xs font-mono">
                                        <span className="font-bold text-cyan-900 dark:text-cyan-200 flex items-center gap-2">
                                            <RefreshCw className="w-4 h-4 animate-spin text-cyan-500" />
                                            <span>{uploadProgressText}</span>
                                        </span>
                                        <span className="font-extrabold text-cyan-600 dark:text-cyan-400">
                                            {uploadProgress}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-200 dark:bg-white/10 rounded-full h-2.5 overflow-hidden">
                                        <div 
                                            className="bg-gradient-to-r from-cyan-500 to-sky-600 h-2.5 rounded-full transition-all duration-300"
                                            style={{ width: `${uploadProgress}%` }}
                                        />
                                    </div>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                                        ⚡ Foto dikompresi otomatis & dikirim bertahap per-batch. Server bebas timeout.
                                    </p>
                                </div>
                            )}

                            {!isUploading && uploadProgressText && (
                                <div className="p-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 text-xs flex items-center gap-2">
                                    <Check className="w-4 h-4 text-emerald-500" />
                                    <span>{uploadProgressText}</span>
                                </div>
                            )}

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-white/10">
                                {isUploading ? (
                                    <button
                                        type="button"
                                        onClick={() => abortControllerRef.current?.abort()}
                                        className="px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs cursor-pointer"
                                    >
                                        Batalkan Upload
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setUploadModalDelivery(null)}
                                        className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300 text-xs font-semibold cursor-pointer"
                                    >
                                        Batal
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    disabled={isUploading || uploadFiles.length === 0}
                                    className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 cursor-pointer disabled:opacity-50"
                                >
                                    {isUploading ? (
                                        <>
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                            <span>Mengunggah ({uploadProgress}%)...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-4 h-4" />
                                            <span>Mulai Unggah ({uploadFiles.length} Foto)</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── MODAL: ATUR HARGA & DISKON ── */}
            {settingsModalDelivery && (
                <div 
                    className="fixed inset-0 h-dvh overflow-y-auto overscroll-contain z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
                    onClick={() => !isSavingSettings && setSettingsModalDelivery(null)}
                >
                    <div 
                        className="w-full max-w-md rounded-3xl bg-white dark:bg-[#0c1220] border border-slate-200 dark:border-white/10 p-6 sm:p-7 shadow-2xl space-y-5"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
                            <div className="flex items-center gap-2.5">
                                <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                                    <Settings className="w-5 h-5" />
                                </span>
                                <div>
                                    <h3 className="font-heading font-extrabold text-base text-slate-900 dark:text-white">
                                        Atur Harga & Diskon Mentahan
                                    </h3>
                                    <span className="text-[11px] font-mono text-slate-500">
                                        {settingsModalDelivery.title}
                                    </span>
                                </div>
                            </div>
                            <button
                                type="button"
                                disabled={isSavingSettings}
                                onClick={() => setSettingsModalDelivery(null)}
                                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSettingsSubmit} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                                    Harga Satuan per Foto (Rp):
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    step="1000"
                                    required
                                    value={settingsForm.raw_price_per_photo}
                                    onChange={(e) => setSettingsForm({ ...settingsForm, raw_price_per_photo: Number(e.target.value) })}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/10 text-xs font-mono font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                                    Deskripsi Label Harga:
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={settingsForm.raw_price_description}
                                    onChange={(e) => setSettingsForm({ ...settingsForm, raw_price_description: e.target.value })}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/10 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block">
                                        Diskon Min. 5 Foto (%):
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        required
                                        value={settingsForm.raw_discount_5_percent}
                                        onChange={(e) => setSettingsForm({ ...settingsForm, raw_discount_5_percent: Number(e.target.value) })}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/10 text-xs font-mono font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-indigo-600 dark:text-indigo-400 block">
                                        Diskon Min. 10 Foto (%):
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        required
                                        value={settingsForm.raw_discount_10_percent}
                                        onChange={(e) => setSettingsForm({ ...settingsForm, raw_discount_10_percent: Number(e.target.value) })}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/10 text-xs font-mono font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                                    Catatan / Pengantar Khusus:
                                </label>
                                <textarea
                                    rows={2}
                                    value={settingsForm.raw_notes}
                                    onChange={(e) => setSettingsForm({ ...settingsForm, raw_notes: e.target.value })}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/10 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-white/10">
                                <button
                                    type="button"
                                    disabled={isSavingSettings}
                                    onClick={() => setSettingsModalDelivery(null)}
                                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300 text-xs font-semibold"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSavingSettings}
                                    className="px-5 py-2 rounded-xl bg-[#005792] hover:bg-[#004270] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
                                >
                                    {isSavingSettings ? (
                                        <>
                                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                            <span>Menyimpan...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                                            <span>Simpan Pengaturan</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── MODAL: LIHAT GALERI FOTO MENTAHAN ── */}
            {viewPhotosDelivery && (
                <div 
                    className="fixed inset-0 h-dvh overflow-y-auto overscroll-contain z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
                    onClick={() => setViewPhotosDelivery(null)}
                >
                    <div 
                        className="w-full max-w-4xl max-h-[90vh] rounded-3xl bg-white dark:bg-[#0c1220] border border-slate-200 dark:border-white/10 p-6 flex flex-col shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4 shrink-0">
                            <div>
                                <h3 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white">
                                    Galeri Foto Mentahan ({viewPhotosDelivery.raw_photos?.length || 0} Foto)
                                </h3>
                                <span className="text-[11px] font-mono text-slate-500">
                                    {viewPhotosDelivery.client_name} • {viewPhotosDelivery.title}
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setViewPhotosDelivery(null)}
                                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Photos Grid Scrollable */}
                        <div className="flex-1 overflow-y-auto py-4 pr-1">
                            {(!viewPhotosDelivery.raw_photos || viewPhotosDelivery.raw_photos.length === 0) ? (
                                <div className="text-center py-12 text-slate-500 text-xs font-mono">
                                    Belum ada foto mentahan.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                        {(viewPhotosDelivery.raw_photos || []).slice(0, viewPhotosLimit).map((photo, idx) => (
                                            <div 
                                                key={photo.id}
                                                className="group relative rounded-xl overflow-hidden bg-slate-900 border border-slate-200 dark:border-white/10 flex flex-col"
                                            >
                                                <div className="aspect-[4/3] w-full relative bg-slate-950 overflow-hidden">
                                                    <img
                                                        src={photo.preview_url}
                                                        alt={photo.original_name}
                                                        loading="lazy"
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-black/70 text-white font-mono text-[9px] font-bold">
                                                        #{idx + 1}
                                                    </span>
                                                    <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded-md bg-black/70 text-slate-300 font-mono text-[9px]">
                                                        {photo.formatted_size}
                                                    </span>

                                                    {/* Delete button overlay */}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeletePhoto(photo.id)}
                                                        className="absolute top-1.5 right-1.5 p-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                                        title="Hapus foto mentahan ini"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>

                                                <div className="p-2 bg-white dark:bg-[#0c1220] flex items-center justify-between text-[10px] border-t border-slate-100 dark:border-white/5">
                                                    <span className="font-mono text-slate-700 dark:text-slate-300 truncate max-w-[120px]" title={photo.original_name}>
                                                        {photo.original_name}
                                                    </span>
                                                    <span className="font-mono text-cyan-600 font-bold">
                                                        Rp {(photo.effective_price || viewPhotosDelivery.raw_price_per_photo || 15000).toLocaleString('id-ID')}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Progressive Load for Admin Modal */}
                                    {viewPhotosLimit < (viewPhotosDelivery.raw_photos?.length || 0) && (
                                        <div className="pt-2 flex items-center justify-center gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setViewPhotosLimit(prev => prev + 48)}
                                                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer"
                                            >
                                                Muat 48 Foto Berikutnya (Sisa {viewPhotosDelivery.raw_photos.length - viewPhotosLimit})
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setViewPhotosLimit(viewPhotosDelivery.raw_photos.length)}
                                                className="px-4 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 text-xs font-semibold cursor-pointer"
                                            >
                                                Tampilkan Semua ({viewPhotosDelivery.raw_photos.length})
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex justify-end shrink-0">
                            <button
                                type="button"
                                onClick={() => setViewPhotosDelivery(null)}
                                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300 text-xs font-semibold"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
