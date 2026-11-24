import React from 'react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import ScanCustomerLayout from '@/Layouts/ScanCustomerLayout';
import { Trash2, Send, Percent, ArrowLeft, Info, Loader2 } from 'lucide-react';

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

    return (
        <ScanCustomerLayout title="Keranjang">
            <Head title="Keranjang" />

            <div className="space-y-4 animate-fade-in">
                <Link
                    href="/scan-foto/hasil"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-400 hover:text-sky-300"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Kembali ke Foto Saya</span>
                </Link>

                {selectedPhotos.length === 0 ? (
                    <div className="bg-[#111827] border border-slate-800 rounded-2xl p-8 text-center space-y-3">
                        <p className="text-sm font-bold text-white">Keranjang masih kosong</p>
                        <p className="text-xs text-slate-400">
                            Silakan pilih foto terlebih dahulu dari galeri hasil scan Anda.
                        </p>
                        <Link
                            href="/scan-foto/hasil"
                            className="min-h-11 inline-flex items-center px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs"
                        >
                            Pilih Foto
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <div className="lg:col-span-2 space-y-3">
                            {discountRule?.is_active && (
                                <div
                                    className={`p-3.5 rounded-2xl border text-xs sm:text-sm flex items-center gap-2.5 ${
                                        pricing.qualifiesDiscount
                                            ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-200'
                                            : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                                    }`}
                                >
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
                            )}

                            <div className="bg-[#111827] border border-slate-800 rounded-2xl divide-y divide-slate-800">
                                {selectedPhotos.map((photo) => (
                                    <div key={photo.id} className="p-3.5 flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <img
                                                src={photo.preview_url}
                                                alt={photo.title}
                                                className="w-14 h-14 rounded-xl object-cover bg-slate-900 shrink-0"
                                            />
                                            <div className="min-w-0">
                                                <p className="text-xs font-semibold text-white truncate">{photo.title}</p>
                                                <p className="text-sm font-bold text-sky-400 mt-0.5">
                                                    {formatRupiah(photo.price)}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removePhoto(photo.id)}
                                            className="min-w-10 min-h-10 flex items-center justify-center rounded-xl bg-rose-500/10 hover:bg-rose-500/20 active:scale-95 text-rose-400 transition-all cursor-pointer shrink-0"
                                            aria-label="Hapus foto"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <form
                            onSubmit={submitOrder}
                            className="bg-[#111827] border border-slate-800 rounded-2xl p-5 space-y-4 h-fit"
                        >
                            <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3">
                                Ringkasan Pesanan
                            </h3>

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
                                <div className="flex justify-between pt-2.5 border-t border-slate-800 text-base font-bold text-white">
                                    <span>Total</span>
                                    <span className="text-sky-400">{formatRupiah(pricing.finalTotal)}</span>
                                </div>
                            </div>

                            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-1">
                                <div className="flex items-center gap-1.5 font-semibold text-sky-300">
                                    <Info className="w-3.5 h-3.5" />
                                    <span>Cara Pembayaran</span>
                                </div>
                                <p className="whitespace-pre-line text-slate-400 leading-relaxed">
                                    {discountRule?.manual_payment_info ||
                                        'Setelah mengirim pesanan, silakan konfirmasi pembayaran ke Admin agar foto asli dikirim ke menu Unduh Foto.'}
                                </p>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                                    Nomor WhatsApp Anda
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={data.whatsapp_number}
                                    onChange={(e) => setData('whatsapp_number', e.target.value)}
                                    placeholder="081234567890"
                                    className="w-full min-h-11 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-sky-400"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                                    Catatan (Opsional)
                                </label>
                                <textarea
                                    rows={2}
                                    value={data.customer_notes}
                                    onChange={(e) => setData('customer_notes', e.target.value)}
                                    placeholder="Tulis catatan jika ada..."
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-sky-400"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full min-h-12 py-3 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 active:scale-[0.98] text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
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
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </ScanCustomerLayout>
    );
}
