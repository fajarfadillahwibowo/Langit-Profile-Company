import React, { useRef, useState } from 'react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import ScanCustomerLayout from '@/Layouts/ScanCustomerLayout';
import {
    Trash2,
    Send,
    Percent,
    ArrowLeft,
    Loader2,
    ShoppingBag,
    QrCode,
    Building2,
    Copy,
    Check,
    Upload,
    Image as ImageIcon,
    X,
    ZoomIn,
    Download,
    AlertCircle,
    MessageCircle,
} from 'lucide-react';

function formatRupiah(num) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(num || 0);
}

function formatBytes(bytes) {
    if (!bytes) return '0 B';
    if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(2)} MB`;
    return `${Math.round(bytes / 1024)} KB`;
}

const MAX_PROOF_BYTES = 5 * 1024 * 1024; // 5 MB

export default function Cart({ selectedPhotos, pricing, discountRule }) {
    const { auth } = usePage().props;
    const qrisImageUrl = discountRule?.qris_image_url || '/images/qris-sample.svg';
    const bankName = discountRule?.bank_name || 'BRI';
    const bankAccountNumber = discountRule?.bank_account_number || '0123-01-045678-53-9';
    const bankAccountHolder = discountRule?.bank_account_holder || 'Langit Creative Studio';
    const adminWaClean = (discountRule?.admin_whatsapp || '6282246142791').replace(/\D/g, '');
    const adminWa = adminWaClean.startsWith('0') ? `62${adminWaClean.slice(1)}` : adminWaClean;
    const defaultMethod = 'qris';

    const { data, setData, post, processing, errors } = useForm({
        payment_method: defaultMethod,
        whatsapp_number: auth?.user?.whatsapp_number || '',
        customer_notes: 'Saya sudah membayar lewat QRIS.',
        payment_proof: null,
    });

    const [copiedRek, setCopiedRek] = useState(false);
    const [copiedTotal, setCopiedTotal] = useState(false);
    const [proofPreview, setProofPreview] = useState(null);
    const [proofError, setProofError] = useState('');
    const [qrisZoomOpen, setQrisZoomOpen] = useState(false);
    const proofInputRef = useRef(null);

    const removePhoto = (photoId) => {
        router.post('/scan-foto/keranjang/toggle', { photo_id: photoId }, { preserveScroll: true });
    };

    const handleSelectMethod = (method) => {
        const defaultQrisMsg = 'Saya sudah membayar lewat QRIS.';
        const defaultBankMsg = 'Saya sudah transfer ke rekening bank.';
        const current = (data.customer_notes || '').trim();
        const shouldSwapDefault = current === '' || current === defaultQrisMsg || current === defaultBankMsg;

        setData((prev) => ({
            ...prev,
            payment_method: method,
            customer_notes: shouldSwapDefault
                ? method === 'qris'
                    ? defaultQrisMsg
                    : defaultBankMsg
                : prev.customer_notes,
        }));
    };

    const handleCopyText = async (text, setter) => {
        if (!text) return;
        try {
            await navigator.clipboard.writeText(String(text));
            setter(true);
            setTimeout(() => setter(false), 2000);
        } catch {
            // Abaikan jika browser memblokir clipboard
        }
    };

    const handleProofFileChange = (file) => {
        setProofError('');
        if (!file) {
            setData('payment_proof', null);
            setProofPreview(null);
            return;
        }

        if (file.size > MAX_PROOF_BYTES) {
            setProofError('Ukuran file maksimal 5 MB.');
            setData('payment_proof', null);
            setProofPreview(null);
            if (proofInputRef.current) proofInputRef.current.value = '';
            return;
        }

        setData('payment_proof', file);
        if (file.type && file.type.startsWith('image/') && file.type !== 'image/heic' && file.type !== 'image/heif') {
            const reader = new FileReader();
            reader.onload = (ev) => setProofPreview(ev.target.result);
            reader.readAsDataURL(file);
        } else {
            setProofPreview(null);
        }
    };

    const clearProof = () => {
        setData('payment_proof', null);
        setProofPreview(null);
        setProofError('');
        if (proofInputRef.current) proofInputRef.current.value = '';
    };

    const submitOrder = (e) => {
        e.preventDefault();
        if (!data.payment_proof) {
            setProofError('Unggah bukti foto pembayaran terlebih dahulu (maks 5 MB).');
            return;
        }
        post('/scan-foto/pesanan', {
            forceFormData: true,
        });
    };

    const minForDiscount = discountRule?.min_photos_selected || 5;
    const discountProgress = Math.min(100, Math.round(((pricing?.count || 0) / Math.max(1, minForDiscount)) * 100));

    return (
        <ScanCustomerLayout title="Keranjang">
            <Head title="Keranjang" />

            <div className="space-y-5">
                <Link
                    href="/scan-foto/hasil"
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-bold text-cyan-300 transition-colors"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Kembali ke Foto Saya</span>
                </Link>

                {selectedPhotos.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-[#0B1222]/95 border border-white/10 rounded-3xl p-10 text-center space-y-3"
                    >
                        <div className="w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-400/25 flex items-center justify-center mx-auto">
                            <ShoppingBag className="w-8 h-8 text-sky-400" />
                        </div>
                        <p className="font-heading text-base font-bold text-white">Keranjang kosong</p>
                        <p className="text-xs text-slate-400 max-w-xs mx-auto">
                            Pilih foto dari galeri hasil scan Anda.
                        </p>
                        <Link
                            href="/scan-foto/hasil"
                            className="min-h-11 inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-sky-400 to-cyan-400 hover:from-sky-300 hover:to-cyan-300 text-slate-950 font-black text-xs shadow-lg shadow-sky-500/25"
                        >
                            <span>Pilih Foto</span>
                        </Link>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                        {/* Kiri: Daftar Foto Pilihan */}
                        <div className="lg:col-span-7 space-y-4">
                            {discountRule?.is_active && (
                                <motion.div
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`p-4 rounded-2xl border text-xs sm:text-sm space-y-2.5 ${
                                        pricing.qualifiesDiscount
                                            ? 'bg-emerald-500/12 border-emerald-400/40 text-emerald-200'
                                            : 'bg-amber-500/10 border-amber-400/30 text-amber-100'
                                    }`}
                                >
                                    <div className="flex items-center gap-2.5">
                                        <Percent className="w-4 h-4 shrink-0" />
                                        {pricing.qualifiesDiscount ? (
                                            <span>
                                                <strong>Diskon {discountRule.discount_percentage}% aktif!</strong> Total{' '}
                                                {pricing.count} foto dipilih.
                                            </span>
                                        ) : (
                                            <span>
                                                Tambah <strong>{pricing.remainingForDiscount} foto lagi</strong> untuk diskon{' '}
                                                <strong>{discountRule.discount_percentage}%</strong>.
                                            </span>
                                        )}
                                    </div>
                                    <div className="h-1.5 rounded-full bg-black/30 overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${discountProgress}%` }}
                                            transition={{ duration: 0.4 }}
                                            className={`h-full rounded-full ${
                                                pricing.qualifiesDiscount
                                                    ? 'bg-gradient-to-r from-emerald-400 to-cyan-400'
                                                    : 'bg-gradient-to-r from-amber-400 to-orange-400'
                                            }`}
                                        />
                                    </div>
                                </motion.div>
                            )}

                            <div className="bg-[#0B1222]/95 border border-white/10 rounded-3xl divide-y divide-white/8 shadow-xl shadow-black/30">
                                {selectedPhotos.map((photo, idx) => (
                                    <motion.div
                                        key={photo.id}
                                        initial={{ opacity: 0, x: -8 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: Math.min(idx * 0.03, 0.25) }}
                                        className="p-4 flex items-center justify-between gap-3 hover:bg-white/[0.03] transition-colors"
                                    >
                                        <div className="flex items-center gap-3.5 min-w-0">
                                            <img
                                                src={photo.preview_url}
                                                alt={photo.title}
                                                className="w-15 h-15 rounded-2xl object-cover bg-slate-950 border border-white/10 shrink-0"
                                            />
                                            <div className="min-w-0">
                                                <p className="text-xs sm:text-sm font-bold text-white truncate">{photo.title}</p>
                                                <p className="text-sm font-black text-cyan-400 mt-0.5">
                                                    {formatRupiah(photo.price)}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removePhoto(photo.id)}
                                            className="min-w-10 min-h-10 flex items-center justify-center rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 active:scale-95 text-rose-400 transition-all cursor-pointer shrink-0"
                                            aria-label="Hapus foto"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Kanan: Pembayaran QRIS / Rekening Bank + Upload Bukti + Pesan ke Admin */}
                        <motion.form
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            onSubmit={submitOrder}
                            className="lg:col-span-5 bg-[#0B1222]/95 border border-sky-400/25 rounded-3xl p-5 sm:p-6 space-y-4 h-fit shadow-2xl shadow-sky-950/30"
                        >
                            <h3 className="font-heading text-base font-black text-white border-b border-white/10 pb-3">
                                Pembayaran & Konfirmasi
                            </h3>

                            {/* Ringkasan Nominal */}
                            <div className="space-y-2 text-xs sm:text-sm">
                                <div className="flex justify-between text-slate-300">
                                    <span>Subtotal ({pricing.count} foto)</span>
                                    <span className="font-semibold text-white">{formatRupiah(pricing.subtotal)}</span>
                                </div>
                                {pricing.qualifiesDiscount && (
                                    <div className="flex justify-between text-emerald-400">
                                        <span>Diskon ({pricing.discountPercentApplied}%)</span>
                                        <span className="font-bold">-{formatRupiah(pricing.discountAmount)}</span>
                                    </div>
                                )}
                                <div className="flex items-center justify-between pt-3 border-t border-white/10">
                                    <span className="text-sm font-black text-white">Total Bayar</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-cyan-300">
                                            {formatRupiah(pricing.finalTotal)}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => handleCopyText(Math.round(pricing.finalTotal || 0), setCopiedTotal)}
                                            className="px-2 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-[10px] font-bold text-cyan-300 inline-flex items-center gap-1 cursor-pointer"
                                            title="Salin nominal"
                                        >
                                            {copiedTotal ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                            <span>{copiedTotal ? 'Disalin' : 'Salin'}</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Pilih Metode Bayar: QRIS atau Rekening Bank */}
                            <div className="space-y-3 pt-1">
                                <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300">
                                    1. Pilih Metode Bayar
                                </p>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => handleSelectMethod('qris')}
                                        className={`min-h-11 px-3 py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                                            data.payment_method === 'qris'
                                                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-sm shadow-cyan-500/20'
                                                : 'bg-[#060B15] border-white/10 text-slate-400 hover:border-white/20 hover:text-white'
                                        }`}
                                    >
                                        <QrCode className="w-4 h-4 shrink-0" />
                                        <span>QRIS</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleSelectMethod('bank_transfer')}
                                        className={`min-h-11 px-3 py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                                            data.payment_method === 'bank_transfer'
                                                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-sm shadow-cyan-500/20'
                                                : 'bg-[#060B15] border-white/10 text-slate-400 hover:border-white/20 hover:text-white'
                                        }`}
                                    >
                                        <Building2 className="w-4 h-4 shrink-0" />
                                        <span>Rekening Bank</span>
                                    </button>
                                </div>
                                {errors.payment_method && (
                                    <p className="text-xs text-rose-400">{errors.payment_method}</p>
                                )}

                                {/* Panel QRIS */}
                                {data.payment_method === 'qris' && (
                                    <div className="p-4 rounded-2xl bg-[#060B15] border border-white/10 space-y-3 text-center">
                                        <div
                                            onClick={() => setQrisZoomOpen(true)}
                                            className="relative inline-block mx-auto bg-white p-2.5 rounded-2xl cursor-pointer group"
                                        >
                                            <img
                                                src={qrisImageUrl}
                                                alt="QRIS Pembayaran"
                                                className="w-48 h-48 sm:w-52 sm:h-52 object-contain rounded-xl"
                                            />
                                            <div className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <span className="px-2.5 py-1 rounded-full bg-black/80 text-white text-[11px] font-bold inline-flex items-center gap-1">
                                                    <ZoomIn className="w-3.5 h-3.5" /> Perbesar
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setQrisZoomOpen(true)}
                                                className="px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-[11px] font-semibold text-cyan-300 inline-flex items-center gap-1.5 cursor-pointer"
                                            >
                                                <ZoomIn className="w-3.5 h-3.5" />
                                                <span>Perbesar</span>
                                            </button>
                                            <a
                                                href={qrisImageUrl}
                                                download="QRIS-Langit-Studio"
                                                className="px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-[11px] font-semibold text-slate-200 inline-flex items-center gap-1.5"
                                            >
                                                <Download className="w-3.5 h-3.5" />
                                                <span>Simpan QRIS</span>
                                            </a>
                                        </div>
                                        <p className="text-[11px] text-slate-400">
                                            Scan QRIS lalu bayar sesuai total, kemudian unggah bukti foto di bawah.
                                        </p>
                                    </div>
                                )}

                                {/* Panel Transfer Rekening Bank */}
                                {data.payment_method === 'bank_transfer' && (
                                    <div className="p-4 rounded-2xl bg-[#060B15] border border-white/10 space-y-2.5 text-xs">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-slate-400">Bank</span>
                                            <span className="font-bold text-white">{bankName}</span>
                                        </div>
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-slate-400">No. Rekening</span>
                                            <div className="flex items-center gap-1.5">
                                                <span className="font-mono font-black text-cyan-300 text-sm">
                                                    {bankAccountNumber}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleCopyText(bankAccountNumber.replace(/[^0-9]/g, ''), setCopiedRek)}
                                                    className="px-2 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/30 text-[10px] font-bold text-cyan-200 inline-flex items-center gap-1 cursor-pointer"
                                                >
                                                    {copiedRek ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                                    <span>{copiedRek ? 'Disalin' : 'Salin'}</span>
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-slate-400">Atas Nama</span>
                                            <span className="font-semibold text-white">{bankAccountHolder}</span>
                                        </div>
                                        <p className="pt-2 border-t border-white/10 text-[11px] text-slate-400 leading-relaxed">
                                            Transfer sesuai total, lalu unggah bukti foto pembayaran langsung di bawah ini.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Langkah 2: Upload Bukti Foto Pembayaran (Wajib, Maks 5 MB) */}
                            <div className="space-y-2 pt-1">
                                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300">
                                    2. Bukti Foto Pembayaran (Wajib • Maks 5 MB)
                                </label>
                                <input
                                    ref={proofInputRef}
                                    type="file"
                                    accept="image/*,.heic,.heif,.avif,.tif,.tiff,.bmp,.webp,.jfif,.raw,.dng"
                                    onChange={(e) => handleProofFileChange(e.target.files?.[0] || null)}
                                    className="hidden"
                                />

                                {data.payment_proof ? (
                                    <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-400/35 space-y-2.5">
                                        {proofPreview && (
                                            <img
                                                src={proofPreview}
                                                alt="Preview Bukti Bayar"
                                                className="w-full max-h-48 object-contain rounded-xl bg-black/40 border border-white/10"
                                            />
                                        )}
                                        <div className="flex items-center justify-between gap-2 text-xs">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <ImageIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                                                <div className="min-w-0">
                                                    <p className="font-semibold text-white truncate">{data.payment_proof.name}</p>
                                                    <p className="text-[11px] text-emerald-300">{formatBytes(data.payment_proof.size)}</p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={clearProof}
                                                className="p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 cursor-pointer shrink-0"
                                                title="Ganti file"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => proofInputRef.current?.click()}
                                        className="w-full p-4 rounded-2xl border-2 border-dashed border-white/15 hover:border-cyan-400/60 bg-[#060B15] hover:bg-cyan-500/[0.04] text-center space-y-1.5 transition-colors cursor-pointer"
                                    >
                                        <Upload className="w-6 h-6 text-cyan-400 mx-auto" />
                                        <p className="text-xs font-bold text-white">Pilih Foto Bukti Pembayaran</p>
                                        <p className="text-[11px] text-slate-400">
                                            Bebas format foto apa saja • Maksimal 5 MB
                                        </p>
                                    </button>
                                )}

                                {(proofError || errors.payment_proof) && (
                                    <p className="text-xs text-rose-400 flex items-center gap-1.5">
                                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                        <span>{proofError || errors.payment_proof}</span>
                                    </p>
                                )}
                            </div>

                            {/* Langkah 3: Nomor WA & Pesan Konfirmasi ke Admin */}
                            <div>
                                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                                    Nomor WhatsApp
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={data.whatsapp_number}
                                    onChange={(e) => setData('whatsapp_number', e.target.value)}
                                    placeholder="081234567890"
                                    className="w-full min-h-11 px-3.5 py-2.5 rounded-xl bg-[#060B15] border border-white/12 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/30 focus:border-cyan-400 transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                                    3. Pesan ke Admin (Konfirmasi Sudah Bayar)
                                </label>
                                <textarea
                                    rows={2}
                                    required
                                    value={data.customer_notes}
                                    onChange={(e) => setData('customer_notes', e.target.value)}
                                    placeholder="Contoh: Saya sudah membayar via QRIS / BCA atas nama..."
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#060B15] border border-white/12 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/30 focus:border-cyan-400 transition-all"
                                />
                                {errors.customer_notes && (
                                    <p className="text-xs text-rose-400 mt-1">{errors.customer_notes}</p>
                                )}
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={processing}
                                className="w-full min-h-12 py-3 px-4 rounded-2xl bg-gradient-to-r from-sky-400 via-cyan-400 to-sky-500 hover:from-sky-300 hover:to-cyan-300 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/30 transition-all cursor-pointer disabled:opacity-60"
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Mengirim Bukti...</span>
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4" />
                                        <span>Kirim Bukti & Pesan ke Admin</span>
                                    </>
                                )}
                            </motion.button>

                            {adminWa && (
                                <div className="pt-3 border-t border-white/10 space-y-2 text-center">
                                    <p className="text-[11px] text-slate-400">
                                        Ada yang bingung? Hubungi admin langsung:
                                    </p>
                                    <a
                                        href={`https://wa.me/${adminWa}?text=${encodeURIComponent(
                                            `Halo Admin LangitCreative, saya ingin bertanya terkait pembayaran foto di LangitLens (${pricing.count} foto, Total ${formatRupiah(pricing.finalTotal)}).`
                                        )}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="w-full min-h-10 py-2 px-4 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-400/35 text-emerald-300 font-bold text-xs inline-flex items-center justify-center gap-2 transition-colors"
                                    >
                                        <MessageCircle className="w-4 h-4" />
                                        <span>WhatsApp Admin LangitCreative</span>
                                    </a>
                                </div>
                            )}
                        </motion.form>
                    </div>
                )}
            </div>

            {/* Modal Perbesar QRIS */}
            {qrisZoomOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4"
                    onClick={() => setQrisZoomOpen(false)}
                >
                    <div
                        className="w-full max-w-sm rounded-3xl bg-[#0B1222] border border-white/15 p-5 space-y-4 text-center shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-white">Scan QRIS</span>
                            <button
                                type="button"
                                onClick={() => setQrisZoomOpen(false)}
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="bg-white p-3 rounded-2xl">
                            <img
                                src={qrisImageUrl}
                                alt="QRIS Pembayaran"
                                className="w-full max-h-80 object-contain mx-auto"
                            />
                        </div>
                        <p className="text-sm font-black text-cyan-300">
                            Total: {formatRupiah(pricing.finalTotal)}
                        </p>
                    </div>
                </div>
            )}
        </ScanCustomerLayout>
    );
}
