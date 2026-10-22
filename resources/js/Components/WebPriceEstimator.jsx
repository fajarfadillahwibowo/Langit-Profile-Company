import React, { useState, useMemo } from 'react';
import { Calculator, Check, ArrowRight, Clock, ShieldCheck, Sparkles } from 'lucide-react';

export default function WebPriceEstimator({ components = [] }) {
    // Default checked features
    const [selectedIds, setSelectedIds] = useState(() => {
        return components.slice(0, 2).map(c => c.id);
    });

    const toggleComponent = (id) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    // Calculate totals
    const { totalPrice, totalDays } = useMemo(() => {
        let price = 0;
        let days = 0;
        components.forEach(c => {
            if (selectedIds.includes(c.id)) {
                price += parseFloat(c.base_price || 0);
                days += parseInt(c.estimated_days || 0, 10);
            }
        });
        return { totalPrice: price, totalDays: days };
    }, [selectedIds, components]);

    const formatRupiah = (val) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(val);
    };

    const generateWhatsAppUrl = () => {
        const selectedTitles = components
            .filter(c => selectedIds.includes(c.id))
            .map(c => `- ${c.component_name} (${formatRupiah(c.base_price)})`)
            .join('\n');

        const message = `Halo Tim Web Langit,\nSaya baru saja mencoba Kalkulator Estimasi Proyek di website dengan pilihan fitur berikut:\n\n${selectedTitles}\n\n*Estimasi Total:* ${formatRupiah(totalPrice)}\n*Estimasi Pengerjaan:* ~${totalDays} Hari Kerja\n\nSaya ingin berkonsultasi lebih lanjut untuk detail pengerjaan. Terima kasih!`;
        return `https://wa.me/6281234567892?text=${encodeURIComponent(message)}`;
    };

    return (
        <div className="w-full max-w-5xl mx-auto rounded-3xl bg-white dark:bg-[#090D16]/90 border border-slate-200 dark:border-white/10 backdrop-blur-2xl p-6 md:p-8 shadow-xl dark:shadow-2xl transition-colors duration-300">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-white/10">
                <div>
                    <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 font-mono text-xs uppercase tracking-wider mb-1 font-bold">
                        <Calculator className="w-4 h-4" />
                        <span>Interactive Real-Time Calculator</span>
                    </div>
                    <h3 className="font-heading font-bold text-2xl text-slate-900 dark:text-white">
                        Simulasi Estimasi Biaya & Waktu Proyek Web
                    </h3>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-white/5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/5 shadow-sm">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Garansi Pemeliharaan 6 Bulan</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
                {/* Feature Selection Checkboxes (2 Cols) */}
                <div className="lg:col-span-2 space-y-2.5">
                    <p className="text-xs font-mono text-slate-600 dark:text-slate-400 mb-2">
                        Pilih modul dan fitur yang ingin Anda terapkan pada sistem web Anda:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {components.map((item) => {
                            const isChecked = selectedIds.includes(item.id);
                            return (
                                <div
                                    key={item.id}
                                    onClick={() => toggleComponent(item.id)}
                                    className={`cursor-pointer p-3.5 rounded-2xl border transition-all duration-200 flex items-start gap-3 select-none ${
                                        isChecked
                                            ? 'border-cyan-500 bg-cyan-50/70 dark:bg-cyan-500/10 shadow-md shadow-cyan-500/10'
                                            : 'border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] hover:bg-slate-100 dark:hover:bg-white/[0.05] hover:border-slate-300 dark:hover:border-white/10'
                                    }`}
                                >
                                    <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 border transition-colors ${
                                        isChecked
                                            ? 'bg-cyan-500 border-cyan-500 text-white font-bold'
                                            : 'border-slate-400 dark:border-slate-600 bg-white dark:bg-slate-900'
                                    }`}>
                                        {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-200 leading-snug">
                                            {item.component_name}
                                        </h4>
                                        <div className="flex items-center justify-between mt-1 text-xs font-mono">
                                            <span className="text-cyan-600 dark:text-cyan-400 font-bold">
                                                {formatRupiah(item.base_price)}
                                            </span>
                                            <span className="text-slate-500 flex items-center gap-1 font-medium">
                                                <Clock className="w-3 h-3" />
                                                +{item.estimated_days} Hari
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Summary Card (1 Col) */}
                <div className="p-6 rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white border border-cyan-500/40 flex flex-col justify-between shadow-2xl relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-500/20 rounded-full blur-2xl pointer-events-none"></div>

                    <div>
                        <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-bold flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5" />
                            Ringkasan Estimasi
                        </span>

                        <div className="mt-5 space-y-3">
                            <div className="flex items-baseline justify-between border-b border-white/10 pb-2">
                                <span className="text-xs text-slate-400">Total Fitur Terpilih:</span>
                                <span className="text-sm font-mono font-bold text-white">{selectedIds.length} Modul</span>
                            </div>

                            <div className="flex items-baseline justify-between border-b border-white/10 pb-2">
                                <span className="text-xs text-slate-400">Waktu Pengerjaan:</span>
                                <span className="text-sm font-mono font-bold text-amber-400 flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5" />
                                    ~{totalDays} Hari Kerja
                                </span>
                            </div>

                            <div className="pt-2">
                                <span className="text-xs text-slate-400 block mb-1">Perkiraan Investasi:</span>
                                <div className="text-3xl font-heading font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-white">
                                    {formatRupiah(totalPrice)}
                                </div>
                                <span className="text-[11px] text-slate-400 mt-1 block">
                                    *Belum termasuk domain & cloud hosting custom (opsional).
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-white/10 space-y-2.5">
                        <a
                            href={generateWhatsAppUrl()}
                            target="_blank"
                            rel="noreferrer"
                            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <span>Kirim Rincian via WhatsApp</span>
                            <ArrowRight className="w-4 h-4" />
                        </a>
                        <p className="text-center text-[10px] text-slate-400 font-mono">
                            Diskusi teknis gratis & penyesuaian arsitektur sistem
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
