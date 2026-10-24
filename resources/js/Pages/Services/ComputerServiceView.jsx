import React, { useState, useMemo } from 'react';
import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import ServiceTrackerCard from '@/Components/ServiceTrackerCard';
import { 
    Cpu, Activity, Wrench, Clock, ShieldCheck, CheckCircle2,
    Laptop, Monitor, Apple, ArrowRight, Zap, HelpCircle, PhoneCall
} from 'lucide-react';

export default function ComputerServiceView({ service, initialTicket = null, initialReceiptQuery = '', galleries = [] }) {
    // Interactive Symptom Diagnostic State (PRD 4.4)
    const [selectedDevice, setSelectedDevice] = useState('laptop');
    const [selectedSymptom, setSelectedSymptom] = useState('overheat');

    const devices = [
        { key: 'laptop', label: 'Laptop Windows / Gaming', icon: Laptop },
        { key: 'macbook', label: 'Apple MacBook (M1/M2/Intel)', icon: Apple },
        { key: 'pc_custom', label: 'PC Rakitan / Workstation', icon: Monitor },
    ];

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


    const symptomsMap = {
        laptop: [
            { id: 'install_software', title: 'Installasi Software & Optimasi', estCost: 'Rp 100.000 - Rp 150.000', estTime: '1 - 2 Jam', solution: 'Clean install Windows 11 Pro, driver update certified, software produktivitas & optimasi startup.' },
            { id: 'upgrade_ssd', title: 'Upgrade SSD NVMe & Kloning Data', estCost: 'Rp 150.000 (+ SSD)', estTime: '1 Jam', solution: 'Instalasi SSD NVMe PCIe Gen4, cloning partisi Windows dan file tanpa kehilangan data.' },
            { id: 'rakit_pc', title: 'Rakit PC / Upgrade Komponen', estCost: 'Rp 250.000 - Rp 350.000', estTime: '2 - 3 Jam', solution: 'Perakitan komponen presisi, repasting thermal paste, cable management rapi, stress test.' },
            { id: 'penggantian_part', title: 'Penggantian Part (Layar, Baterai, Keyboard)', estCost: 'Rp 350.000 - Rp 1.500.000', estTime: '1 Hari', solution: 'Penggantian sparepart LCD original, baterai baru bergaransi, modul keyboard, atau engsel body.' },
        ],
        macbook: [
            { id: 'install_software', title: 'Install Ulang macOS & Software', estCost: 'Rp 200.000 - Rp 300.000', estTime: '2 Jam', solution: 'Fresh restore macOS Sonoma/Sequoia, instalasi software kreatif, dan sinkronisasi iCloud.' },
            { id: 'upgrade_ssd', title: 'Upgrade Storage & Pemulihan Data', estCost: 'Rp 350.000 - Rp 600.000', estTime: '2 - 3 Jam', solution: 'Direct Target Disk data recovery, pemindahan file ke storage eksternal super cepat.' },
            { id: 'rakit_pc', title: 'Perawatan Internal & Thermal Service', estCost: 'Rp 300.000 - Rp 500.000', estTime: '2 Jam', solution: 'Pembersihan debu heatsink, repasting thermal paste processor Apple Silicon / Intel.' },
            { id: 'penggantian_part', title: 'Penggantian Part Display & Baterai Mac', estCost: 'Rp 950.000 - Rp 3.500.000', estTime: '1 - 2 Hari', solution: 'Penggantian 1 set panel display Retina XDR atau baterai original cycle count 0.' },
        ],
        pc_custom: [
            { id: 'install_software', title: 'Installasi Software & Driver GPU', estCost: 'Rp 100.000 - Rp 150.000', estTime: '1 Jam', solution: 'Instalasi Windows 11, setting D.O.C.P/XMP RAM di BIOS, dan driver game-ready.' },
            { id: 'upgrade_ssd', title: 'Upgrade SSD High-Speed & Partition', estCost: 'Rp 150.000 (+ SSD)', estTime: '1 Jam', solution: 'Pemasangan SSD NVMe heatsink thermal pad + migrasi instalasi game / software.' },
            { id: 'rakit_pc', title: 'Jasa Rakit PC Lengkap & Cable Management', estCost: 'Rp 250.000 - Rp 450.000', estTime: '3 - 5 Jam', solution: 'Perakitan PC custom baru, routing kabel rapi di balik casing, stress test 3DMark.' },
            { id: 'penggantian_part', title: 'Penggantian Part Hardware & PSU', estCost: 'Rp 150.000 - Rp 400.000', estTime: '2 Jam', solution: 'Penggantian Power Supply modular, motherboard baru, upgrade RAM dual channel, atau GPU.' },
        ],
    };

    const currentSymptomData = (symptomsMap[selectedDevice] || []).find(s => s.id === selectedSymptom) 
        || symptomsMap[selectedDevice][0];

    return (
        <PublicLayout activeService="computer-service">
            <Head>
                <title>Layanan Servis Komputer & Laptop Profesional | Langit Computer</title>
                <meta name="description" content="Pusat layanan servis komputer, laptop, dan PC rakitan profesional di Langit. Melayani instalasi software, upgrade SSD/RAM, perbaikan hardware, rakit PC custom, dan penggantian sparepart bergaransi resmi." />
            </Head>

            {/* Atmosphere: Professional Computer Service Center Layout */}
            <div className="bg-[#EDF9FC] dark:bg-[#120A05] min-h-screen text-slate-800 dark:text-slate-100 -mt-6 pt-6 transition-colors duration-300">
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
                            className="px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-lg shadow-orange-500/30 transition-transform hover:scale-105 active:scale-95"
                        >
                            <span>Konsultasi Servis Sekarang</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                        <a
                            href="#live-tracker"
                            className="px-5 py-3 rounded-xl bg-slate-200/70 hover:bg-slate-300 dark:bg-white/5 dark:hover:bg-white/10 text-slate-900 dark:text-white border border-slate-300 dark:border-white/10 text-sm font-semibold transition-colors flex items-center gap-2"
                        >
                            <Activity className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                            <span>Cek Status Servis (Live Tracking)</span>
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

                                        <Link
                                            href="/konsultasi"
                                            className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-slate-950 font-bold text-xs shadow-sm transition-transform hover:scale-105 active:scale-95 shrink-0"
                                        >
                                            Konsultasi
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 1. Live Service Receipt Tracker (PRD 4.4) */}
                <section id="live-tracker" className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-16 scroll-mt-20">
                    <ServiceTrackerCard initialReceipt={initialReceiptQuery || 'SRV-2026-0089'} />
                </section>

                {/* 2. Interactive Symptom Diagnostic (PRD 4.4) */}
                <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-16 border-t border-slate-200 dark:border-white/10">
                    <div className="text-center max-w-2xl mx-auto mb-10">
                        <span className="text-xs font-mono text-orange-600 dark:text-orange-400 uppercase tracking-wider block mb-1 font-bold">
                            Panduan Diagnosa Servis
                        </span>
                        <h2 className="font-heading font-extrabold text-3xl text-slate-900 dark:text-white">
                            Cek Estimasi Kendala Komputer & Laptop
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-1">
                            Pilih tipe perangkat dan gejala kendala yang Anda alami untuk melihat estimasi biaya serta solusi teknis dari teknisi kami.
                        </p>
                    </div>

                    <div className="max-w-5xl mx-auto rounded-3xl bg-white dark:bg-[#0B0703]/90 border border-slate-200 dark:border-orange-500/30 p-6 md:p-8 backdrop-blur-2xl shadow-xl dark:shadow-2xl">
                        {/* Device Selector */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                            {devices.map((d) => {
                                const Icon = d.icon;
                                const isSelected = selectedDevice === d.key;
                                return (
                                    <button
                                        key={d.key}
                                        onClick={() => {
                                            setSelectedDevice(d.key);
                                            setSelectedSymptom('overheat');
                                        }}
                                        className={`p-4 rounded-2xl border flex items-center gap-3 transition-all text-left ${
                                            isSelected
                                                ? 'bg-orange-500/15 border-orange-500 text-slate-900 dark:text-white shadow-md'
                                                : 'bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.05]'
                                        }`}
                                    >
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                            isSelected ? 'bg-orange-500 text-slate-950 font-bold' : 'bg-slate-200 dark:bg-white/5 text-slate-600 dark:text-slate-400'
                                        }`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <span className="text-xs font-mono text-slate-500 uppercase block">Perangkat:</span>
                                            <span className="text-sm font-bold block">{d.label}</span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Symptoms Selector */}
                        <div className="space-y-2 mb-8">
                            <span className="text-xs font-mono text-slate-500 dark:text-slate-400 block mb-2">Pilih Gejala Kendala:</span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                {(symptomsMap[selectedDevice] || []).map((s) => {
                                    const isSel = selectedSymptom === s.id;
                                    return (
                                        <div
                                            key={s.id}
                                            onClick={() => setSelectedSymptom(s.id)}
                                            className={`cursor-pointer p-4 rounded-xl border transition-all flex items-center justify-between ${
                                                isSel
                                                    ? 'bg-orange-500/15 border-orange-500 text-slate-900 dark:text-white shadow-sm'
                                                    : 'bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.04]'
                                            }`}
                                        >
                                            <span className="text-sm font-semibold">{s.title}</span>
                                            <span className={`w-3.5 h-3.5 rounded-full border ${
                                                isSel ? 'bg-orange-500 border-orange-400 ring-2 ring-orange-500/30' : 'border-slate-300 dark:border-slate-600'
                                            }`}></span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Diagnostic Result Box */}
                        {currentSymptomData && (
                            <div className="p-6 rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 dark:from-[#170E07] dark:to-[#0E0804] border border-orange-200 dark:border-orange-500/40 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase">Perkiraan Biaya Penanganan</span>
                                    <div className="text-2xl font-bold font-mono text-orange-600 dark:text-orange-400">
                                        {currentSymptomData.estCost}
                                    </div>
                                    <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                        <Clock className="w-3.5 h-3.5" />
                                        Estimasi Waktu: {currentSymptomData.estTime}
                                    </span>
                                </div>

                                <div className="md:col-span-2 space-y-2">
                                    <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase">Tindakan Laboratorium Langit:</span>
                                    <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-sans">
                                        {currentSymptomData.solution}
                                    </p>
                                    <div className="pt-2 flex items-center gap-3">
                                        <a
                                            href={`https://wa.me/6282246142791?text=${encodeURIComponent(`Halo Teknisi Langit, saya ingin konsultasi servis ${selectedDevice} dengan kendala: ${currentSymptomData.title}`)}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-orange-500/20 transition-transform active:scale-95"
                                        >
                                            <PhoneCall className="w-3.5 h-3.5" />
                                            <span>Hubungi Teknisi Lab Langit</span>
                                        </a>
                                        <span className="text-[11px] font-mono text-slate-500">Gratis Konsultasi Awal & Diagnosa</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </PublicLayout>
    );
}