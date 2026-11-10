import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { router } from '@inertiajs/react';
import { 
    Camera, Check, CheckCircle2, Sparkles, AlertCircle, 
    Clock, Tag, Eye, X, ChevronLeft, ChevronRight, 
    Send, MessageSquare, ExternalLink, RefreshCw, ShieldAlert,
    Info, Image as ImageIcon, CheckSquare, Square
} from 'lucide-react';
import { getWhatsAppUrl } from '@/Utils/whatsapp';

function RawPhotoCard({ photo, index, isSelected, onToggle, onInspect, pricePerPhoto, priceDescription }) {
    const [loaded, setLoaded] = useState(false);

    return (
        <div 
            onClick={() => onToggle(photo.id)}
            className={`group relative rounded-2xl overflow-hidden transition-all duration-300 flex flex-col cursor-pointer border select-none ${
                isSelected 
                    ? 'bg-slate-900 border-cyan-400 dark:border-cyan-400 ring-2 ring-cyan-400/50 shadow-lg shadow-cyan-500/20 scale-[1.01]' 
                    : 'bg-white dark:bg-[#0c1220] border-slate-200 dark:border-white/10 hover:border-cyan-500/50 hover:shadow-md'
            }`}
        >
            {/* Image Preview Container with Anti-Download Protection */}
            <div 
                className="aspect-[4/3] w-full overflow-hidden relative bg-slate-950 select-none"
                onContextMenu={(e) => e.preventDefault()}
                onDragStart={(e) => e.preventDefault()}
            >
                {!loaded && (
                    <div className="absolute inset-0 bg-slate-800/80 animate-pulse flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-slate-600 animate-pulse" />
                    </div>
                )}

                {/* Compressed Preview Image */}
                <img
                    src={photo.preview_url}
                    alt={photo.original_name}
                    loading="lazy"
                    decoding="async"
                    draggable="false"
                    onLoad={() => setLoaded(true)}
                    className={`w-full h-full object-cover transition-all duration-300 pointer-events-none ${
                        loaded ? 'opacity-100' : 'opacity-0'
                    } ${isSelected ? 'brightness-105' : 'group-hover:scale-105'}`}
                />

                {/* ── MULTIPLE WATERMARK SVG OVERLAY (LANGIT CREATIVE) ── */}
                <div 
                    className="absolute inset-0 pointer-events-none select-none overflow-hidden z-10 opacity-40 mix-blend-screen"
                    aria-hidden="true"
                >
                    <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id={`wm-${photo.id}`} width="180" height="120" patternUnits="userSpaceOnUse" patternTransform="rotate(-26)">
                                <text x="10" y="35" fill="rgba(255,255,255,0.7)" fontSize="11" fontWeight="bold" letterSpacing="1">
                                    LANGIT CREATIVE
                                </text>
                                <text x="10" y="75" fill="rgba(6,182,212,0.6)" fontSize="9" fontWeight="bold" letterSpacing="1">
                                    PROOF ONLY
                                </text>
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill={`url(#wm-${photo.id})`} />
                    </svg>
                </div>

                {/* Watermark Center Badge */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    <span className="px-2.5 py-1 rounded-md bg-black/40 backdrop-blur-xs border border-white/20 text-white/80 font-mono font-extrabold text-[10px] tracking-widest uppercase rotate-[-12deg] shadow-lg">
                        Langit Creative • Proof
                    </span>
                </div>

                {/* Transparent Interaction Shield (Blocks direct image saving) */}
                <div 
                    className="absolute inset-0 z-20"
                    onContextMenu={(e) => e.preventDefault()}
                    onDragStart={(e) => e.preventDefault()}
                />

                {/* Top Badge: Selection Checkbox */}
                <div className="absolute top-2.5 left-2.5 z-30 flex items-center gap-1.5">
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                        isSelected 
                            ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/50 scale-110' 
                            : 'bg-black/60 backdrop-blur-md text-white/70 border border-white/30 group-hover:border-cyan-400'
                    }`}>
                        {isSelected ? <Check className="w-4 h-4 stroke-[3]" /> : <span className="text-[10px] font-mono">#{index + 1}</span>}
                    </div>

                    {isSelected && (
                        <span className="px-2 py-0.5 rounded-md bg-cyan-500 text-slate-950 text-[10px] font-bold font-mono shadow-xs">
                            Terpilih
                        </span>
                    )}
                </div>

                {/* Inspect Button */}
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onInspect(photo);
                    }}
                    className="absolute top-2.5 right-2.5 z-30 p-2 rounded-xl bg-black/60 hover:bg-[#005792] text-white backdrop-blur-md border border-white/20 hover:scale-110 transition-all cursor-pointer"
                    title="Pratinjau Lebih Besar"
                >
                    <Eye className="w-3.5 h-3.5" />
                </button>

                {/* Bottom Photo Metadata */}
                <span className="absolute bottom-2.5 right-2.5 z-30 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-slate-200 text-[10px] font-mono font-semibold">
                    {photo.formatted_size}
                </span>

                <span className="absolute bottom-2.5 left-2.5 z-30 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-cyan-300 text-[10px] font-mono font-bold">
                    Dilarang Unduh
                </span>
            </div>

            {/* Card Footer: Price & Name */}
            <div className="p-3 flex items-center justify-between gap-2 border-t border-slate-200/80 dark:border-white/5 bg-white dark:bg-[#0c1220]">
                <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate" title={photo.original_name}>
                        {photo.original_name}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                        <Tag className="w-3 h-3 text-cyan-600 dark:text-cyan-400 shrink-0" />
                        <span className="text-[11px] font-mono font-bold text-cyan-600 dark:text-cyan-400">
                            Rp {(photo.effective_price || pricePerPhoto || 15000).toLocaleString('id-ID')}
                        </span>
                        <span className="text-[10px] text-slate-500 font-sans hidden sm:inline">
                            / foto
                        </span>
                    </div>
                </div>

                <div className="shrink-0">
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors ${
                        isSelected 
                            ? 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30' 
                            : 'bg-slate-100 dark:bg-white/5 text-slate-500 group-hover:text-cyan-500'
                    }`}>
                        {isSelected ? '✓ Dipilih' : '+ Pilih'}
                    </span>
                </div>
            </div>
        </div>
    );
}

