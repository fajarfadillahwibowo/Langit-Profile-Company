import React, { useState, useMemo } from 'react';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import PublicLayout from '@/Layouts/PublicLayout';
import { 
    PackageCheck, ShoppingBag, Calendar, Plus, Minus, Trash2,
    ArrowRight, ShieldCheck, CheckCircle2, AlertCircle, X, Check, Loader2, Sparkles
} from 'lucide-react';

export default function RentalEquipmentView({ service, equipments = [] }) {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [filterOnlyAvailable, setFilterOnlyAvailable] = useState(false);

    // Rental Cart State (PRD 4.6)
    const [cart, setCart] = useState([]); // [{ item, qty }]
    const [startDate, setStartDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        return d.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() + 3);
        return d.toISOString().split('T')[0];
    });

    // Checkout Modal State
    const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
    const [customerName, setCustomerName] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [idType, setIdType] = useState('KTP');
    const [loadingCheckout, setLoadingCheckout] = useState(false);
    const [checkoutResult, setCheckoutResult] = useState(null);

    const categories = [
        { key: 'all', label: 'Semua Alat' },
        { key: 'proyektor', label: '1. Proyektor & Screen' },
        { key: 'tv', label: '2. TV & Standing Bracket' },
        { key: 'drone', label: '3. Drone & Aerial 4K' },
    ];

    const filteredEquipments = equipments.filter(item => {
        const matchCat = selectedCategory === 'all' || item.category === selectedCategory;
        const matchStock = !filterOnlyAvailable || item.stock_available > 0;
        return matchCat && matchStock;
    });

    // Cart Management
    const addToCart = (item) => {
        setCart(prev => {
            const existing = prev.find(p => p.item.id === item.id);
            if (existing) {
                if (existing.qty < item.stock_available) {
                    return prev.map(p => p.item.id === item.id ? { ...p, qty: p.qty + 1 } : p);
                }
                return prev;
            }
            return [...prev, { item, qty: 1 }];
        });
    };

    const updateQty = (id, delta) => {
        setCart(prev => {
            return prev.map(p => {
                if (p.item.id === id) {
                    const newQty = p.qty + delta;
                    if (newQty <= 0) return null;
                    if (newQty > p.item.stock_available) return p;
                    return { ...p, qty: newQty };
                }
                return p;
            }).filter(Boolean);
        });
    };

    const removeFromCart = (id) => {
        setCart(prev => prev.filter(p => p.item.id !== id));
    };

    // Calculate duration in days
    const totalDays = useMemo(() => {
        if (!startDate || !endDate) return 1;
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 1;
    }, [startDate, endDate]);

    // Calculate Price using PRD formula:
    // Total Biaya = sum(Harga Alat per Hari x Qty) x Durasi Hari - Diskon Durasi
    const { dailySubtotal, discount, grandTotal } = useMemo(() => {
        const sub = cart.reduce((acc, curr) => acc + (parseFloat(curr.item.price_per_day) * curr.qty), 0);
        const rawTotal = sub * totalDays;
        // Discount 10% for rentals >= 3 days, 20% for rentals >= 7 days
        let disc = 0;
        if (totalDays >= 7) {
            disc = rawTotal * 0.20;
        } else if (totalDays >= 3) {
            disc = rawTotal * 0.10;
        }
        return {
            dailySubtotal: sub,
            discount: disc,
            grandTotal: rawTotal - disc,
        };
    }, [cart, totalDays]);

    const formatRupiah = (val) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(val);
    };

    const handleCheckoutSubmit = async (e) => {
        e.preventDefault();
        setLoadingCheckout(true);

        const rentedItemsData = cart.map(c => ({
            id: c.item.id,
            name: c.item.name,
            qty: c.qty,
            price: parseFloat(c.item.price_per_day),
        }));

        try {
            const res = await axios.post('/sewa-alat/checkout', {
                customer_name: customerName,
                whatsapp: whatsapp,
                identity_card_type: idType,
                start_date: startDate,
                end_date: endDate,
                total_days: totalDays,
                rented_items: rentedItemsData,
                total_price: grandTotal,
            });

            if (res.data.success) {
                setCheckoutResult(res.data);
                setCart([]);
            }
        } catch (err) {
            alert('Gagal memproses booking. Mohon periksa kembali formulir Anda.');
        } finally {
            setLoadingCheckout(false);
        }
    };

    return (
        <PublicLayout activeService="sewa-alat">
            <Head>
                <title>Katalog Sewa Alat Produksi & Kamera Cinema</title>
                <meta name="description" content="Rental kamera sinema Sony FX3, lensa G Master, gimbal DJI RS3 Pro, drone DJI Mavic 3 Pro, dan lighting Aputure terkalibrasi dengan syarat jaminan mudah." />
            </Head>

            {/* Atmosphere: Equipment Rental Marketplace & Catalog Layout */}
            <div className="bg-slate-50 dark:bg-[#051110] min-h-screen text-slate-800 dark:text-slate-100 -mt-6 pt-6 transition-colors duration-300">
                {/* Hero Header */}
                <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pt-6 pb-12 text-center space-y-4">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-600 dark:text-teal-300 text-xs font-mono tracking-wider">
                        <PackageCheck className="w-3.5 h-3.5" />
                        <span>EQUIPMENT RENTAL MARKETPLACE & CATALOG</span>
                    </div>

                    <h1 className="font-heading font-extrabold text-3xl sm:text-5xl lg:text-6xl text-slate-900 dark:text-white tracking-tight leading-tight max-w-4xl mx-auto">
                        Sewa Proyektor, TV & Drone, <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 via-emerald-500 to-teal-700 dark:from-teal-400 dark:via-emerald-300 dark:to-white">
                            Unit Siap Pakai & Bergaransi.
                        </span>
                    </h1>

                    <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
                        Pilihan lengkap unit Proyektor + Screen tripod, Smart TV 55" / 65" 4K dengan standing bracket beroda untuk pameran & event, serta Drone 4K siap terbang.
                    </p>
                </section>

                {/* Main Catalog & Sticky Cart Grid (PRD 4.6) */}
                <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-20">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* Equipment Catalog (8 Cols) */}
                        <div className="lg:col-span-8 space-y-6">
                            {/* Filter Bar */}
                            <div className="p-4 rounded-2xl bg-white dark:bg-[#091816]/90 border border-slate-200 dark:border-teal-500/20 shadow-sm dark:shadow-none backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
                                    {categories.map((c) => (
                                        <button
                                            key={c.key}
                                            onClick={() => setSelectedCategory(c.key)}
                                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                                                selectedCategory === c.key
                                                    ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/30'
                                                    : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10'
                                            }`}
                                        >
                                            {c.label}
                                        </button>
                                    ))}
                                </div>

                                <label className="flex items-center gap-2 text-xs font-mono text-slate-700 dark:text-slate-300 cursor-pointer select-none shrink-0">
                                    <input
                                        type="checkbox"
                                        checked={filterOnlyAvailable}
                                        onChange={(e) => setFilterOnlyAvailable(e.target.checked)}
                                        className="rounded border-teal-500 text-teal-600 focus:ring-teal-400"
                                    />
                                    <span>Hanya Stok Tersedia</span>
                                </label>
                            </div>

                            {/* Equipment Cards Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {filteredEquipments.map((item) => {
                                    const inCart = cart.find(c => c.item.id === item.id);
                                    const specs = item.specs_json || {};

                                    return (
                                        <div
                                            key={item.id}
                                            className="p-4 rounded-2xl bg-white dark:bg-[#091816]/80 border border-slate-200 dark:border-white/10 hover:border-teal-500/40 backdrop-blur-xl transition-all flex flex-col justify-between group shadow-sm dark:shadow-lg"
                                        >
                                            <div>
                                                {/* Image Thumbnail */}
                                                <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-slate-950 mb-3 border border-slate-100 dark:border-white/5">
                                                    <img
                                                        src={item.thumbnail_webp}
                                                        alt={item.name}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    />
                                                    <span className={`absolute top-2.5 right-2.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                                                        item.stock_available > 0
                                                            ? 'bg-emerald-500/90 text-slate-950 shadow'
                                                            : 'bg-rose-500/90 text-white'
                                                    }`}>
                                                        {item.stock_available > 0 ? `Tersedia: ${item.stock_available} Unit` : 'Sedang Disewa'}
                                                    </span>
                                                </div>

                                                <span className="text-[10px] font-mono uppercase tracking-wider text-teal-600 dark:text-teal-400 font-semibold">{item.brand}</span>
                                                <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-300 transition-colors">
                                                    {item.name}
                                                </h3>

                                                {/* Specs Pills */}
                                                <div className="mt-2 flex flex-wrap gap-1">
                                                    {Object.entries(specs).slice(0, 2).map(([key, val], i) => (
                                                        <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/5">
                                                            {key}: {val}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                                                <div>
                                                    <span className="text-[10px] font-mono text-slate-500 uppercase block">Sewa / 24 Jam:</span>
                                                    <span className="text-sm font-mono font-bold text-teal-600 dark:text-teal-300">
                                                        {formatRupiah(item.price_per_day)}
                                                    </span>
                                                </div>

                                                {item.stock_available > 0 ? (
                                                    <button
                                                        onClick={() => addToCart(item)}
                                                        className="px-3.5 py-1.5 rounded-xl bg-teal-500/15 hover:bg-teal-500/25 text-teal-700 dark:text-teal-300 border border-teal-500/40 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95"
                                                    >
                                                        <Plus className="w-3.5 h-3.5" />
                                                        <span>{inCart ? `+Tambah (${inCart.qty})` : 'Pilih Alat'}</span>
                                                    </button>
                                                ) : (
                                                    <span className="text-xs font-mono text-slate-400">Stok Habis</span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Sticky Rental Cart (4 Cols) (PRD 4.6) */}
                        <div className="lg:col-span-4 sticky top-24">
                            <div className="p-6 rounded-3xl bg-white dark:bg-[#081513]/95 border border-slate-200 dark:border-teal-500/30 backdrop-blur-2xl shadow-xl dark:shadow-2xl space-y-5">
                                <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-3">
                                    <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 font-mono text-xs uppercase font-semibold">
                                        <ShoppingBag className="w-4 h-4" />
                                        <span>Keranjang Simulasi Sewa</span>
                                    </div>
                                    <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-700 dark:text-teal-300">
                                        {cart.length} Item
                                    </span>
                                </div>

                                {/* Date Range Picker */}
                                <div className="space-y-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5">
                                    <span className="text-[11px] font-mono text-slate-700 dark:text-slate-400 block font-semibold">Tentukan Tanggal Sewa:</span>
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div>
                                            <label className="text-[10px] text-slate-500 block mb-1">Tgl Ambil:</label>
                                            <input
                                                type="date"
                                                value={startDate}
                                                onChange={(e) => setStartDate(e.target.value)}
                                                className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white font-mono text-xs"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-slate-500 block mb-1">Tgl Kembali:</label>
                                            <input
                                                type="date"
                                                value={endDate}
                                                onChange={(e) => setEndDate(e.target.value)}
                                                className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white font-mono text-xs"
                                            />
                                        </div>
                                    </div>
                                    <div className="text-center pt-1">
                                        <span className="text-xs font-mono text-teal-700 dark:text-teal-300 font-bold bg-teal-500/10 px-3 py-1 rounded-full border border-teal-500/20">
                                            Durasi Sewa: {totalDays} Hari
                                        </span>
                                    </div>
                                </div>

                                {/* Cart Items List */}
                                <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                                    {cart.length === 0 ? (
                                        <div className="text-center py-8 text-xs text-slate-400 dark:text-slate-500 font-mono">
                                            Keranjang sewa masih kosong. Pilih alat di katalog untuk melihat simulasi total biaya.
                                        </div>
                                    ) : (
                                        cart.map(({ item, qty }) => (
                                            <div key={item.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 flex items-center justify-between text-xs">
                                                <div className="min-w-0 flex-1 pr-2">
                                                    <h5 className="font-semibold text-slate-900 dark:text-white truncate">{item.name}</h5>
                                                    <span className="text-[10px] font-mono text-teal-600 dark:text-teal-400">{formatRupiah(item.price_per_day)} / hr</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 shrink-0">
                                                    <button
                                                        onClick={() => updateQty(item.id, -1)}
                                                        className="w-6 h-6 rounded bg-slate-200 dark:bg-white/5 hover:bg-slate-300 dark:hover:bg-white/10 flex items-center justify-center text-slate-700 dark:text-slate-300"
                                                    >
                                                        <Minus className="w-3 h-3" />
                                                    </button>
                                                    <span className="w-5 text-center font-mono font-bold text-slate-900 dark:text-white text-xs">{qty}</span>
                                                    <button
                                                        onClick={() => updateQty(item.id, 1)}
                                                        className="w-6 h-6 rounded bg-slate-200 dark:bg-white/5 hover:bg-slate-300 dark:hover:bg-white/10 flex items-center justify-center text-slate-700 dark:text-slate-300"
                                                    >
                                                        <Plus className="w-3 h-3" />
                                                    </button>
                                                    <button
                                                        onClick={() => removeFromCart(item.id)}
                                                        className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 ml-1"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* Mathematical Calculations Summary */}
                                {cart.length > 0 && (
                                    <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-white/10 text-xs font-mono">
                                        <div className="flex justify-between text-slate-600 dark:text-slate-400">
                                            <span>Subtotal / Hari:</span>
                                            <span className="text-slate-900 dark:text-white font-bold">{formatRupiah(dailySubtotal)}</span>
                                        </div>
                                        <div className="flex justify-between text-slate-600 dark:text-slate-400">
                                            <span>Durasi ({totalDays} Hari):</span>
                                            <span className="text-slate-900 dark:text-white font-bold">{formatRupiah(dailySubtotal * totalDays)}</span>
                                        </div>
                                        {discount > 0 && (
                                            <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                                                <span>Diskon Durasi:</span>
                                                <span>-{formatRupiah(discount)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between text-sm font-bold text-slate-900 dark:text-white pt-2 border-t border-slate-100 dark:border-white/5">
                                            <span>Total Biaya:</span>
                                            <span className="text-teal-600 dark:text-teal-400 text-base">{formatRupiah(grandTotal)}</span>
                                        </div>

                                        <button
                                            onClick={() => setCheckoutModalOpen(true)}
                                            className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-teal-500/25 transition-transform active:scale-95"
                                        >
                                            <span>Booking & Cetak Invoice WA</span>
                                            <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* One-Click Booking & Syarat Sewa Modal (PRD 4.6) */}
            {checkoutModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 dark:bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
                    <div className="relative max-w-lg w-full bg-white dark:bg-[#081513] border border-slate-200 dark:border-teal-500/30 rounded-3xl p-6 md:p-8 shadow-2xl">
                        <button
                            onClick={() => {
                                setCheckoutModalOpen(false);
                                setCheckoutResult(null);
                            }}
                            className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 font-mono text-xs uppercase mb-1">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Konfirmasi Booking Sewa Alat</span>
                        </div>
                        <h3 className="font-heading font-bold text-2xl text-slate-900 dark:text-white mb-1">
                            Lengkapi Data Penyewa
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mb-6">
                            Durasi: <strong className="text-teal-700 dark:text-teal-300 font-mono">{totalDays} Hari</strong> ({startDate} s/d {endDate}) | Total: <strong className="text-emerald-700 dark:text-emerald-300 font-mono">{formatRupiah(grandTotal)}</strong>
                        </p>

                        {checkoutResult ? (
                            <div className="p-6 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-center space-y-4">
                                <div className="w-14 h-14 rounded-full bg-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto">
                                    <Check className="w-8 h-8 stroke-[3]" />
                                </div>
                                <h4 className="text-xl font-bold text-slate-900 dark:text-white">Booking Berhasil Diterbitkan!</h4>
                                <div className="p-3 rounded-xl bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/5 font-mono text-xs">
                                    <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Kode Booking Anda:</span>
                                    <span className="text-teal-600 dark:text-teal-400 font-bold text-lg">{checkoutResult.booking_code}</span>
                                </div>
                                <p className="text-xs text-slate-600 dark:text-slate-300">
                                    Data pesanan Anda telah tersimpan di database Admin Langit. Silakan lanjutkan membuka WhatsApp untuk verifikasi pengambilan alat.
                                </p>
                                <a
                                    href={checkoutResult.wa_link}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-500 text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/30 hover:bg-teal-400"
                                >
                                    <span>Buka WhatsApp & Kirim Detail Booking</span>
                                    <ArrowRight className="w-4 h-4" />
                                </a>
                            </div>
                        ) : (
                            <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-mono text-slate-700 dark:text-slate-300 mb-1">Nama Lengkap Penyewa *</label>
                                    <input
                                        type="text"
                                        required
                                        value={customerName}
                                        onChange={(e) => setCustomerName(e.target.value)}
                                        placeholder="Sesuai kartu identitas..."
                                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-teal-500"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-mono text-slate-700 dark:text-slate-300 mb-1">WhatsApp Aktif *</label>
                                        <input
                                            type="text"
                                            required
                                            value={whatsapp}
                                            onChange={(e) => setWhatsapp(e.target.value)}
                                            placeholder="0812xxxxxxx"
                                            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-teal-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-mono text-slate-700 dark:text-slate-300 mb-1">Jaminan Identitas Asli *</label>
                                        <select
                                            value={idType}
                                            onChange={(e) => setIdType(e.target.value)}
                                            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-teal-500"
                                        >
                                            <option value="KTP">KTP Asli</option>
                                            <option value="SIM">SIM A/C Asli</option>
                                            <option value="KTM">KTM Mahasiswa Aktif</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
                                    <span className="font-semibold text-slate-800 dark:text-slate-200 block">Syarat & Ketentuan Sewa:</span>
                                    <p>1. Wajib menitipkan 1 kartu identitas fisik asli pada saat serah terima alat di studio.</p>
                                    <p>2. Cek fisik & tes fungsi bersama teknisi sebelum alat dibawa.</p>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loadingCheckout}
                                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-teal-500/25 transition-transform active:scale-95 disabled:opacity-50"
                                >
                                    {loadingCheckout ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <>
                                            <span>Simpan Booking & Buka WhatsApp</span>
                                            <ArrowRight className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </PublicLayout>
    );
}
