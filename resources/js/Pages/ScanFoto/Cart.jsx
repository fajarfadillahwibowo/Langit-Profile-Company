import React from 'react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import ScanCustomerLayout from '@/Layouts/ScanCustomerLayout';
import { Trash2, Send, Percent, ArrowLeft, Info, Loader2, ShoppingBag, Sparkles } from 'lucide-react';

function formatRupiah(num) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(num || 0);
}

export default function Cart({ selectedPhotos, pricing, discountRule }) {
    const { auth } = usePage().props;

    const { data, setData, post, processing } = useForm({
        whatsapp_number: auth?.user?.whatsapp_number || '',
        customer_notes: '',
    });

    const removePhoto = (photoId) => {
        router.post('/scan-foto/keranjang/toggle', { photo_id: photoId }, { preserveScroll: true });
    };

    const submitOrder = (e) => {
        e.preventDefault();
        post('/scan-foto/pesanan');
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
                        className="bg-[#0B1222]/95 border border-white/10 rounded-3xl p-10 text-center space-y-3 backdrop-blur-xl"
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
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                        <div className="lg:col-span-2 space-y-4">
                            {discountRule?.is_active && (
                                <motion.div
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`p-4 rounded-2xl border text-xs sm:text-sm space-y-2.5 backdrop-blur-md ${
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
                                            transition={{ duration: 0.5 }}
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
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.04 }}
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

                        <motion.form
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.08 }}
                            onSubmit={submitOrder}
                            className="bg-[#0B1222]/95 border border-sky-400/25 rounded-3xl p-5 sm:p-6 space-y-4 h-fit backdrop-blur-xl shadow-2xl shadow-sky-950/30"
                        >
                            <h3 className="font-heading text-base font-black text-white border-b border-white/10 pb-3">
                                Ringkasan Pesanan
                            </h3>

                            <div className="space-y-2.5 text-xs sm:text-sm">
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
                                <div className="flex justify-between pt-3 border-t border-white/10 text-base font-black text-white">
                                    <span>Total Bayar</span>
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-cyan-300">
                                        {formatRupiah(pricing.finalTotal)}
                                    </span>
                                </div>
                            </div>

                            <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 text-xs text-slate-300 space-y-1.5">
                                <div className="flex items-center gap-1.5 font-bold text-cyan-300">
                                    <Info className="w-3.5 h-3.5" />
                                    <span>Cara Pembayaran</span>
                                </div>
                                <p className="whitespace-pre-line text-slate-400 leading-relaxed">
                                    {discountRule?.manual_payment_info ||
                                        'Setelah mengirim pesanan, silakan konfirmasi pembayaran ke Admin agar foto asli dikirim ke menu Unduh Foto.'}
                                </p>
                            </div>

                            <div>
                                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                                    Nomor WhatsApp Anda
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
                                    Catatan (Opsional)
                                </label>
                                <textarea
                                    rows={2}
                                    value={data.customer_notes}
                                    onChange={(e) => setData('customer_notes', e.target.value)}
                                    placeholder="Tulis catatan jika ada..."
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#060B15] border border-white/12 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/30 focus:border-cyan-400 transition-all"
                                />
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
                                        <span>Mengirim...</span>
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4" />
                                        <span>Pesan ke Admin</span>
                                    </>
                                )}
                            </motion.button>
                        </motion.form>
                    </div>
                )}
            </div>
        </ScanCustomerLayout>
    );
}
