import React, { useState, useEffect, useRef } from 'react';
import { Link, usePage } from '@inertiajs/react';
import FloatingHeadbar from '@/Components/FloatingHeadbar';
import { 
    Camera, Code2, GraduationCap, Cpu, Sparkles, PackageCheck, Handshake,
    ChevronDown, Menu, X, ArrowRight, Phone, Mail, MapPin, Clock, ShieldCheck,
    Layers, Sun, Moon
} from 'lucide-react';

export default function PublicLayout({ children, activeService = null }) {
    const { url } = usePage();
    const [scrolled, setScrolled] = useState(false);
    const [servicesMenuOpen, setServicesMenuOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const megaMenuRef = useRef(null);

    // Theme Management: Primary is 'light', Secondary is 'dark'
    const [theme, setTheme] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('langit_theme') || 'light';
        }
        return 'light';
    });

    useEffect(() => {
        if (typeof window === 'undefined') return;
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            document.documentElement.classList.remove('light');
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.classList.add('light');
            document.documentElement.classList.remove('dark');
            document.documentElement.setAttribute('data-theme', 'light');
        }
        localStorage.setItem('langit_theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 30);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (megaMenuRef.current && !megaMenuRef.current.contains(event.target)) {
                setServicesMenuOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const serviceItems = [
        {
            name: 'Photography & Videography',
            slug: 'photography-videography',
            desc: 'Wedding, Wisuda, Event, Traveling, Jasa Drone & Company Profile',
            accent: '#D97706',
            badge: 'Visual & Cinema',
            icon: Camera,
        },
        {
            name: 'Web Development',
            slug: 'web-development',
            desc: 'Website Operasi Internal, Profile Perusahaan, Pendidikan & E-Commerce',
            accent: '#0284C7',
            badge: 'Web Architecture',
            icon: Code2,
        },
        {
            name: 'Langit Education',
            slug: 'langit-education',
            desc: 'Kursus Coding (Robotik/Web/AI), Kursus Office & Kursus Rakit PC',
            accent: '#059669',
            badge: 'Kursus & Training',
            icon: GraduationCap,
        },
        {
            name: 'Computer Service',
            slug: 'computer-service',
            desc: 'Installasi Software, Upgrade SSD, Rakit PC & Penggantian Part',
            accent: '#EA580C',
            badge: 'Hardware Service',
            icon: Cpu,
        },
        {
            name: 'Internship',
            slug: 'internship',
            desc: 'Form Pendaftaran Magang / PKL Industri & Inkubasi Karier',
            accent: '#7C3AED',
            badge: 'Magang / PKL',
            icon: Sparkles,
        },
        {
            name: 'Sewa Alat',
            slug: 'sewa-alat',
            desc: 'Rental Proyektor + Screen, Smart TV Display & Drone 4K',
            accent: '#0D9488',
            badge: 'Rental Alat',
            icon: PackageCheck,
        },
        {
            name: 'Kolaborasi',
            slug: 'kolaborasi',
            desc: 'Kemitraan Kampus/Sekolah, Media Partner, Sponsor & Vendor B2B',
            accent: '#DB2777',
            badge: 'Kemitraan',
            icon: Handshake,
        },
    ];

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#07090E] dark:text-slate-100 flex flex-col font-sans selection:bg-cyan-500/20 selection:text-cyan-900 dark:selection:bg-cyan-500/30 dark:selection:text-cyan-200 transition-colors duration-300">
            {/* Ambient Background Glows */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-400/10 dark:bg-cyan-600/10 rounded-full blur-[128px]"></div>
                <div className="absolute top-1/3 -right-40 w-96 h-96 bg-indigo-400/10 dark:bg-purple-600/10 rounded-full blur-[140px]"></div>
                <div className="absolute -bottom-40 left-1/3 w-[30rem] h-[30rem] bg-emerald-400/10 dark:bg-emerald-600/10 rounded-full blur-[150px]"></div>
            </div>

            {/* GPU-Accelerated Floating Headbar & Bento Mega-Menu Dropdown */}
            <FloatingHeadbar
                activeService={activeService}
                theme={theme}
                setTheme={setTheme}
                toggleTheme={toggleTheme}
            />

            {/* Main Content Area */}
            <main className="flex-1 relative z-10 pt-24 md:pt-28 pb-16">
                {children}
            </main>

            {/* Footer */}
            <footer className="relative z-10 border-t border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-[#05070B]/90 backdrop-blur-xl transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-6 py-14 lg:py-16">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
                        {/* Col 1: Brand Info */}
                        <div className="lg:col-span-2 space-y-4">
                            <div className="flex items-center gap-2">
                                <span 
                                    className="font-etna font-bold text-3xl sm:text-4xl tracking-tight text-[#005792] dark:text-cyan-400 flex items-center gap-1.5"
                                    style={{ fontFamily: "'Etna Sans Serif', 'Etna', sans-serif" }}
                                >
                                    langit
                                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-hud-pulse shadow-[0_0_8px_rgba(6,182,212,0.7)] shrink-0"></span>
                                </span>
                            </div>
                            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed max-w-sm">
                                Ekosistem digital modern yang memadukan produksi visual sinematik, arsitektur software berkinerja tinggi, lab diagnostik komputer, hingga inkubasi talenta kreatif.
                            </p>
                            <div className="flex flex-wrap items-center gap-2.5 pt-2">
                                <a 
                                    href="https://wa.me/6281234567890" 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-xs font-mono text-cyan-600 dark:text-cyan-400 flex items-center gap-1.5 transition-colors shadow-sm font-semibold"
                                >
                                    <Phone className="w-3.5 h-3.5" />
                                    <span>WhatsApp</span>
                                </a>
                                <a 
                                    href="https://www.instagram.com/langit.creative?cplk=MTcxN3d5aXB1c2hkMQ==" 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-white/5 hover:bg-rose-500/10 border border-slate-200 dark:border-white/10 text-xs font-mono text-rose-600 dark:text-rose-400 flex items-center gap-1.5 transition-colors shadow-sm font-semibold"
                                >
                                    <span>Instagram</span>
                                </a>
                                <Link 
                                    href="/admin/login" 
                                    className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-xs font-mono text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors shadow-sm"
                                >
                                    Admin CMS
                                </Link>
                            </div>
                        </div>

                        {/* Col 2: Layanan */}
                        <div className="space-y-3">
                            <h4 className="font-heading font-bold text-sm tracking-wider uppercase text-slate-900 dark:text-white">Layanan</h4>
                            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                                <li><Link href="/layanan/photography-videography" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">Photo & Video Cinema</Link></li>
                                <li><Link href="/layanan/web-development" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">Web Development</Link></li>
                                <li><Link href="/layanan/langit-education" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Langit Education</Link></li>
                                <li><Link href="/layanan/computer-service" className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors">Computer Service Lab</Link></li>
                                <li><Link href="/layanan/sewa-alat" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">Sewa Alat Produksi</Link></li>
                                <li><Link href="/layanan/internship" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Internship Program</Link></li>
                                <li><Link href="/layanan/kolaborasi" className="hover:text-pink-600 dark:hover:text-pink-400 transition-colors">Kemitraan & Event</Link></li>
                            </ul>
                        </div>

                        {/* Col 3: Portal & Navigasi */}
                        <div className="space-y-3">
                            <h4 className="font-heading font-bold text-sm tracking-wider uppercase text-slate-900 dark:text-white">Eksplorasi</h4>
                            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                                <li><Link href="/portofolio" className="hover:text-cyan-600 dark:hover:text-white transition-colors">Portofolio Lintas Divisi</Link></li>
                                <li><Link href="/konsultasi" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">3-Step Consultation Wizard</Link></li>
                                <li><Link href="/layanan/computer-service?receipt=SRV-2026-0089" className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors">Cek Status Nota Servis</Link></li>
                                <li><Link href="/layanan/sewa-alat" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">Katalog & Keranjang Sewa</Link></li>
                                <li><Link href="/kontak" className="hover:text-cyan-600 dark:hover:text-white transition-colors">Studio & Jam Buka</Link></li>
                            </ul>
                        </div>

                        {/* Col 4: Lokasi & Jam Buka */}
                        <div className="space-y-3">
                            <h4 className="font-heading font-bold text-sm tracking-wider uppercase text-slate-900 dark:text-white">Studio Langit</h4>
                            <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
                                <a 
                                    href="https://maps.app.goo.gl/tiByDRcJAGqN7gjm8?g_st=iw"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-start gap-2 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors group"
                                    title="Buka Lokasi Langit Office di Google Maps"
                                >
                                    <MapPin className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                                    <span className="leading-relaxed">
                                        <strong className="text-slate-900 dark:text-white block font-semibold group-hover:underline">Langit Office</strong>
                                        Jl. Irigasi Bk 10, Tugu Harum, Kec. Belitang Madang Raya, Kab. OKU Timur, Sumatera Selatan 32382
                                    </span>
                                </a>
                                <p className="flex items-start gap-2">
                                    <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                                    <span>Senin - Jumat: 09:00 - 18:00 WIB<br/>Sabtu: 10:00 - 16:00 WIB</span>
                                </p>
                                <p className="flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                                    <span>halo@langit.id</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 pt-6 border-t border-slate-200 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
                        <p>© {new Date().getFullYear()} Langit Digital Ecosystem. Master Consolidated Edition v2.1.0.</p>
                        <p className="font-mono text-[11px] text-slate-500">Built with Laravel 13, React.js & Tailwind CSS v4</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
