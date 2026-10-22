import React, { useState, useMemo } from 'react';
import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import { 
    Phone, Mail, MapPin, Clock, MessageSquare, ChevronDown,
    ShieldCheck, Sparkles, HelpCircle, CheckCircle2, ArrowRight
} from 'lucide-react';

export default function ContactIndex({ contacts = {}, faqs = [] }) {
    const [openFaqIndex, setOpenFaqIndex] = useState(0);
    const [faqSearch, setFaqSearch] = useState('');

    // Real-Time Studio Open / Closed calculation (PRD 5.2)
    const isStudioOpen = useMemo(() => {
        const now = new Date();
        const day = now.getDay(); // 0 is Sunday, 6 is Saturday
        const hour = now.getHours();
        const minute = now.getMinutes();
        const currentTime = hour + minute / 60;

        if (day >= 1 && day <= 5) {
            // Monday - Friday: 09:00 - 18:00
            return currentTime >= 9 && currentTime < 18;
        } else if (day === 6) {
            // Saturday: 10:00 - 16:00
            return currentTime >= 10 && currentTime < 16;
        }
        return false; // Sunday closed
    }, []);

    const filteredFaqs = faqs.filter(f => 
        f.question.toLowerCase().includes(faqSearch.toLowerCase()) ||
        f.answer.toLowerCase().includes(faqSearch.toLowerCase())
    );

    return (
        <PublicLayout>
            <Head>
                <title>Pusat Kontak, Lokasi Studio & Jam Operasional</title>
                <meta name="description" content="Hubungi studio Langit secara langsung: nomor kontak divisi perbaikan komputer, sewa alat kamera, pembuatan website, peta kantor, dan jam kerja aktif." />
            </Head>

            <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pt-6 pb-20 space-y-16">
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto space-y-4">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#005792]/10 border border-[#005792]/30 text-[#005792] dark:text-sky-300 text-xs font-mono tracking-wider font-semibold">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>OFFICIAL COMMUNICATION & SOCIAL HUB</span>
                    </div>

                    <h1 className="font-heading font-extrabold text-3xl sm:text-5xl lg:text-6xl text-slate-900 dark:text-white tracking-tight leading-tight">
                        Terhubung Langsung dengan{' '}
                        <span className="font-editorial italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-[#005792] via-purple-600 to-pink-500 dark:from-sky-300 dark:via-purple-300 dark:to-pink-300">
                            Studio Langit.
                        </span>
                    </h1>

                    <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
                        Saluran komunikasi resmi, kanal media sosial, peta lokasi kantor operasional, dan jam layanan aktif studio kami.
                    </p>
                </div>

                {/* 2. Official Social Media & WhatsApp Channels */}
                <div className="space-y-6 pt-2">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-slate-200 dark:border-white/10 pb-4">
                        <div>
                            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-mono text-xs uppercase tracking-wider mb-1 font-bold">
                                <Sparkles className="w-4 h-4" />
                                <span>OFFICIAL SOCIAL MEDIA ECOSYSTEM</span>
                            </div>
                            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white">
                                Media Sosial Resmi Langit
                            </h2>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm max-w-md">
                            Hubungi layanan WhatsApp terpusat, ikuti karya terbaru, reel sinematik 4K, dan update behind-the-scenes langsung di kanal resmi kami.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* 1. Official WhatsApp Card */}
                        <a
                            href={`https://wa.me/${(contacts.general_phone || '+62 812 3456 7890').replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Halo Studio Langit, saya ingin berkonsultasi mengenai layanan dan proyek...')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="group relative p-6 rounded-3xl bg-white dark:bg-[#090D16] border border-slate-200 dark:border-white/10 hover:border-emerald-500/50 shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-transparent rounded-bl-full pointer-events-none group-hover:scale-125 transition-transform duration-500"></div>

                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/25 group-hover:scale-110 transition-transform">
                                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                                        </svg>
                                    </div>
                                    <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 font-bold uppercase tracking-wider flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                        Fast Response
                                    </span>
                                </div>

                                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">WhatsApp Official</span>
                                <h3 className="font-heading font-bold text-xl text-slate-900 dark:text-white mt-0.5 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                    {contacts.general_phone || '+62 812 3456 7890'}
                                </h3>
                                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                                    Konsultasi cepat, reservasi layanan foto & video, info sewa alat, jadwal servis, dan tanya jawab langsung dengan customer care Langit.
                                </p>
                            </div>

                            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                <span className="flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
                                    <span>Chat WhatsApp Resmi</span>
                                    <ArrowRight className="w-4 h-4" />
                                </span>
                                <span className="text-[11px] font-mono opacity-60 group-hover:opacity-100 transition-opacity">↗</span>
                            </div>
                        </a>

                        {/* 2. Instagram Card (Active Link) */}
                        <a
                            href="https://www.instagram.com/langit.creative?cplk=MTcxN3d5aXB1c2hkMQ=="
                            target="_blank"
                            rel="noreferrer"
                            className="group relative p-6 rounded-3xl bg-white dark:bg-[#090D16] border border-slate-200 dark:border-white/10 hover:border-pink-500/50 shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-br from-pink-500/15 via-purple-500/10 to-transparent rounded-bl-full pointer-events-none group-hover:scale-125 transition-transform duration-500"></div>

                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-rose-500/25 group-hover:scale-110 transition-transform">
                                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                                            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                                            <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                                        </svg>
                                    </div>
                                    <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/25 font-bold uppercase tracking-wider flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                                        Aktif
                                    </span>
                                </div>

                                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Instagram Official</span>
                                <h3 className="font-heading font-bold text-xl text-slate-900 dark:text-white mt-0.5 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                                    @langit.creative
                                </h3>
                                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                                    Galeri foto harian, portofolio wedding & cinema reel, showcase color grading, dan behind-the-scenes photoshoot studio.
                                </p>
                            </div>

                            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs font-bold text-rose-600 dark:text-rose-400">
                                <span className="flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
                                    <span>Buka Instagram Profil</span>
                                    <ArrowRight className="w-4 h-4" />
                                </span>
                                <span className="text-[11px] font-mono opacity-60 group-hover:opacity-100 transition-opacity">↗</span>
                            </div>
                        </a>

                        {/* 2. TikTok Card (Upcoming Link) */}
                        <div className="group relative p-6 rounded-3xl bg-white dark:bg-[#090D16] border border-slate-200 dark:border-white/10 hover:border-cyan-500/40 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden">
                            <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-br from-cyan-500/10 via-pink-500/10 to-transparent rounded-bl-full pointer-events-none"></div>

                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-900 dark:bg-slate-800 text-white flex items-center justify-center shadow-lg shadow-black/20 group-hover:scale-110 transition-transform border border-slate-700/50">
                                        <svg className="w-6 h-6 text-cyan-400 fill-current" viewBox="0 0 24 24">
                                            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.86.11V9.32a6.34 6.34 0 0 0-.86-.06 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.58a8.28 8.28 0 0 0 4.84 1.56V6.69z"/>
                                        </svg>
                                    </div>
                                    <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10 font-bold uppercase tracking-wider">
                                        Segera Hadir
                                    </span>
                                </div>

                                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">TikTok Official</span>
                                <h3 className="font-heading font-bold text-xl text-slate-900 dark:text-white mt-0.5">
                                    @langit.creative
                                </h3>
                                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                                    Video vertikal pendek, tips praktis editing & drone, mini vlog tim produksi, dan tutorial kreatif singkat.
                                </p>
                            </div>

                            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-mono">
                                <span>Tautan akun menyusul</span>
                                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">TikTok</span>
                            </div>
                        </div>

                        {/* 3. YouTube Card (Upcoming Link) */}
                        <div className="group relative p-6 rounded-3xl bg-white dark:bg-[#090D16] border border-slate-200 dark:border-white/10 hover:border-red-500/40 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden">
                            <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-br from-red-500/10 to-transparent rounded-bl-full pointer-events-none"></div>

                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-600/25 group-hover:scale-110 transition-transform">
                                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                                        </svg>
                                    </div>
                                    <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10 font-bold uppercase tracking-wider">
                                        Segera Hadir
                                    </span>
                                </div>

                                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">YouTube Channel</span>
                                <h3 className="font-heading font-bold text-xl text-slate-900 dark:text-white mt-0.5">
                                    Langit Creative
                                </h3>
                                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                                    Dokumentasi sinematik 4K berdurasi penuh, film pendek, company profile korporat, dan video training divisi edukasi.
                                </p>
                            </div>

                            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-mono">
                                <span>Tautan channel menyusul</span>
                                <span className="text-[11px] font-bold text-red-600 dark:text-red-400">YouTube</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Interactive Studio Map & Operational Hours with Live Status (PRD 5.2) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                    {/* Operating Hours & Status (5 Cols) */}
                    <div className="lg:col-span-5 space-y-6 p-8 rounded-3xl bg-white dark:bg-[#090D16] border border-slate-200 dark:border-white/10 shadow-xl dark:shadow-2xl">
                        {/* Real-Time Live Status Pill */}
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/10">
                            <span className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status Studio Saat Ini:</span>
                            {isStudioOpen ? (
                                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold animate-pulse">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                    <span>Studio Sedang Buka</span>
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs font-mono font-bold">
                                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                    <span>Tutup — Buka Besok 09.00</span>
                                </span>
                            )}
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-heading font-bold text-2xl text-slate-900 dark:text-white">
                                Jam Operasional Studio
                            </h3>
                            <div className="space-y-3 text-xs font-mono">
                                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 flex items-center justify-between">
                                    <span className="text-slate-600 dark:text-slate-400">Senin - Jumat</span>
                                    <span className="text-slate-900 dark:text-white font-bold">{contacts.opening_hours?.monday_friday || '09:00 - 18:00 WIB'}</span>
                                </div>
                                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 flex items-center justify-between">
                                    <span className="text-slate-600 dark:text-slate-400">Sabtu</span>
                                    <span className="text-slate-900 dark:text-white font-bold">{contacts.opening_hours?.saturday || '10:00 - 16:00 WIB'}</span>
                                </div>
                                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 flex items-center justify-between">
                                    <span className="text-slate-600 dark:text-slate-400">Minggu & Hari Libur</span>
                                    <span className="text-amber-600 dark:text-amber-400 font-semibold">{contacts.opening_hours?.sunday || 'Emergency Service Only'}</span>
                                </div>
                            </div>

                            <div className="pt-2 text-xs text-slate-600 dark:text-slate-400 space-y-2">
                                <a
                                    href={contacts.google_maps_url || "https://maps.app.goo.gl/tiByDRcJAGqN7gjm8?g_st=iw"}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-start gap-2 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors group"
                                    title="Buka Lokasi Langit Office di Google Maps"
                                >
                                    <MapPin className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                                    <span className="leading-relaxed group-hover:underline">{contacts.address}</span>
                                </a>
                                <p className="flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                                    <span>{contacts.general_email}</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Interactive Studio Map Mockup (7 Cols) */}
                    <div className="lg:col-span-7 rounded-3xl overflow-hidden border border-white/10 bg-slate-900 shadow-2xl aspect-[16/10] relative group">
                        {/* Map Graphic Overlay */}
                        <img
                            src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=1200&q=80"
                            alt="Peta Lokasi Langit Office"
                            className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>

                        {/* Pin Center Marker */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                            <div className="relative">
                                <div className="w-12 h-12 rounded-full bg-cyan-500/30 animate-ping absolute inset-0"></div>
                                <div className="relative w-12 h-12 rounded-full bg-cyan-500 border-2 border-white text-slate-950 flex items-center justify-center shadow-2xl">
                                    <MapPin className="w-6 h-6 stroke-[2.5]" />
                                </div>
                            </div>
                            <div className="mt-3 px-4 py-1.5 rounded-full bg-black/85 backdrop-blur-md border border-cyan-500/40 text-xs font-mono text-cyan-300 font-bold shadow-xl">
                                Langit Office
                            </div>
                        </div>

                        {/* Bottom Overlay Directions Button */}
                        <div className="absolute bottom-5 inset-x-5 flex justify-between items-center bg-white/90 dark:bg-[#090D16]/90 backdrop-blur-md p-4 rounded-2xl border border-slate-200 dark:border-white/10 shadow-lg">
                            <div>
                                <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase">Navigasi Langit Office</span>
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Buka di Google Maps Langsung</h4>
                            </div>
                            <a
                                href={contacts.google_maps_url || "https://maps.app.goo.gl/tiByDRcJAGqN7gjm8?g_st=iw"}
                                target="_blank"
                                rel="noreferrer"
                                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-md"
                            >
                                <span>Petunjuk Arah</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </a>
                        </div>
                    </div>
                </div>

                {/* 3. Dynamic FAQ Accordion (PRD 5.2) */}
                <div className="pt-8 border-t border-slate-200 dark:border-white/10 space-y-8">
                    <div className="text-center max-w-2xl mx-auto space-y-3">
                        <span className="text-xs font-mono text-cyan-600 dark:text-cyan-400 uppercase tracking-wider block">
                            Frequently Asked Questions
                        </span>
                        <h2 className="font-heading font-extrabold text-3xl text-slate-900 dark:text-white">
                            Pertanyaan yang Sering Diajukan
                        </h2>
                        <input
                            type="text"
                            value={faqSearch}
                            onChange={(e) => setFaqSearch(e.target.value)}
                            placeholder="Cari pertanyaan seputar sewa alat, servis, atau website..."
                            className="w-full max-w-md mx-auto px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-500 shadow-sm"
                        />
                    </div>

                    <div className="max-w-3xl mx-auto space-y-3">
                        {filteredFaqs.map((faq, idx) => {
                            const isOpen = openFaqIndex === idx;
                            return (
                                <div
                                    key={idx}
                                    className="rounded-2xl bg-white dark:bg-[#090D16] border border-slate-200 dark:border-white/10 overflow-hidden transition-colors shadow-sm dark:shadow-none"
                                >
                                    <button
                                        onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                                        className="w-full p-5 text-left flex items-center justify-between gap-4 select-none"
                                    >
                                        <span className="font-heading font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                                            {faq.question}
                                        </span>
                                        <ChevronDown className={`w-5 h-5 text-cyan-600 dark:text-cyan-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                                    </button>
                                    {isOpen && (
                                        <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-white/5 animate-in fade-in duration-150">
                                            {faq.answer}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