export default function ClientRawPhotosGallery({ client, deliveries = [], rawSelections = [] }) {
    // Deliveries with raw photos
    const rawDeliveries = useMemo(() => {
        return deliveries.filter(d => (d.raw_photos && d.raw_photos.length > 0) || (d.raw_photo_count && d.raw_photo_count > 0));
    }, [deliveries]);

    // Active delivery index/id
    const [activeDeliveryId, setActiveDeliveryId] = useState(() => {
        return rawDeliveries[0]?.id || deliveries[0]?.id || null;
    });

    const activeDelivery = useMemo(() => {
        return deliveries.find(d => d.id === activeDeliveryId) || deliveries[0] || null;
    }, [deliveries, activeDeliveryId]);

    const rawPhotos = activeDelivery?.raw_photos || [];

    // Selected photo IDs state (per active delivery)
    const [selectedIds, setSelectedIds] = useState([]);

    // Lightbox modal state for raw preview
    const [inspectPhoto, setInspectPhoto] = useState(null);

    // Confirmation submit modal
    const [submitModalOpen, setSubmitModalOpen] = useState(false);
    const [clientNote, setClientNote] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submittedSuccessData, setSubmittedSuccessData] = useState(null);

    // Delivery settings
    const pricePerPhoto = activeDelivery?.raw_price_per_photo || 15000;
    const discount5 = activeDelivery?.raw_discount_5_percent || 10;
    const discount10 = activeDelivery?.raw_discount_10_percent || 20;
    const priceDescription = activeDelivery?.raw_price_description || 'Rp 15.000 / foto';

    // Selections for this delivery
    const deliverySelections = useMemo(() => {
        return rawSelections.filter(s => s.client_delivery_id === activeDelivery?.id);
    }, [rawSelections, activeDelivery]);

    // Toggle photo selection
    const handleToggle = useCallback((photoId) => {
        setSelectedIds(prev => {
            if (prev.includes(photoId)) {
                return prev.filter(id => id !== photoId);
            } else {
                return [...prev, photoId];
            }
        });
    }, []);

    // Select all / Deselect all
    const handleSelectAll = () => {
        if (selectedIds.length === rawPhotos.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(rawPhotos.map(p => p.id));
        }
    };

    // Calculate dynamic pricing & discount
    const pricingSummary = useMemo(() => {
        const count = selectedIds.length;
        const subtotal = count * pricePerPhoto;

        let discountPercent = 0;
        let tierLabel = 'Tanpa Diskon';

        if (count >= 10 && discount10 > 0) {
            discountPercent = discount10;
            tierLabel = `Diskon Min. 10 Foto (${discount10}%)`;
        } else if (count >= 5 && discount5 > 0) {
            discountPercent = discount5;
            tierLabel = `Diskon Min. 5 Foto (${discount5}%)`;
        }

        const discountAmount = subtotal * (discountPercent / 100);
        const totalPrice = Math.max(0, subtotal - discountAmount);

        // Next tier encouragement
        let nextTierHint = null;
        if (count > 0 && count < 5 && discount5 > 0) {
            nextTierHint = `Pilih ${5 - count} foto lagi untuk mendapatkan diskon ${discount5}%!`;
        } else if (count >= 5 && count < 10 && discount10 > 0) {
            nextTierHint = `Pilih ${10 - count} foto lagi untuk naik ke diskon ${discount10}%!`;
        }

        return {
            count,
            subtotal,
            discountPercent,
            discountAmount,
            totalPrice,
            tierLabel,
            nextTierHint,
        };
    }, [selectedIds, pricePerPhoto, discount5, discount10]);

    // Handle submit to admin
    const handleSubmitSelection = () => {
        if (selectedIds.length === 0 || !activeDelivery) return;

        setIsSubmitting(true);
        router.post('/pelanggan/foto-mentahan/pilih', {
            client_delivery_id: activeDelivery.id,
            photo_ids: selectedIds,
            notes: clientNote,
        }, {
            preserveScroll: true,
            onSuccess: (page) => {
                setIsSubmitting(false);
                setSubmitModalOpen(false);
                setSubmittedSuccessData({
                    count: selectedIds.length,
                    totalPrice: pricingSummary.totalPrice,
                    subtotal: pricingSummary.subtotal,
                    discountAmount: pricingSummary.discountAmount,
                    discountPercent: pricingSummary.discountPercent,
                    albumTitle: activeDelivery.title,
                    note: clientNote,
                    selectedPhotoNames: rawPhotos
                        .filter(p => selectedIds.includes(p.id))
                        .map(p => p.original_name),
                });
                setSelectedIds([]);
                setClientNote('');
            },
            onError: () => {
                setIsSubmitting(false);
            }
        });
    };

    // Keyboard navigation in Inspect Modal
    const inspectIndex = rawPhotos.findIndex(p => p.id === inspectPhoto?.id);
    const handleInspectPrev = useCallback(() => {
        if (inspectIndex > 0) {
            setInspectPhoto(rawPhotos[inspectIndex - 1]);
        }
    }, [inspectIndex, rawPhotos]);

    const handleInspectNext = useCallback(() => {
        if (inspectIndex < rawPhotos.length - 1) {
            setInspectPhoto(rawPhotos[inspectIndex + 1]);
        }
    }, [inspectIndex, rawPhotos]);

    useEffect(() => {
        if (!inspectPhoto) return;
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') setInspectPhoto(null);
            if (e.key === 'ArrowLeft') handleInspectPrev();
            if (e.key === 'ArrowRight') handleInspectNext();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [inspectPhoto, handleInspectPrev, handleInspectNext]);

    return (
        <div className="space-y-8">
            {/* ── HEADER & PRICING RULES BANNER ── */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#005792]/15 via-sky-500/10 to-indigo-500/10 dark:from-[#005792]/30 dark:via-sky-500/15 dark:to-indigo-500/15 border border-[#005792]/20 dark:border-white/10 shadow-sm space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 border border-cyan-500/30">
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Kurasi & Pemilihan Foto Mentahan</span>
                            </span>
                        </div>
                        <h2 className="font-heading font-black text-2xl sm:text-3xl text-slate-900 dark:text-white">
                            Foto Mentahan (Proofing Gallery)
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-2xl leading-relaxed">
                            Foto pada halaman ini beresolusi terkompresi dengan multiple watermark Langit Creative untuk proses kurasi. Pilih foto favorit Anda untuk diproses oleh editor kami. Foto terpilih akan diedit dan diunggah ke menu <strong>Foto Jadi</strong>.
                        </p>
                    </div>

                    {/* Album Switcher if multiple */}
                    {deliveries.length > 1 && (
                        <div className="shrink-0">
                            <label className="text-[11px] font-mono text-slate-500 dark:text-slate-400 block mb-1">
                                Pilih Sesi / Album:
                            </label>
                            <select
                                value={activeDeliveryId || ''}
                                onChange={(e) => {
                                    setActiveDeliveryId(Number(e.target.value));
                                    setSelectedIds([]);
                                }}
                                className="px-4 py-2 rounded-xl bg-white dark:bg-[#0c1220] border border-slate-300 dark:border-white/15 text-xs font-bold text-slate-800 dark:text-white shadow-xs focus:ring-2 focus:ring-cyan-500"
                            >
                                {deliveries.map(d => (
                                    <option key={d.id} value={d.id}>
                                        {d.title} ({d.raw_photos?.length || 0} Foto Mentahan)
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                {/* Pricing & Tiered Discount Rules Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-200/80 dark:border-white/10">
                    {/* Base Price */}
                    <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-black/30 border border-slate-200/80 dark:border-white/10 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
                            <Tag className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 block uppercase">
                                Harga Satuan Foto
                            </span>
                            <span className="font-heading font-extrabold text-base text-slate-900 dark:text-white">
                                Rp {pricePerPhoto.toLocaleString('id-ID')}
                            </span>
                            <span className="text-[10px] text-slate-500 block">
                                {priceDescription}
                            </span>
                        </div>
                    </div>

                    {/* Tier 1 Discount (Min 5) */}
                    <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-black/30 border border-slate-200/80 dark:border-white/10 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 block uppercase">
                                Diskon Min. 5 Foto
                            </span>
                            <span className="font-heading font-extrabold text-base text-emerald-600 dark:text-emerald-400">
                                Diskon {discount5}%
                            </span>
                            <span className="text-[10px] text-slate-500 block">
                                Otomatis jika pilih ≥ 5 foto
                            </span>
                        </div>
                    </div>

                    {/* Tier 2 Discount (Min 10) */}
                    <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-black/30 border border-slate-200/80 dark:border-white/10 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 block uppercase">
                                Diskon Min. 10 Foto
                            </span>
                            <span className="font-heading font-extrabold text-base text-indigo-600 dark:text-indigo-400">
                                Diskon {discount10}%
                            </span>
                            <span className="text-[10px] text-slate-500 block">
                                Hemat maksimal jika pilih ≥ 10 foto
                            </span>
                        </div>
                    </div>
                </div>

                {activeDelivery?.raw_notes && (
                    <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-200 text-xs flex items-start gap-2.5">
                        <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                        <div>
                            <strong>Catatan Fotografer:</strong> {activeDelivery.raw_notes}
                        </div>
                    </div>
                )}
            </div>

            {/* ── RIWAYAT PENGAJUAN PILIHAN YANG SUDAH TERKIRIM KE ADMIN ── */}
            {deliverySelections.length > 0 && (
                <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#090D16] border border-slate-200/90 dark:border-white/10 shadow-sm space-y-4">
                    <div className="flex items-center justify-between gap-2 border-b border-slate-200 dark:border-white/10 pb-3">
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                            <h3 className="font-heading font-bold text-sm text-slate-900 dark:text-white">
                                Riwayat Pilihan Foto Terkirim ({deliverySelections.length} Pengajuan)
                            </h3>
                        </div>
                        <span className="text-[11px] font-mono text-slate-500">
                            Status Terkini dari Admin
                        </span>
                    </div>

                    <div className="space-y-3">
                        {deliverySelections.map((sel) => (
                            <div 
                                key={sel.id} 
                                className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                            >
                                <div className="space-y-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="font-bold text-xs text-slate-900 dark:text-white">
                                            {sel.total_photos} Foto Mentahan Terpilih
                                        </span>
                                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${sel.status_badge_color}`}>
                                            ● {sel.status_label}
                                        </span>
                                    </div>
                                    <div className="text-[11px] font-mono text-slate-500 flex flex-wrap items-center gap-x-3 gap-y-1">
                                        <span>Dikirim: {new Date(sel.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                        <span>Subtotal: Rp {Number(sel.subtotal).toLocaleString('id-ID')}</span>
                                        {sel.discount_percent > 0 && (
                                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                                                Diskon {sel.discount_percent}% (-Rp {Number(sel.discount_amount).toLocaleString('id-ID')})
                                            </span>
                                        )}
                                        <span className="text-slate-900 dark:text-white font-bold">
                                            Total: Rp {Number(sel.total_price).toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                    {sel.notes && (
                                        <p className="text-xs text-slate-600 dark:text-slate-400 italic">
                                            "Catatan Anda: {sel.notes}"
                                        </p>
                                    )}
                                    {sel.admin_notes && (
                                        <div className="mt-1.5 p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-800 dark:text-cyan-300 text-xs">
                                            <strong>Tanggapan Admin:</strong> {sel.admin_notes}
                                        </div>
                                    )}
                                </div>

                                <div className="shrink-0 flex items-center gap-2">
                                    <a
                                        href={getWhatsAppUrl('client-delivery', {
                                            clientName: client?.name || '',
                                            title: activeDelivery?.title || 'Foto Mentahan',
                                            details: `Konfirmasi pengajuan pilihan ${sel.total_photos} foto mentahan (Total: Rp ${Number(sel.total_price).toLocaleString('id-ID')})`
                                        })}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
                                    >
                                        <MessageSquare className="w-3.5 h-3.5" />
                                        <span>Chat Admin</span>
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── PHOTO GRID / EMPTY STATE ── */}
            {rawPhotos.length === 0 ? (
                <div className="text-center py-20 rounded-3xl bg-white dark:bg-[#090D16] border border-slate-200 dark:border-white/10 p-8 shadow-sm">
                    <Camera className="w-12 h-12 text-slate-400 mx-auto mb-3 opacity-60" />
                    <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white">
                        Belum Ada Foto Mentahan yang Diunggah
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                        Admin Studio Langit sedang mempersiapkan file foto mentahan untuk sesi ini. Silakan hubungi admin jika sesi foto Anda telah selesai.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Controls Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-[#090D16] border border-slate-200/80 dark:border-white/10">
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={handleSelectAll}
                                className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                                {selectedIds.length === rawPhotos.length ? (
                                    <>
                                        <CheckSquare className="w-3.5 h-3.5 text-cyan-500" />
                                        <span>Batalkan Pilih Semua</span>
                                    </>
                                ) : (
                                    <>
                                        <Square className="w-3.5 h-3.5" />
                                        <span>Pilih Semua ({rawPhotos.length} Foto)</span>
                                    </>
                                )}
                            </button>

                            <span className="text-xs font-mono text-slate-500">
                                {selectedIds.length} dari {rawPhotos.length} foto dipilih
                            </span>
                        </div>

                        <div className="text-xs font-mono text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-500/10 px-3 py-1 rounded-xl border border-cyan-500/20">
                            🛡️ Watermark & Anti-Download Aktif
                        </div>
                    </div>

                    {/* Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 pb-24">
                        {rawPhotos.map((photo, idx) => (
                            <RawPhotoCard
                                key={photo.id}
                                photo={photo}
                                index={idx}
                                isSelected={selectedIds.includes(photo.id)}
                                onToggle={handleToggle}
                                onInspect={(p) => setInspectPhoto(p)}
                                pricePerPhoto={pricePerPhoto}
                                priceDescription={priceDescription}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* ── STICKY BOTTOM SELECTION SUMMARY BAR ── */}
            {selectedIds.length > 0 && (
                <div className="fixed bottom-4 left-4 right-4 md:left-72 md:right-8 z-40">
                    <div className="max-w-5xl mx-auto p-4 sm:p-5 rounded-3xl bg-slate-900/95 dark:bg-[#070b14]/95 text-white backdrop-blur-xl border border-cyan-500/40 shadow-2xl shadow-cyan-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-cyan-500 text-slate-950 font-heading font-black text-lg flex items-center justify-center shrink-0 shadow-lg shadow-cyan-500/30">
                                {pricingSummary.count}
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h4 className="font-heading font-extrabold text-base leading-tight">
                                        {pricingSummary.count} Foto Terpilih
                                    </h4>
                                    {pricingSummary.discountPercent > 0 && (
                                        <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-mono font-extrabold">
                                            HEMAT {pricingSummary.discountPercent}%
                                        </span>
                                    )}
                                </div>

                                <div className="text-xs text-slate-300 font-mono mt-0.5 flex flex-wrap items-center gap-x-2">
                                    <span>Subtotal: Rp {pricingSummary.subtotal.toLocaleString('id-ID')}</span>
                                    {pricingSummary.discountAmount > 0 && (
                                        <span className="text-emerald-400 font-bold">
                                            -Rp {pricingSummary.discountAmount.toLocaleString('id-ID')}
                                        </span>
                                    )}
                                    <span className="text-white font-extrabold text-sm text-cyan-400">
                                        Total: Rp {pricingSummary.totalPrice.toLocaleString('id-ID')}
                                    </span>
                                </div>

                                {pricingSummary.nextTierHint && (
                                    <p className="text-[11px] text-amber-300 font-semibold mt-1 animate-pulse">
                                        💡 {pricingSummary.nextTierHint}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                            <button
                                type="button"
                                onClick={() => setSelectedIds([])}
                                className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                            >
                                Reset
                            </button>

                            <button
                                type="button"
                                onClick={() => setSubmitModalOpen(true)}
                                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 text-slate-950 font-heading font-black text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                            >
                                <Send className="w-4 h-4" />
                                <span>Kirim Pilihan ke Admin</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── SUBMIT SELECTION CONFIRMATION MODAL ── */}
            {submitModalOpen && (
                <div 
                    className="fixed inset-0 h-dvh overflow-y-auto overscroll-contain z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
                    onClick={() => setSubmitModalOpen(false)}
                >
                    <div 
                        className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#0c1220] border border-slate-200 dark:border-white/10 p-6 sm:p-7 shadow-2xl space-y-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
                            <div className="flex items-center gap-2.5">
                                <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                                    <Send className="w-5 h-5" />
                                </span>
                                <div>
                                    <h3 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white">
                                        Konfirmasi Pilihan Foto
                                    </h3>
                                    <span className="text-[11px] font-mono text-slate-500">
                                        {activeDelivery?.title}
                                    </span>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSubmitModalOpen(false)}
                                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Cost Breakdown */}
                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/10 space-y-2 text-xs font-mono">
                            <div className="flex justify-between text-slate-600 dark:text-slate-400">
                                <span>Jumlah Foto Dipilih:</span>
                                <span className="font-bold text-slate-900 dark:text-white">{pricingSummary.count} Foto</span>
                            </div>
                            <div className="flex justify-between text-slate-600 dark:text-slate-400">
                                <span>Harga Satuan:</span>
                                <span>Rp {pricePerPhoto.toLocaleString('id-ID')}</span>
                            </div>
                            <div className="flex justify-between text-slate-600 dark:text-slate-400">
                                <span>Subtotal:</span>
                                <span>Rp {pricingSummary.subtotal.toLocaleString('id-ID')}</span>
                            </div>
                            {pricingSummary.discountPercent > 0 && (
                                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold border-t border-slate-200 dark:border-white/10 pt-1.5">
                                    <span>Diskon ({pricingSummary.discountPercent}%):</span>
                                    <span>-Rp {pricingSummary.discountAmount.toLocaleString('id-ID')}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-sm font-bold text-slate-900 dark:text-white border-t border-slate-200 dark:border-white/10 pt-2">
                                <span>Total Pembayaran:</span>
                                <span className="text-cyan-600 dark:text-cyan-400 font-extrabold">
                                    Rp {pricingSummary.totalPrice.toLocaleString('id-ID')}
                                </span>
                            </div>
                        </div>

                        {/* Optional Client Notes Input */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                                Catatan Tambahan untuk Editor / Admin (Opsional):
                            </label>
                            <textarea
                                rows={3}
                                value={clientNote}
                                onChange={(e) => setClientNote(e.target.value)}
                                placeholder="Contoh: Tolong edit tone agak hangat/warm, hapus bekas noda di foto #3, dll..."
                                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/10 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                            />
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setSubmitModalOpen(false)}
                                disabled={isSubmitting}
                                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300 text-xs font-semibold cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmitSelection}
                                disabled={isSubmitting}
                                className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/25 cursor-pointer disabled:opacity-50"
                            >
                                {isSubmitting ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                        <span>Mengirim Pilihan...</span>
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-4 h-4 stroke-[3]" />
                                        <span>Konfirmasi & Kirim ke Admin</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── SUCCESS NOTIFICATION & WHATSAPP POPUP ── */}
            {submittedSuccessData && (
                <div 
                    className="fixed inset-0 h-dvh overflow-y-auto overscroll-contain z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
                    onClick={() => setSubmittedSuccessData(null)}
                >
                    <div 
                        className="w-full max-w-md rounded-3xl bg-white dark:bg-[#0c1220] border border-slate-200 dark:border-white/10 p-6 sm:p-7 shadow-2xl text-center space-y-5"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                            <CheckCircle2 className="w-9 h-9" />
                        </div>

                        <div>
                            <h3 className="font-heading font-black text-xl text-slate-900 dark:text-white">
                                Pilihan Berhasil Dikirim!
                            </h3>
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                                {submittedSuccessData.count} foto mentahan pilihan Anda telah diterima oleh Admin Studio Langit. Tim editor akan segera meninjau dan memulai proses editing.
                            </p>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 text-xs font-mono text-left space-y-1">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Total Foto:</span>
                                <span className="font-bold text-slate-900 dark:text-white">{submittedSuccessData.count} Foto</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Total Biaya:</span>
                                <span className="font-extrabold text-cyan-600 dark:text-cyan-400">
                                    Rp {submittedSuccessData.totalPrice.toLocaleString('id-ID')}
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2.5">
                            <a
                                href={getWhatsAppUrl('client-delivery', {
                                    clientName: client?.name || '',
                                    title: submittedSuccessData.albumTitle,
                                    details: `Telah memilih ${submittedSuccessData.count} foto mentahan (Total: Rp ${submittedSuccessData.totalPrice.toLocaleString('id-ID')}). Mohon dicek. Terima kasih.`
                                })}
                                target="_blank"
                                rel="noreferrer"
                                onClick={() => setSubmittedSuccessData(null)}
                                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition-all hover:scale-[1.02]"
                            >
                                <MessageSquare className="w-4 h-4" />
                                <span>Konfirmasi ke Admin via WhatsApp</span>
                            </a>

                            <button
                                type="button"
                                onClick={() => setSubmittedSuccessData(null)}
                                className="w-full py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300 text-xs font-semibold"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── LIGHTBOX INSPECT MODAL FOR RAW PHOTOS (STRICTLY NO DOWNLOAD) ── */}
            {inspectPhoto && (
                <div 
                    className="fixed inset-0 h-dvh overflow-y-auto overscroll-contain z-[70] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-between p-3 sm:p-6 select-none"
                    onClick={() => setInspectPhoto(null)}
                    onContextMenu={(e) => e.preventDefault()}
                >
                    {/* Top Control Bar */}
                    <div 
                        className="w-full max-w-6xl shrink-0 flex flex-wrap items-center justify-between gap-3 text-white pb-3 border-b border-white/10 z-10"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center gap-2.5">
                            <span className="px-2.5 py-1 rounded-md bg-cyan-500/20 text-cyan-400 font-mono text-xs font-bold border border-cyan-500/30">
                                #{inspectIndex + 1} dari {rawPhotos.length}
                            </span>
                            <span className="font-mono text-xs text-slate-300 truncate max-w-xs sm:max-w-md">
                                {inspectPhoto.original_name}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => handleToggle(inspectPhoto.id)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                                    selectedIds.includes(inspectPhoto.id)
                                        ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/40'
                                        : 'bg-white/20 hover:bg-white/30 text-white'
                                }`}
                            >
                                <Check className="w-4 h-4 stroke-[3]" />
                                <span>{selectedIds.includes(inspectPhoto.id) ? 'Foto Terpilih' : 'Pilih Foto Ini'}</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setInspectPhoto(null)}
                                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                                title="Tutup (Esc)"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Central Image View with Baked + SVG Watermark Overlay */}
                    <div 
                        className="relative w-full max-w-6xl flex-1 min-h-0 flex items-center justify-center my-3 overflow-hidden select-none"
                        onClick={(e) => e.stopPropagation()}
                        onContextMenu={(e) => e.preventDefault()}
                        onDragStart={(e) => e.preventDefault()}
                    >
                        {/* Prev Button */}
                        {inspectIndex > 0 && (
                            <button
                                type="button"
                                onClick={handleInspectPrev}
                                className="absolute left-2 sm:left-4 z-30 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 hover:scale-110 transition-all cursor-pointer"
                                title="Foto Sebelumnya"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                        )}

                        {/* Next Button */}
                        {inspectIndex < rawPhotos.length - 1 && (
                            <button
                                type="button"
                                onClick={handleInspectNext}
                                className="absolute right-2 sm:right-4 z-30 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 hover:scale-110 transition-all cursor-pointer"
                                title="Foto Selanjutnya"
                            >
                                <ChevronRight className="w-6 h-6" />
                            </button>
                        )}

                        {/* Image */}
                        <div className="relative max-w-full max-h-full flex items-center justify-center">
                            <img
                                src={inspectPhoto.preview_url}
                                alt={inspectPhoto.original_name}
                                draggable="false"
                                className="max-w-full max-h-[78vh] object-contain rounded-xl shadow-2xl pointer-events-none"
                            />

                            {/* Multiple Watermarks on Lightbox */}
                            <div 
                                className="absolute inset-0 pointer-events-none select-none overflow-hidden z-10 opacity-35 mix-blend-screen"
                                aria-hidden="true"
                            >
                                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                                    <defs>
                                        <pattern id={`wm-inspect-${inspectPhoto.id}`} width="220" height="150" patternUnits="userSpaceOnUse" patternTransform="rotate(-26)">
                                            <text x="15" y="45" fill="rgba(255,255,255,0.7)" fontSize="14" fontWeight="bold" letterSpacing="1.5">
                                                LANGIT CREATIVE
                                            </text>
                                            <text x="15" y="95" fill="rgba(6,182,212,0.6)" fontSize="11" fontWeight="bold" letterSpacing="1.5">
                                                FOTO MENTAHAN • PROOF ONLY
                                            </text>
                                        </pattern>
                                    </defs>
                                    <rect width="100%" height="100%" fill={`url(#wm-inspect-${inspectPhoto.id})`} />
                                </svg>
                            </div>

                            {/* Transparent click blocker */}
                            <div 
                                className="absolute inset-0 z-20"
                                onContextMenu={(e) => e.preventDefault()}
                                onDragStart={(e) => e.preventDefault()}
                            />
                        </div>
                    </div>

                    {/* Bottom Status (Notice No Download Option) */}
                    <div 
                        className="w-full max-w-6xl shrink-0 flex items-center justify-between text-xs text-slate-400 font-mono pt-3 border-t border-white/10"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center gap-2 text-cyan-400">
                            <ShieldAlert className="w-4 h-4" />
                            <span>Foto mentahan dilindungi hak cipta watermark & tidak tersedia untuk diunduh.</span>
                        </div>
                        <div>
                            Harga: Rp {(inspectPhoto.effective_price || pricePerPhoto).toLocaleString('id-ID')}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
