import React, { useRef, useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import LangitLensAdminLayout from '@/Layouts/LangitLensAdminLayout';
import {
    Send,
    XCircle,
    Phone,
    CheckCircle2,
    Clock,
    Image as ImageIcon,
    Copy,
    Check,
    Receipt,
    Eye,
    Download,
    X,
    QrCode,
    Building2,
    ChevronDown,
    ChevronUp,
    Save,
    Loader2,
    Upload,
    Trash2,
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
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
}

export default function Requests({ requests, statusFilter, discountRule }) {
    const [notesMap, setNotesMap] = useState({});
    const [originalFilesMap, setOriginalFilesMap] = useState({});
    const [sendingId, setSendingId] = useState(null);
    const [copiedRequestId, setCopiedRequestId] = useState(null);
    const [viewingProofReq, setViewingProofReq] = useState(null);
    const [paymentConfigOpen, setPaymentConfigOpen] = useState(false);
    const [qrisPreview, setQrisPreview] = useState(discountRule?.qris_image_url || null);
    const qrisInputRef = useRef(null);

    const paymentForm = useForm({
        name: discountRule?.name || 'Diskon Paket Foto',
        is_active: Boolean(discountRule?.is_active ?? true),
        min_photos_selected: discountRule?.min_photos_selected ?? 5,
        discount_percentage: discountRule?.discount_percentage ?? 20,
        default_photo_price: discountRule?.default_photo_price ?? 25000,
        admin_whatsapp: discountRule?.admin_whatsapp ?? '6281234567890',
        bank_name: discountRule?.bank_name ?? '',
        bank_account_number: discountRule?.bank_account_number ?? '',
        bank_account_holder: discountRule?.bank_account_holder ?? '',
        manual_payment_info: discountRule?.manual_payment_info ?? '',
        qris_image: null,
        remove_qris: false,
    });

    const handleQrisFileChange = (file) => {
        if (!file) return;
        paymentForm.setData((prev) => ({
            ...prev,
            qris_image: file,
            remove_qris: false,
        }));
        const reader = new FileReader();
        reader.onload = (ev) => setQrisPreview(ev.target.result);
        reader.readAsDataURL(file);
    };

    const handleRemoveQris = () => {
        setQrisPreview(null);
        paymentForm.setData((prev) => ({
            ...prev,
            qris_image: null,
            remove_qris: true,
        }));
        if (qrisInputRef.current) qrisInputRef.current.value = '';
    };

    const handleSavePaymentConfig = (e) => {
        e.preventDefault();
        paymentForm.post('/admin/langitlens/discount', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setPaymentConfigOpen(false);
            },
        });
    };

    const handleCopyForLightroom = async (req) => {
        const names = (req.items || [])
            .map((item) => item.original_filename)
            .filter((name) => name && name !== '-')
            .join(', ');

        if (!names) return;

        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(names);
            } else {
                const textarea = document.createElement('textarea');
                textarea.value = names;
                textarea.style.position = 'fixed';
                textarea.style.opacity = '0';
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
            }
            setCopiedRequestId(req.id);
            setTimeout(() => {
                setCopiedRequestId((prev) => (prev === req.id ? null : prev));
            }, 2500);
        } catch {
            // Abaikan jika browser memblokir clipboard
        }
    };

    const tabs = [
        { key: 'ALL', label: 'Semua' },
        { key: 'WAITING_MANUAL_PAYMENT', label: 'Menunggu Konfirmasi' },
        { key: 'SENT_BY_ADMIN', label: 'Terkirim' },
        { key: 'CANCELLED', label: 'Dibatalkan' },
    ];

    const handleSendOriginals = (req) => {
        const attachedFiles = originalFilesMap[req.id] || [];
        const confirmText = attachedFiles.length > 0
            ? `Konfirmasi pembayaran & kirim ${attachedFiles.length} file ukuran asli penuh untuk ${req.request_code} ke ${req.customer?.name}?`
            : `Konfirmasi pembayaran & kirim foto tanpa watermark untuk ${req.request_code} ke ${req.customer?.name}?`;

        if (!confirm(confirmText)) {
            return;
        }

        const formData = new FormData();
        formData.append('admin_notes', notesMap[req.id] || '');
        attachedFiles.forEach((f) => formData.append('original_files[]', f));

        setSendingId(req.id);
        router.post(
            `/admin/langitlens/requests/${req.id}/send-originals`,
            formData,
            {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => {
                    setOriginalFilesMap((prev) => ({ ...prev, [req.id]: [] }));
                    if (viewingProofReq?.id === req.id) {
                        setViewingProofReq(null);
                    }
                },
                onFinish: () => setSendingId(null),
            }
        );
    };

    const handleCancel = (req) => {
        if (!confirm(`Tolak / batalkan pesanan ${req.request_code}?`)) return;
        router.post(
            `/admin/langitlens/requests/${req.id}/cancel`,
            { admin_notes: notesMap[req.id] || '' },
            {
                preserveScroll: true,
                onSuccess: () => {
                    if (viewingProofReq?.id === req.id) {
                        setViewingProofReq(null);
                    }
                },
            }
        );
    };

    return (
        <>
            <Head title="Bukti Bayar & Pesanan" />

            <div className="space-y-4">
                {/* Pengaturan Metode Bayar QRIS & No Rekening Bank */}
                <div className="bg-[#0B1222]/90 border border-white/10 rounded-2xl overflow-hidden transition-colors duration-200 hover:border-white/15">
                    <button
                        type="button"
                        onClick={() => setPaymentConfigOpen((prev) => !prev)}
                        className="w-full px-4 sm:px-5 py-3.5 flex items-center justify-between gap-3 text-left hover:bg-white/[0.03] transition-colors cursor-pointer"
                    >
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-xl bg-sky-500/15 border border-sky-400/30 flex items-center justify-center text-sky-400 shrink-0">
                                <QrCode className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs sm:text-sm font-bold text-white truncate">
                                    Metode Bayar Pelanggan (QRIS & Rekening Bank)
                                </p>
                                <p className="text-[11px] sm:text-xs text-slate-400 truncate">
                                    {discountRule?.has_custom_qris ? 'QRIS Custom Aktif' : 'QRIS Contoh Aktif'} •{' '}
                                    {discountRule?.bank_name && discountRule?.bank_account_number
                                        ? `${discountRule.bank_name} ${discountRule.bank_account_number}`
                                        : 'BRI 0123-01-045678-53-9'}
                                </p>
                            </div>
                        </div>
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 text-xs font-semibold text-sky-300 shrink-0">
                            <span>{paymentConfigOpen ? 'Tutup' : 'Atur QRIS & Bank'}</span>
                            {paymentConfigOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </span>
                    </button>

                    {paymentConfigOpen && (
                        <form
                            onSubmit={handleSavePaymentConfig}
                            className="px-4 sm:px-5 pb-5 pt-4 border-t border-white/10 space-y-4"
                        >
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                                {/* Upload QRIS */}
                                <div className="lg:col-span-4 space-y-2">
                                    <label className="block text-xs font-semibold text-slate-300">
                                        Gambar QRIS (Maks 5 MB)
                                    </label>
                                    <input
                                        ref={qrisInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleQrisFileChange(e.target.files?.[0] || null)}
                                        className="hidden"
                                    />
                                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 text-center space-y-2.5">
                                        {qrisPreview ? (
                                            <div className="bg-white p-2 rounded-lg inline-block">
                                                <img
                                                    src={qrisPreview}
                                                    alt="Preview QRIS"
                                                    className="w-36 h-36 object-contain mx-auto"
                                                />
                                            </div>
                                        ) : (
                                            <div className="py-6 text-slate-500 text-xs">
                                                <QrCode className="w-8 h-8 mx-auto mb-1 opacity-50" />
                                                Belum ada gambar QRIS
                                            </div>
                                        )}
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => qrisInputRef.current?.click()}
                                                className="px-3 py-1.5 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 border border-sky-400/30 text-sky-300 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                                            >
                                                <Upload className="w-3.5 h-3.5" />
                                                <span>{qrisPreview ? 'Ganti QRIS' : 'Unggah QRIS'}</span>
                                            </button>
                                            {qrisPreview && (
                                                <button
                                                    type="button"
                                                    onClick={handleRemoveQris}
                                                    className="px-2.5 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                    <span>Hapus</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Info Rekening Bank & Catatan */}
                                <div className="lg:col-span-8 space-y-3">
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-300 mb-1">
                                                Nama Bank
                                            </label>
                                            <input
                                                type="text"
                                                value={paymentForm.data.bank_name}
                                                onChange={(e) => paymentForm.setData('bank_name', e.target.value)}
                                                placeholder="BCA / BRI / Mandiri"
                                                className="w-full min-h-10 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-400"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-300 mb-1">
                                                Nomor Rekening
                                            </label>
                                            <input
                                                type="text"
                                                value={paymentForm.data.bank_account_number}
                                                onChange={(e) => paymentForm.setData('bank_account_number', e.target.value)}
                                                placeholder="1234567890"
                                                className="w-full min-h-10 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-400"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-300 mb-1">
                                                Atas Nama
                                            </label>
                                            <input
                                                type="text"
                                                value={paymentForm.data.bank_account_holder}
                                                onChange={(e) => paymentForm.setData('bank_account_holder', e.target.value)}
                                                placeholder="Langit Creative Studio"
                                                className="w-full min-h-10 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-400"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-300 mb-1">
                                                WhatsApp Admin
                                            </label>
                                            <input
                                                type="text"
                                                value={paymentForm.data.admin_whatsapp}
                                                onChange={(e) => paymentForm.setData('admin_whatsapp', e.target.value)}
                                                placeholder="6281234567890"
                                                className="w-full min-h-10 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-400"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-300 mb-1">
                                                Catatan Pembayaran (Opsional)
                                            </label>
                                            <input
                                                type="text"
                                                value={paymentForm.data.manual_payment_info}
                                                onChange={(e) => paymentForm.setData('manual_payment_info', e.target.value)}
                                                placeholder="Keterangan tambahan jika ada..."
                                                className="w-full min-h-10 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-400"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-1">
                                        <button
                                            type="submit"
                                            disabled={paymentForm.processing}
                                            className="min-h-10 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition-all cursor-pointer disabled:opacity-60"
                                        >
                                            {paymentForm.processing ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Save className="w-4 h-4" />
                                            )}
                                            <span>{paymentForm.processing ? 'Menyimpan...' : 'Simpan Metode Bayar'}</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    )}
                </div>

                {/* Filter Status */}
                <div className="flex flex-wrap gap-2">
                    {tabs.map((t) => (
                        <button
                            key={t.key}
                            type="button"
                            onClick={() => router.get('/admin/langitlens/requests', { status: t.key }, { preserveState: true })}
                            className={`min-h-10 px-4 py-2 rounded-xl text-xs font-semibold transition-all active:scale-[0.98] cursor-pointer ${
                                statusFilter === t.key
                                    ? 'bg-sky-500 text-slate-950 shadow-sm shadow-sky-500/25'
                                    : 'bg-[#0B1222]/90 border border-white/10 text-slate-300 hover:border-sky-400/35'
                            }`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                {requests.length === 0 ? (
                    <div className="bg-[#0B1222]/90 border border-white/10 rounded-2xl p-8 text-center text-xs text-slate-400">
                        Belum ada pesanan pada status ini.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {requests.map((req) => {
                            const waClean = (req.customer?.whatsapp_number || '').replace(/\D/g, '');
                            const waFormatted = waClean.startsWith('0') ? `62${waClean.slice(1)}` : waClean;

                            return (
                                <div
                                    key={req.id}
                                    className="bg-[#0B1222]/90 border border-white/10 rounded-2xl p-4 sm:p-5 space-y-4 transition-colors duration-200 hover:border-sky-400/25"
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                                        <div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-mono font-bold text-white text-sm">
                                                    {req.request_code}
                                                </span>
                                                <span
                                                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                                        req.status === 'SENT_BY_ADMIN'
                                                            ? 'bg-emerald-500/15 text-emerald-300'
                                                            : req.status === 'CANCELLED'
                                                              ? 'bg-rose-500/15 text-rose-300'
                                                              : 'bg-amber-500/15 text-amber-300'
                                                    }`}
                                                >
                                                    {req.status === 'SENT_BY_ADMIN' ? (
                                                        <>
                                                            <CheckCircle2 className="w-3 h-3" />
                                                            Dikonfirmasi & Terkirim
                                                        </>
                                                    ) : req.status === 'CANCELLED' ? (
                                                        <>
                                                            <XCircle className="w-3 h-3" />
                                                            Dibatalkan
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Clock className="w-3 h-3" />
                                                            Menunggu Konfirmasi
                                                        </>
                                                    )}
                                                </span>
                                                {req.payment_method && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-500/15 text-sky-300 border border-sky-400/25">
                                                        {req.payment_method === 'qris' ? (
                                                            <>
                                                                <QrCode className="w-3 h-3" />
                                                                QRIS
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Building2 className="w-3 h-3" />
                                                                Transfer Bank
                                                            </>
                                                        )}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-400 mt-1">
                                                <strong className="text-white">{req.customer?.name}</strong> • {req.requested_at}
                                            </p>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2">
                                            {req.payment_proof_url && (
                                                <button
                                                    type="button"
                                                    onClick={() => setViewingProofReq(req)}
                                                    className="min-h-10 inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-400/35 text-sky-300 text-xs font-bold cursor-pointer transition-colors"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                    <span>Lihat Bukti Bayar</span>
                                                </button>
                                            )}
                                            {waFormatted && (
                                                <a
                                                    href={`https://wa.me/${waFormatted}?text=${encodeURIComponent(
                                                        `Halo ${req.customer?.name}, terkait pesanan foto ${req.request_code} (${req.total_selected_photos} foto, total ${formatRupiah(req.total_final_price)}).`
                                                    )}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="min-h-10 inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-semibold shrink-0"
                                                >
                                                    <Phone className="w-3.5 h-3.5" />
                                                    <span>Chat WhatsApp</span>
                                                </a>
                                            )}
                                        </div>
                                    </div>

                                    {/* Panel Bukti Pembayaran Pelanggan */}
                                    {req.payment_proof_url && (
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-sky-500/[0.08] border border-sky-400/25">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <button
                                                    type="button"
                                                    onClick={() => setViewingProofReq(req)}
                                                    className="w-16 h-16 rounded-xl overflow-hidden bg-slate-950 border border-white/15 shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
                                                    title="Klik untuk memperbesar bukti bayar"
                                                >
                                                    <img
                                                        src={req.payment_proof_url}
                                                        alt="Bukti Pembayaran"
                                                        className="w-full h-full object-cover"
                                                    />
                                                </button>
                                                <div className="min-w-0 space-y-0.5 text-xs">
                                                    <p className="font-bold text-white flex items-center gap-1.5">
                                                        <Receipt className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                                                        <span>Bukti Pembayaran Pelanggan</span>
                                                    </p>
                                                    <p className="text-[11px] text-slate-300 truncate">
                                                        {req.payment_proof_name || 'bukti-pembayaran'}
                                                        {req.payment_proof_uploaded_at ? ` • ${req.payment_proof_uploaded_at}` : ''}
                                                    </p>
                                                    {req.customer_notes && (
                                                        <p className="text-xs text-sky-200 italic">
                                                            Pesan: "{req.customer_notes}"
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <button
                                                    type="button"
                                                    onClick={() => setViewingProofReq(req)}
                                                    className="px-3 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                    <span>Perbesar</span>
                                                </button>
                                                <a
                                                    href={req.payment_proof_download_url}
                                                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-xs inline-flex items-center gap-1.5"
                                                >
                                                    <Download className="w-3.5 h-3.5" />
                                                    <span>Unduh</span>
                                                </a>
                                            </div>
                                        </div>
                                    )}

                                    {/* Daftar Foto yang Dipilih Pelanggan */}
                                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                                        {req.items.map((item) => (
                                            <div
                                                key={item.id}
                                                className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden text-[11px]"
                                            >
                                                <div className="aspect-square bg-slate-950 flex items-center justify-center overflow-hidden">
                                                    {item.preview_url ? (
                                                        <img
                                                            src={item.preview_url}
                                                            alt={item.title}
                                                            loading="lazy"
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <ImageIcon className="w-5 h-5 text-slate-700" />
                                                    )}
                                                </div>
                                                <div className="p-2 space-y-0.5">
                                                    <p className="font-semibold text-white truncate">{item.title}</p>
                                                    <p className="text-slate-400 truncate">
                                                        {formatBytes(item.original_size_bytes)}
                                                    </p>
                                                    <p className="text-amber-400 font-bold">
                                                        {formatRupiah(item.price_at_request)}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-3 border-t border-slate-800">
                                        <div className="space-y-1 text-xs">
                                            <p className="text-slate-400">
                                                Subtotal ({req.total_selected_photos} foto):{' '}
                                                <span className="text-white font-semibold">{formatRupiah(req.subtotal_price)}</span>
                                            </p>
                                            {req.discount_amount > 0 && (
                                                <p className="text-emerald-400">
                                                    Diskon {req.discount_percentage_applied}%: -{formatRupiah(req.discount_amount)}
                                                </p>
                                            )}
                                            <p className="text-sm font-bold text-white">
                                                Total: {formatRupiah(req.total_final_price)}
                                            </p>
                                            {!req.payment_proof_url && req.customer_notes && (
                                                <p className="text-slate-400 italic">Pesan: "{req.customer_notes}"</p>
                                            )}
                                        </div>

                                        {req.status === 'WAITING_MANUAL_PAYMENT' && (
                                            <div className="flex flex-col gap-2 w-full md:w-auto">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <label className="min-h-10 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-400/35 text-sky-200 text-xs font-semibold cursor-pointer transition-colors">
                                                        <Upload className="w-3.5 h-3.5 shrink-0" />
                                                        <span>
                                                            {(originalFilesMap[req.id]?.length || 0) > 0
                                                                ? `${originalFilesMap[req.id].length} File Asli Dipilih`
                                                                : 'Lampirkan File Asli Penuh'}
                                                        </span>
                                                        <input
                                                            type="file"
                                                            multiple
                                                            accept="image/*,.heic,.heif,.avif,.tif,.tiff,.raw,.dng"
                                                            className="hidden"
                                                            onChange={(e) =>
                                                                setOriginalFilesMap((prev) => ({
                                                                    ...prev,
                                                                    [req.id]: Array.from(e.target.files || []),
                                                                }))
                                                            }
                                                        />
                                                    </label>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleCopyForLightroom(req)}
                                                        className="min-h-10 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                                                        title="Salin daftar nama file untuk dicari di Lightroom/PC"
                                                    >
                                                        {copiedRequestId === req.id ? (
                                                            <>
                                                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                                                <span>Tersalin</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Copy className="w-3.5 h-3.5 text-cyan-400" />
                                                                <span>Salin Nama File</span>
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                                    <input
                                                        type="text"
                                                        placeholder="Catatan admin (opsional)..."
                                                        value={notesMap[req.id] || ''}
                                                        onChange={(e) =>
                                                            setNotesMap((prev) => ({ ...prev, [req.id]: e.target.value }))
                                                        }
                                                        className="min-h-11 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-sky-400"
                                                    />
                                                    <button
                                                        type="button"
                                                        disabled={sendingId === req.id}
                                                        onClick={() => handleSendOriginals(req)}
                                                        className="min-h-11 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-slate-950 font-bold text-xs transition-all cursor-pointer disabled:opacity-60"
                                                    >
                                                        {sendingId === req.id ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <Send className="w-4 h-4" />
                                                        )}
                                                        <span>
                                                            {sendingId === req.id
                                                                ? 'Mengirim...'
                                                                : 'Konfirmasi & Kirim Foto Asli'}
                                                        </span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        disabled={sendingId === req.id}
                                                        onClick={() => handleCancel(req)}
                                                        className="min-h-11 inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 active:scale-[0.98] text-rose-300 font-semibold text-xs transition-all cursor-pointer disabled:opacity-50"
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                        <span>Tolak</span>
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {req.status === 'SENT_BY_ADMIN' && (
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
                                                <div className="text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-2.5 rounded-xl">
                                                    Dikonfirmasi & terkirim pada {req.sent_at}
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleCopyForLightroom(req)}
                                                    title="Salin daftar nama file untuk pencarian di Adobe Lightroom / Photoshop"
                                                    className="min-h-10 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 active:scale-[0.98] text-white font-bold text-xs inline-flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                                                >
                                                    {copiedRequestId === req.id ? (
                                                        <>
                                                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                                                            <span>Tersalin ke Clipboard!</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Copy className="w-3.5 h-3.5" />
                                                            <span>Salin Nama File untuk Lightroom</span>
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Modal Lihat Bukti Pembayaran Pelanggan & Konfirmasi */}
            {viewingProofReq && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4"
                    onClick={() => setViewingProofReq(null)}
                >
                    <div
                        className="w-full max-w-2xl rounded-3xl bg-[#0B1222] border border-white/15 p-5 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start justify-between gap-3 pb-3 border-b border-white/10">
                            <div>
                                <h3 className="text-sm sm:text-base font-bold text-white">
                                    Bukti Pembayaran • {viewingProofReq.request_code}
                                </h3>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    {viewingProofReq.customer?.name} •{' '}
                                    {viewingProofReq.payment_method === 'qris' ? 'QRIS' : 'Transfer Bank'} • Total{' '}
                                    <strong className="text-cyan-300">{formatRupiah(viewingProofReq.total_final_price)}</strong>
                                </p>
                                {viewingProofReq.customer_notes && (
                                    <p className="text-xs text-sky-200 italic mt-1">
                                        Pesan pelanggan: "{viewingProofReq.customer_notes}"
                                    </p>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => setViewingProofReq(null)}
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="rounded-2xl bg-black/60 border border-white/10 overflow-hidden flex items-center justify-center min-h-56">
                            <img
                                src={viewingProofReq.payment_proof_url}
                                alt="Bukti Pembayaran Pelanggan"
                                className="max-h-[60vh] w-auto object-contain"
                            />
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/10">
                            <a
                                href={viewingProofReq.payment_proof_download_url}
                                className="min-h-10 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-xs inline-flex items-center gap-1.5"
                            >
                                <Download className="w-4 h-4" />
                                <span>Unduh File Bukti</span>
                            </a>

                            <div className="flex flex-wrap items-center gap-2">
                                {viewingProofReq.status === 'WAITING_MANUAL_PAYMENT' && (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => handleCancel(viewingProofReq)}
                                            className="min-h-10 px-4 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 font-semibold text-xs inline-flex items-center gap-1.5 cursor-pointer"
                                        >
                                            <XCircle className="w-4 h-4" />
                                            <span>Tolak</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleSendOriginals(viewingProofReq)}
                                            className="min-h-10 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer"
                                        >
                                            <CheckCircle2 className="w-4 h-4" />
                                            <span>Konfirmasi & Kirim Foto Asli</span>
                                        </button>
                                    </>
                                )}
                                <button
                                    type="button"
                                    onClick={() => setViewingProofReq(null)}
                                    className="min-h-10 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold cursor-pointer"
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

Requests.layout = (page) => <LangitLensAdminLayout title="Bukti Bayar & Pesanan">{page}</LangitLensAdminLayout>;
