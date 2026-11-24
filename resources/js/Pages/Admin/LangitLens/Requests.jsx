import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import LangitLensAdminLayout from '@/Layouts/LangitLensAdminLayout';
import { Send, XCircle, Phone, CheckCircle2, Clock, Image as ImageIcon, Copy, Check } from 'lucide-react';

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

export default function Requests({ requests, statusFilter }) {
    const [notesMap, setNotesMap] = useState({});
    const [copiedRequestId, setCopiedRequestId] = useState(null);

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
        { key: 'WAITING_MANUAL_PAYMENT', label: 'Menunggu' },
        { key: 'SENT_BY_ADMIN', label: 'Terkirim' },
        { key: 'CANCELLED', label: 'Dibatalkan' },
    ];

    const handleSendOriginals = (req) => {
        if (
            !confirm(
                `Kirim foto asli tanpa watermark untuk pesanan ${req.request_code} ke ${req.customer?.name}?`
            )
        ) {
            return;
        }
        router.post(
            `/admin/langitlens/requests/${req.id}/send-originals`,
            { admin_notes: notesMap[req.id] || '' },
            { preserveScroll: true }
        );
    };

    const handleCancel = (req) => {
        if (!confirm(`Batalkan pesanan ${req.request_code}?`)) return;
        router.post(
            `/admin/langitlens/requests/${req.id}/cancel`,
            { admin_notes: notesMap[req.id] || '' },
            { preserveScroll: true }
        );
    };

    return (
        <>
            <Head title="Permintaan Foto" />

            <div className="space-y-4 animate-fade-in">
                <div className="flex flex-wrap gap-2">
                    {tabs.map((t) => (
                        <button
                            key={t.key}
                            type="button"
                            onClick={() => router.get('/admin/langitlens/requests', { status: t.key }, { preserveState: true })}
                            className={`min-h-10 px-4 py-2 rounded-xl text-xs font-semibold transition-colors active:scale-[0.98] cursor-pointer ${
                                statusFilter === t.key
                                    ? 'bg-sky-500 text-slate-950'
                                    : 'bg-[#111827] border border-slate-800 text-slate-300 hover:border-slate-700'
                            }`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                {requests.length === 0 ? (
                    <div className="bg-[#111827] border border-slate-800 rounded-2xl p-8 text-center text-xs text-slate-400">
                        Belum ada permintaan pada status ini.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {requests.map((req) => {
                            const waClean = (req.customer?.whatsapp_number || '').replace(/\D/g, '');
                            const waFormatted = waClean.startsWith('0') ? `62${waClean.slice(1)}` : waClean;

                            return (
                                <div
                                    key={req.id}
                                    className="bg-[#111827] border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4"
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
                                                            Terkirim
                                                        </>
                                                    ) : req.status === 'CANCELLED' ? (
                                                        <>
                                                            <XCircle className="w-3 h-3" />
                                                            Dibatalkan
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Clock className="w-3 h-3" />
                                                            Menunggu Pembayaran
                                                        </>
                                                    )}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-400 mt-1">
                                                <strong className="text-white">{req.customer?.name}</strong> • {req.requested_at}
                                            </p>
                                        </div>

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
                                            {req.customer_notes && (
                                                <p className="text-slate-400 italic">Catatan: "{req.customer_notes}"</p>
                                            )}
                                        </div>

                                        {req.status === 'WAITING_MANUAL_PAYMENT' && (
                                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                                <input
                                                    type="text"
                                                    placeholder="Catatan (opsional)..."
                                                    value={notesMap[req.id] || ''}
                                                    onChange={(e) =>
                                                        setNotesMap((prev) => ({ ...prev, [req.id]: e.target.value }))
                                                    }
                                                    className="min-h-11 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-sky-400"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleSendOriginals(req)}
                                                    className="min-h-11 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-slate-950 font-bold text-xs transition-all cursor-pointer"
                                                >
                                                    <Send className="w-4 h-4" />
                                                    <span>Kirim Foto Asli</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleCancel(req)}
                                                    className="min-h-11 inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 active:scale-[0.98] text-rose-300 font-semibold text-xs transition-all cursor-pointer"
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                    <span>Tolak</span>
                                                </button>
                                            </div>
                                        )}

                                        {req.status === 'SENT_BY_ADMIN' && (
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
                                                <div className="text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-2.5 rounded-xl">
                                                    Foto asli terkirim pada {req.sent_at}
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
        </>
    );
}

Requests.layout = (page) => <LangitLensAdminLayout title="Permintaan Foto">{page}</LangitLensAdminLayout>;
