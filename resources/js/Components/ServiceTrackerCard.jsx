import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Search, Loader2, CheckCircle2, Clock, AlertCircle, Cpu, 
    ShieldCheck, Wrench, Sparkles, Activity, Check, ArrowDownCircle,
    PackageCheck, CheckCircle
} from 'lucide-react';

export default function ServiceTrackerCard({ initialReceipt = '', autoSearch = false }) {
    const [receiptNumber, setReceiptNumber] = useState(initialReceipt || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [ticket, setTicket] = useState(null);

    const stages = [
        { 
            key: 'received', 
            label: 'Diterima & Diagnosa Awal', 
            desc: 'Unit diterima di meja servis lab Langit dan dilakukan inspeksi menyeluruh oleh teknisi spesialis.',
            num: '01',
            badge: 'Pemeriksaan Awal'
        },
        { 
            key: 'waiting_part', 
            label: 'Menunggu Alokasi Sparepart', 
            desc: 'Komponen pengganti, IC, atau part original dalam proses pengadaan dari distributor resmi.',
            num: '02',
            badge: 'Logistik Suku Cadang'
        },
        { 
            key: 'repairing', 
            label: 'Dalam Proses Pengerjaan & Reparasi', 
            desc: 'Proses perbaikan teknikal: penggantian part, instalasi komponen presisi, repasting, atau micro-soldering.',
            num: '03',
            badge: 'Teknisi Aktif'
        },
        { 
            key: 'qc_testing', 
            label: 'Uji Fungsi & Quality Control (QC)', 
            desc: 'Stress testing stabilitas, benchmarking suhu prosesor/GPU, memtest RAM, dan verifikasi fungsi menyeluruh.',
            num: '04',
            badge: 'Pengujian Mutu'
        },
        { 
            key: 'ready', 
            label: 'Siap Diambil / Diantar', 
            desc: 'Unit telah lulus QC 100%, dibersihkan secara steril, dan siap diambil di studio atau siap dikirim kembali.',
            num: '05',
            badge: 'Selesai & Bergaransi'
        },
    ];

    const handleSearch = async (query = receiptNumber) => {
        if (!query.trim()) return;
        setLoading(true);
        setError(null);

        try {
            const res = await axios.get(`/api/service-tracker/${encodeURIComponent(query.trim())}`);
            if (res.data.success) {
                setTicket(res.data.ticket);
            } else {
                setError(res.data.message || 'Data nota servis tidak ditemukan.');
                setTicket(null);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Nomor nota servis tidak terdaftar. Pastikan format benar (contoh: SRV-2026-0089).');
            setTicket(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (initialReceipt) {
            setReceiptNumber(initialReceipt);
            handleSearch(initialReceipt);
        }
    }, [initialReceipt]);

    const getCurrentStageIndex = (status) => {
        if (!status) return 0;
        const s = status.toLowerCase();
        if (s === 'completed' || s === 'ready') return 4;
        const idx = stages.findIndex(st => st.key === s);
        return idx !== -1 ? idx : 0;
    };

    const formatRupiah = (val) => {
        if (!val) return 'Dalam Perhitungan';
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(val);
    };

    return (
        <div className="w-full max-w-4xl mx-auto rounded-[32px] bg-white dark:bg-[#090D16]/95 border border-orange-400/40 dark:border-orange-500/30 backdrop-blur-2xl p-6 sm:p-8 md:p-10 shadow-xl dark:shadow-2xl relative overflow-hidden transition-colors duration-300">
            {/* Ambient background glow */}
            <div className="absolute -top-16 -right-16 w-56 h-56 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 relative z-10">
                <div>
                    <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 font-mono text-xs uppercase tracking-wider mb-1 font-bold">
                        <Cpu className="w-4 h-4" />
                        <span>Live Tracker & Status Servis Komputer</span>
                    </div>
                    <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white tracking-tight">
                        Lacak Progres Nota Servis Komputer & Laptop
                    </h3>
                </div>

                {/* Example Quick Presets */}
                <div className="flex items-center gap-2 text-xs font-mono shrink-0">
                    <span className="text-slate-500 font-medium">Coba Nota:</span>
                    <button
                        onClick={() => {
                            setReceiptNumber('SRV-2026-0089');
                            handleSearch('SRV-2026-0089');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-orange-500/15 text-orange-700 dark:text-orange-400 hover:bg-orange-500/25 border border-orange-400/30 transition-colors font-bold cursor-pointer"
                    >
                        SRV-2026-0089
                    </button>
                    <button
                        onClick={() => {
                            setReceiptNumber('SRV-2026-0090');
                            handleSearch('SRV-2026-0090');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/25 border border-emerald-400/30 transition-colors font-bold cursor-pointer"
                    >
                        SRV-2026-0090
                    </button>
                </div>
            </div>

            {/* Search Input Box */}
            <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="relative flex items-center z-10">
                <input
                    type="text"
                    value={receiptNumber}
                    onChange={(e) => setReceiptNumber(e.target.value.toUpperCase())}
                    placeholder="Masukkan Nomor Nota Servis (misal: SRV-2026-0089)..."
                    className="w-full pl-5 pr-32 py-4 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 font-mono text-sm md:text-base tracking-wider uppercase transition-all shadow-sm"
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="absolute right-2.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-md shadow-orange-500/30 transition-transform active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                    {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <>
                            <Search className="w-4 h-4" />
                            <span>Lacak</span>
                        </>
                    )}
                </button>
            </form>

            {/* Error Message */}
            {error && (
                <div className="mt-4 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-sm flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Results Stepper & Ticket Details */}
            {ticket && (
                <div className="mt-8 space-y-8 relative z-10">
                    {/* Header Ticket Information Card */}
                    <motion.div 
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: false, amount: 0.3 }}
                        transition={{ duration: 0.4 }}
                        className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono shadow-sm"
                    >
                        <div>
                            <span className="text-slate-500 text-[10px] uppercase block font-semibold">No. Nota</span>
                            <span className="font-bold text-orange-600 dark:text-orange-400 text-sm">{ticket.receipt_number}</span>
                        </div>
                        <div>
                            <span className="text-slate-500 text-[10px] uppercase block font-semibold">Pelanggan</span>
                            <span className="font-bold text-slate-900 dark:text-slate-200">{ticket.customer_name}</span>
                        </div>
                        <div>
                            <span className="text-slate-500 text-[10px] uppercase block font-semibold">Perangkat</span>
                            <span className="font-bold text-slate-900 dark:text-slate-200">{ticket.device_brand_model}</span>
                        </div>
                        <div>
                            <span className="text-slate-500 text-[10px] uppercase block font-semibold">Estimasi Biaya</span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">{formatRupiah(ticket.final_cost || ticket.estimated_cost)}</span>
                        </div>
                    </motion.div>

                    {/* ==============================================================
                        VERTICAL FLOW TIMELINE (Alur ke Bawah dengan Scroll Animation)
                       ============================================================== */}
                    <div>
                        <div className="text-xs font-mono text-slate-600 dark:text-slate-400 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-white/10 pb-3">
                            <span className="flex items-center gap-2 font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                                <Activity className="w-4 h-4 text-orange-500" />
                                Alur Tahapan Pengerjaan Lab Servis:
                            </span>
                            <span className="px-3 py-1 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-600 dark:text-orange-400 font-bold uppercase text-[11px] w-fit">
                                Status Unit: {ticket.status.replace('_', ' ')}
                            </span>
                        </div>

                        {/* Relative Vertical Spine & Stepper Nodes */}
                        <div className="relative pl-6 sm:pl-10">
                            {/* Animated Vertical Line Spine */}
                            <div className="absolute left-2.5 sm:left-4 top-4 bottom-6 w-1 bg-gradient-to-b from-emerald-500 via-orange-500 to-slate-200 dark:to-white/10 rounded-full" />

                            <div className="space-y-6">
                                {stages.map((stage, idx) => {
                                    const currentIdx = getCurrentStageIndex(ticket.status);
                                    const isPassed = idx < currentIdx;
                                    const isCurrent = idx === currentIdx;
                                    const isUpcoming = idx > currentIdx;

                                    return (
                                        <motion.div
                                            key={stage.key}
                                            initial={{ opacity: 0, y: 35, x: -10 }}
                                            whileInView={{ opacity: 1, y: 0, x: 0 }}
                                            viewport={{ once: false, amount: 0.2 }}
                                            transition={{ 
                                                duration: 0.5, 
                                                delay: idx * 0.08,
                                                type: 'spring',
                                                stiffness: 280,
                                                damping: 22 
                                            }}
                                            whileHover={{ x: 4 }}
                                            className="relative group"
                                        >
                                            {/* Step Indicator Node on Vertical Spine */}
                                            <div className="absolute -left-6 sm:-left-10 top-3 flex items-center justify-center">
                                                {isPassed ? (
                                                    <motion.div 
                                                        whileHover={{ scale: 1.2 }}
                                                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/30 ring-4 ring-white dark:ring-[#090D16] z-10"
                                                    >
                                                        <Check className="w-4 h-4 stroke-[3]" />
                                                    </motion.div>
                                                ) : isCurrent ? (
                                                    <div className="relative flex items-center justify-center z-10">
                                                        <span className="animate-ping absolute inline-flex h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-orange-400 opacity-75" />
                                                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-orange-600 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/40 ring-4 ring-white dark:ring-[#090D16]">
                                                            <Clock className="w-4 h-4 animate-spin stroke-[2.5]" style={{ animationDuration: '6s' }} />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-mono text-xs font-bold flex items-center justify-center ring-4 ring-white dark:ring-[#090D16] z-10">
                                                        {stage.num}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Step Content Card with Smooth Depth & Glow */}
                                            <div 
                                                className={`p-4 sm:p-5 rounded-2xl border transition-all duration-300 ${
                                                    isCurrent
                                                        ? 'bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent border-orange-500 shadow-lg shadow-orange-500/10 ring-1 ring-orange-500/40'
                                                        : isPassed
                                                        ? 'bg-gradient-to-r from-emerald-500/10 to-transparent border-emerald-500/40 dark:border-emerald-500/30'
                                                        : 'bg-slate-50/60 dark:bg-white/[0.02] border-slate-200 dark:border-white/5 opacity-60'
                                                }`}
                                            >
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-1.5">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ${
                                                            isCurrent 
                                                                ? 'bg-orange-500 text-slate-950' 
                                                                : isPassed 
                                                                ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30' 
                                                                : 'bg-slate-200 dark:bg-white/5 text-slate-500'
                                                        }`}>
                                                            Tahap {stage.num}
                                                        </span>
                                                        <h5 className={`font-heading font-extrabold text-base sm:text-lg ${
                                                            isCurrent
                                                                ? 'text-orange-700 dark:text-orange-300'
                                                                : isPassed
                                                                ? 'text-emerald-700 dark:text-emerald-300'
                                                                : 'text-slate-700 dark:text-slate-300'
                                                        }`}>
                                                            {stage.label}
                                                        </h5>
                                                    </div>

                                                    <span className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full w-fit ${
                                                        isCurrent
                                                            ? 'bg-orange-500/20 text-orange-600 dark:text-orange-400 border border-orange-500/30'
                                                            : isPassed
                                                            ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                                                            : 'text-slate-400 dark:text-slate-600'
                                                    }`}>
                                                        {isCurrent ? '⚡ SEDANG DIKERJAKAN' : isPassed ? '✓ SELESAI' : 'MENUNGGU ALUR'}
                                                    </span>
                                                </div>

                                                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mt-1">
                                                    {stage.desc}
                                                </p>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Problem & Diagnostic Deep-Dive (Animates on Scroll) */}
                    <motion.div 
                        initial={{ opacity: 0, y: 25 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: false, amount: 0.3 }}
                        transition={{ duration: 0.45 }}
                        className="p-5 sm:p-6 rounded-2xl bg-slate-50 dark:bg-[#0F1420] border border-slate-200 dark:border-white/5 space-y-3 text-xs shadow-sm"
                    >
                        <div>
                            <span className="font-mono text-slate-500 text-[10px] uppercase block font-semibold">Keluhan Awal:</span>
                            <p className="text-slate-800 dark:text-slate-300 mt-0.5 font-sans text-sm leading-relaxed">{ticket.problem_reported}</p>
                        </div>
                        {ticket.diagnosis_result && (
                            <div className="pt-3 border-t border-slate-200 dark:border-white/5">
                                <span className="font-mono text-orange-600 dark:text-orange-400 text-[10px] uppercase block font-bold">Hasil Diagnosa Lab Teknisi:</span>
                                <p className="text-slate-900 dark:text-slate-200 mt-0.5 font-sans text-sm leading-relaxed">{ticket.diagnosis_result}</p>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </div>
    );
}
