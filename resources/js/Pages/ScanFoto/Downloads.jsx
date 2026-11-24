import React from 'react';
import { Head, Link } from '@inertiajs/react';
import ScanCustomerLayout from '@/Layouts/ScanCustomerLayout';
import {
    DownloadCloud,
    Clock,
    CheckCircle2,
    XCircle,
    Phone,
    Archive,
    Download,
    Lock,
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

export default function Downloads({ requests, discountRule }) {
    const adminWaClean = (discountRule?.admin_whatsapp || '').replace(/\D/g, '');
    const adminWa = adminWaClean.startsWith('0') ? `62${adminWaClean.slice(1)}` : adminWaClean;

    return (
        <ScanCustomerLayout title="Unduh Foto">
            <Head title="Unduh Foto" />

            <div className="space-y-4 animate-fade-in">
                {requests.length === 0 ? (
                    <div className="bg-[#111827] border border-slate-800 rounded-2xl p-8 text-center space-y-3">
                        <DownloadCloud className="w-10 h-10 text-slate-600 mx-auto" />
                        <p className="text-sm font-bold text-white">Belum ada pesanan foto</p>
                        <p className="text-xs text-slate-400">
                            Foto asli yang sudah dikirim Admin akan tampil di sini untuk diunduh.
                        </p>
                        <Link
                            href="/scan-foto"
                            className="min-h-11 inline-flex items-center px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs"
                        >
                            Mulai Scan Wajah
                        </Link>
                    </div>
                ) : (
                    requests.map((req) => (
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
                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                    Siap Diunduh
                                                </>
                                            ) : req.status === 'CANCELLED' ? (
                                                <>
                                                    <XCircle className="w-3.5 h-3.5" />
                                                    Dibatalkan
                                                </>
                                            ) : (
                                                <>
                                                    <Clock className="w-3.5 h-3.5" />
                                                    Menunggu Konfirmasi Admin
                                                </>
                                            )}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-400 mt-1">
                                        {req.requested_at} • {req.total_selected_photos} foto •{' '}
                                        <strong className="text-white">{formatRupiah(req.total_final_price)}</strong>
                                        {req.discount_amount > 0 && (
                                            <span className="text-emerald-400 ml-1">
                                                (Diskon {req.discount_percentage_applied}%)
                                            </span>
                                        )}
                                    </p>
                                </div>

                                {req.status === 'SENT_BY_ADMIN' ? (
                                    <a
                                        href={`/scan-foto/unduhan/${req.id}/zip`}
                                        className="min-h-11 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-slate-950 font-bold text-xs transition-all shrink-0"
                                    >
                                        <Archive className="w-4 h-4" />
                                        <span>Unduh Semua (.ZIP)</span>
                                    </a>
                                ) : (
                                    req.status === 'WAITING_MANUAL_PAYMENT' &&
                                    adminWa && (
                                        <a
                                            href={`https://wa.me/${adminWa}?text=${encodeURIComponent(
                                                `Halo Admin LangitLens, saya ingin konfirmasi pembayaran untuk pesanan ${req.request_code} (${req.total_selected_photos} foto, Total ${formatRupiah(req.total_final_price)}).`
                                            )}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="min-h-11 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-bold text-xs transition-colors shrink-0"
                                        >
                                            <Phone className="w-4 h-4" />
                                            <span>Konfirmasi via WhatsApp</span>
                                        </a>
                                    )
                                )}
                            </div>

                            {req.status === 'WAITING_MANUAL_PAYMENT' && discountRule?.manual_payment_info && (
                                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 whitespace-pre-line leading-relaxed">
                                    <strong>Info Pembayaran:</strong>
                                    {'\n'}
                                    {discountRule.manual_payment_info}
                                </div>
                            )}

                            {req.admin_notes && (
                                <p className="text-xs text-slate-300 bg-slate-900 px-3.5 py-2.5 rounded-xl border border-slate-800">
                                    Pesan Admin: {req.admin_notes}
                                </p>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {req.items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center gap-3"
                                    >
                                        <img
                                            src={item.preview_url}
                                            alt={item.title}
                                            loading="lazy"
                                            className="w-14 h-14 rounded-lg object-cover bg-slate-950 shrink-0"
                                        />
                                        <div className="min-w-0 flex-1 space-y-1.5">
                                            <p className="text-xs font-semibold text-white truncate">{item.title}</p>
                                            <p className="text-[11px] text-slate-400">
                                                {item.original_width}×{item.original_height} •{' '}
                                                {formatBytes(item.original_size_bytes)}
                                            </p>
                                            {req.status === 'SENT_BY_ADMIN' && item.is_original_unlocked ? (
                                                <a
                                                    href={`/scan-foto/unduhan/${req.id}/item/${item.id}`}
                                                    className="min-h-9 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-slate-950 font-bold text-xs transition-all"
                                                >
                                                    <Download className="w-3.5 h-3.5" />
                                                    <span>Unduh Foto Asli</span>
                                                </a>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                                                    <Lock className="w-3 h-3" />
                                                    Menunggu pengiriman Admin
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </ScanCustomerLayout>
    );
}
