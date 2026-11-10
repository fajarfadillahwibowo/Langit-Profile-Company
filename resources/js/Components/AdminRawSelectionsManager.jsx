import React, { useState, useMemo } from 'react';
import { router } from '@inertiajs/react';
import { 
    Sparkles, Check, Clock, Eye, Trash2, X, 
    MessageSquare, Copy, CheckCircle2, AlertCircle,
    User, Calendar, Filter, Send, RefreshCw, Tag
} from 'lucide-react';
import { getWhatsAppUrl } from '@/Utils/whatsapp';

export default function AdminRawSelectionsManager({ clientRawSelections = [] }) {
    // Filter state
    const [statusFilter, setStatusFilter] = useState('all');

    // Selected detail modal
    const [detailSelection, setDetailSelection] = useState(null);
    const [inspectPhoto, setInspectPhoto] = useState(null);
    const [statusForm, setStatusForm] = useState({
        status: 'pending',
        admin_notes: '',
    });
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [copiedNames, setCopiedNames] = useState(false);

    // Filtered selections
    const filteredSelections = useMemo(() => {
        if (statusFilter === 'all') return clientRawSelections;
        return clientRawSelections.filter(s => s.status === statusFilter);
    }, [clientRawSelections, statusFilter]);

    // Open detail modal
    const openDetailModal = (sel) => {
        setDetailSelection(sel);
        setStatusForm({
            status: sel.status || 'pending',
            admin_notes: sel.admin_notes || '',
        });
        setCopiedNames(false);
    };

    // Update status submit
    const handleStatusSubmit = (e) => {
        e.preventDefault();
        if (!detailSelection) return;

        setIsUpdatingStatus(true);
        router.put(`/admin/client-raw-selections/${detailSelection.id}/status`, statusForm, {
            preserveScroll: true,
            onSuccess: () => {
                setIsUpdatingStatus(false);
                setDetailSelection(null);
            },
            onError: () => {
                setIsUpdatingStatus(false);
            }
        });
    };

    // Delete selection
    const handleDeleteSelection = (id) => {
        if (!confirm('Hapus data pengajuan pilihan foto mentahan ini?')) return;

        router.delete(`/admin/client-raw-selections/${id}`, {
            preserveScroll: true,
            onSuccess: () => {
                if (detailSelection?.id === id) {
                    setDetailSelection(null);
                }
            }
        });
    };

    // Copy selected photo filenames to clipboard for Adobe Lightroom
    const handleCopyFileNames = () => {
        if (!detailSelection?.selected_photos) return;
        const names = detailSelection.selected_photos.map(p => p.original_name).join(', ');
        navigator.clipboard.writeText(names);
        setCopiedNames(true);
        setTimeout(() => setCopiedNames(false), 2500);
    };

    return (
        <div className="space-y-6">
            {/* Header & Filter Bar */}
            <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-[#090D16] border border-slate-200/90 dark:border-white/10 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                            <Sparkles className="w-5 h-5" />
                        </span>
                        <h2 className="font-heading font-black text-xl text-slate-900 dark:text-white">
                            Pilihan Foto Mentahan dari Pelanggan
                        </h2>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl">
                        Daftar foto mentahan yang telah dipilih dan dikirimkan oleh pelanggan untuk diproses oleh editor Langit Creative.
                    </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    {[
                        { id: 'all', label: 'Semua', count: clientRawSelections.length },
                        { id: 'pending', label: 'Baru Masuk', count: clientRawSelections.filter(s => s.status === 'pending').length },
                        { id: 'in_review', label: 'Ditinjau', count: clientRawSelections.filter(s => s.status === 'in_review').length },
                        { id: 'editing', label: 'Proses Edit', count: clientRawSelections.filter(s => s.status === 'editing').length },
                        { id: 'completed', label: 'Selesai', count: clientRawSelections.filter(s => s.status === 'completed').length },
                    ].map(f => (
                        <button
                            key={f.id}
                            type="button"
                            onClick={() => setStatusFilter(f.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                                statusFilter === f.id
                                    ? 'bg-[#005792] text-white font-bold shadow-md shadow-[#005792]/20'
                                    : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                        >
                            {f.label} ({f.count})
                        </button>
                    ))}
                </div>
            </div>

            {/* Table of Submissions */}
            {filteredSelections.length === 0 ? (
                <div className="text-center py-16 rounded-3xl bg-white dark:bg-[#090D16] border border-slate-200 dark:border-white/10 p-8">
                    <Sparkles className="w-12 h-12 text-slate-400 mx-auto mb-2 opacity-60" />
                    <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">
                        Belum Ada Pilihan Foto Masuk
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Saat pelanggan memilih dan mengirimkan foto mentahan dari portal mereka, datanya akan muncul di sini secara otomatis.
                    </p>
                </div>
            ) : (
                <div className="rounded-3xl bg-white dark:bg-[#090D16] border border-slate-200/90 dark:border-white/10 overflow-hidden shadow-sm">
                    <div className="min-w-0 max-w-full overflow-x-auto overscroll-x-contain" tabIndex={0} role="region" aria-label="Tabel pilihan foto mentahan pelanggan">
                        <table className="w-full min-w-[64rem] text-left border-collapse [&_td]:max-w-xs text-xs">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02] text-[11px] font-mono uppercase text-slate-500">
                                    <th className="px-5 py-3.5">Tanggal</th>
                                    <th className="px-5 py-3.5">Pelanggan</th>
                                    <th className="px-5 py-3.5">Album Sesi</th>
                                    <th className="px-5 py-3.5">Foto Terpilih</th>
                                    <th className="px-5 py-3.5">Rincian Biaya</th>
                                    <th className="px-5 py-3.5">Status</th>
                                    <th className="px-5 py-3.5 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                {filteredSelections.map((sel) => {
                                    const clientName = sel.user?.name || sel.delivery?.client_name || 'Pelanggan';
                                    const clientPhone = sel.user?.phone || sel.delivery?.client_phone || '';

                                    return (
                                        <tr key={sel.id} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors">
                                            <td className="px-5 py-4 font-mono text-slate-500 text-[11px]">
                                                {new Date(sel.created_at).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </td>

                                            <td className="px-5 py-4">
                                                <span className="font-bold text-slate-900 dark:text-white block text-sm">
                                                    {clientName}
                                                </span>
                                                <span className="text-[11px] font-mono text-slate-500 block">
                                                    @{sel.user?.username || sel.delivery?.client_username}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4">
                                                <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                                                    {sel.delivery?.title || 'Album Sesi'}
                                                </span>
                                                {sel.notes && (
                                                    <span className="text-[11px] text-slate-500 italic block truncate max-w-xs">
                                                        "{sel.notes}"
                                                    </span>
                                                )}
                                            </td>

                                            <td className="px-5 py-4">
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 font-mono font-bold text-xs">
                                                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-500" />
                                                    <span>{sel.total_photos} Foto Dipilih</span>
                                                </span>
                                            </td>

                                            <td className="px-5 py-4 font-mono">
                                                <span className="font-bold text-slate-900 dark:text-white block">
                                                    Rp {Number(sel.total_price).toLocaleString('id-ID')}
                                                </span>
                                                {sel.discount_percent > 0 ? (
                                                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block">
                                                        Diskon {sel.discount_percent}% (-Rp {Number(sel.discount_amount).toLocaleString('id-ID')})
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] text-slate-400 block">
                                                        Tanpa diskon
                                                    </span>
                                                )}
                                            </td>

                                            <td className="px-5 py-4">
                                                <span className={`inline-block px-2.5 py-1 rounded-lg border text-[11px] font-bold ${sel.status_badge_color}`}>
                                                    ● {sel.status_label}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => openDetailModal(sel)}
                                                        className="px-3 py-1.5 rounded-xl bg-[#005792] hover:bg-[#004270] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                                                        title="Lihat Rincian Foto Terpilih"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                        <span>Lihat Foto</span>
                                                    </button>

                                                    {clientPhone && (
                                                        <a
                                                            href={getWhatsAppUrl('client-delivery', {
                                                                phone: clientPhone,
                                                                clientName: clientName,
                                                                title: sel.delivery?.title || 'Foto Mentahan',
                                                                customMessage: `Halo Kak ${clientName}, kami dari Admin Studio Langit telah menerima ${sel.total_photos} foto mentahan pilihan Anda untuk album "${sel.delivery?.title}". Total pembayaran: Rp ${Number(sel.total_price).toLocaleString('id-ID')}. Kami akan segera memulai proses editing.`
                                                            })}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 transition-colors"
                                                            title="Hubungi Klien via WhatsApp"
                                                        >
                                                            <MessageSquare className="w-4 h-4" />
                                                        </a>
                                                    )}

                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteSelection(sel.id)}
                                                        className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
                                                        title="Hapus Pengajuan"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ── MODAL: RINCIAN FOTO TERPILIH & UBAH STATUS ── */}
            {detailSelection && (
                <div 
                    className="fixed inset-0 h-dvh overflow-y-auto overscroll-contain z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
                    onClick={() => setDetailSelection(null)}
                >
                    <div 
                        className="w-full max-w-3xl max-h-[90vh] rounded-3xl bg-white dark:bg-[#0c1220] border border-slate-200 dark:border-white/10 p-6 sm:p-7 shadow-2xl flex flex-col space-y-5"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4 shrink-0">
                            <div>
                                <h3 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white">
                                    Foto Mentahan Terpilih ({detailSelection.total_photos} Foto)
                                </h3>
                                <span className="text-[11px] font-mono text-slate-500">
                                    {detailSelection.user?.name || detailSelection.delivery?.client_name} • {detailSelection.delivery?.title}
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setDetailSelection(null)}
                                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Top Action: Copy File Names Button */}
                        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
                            <div className="text-xs">
                                <span className="text-slate-500 font-mono block">Ringkasan Biaya:</span>
                                <span className="font-bold text-slate-900 dark:text-white text-sm">
                                    Rp {Number(detailSelection.total_price).toLocaleString('id-ID')}
                                </span>
                                {detailSelection.discount_percent > 0 && (
                                    <span className="text-emerald-600 font-semibold text-[11px] ml-2">
                                        (Diskon {detailSelection.discount_percent}% • Hemat Rp {Number(detailSelection.discount_amount).toLocaleString('id-ID')})
                                    </span>
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={handleCopyFileNames}
                                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                                title="Salin daftar nama file untuk pencarian di Adobe Lightroom / Photoshop"
                            >
                                {copiedNames ? (
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

                        {detailSelection.notes && (
                            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-200 text-xs shrink-0">
                                <strong>Catatan dari Pelanggan:</strong> "{detailSelection.notes}"
                            </div>
                        )}

                        {/* Grid of Selected Photos */}
                        <div className="flex-1 overflow-y-auto pr-1">
                            {(!detailSelection.selected_photos || detailSelection.selected_photos.length === 0) ? (
                                <div className="text-center py-10 text-slate-500 text-xs font-mono">
                                    ID foto terpilih: {JSON.stringify(detailSelection.selected_photo_ids)}
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                    {detailSelection.selected_photos.map((photo, pIdx) => (
                                        <div 
                                            key={photo.id}
                                            onClick={() => setInspectPhoto(photo)}
                                            className="group relative rounded-xl overflow-hidden bg-slate-900 border border-slate-200 dark:border-white/10 hover:border-cyan-400 flex flex-col shadow-xs cursor-pointer transition-all hover:scale-[1.02]"
                                            title="Klik untuk perbesar foto"
                                        >
                                            <div className="aspect-[4/3] w-full relative bg-slate-950 overflow-hidden">
                                                <img
                                                    src={photo.preview_url || photo.file_url}
                                                    alt={photo.original_name}
                                                    loading="lazy"
                                                    onError={(e) => {
                                                        if (photo.file_url && e.target.src !== photo.file_url) {
                                                            e.target.src = photo.file_url;
                                                        }
                                                    }}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <span className="p-2 rounded-full bg-white/20 backdrop-blur-md text-white">
                                                        <Eye className="w-4 h-4" />
                                                    </span>
                                                </div>
                                                <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-cyan-500 text-slate-950 font-mono text-[9px] font-bold">
                                                    #{pIdx + 1}
                                                </span>
                                                <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded-md bg-black/70 text-slate-300 font-mono text-[9px]">
                                                    {photo.formatted_size}
                                                </span>
                                            </div>
                                            <div className="p-2 bg-white dark:bg-[#0c1220] text-[10px] font-mono font-bold text-slate-800 dark:text-white truncate">
                                                {photo.original_name}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Update Status Form */}
                        <form onSubmit={handleStatusSubmit} className="pt-3 border-t border-slate-200 dark:border-white/10 space-y-3 shrink-0">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                                        Perbarui Status Pengerjaan:
                                    </label>
                                    <select
                                        value={statusForm.status}
                                        onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/10 text-xs font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-cyan-500"
                                    >
                                        <option value="pending">Menunggu Konfirmasi (Pending)</option>
                                        <option value="in_review">Sedang Ditinjau Admin (In Review)</option>
                                        <option value="editing">Proses Editing Fotografer (Editing)</option>
                                        <option value="completed">Selesai Diedit & Diunggah ke Foto Jadi (Completed)</option>
                                        <option value="cancelled">Dibatalkan (Cancelled)</option>
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                                        Tanggapan / Catatan Admin untuk Klien:
                                    </label>
                                    <input
                                        type="text"
                                        value={statusForm.admin_notes}
                                        onChange={(e) => setStatusForm({ ...statusForm, admin_notes: e.target.value })}
                                        placeholder="Contoh: Foto sedang dalam proses retouching warna..."
                                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/10 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-2.5 pt-1">
                                <button
                                    type="button"
                                    onClick={() => setDetailSelection(null)}
                                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300 text-xs font-semibold"
                                >
                                    Tutup
                                </button>
                                <button
                                    type="submit"
                                    disabled={isUpdatingStatus}
                                    className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
                                >
                                    {isUpdatingStatus ? (
                                        <>
                                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                            <span>Menyimpan...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                                            <span>Simpan Status</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── MODAL: PERBESAR PRATINJAU FOTO TERPILIH ── */}
            {inspectPhoto && (
                <div 
                    className="fixed inset-0 h-dvh overflow-y-auto overscroll-contain z-[80] bg-black/95 backdrop-blur-md flex flex-col items-center justify-between p-4"
                    onClick={() => setInspectPhoto(null)}
                >
                    <div 
                        className="w-full max-w-5xl flex items-center justify-between text-white pb-3 border-b border-white/10"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-cyan-400">
                                {inspectPhoto.original_name}
                            </span>
                            <span className="text-slate-400 text-xs font-mono">
                                • {inspectPhoto.formatted_size}
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setInspectPhoto(null)}
                            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div 
                        className="flex-1 w-full max-w-5xl flex items-center justify-center p-2"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            src={inspectPhoto.preview_url || inspectPhoto.file_url}
                            alt={inspectPhoto.original_name}
                            className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl"
                        />
                    </div>

                    <div className="text-xs font-mono text-slate-400 pt-2">
                        Klik area di luar gambar atau tombol X untuk menutup
                    </div>
                </div>
            )}
        </div>
    );
}
