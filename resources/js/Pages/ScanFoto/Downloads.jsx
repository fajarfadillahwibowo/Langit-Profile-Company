import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
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
    Sparkles,
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

            <div className="space-y-5">
                {requests.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-[#0B1222]/90 border border-white/10 rounded-3xl p-10 text-center space-y-3 backdrop-blur-xl"
                    >
                        <div className="w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-400/25 flex items-center justify-center mx-auto">
                            <DownloadCloud className="w-8 h-8 text-sky-400" />
                        </div>
                        <p className="font-heading text-base font-bold text-white">Belum ada pesanan foto</p>
                        <p className="text-xs text-slate-400 max-w-xs mx-auto">
                            Foto asli tanpa watermark yang sudah dikirim Admin akan tampil di sini untuk diunduh.
                        </p>
                        <Link
                            href="/scan-foto"
                            className="min-h-11 inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-sky-400 to-cyan-400 hover:from-sky-300 hover:to-cyan-300 text-slate-950 font-black text-xs shadow-lg shadow-sky-500/25"
                        >
                            <Sparkles className="w-4 h-4" />
                            <span>Mulai Scan Wajah</span>
                        </Link>
                    </motion.div>
                ) : (
                    requests.map((req, idx) => {
                        const isReady = req.status === 'SENT_BY_ADMIN';
                        const isCancelled = req.status === 'CANCELLED';

                        return (
                            <motion.div
                                key={req.id}
                                initial={{ opacity: 0, y: 14 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.06 }}
                                className={`relative overflow-hidden bg-[#0B1222]/95 border rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl shadow-black/30 ${
                                    isReady
                                        ? 'border-emerald-400/35'
                                        : isCancelled
                                          ? 'border-rose-500/25'
                                          : 'border-amber-400/30'
                                }`}
                            >
                                {/* Top status glow hairline */}
                                <div
                                    className={`absolute inset-x-0 top-0 h-1 ${
                                        isReady
                                            ? 'bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400'
                                            : isCancelled
                                              ? 'bg-gradient-to-r from-rose-500 to-pink-500'
                                              : 'bg-gradient-to-r from-amber-400 to-orange-400'
                                    }`}
                                />

                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                                    <div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-mono font-black text-white text-sm tracking-wide">
                                                {req.request_code}
                                            </span>
                                            <span
                                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                                                    isReady
                                                        ? 'bg-emerald-500/15 border-emerald-400/30 text-emerald-300'
                                                        : isCancelled
                                                          ? 'bg-rose-500/15 border-rose-400/30 text-rose-300'
                                                          : 'bg-amber-500/15 border-amber-400/30 text-amber-300'
                                                }`}
                                            >
                                                {isReady ? (
                                                    <>
                                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                                        Siap Diunduh
                                                    </>
                                                ) : isCancelled ? (
                                                    <>
                                                        <XCircle className="w-3.5 h-3.5" />
                                                        Dibatalkan
                                                    </>
                                                ) : (
                                                    <>
                                                        <Clock className="w-3.5 h-3.5 animate-pulse" />
                                                        Menunggu Konfirmasi Admin
                                                    </>
                                                )}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-400 mt-1.5">
                                            {req.requested_at} • {req.total_selected_photos} foto •{' '}
                                            <strong className="text-white">{formatRupiah(req.total_final_price)}</strong>
                                            {req.discount_amount > 0 && (
                                                <span className="text-emerald-400 font-semibold ml-1.5">
                                                    (Hemat {req.discount_percentage_applied}%)
                                                </span>
                                            )}
                                        </p>
                                    </div>

                                    {isReady ? (
                                        <motion.a
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            href={`/scan-foto/unduhan/${req.id}/zip`}
                                            className="min-h-11 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/25 transition-all shrink-0"
                                        >
                                            <Archive className="w-4 h-4" />
                                            <span>Unduh Semua (.ZIP)</span>
                                        </motion.a>
                                    ) : (
                                        req.status === 'WAITING_MANUAL_PAYMENT' &&
                                        adminWa && (
                                            <a
                                                href={`https://wa.me/${adminWa}?text=${encodeURIComponent(
                                                    `Halo Admin LangitLens, saya ingin konfirmasi pembayaran untuk pesanan ${req.request_code} (${req.total_selected_photos} foto, Total ${formatRupiah(req.total_final_price)}).`
                                                )}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="min-h-11 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-400/35 text-emerald-300 font-bold text-xs transition-all shrink-0"
                                            >
                                                <Phone className="w-4 h-4" />
                                                <span>Konfirmasi via WhatsApp</span>
                                            </a>
                                        )
                                    )}
                                </div>

                                {req.status === 'WAITING_MANUAL_PAYMENT' && discountRule?.manual_payment_info && (
                                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-400/25 text-xs text-amber-100 whitespace-pre-line leading-relaxed">
                                        <strong className="text-amber-300">Info Pembayaran:</strong>
                                        {'\n'}
                                        {discountRule.manual_payment_info}
                                    </div>
                                )}

                                {req.admin_notes && (
                                    <p className="text-xs text-slate-300 bg-white/[0.04] px-4 py-3 rounded-2xl border border-white/10">
                                        <strong className="text-cyan-300">Pesan Admin:</strong> {req.admin_notes}
                                    </p>
                                )}

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {req.items.map((item) => (
                                        <div
                                            key={item.id}
                                            className="group bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-white/20 rounded-2xl p-3 flex items-center gap-3 transition-all"
                                        >
                                            <img
                                                src={item.preview_url}
                                                alt={item.title}
                                                loading="lazy"
                                                className="w-15 h-15 rounded-xl object-cover bg-slate-950 border border-white/10 shrink-0"
                                            />
                                            <div className="min-w-0 flex-1 space-y-1.5">
                                                <p className="text-xs font-bold text-white truncate">{item.title}</p>
                                                <p className="text-[11px] font-mono text-slate-400">
                                                    {item.original_width}×{item.original_height} •{' '}
                                                    {formatBytes(item.original_size_bytes)}
                                                </p>
                                                {isReady && item.is_original_unlocked ? (
                                                    <a
                                                        href={`/scan-foto/unduhan/${req.id}/item/${item.id}`}
                                                        className="min-h-9 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 active:scale-[0.98] text-slate-950 font-black text-[11px] transition-all shadow-sm shadow-emerald-500/20"
                                                    >
                                                        <Download className="w-3.5 h-3.5" />
                                                        <span>Unduh Asli</span>
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
                            </motion.div>
                        );
                    })
                )}
            </div>
        </ScanCustomerLayout>
    );
}
