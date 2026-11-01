import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { 
    Camera, Download, Clock, AlertTriangle, CheckCircle2, 
    LogOut, ExternalLink, Sparkles, FolderArchive, Image as ImageIcon,
    Info, Eye, X, ChevronRight
} from 'lucide-react';
import ThemeToggle from '@/Components/ThemeToggle';

export default function ClientGallery({ client, deliveries = [] }) {
    const [previewPhoto, setPreviewPhoto] = useState(null);

    const [theme, setTheme] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('langit_theme') || 'light';
        }
        return 'light';
    });

    const handleLogout = () => {
        router.post('/pelanggan/logout');
    };

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
                        <h1 className="font-heading font-black text-2xl sm:text-3xl text-slate-900 dark:text-white">
                            Selamat Datang, {client?.name}!
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-xl leading-relaxed">
                            Berikut adalah daftar koleksi foto hasil sesi Anda. Setiap foto tersedia dalam ukuran asli beresolusi tinggi tanpa batasan kompresi. Harap unduh sebelum masa hitungan hari kedaluwarsa berakhir.
                        </p>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                        <a
                            href="https://wa.me/6282246142791"
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

                            return (
                                <section 
                                    key={delivery.id} 
                                    className="p-5 sm:p-7 rounded-3xl bg-white dark:bg-[#090D16]/90 border border-slate-200/90 dark:border-white/10 shadow-lg shadow-slate-200/40 dark:shadow-none space-y-6"
                                >
                                    {/* Header & Status Section */}
                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-white/10">
                                        <div>
                                            <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                                <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-slate-900 dark:text-white">
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
                                                        href={`https://wa.me/6282246142791?text=${encodeURIComponent(`Halo Admin Studio Langit, saya ${client?.name} ingin meminta perpanjangan masa unduh untuk album "${delivery.title}".`)}`}
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
                                                    <h4 className="font-bold text-sm leading-tight text-amber-950 dark:text-amber-100 flex items-center gap-2">
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
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
                                            {delivery.photos?.map((photo, pIdx) => (
                                                <div 
                                                    key={photo.id}
                                                    className="group relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
                                                >
                                                    {/* Photo Thumbnail */}
                                                    <div 
                                                        onClick={() => setPreviewPhoto(photo)}
                                                        className="aspect-[4/3] w-full overflow-hidden relative cursor-pointer bg-slate-950"
                                                    >
                                                        <img
                                                            src={photo.file_url}
                                                            alt={photo.original_name}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                            loading="lazy"
                                                        />
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                            <span className="p-2 rounded-full bg-white/20 backdrop-blur-md text-white">
                                                                <Eye className="w-5 h-5" />
                                                            </span>
                                                        </div>
                                                        <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-white text-[10px] font-mono font-bold">
                                                            #{pIdx + 1}
                                                        </span>
                                                    </div>

                                                    {/* Details & Download Button */}
                                                    <div className="p-3 bg-white dark:bg-[#0c1220] flex items-center justify-between gap-2 border-t border-slate-200/80 dark:border-white/5">
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate" title={photo.original_name}>
                                                                {photo.original_name}
                                                            </p>
                                                            <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold block mt-0.5">
                                                                Ukuran Asli: {photo.formatted_size}
                                                            </span>
                                                        </div>

                                                        {/* Direct Download Button */}
                                                        <a
                                                            href={`/pelanggan/foto/${photo.id}/download`}
                                                            className="p-2 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-[#005792] hover:text-white dark:hover:bg-cyan-500 dark:hover:text-slate-950 text-slate-700 dark:text-slate-200 transition-colors shrink-0"
                                                            title={`Unduh file asli (${photo.formatted_size})`}
                                                        >
                                                            <Download className="w-4 h-4" />
                                                        </a>
                                                    </div>
                                                </div>
                                            ))}
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

            {/* Lightbox Preview Modal */}
            {previewPhoto && (
                <div 
                    className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
                    onClick={() => setPreviewPhoto(null)}
                >
                    <div 
                        className="relative max-w-5xl max-h-[90vh] flex flex-col items-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={() => setPreviewPhoto(null)}
                            className="absolute -top-12 right-0 p-2 text-white/80 hover:text-white bg-white/10 rounded-full"
                        >
                            <X className="w-6 h-6" />
                        </button>
                        <img
                            src={previewPhoto.file_url}
                            alt={previewPhoto.original_name}
                            className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl"
                        />
                        <div className="mt-4 flex items-center justify-between w-full text-white text-xs font-mono px-2">
                            <span>{previewPhoto.original_name} ({previewPhoto.formatted_size})</span>
                            <a
                                href={`/pelanggan/foto/${previewPhoto.id}/download`}
                                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold flex items-center gap-1.5 transition-colors"
                            >
                                <Download className="w-4 h-4" />
                                <span>Unduh Foto Asli Penuh</span>
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
