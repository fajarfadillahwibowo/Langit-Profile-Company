import React, { useState, useRef, useEffect } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import axios from 'axios';
import LangitLensAdminLayout from '@/Layouts/LangitLensAdminLayout';
import {
    CloudUpload,
    FolderUp,
    ScanFace,
    Trash2,
    Save,
    CheckCircle2,
    AlertTriangle,
    Loader2,
    RefreshCw,
    Cpu,
    RotateCcw,
    Percent,
    ChevronDown,
    ChevronUp,
} from 'lucide-react';

function formatBytes(bytes) {
    if (!bytes) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
}

function formatRupiah(num) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(num || 0);
}

const UPLOAD_CONCURRENCY = 3;
const MAX_RETRIES = 3;

export default function Photos({
    photos: photosPaginator,
    needsUpgradeCount,
    defaultPrice,
    discountRule,
    insightFaceReady,
}) {
    const totalPhotosCount = photosPaginator?.total ?? 0;
    const [photos, setPhotos] = useState(photosPaginator?.data || []);
    const [totalCount, setTotalCount] = useState(totalPhotosCount || 0);
    const [uploadPrice, setUploadPrice] = useState(defaultPrice || 25000);
    const [uploading, setUploading] = useState(false);
    const [discountOpen, setDiscountOpen] = useState(false);

    const discountForm = useForm({
        is_active: Boolean(discountRule?.is_active ?? true),
        min_photos_selected: discountRule?.min_photos_selected ?? 5,
        discount_percentage: discountRule?.discount_percentage ?? 20,
        default_photo_price: discountRule?.default_photo_price ?? 25000,
        admin_whatsapp: discountRule?.admin_whatsapp ?? '6281234567890',
        manual_payment_info: discountRule?.manual_payment_info ?? '',
    });

    const handleSaveDiscount = (e) => {
        e.preventDefault();
        discountForm.put('/admin/langitlens/discount', {
            preserveScroll: true,
            onSuccess: () => {
                setUploadPrice(discountForm.data.default_photo_price);
                setDiscountOpen(false);
            },
        });
    };

    // Ringkasan antrean ringan untuk ratusan/ribuan foto (anti-lag DOM)
    const [uploadStats, setUploadStats] = useState({
        total: 0,
        done: 0,
        failed: 0,
        startedAt: 0,
    });
    const [recentLogs, setRecentLogs] = useState([]);
    const [failedFiles, setFailedFiles] = useState([]);

    const [editingId, setEditingId] = useState(null);
    const [editPrice, setEditPrice] = useState('');
    const [reindexingId, setReindexingId] = useState(null);
    const [reindexingAll, setReindexingAll] = useState(false);

    const fileInputRef = useRef(null);
    const folderInputRef = useRef(null);
    const faceApiModuleRef = useRef(null);
    const failedRef = useRef([]);

    useEffect(() => {
        setPhotos(photosPaginator?.data || []);
        setTotalCount(totalPhotosCount || 0);
    }, [photosPaginator, totalPhotosCount]);

    const getClientFaceApi = async () => {
        if (!faceApiModuleRef.current) {
            faceApiModuleRef.current = await import('@/Services/faceApiService');
        }
        return faceApiModuleRef.current;
    };

    const uploadSingleWithRetry = async (file, priceValue) => {
        let faces = [];
        if (!insightFaceReady) {
            try {
                const mod = await getClientFaceApi();
                faces = await mod.extractFacesFromFile(file);
            } catch {
                // Tetap unggah foto meski deteksi browser gagal
            }
        }

        let lastError = null;
        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                const formData = new FormData();
                formData.append('photo', file);
                formData.append('price', String(priceValue));
                if (faces.length > 0) {
                    formData.append('faces', JSON.stringify(faces));
                }

                const response = await axios.post('/admin/langitlens/photos', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    timeout: 120000,
                });
                return response.data;
            } catch (err) {
                lastError = err;
                const status = err.response?.status;
                // Jangan ulangi jika error validasi (422)
                if (status === 422) break;
                if (attempt < MAX_RETRIES) {
                    await new Promise((r) => setTimeout(r, attempt * 700));
                }
            }
        }
        throw lastError || new Error('Gagal mengunggah foto.');
    };

    const runUploadQueue = async (files) => {
        if (files.length === 0) return;

        setUploading(true);
        setFailedFiles([]);
        failedRef.current = [];
        setRecentLogs([]);
        setUploadStats({
            total: files.length,
            done: 0,
            failed: 0,
            startedAt: Date.now(),
        });

        let cursor = 0;
        const priceSnap = uploadPrice;

        const worker = async () => {
            while (true) {
                const idx = cursor++;
                if (idx >= files.length) break;

                const file = files[idx];
                try {
                    const data = await uploadSingleWithRetry(file, priceSnap);
                    if (data?.photo) {
                        // Tampilkan maks 48 kartu terbaru di halaman agar DOM tetap ringan saat upload 1000+ foto
                        setPhotos((prev) => [data.photo, ...prev].slice(0, 48));
                        setTotalCount((c) => c + 1);
                    }
                    setUploadStats((s) => ({ ...s, done: s.done + 1 }));
                    setRecentLogs((prev) => [
                        {
                            id: `${idx}-${Date.now()}`,
                            name: file.name,
                            size: file.size,
                            ok: true,
                            faces: data?.photo?.face_count ?? 0,
                        },
                        ...prev.slice(0, 14),
                    ]);
                } catch (err) {
                    failedRef.current.push(file);
                    setUploadStats((s) => ({ ...s, failed: s.failed + 1 }));
                    setRecentLogs((prev) => [
                        {
                            id: `${idx}-${Date.now()}`,
                            name: file.name,
                            size: file.size,
                            ok: false,
                            errorMsg: err.response?.data?.message || err.message,
                        },
                        ...prev.slice(0, 14),
                    ]);
                }
            }
        };

        const workerCount = Math.min(UPLOAD_CONCURRENCY, files.length);
        await Promise.all(Array.from({ length: workerCount }, () => worker()));

        setFailedFiles([...failedRef.current]);
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (folderInputRef.current) folderInputRef.current.value = '';
    };

    const ALLOWED_PHOTO_EXTENSIONS = new Set([
        'jpg', 'jpeg', 'jpe', 'jfif', 'pjpeg', 'pjp', 'png', 'apng', 'webp', 'gif',
        'bmp', 'dib', 'avif', 'avifs', 'heic', 'heif', 'hif', 'svg', 'svgz', 'ico',
        'cur', 'tif', 'tiff', 'tga', 'icb', 'vda', 'vst', 'jxl', 'jp2', 'j2k', 'jpf',
        'jpx', 'jpm', 'mj2', 'raw', 'dng', 'cr2', 'cr3', 'crw', 'nef', 'nrw', 'arw',
        'srf', 'sr2', 'orf', 'rw2', 'raf', 'pef', 'srw', 'x3f', 'erf', 'mrw', 'dcr',
        'kdc', 'mos', 'psd', 'xcf', 'exr', 'hdr', 'wbmp', 'xbm', 'xpm',
    ]);

    const isPhotoFile = (file) => {
        if (!file) return false;
        if (file.type && file.type.startsWith('image/')) return true;
        const ext = (file.name || '').split('.').pop()?.toLowerCase();
        return Boolean(ext && ALLOWED_PHOTO_EXTENSIONS.has(ext));
    };

    const handleFilesSelected = (fileList) => {
        const files = Array.from(fileList || []).filter(isPhotoFile);
        runUploadQueue(files);
    };

    const handleRetryFailed = () => {
        if (failedFiles.length === 0 || uploading) return;
        runUploadQueue(failedFiles);
    };

    const handleSavePrice = (photoId) => {
        router.patch(
            `/admin/langitlens/photos/${photoId}`,
            { price: Number(editPrice) },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setPhotos((prev) =>
                        prev.map((p) => (p.id === photoId ? { ...p, price: Number(editPrice) } : p))
                    );
                    setEditingId(null);
                },
            }
        );
    };

    const handleDelete = (photoId) => {
        if (!confirm('Hapus foto ini dari galeri?')) return;
        router.delete(`/admin/langitlens/photos/${photoId}`, {
            preserveScroll: true,
            onSuccess: () => {
                setPhotos((prev) => prev.filter((p) => p.id !== photoId));
                setTotalCount((c) => Math.max(0, c - 1));
            },
        });
    };

    const handleReindexFaces = async (photo) => {
        setReindexingId(photo.id);
        try {
            let res;
            if (insightFaceReady) {
                res = await axios.post(`/admin/langitlens/photos/${photo.id}/reindex-faces`, {});
            } else {
                const mod = await getClientFaceApi();
                const img = new Image();
                img.crossOrigin = 'anonymous';
                await new Promise((resolve, reject) => {
                    img.onload = resolve;
                    img.onerror = reject;
                    img.src = `/admin/langitlens/photos/${photo.id}/clean-source?t=${Date.now()}`;
                });
                const faces = await mod.extractFacesFromImageElement(img);
                res = await axios.post(`/admin/langitlens/photos/${photo.id}/reindex-faces`, { faces });
            }

            setPhotos((prev) =>
                prev.map((p) =>
                    p.id === photo.id
                        ? { ...p, face_count: res.data.face_count }
                        : p
                )
            );
        } catch (err) {
            alert('Gagal memindai ulang wajah: ' + (err.response?.data?.message || err.message));
        } finally {
            setReindexingId(null);
        }
    };

    const handleReindexAllInsightFace = () => {
        setReindexingAll(true);
        router.post(
            '/admin/langitlens/photos/reindex-all',
            {},
            {
                preserveScroll: false,
                onFinish: () => setReindexingAll(false),
            }
        );
    };

    const processedTotal = uploadStats.done + uploadStats.failed;
    const progressPercent =
        uploadStats.total > 0 ? Math.round((processedTotal / uploadStats.total) * 100) : 0;

    return (
        <>
            <Head title="Upload & Galeri" />

            <div className="space-y-4">
                <div
                    className={`rounded-2xl p-3.5 sm:p-4 border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        insightFaceReady
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                            : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                    }`}
                >
                    <div className="flex items-center gap-2.5">
                        <Cpu className="w-4 h-4 shrink-0" />
                        <span>
                            {insightFaceReady
                                ? 'Mesin Deteksi Wajah (InsightFace) aktif & siap menerima unggahan massal cepat.'
                                : 'Mesin Deteksi Server sedang mati. Memakai mode cadangan browser.'}
                        </span>
                    </div>

                    {insightFaceReady && totalCount > 0 && (
                        <button
                            type="button"
                            onClick={handleReindexAllInsightFace}
                            disabled={reindexingAll}
                            className="min-h-10 inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-slate-950 font-bold text-xs transition-all shrink-0 cursor-pointer disabled:opacity-50"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${reindexingAll ? 'animate-spin' : ''}`} />
                            <span>
                                {reindexingAll
                                    ? 'Memindai...'
                                    : needsUpgradeCount > 0
                                      ? `Scan Ulang Semua (${needsUpgradeCount} perlu update)`
                                      : 'Scan Ulang Semua Foto'}
                            </span>
                        </button>
                    )}
                </div>

                {/* Panel Ringkas Buka-Tutup: Pengaturan Diskon, Harga Dasar & Info Pembayaran */}
                <div className="bg-[#0B1222]/90 border border-white/10 rounded-2xl overflow-hidden transition-colors duration-200 hover:border-white/15">
                    <button
                        type="button"
                        onClick={() => setDiscountOpen((prev) => !prev)}
                        className="w-full px-4 sm:px-5 py-3.5 flex items-center justify-between gap-3 text-left hover:bg-slate-800/40 transition-colors cursor-pointer"
                    >
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                                <Percent className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs sm:text-sm font-bold text-white truncate">
                                    Diskon, Harga Dasar & Pembayaran
                                </p>
                                <p className="text-[11px] sm:text-xs text-slate-400 truncate">
                                    {discountForm.data.is_active
                                        ? `Diskon Aktif: Min. ${discountForm.data.min_photos_selected} foto (-${discountForm.data.discount_percentage}%)`
                                        : 'Diskon Nonaktif'}{' '}
                                    • Harga Dasar: {formatRupiah(discountForm.data.default_photo_price)}
                                </p>
                            </div>
                        </div>
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 text-xs font-semibold text-sky-300 shrink-0">
                            <span>{discountOpen ? 'Tutup' : 'Atur'}</span>
                            {discountOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </span>
                    </button>

                    {discountOpen && (
                        <form
                            onSubmit={handleSaveDiscount}
                            className="px-4 sm:px-5 pb-5 pt-3 border-t border-slate-800 space-y-4 animate-fade-in"
                        >
                            <label className="flex items-center justify-between gap-4 p-3.5 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
                                <div>
                                    <span className="block text-xs sm:text-sm font-semibold text-white">
                                        Aktifkan Diskon Otomatis
                                    </span>
                                    <span className="block text-[11px] text-slate-400">
                                        Potongan harga otomatis saat pelanggan mencapai minimal jumlah foto.
                                    </span>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={discountForm.data.is_active}
                                    onChange={(e) => discountForm.setData('is_active', e.target.checked)}
                                    className="w-5 h-5 accent-sky-500 shrink-0"
                                />
                            </label>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                                        Minimal Jumlah Foto
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="100"
                                        value={discountForm.data.min_photos_selected}
                                        onChange={(e) =>
                                            discountForm.setData('min_photos_selected', Number(e.target.value))
                                        }
                                        className="w-full min-h-11 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-sky-400"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                                        Diskon (%)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="0.5"
                                        value={discountForm.data.discount_percentage}
                                        onChange={(e) =>
                                            discountForm.setData('discount_percentage', Number(e.target.value))
                                        }
                                        className="w-full min-h-11 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-sky-400"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                                        Harga Dasar Foto (Rp)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="1000"
                                        value={discountForm.data.default_photo_price}
                                        onChange={(e) =>
                                            discountForm.setData('default_photo_price', Number(e.target.value))
                                        }
                                        className="w-full min-h-11 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-sky-400"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                                        WhatsApp Admin
                                    </label>
                                    <input
                                        type="text"
                                        value={discountForm.data.admin_whatsapp}
                                        onChange={(e) => discountForm.setData('admin_whatsapp', e.target.value)}
                                        placeholder="6281234567890"
                                        className="w-full min-h-11 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-sky-400"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1">
                                    Info Pembayaran Manual
                                </label>
                                <textarea
                                    rows={2}
                                    value={discountForm.data.manual_payment_info}
                                    onChange={(e) => discountForm.setData('manual_payment_info', e.target.value)}
                                    placeholder="Nomor rekening atau cara konfirmasi pembayaran..."
                                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-sky-400"
                                />
                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={discountForm.processing}
                                    className="w-full sm:w-auto min-h-11 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 active:scale-[0.98] text-slate-950 font-bold text-xs sm:text-sm transition-all cursor-pointer disabled:opacity-60"
                                >
                                    {discountForm.processing ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Save className="w-4 h-4" />
                                    )}
                                    <span>{discountForm.processing ? 'Menyimpan...' : 'Simpan Pengaturan'}</span>
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                {/* Area Upload Massal Tanpa Batas */}
                <div className="bg-[#0B1222]/90 border border-white/10 rounded-2xl p-4 sm:p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <h2 className="text-base font-bold text-white">Unggah Foto Massal (Tanpa Batas)</h2>
                            <p className="text-xs text-slate-400 mt-0.5">
                                Pilih ratusan hingga ribuan foto atau satu folder sekaligus. Diproses paralel & otomatis
                                ulangi jika jaringan terganggu.
                            </p>
                        </div>
                        <div className="shrink-0">
                            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                                Harga per Foto (Rp)
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="1000"
                                value={uploadPrice}
                                onChange={(e) => setUploadPrice(e.target.value)}
                                className="w-full sm:w-40 min-h-11 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm font-semibold focus:outline-none focus:border-sky-400"
                            />
                        </div>
                    </div>

                    <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                            e.preventDefault();
                            if (!uploading) handleFilesSelected(e.dataTransfer.files);
                        }}
                        className={`border-2 border-dashed rounded-2xl p-6 text-center transition-colors ${
                            uploading
                                ? 'border-sky-500/50 bg-sky-500/5'
                                : 'border-slate-700 hover:border-sky-400 bg-slate-900/50'
                        }`}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept="image/*,.heic,.heif,.avif,.tif,.tiff,.raw,.dng,.cr2,.cr3,.nef,.arw,.orf,.rw2,.raf,.jxl,.jfif,.tga,.bmp,.svg,.webp,.psd"
                            className="hidden"
                            onChange={(e) => handleFilesSelected(e.target.files)}
                        />
                        <input
                            ref={folderInputRef}
                            type="file"
                            multiple
                            accept="image/*,.heic,.heif,.avif,.tif,.tiff,.raw,.dng,.cr2,.cr3,.nef,.arw,.orf,.rw2,.raf,.jxl,.jfif,.tga,.bmp,.svg,.webp,.psd"
                            webkitdirectory=""
                            directory=""
                            className="hidden"
                            onChange={(e) => handleFilesSelected(e.target.files)}
                        />

                        {uploading ? (
                            <div className="space-y-3 max-w-md mx-auto">
                                <Loader2 className="w-9 h-9 text-sky-400 animate-spin mx-auto" />
                                <div>
                                    <p className="text-sm font-bold text-white">
                                        Memproses {processedTotal} / {uploadStats.total} Foto ({progressPercent}%)
                                    </p>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        Berhasil: {uploadStats.done} • Gagal: {uploadStats.failed} • Jangan tutup halaman ini
                                    </p>
                                </div>
                                <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                                    <div
                                        className="h-full bg-sky-500 transition-all duration-200"
                                        style={{ width: `${progressPercent}%` }}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <CloudUpload className="w-9 h-9 text-sky-400 mx-auto" />
                                <p className="text-sm font-bold text-white">
                                    Seret foto ke sini atau pilih lewat tombol di bawah
                                </p>
                                <div className="flex flex-wrap items-center justify-center gap-2.5">
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="min-h-11 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 active:scale-[0.98] text-slate-950 font-bold text-xs cursor-pointer"
                                    >
                                        <CloudUpload className="w-4 h-4" />
                                        <span>Pilih Banyak Foto</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => folderInputRef.current?.click()}
                                        className="min-h-11 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-[0.98] border border-slate-700 text-white font-semibold text-xs cursor-pointer"
                                    >
                                        <FolderUp className="w-4 h-4 text-sky-400" />
                                        <span>Pilih Satu Folder</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Ringkasan & Log Terbaru (Ringan untuk 1000+ file) */}
                    {uploadStats.total > 0 && (
                        <div className="space-y-2.5">
                            {!uploading && failedFiles.length > 0 && (
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-200">
                                    <div className="flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                                        <span>{failedFiles.length} foto gagal diunggah. Klik tombol untuk mengulangi.</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleRetryFailed}
                                        className="min-h-9 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500 text-white font-bold text-xs cursor-pointer shrink-0"
                                    >
                                        <RotateCcw className="w-3.5 h-3.5" />
                                        <span>Ulangi yang Gagal</span>
                                    </button>
                                </div>
                            )}

                            {!uploading && uploadStats.failed === 0 && uploadStats.done > 0 && (
                                <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-200">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                    <span>Semua {uploadStats.done} foto berhasil diunggah dan diproses.</span>
                                </div>
                            )}

                            {recentLogs.length > 0 && (
                                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                                    {recentLogs.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs"
                                        >
                                            <div className="min-w-0">
                                                <p className="font-medium text-white truncate">{item.name}</p>
                                                <p className="text-[11px] text-slate-400">{formatBytes(item.size)}</p>
                                            </div>
                                            {item.ok ? (
                                                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-semibold shrink-0">
                                                    Selesai ({item.faces} wajah)
                                                </span>
                                            ) : (
                                                <span className="px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-300 font-semibold shrink-0 truncate max-w-44">
                                                    Gagal: {item.errorMsg}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Daftar Foto Terpaginasi */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                        <h2 className="text-sm font-bold text-white">Galeri Foto ({totalCount})</h2>
                        {photosPaginator?.last_page > 1 && (
                            <span className="text-xs text-slate-400">
                                Halaman {photosPaginator.current_page} dari {photosPaginator.last_page}
                            </span>
                        )}
                    </div>

                    {photos.length === 0 ? (
                        <div className="bg-[#0B1222]/90 border border-white/10 rounded-2xl p-8 text-center text-xs text-slate-400">
                            Belum ada foto diunggah.
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                            {photos.map((photo) => (
                                <div
                                    key={photo.id}
                                    className="group bg-[#0B1222]/90 border border-white/10 rounded-2xl overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-400/35"
                                >
                                    <div className="relative aspect-[4/3] bg-slate-900 overflow-hidden">
                                        <img
                                            src={photo.preview_url}
                                            alt={photo.title}
                                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                                            loading="lazy"
                                        />
                                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/75 text-[10px] font-semibold text-sky-300 flex items-center gap-1">
                                            <ScanFace className="w-3 h-3" />
                                            <span>{photo.face_count} Wajah</span>
                                        </div>
                                    </div>

                                    <div className="p-3 flex-1 flex flex-col justify-between space-y-2.5">
                                        <div>
                                            <p className="text-xs font-semibold text-white truncate">{photo.title}</p>
                                            <p className="text-[11px] text-slate-400 mt-0.5">
                                                {photo.original_width}×{photo.original_height} • {formatBytes(photo.original_size_bytes)}
                                            </p>
                                        </div>

                                        {editingId === photo.id ? (
                                            <div className="flex items-center gap-1.5">
                                                <input
                                                    type="number"
                                                    value={editPrice}
                                                    onChange={(e) => setEditPrice(e.target.value)}
                                                    className="w-full min-h-9 px-2.5 py-1 rounded-lg bg-slate-900 border border-sky-400 text-xs text-white"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleSavePrice(photo.id)}
                                                    className="min-w-9 min-h-9 flex items-center justify-center rounded-lg bg-emerald-500 text-slate-950 hover:bg-emerald-400 cursor-pointer shrink-0"
                                                    aria-label="Simpan harga"
                                                >
                                                    <Save className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setEditingId(photo.id);
                                                        setEditPrice(String(photo.price));
                                                    }}
                                                    className="text-xs sm:text-sm font-bold text-amber-400 hover:text-amber-300 cursor-pointer"
                                                    title="Ubah harga"
                                                >
                                                    {formatRupiah(photo.price)}
                                                </button>
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleReindexFaces(photo)}
                                                        disabled={reindexingId === photo.id}
                                                        className="min-w-9 min-h-9 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 cursor-pointer"
                                                        title="Scan ulang wajah"
                                                    >
                                                        <RefreshCw
                                                            className={`w-3.5 h-3.5 ${
                                                                reindexingId === photo.id ? 'animate-spin' : ''
                                                            }`}
                                                        />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(photo.id)}
                                                        className="min-w-9 min-h-9 flex items-center justify-center rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 cursor-pointer"
                                                        title="Hapus foto"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination Bar */}
                    {photosPaginator?.last_page > 1 && (
                        <div className="flex items-center justify-center gap-2 pt-3">
                            {photosPaginator.prev_page_url && (
                                <Link
                                    href={photosPaginator.prev_page_url}
                                    className="min-h-10 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white"
                                >
                                    Sebelumnya
                                </Link>
                            )}
                            <span className="text-xs text-slate-400 px-2">
                                {photosPaginator.current_page} / {photosPaginator.last_page}
                            </span>
                            {photosPaginator.next_page_url && (
                                <Link
                                    href={photosPaginator.next_page_url}
                                    className="min-h-10 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white"
                                >
                                    Berikutnya
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

Photos.layout = (page) => <LangitLensAdminLayout title="Upload & Galeri">{page}</LangitLensAdminLayout>;
