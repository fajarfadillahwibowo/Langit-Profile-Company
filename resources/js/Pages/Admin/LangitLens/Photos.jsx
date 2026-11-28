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
    SlidersHorizontal,
    ShieldCheck,
} from 'lucide-react';

async function computeFileSha256(file) {
    try {
        if (!window.crypto?.subtle) return '';
        const buf = await file.arrayBuffer();
        const hashBuf = await window.crypto.subtle.digest('SHA-256', buf);
        return Array.from(new Uint8Array(hashBuf))
            .map((b) => b.toString(16).padStart(2, '0'))
            .join('');
    } catch {
        return '';
    }
}

async function compressPhotoBeforeUpload(file, { enabled, maxMb, maxDimension, quality }) {
    const sourceSize = file.size || 0;
    const maxBytes = Math.round(Math.min(2, Math.max(0.3, Number(maxMb) || 2)) * 1024 * 1024);

    if (!enabled) {
        return { uploadFile: file, sourceSize, compressedSize: sourceSize, wasCompressed: false };
    }

    const browserDecodable = /^image\/(jpeg|jpg|png|webp|bmp|gif|avif)$/i.test(file.type || '');
    if (!browserDecodable) {
        return { uploadFile: file, sourceSize, compressedSize: sourceSize, wasCompressed: false };
    }

    try {
        const objectUrl = URL.createObjectURL(file);
        const img = await new Promise((resolve, reject) => {
            const el = new Image();
            el.onload = () => resolve(el);
            el.onerror = reject;
            el.src = objectUrl;
        });
        URL.revokeObjectURL(objectUrl);

        const origW = img.naturalWidth || img.width;
        const origH = img.naturalHeight || img.height;
        if (!origW || !origH) {
            return { uploadFile: file, sourceSize, compressedSize: sourceSize, wasCompressed: false };
        }

        let curMaxSide = Math.min(Math.max(1000, Number(maxDimension) || 2400), Math.max(origW, origH));
        let curQuality = Math.min(0.95, Math.max(0.68, (Number(quality) || 88) / 100));
        let bestBlob = null;

        for (let attempt = 0; attempt < 7; attempt++) {
            const scale = Math.min(1, curMaxSide / Math.max(origW, origH));
            const dstW = Math.max(1, Math.round(origW * scale));
            const dstH = Math.max(1, Math.round(origH * scale));

            const canvas = document.createElement('canvas');
            canvas.width = dstW;
            canvas.height = dstH;
            const ctx = canvas.getContext('2d');
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, dstW, dstH);

            const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', curQuality));
            if (!blob) break;
            bestBlob = blob;

            if (blob.size <= maxBytes) {
                break;
            }

            if (curQuality > 0.70) {
                curQuality = Math.max(0.68, curQuality - 0.06);
            } else {
                curMaxSide = Math.max(960, Math.round(curMaxSide * 0.84));
            }
        }

        if (bestBlob && (bestBlob.size < sourceSize || sourceSize > maxBytes)) {
            const baseStem = (file.name || 'photo').replace(/\.[^.]+$/, '');
            const compressedFile = new File([bestBlob], `${baseStem}.jpg`, {
                type: 'image/jpeg',
                lastModified: file.lastModified || Date.now(),
            });
            return {
                uploadFile: compressedFile,
                sourceSize,
                compressedSize: compressedFile.size,
                wasCompressed: true,
            };
        }
    } catch {
        // Fallback: biarkan server yang melakukan kompresi bila browser gagal decode
    }

    return { uploadFile: file, sourceSize, compressedSize: sourceSize, wasCompressed: false };
}

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
    oversizedPhotosCount = 0,
    insightFaceReady,
}) {
    const totalPhotosCount = photosPaginator?.total ?? 0;
    const [photos, setPhotos] = useState(photosPaginator?.data || []);
    const [totalCount, setTotalCount] = useState(totalPhotosCount || 0);
    const [uploadPrice, setUploadPrice] = useState(defaultPrice || 25000);
    const [uploading, setUploading] = useState(false);
    const [discountOpen, setDiscountOpen] = useState(false);
    const [compressionOpen, setCompressionOpen] = useState(false);
    const [compressingExisting, setCompressingExisting] = useState(false);

    const compressionForm = useForm({
        compress_uploads_enabled: true,
        compress_max_mb: Number(discountRule?.compress_max_mb ?? 2),
        compress_max_dimension: Number(discountRule?.compress_max_dimension ?? 2400),
        compress_quality: Number(discountRule?.compress_quality ?? 88),
    });

    const handleSaveCompression = (e) => {
        e.preventDefault();
        compressionForm.post('/admin/langitlens/compression', {
            preserveScroll: true,
            onSuccess: () => setCompressionOpen(false),
        });
    };

    const handleCompressExisting = () => {
        setCompressingExisting(true);
        router.post(
            '/admin/langitlens/photos/compress-existing',
            {},
            {
                preserveScroll: true,
                onFinish: () => setCompressingExisting(false),
            }
        );
    };

    const discountForm = useForm({
        name: discountRule?.name ?? 'Diskon Paket Foto',
        is_active: Boolean(discountRule?.is_active ?? true),
        min_photos_selected: discountRule?.min_photos_selected ?? 5,
        discount_percentage: discountRule?.discount_percentage ?? 20,
        default_photo_price: discountRule?.default_photo_price ?? 25000,
        admin_whatsapp: discountRule?.admin_whatsapp ?? '6281234567890',
        bank_name: discountRule?.bank_name ?? '',
        bank_account_number: discountRule?.bank_account_number ?? '',
        bank_account_holder: discountRule?.bank_account_holder ?? '',
        manual_payment_info: discountRule?.manual_payment_info ?? '',
    });

    const handleSaveDiscount = (e) => {
        e.preventDefault();
        discountForm.post('/admin/langitlens/discount', {
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
        duplicates: 0,
        failed: 0,
        startedAt: 0,
    });
    const [recentLogs, setRecentLogs] = useState([]);
    const [failedFiles, setFailedFiles] = useState([]);

    const [editingId, setEditingId] = useState(null);
    const [editPrice, setEditPrice] = useState('');
    const [reindexingId, setReindexingId] = useState(null);
    const [reindexingAll, setReindexingAll] = useState(false);
    const [confirmClearAllOpen, setConfirmClearAllOpen] = useState(false);
    const [clearingAll, setClearingAll] = useState(false);

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

    const uploadSingleWithRetry = async (file, priceValue, compressionCfg) => {
        const sourceHash = await computeFileSha256(file);
        const { uploadFile, sourceSize, compressedSize } = await compressPhotoBeforeUpload(file, compressionCfg);

        let faces = [];
        if (!insightFaceReady) {
            try {
                const mod = await getClientFaceApi();
                faces = await mod.extractFacesFromFile(uploadFile);
            } catch {
                // Tetap unggah foto meski deteksi browser gagal
            }
        }

        let lastError = null;
        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                const formData = new FormData();
                formData.append('photo', uploadFile);
                formData.append('original_filename', file.name);
                formData.append('source_size_bytes', String(sourceSize));
                if (sourceHash) {
                    formData.append('source_hash', sourceHash);
                }
                formData.append('price', String(priceValue));
                if (faces.length > 0) {
                    formData.append('faces', JSON.stringify(faces));
                }

                const response = await axios.post('/admin/langitlens/photos', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    timeout: 120000,
                });
                return { ...response.data, sourceSize, compressedSize };
            } catch (err) {
                lastError = err;
                const status = err.response?.status;
                // Jangan ulangi jika duplikat (409) atau error validasi (422)
                if (status === 409 || status === 422) break;
                if (attempt < MAX_RETRIES) {
                    await new Promise((r) => setTimeout(r, attempt * 700));
                }
            }
        }
        throw lastError || new Error('Gagal mengunggah foto.');
    };

    const runUploadQueue = async (files) => {
        if (files.length === 0) return;

        // Cegah nama file duplikat di dalam satu batch unggahan
        const uniqueFiles = [];
        const seenInBatch = new Set();
        let batchDuplicates = 0;
        const initialDupLogs = [];

        for (const f of files) {
            const key = (f.name || '').trim().toLowerCase();
            if (key && seenInBatch.has(key)) {
                batchDuplicates++;
                initialDupLogs.push({
                    id: `dup-${batchDuplicates}-${Date.now()}`,
                    name: f.name,
                    size: f.size,
                    status: 'duplicate',
                    errorMsg: 'Nama file ganda di pilihan yang sama',
                });
            } else {
                if (key) seenInBatch.add(key);
                uniqueFiles.push(f);
            }
        }

        setUploading(true);
        setFailedFiles([]);
        failedRef.current = [];
        setRecentLogs(initialDupLogs.slice(0, 14));
        setUploadStats({
            total: files.length,
            done: 0,
            duplicates: batchDuplicates,
            failed: 0,
            startedAt: Date.now(),
        });

        let cursor = 0;
        const priceSnap = uploadPrice;
        const compressionSnap = {
            enabled: true,
            maxMb: Math.min(2, Math.max(0.3, Number(compressionForm.data.compress_max_mb) || 2)),
            maxDimension: Math.min(4000, Math.max(1000, Number(compressionForm.data.compress_max_dimension) || 2400)),
            quality: Math.min(95, Math.max(65, Number(compressionForm.data.compress_quality) || 88)),
        };

        const worker = async () => {
            while (true) {
                const idx = cursor++;
                if (idx >= uniqueFiles.length) break;

                const file = uniqueFiles[idx];
                try {
                    const data = await uploadSingleWithRetry(file, priceSnap, compressionSnap);
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
                            size: data?.photo?.original_size_bytes ?? data?.compressedSize ?? file.size,
                            sourceSize: data?.sourceSize ?? file.size,
                            status: 'ok',
                            faces: data?.photo?.face_count ?? 0,
                        },
                        ...prev.slice(0, 14),
                    ]);
                } catch (err) {
                    const isDup = err.response?.status === 409 && err.response?.data?.duplicate;
                    if (isDup) {
                        setUploadStats((s) => ({ ...s, duplicates: s.duplicates + 1 }));
                        setRecentLogs((prev) => [
                            {
                                id: `${idx}-${Date.now()}`,
                                name: file.name,
                                size: file.size,
                                status: 'duplicate',
                                errorMsg: 'Sudah ada di galeri',
                            },
                            ...prev.slice(0, 14),
                        ]);
                    } else {
                        failedRef.current.push(file);
                        setUploadStats((s) => ({ ...s, failed: s.failed + 1 }));
                        setRecentLogs((prev) => [
                            {
                                id: `${idx}-${Date.now()}`,
                                name: file.name,
                                size: file.size,
                                status: 'failed',
                                errorMsg: err.response?.data?.message || err.message,
                            },
                            ...prev.slice(0, 14),
                        ]);
                    }
                }
            }
        };

        const workerCount = Math.min(UPLOAD_CONCURRENCY, Math.max(1, uniqueFiles.length));
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

    const handleClearAllPhotos = () => {
        if (clearingAll || uploading) return;
        setClearingAll(true);
        router.delete('/admin/langitlens/photos/clear-all', {
            preserveScroll: false,
            onSuccess: () => {
                setPhotos([]);
                setTotalCount(0);
                setRecentLogs([]);
                setFailedFiles([]);
                setUploadStats({ total: 0, done: 0, failed: 0, startedAt: 0 });
                setConfirmClearAllOpen(false);
            },
            onFinish: () => setClearingAll(false),
        });
    };

    const processedTotal = uploadStats.done + uploadStats.duplicates + uploadStats.failed;
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

                {/* Panel Aturan Kompresi Foto & Anti-Duplikat (Seperti Fotoyu) */}
                <div className="bg-[#0B1222]/90 border border-white/10 rounded-2xl overflow-hidden transition-colors duration-200 hover:border-white/15">
                    <button
                        type="button"
                        onClick={() => setCompressionOpen((prev) => !prev)}
                        className="w-full px-4 sm:px-5 py-3.5 flex items-center justify-between gap-3 text-left hover:bg-slate-800/40 transition-colors cursor-pointer"
                    >
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                                <SlidersHorizontal className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs sm:text-sm font-bold text-white truncate">
                                    Aturan Kompresi Foto & Anti-Duplikat
                                </p>
                                <p className="text-[11px] sm:text-xs text-slate-400 truncate">
                                    Kompres Wajib Aktif: Maks {compressionForm.data.compress_max_mb} MB •{' '}
                                    {compressionForm.data.compress_max_dimension}px (Jernih) • Tolak Duplikat Aktif
                                </p>
                            </div>
                        </div>
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 text-xs font-semibold text-cyan-300 shrink-0">
                            <span>{compressionOpen ? 'Tutup' : 'Atur'}</span>
                            {compressionOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </span>
                    </button>

                    {oversizedPhotosCount > 0 && (
                        <div className="px-4 sm:px-5 py-3 border-t border-amber-500/20 bg-amber-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                            <div className="flex items-start sm:items-center gap-2 text-xs text-amber-200">
                                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
                                <span>
                                    Ditemukan <strong>{oversizedPhotosCount} foto</strong> di galeri yang ukurannya masih di atas{' '}
                                    <strong>{compressionForm.data.compress_max_mb} MB</strong> (dari unggahan sebelumnya).
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={handleCompressExisting}
                                disabled={compressingExisting}
                                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all cursor-pointer disabled:opacity-60 shrink-0"
                            >
                                {compressingExisting ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                    <SlidersHorizontal className="w-3.5 h-3.5" />
                                )}
                                <span>
                                    {compressingExisting
                                        ? 'Mengompres...'
                                        : `Kompres ${oversizedPhotosCount} Foto Sekarang`}
                                </span>
                            </button>
                        </div>
                    )}

                    {compressionOpen && (
                        <form
                            onSubmit={handleSaveCompression}
                            className="px-4 sm:px-5 pb-5 pt-3 border-t border-slate-800 space-y-4"
                        >
                            <div className="flex items-center justify-between gap-4 p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/25">
                                <div>
                                    <span className="block text-xs sm:text-sm font-semibold text-cyan-200">
                                        Kompresi Foto Otomatis Sebelum Upload ke VPS (Wajib Aktif)
                                    </span>
                                    <span className="block text-[11px] text-slate-300">
                                        Setiap foto yang diunggah ke galeri otomatis dikompres &le; {compressionForm.data.compress_max_mb} MB sebelum disimpan ke database &amp; disk VPS agar hemat ruang namun tetap jernih.
                                    </span>
                                </div>
                                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold shrink-0">
                                    AKTIF
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                                        Maksimal Ukuran Hasil Kompres (MB)
                                    </label>
                                    <input
                                        type="number"
                                        min="0.3"
                                        max="2"
                                        step="0.1"
                                        value={compressionForm.data.compress_max_mb}
                                        onChange={(e) => compressionForm.setData('compress_max_mb', Number(e.target.value))}
                                        className="w-full min-h-11 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-cyan-400"
                                    />
                                    <p className="text-[10px] text-slate-400 mt-1">Batas maksimal 2 MB per foto.</p>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                                        Dimensi Maksimal (px)
                                    </label>
                                    <input
                                        type="number"
                                        min="1000"
                                        max="4000"
                                        step="100"
                                        value={compressionForm.data.compress_max_dimension}
                                        onChange={(e) => compressionForm.setData('compress_max_dimension', Number(e.target.value))}
                                        className="w-full min-h-11 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-cyan-400"
                                    />
                                    <p className="text-[10px] text-slate-400 mt-1">Rekomendasi 2400px (tetap tajam).</p>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                                        Kualitas Awal (%)
                                    </label>
                                    <input
                                        type="number"
                                        min="65"
                                        max="95"
                                        step="1"
                                        value={compressionForm.data.compress_quality}
                                        onChange={(e) => compressionForm.setData('compress_quality', Number(e.target.value))}
                                        className="w-full min-h-11 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-cyan-400"
                                    />
                                    <p className="text-[10px] text-slate-400 mt-1">Otomatis turun bertahap jika &gt; 2 MB.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-xs text-emerald-200">
                                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                <span>
                                    <strong>Anti-Duplikat Aktif:</strong> Foto dengan nama file atau isi yang sudah ada di galeri otomatis ditolak agar tidak memakan ruang VPS. File ukuran asli penuh untuk pelanggan yang sudah bayar dapat dikirim saat konfirmasi di menu <strong>Bukti Bayar &amp; Pesanan</strong>.
                                </span>
                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={compressionForm.processing}
                                    className="w-full sm:w-auto min-h-11 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 active:scale-[0.98] text-slate-950 font-bold text-xs sm:text-sm transition-all cursor-pointer disabled:opacity-60"
                                >
                                    {compressionForm.processing ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Save className="w-4 h-4" />
                                    )}
                                    <span>{compressionForm.processing ? 'Menyimpan...' : 'Simpan Aturan Kompresi'}</span>
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                {/* Area Upload Massal Tanpa Batas */}
                <div className="bg-[#0B1222]/90 border border-white/10 rounded-2xl p-4 sm:p-6 space-y-4">
                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3">
                        <div>
                            <h2 className="text-base font-bold text-white">Unggah Foto Massal (Tanpa Batas)</h2>
                            <p className="text-xs text-slate-400 mt-0.5">
                                Pilih ratusan hingga ribuan foto atau satu folder sekaligus. Diproses paralel & otomatis
                                ulangi jika jaringan terganggu.
                            </p>
                        </div>
                        <div className="flex flex-wrap items-end gap-2.5 shrink-0">
                            <div>
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
                            {totalCount > 0 && (
                                <button
                                    type="button"
                                    onClick={() => setConfirmClearAllOpen(true)}
                                    disabled={uploading || clearingAll}
                                    className="min-h-11 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 active:scale-[0.98] border border-rose-500/35 text-rose-300 font-bold text-xs transition-all cursor-pointer disabled:opacity-50"
                                    title="Hapus seluruh foto galeri event lama dari database & disk VPS"
                                >
                                    <Trash2 className="w-4 h-4 shrink-0" />
                                    <span>Hapus Semua Foto ({totalCount})</span>
                                </button>
                            )}
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
                                        Mengompres &amp; Mengunggah {processedTotal} / {uploadStats.total} Foto ({progressPercent}%)
                                    </p>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        Berhasil: {uploadStats.done} • Duplikat Dilewati: {uploadStats.duplicates} • Gagal: {uploadStats.failed}
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

                            {!uploading && uploadStats.failed === 0 && (uploadStats.done > 0 || uploadStats.duplicates > 0) && (
                                <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-200">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                    <span>
                                        Selesai: {uploadStats.done} foto terkompresi &amp; tersimpan
                                        {uploadStats.duplicates > 0 ? ` • ${uploadStats.duplicates} duplikat otomatis dilewati` : ''}.
                                    </span>
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
                                                <p className="text-[11px] text-slate-400">
                                                    {item.status === 'ok' && item.sourceSize && item.sourceSize > item.size
                                                        ? `${formatBytes(item.sourceSize)} → ${formatBytes(item.size)}`
                                                        : formatBytes(item.size)}
                                                </p>
                                            </div>
                                            {item.status === 'ok' ? (
                                                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-semibold shrink-0">
                                                    Selesai ({item.faces} wajah)
                                                </span>
                                            ) : item.status === 'duplicate' ? (
                                                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 font-semibold shrink-0">
                                                    Duplikat (Dilewati)
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

            {/* Modal Konfirmasi Hapus Semua Foto Galeri */}
            {confirmClearAllOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4"
                    onClick={() => !clearingAll && setConfirmClearAllOpen(false)}
                >
                    <div
                        className="w-full max-w-md rounded-2xl bg-[#0B1222] border border-white/15 p-5 sm:p-6 shadow-2xl space-y-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0">
                                <AlertTriangle className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-sm font-bold text-white">Hapus Semua Foto Galeri?</h3>
                                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                                    Seluruh <strong className="text-white">{totalCount} foto</strong> (file asli resolusi
                                    penuh &amp; preview watermark) akan dihapus permanen dari{' '}
                                    <strong className="text-rose-300">database dan penyimpanan disk VPS</strong> agar
                                    ruang server kembali lega untuk event baru.
                                </p>
                                <p className="text-[11px] text-slate-400 mt-2">
                                    Akun dan data scan 3 wajah permanen pelanggan tetap aman.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-white/10">
                            <button
                                type="button"
                                disabled={clearingAll}
                                onClick={() => setConfirmClearAllOpen(false)}
                                className="min-h-10 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                disabled={clearingAll}
                                onClick={handleClearAllPhotos}
                                className="min-h-10 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                            >
                                {clearingAll ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                    <Trash2 className="w-3.5 h-3.5" />
                                )}
                                <span>{clearingAll ? 'Menghapus...' : 'Ya, Hapus Semua Foto'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

Photos.layout = (page) => <LangitLensAdminLayout title="Upload & Galeri">{page}</LangitLensAdminLayout>;
