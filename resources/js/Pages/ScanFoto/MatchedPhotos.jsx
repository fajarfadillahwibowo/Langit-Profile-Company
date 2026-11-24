import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import ScanCustomerLayout from '@/Layouts/ScanCustomerLayout';
import {
    ScanFace,
    Check,
    Plus,
    Lock,
    ShoppingBag,
    Sparkles,
    Eye,
    X,
    Loader2,
    Gift,
    Download,
    ArrowRight,
} from 'lucide-react';

function formatRupiah(num) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(num || 0);
}

export default function MatchedPhotos({ photos, cartIds, discountRule, freePhotoQuota = 0, freePhotoUsedAt = null }) {
    const [zoomPhoto, setZoomPhoto] = useState(null);
    const [togglingId, setTogglingId] = useState(null);
    const [claimingId, setClaimingId] = useState(null);

    const toggleSelect = (photoId) => {
        setTogglingId(photoId);
        router.post(
            '/scan-foto/keranjang/toggle',
            { photo_id: photoId },
            {
                preserveScroll: true,
                onFinish: () => setTogglingId(null),
            }
        );
    };

    const handleClaimFree = (photo) => {
        if (freePhotoQuota <= 0 || photo.is_unlocked) return;
        if (
            !confirm(
                `Ambil "${photo.title}" secara GRATIS menggunakan kuota 1 foto gratis Anda? Foto asli tanpa watermark akan langsung siap diunduh.`
            )
        ) {
            return;
        }
        setClaimingId(photo.id);
        router.post(
            `/scan-foto/hasil/${photo.id}/claim-free`,
            {},
            {
                preserveScroll: true,
                onFinish: () => setClaimingId(null),
            }
        );
    };

    const selectedCount = cartIds.length;
    const minForDiscount = discountRule?.min_photos_selected || 5;
    const discountPct = discountRule?.discount_percentage || 0;
    const remaining = Math.max(0, minForDiscount - selectedCount);
    const discountProgress = Math.min(100, Math.round((selectedCount / Math.max(1, minForDiscount)) * 100));

    return (
        <ScanCustomerLayout title="Foto Saya">
            <Head title="Foto Saya" />

            <div className="space-y-5">
                {/* Cinematic Discovery Hero Banner */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative overflow-hidden rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-[#0D1A2F] via-[#0B1426] to-[#11152C] border border-sky-400/25 shadow-2xl shadow-sky-950/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                    <div className="absolute inset-0 animate-shimmer pointer-events-none" />
                    <div className="relative z-10 space-y-1">
                        <h2 className="font-heading text-lg sm:text-xl font-black text-white">
                            {photos.length} Foto Ditemukan
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-300">
                            Pilih foto yang diinginkan, lalu pesan ke Admin untuk file asli tanpa watermark.
                        </p>
                    </div>
                    <Link
                        href="/scan-foto"
                        className="relative z-10 min-h-11 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-2xl bg-white/[0.08] hover:bg-white/[0.15] active:scale-[0.98] text-xs font-bold text-cyan-300 border border-white/15 transition-all shrink-0 backdrop-blur-md"
                    >
                        <ScanFace className="w-4 h-4" />
                        <span>Scan Ulang</span>
                    </Link>
                </motion.div>

                {/* Banner Kuota Gratis 1 Foto */}
                {freePhotoQuota > 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 }}
                        className="relative overflow-hidden rounded-2xl p-4 border bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-cyan-500/10 border-emerald-400/40 text-emerald-100 text-xs sm:text-sm flex items-center justify-between gap-3"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-400/20 border border-emerald-400/40 flex items-center justify-center shrink-0">
                                <Gift className="w-5 h-5 text-emerald-300" />
                            </div>
                            <div>
                                <p className="font-bold text-emerald-300 text-sm">
                                    Gratis {freePhotoQuota} Foto Tersedia
                                </p>
                                <p className="text-xs text-emerald-100/80 mt-0.5">
                                    Pilih 1 foto di bawah untuk diambil gratis (Rp 0) tanpa watermark.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <div className="rounded-2xl p-3.5 border bg-white/[0.03] border-white/10 text-slate-300 text-xs flex flex-wrap items-center justify-between gap-3 backdrop-blur-md">
                        <div className="flex items-center gap-2.5">
                            <Gift className="w-4 h-4 text-slate-500 shrink-0" />
                            <span>
                                Kuota gratis 1 foto Anda sudah digunakan{freePhotoUsedAt ? ` pada ${freePhotoUsedAt}` : ''}.
                            </span>
                        </div>
                        <Link
                            href="/scan-foto/unduhan"
                            className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-bold shrink-0"
                        >
                            <span>Lihat Unduhan</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                )}

                {/* Gamified Discount Progress Banner */}
                {discountRule?.is_active && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.08 }}
                        className={`rounded-2xl p-4 border text-xs sm:text-sm space-y-2.5 backdrop-blur-md ${
                            remaining === 0 && selectedCount > 0
                                ? 'bg-emerald-500/12 border-emerald-400/40 text-emerald-200'
                                : 'bg-amber-500/10 border-amber-400/30 text-amber-100'
                        }`}
                    >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                                <Sparkles className="w-4 h-4 shrink-0 text-amber-300" />
                                {remaining === 0 && selectedCount > 0 ? (
                                    <span>
                                        <strong>Diskon {discountPct}% aktif</strong> ({minForDiscount}+ foto).
                                    </span>
                                ) : (
                                    <span>
                                        Pilih min. <strong>{minForDiscount} foto</strong> untuk diskon{' '}
                                        <strong>{discountPct}%</strong>
                                        {selectedCount > 0 ? ` (kurang ${remaining} lagi)` : ''}.
                                    </span>
                                )}
                            </div>
                            <Link
                                href="/scan-foto/keranjang"
                                className="min-h-10 inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 font-bold text-white text-xs shrink-0 transition-colors"
                            >
                                <ShoppingBag className="w-3.5 h-3.5 text-cyan-300" />
                                <span>Keranjang ({selectedCount})</span>
                            </Link>
                        </div>

                        {/* Animated Discount Progress Bar */}
                        <div className="h-1.5 w-full rounded-full bg-black/30 overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${discountProgress}%` }}
                                transition={{ duration: 0.5, ease: 'easeOut' }}
                                className={`h-full rounded-full ${
                                    remaining === 0 && selectedCount > 0
                                        ? 'bg-gradient-to-r from-emerald-400 to-cyan-400'
                                        : 'bg-gradient-to-r from-amber-400 to-orange-400'
                                }`}
                            />
                        </div>
                    </motion.div>
                )}

                {photos.length === 0 ? (
                    <div className="bg-[#0B1222]/90 border border-white/10 rounded-3xl p-10 text-center space-y-3 backdrop-blur-xl">
                        <div className="w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-400/25 flex items-center justify-center mx-auto">
                            <ScanFace className="w-8 h-8 text-sky-400" />
                        </div>
                        <p className="font-heading text-base font-bold text-white">Foto Anda belum ditemukan</p>
                        <p className="text-xs text-slate-400 max-w-xs mx-auto">
                            Coba pindai ulang wajah Anda di tempat yang cukup terang agar akurasi AI maksimal.
                        </p>
                        <Link
                            href="/scan-foto"
                            className="min-h-11 inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-sky-400 to-cyan-400 hover:from-sky-300 hover:to-cyan-300 text-slate-950 font-black text-xs shadow-lg shadow-sky-500/25"
                        >
                            <span>Scan Wajah Lagi</span>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4 pb-28">
                        {photos.map((photo) => {
                            const isBusy = togglingId === photo.id;
                            return (
                                <div
                                    key={photo.id}
                                    className={`group rounded-3xl overflow-hidden border transition-all duration-200 hover:-translate-y-1 flex flex-col ${
                                        photo.in_cart
                                            ? 'bg-[#0F1B33] border-cyan-400/80 shadow-lg shadow-cyan-500/15 ring-1 ring-cyan-400/40'
                                            : 'bg-[#0B1222]/95 border-white/10 hover:border-sky-400/40 hover:shadow-xl hover:shadow-black/40'
                                    }`}
                                >
                                    <div
                                        className="relative aspect-[3/4] bg-slate-950 overflow-hidden select-none cursor-pointer"
                                        onContextMenu={(e) => e.preventDefault()}
                                        onClick={() => setZoomPhoto(photo)}
                                    >
                                        <img
                                            src={photo.preview_url}
                                            alt={photo.title}
                                            draggable={false}
                                            loading="lazy"
                                            className="w-full h-full object-cover pointer-events-none group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/25 opacity-60 group-hover:opacity-80 transition-opacity" />

                                        <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-black/65 backdrop-blur-md border border-emerald-400/30 text-[10px] font-bold text-emerald-300">
                                            {photo.similarity_percent}% Cocok
                                        </div>

                                        {photo.is_unlocked ? (
                                            <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-emerald-400 text-[10px] font-black text-slate-950 shadow-md">
                                                ✓ Dimiliki
                                            </div>
                                        ) : photo.in_cart ? (
                                            <div className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center shadow-lg shadow-cyan-500/40">
                                                <Check className="w-4 h-4 stroke-[3]" />
                                            </div>
                                        ) : (
                                            <div
                                                className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-black/65 backdrop-blur-md border border-white/15 text-amber-300"
                                                title="Pesan ke Admin atau gunakan kuota gratis untuk mengunduh"
                                            >
                                                <Lock className="w-3 h-3" />
                                            </div>
                                        )}

                                        <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-full bg-black/65 backdrop-blur-md border border-white/15 text-white text-[10px] font-semibold inline-flex items-center gap-1 opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all">
                                            <Eye className="w-3 h-3 text-cyan-300" />
                                            <span>Pratinjau</span>
                                        </div>
                                    </div>

                                    <div className="p-3.5 space-y-3 flex-1 flex flex-col justify-between">
                                        <div>
                                            <p className="text-xs font-semibold text-slate-300 truncate">{photo.title}</p>
                                            <p className="text-sm font-black text-white mt-0.5">
                                                {photo.is_unlocked ? (
                                                    <span className="text-emerald-400">Sudah Dimiliki</span>
                                                ) : (
                                                    formatRupiah(photo.price)
                                                )}
                                            </p>
                                        </div>

                                        {photo.is_unlocked ? (
                                            <Link
                                                href="/scan-foto/unduhan"
                                                className="w-full min-h-10 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-400/40 text-emerald-300 transition-all"
                                            >
                                                <Download className="w-3.5 h-3.5" />
                                                <span>Buka Unduhan</span>
                                            </Link>
                                        ) : (
                                            <div className="space-y-1.5">
                                                <button
                                                    type="button"
                                                    disabled={isBusy}
                                                    onClick={() => toggleSelect(photo.id)}
                                                    className={`w-full min-h-10 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-[0.97] cursor-pointer disabled:opacity-60 ${
                                                        photo.in_cart
                                                            ? 'bg-gradient-to-r from-sky-400 to-cyan-400 text-slate-950 shadow-md shadow-cyan-500/25'
                                                            : 'bg-white/[0.06] hover:bg-white/[0.12] text-white border border-white/12'
                                                    }`}
                                                >
                                                    {isBusy ? (
                                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                    ) : photo.in_cart ? (
                                                        <>
                                                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                                            <span>Dipilih</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Plus className="w-3.5 h-3.5" />
                                                            <span>Pilih Foto</span>
                                                        </>
                                                    )}
                                                </button>

                                                {freePhotoQuota > 0 && (
                                                    <button
                                                        type="button"
                                                        disabled={claimingId === photo.id}
                                                        onClick={() => handleClaimFree(photo)}
                                                        className="w-full min-h-10 py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 active:scale-[0.97] text-slate-950 transition-all cursor-pointer disabled:opacity-60 shadow-md shadow-emerald-500/20"
                                                    >
                                                        {claimingId === photo.id ? (
                                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                        ) : (
                                                            <>
                                                                <Gift className="w-3.5 h-3.5" />
                                                                <span>Ambil Gratis (1x)</span>
                                                            </>
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Bilah Pesanan Melayang (Glassmorphic Dock) */}
            <AnimatePresence>
                {selectedCount > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 24 }}
                        className="fixed bottom-20 lg:bottom-5 left-3 right-3 lg:left-72 lg:right-8 z-20"
                    >
                        <div className="max-w-3xl mx-auto bg-[#0B1426]/95 backdrop-blur-md border border-cyan-400/50 rounded-2xl p-3.5 sm:p-4 flex items-center justify-between gap-3 shadow-2xl shadow-cyan-950/60">
                            <div className="min-w-0">
                                <p className="text-sm font-black text-white flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-hud-pulse" />
                                    {selectedCount} Foto Dipilih
                                </p>
                                <p className="text-xs text-cyan-300 truncate mt-0.5">
                                    {discountRule?.is_active && remaining === 0
                                        ? `Diskon ${discountPct}% otomatis aktif`
                                        : discountRule?.is_active
                                          ? `Tambah ${remaining} foto lagi untuk diskon ${discountPct}%`
                                          : 'Siap dipesan ke Admin Studio'}
                                </p>
                            </div>
                            <Link
                                href="/scan-foto/keranjang"
                                className="min-h-11 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-400 to-cyan-400 hover:from-sky-300 hover:to-cyan-300 active:scale-[0.98] text-slate-950 font-black text-xs transition-all shrink-0 shadow-lg shadow-cyan-500/30"
                            >
                                <ShoppingBag className="w-4 h-4" />
                                <span>Lihat Keranjang</span>
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Pratinjau Besar (Protected Lightbox with Spring Animation) */}
            <AnimatePresence>
                {zoomPhoto && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
                        onClick={() => setZoomPhoto(null)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.92, y: 12 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.92 }}
                            transition={{ type: 'spring', stiffness: 360, damping: 28 }}
                            className="relative max-w-xl w-full bg-[#0C1425] border border-white/15 rounded-3xl overflow-hidden shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                            onContextMenu={(e) => e.preventDefault()}
                        >
                            <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10">
                                <span className="text-xs font-bold text-white truncate">{zoomPhoto.title}</span>
                                <button
                                    type="button"
                                    onClick={() => setZoomPhoto(null)}
                                    className="min-w-9 min-h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="bg-black flex items-center justify-center max-h-[65vh] overflow-hidden select-none">
                                <img
                                    src={zoomPhoto.preview_url}
                                    alt={zoomPhoto.title}
                                    draggable={false}
                                    className="max-h-[65vh] w-auto object-contain pointer-events-none"
                                />
                            </div>
                            <div className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <p className="text-[11px] text-slate-400">Harga Foto Asli</p>
                                    <p className="text-base font-black text-white">
                                        {zoomPhoto.is_unlocked ? (
                                            <span className="text-emerald-400">Sudah Dimiliki</span>
                                        ) : (
                                            formatRupiah(zoomPhoto.price)
                                        )}
                                    </p>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    {zoomPhoto.is_unlocked ? (
                                        <Link
                                            href="/scan-foto/unduhan"
                                            className="min-h-11 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs"
                                        >
                                            <Download className="w-4 h-4" />
                                            <span>Buka Unduhan</span>
                                        </Link>
                                    ) : (
                                        <>
                                            {freePhotoQuota > 0 && (
                                                <button
                                                    type="button"
                                                    disabled={claimingId === zoomPhoto.id}
                                                    onClick={() => {
                                                        setZoomPhoto(null);
                                                        handleClaimFree(zoomPhoto);
                                                    }}
                                                    className="min-h-11 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 active:scale-[0.98] text-slate-950 font-black text-xs cursor-pointer disabled:opacity-60"
                                                >
                                                    <Gift className="w-4 h-4" />
                                                    <span>Ambil Gratis (1x)</span>
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    toggleSelect(zoomPhoto.id);
                                                    setZoomPhoto(null);
                                                }}
                                                className="min-h-11 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-400 to-cyan-400 hover:from-sky-300 hover:to-cyan-300 active:scale-[0.98] text-slate-950 font-black text-xs cursor-pointer"
                                            >
                                                {zoomPhoto.in_cart ? 'Batal Pilih' : 'Pilih Foto Ini'}
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </ScanCustomerLayout>
    );
}
