import React from 'react';
import { Head, Link } from '@inertiajs/react';
import LangitLensAdminLayout from '@/Layouts/LangitLensAdminLayout';
import {
    Images,
    ScanFace,
    Inbox,
    CheckCircle2,
    Users,
    HardDrive,
    Percent,
    ArrowRight,
} from 'lucide-react';

function formatBytes(bytes) {
    if (!bytes) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
}

function formatRupiah(num) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(num || 0);
}

export default function Dashboard({ stats, recentRequests, discountRule }) {
    const cards = [
        {
            label: 'Total Foto',
            value: stats.totalPhotos,
            sub: 'Foto di galeri',
            icon: Images,
            color: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
        },
        {
            label: 'Wajah Terdata',
            value: stats.totalIndexedFaces,
            sub: 'Siap dicocokkan',
            icon: ScanFace,
            color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
        },
        {
            label: 'Menunggu Kirim',
            value: stats.pendingRequests,
            sub: 'Permintaan baru',
            icon: Inbox,
            color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
        },
        {
            label: 'Terkirim',
            value: stats.completedRequests,
            sub: 'Pesanan selesai',
            icon: CheckCircle2,
            color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
        },
    ];

    const savedPercent =
        stats.totalOriginalBytes > 0
            ? Math.max(0, Math.round((1 - stats.totalPreviewBytes / stats.totalOriginalBytes) * 100))
            : 0;

    return (
        <>
            <Head title="Ringkasan Admin" />

            <div className="space-y-4 animate-fade-in">
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
                    {cards.map((card) => {
                        const Icon = card.icon;
                        return (
                            <div
                                key={card.label}
                                className="bg-[#111827] border border-slate-800 rounded-2xl p-4 sm:p-5 flex items-start justify-between gap-2"
                            >
                                <div className="min-w-0">
                                    <p className="text-xs font-medium text-slate-400 truncate">{card.label}</p>
                                    <p className="text-2xl font-bold text-white mt-1">{card.value}</p>
                                    <p className="text-[11px] text-slate-500 mt-0.5 truncate">{card.sub}</p>
                                </div>
                                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${card.color}`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 space-y-3">
                        <div className="flex items-center gap-2 text-sm font-bold text-white">
                            <HardDrive className="w-4 h-4 text-sky-400" />
                            <span>Ukuran File & Kompresi</span>
                        </div>
                        <div className="space-y-2 text-xs text-slate-300">
                            <div className="flex justify-between">
                                <span className="text-slate-400">File Asli:</span>
                                <span className="font-semibold text-white">{formatBytes(stats.totalOriginalBytes)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Pratinjau Web:</span>
                                <span className="font-semibold text-emerald-400">{formatBytes(stats.totalPreviewBytes)}</span>
                            </div>
                            <div className="flex justify-between pt-2 border-t border-slate-800">
                                <span className="text-slate-400">Lebih Ringan:</span>
                                <span className="font-bold text-sky-400">{savedPercent}%</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm font-bold text-white">
                                <Percent className="w-4 h-4 text-amber-400" />
                                <span>Diskon & Harga</span>
                            </div>
                            <Link href="/admin/langitlens/photos" className="text-xs font-semibold text-sky-400 hover:underline">
                                Atur
                            </Link>
                        </div>
                        <div className="text-xs text-slate-300 space-y-1.5">
                            <p>
                                Status:{' '}
                                <span className={discountRule?.is_active ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                                    {discountRule?.is_active ? 'Aktif' : 'Nonaktif'}
                                </span>
                            </p>
                            <p>
                                Minimal Foto: <strong className="text-white">{discountRule?.min_photos_selected} foto</strong>
                            </p>
                            <p>
                                Potongan: <strong className="text-amber-400">{discountRule?.discount_percentage}%</strong>
                            </p>
                            <p>
                                Harga Dasar: <strong className="text-white">{formatRupiah(discountRule?.default_photo_price)}</strong>
                            </p>
                        </div>
                    </div>

                    <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 flex flex-col justify-between gap-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm font-bold text-white">
                                <Users className="w-4 h-4 text-sky-400" />
                                <span>{stats.totalCustomers} Pelanggan Terdaftar</span>
                            </div>
                            <p className="text-xs text-slate-400">
                                Kelola foto baru atau proses pesanan pelanggan yang masuk.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-2.5">
                            <Link
                                href="/admin/langitlens/photos"
                                className="min-h-11 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 active:scale-[0.98] text-slate-950 font-bold text-xs transition-all"
                            >
                                <span>Upload Foto</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                            <Link
                                href="/admin/langitlens/requests"
                                className="min-h-11 inline-flex items-center justify-center px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-[0.98] text-white font-semibold text-xs border border-slate-700 transition-all"
                            >
                                <span>Cek Pesanan</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Permintaan Terbaru */}
                <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-bold text-white">Permintaan Terbaru</h2>
                        <Link href="/admin/langitlens/requests" className="text-xs font-semibold text-sky-400 hover:underline">
                            Lihat Semua
                        </Link>
                    </div>

                    {recentRequests.length === 0 ? (
                        <p className="text-xs text-slate-400 py-4 text-center">Belum ada permintaan foto.</p>
                    ) : (
                        <div className="min-w-0 max-w-full overflow-x-auto overscroll-x-contain">
                            <table className="w-full min-w-[36rem] text-left text-xs [overflow-wrap:normal] break-normal [&_th]:whitespace-nowrap">
                                <thead>
                                    <tr className="border-b border-slate-800 text-slate-400">
                                        <th className="pb-2.5 pr-4">Kode</th>
                                        <th className="pb-2.5 pr-4">Pelanggan</th>
                                        <th className="pb-2.5 pr-4">Jumlah</th>
                                        <th className="pb-2.5 pr-4">Total</th>
                                        <th className="pb-2.5">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {recentRequests.map((req) => (
                                        <tr key={req.id}>
                                            <td className="py-3 pr-4 font-mono font-semibold text-white">{req.request_code}</td>
                                            <td className="py-3 pr-4 text-slate-300">{req.customer_name}</td>
                                            <td className="py-3 pr-4 text-slate-300">{req.total_selected_photos} foto</td>
                                            <td className="py-3 pr-4 font-semibold text-white">{formatRupiah(req.total_final_price)}</td>
                                            <td className="py-3">
                                                <span
                                                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                                        req.status === 'SENT_BY_ADMIN'
                                                            ? 'bg-emerald-500/15 text-emerald-300'
                                                            : req.status === 'CANCELLED'
                                                              ? 'bg-rose-500/15 text-rose-300'
                                                              : 'bg-amber-500/15 text-amber-300'
                                                    }`}
                                                >
                                                    {req.status === 'SENT_BY_ADMIN'
                                                        ? 'Terkirim'
                                                        : req.status === 'CANCELLED'
                                                          ? 'Dibatalkan'
                                                          : 'Menunggu'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

Dashboard.layout = (page) => <LangitLensAdminLayout title="Ringkasan">{page}</LangitLensAdminLayout>;
