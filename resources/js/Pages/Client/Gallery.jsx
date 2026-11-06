import React, { useState, useEffect, useCallback } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { 
    Camera, Download, Clock, AlertTriangle, CheckCircle2, 
    LogOut, ExternalLink, Sparkles, FolderArchive, Image as ImageIcon,
    Eye, X, ChevronLeft, ChevronRight, Loader2, ZoomIn
} from 'lucide-react';
import ThemeToggle from '@/Components/ThemeToggle';
import { getWhatsAppUrl } from '@/Utils/whatsapp';

function PhotoThumbnailCard({ photo, index, onPreview }) {
    const [loaded, setLoaded] = useState(false);
    const [imgSrc, setImgSrc] = useState(photo.thumbnail_url || photo.file_url);

    const handleError = () => {
        if (imgSrc !== photo.file_url) {
            setImgSrc(photo.file_url);
        }
    };

    return (
        <div className="group relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col">
            <button
                type="button"
                aria-label={`Pratinjau ${photo.original_name}`}
                onClick={() => onPreview(photo)}
                className="aspect-[4/3] w-full overflow-hidden relative cursor-pointer bg-slate-950 select-none"
            >
                {!loaded && (
                    <div className="absolute inset-0 bg-slate-800/80 animate-pulse flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-slate-600 animate-pulse" />
                    </div>
                )}

                <img
                    src={imgSrc}
                    alt={photo.original_name}
                    loading="lazy"
                    decoding="async"
                    onLoad={() => setLoaded(true)}
                    onError={handleError}
                    className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-500 ${
                        loaded ? 'opacity-100' : 'opacity-0'
                    }`}
                />

                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <span className="p-2.5 rounded-full bg-white/20 backdrop-blur-md text-white shadow-lg transform group-hover:scale-110 transition-transform">
                        <Eye className="w-5 h-5" />
                    </span>
                </div>

                <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-white text-[10px] font-mono font-bold shadow-xs">
                    #{index + 1}
                </span>

                <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-slate-200 text-[10px] font-mono font-semibold">
                    {photo.formatted_size}
                </span>
            </button>

            <div className="p-3 bg-white dark:bg-[#0c1220] flex items-center justify-between gap-2 border-t border-slate-200/80 dark:border-white/5">
                <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate" title={photo.original_name}>
                        {photo.original_name}
                    </p>
                    <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold block mt-0.5">
                        Ukuran Asli: {photo.formatted_size}
                    </span>
                </div>

                <a
                    href={`/pelanggan/foto/${photo.id}/download`}
                    className="min-w-11 min-h-11 flex items-center justify-center p-2 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-[#005792] hover:text-white dark:hover:bg-cyan-500 dark:hover:text-slate-950 text-slate-700 dark:text-slate-200 transition-colors shrink-0"
                    title={`Unduh file asli (${photo.formatted_size})`}
                >
                    <Download className="w-4 h-4" />
                </a>
            </div>
        </div>
    );
}

export default function ClientGallery({ client, deliveries = [] }) {
    const [previewPhoto, setPreviewPhoto] = useState(null);
    const [previewList, setPreviewList] = useState([]);
    const [isHdMode, setIsHdMode] = useState(false);
    const [isHdLoading, setIsHdLoading] = useState(false);

    // Pagination batching per album
    const INITIAL_BATCH_SIZE = 36;
    const [visibleCounts, setVisibleCounts] = useState({});

    const getVisibleCount = (deliveryId, total) => {
        return visibleCounts[deliveryId] ?? Math.min(INITIAL_BATCH_SIZE, total);
    };

    const handleLoadMore = (deliveryId, total) => {
        setVisibleCounts(prev => ({
            ...prev,
            [deliveryId]: Math.min((prev[deliveryId] ?? INITIAL_BATCH_SIZE) + INITIAL_BATCH_SIZE, total)
        }));
    };

    const handleShowAll = (deliveryId, total) => {
        setVisibleCounts(prev => ({
            ...prev,
            [deliveryId]: total
        }));
    };

    const [theme, setTheme] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('langit_theme_v2') || 'dark';
        }
        return 'dark';
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
        localStorage.setItem('langit_theme_v2', theme);
        localStorage.setItem('langit_theme', theme);
    }, [theme]);

    const handleLogout = () => {
        router.post('/pelanggan/logout');
    };

    const openPreview = (photo, allPhotos) => {
        setPreviewPhoto(photo);
        setPreviewList(allPhotos || []);
        setIsHdMode(false);
        setIsHdLoading(false);
    };

    const closePreview = () => {
        setPreviewPhoto(null);
        setPreviewList([]);
        setIsHdMode(false);
        setIsHdLoading(false);
    };

    const currentIndex = previewList.findIndex(p => p.id === previewPhoto?.id);

    const handlePrev = useCallback(() => {
        if (currentIndex > 0) {
            setPreviewPhoto(previewList[currentIndex - 1]);
            setIsHdLoading(isHdMode);
        }
    }, [currentIndex, previewList, isHdMode]);

    const handleNext = useCallback(() => {
        if (currentIndex < previewList.length - 1) {
            setPreviewPhoto(previewList[currentIndex + 1]);
            setIsHdLoading(isHdMode);
        }
    }, [currentIndex, previewList, isHdMode]);

    // Keyboard navigation di Lightbox Modal
    useEffect(() => {
        if (!previewPhoto) return;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') closePreview();
            if (e.key === 'ArrowLeft') handlePrev();
            if (e.key === 'ArrowRight') handleNext();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [previewPhoto, handlePrev, handleNext]);

    return (
        <div className="min-h-screen bg-[#EDF9FC] text-slate-800 dark:bg-[#07090E] dark:text-slate-100 font-sans transition-colors duration-200">
            <Head title={`Galeri Foto Saya — ${client?.name || 'Pelanggan'} | Studio Langit`} />

            {/* Top Navigation Bar */}
            <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#090D16]/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/10 shadow-xs">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#005792] via-sky-500 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-sky-500/20">
                                <Camera className="w-5 h-5" />
                            </div>
                            <div>
                                <span className="font-heading font-black text-sm text-slate-900 dark:text-white leading-none block">
                                    Studio Langit
                                </span>
                                <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400">
                                    Portal Pelanggan
                                </span>
                            </div>
                        </Link>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                        <ThemeToggle theme={theme} setTheme={setTheme} />

                        <div className="hidden sm:block text-right pr-2 border-r border-slate-200 dark:border-white/10">
                            <span className="text-xs font-bold text-slate-900 dark:text-white block leading-tight">
                                {client?.name}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono block">
                                {client?.email}
                            </span>
                        </div>

                        <button
                            type="button"
                            onClick={handleLogout}
                            className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                            title="Keluar dari Akun Pelanggan"
                        >
                            <LogOut className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Keluar</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                {/* Welcome Banner */}
                <div className="mb-8 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#005792]/10 via-sky-500/10 to-indigo-500/10 dark:from-[#005792]/20 dark:via-sky-500/15 dark:to-indigo-500/15 border border-[#005792]/20 dark:border-white/10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#005792] dark:text-cyan-400 block mb-1">
                            Layanan Pelanggan Aktif
                        </span>
                        <h1 className="font-heading break-words font-black text-2xl sm:text-3xl text-slate-900 dark:text-white">
                            Selamat Datang, {client?.name}!
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-xl leading-relaxed">
                            Berikut adalah daftar koleksi foto hasil sesi Anda. Setiap foto tersedia dalam ukuran asli beresolusi tinggi tanpa batasan kompresi. Harap unduh sebelum masa hitungan hari kedaluwarsa berakhir.
                        </p>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                        <a
                            href={getWhatsAppUrl('client-delivery', {
                                clientName: client?.name || '',
                                title: 'Portal Pengambilan Foto',
                                details: 'Konsultasi atau bantuan unduh album foto'
                            })}
                            target="_blank"
                            rel="noreferrer"
                            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-emerald-600/20 transition-all hover:scale-105 active:scale-95"
                        >
                            <span>Hubungi Admin Studio</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                    </div>
                </div>

                {/* Delivery Albums List */}
                {deliveries.length === 0 ? (
                    <div className="text-center py-20 rounded-3xl bg-white dark:bg-[#090D16]/90 border border-slate-200 dark:border-white/10 p-8 shadow-sm">
                        <Camera className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                        <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white">
                            Belum Ada Koleksi Foto yang Diunggah
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                            Admin Studio Langit sedang mempersiapkan foto Anda. Silakan cek kembali nanti atau hubungi fotografer kami.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-12">
                        {deliveries.map((delivery) => {
                            const isExpired = delivery.is_expired;
                            const remainingDays = delivery.remaining_days;
                            const totalPhotos = delivery.photos?.length || 0;
                            const currentVisible = getVisibleCount(delivery.id, totalPhotos);
                            const visiblePhotos = delivery.photos?.slice(0, currentVisible) || [];

                            return (
                                <section 
                                    key={delivery.id} 
                                    className="p-5 sm:p-7 rounded-3xl bg-white dark:bg-[#090D16]/90 border border-slate-200/90 dark:border-white/10 shadow-lg shadow-slate-200/40 dark:shadow-none space-y-6"
                                >
                                    {/* Header & Status Section */}
                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-white/10">
                                        <div>
                                            <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                                <h2 className="font-heading break-words font-extrabold text-xl sm:text-2xl text-slate-900 dark:text-white">
                                                    {delivery.title}
                                                </h2>
                                                {isExpired ? (
                                                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 flex items-center gap-1">
                                                        <AlertTriangle className="w-3 h-3" />
                                                        <span>Kedaluwarsa</span>
                                                    </span>
                                                ) : (
                                                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                                        <CheckCircle2 className="w-3 h-3" />
                                                        <span>Aktif ({delivery.photos?.length || 0} Foto)</span>
                                                    </span>
                                                )}
                                            </div>

                                            {delivery.notes && (
                                                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl">
                                                    Catatan: {delivery.notes}
                                                </p>
                                            )}
                                        </div>

                                        {/* Download All ZIP Button (Only if NOT expired) */}
                                        {!isExpired && delivery.photos?.length > 0 && (
                                            <div className="shrink-0 flex items-center gap-3">
                                                <a
                                                    href={`/pelanggan/album/${delivery.id}/download-all`}
                                                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#005792] hover:bg-[#004270] active:bg-[#003357] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm hover:shadow transition-all active:scale-95 cursor-pointer"
                                                >
                                                    <FolderArchive className="w-4 h-4 shrink-0" />
                                                    <span>Unduh Semua Foto (ZIP • {delivery.total_size_formatted})</span>
                                                </a>
                                            </div>
                                        )}
                                    </div>

                                    {/* ── COUNTDOWN HARI MUNDUR BANNER ── */}
                                    {isExpired ? (
                                        <div className="p-4 sm:p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 flex items-start gap-3.5">
                                            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
                                            <div className="flex-1">
                                                <h4 className="font-bold text-sm leading-tight text-rose-900 dark:text-rose-200">
                                                    Masa Pengambilan Foto Telah Kedaluwarsa
                                                </h4>
                                                <p className="text-xs mt-1 leading-relaxed text-rose-700 dark:text-rose-300">
                                                    Masa aktif pengunduhan foto untuk album ini telah berakhir pada{' '}
                                                    <strong>{new Date(delivery.expired_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>. 
                                                    Sesuai kebijakan studio, foto telah disembunyikan otomatis. Jika Anda belum sempat mengunduh, silakan hubungi admin Studio Langit untuk meminta perpanjangan hari aktif.
                                                </p>
                                                <div className="mt-3">
                                                    <a
                                                        href={getWhatsAppUrl('client-delivery', {
                                                            clientName: client?.name || '',
                                                            title: delivery.title,
                                                            details: 'Meminta perpanjangan masa aktif unduh album foto yang telah kedaluwarsa'
                                                        })}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors"
                                                    >
                                                        <span>Minta Perpanjangan Akses via WhatsApp</span>
                                                        <ExternalLink className="w-3 h-3" />
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div className="flex items-start gap-3">
                                                <Clock className="w-5 h-5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400 animate-pulse" />
                                                <div>
                                                    <h4 className="font-bold text-sm leading-tight text-amber-950 dark:text-amber-100 flex flex-wrap items-center gap-2">
                                                        <span>Hitungan Hari Mundur:</span>
                                                        <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-mono text-xs font-extrabold shadow-xs">
                                                            Tersisa {remainingDays} Hari Lagi
                                                        </span>
                                                    </h4>
                                                    <p className="text-xs text-amber-800 dark:text-amber-300 mt-1 leading-relaxed">
                                                        Batas waktu pengunduhan berakhir pada{' '}
                                                        <strong>{new Date(delivery.expired_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>. 
                                                        Segera unduh dan simpan seluruh foto ke perangkat Anda sebelum foto otomatis di-hide.
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="text-xs font-mono font-semibold px-3 py-1.5 rounded-xl bg-white/80 dark:bg-black/30 border border-amber-500/20 text-amber-700 dark:text-amber-300 shrink-0">
                                                Total Kapasitas: {delivery.total_size_formatted}
                                            </div>
                                        </div>
                                    )}

                                    {/* ── PHOTO GRID (Hanya Tampil Jika Belum Expired) ── */}
                                    {!isExpired ? (
                                        <div className="space-y-6">
                                            {/* Subheader info rendering */}
                                            <div className="flex flex-wrap gap-2 items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-mono">
                                                <span>
                                                    Menampilkan {Math.min(currentVisible, totalPhotos)} dari {totalPhotos} foto
                                                </span>
                                                <span className="text-[11px] text-cyan-700 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20">
                                                    ⚡ Pratinjau Cepat Aktif
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
                                                {visiblePhotos.map((photo, pIdx) => (
                                                    <PhotoThumbnailCard 
                                                        key={photo.id}
                                                        photo={photo}
                                                        index={pIdx}
                                                        onPreview={(p) => openPreview(p, delivery.photos)}
                                                    />
                                                ))}
                                            </div>

                                            {/* Tombol Muat Lebih Banyak Jika Foto Banyak */}
                                            {currentVisible < totalPhotos && (
                                                <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleLoadMore(delivery.id, totalPhotos)}
                                                        className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-white hover:bg-slate-50 dark:bg-white/10 dark:hover:bg-white/15 text-slate-800 dark:text-white border border-slate-300 dark:border-white/15 text-xs font-bold shadow-xs hover:shadow transition-all cursor-pointer"
                                                    >
                                                        Muat {Math.min(INITIAL_BATCH_SIZE, totalPhotos - currentVisible)} Foto Berikutnya (Sisa {totalPhotos - currentVisible})
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleShowAll(delivery.id, totalPhotos)}
                                                        className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 text-xs font-semibold transition-all cursor-pointer"
                                                    >
                                                        Tampilkan Semua ({totalPhotos} Foto)
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 rounded-2xl border border-dashed border-slate-300 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.01]">
                                            <ImageIcon className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
                                            <p className="text-xs text-slate-500 font-mono">
                                                Foto disembunyikan otomatis karena tautan telah kedaluwarsa.
                                            </p>
                                        </div>
                                    )}
                                </section>
                            );
                        })}
                    </div>
                )}
            </main>

            {/* ── LIGHTBOX MODAL DENGAN PENGATUR RESOLUSI IN-PLACE (SD vs HD ASLI) ── */}
            {previewPhoto && (
                <div 
                    className="fixed inset-0 h-dvh overflow-y-auto overscroll-contain z-[70] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-between p-3 sm:p-6 select-none"
                    onClick={closePreview}
                >
                    {/* Top Control Bar */}
                    <div 
                        className="w-full max-w-6xl shrink-0 flex flex-wrap items-center justify-between gap-3 text-white pb-3 border-b border-white/10 z-10"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="min-w-0">
                            <h3 className="text-xs sm:text-sm font-bold truncate">
                                {previewPhoto.original_name}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2 mt-0.5 text-[10px] sm:text-xs text-slate-400 font-mono">
                                <span>Foto #{currentIndex + 1} dari {previewList.length}</span>
                                <span>•</span>
                                <span className="text-emerald-400 font-bold">Ukuran Asli: {previewPhoto.formatted_size}</span>
                            </div>
                        </div>

                        {/* In-Place SD / HD Resolution Switcher */}
                        <div className="flex items-center gap-2">
                            <div className="inline-flex items-center rounded-xl bg-white/10 backdrop-blur-md p-1 border border-white/15 text-xs">
                                <button
                                    type="button"
                                    onClick={() => setIsHdMode(false)}
                                    className={`px-2.5 sm:px-3 py-1 rounded-lg font-bold text-[11px] sm:text-xs transition-all cursor-pointer ${
                                        !isHdMode 
                                            ? 'bg-[#005792] text-white shadow-xs' 
                                            : 'text-slate-300 hover:text-white'
                                    }`}
                                    title="Pratinjau cepat kompresi WebP"
                                >
                                    ⚡ SD Cepat
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsHdMode(true);
                                        setIsHdLoading(true);
                                    }}
                                    className={`px-2.5 sm:px-3 py-1 rounded-lg font-bold text-[11px] sm:text-xs transition-all flex items-center gap-1 cursor-pointer ${
                                        isHdMode 
                                            ? 'bg-emerald-600 text-white shadow-xs' 
                                            : 'text-slate-300 hover:text-white'
                                    }`}
                                    title={`Tampilkan resolusi asli penuh (${previewPhoto.formatted_size})`}
                                >
                                    <Sparkles className="w-3 h-3 text-amber-300" />
                                    <span>HD Asli</span>
                                </button>
                            </div>

                            <button
                                type="button"
                                onClick={closePreview}
                                className="p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-xl transition-colors cursor-pointer"
                                title="Tutup pratinjau (Esc)"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Middle Image Stage with Prev/Next Controls */}
                    <div 
                        className="relative min-h-[120px] flex-1 w-full max-w-6xl flex items-center justify-center my-3 overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Tombol Panah Navigasi Sebelumnya */}
                        {currentIndex > 0 && (
                            <button
                                type="button"
                                onClick={handlePrev}
                                className="absolute left-2 sm:left-4 z-20 p-2.5 sm:p-3 rounded-full bg-black/60 hover:bg-black/90 text-white/90 hover:text-white backdrop-blur-md border border-white/20 shadow-xl transition-all cursor-pointer hover:scale-110 active:scale-95"
                                title="Foto Sebelumnya (Panah Kiri)"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                        )}

                        {/* Foto Preview & HD Transition */}
                        <div className="relative max-w-full max-h-[75vh] flex items-center justify-center">
                            {/* Layer 1: Pratinjau Cepat (SD / Thumbnail) - Selalu aktif saat awal agar tidak blank */}
                            <img
                                src={previewPhoto.thumbnail_url || previewPhoto.file_url}
                                alt={previewPhoto.original_name}
                                className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-2xl transition-opacity duration-300"
                            />

                            {/* Layer 2: Resolusi Asli Penuh (HD) jika diaktifkan */}
                            {isHdMode && (
                                <img
                                    src={previewPhoto.file_url}
                                    alt={previewPhoto.original_name}
                                    onLoad={() => setIsHdLoading(false)}
                                    className={`absolute inset-0 max-w-full max-h-[75vh] object-contain rounded-xl transition-opacity duration-500 m-auto ${
                                        isHdLoading ? 'opacity-0' : 'opacity-100'
                                    }`}
                                />
                            )}

                            {/* Indikator Memuat HD */}
                            {isHdMode && isHdLoading && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-xs rounded-xl text-white">
                                    <div className="px-4 py-2.5 rounded-2xl bg-black/80 border border-white/20 flex items-center gap-2.5 shadow-xl">
                                        <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                                        <span className="text-xs font-mono font-bold">
                                            Memuat Resolusi Asli ({previewPhoto.formatted_size})...
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Tombol Panah Navigasi Selanjutnya */}
                        {currentIndex < previewList.length - 1 && (
                            <button
                                type="button"
                                onClick={handleNext}
                                className="absolute right-2 sm:right-4 z-20 p-2.5 sm:p-3 rounded-full bg-black/60 hover:bg-black/90 text-white/90 hover:text-white backdrop-blur-md border border-white/20 shadow-xl transition-all cursor-pointer hover:scale-110 active:scale-95"
                                title="Foto Selanjutnya (Panah Kanan)"
                            >
                                <ChevronRight className="w-6 h-6" />
                            </button>
                        )}
                    </div>

                    {/* Bottom Action Footer */}
                    <div 
                        className="w-full max-w-6xl shrink-0 pt-3 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-white z-10"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="text-[11px] text-slate-400 flex items-center gap-2">
                            <span>💡 Tekan tombol panah keyboard ← / → untuk navigasi foto</span>
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                            {!isHdMode ? (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsHdMode(true);
                                        setIsHdLoading(true);
                                    }}
                                    className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                                >
                                    <ZoomIn className="w-3.5 h-3.5" />
                                    <span>Perbesar ke Resolusi Asli</span>
                                </button>
                            ) : (
                                <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1 font-bold">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Menampilkan Resolusi Asli Penuh</span>
                                </span>
                            )}

                            <a
                                href={`/pelanggan/foto/${previewPhoto.id}/download`}
                                className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all hover:scale-102 active:scale-98 shadow-md shadow-cyan-500/20 cursor-pointer"
                            >
                                <Download className="w-4 h-4" />
                                <span>Unduh Foto Asli ({previewPhoto.formatted_size})</span>
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
