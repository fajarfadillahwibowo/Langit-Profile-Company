import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { 
    Camera, Upload, Clock, AlertTriangle, CheckCircle2, Trash2, 
    Plus, Eye, X, Calendar, RefreshCw, Download, FileImage, 
    User, Mail, Phone, Lock, ExternalLink, ShieldAlert, Key,
    Copy, Check, MessageSquare
} from 'lucide-react';

export default function AdminClientDeliveryManager({ clientDeliveries = [] }) {
    // Modal states
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [expiryModalDelivery, setExpiryModalDelivery] = useState(null);
    const [credentialsModalDelivery, setCredentialsModalDelivery] = useState(null);
    const [viewPhotosDelivery, setViewPhotosDelivery] = useState(null);
    const [addPhotosDelivery, setAddPhotosDelivery] = useState(null);
    const [copiedId, setCopiedId] = useState(null);

    // Create Form state
    const [createForm, setCreateForm] = useState({
        client_name: '',
        client_username: '',
        client_password: 'langit' + Math.floor(100 + Math.random() * 900),
        client_email: '',
        client_phone: '',
        title: '',
        notes: '',
        expiry_days: 7,
    });
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    // Additional Photos Form state
    const [additionalFiles, setAdditionalFiles] = useState([]);
    const [isUploadingAdditional, setIsUploadingAdditional] = useState(false);

    // Expiry Form state
    const [extendDays, setExtendDays] = useState(7);
    const [customDate, setCustomDate] = useState('');
    const [isSubmittingExpiry, setIsSubmittingExpiry] = useState(false);

    // Credentials Form state
    const [credentialForm, setCredentialForm] = useState({
        username: '',
        password: '',
    });
    const [isSubmittingCredentials, setIsSubmittingCredentials] = useState(false);

    // Calculate metrics
    const totalDeliveries = clientDeliveries.length;
    const activeDeliveries = clientDeliveries.filter(d => !d.is_expired).length;
    const expiredDeliveries = clientDeliveries.filter(d => d.is_expired).length;
    const totalPhotosCount = clientDeliveries.reduce((sum, d) => sum + (d.photos?.length || 0), 0);

    // Auto-generate username from client name
    const autoGenerateUsername = (name) => {
        if (!name) return '';
        const clean = name.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').slice(0, 16);
        const randomNum = Math.floor(10 + Math.random() * 90);
        return `${clean}_${randomNum}`;
    };

    const handleNameChange = (name) => {
        setCreateForm(prev => {
            const next = { ...prev, client_name: name };
            if (!prev.client_username || prev.client_username.startsWith(autoGenerateUsername(prev.client_name)?.split('_')[0])) {
                next.client_username = autoGenerateUsername(name);
            }
            return next;
        });
    };

    // Handle file selection with exact size inspection
    const handleFileChange = (e) => {
        const files = Array.from(e.target.files || []);
        setSelectedFiles(files);
    };

    const handleAdditionalFileChange = (e) => {
        const files = Array.from(e.target.files || []);
        setAdditionalFiles(files);
    };

    const formatBytes = (bytes) => {
        if (!bytes) return '0 KB';
        if (bytes >= 1073741824) return (bytes / 1073741824).toFixed(2) + ' GB';
        if (bytes >= 1048576) return (bytes / 1048576).toFixed(2) + ' MB';
        return (bytes / 1024).toFixed(0) + ' KB';
    };

    // Copy credentials to clipboard
    const copyCredentials = (delivery) => {
        const text = `Akses Foto Studio Langit:\nNama Pengguna: ${delivery.client_username || delivery.user?.username}\nKata Sandi: ${delivery.client_password_hint || 'langit123'}\nLink Login: https://www.langitcreative.pro/login`;
        navigator.clipboard.writeText(text);
        setCopiedId(delivery.id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    // Submit Create Delivery with Original Photo Files (No Size Limit)
    const handleCreateDelivery = (e) => {
        e.preventDefault();
        if (selectedFiles.length === 0) {
            alert('Silakan pilih minimal 1 foto untuk diunggah.');
            return;
        }

        setIsSubmitting(true);
        const formData = new FormData();
        formData.append('client_name', createForm.client_name);
        formData.append('client_username', createForm.client_username);
        formData.append('client_password', createForm.client_password);
        formData.append('client_email', createForm.client_email);
        formData.append('client_phone', createForm.client_phone);
        formData.append('title', createForm.title);
        formData.append('notes', createForm.notes);
        formData.append('expiry_days', createForm.expiry_days);

        selectedFiles.forEach((file) => {
            formData.append('photos[]', file);
        });

        router.post('/admin/client-deliveries', formData, {
            forceFormData: true,
            onProgress: (p) => {
                if (p.percentage) setUploadProgress(p.percentage);
            },
            onSuccess: () => {
                setIsSubmitting(false);
                setCreateModalOpen(false);
                setSelectedFiles([]);
                setUploadProgress(0);
                setCreateForm({
                    client_name: '',
                    client_username: '',
                    client_password: 'langit' + Math.floor(100 + Math.random() * 900),
                    client_email: '',
                    client_phone: '',
                    title: '',
                    notes: '',
                    expiry_days: 7,
                });
            },
            onError: (err) => {
                setIsSubmitting(false);
                alert('Gagal mengunggah foto: ' + Object.values(err).join(', '));
            }
        });
    };

    // Submit Additional Photos
    const handleUploadAdditional = (e) => {
        e.preventDefault();
        if (!addPhotosDelivery || additionalFiles.length === 0) return;

        setIsUploadingAdditional(true);
        const formData = new FormData();
        additionalFiles.forEach((file) => {
            formData.append('photos[]', file);
        });

        router.post(`/admin/client-deliveries/${addPhotosDelivery.id}/upload-photos`, formData, {
            forceFormData: true,
            onSuccess: () => {
                setIsUploadingAdditional(false);
                setAddPhotosDelivery(null);
                setAdditionalFiles([]);
            },
            onError: (err) => {
                setIsUploadingAdditional(false);
                alert('Gagal menambah foto: ' + Object.values(err).join(', '));
            }
        });
    };

    // Submit Update Expiry Days Countdown
    const handleUpdateExpiry = (e) => {
        e.preventDefault();
        if (!expiryModalDelivery) return;

        setIsSubmittingExpiry(true);
        router.put(`/admin/client-deliveries/${expiryModalDelivery.id}/expiry`, {
            extend_days: customDate ? null : extendDays,
            specific_date: customDate || null,
        }, {
            onSuccess: () => {
                setIsSubmittingExpiry(false);
                setExpiryModalDelivery(null);
                setCustomDate('');
            },
            onError: (err) => {
                setIsSubmittingExpiry(false);
                alert('Gagal memperbarui masa aktif: ' + Object.values(err).join(', '));
            }
        });
    };

    // Submit Update Client Credentials (Username & Password)
    const handleUpdateCredentials = (e) => {
        e.preventDefault();
        if (!credentialsModalDelivery) return;

        setIsSubmittingCredentials(true);
        router.put(`/admin/client-deliveries/${credentialsModalDelivery.id}/credentials`, {
            username: credentialForm.username,
            password: credentialForm.password,
        }, {
            onSuccess: () => {
                setIsSubmittingCredentials(false);
                setCredentialsModalDelivery(null);
            },
            onError: (err) => {
                setIsSubmittingCredentials(false);
                alert('Gagal memperbarui kredensial: ' + Object.values(err).join(', '));
            }
        });
    };

    // Delete single photo
    const handleDeletePhoto = (photoId) => {
        if (!confirm('Yakin ingin menghapus foto asli ini dari server?')) return;
        router.delete(`/admin/client-photos/${photoId}`);
    };

    // Delete entire delivery
    const handleDeleteDelivery = (deliveryId, title) => {
        if (!confirm(`Yakin ingin menghapus seluruh sesi "${title}" beserta semua file foto aslinya?`)) return;
        router.delete(`/admin/client-deliveries/${deliveryId}`);
    };

    return (
        <div className="space-y-6">
            {/* Header & Primary Action */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#090D16] border border-slate-200/90 dark:border-white/10 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                            <Camera className="w-5 h-5" />
                        </span>
                        <h2 className="font-heading font-black text-xl text-slate-900 dark:text-white">
                            Layanan Foto Pelanggan (Client Delivery)
                        </h2>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
                        Buat username & password untuk pelanggan (tidak ada pendaftaran mandiri). Unggah foto asli tanpa batasan ukuran file, dan atur hitungan hari mundur sebelum foto otomatis di-hide.
                    </p>
                </div>

                <div className="shrink-0">
                    <button
                        type="button"
                        onClick={() => setCreateModalOpen(true)}
                        className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-[#005792] via-sky-500 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-sky-500/25 transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Tambah Pelanggan & Upload Foto</span>
                    </button>
                </div>
            </div>

            {/* 4 Metrics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-white dark:bg-[#090D16] border border-slate-200/80 dark:border-white/10 shadow-xs">
                    <span className="text-[11px] font-mono text-slate-500 block">Total Pelanggan Dilayani</span>
                    <span className="font-heading font-black text-2xl text-slate-900 dark:text-white mt-1 block">
                        {totalDeliveries}
                    </span>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-[#090D16] border border-slate-200/80 dark:border-white/10 shadow-xs">
                    <span className="text-[11px] font-mono text-slate-500 block">Total Foto Asli Tersimpan</span>
                    <span className="font-heading font-black text-2xl text-cyan-600 dark:text-cyan-400 mt-1 block">
                        {totalPhotosCount} Foto
                    </span>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-[#090D16] border border-slate-200/80 dark:border-white/10 shadow-xs">
                    <span className="text-[11px] font-mono text-slate-500 block">Sesi Masih Aktif</span>
                    <span className="font-heading font-black text-2xl text-emerald-600 dark:text-emerald-400 mt-1 block">
                        {activeDeliveries} Sesi
                    </span>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-[#090D16] border border-slate-200/80 dark:border-white/10 shadow-xs">
                    <span className="text-[11px] font-mono text-slate-500 block">Sesi Kedaluwarsa (Hidden)</span>
                    <span className="font-heading font-black text-2xl text-rose-600 dark:text-rose-400 mt-1 block">
                        {expiredDeliveries} Sesi
                    </span>
                </div>
            </div>

            {/* Deliveries Table / Cards */}
            {clientDeliveries.length === 0 ? (
                <div className="text-center py-16 rounded-3xl bg-white dark:bg-[#090D16] border border-slate-200 dark:border-white/10 p-8">
                    <Camera className="w-12 h-12 text-slate-400 mx-auto mb-2 opacity-60" />
                    <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">
                        Belum Ada Layanan Foto Pelanggan
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Klik tombol di atas untuk membuat akun pelanggan (username & password), mengunggah foto asli, dan membagikan akses ke pelanggan.
                    </p>
                </div>
            ) : (
                <div className="rounded-3xl bg-white dark:bg-[#090D16] border border-slate-200/90 dark:border-white/10 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02] text-[11px] font-mono uppercase text-slate-500">
                                    <th className="px-5 py-3.5">Pelanggan</th>
                                    <th className="px-5 py-3.5">Akun Login Pelanggan</th>
                                    <th className="px-5 py-3.5">Judul Sesi / Foto</th>
                                    <th className="px-5 py-3.5">Jumlah & Ukuran</th>
                                    <th className="px-5 py-3.5">Hitungan Hari Mundur (Expired)</th>
                                    <th className="px-5 py-3.5 text-right">Kelola & Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200/70 dark:divide-white/5 text-xs">
                                {clientDeliveries.map((delivery) => {
                                    const isExpired = delivery.is_expired;
                                    const remainingDays = delivery.remaining_days;
                                    const clientUser = delivery.client_username || delivery.user?.username || '-';
                                    const clientPass = delivery.client_password_hint || 'langit123';
                                    const waNumber = delivery.client_phone ? delivery.client_phone.replace(/[^0-9]/g, '') : null;
                                    const waText = encodeURIComponent(`Halo Kak ${delivery.client_name}, foto sesi "${delivery.title}" dari Studio Langit sudah siap diambil! Silakan login di https://www.langitcreative.pro/login menggunakan akun berikut:\n\n👤 Nama Pengguna: ${clientUser}\n🔑 Kata Sandi: ${clientPass}\n⏳ Sisa Waktu Unduh: ${remainingDays} Hari lagi (sebelum foto otomatis di-hide).\n\nTerima kasih telah mempercayakan dokumentasi Anda kepada Studio Langit!`);

                                    return (
                                        <tr key={delivery.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors">
                                            {/* Client Info */}
                                            <td className="px-5 py-4">
                                                <div className="font-bold text-slate-900 dark:text-white text-sm">
                                                    {delivery.client_name}
                                                </div>
                                                {delivery.client_phone && (
                                                    <div className="text-[11px] text-slate-500 font-mono mt-0.5 flex items-center gap-1.5">
                                                        <Phone className="w-3 h-3 text-slate-400" />
                                                        <span>{delivery.client_phone}</span>
                                                    </div>
                                                )}
                                                {delivery.client_email && (
                                                    <div className="text-[10.5px] text-slate-400 font-mono">
                                                        {delivery.client_email}
                                                    </div>
                                                )}
                                            </td>

                                            {/* Login Credentials Column */}
                                            <td className="px-5 py-4">
                                                <div className="p-2.5 rounded-xl bg-slate-100/80 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 font-mono text-[11px] space-y-1">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <span className="text-slate-500">Pengguna:</span>
                                                        <span className="font-bold text-slate-900 dark:text-cyan-400">
                                                            {clientUser}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between gap-2">
                                                        <span className="text-slate-500">Sandi:</span>
                                                        <span className="font-bold text-amber-600 dark:text-amber-400">
                                                            {clientPass}
                                                        </span>
                                                    </div>
                                                    <div className="pt-1 flex items-center gap-1 border-t border-slate-200/60 dark:border-white/10">
                                                        <button
                                                            type="button"
                                                            onClick={() => copyCredentials(delivery)}
                                                            className="flex-1 py-1 rounded-md bg-white dark:bg-white/10 hover:bg-slate-200 text-[10px] font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1 cursor-pointer"
                                                            title="Salin Kredensial Login"
                                                        >
                                                            {copiedId === delivery.id ? (
                                                                <>
                                                                    <Check className="w-3 h-3 text-emerald-500" />
                                                                    <span className="text-emerald-500">Tersalin</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Copy className="w-3 h-3" />
                                                                    <span>Salin</span>
                                                                </>
                                                            )}
                                                        </button>

                                                        {waNumber && (
                                                            <a
                                                                href={`https://wa.me/${waNumber}?text=${waText}`}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="py-1 px-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                                                                title="Kirim Akun ke WhatsApp Pelanggan"
                                                            >
                                                                <MessageSquare className="w-3 h-3" />
                                                                <span>Kirim WA</span>
                                                            </a>
                                                        )}

                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setCredentialsModalDelivery(delivery);
                                                                setCredentialForm({
                                                                    username: clientUser,
                                                                    password: clientPass,
                                                                });
                                                            }}
                                                            className="py-1 px-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 hover:text-slate-800 dark:hover:text-white"
                                                            title="Ubah Username / Password"
                                                        >
                                                            <Key className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Session Title */}
                                            <td className="px-5 py-4">
                                                <div className="font-semibold text-slate-800 dark:text-slate-200">
                                                    {delivery.title}
                                                </div>
                                                {delivery.notes && (
                                                    <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                                                        {delivery.notes}
                                                    </div>
                                                )}
                                            </td>

                                            {/* Photos & Size */}
                                            <td className="px-5 py-4 font-mono">
                                                <span className="font-bold text-cyan-600 dark:text-cyan-400">
                                                    {delivery.photos?.length || 0} Foto
                                                </span>
                                                <span className="text-[11px] text-slate-500 block">
                                                    Total: {delivery.total_size_formatted}
                                                </span>
                                            </td>

                                            {/* Expired Countdown */}
                                            <td className="px-5 py-4">
                                                {isExpired ? (
                                                    <div>
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 font-mono font-bold text-[11px]">
                                                            <AlertTriangle className="w-3 h-3" />
                                                            <span>Kedaluwarsa (Foto Di-hide)</span>
                                                        </span>
                                                        <span className="text-[10.5px] text-slate-400 block mt-1 font-mono">
                                                            Berakhir: {new Date(delivery.expired_at).toLocaleDateString('id-ID')}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-[11px]">
                                                            <Clock className="w-3 h-3" />
                                                            <span>Tersisa {remainingDays} Hari Lagi</span>
                                                        </span>
                                                        <span className="text-[10.5px] text-slate-400 block mt-1 font-mono">
                                                            Hingga: {new Date(delivery.expired_at).toLocaleDateString('id-ID')}
                                                        </span>
                                                    </div>
                                                )}
                                            </td>

                                            {/* Actions */}
                                            <td className="px-5 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1.5 flex-wrap">
                                                    {/* Atur Expired Button */}
                                                    <button
                                                        type="button"
                                                        onClick={() => setExpiryModalDelivery(delivery)}
                                                        className="px-2.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                                                        title="Atur/Perpanjang Hitungan Hari Expired"
                                                    >
                                                        <Clock className="w-3 h-3" />
                                                        <span>Atur Hari Expired</span>
                                                    </button>

                                                    {/* Upload Foto Tambahan */}
                                                    <button
                                                        type="button"
                                                        onClick={() => setAddPhotosDelivery(delivery)}
                                                        className="px-2.5 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                                                        title="Upload Foto Tambahan"
                                                    >
                                                        <Upload className="w-3 h-3" />
                                                        <span>+ Foto</span>
                                                    </button>

                                                    {/* Lihat Foto */}
                                                    <button
                                                        type="button"
                                                        onClick={() => setViewPhotosDelivery(delivery)}
                                                        className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300 text-[11px] transition-colors cursor-pointer"
                                                        title="Lihat Daftar Foto & Hapus Per Foto"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>

                                                    {/* Hapus Sesi */}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteDelivery(delivery.id, delivery.title)}
                                                        className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[11px] transition-colors cursor-pointer"
                                                        title="Hapus Sesi Pelanggan"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
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

            {/* ── MODAL 1: TAMBAH PELANGGAN & UPLOAD FOTO ── */}
            {createModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white dark:bg-[#0c1220] rounded-3xl border border-slate-200 dark:border-white/10 p-6 sm:p-8 w-full max-w-2xl shadow-2xl my-8">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/10 mb-5">
                            <div>
                                <h3 className="font-heading font-black text-lg text-slate-900 dark:text-white">
                                    Tambah Pelanggan & Upload Foto Hasil Sesi
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    Buat username & password untuk pelanggan. Ukuran file foto 5MB+ tidak dibatasi.
                                </p>
                            </div>
                            <button 
                                type="button" 
                                onClick={() => setCreateModalOpen(false)}
                                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateDelivery} className="space-y-4">
                            <div>
                                <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Nama Pelanggan *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={createForm.client_name}
                                    onChange={(e) => handleNameChange(e.target.value)}
                                    placeholder="Contoh: Rina & Dimas"
                                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-black/30 text-xs focus:ring-2 focus:ring-[#005792]"
                                />
                            </div>

                            {/* Credentials Settings (Username & Password) */}
                            <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 space-y-3">
                                <div className="flex items-center gap-2 text-cyan-900 dark:text-cyan-200 font-bold text-xs">
                                    <Key className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                                    <span>Atur Nama Pengguna & Kata Sandi Pelanggan</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300 mb-1">
                                            Nama Pengguna Pelanggan *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={createForm.client_username}
                                            onChange={(e) => setCreateForm({ ...createForm, client_username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                                            placeholder="Contoh: rina_dimas"
                                            className="w-full px-3 py-1.5 rounded-xl border border-cyan-500/40 bg-white dark:bg-black/40 text-xs font-mono text-cyan-800 dark:text-cyan-300 font-bold focus:ring-2 focus:ring-cyan-500"
                                        />
                                        <span className="text-[10px] text-slate-500 block mt-0.5">
                                            Digunakan pelanggan untuk masuk di website.
                                        </span>
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300 mb-1">
                                            Kata Sandi Pelanggan *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={createForm.client_password}
                                            onChange={(e) => setCreateForm({ ...createForm, client_password: e.target.value })}
                                            placeholder="langit123"
                                            className="w-full px-3 py-1.5 rounded-xl border border-cyan-500/40 bg-white dark:bg-black/40 text-xs font-mono text-amber-700 dark:text-amber-300 font-bold focus:ring-2 focus:ring-cyan-500"
                                        />
                                        <span className="text-[10px] text-slate-500 block mt-0.5">
                                            Kata sandi yang dibagikan ke pelanggan.
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        No. WhatsApp / HP Pelanggan (Opsional)
                                    </label>
                                    <input
                                        type="text"
                                        value={createForm.client_phone}
                                        onChange={(e) => setCreateForm({ ...createForm, client_phone: e.target.value })}
                                        placeholder="081234567890"
                                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-black/30 text-xs focus:ring-2 focus:ring-[#005792]"
                                    />
                                    <span className="text-[10px] text-slate-400 block mt-0.5">
                                        Memudahkan kirim username & password via 1-klik WA.
                                    </span>
                                </div>
                                <div>
                                    <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Email Pelanggan (Opsional)
                                    </label>
                                    <input
                                        type="email"
                                        value={createForm.client_email}
                                        onChange={(e) => setCreateForm({ ...createForm, client_email: e.target.value })}
                                        placeholder="pelanggan@gmail.com"
                                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-black/30 text-xs focus:ring-2 focus:ring-[#005792]"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Judul Sesi / Keterangan Proyek *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={createForm.title}
                                    onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                                    placeholder="Contoh: Sesi Dokumentasi Wedding & Resepsi"
                                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-black/30 text-xs focus:ring-2 focus:ring-[#005792]"
                                />
                            </div>

                            {/* Expired Days Countdown Setting */}
                            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                                <label className="block text-xs font-mono font-bold text-amber-900 dark:text-amber-200">
                                    Atur Masa Aktif Hari Mundur (Menu Expired) *
                                </label>
                                <div className="flex flex-wrap items-center gap-2">
                                    {[3, 7, 14, 30].map(days => (
                                        <button
                                            key={days}
                                            type="button"
                                            onClick={() => setCreateForm({ ...createForm, expiry_days: days })}
                                            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                                                createForm.expiry_days === days
                                                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                                                    : 'bg-white dark:bg-white/5 border border-amber-500/20 text-slate-700 dark:text-slate-300'
                                            }`}
                                        >
                                            {days} Hari
                                        </button>
                                    ))}
                                    <div className="flex items-center gap-1.5 ml-2">
                                        <span className="text-xs text-slate-500">Kustom:</span>
                                        <input
                                            type="number"
                                            min="1"
                                            max="365"
                                            value={createForm.expiry_days}
                                            onChange={(e) => setCreateForm({ ...createForm, expiry_days: parseInt(e.target.value) || 1 })}
                                            className="w-16 px-2 py-1 rounded-lg border border-amber-500/30 text-xs font-mono bg-white dark:bg-black/40 text-center"
                                        />
                                        <span className="text-xs text-slate-500">hari</span>
                                    </div>
                                </div>
                                <p className="text-[11px] text-amber-800 dark:text-amber-300">
                                    Setelah {createForm.expiry_days} hari terlewati, foto akan otomatis di-hide/disembunyikan dari pelanggan.
                                </p>
                            </div>

                            {/* Photo Upload Area */}
                            <div>
                                <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                    Pilih Foto yang Ingin Diunggah (Multi-Upload) *
                                </label>
                                <div className="p-5 rounded-2xl border-2 border-dashed border-slate-300 dark:border-white/15 bg-slate-50 dark:bg-white/[0.01] text-center">
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="hidden"
                                        id="client_photos_input"
                                    />
                                    <label htmlFor="client_photos_input" className="cursor-pointer block">
                                        <Upload className="w-8 h-8 text-cyan-600 dark:text-cyan-400 mx-auto mb-2" />
                                        <span className="text-xs font-bold text-slate-800 dark:text-white block">
                                            Klik untuk Memilih Foto
                                        </span>
                                        <span className="text-[11px] text-slate-500 block mt-1">
                                            Bisa memilih banyak foto sekaligus (JPG, PNG, WebP). Ukuran file 5 MB atau lebih tidak dibatasi.
                                        </span>
                                    </label>
                                </div>

                                {selectedFiles.length > 0 && (
                                    <div className="mt-3 p-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-mono space-y-1 max-h-36 overflow-y-auto">
                                        <div className="font-bold text-slate-900 dark:text-white pb-1 border-b border-slate-200 dark:border-white/10 flex justify-between">
                                            <span>{selectedFiles.length} File Dipilih</span>
                                            <span className="text-cyan-600 dark:text-cyan-400">
                                                Total: {formatBytes(selectedFiles.reduce((acc, f) => acc + f.size, 0))}
                                            </span>
                                        </div>
                                        {selectedFiles.map((f, idx) => (
                                            <div key={idx} className="flex justify-between text-slate-600 dark:text-slate-400 text-[11px]">
                                                <span className="truncate max-w-xs">{idx + 1}. {f.name}</span>
                                                <span className="shrink-0 font-bold text-emerald-600 dark:text-emerald-400">{formatBytes(f.size)}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Upload Progress */}
                            {isSubmitting && (
                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs font-mono text-cyan-600 dark:text-cyan-400">
                                        <span>Mengunggah foto resolusi penuh ke server...</span>
                                        <span>{uploadProgress}%</span>
                                    </div>
                                    <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                                        <div 
                                            className="h-full bg-gradient-to-r from-cyan-500 to-sky-600 transition-all duration-300"
                                            style={{ width: `${uploadProgress}%` }}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="pt-3 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setCreateModalOpen(false)}
                                    className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || selectedFiles.length === 0}
                                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#005792] via-sky-500 to-indigo-600 text-white font-bold text-xs shadow-md shadow-sky-500/25 disabled:opacity-50 cursor-pointer"
                                >
                                    {isSubmitting ? 'Sedang Mengunggah...' : `Unggah ${selectedFiles.length} Foto Sekarang`}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── MODAL 2: ATUR MENU EXPIRED HITUNGAN HARI MUNDUR ── */}
            {expiryModalDelivery && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-[#0c1220] rounded-3xl border border-slate-200 dark:border-white/10 p-6 sm:p-7 w-full max-w-md shadow-2xl">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10 mb-4">
                            <div>
                                <h3 className="font-heading font-black text-base text-slate-900 dark:text-white">
                                    Atur Masa Aktif & Expired Hari Mundur
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Pelanggan: <strong>{expiryModalDelivery.client_name}</strong>
                                </p>
                            </div>
                            <button 
                                type="button" 
                                onClick={() => setExpiryModalDelivery(null)}
                                className="p-1 rounded-full text-slate-400 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleUpdateExpiry} className="space-y-4">
                            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-xs">
                                <span className="font-mono text-slate-500 block">Status Saat Ini:</span>
                                <span className="font-bold text-sm block mt-0.5 text-amber-950 dark:text-amber-200">
                                    {expiryModalDelivery.is_expired
                                        ? '⚠️ Kedaluwarsa (Foto sedang di-hide)'
                                        : `⏳ Tersisa ${expiryModalDelivery.remaining_days} Hari Lagi (Hingga ${new Date(expiryModalDelivery.expired_at).toLocaleDateString('id-ID')})`
                                    }
                                </span>
                            </div>

                            <div>
                                <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    Perpanjang Masa Aktif Hari Mundur:
                                </label>
                                <div className="grid grid-cols-4 gap-2">
                                    {[3, 7, 14, 30].map(days => (
                                        <button
                                            key={days}
                                            type="button"
                                            onClick={() => { setExtendDays(days); setCustomDate(''); }}
                                            className={`py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                                                extendDays === days && !customDate
                                                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                                                    : 'bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300'
                                            }`}
                                        >
                                            +{days} Hari
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-mono font-medium text-slate-500 mb-1">
                                    Atau Tentukan Tanggal Expired Kustom:
                                </label>
                                <input
                                    type="date"
                                    value={customDate}
                                    onChange={(e) => setCustomDate(e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-black/30 text-xs font-mono text-slate-800 dark:text-white"
                                />
                            </div>

                            <div className="pt-2 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setExpiryModalDelivery(null)}
                                    className="px-4 py-2 rounded-xl border border-slate-300 dark:border-white/10 text-xs font-semibold text-slate-600 dark:text-slate-400"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmittingExpiry}
                                    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-colors cursor-pointer"
                                >
                                    {isSubmittingExpiry ? 'Menyimpan...' : 'Perbarui Masa Expired'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── MODAL 2.5: UBAH USERNAME & PASSWORD PELANGGAN ── */}
            {credentialsModalDelivery && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-[#0c1220] rounded-3xl border border-slate-200 dark:border-white/10 p-6 sm:p-7 w-full max-w-md shadow-2xl">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10 mb-4">
                            <div>
                                <h3 className="font-heading font-black text-base text-slate-900 dark:text-white">
                                    Ubah Nama Pengguna & Kata Sandi Pelanggan
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Pelanggan: <strong>{credentialsModalDelivery.client_name}</strong>
                                </p>
                            </div>
                            <button 
                                type="button" 
                                onClick={() => setCredentialsModalDelivery(null)}
                                className="p-1 rounded-full text-slate-400 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleUpdateCredentials} className="space-y-4">
                            <div>
                                <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Nama Pengguna Baru:
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={credentialForm.username}
                                    onChange={(e) => setCredentialForm({ ...credentialForm, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-black/30 text-xs font-mono font-bold text-cyan-700 dark:text-cyan-300"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Kata Sandi Baru:
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={credentialForm.password}
                                    onChange={(e) => setCredentialForm({ ...credentialForm, password: e.target.value })}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-black/30 text-xs font-mono font-bold text-amber-700 dark:text-amber-300"
                                />
                            </div>

                            <div className="pt-2 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setCredentialsModalDelivery(null)}
                                    className="px-4 py-2 rounded-xl border border-slate-300 dark:border-white/10 text-xs font-semibold text-slate-600 dark:text-slate-400"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmittingCredentials}
                                    className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
                                >
                                    {isSubmittingCredentials ? 'Menyimpan...' : 'Simpan Kredensial'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── MODAL 3: LIHAT FOTO & HAPUS PER FOTO ── */}
            {viewPhotosDelivery && (
                <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white dark:bg-[#0c1220] rounded-3xl border border-slate-200 dark:border-white/10 p-6 sm:p-7 w-full max-w-4xl shadow-2xl my-8">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10 mb-5">
                            <div>
                                <h3 className="font-heading font-black text-lg text-slate-900 dark:text-white">
                                    Foto di Album: {viewPhotosDelivery.title}
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5 font-mono">
                                    Pelanggan: {viewPhotosDelivery.client_name} • {viewPhotosDelivery.photos?.length || 0} Foto • {viewPhotosDelivery.total_size_formatted}
                                </p>
                            </div>
                            <button 
                                type="button" 
                                onClick={() => setViewPhotosDelivery(null)}
                                className="p-1 rounded-full text-slate-400 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {viewPhotosDelivery.photos?.length === 0 ? (
                            <p className="text-xs text-slate-500 text-center py-8">Belum ada foto di album ini.</p>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[60vh] overflow-y-auto p-1">
                                {viewPhotosDelivery.photos?.map((photo, idx) => (
                                    <div key={photo.id} className="group relative rounded-xl overflow-hidden bg-slate-900 border border-slate-200 dark:border-white/10 flex flex-col">
                                        <div className="aspect-[4/3] w-full bg-slate-950 overflow-hidden relative">
                                            <img
                                                src={photo.file_url}
                                                alt={photo.original_name}
                                                className="w-full h-full object-cover"
                                                loading="lazy"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleDeletePhoto(photo.id)}
                                                className="absolute top-2 right-2 p-1.5 rounded-lg bg-rose-600/90 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-700"
                                                title="Hapus foto ini"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                        <div className="p-2 bg-white dark:bg-[#090D16] text-[11px] border-t border-slate-200 dark:border-white/5 flex items-center justify-between">
                                            <span className="truncate max-w-[110px]" title={photo.original_name}>
                                                {photo.original_name}
                                            </span>
                                            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                                                {photo.formatted_size}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="mt-5 pt-3 border-t border-slate-200 dark:border-white/10 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setViewPhotosDelivery(null)}
                                className="px-5 py-2 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 text-xs font-bold text-slate-800 dark:text-white"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── MODAL 4: TAMBAH FOTO TAMBAHAN KE SESI YANG ADA ── */}
            {addPhotosDelivery && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-[#0c1220] rounded-3xl border border-slate-200 dark:border-white/10 p-6 sm:p-7 w-full max-w-lg shadow-2xl">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10 mb-4">
                            <div>
                                <h3 className="font-heading font-black text-base text-slate-900 dark:text-white">
                                    Upload Foto Tambahan
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Album: <strong>{addPhotosDelivery.title}</strong>
                                </p>
                            </div>
                            <button 
                                type="button" 
                                onClick={() => setAddPhotosDelivery(null)}
                                className="p-1 rounded-full text-slate-400 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleUploadAdditional} className="space-y-4">
                            <div className="p-5 rounded-2xl border-2 border-dashed border-slate-300 dark:border-white/15 bg-slate-50 dark:bg-white/[0.01] text-center">
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleAdditionalFileChange}
                                    className="hidden"
                                    id="additional_photos_input"
                                />
                                <label htmlFor="additional_photos_input" className="cursor-pointer block">
                                    <Upload className="w-7 h-7 text-cyan-600 dark:text-cyan-400 mx-auto mb-1.5" />
                                    <span className="text-xs font-bold text-slate-800 dark:text-white block">
                                        Pilih Foto Tambahan
                                    </span>
                                    <span className="text-[10.5px] text-slate-500 block mt-1">
                                        Bisa memilih banyak foto (ukuran asli tidak dibatasi).
                                    </span>
                                </label>
                            </div>

                            {additionalFiles.length > 0 && (
                                <div className="p-3 rounded-xl bg-slate-100 dark:bg-white/5 text-xs font-mono">
                                    <span className="font-bold text-slate-900 dark:text-white block">
                                        {additionalFiles.length} File Dipilih (Total: {formatBytes(additionalFiles.reduce((acc, f) => acc + f.size, 0))})
                                    </span>
                                </div>
                            )}

                            <div className="pt-2 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setAddPhotosDelivery(null)}
                                    className="px-4 py-2 rounded-xl border border-slate-300 dark:border-white/10 text-xs font-semibold text-slate-600 dark:text-slate-400"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isUploadingAdditional || additionalFiles.length === 0}
                                    className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md disabled:opacity-50 cursor-pointer"
                                >
                                    {isUploadingAdditional ? 'Mengunggah...' : `Unggah ${additionalFiles.length} Foto Tambahan`}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
