import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
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

    return (
        <ScanCustomerLayout title="Foto Saya">
            <Head title="Foto Saya" />

            <div className="space-y-4 animate-fade-in">
                {/* Ringkasan Hasil */}
                <div className="bg-[#111827] border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h2 className="text-base sm:text-lg font-bold text-white">
                            Ditemukan {photos.length} Foto Anda
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                            Pilih foto yang diinginkan, lalu kirim pesanan ke Admin untuk mendapatkan file asli tanpa watermark.
                        </p>
                    </div>
                    <Link
                        href="/scan-foto"
                        className="min-h-11 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-[0.98] text-xs font-semibold text-sky-300 border border-slate-700 transition-all shrink-0"
                    >
                        <ScanFace className="w-4 h-4" />
                        <span>Scan Ulang</span>
                    </Link>
                </div>

                {/* Banner Kuota Gratis 1 Foto */}
                {freePhotoQuota > 0 ? (
                    <div className="rounded-2xl p-3.5 sm:p-4 border bg-emerald-500/10 border-emerald-500/40 text-emerald-200 text-xs sm:text-sm flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                            <Gift className="w-5 h-5 text-emerald-400 shrink-0" />
                            <div>
                                <p className="font-bold text-emerald-300">
                                    Kuota Gratis {freePhotoQuota} Foto Tersedia!
                                </p>
                                <p className="text-xs text-emerald-200/85 mt-0.5">
                                    Anda bebas memilih 1 foto mana saja di bawah ini untuk diambil GRATIS (Rp 0) dan langsung diunduh tanpa watermark.
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="rounded-2xl p-3 border bg-slate-900/70 border-slate-800 text-slate-300 text-xs flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <Gift className="w-4 h-4 text-slate-500 shrink-0" />
                            <span>
                                Kuota gratis 1 foto Anda sudah digunakan{freePhotoUsedAt ? ` pada ${freePhotoUsedAt}` : ''} dan tidak dapat mengambil foto gratis lagi.
                            </span>
                        </div>
                        <Link
                            href="/scan-foto/unduhan"
                            className="text-sky-400 hover:text-sky-300 font-semibold shrink-0"
                        >
                            Lihat Unduhan →
                        </Link>
                    </div>
                )}

                {/* Info Diskon */}
                {discountRule?.is_active && (
                    <div
                        className={`rounded-2xl p-3.5 sm:p-4 border text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                            remaining === 0 && selectedCount > 0
                                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-200'
                                : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                        }`}
                    >
                        <div className="flex items-center gap-2.5">
                            <Sparkles className="w-4 h-4 shrink-0" />
                            {remaining === 0 && selectedCount > 0 ? (
                                <span>
                                    <strong>Diskon {discountPct}% aktif!</strong> Anda sudah memilih minimal {minForDiscount} foto.
                                </span>
                            ) : (
                                <span>
                                    Pilih minimal <strong>{minForDiscount} foto</strong> untuk diskon{' '}
                                    <strong>{discountPct}%</strong>
                                    {selectedCount > 0 ? ` (tambah ${remaining} foto lagi)` : ''}.
                                </span>
                            )}
                        </div>
                        <Link
                            href="/scan-foto/keranjang"
                            className="min-h-10 inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 font-semibold text-white text-xs shrink-0"
                        >
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>Keranjang ({selectedCount})</span>
                        </Link>
                    </div>
                )}

                {photos.length === 0 ? (
                    <div className="bg-[#111827] border border-slate-800 rounded-2xl p-8 text-center space-y-3">
                        <ScanFace className="w-10 h-10 text-slate-600 mx-auto" />
                        <p className="text-sm font-bold text-white">Foto Anda belum ditemukan</p>
                        <p className="text-xs text-slate-400 max-w-xs mx-auto">
                            Coba pindai ulang wajah Anda di tempat yang cukup terang.
                        </p>
                        <Link
                            href="/scan-foto"
                            className="min-h-11 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs"
                        >
                            <span>Scan Wajah Lagi</span>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 pb-24">
                        {photos.map((photo) => {
                            const isBusy = togglingId === photo.id;
                            return (
                                <div
                                    key={photo.id}
                                    className={`bg-[#111827] rounded-2xl overflow-hidden border transition-colors flex flex-col ${
                                        photo.in_cart
                                            ? 'border-sky-400'
                                            : 'border-slate-800 hover:border-slate-700'
                                    }`}
                                >
                                    <div
                                        className="relative aspect-[3/4] bg-slate-900 overflow-hidden select-none cursor-pointer"
                                        onContextMenu={(e) => e.preventDefault()}
                                        onClick={() => setZoomPhoto(photo)}
                                    >
                                        <img
                                            src={photo.preview_url}
                                            alt={photo.title}
                                            draggable={false}
                                            loading="lazy"
                                            className="w-full h-full object-cover pointer-events-none"
                                        />
                                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/75 text-[10px] font-bold text-emerald-300">
                                            {photo.similarity_percent}% Cocok
                                        </div>
                                        {photo.is_unlocked ? (
                                            <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-emerald-500 text-[10px] font-bold text-slate-950">
                                                Terbuka
                                            </div>
                                        ) : (
                                            <div
                                                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/75 text-amber-300"
                                                title="Pesan ke Admin atau gunakan kuota gratis untuk mengunduh"
                                            >
                                                <Lock className="w-3 h-3" />
                                            </div>
                                        )}
                                        <div className="absolute bottom-2 right-2 p-1.5 rounded-full bg-black/75 text-white">
                                            <Eye className="w-3.5 h-3.5" />
                                        </div>
                                    </div>

                                    <div className="p-3 space-y-2.5 flex-1 flex flex-col justify-between">
                                        <div>
                                            <p className="text-xs font-medium text-slate-300 truncate">{photo.title}</p>
                                            <p className="text-sm font-bold text-white mt-0.5">
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
                                                className="w-full min-h-10 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 transition-all"
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
                                                            ? 'bg-sky-500 text-slate-950'
                                                            : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
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
                                                            <span>Pilih</span>
                                                        </>
                                                    )}
                                                </button>

                                                {freePhotoQuota > 0 && (
                                                    <button
                                                        type="button"
                                                        disabled={claimingId === photo.id}
                                                        onClick={() => handleClaimFree(photo)}
                                                        className="w-full min-h-10 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.97] text-slate-950 transition-all cursor-pointer disabled:opacity-60"
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

            {/* Bilah Pesanan Melayang (Rapi di atas bottom nav mobile) */}
            {selectedCount > 0 && (
                <div className="fixed bottom-18 lg:bottom-5 left-3 right-3 lg:left-72 lg:right-8 z-20 animate-fade-in">
                    <div className="max-w-3xl mx-auto bg-[#0D1320] border border-sky-500/50 rounded-2xl p-3 sm:p-4 flex items-center justify-between gap-3 shadow-lg">
                        <div className="min-w-0">
                            <p className="text-sm font-bold text-white">
                                {selectedCount} Foto Dipilih
                            </p>
                            <p className="text-xs text-sky-300 truncate">
                                {discountRule?.is_active && remaining === 0
                                    ? `Diskon ${discountPct}% otomatis aktif`
                                    : discountRule?.is_active
                                      ? `Tambah ${remaining} foto lagi untuk diskon ${discountPct}%`
                                      : 'Siap dipesan ke Admin'}
                            </p>
                        </div>
                        <Link
                            href="/scan-foto/keranjang"
                            className="min-h-11 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 active:scale-[0.98] text-slate-950 font-bold text-xs transition-all shrink-0"
                        >
                            <ShoppingBag className="w-4 h-4" />
                            <span>Lihat Keranjang</span>
                        </Link>
                    </div>
                </div>
            )}

            {/* Pratinjau Besar (Protected) */}
            {zoomPhoto && (
                <div
                    className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4"
                    onClick={() => setZoomPhoto(null)}
                >
                    <div
                        className="animate-pop-in relative max-w-xl w-full bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                        onContextMenu={(e) => e.preventDefault()}
                    >
                        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
                            <span className="text-xs font-semibold text-white truncate">{zoomPhoto.title}</span>
                            <button
                                type="button"
                                onClick={() => setZoomPhoto(null)}
                                className="min-w-9 min-h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
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
                        <div className="p-4 flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <p className="text-[11px] text-slate-400">Harga Foto Asli</p>
                                <p className="text-base font-bold text-white">
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
                                        className="min-h-11 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
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
                                                className="min-h-11 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-slate-950 font-bold text-xs cursor-pointer disabled:opacity-60"
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
                                            className="min-h-11 px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 active:scale-[0.98] text-slate-950 font-bold text-xs cursor-pointer"
                                        >
                                            {zoomPhoto.in_cart ? 'Batal Pilih' : 'Pilih Foto Ini'}
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </ScanCustomerLayout>
    );
}
