import React, { useMemo } from 'react';
import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import { 
    Wrench, Clock, CheckCircle2, ShieldCheck,
    ArrowRight, PhoneCall, MessageSquare, Zap
} from 'lucide-react';
import { getWhatsAppUrl } from '@/Utils/whatsapp';

export default function ComputerServiceView({ service, galleries = [] }) {
    const servicePresets = {
        software: {
            title: 'Installasi Software',
            badge: 'OS & Aplikasi',
            badgeColor: 'bg-sky-500 text-white shadow-sm',
            desc: 'Instalasi sistem operasi dan software resmi dengan optimasi kecepatan penuh, bebas bloatware, dan perlindungan keamanan data.',
            items: [
                'Fresh Install Windows 10/11 Pro & macOS Sequoia Original',
                'Instalasi Software Desain & Kerja (Adobe CC, Office, CAD, dll)',
                'Driver Hardware Certified & Optimalisasi Startup',
                'Backup Data Penting & Pembersihan Malware/Virus',
            ],
            estCost: 'Rp 100.000 - Rp 200.000',
            estTime: '1 - 2 Jam Selesai',
            image: '/images/services/service_software.jpg',
        },
        hardware: {
            title: 'Upgrade SSD',
            badge: 'Speed Boost 10x',
            badgeColor: 'bg-amber-500 text-slate-950 font-bold shadow-sm',
            desc: 'Tingkatkan performa laptop atau PC lemot menjadi super kencang dengan SSD NVMe M.2 Gen4 atau SSD SATA berkualitas tinggi.',
            items: [
                'Upgrade SSD NVMe Gen3/Gen4 (Kecepatan hingga 7000MB/s)',
                'Kloning Sistem Operasi & Data 100% Aman Tanpa Hilang',
                'Pilihan Kapasitas: 256GB, 512GB, 1TB, hingga 2TB',
                'Garansi SSD Resmi Distributor 3 - 5 Tahun',
            ],
            estCost: 'Rp 150.000 (+ Harga SSD Pilihan)',
            estTime: '1 Jam Langsung Jadi',
            image: '/images/services/service_ssd.jpg',
        },
        custom_pc: {
            title: 'Rakit PC (Custom Build)',
            badge: 'Custom Rig & Tuning',
            badgeColor: 'bg-indigo-600 text-white shadow-sm',
            desc: 'Jasa perakitan PC Gaming, Editing Video 4K, Konten Kreator, Arsitektur, dan Workstation AI dengan standar kerapian profesional.',
            items: [
                'Perakitan Komponen Presisi & Thermal Paste Premium',
                'Professional Cable Management Super Rapi & Estetis',
                'Optimalisasi Airflow Casing & Pengaturan Kurva Kipas',
                'Stress Testing Stabilitas (3DMark & Cinebench) + Update BIOS',
            ],
            estCost: 'Rp 250.000 - Rp 450.000',
            estTime: '3 - 5 Jam Selesai',
            image: '/images/services/service_pc.jpg',
        },
        sparepart: {
            title: 'Penggantian Part',
            badge: 'Sparepart Original',
            badgeColor: 'bg-emerald-600 text-white shadow-sm',
            desc: 'Penggantian komponen hardware laptop dan PC yang rusak atau aus dengan suku cadang original bergaransi resmi toko.',
            items: [
                'Ganti Layar LCD / IPS Laptop Pecah, Bergaris, atau Blank',
                'Ganti Baterai Original Laptop (Baterai Drop / Kembung)',
                'Ganti Keyboard Laptop Macet / Tombol Hilang',
                'Penggantian Motherboard, Power Supply (PSU), Kipas, & Engsel',
            ],
            estCost: 'Mulai Rp 150.000 (+ Part)',
            estTime: '1 Hari Kerja Selesai',
            image: '/images/services/service_part.jpg',
        },
    };

    // Strict Dynamic Sync: Catalog cards strictly reflect active galleries in admin!
    const coreServices = useMemo(() => {
        if (!galleries || galleries.length === 0) {
            return Object.keys(servicePresets).map((cat, idx) => ({
                id: cat,
                num: String(idx + 1).padStart(2, '0'),
                ...servicePresets[cat],
            }));
        }

        return galleries.map((g, idx) => {
            const matchedKey = Object.keys(servicePresets).find(k => 
                g.category === k || 
                g.slug?.toLowerCase().includes(k) || 
                g.title?.toLowerCase().includes(k)
            ) || 'hardware';
            const preset = servicePresets[matchedKey] || servicePresets.hardware;

            return {
                id: g.id,
                num: String(idx + 1).padStart(2, '0'),
                title: g.title || preset.title,
                badge: g.exif_metadata_json?.lens || preset.badge,
                badgeColor: preset.badgeColor,
                image: g.file_webp_path || preset.image,
                desc: preset.desc,
                items: preset.items,
                estCost: g.exif_metadata_json?.aperture || preset.estCost,
                estTime: g.exif_metadata_json?.shutter || preset.estTime,
            };
        });
    }, [galleries]);

    return (
        <PublicLayout activeService="computer-service">
            <Head>
                <title>Layanan Servis Komputer & Laptop Profesional | Langit Computer</title>
                <meta name="description" content="Pusat layanan servis komputer, laptop, dan PC rakitan profesional di Langit. Melayani instalasi software, upgrade SSD/RAM, perbaikan hardware, rakit PC custom, dan penggantian sparepart bergaransi resmi." />
            </Head>

            {/* Atmosphere: Professional Computer Service Center Layout */}
            <div className="bg-[#EDF9FC] dark:bg-[#120A05] min-h-screen text-slate-800 dark:text-slate-100 pt-2 sm:pt-6 transition-colors duration-300">
                {/* Hero Header */}
                <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pt-6 pb-12 text-center space-y-4">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-600 dark:text-orange-400 text-xs font-mono tracking-wider font-semibold">
                        <Wrench className="w-3.5 h-3.5" />
                        <span>PUSAT LAYANAN & SERVIS KOMPUTER PROFESIONAL</span>
                    </div>

                    <h1 className="font-heading font-extrabold text-3xl sm:text-5xl lg:text-6xl text-slate-900 dark:text-white tracking-tight leading-tight max-w-4xl mx-auto">
                        Layanan Servis Komputer & Laptop <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-amber-500 to-orange-700 dark:from-orange-400 dark:via-amber-300 dark:to-white">
                            Solusi Cepat, Tuntas & Bergaransi.
                        </span>
                    </h1>

                    <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
                        Kami siap melayani segala kebutuhan perbaikan dan perawatan komputer, laptop, serta PC Anda—mulai dari instalasi software, upgrade performa SSD, rakit PC custom, hingga penggantian sparepart original dengan diagnosa akurat, pengerjaan transparan, dan garansi resmi.
                    </p>

                    <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                        <Link
                            href="/konsultasi"
                            className="px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-lg shadow-orange-500/25 transition-transform hover:scale-105 active:scale-95"
                        >
                            <span>Konsultasi Servis Sekarang</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                        <a
                            href={getWhatsAppUrl('computer-service', { category: 'Konsultasi Cepat Teknisi' })}
                            target="_blank"
                            rel="noreferrer"
                            className="px-5 py-3 rounded-xl bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-900 dark:text-white border border-slate-300 dark:border-white/10 text-sm font-semibold transition-colors flex items-center gap-2 shadow-xs"
                        >
                            <PhoneCall className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            <span>WhatsApp Teknisi (Fast Response)</span>
                        </a>
                    </div>
                </section>

                {/* 0. 4 Layanan Utama Computer Service */}
                <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-14">
                    <div className="text-center max-w-2xl mx-auto mb-10">
                        <span className="text-xs font-mono text-orange-600 dark:text-orange-400 uppercase tracking-wider block mb-1 font-bold">
                            Katalog Layanan Servis Komputer & Laptop
                        </span>
                        <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white">
                            {coreServices.length} Layanan Utama Servis Komputer
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-2">
                            Dikerjakan langsung oleh teknisi berpengalaman dengan peralatan diagnostik presisi, suku cadang original, dan garansi pengerjaan tuntas.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {coreServices.map((srv) => (
                            <div 
                                key={srv.num}
                                className="rounded-[28px] overflow-hidden bg-white dark:bg-[#0E0703]/90 border border-slate-200 dark:border-white/10 hover:border-orange-500/50 shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group"
                            >
                                {/* Top Image Area (matching user reference image) */}
                                <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-100 dark:bg-slate-900">
                                    <img
                                        src={srv.image}
                                        alt={srv.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        loading="lazy"
                                    />
                                    <div className="absolute top-3 left-3">
                                        <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white border border-white/20 shadow-sm">
                                            {srv.num}
                                        </span>
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                                </div>

                                {/* Card Body */}
                                <div className="p-6 flex-1 flex flex-col justify-between">
                                    <div>
                                        {/* Category Pill (matching reference image) */}
                                        <div className="mb-3">
                                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${srv.badgeColor}`}>
                                                {srv.badge}
                                            </span>
                                        </div>

                                        {/* Title */}
                                        <h3 className="font-heading font-extrabold text-xl text-slate-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors leading-snug">
                                            {srv.title}
                                        </h3>

                                        {/* Description */}
                                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mt-2.5 line-clamp-3">
                                            {srv.desc}
                                        </p>

                                        {/* Feature Checklist */}
                                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 space-y-1.5">
                                            {srv.items.slice(0, 3).map((item, iIdx) => (
                                                <div key={iIdx} className="flex items-start gap-1.5 text-[11px] text-slate-700 dark:text-slate-300">
                                                    <CheckCircle2 className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400 shrink-0 mt-0.5" />
                                                    <span className="line-clamp-1">{item}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Card Estimation & Consultation Footer */}
                                    <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-1.5 text-xs font-mono text-slate-600 dark:text-slate-400">
                                            <Clock className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400 shrink-0" />
                                            <span className="font-semibold">{srv.estTime}</span>
                                        </div>

                                        <a
                                            href={getWhatsAppUrl('computer-service', { 
                                                category: srv.title,
                                                details: `Estimasi waktu: ${srv.estTime}. Pembahasan: ${srv.items.slice(0, 2).join(', ')}`
                                            })}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-slate-950 font-bold text-xs shadow-sm transition-transform hover:scale-105 active:scale-95 shrink-0 flex items-center gap-1"
                                        >
                                            <span>Konsultasi</span>
                                            <ArrowRight className="w-3.5 h-3.5" />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 1. Alur Servis Komputer yang Sederhana & Masuk Akal */}
                <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-16">
                    <div className="text-center max-w-2xl mx-auto mb-10">
                        <span className="text-xs font-mono text-orange-600 dark:text-orange-400 uppercase tracking-wider block mb-1 font-bold">
                            Alur Pengerjaan Servis
                        </span>
                        <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white">
                            4 Langkah Mudah Servis di Langit
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-1.5">
                            Proses servis yang terstruktur, transparan di depan Anda, dan tanpa biaya tersembunyi.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {[
                            {
                                step: '01',
                                title: 'Konsultasi & Bawa Unit',
                                desc: 'Hubungi teknisi kami via WhatsApp atau bawa langsung laptop / PC Anda ke workshop Studio Langit.',
                                icon: MessageSquare,
                            },
                            {
                                step: '02',
                                title: 'Pengecekan & Diagnosa Gratis',
                                desc: 'Teknisi mengecek kendala di depan Anda secara langsung tanpa dipungut biaya pengecekan awal.',
                                icon: Wrench,
                            },
                            {
                                step: '03',
                                title: 'Konfirmasi Estimasi Biaya',
                                desc: 'Rincian biaya pengerjaan dan harga suku cadang disepakati di awal sebelum perbaikan dikerjakan.',
                                icon: CheckCircle2,
                            },
                            {
                                step: '04',
                                title: 'Pengerjaan & Bergaransi',
                                desc: 'Perangkat diservis dengan teliti, diuji stabilitasnya, dan diserahkan lengkap dengan garansi resmi toko.',
                                icon: ShieldCheck,
                            },
                        ].map((item, idx) => {
                            const Icon = item.icon;
                            return (
                                <div 
                                    key={idx}
                                    className="p-6 rounded-2xl bg-white dark:bg-[#0E0703]/80 border border-slate-200 dark:border-white/10 flex flex-col justify-between shadow-xs hover:border-orange-500/40 transition-colors"
                                >
                                    <div>
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold">
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <span className="font-mono text-2xl font-black text-slate-300 dark:text-white/15">
                                                {item.step}
                                            </span>
                                        </div>
                                        <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white mb-2">
                                            {item.title}
                                        </h3>
                                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                            {item.desc}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* 2. Jaminan & Standar Mutu Servis */}
                <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-20">
                    <div className="rounded-3xl bg-white dark:bg-[#0B0703]/90 border border-slate-200 dark:border-orange-500/30 p-6 sm:p-8 md:p-10 shadow-sm">
                        <div className="text-center max-w-2xl mx-auto mb-8">
                            <span className="text-xs font-mono text-orange-600 dark:text-orange-400 uppercase tracking-wider block mb-1 font-bold">
                                Standar Kualitas Bengkel
                            </span>
                            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white">
                                Kenapa Mempercayakan Servis ke Langit?
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                {
                                    title: 'Diagnosa Awal 100% Gratis',
                                    desc: 'Gratis biaya konsultasi dan pengecekan awal jika kendala ternyata tidak dapat ditangani atau dibatalkan.',
                                    icon: CheckCircle2,
                                    badge: 'Bebas Risiko',
                                },
                                {
                                    title: 'Bisa Ditunggu & Transparan',
                                    desc: 'Instalasi OS, software, dan upgrade SSD rata-rata selesai dalam 1 - 2 jam kerja.',
                                    icon: Clock,
                                    badge: '1 - 2 Jam Jadi',
                                },
                                {
                                    title: 'Privasi & Data 100% Aman',
                                    desc: 'Dokumen kerja, foto pribadi, dan data rahasia Anda dijaga ketat tanpa risiko diintip atau disalin.',
                                    icon: ShieldCheck,
                                    badge: 'Privasi Terjamin',
                                },
                                {
                                    title: 'Garansi Pengerjaan & Part',
                                    desc: 'Setiap suku cadang baru bergaransi resmi distributor, didukung garansi instalasi langsung dari toko.',
                                    icon: Zap,
                                    badge: 'Garansi Toko',
                                },
                            ].map((item, idx) => {
                                const Icon = item.icon;
                                return (
                                    <div key={idx} className="space-y-2.5">
                                        <div className="flex items-center justify-between">
                                            <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                                                <Icon className="w-4 h-4" />
                                            </div>
                                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 font-semibold border border-slate-200 dark:border-white/10">
                                                {item.badge}
                                            </span>
                                        </div>
                                        <h4 className="font-heading font-bold text-sm text-slate-900 dark:text-white">
                                            {item.title}
                                        </h4>
                                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                            {item.desc}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Callout Box Konsultasi Langsung */}
                        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 bg-orange-50/60 dark:bg-orange-500/5 p-4 sm:p-5 rounded-2xl">
                            <div className="text-center sm:text-left">
                                <h4 className="font-heading font-bold text-sm text-slate-900 dark:text-white">
                                    Laptop atau PC Anda Bermasalah Hari Ini?
                                </h4>
                                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                                    Jelaskan kendala Anda ke teknisi kami untuk mendapatkan diagnosa awal dan rekomendasi solusi terbaik.
                                </p>
                            </div>
                            <div className="flex items-center gap-2.5 shrink-0">
                                <a
                                    href={getWhatsAppUrl('computer-service', { 
                                        category: 'Diagnosa Cepat Laptop & PC',
                                        details: 'Saya ingin konsultasi langsung kendala perangkat saya.'
                                    })}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-transform active:scale-95 cursor-pointer"
                                >
                                    <PhoneCall className="w-3.5 h-3.5" />
                                    <span>Chat Teknisi Sekarang</span>
                                </a>
                                <Link
                                    href="/kontak"
                                    className="px-4 py-2.5 rounded-xl bg-white dark:bg-white/10 hover:bg-slate-100 dark:hover:bg-white/15 text-slate-800 dark:text-white border border-slate-300 dark:border-white/10 font-semibold text-xs transition-colors"
                                >
                                    Lokasi Bengkel
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </PublicLayout>
    );
}