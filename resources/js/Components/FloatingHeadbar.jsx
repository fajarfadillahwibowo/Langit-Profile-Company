import React, { useState, useEffect, useRef } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Camera, Code2, GraduationCap, Cpu, Sparkles, PackageCheck, Handshake,
    ChevronDown, Menu, X, ArrowRight, Sun, Moon, Sparkle
} from 'lucide-react';
import InteractiveBentoCard from '@/Components/InteractiveBentoCard';

export default function FloatingHeadbar({ 
    activeService = null, 
    theme = 'light', 
    setTheme,
    toggleTheme 
}) {
    const { url } = usePage();
    const [scrolled, setScrolled] = useState(false);
    const [servicesMenuOpen, setServicesMenuOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [hoveredNav, setHoveredNav] = useState(null);
    const megaMenuRef = useRef(null);

    // Track scroll position for morphing header
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close Mega-Menu on outside click
    useEffect(() => {
        function handleClickOutside(event) {
            if (megaMenuRef.current && !megaMenuRef.current.contains(event.target)) {
                setServicesMenuOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // 7 Divisi Layanan with exact colors, badges, and icons
    const services = [
        {
            name: 'Photography & Videography',
            slug: 'photography-videography',
            tagline: 'Wedding, Wisuda, Event, Traveling, Drone & Cinema',
            accent: '#F59E0B',
            badge: 'Visual & Cinema',
            icon: Camera,
        },
        {
            name: 'Web Development',
            slug: 'web-development',
            tagline: 'Operasi Internal, Company Profile, Portal Pendidikan',
            accent: '#0EA5E9',
            badge: 'Cyber Architecture',
            icon: Code2,
        },
        {
            name: 'Langit Education',
            slug: 'langit-education',
            tagline: 'Kursus Coding (Robotik/Web/AI), Office, Rakit PC',
            accent: '#10B981',
            badge: 'Academy & Training',
            icon: GraduationCap,
        },
        {
            name: 'Computer Service',
            slug: 'computer-service',
            tagline: 'Installasi Software, Upgrade SSD, Rakit PC & Sparepart',
            accent: '#F97316',
            badge: 'Hardware Lab',
            icon: Cpu,
        },
        {
            name: 'Internship',
            slug: 'internship',
            tagline: 'Form Pendaftaran Magang / PKL Industri & Inkubasi',
            accent: '#8B5CF6',
            badge: 'Career Hub',
            icon: Sparkles,
        },
        {
            name: 'Sewa Alat',
            slug: 'sewa-alat',
            tagline: 'Rental Proyektor + Screen, Smart TV Display & Drone 4K',
            accent: '#14B8A6',
            badge: 'Rental Gear',
            icon: PackageCheck,
        },
        {
            name: 'Kolaborasi',
            slug: 'kolaborasi',
            tagline: 'Kemitraan Kampus, Sponsor Event & Vendor B2B',
            accent: '#EC4899',
            badge: 'Strategic Partner',
            icon: Handshake,
        },
        {
            name: 'Konsultasi & Kustomisasi',
            slug: 'konsultasi',
            href: '/konsultasi',
            tagline: 'Diskusikan Solusi Kustom, Estimasi Biaya & Jadwal Pengerjaan',
            accent: '#06B6D4',
            badge: 'Direct Advisory',
            icon: Sparkles,
        },
    ];

    const navLinks = [
        { name: 'Beranda', href: '/', id: 'beranda' },
        { name: 'Layanan', id: 'layanan', isDropdown: true },
        { name: 'Portofolio', href: '/portofolio', id: 'portofolio' },
        { name: 'Internship', href: '/layanan/internship', id: 'internship' },
        { name: 'Kontak', href: '/kontak', id: 'kontak' },
    ];

    const isCurrentActive = (item) => {
        if (item.isDropdown) {
            return url.startsWith('/layanan') || servicesMenuOpen;
        }
        if (item.href === '/') {
            return url === '/' || url === '';
        }
        return url === item.href;
    };

    return (
        <header className="fixed top-0 inset-x-0 z-50 flex justify-center px-4 pt-3 sm:pt-4 pointer-events-none transition-all duration-300">
            <div
                className={`
                    pointer-events-auto w-full transition-all duration-300 ease-out
                    rounded-2xl sm:rounded-full border
                    ${scrolled
                        ? 'max-w-4xl py-2 px-4 sm:px-6 bg-white/92 dark:bg-[#07090E]/92 backdrop-blur-md border-[#005792]/40 dark:border-[#005792]/50 shadow-xl shadow-[#005792]/15 dark:shadow-[0_12px_36px_-6px_rgba(0,87,146,0.35)] ring-1 ring-[#005792]/20'
                        : 'max-w-7xl py-3 sm:py-3.5 px-5 sm:px-8 bg-white/85 dark:bg-[#090D16]/85 backdrop-blur-md border-[#005792]/30 dark:border-[#005792]/45 shadow-lg shadow-[#005792]/8 dark:shadow-none ring-1 ring-[#005792]/15'
                    }
                `}
            >
                <div className="flex items-center justify-between gap-2.5 sm:gap-4 w-full">
                    {/* 1. BRAND LOGO */}
                    <Link href="/" className="flex items-center group shrink-0 py-0.5">
                        <span 
                            className={`font-etna font-bold tracking-tight text-[#005792] dark:text-cyan-400 flex items-center gap-1.5 leading-none transition-all duration-300 group-hover:text-cyan-600 dark:group-hover:text-cyan-300 ${
                                scrolled ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-3xl'
                            }`}
                            style={{ fontFamily: "'Etna Sans Serif', 'Etna', sans-serif" }}
                        >
                            langit
                            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-hud-pulse shadow-[0_0_8px_rgba(6,182,212,0.7)] shrink-0"></span>
                        </span>
                    </Link>

                    {/* 2. DESKTOP NAVIGATION WITH SLIDING NAV INDICATOR */}
                    <nav 
                        onMouseLeave={() => setHoveredNav(null)}
                        className={`hidden md:flex items-center rounded-full bg-slate-100/70 dark:bg-white/[0.04] border border-[#005792]/15 dark:border-[#005792]/25 relative shrink-0 transition-all duration-300 ${
                            scrolled ? 'gap-0.5 p-0.5' : 'gap-0.5 lg:gap-1 p-1'
                        }`}
                    >
                        {navLinks.map((item) => {
                            const active = isCurrentActive(item);
                            const isHovered = hoveredNav === item.id;

                            if (item.isDropdown) {
                                return (
                                    <div key={item.id} className="relative" ref={megaMenuRef}>
                                        <button
                                            type="button"
                                            onClick={() => setServicesMenuOpen(!servicesMenuOpen)}
                                            onMouseEnter={() => {
                                                setHoveredNav(item.id);
                                                setServicesMenuOpen(true);
                                            }}
                                            className={`
                                                relative rounded-full font-semibold tracking-wide flex items-center gap-1 transition-all duration-200 z-10 whitespace-nowrap
                                                ${scrolled ? 'px-2 lg:px-2.5 py-1 text-[11px] lg:text-xs' : 'px-2.5 lg:px-3.5 py-1.5 text-xs'}
                                                ${active ? 'text-cyan-600 dark:text-cyan-400 font-bold' : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'}
                                            `}
                                        >
                                            {/* Sliding Nav Indicator pill */}
                                            {isHovered && (
                                                <motion.div
                                                    layoutId="nav-pill-highlight"
                                                    transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                                                    className="absolute inset-0 rounded-full bg-white dark:bg-white/10 shadow-sm border border-[#005792]/20 dark:border-white/10 -z-10"
                                                />
                                            )}
                                            <span>{item.name}</span>
                                            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${servicesMenuOpen ? 'rotate-180 text-cyan-500' : ''}`} />
                                        </button>
                                    </div>
                                );
                            }

                            return (
                                <Link
                                    key={item.id}
                                    href={item.href}
                                    onMouseEnter={() => {
                                        setHoveredNav(item.id);
                                        setServicesMenuOpen(false);
                                    }}
                                    className={`
                                        relative rounded-full font-semibold tracking-wide transition-all duration-200 z-10 whitespace-nowrap
                                        ${scrolled ? 'px-2 lg:px-2.5 py-1 text-[11px] lg:text-xs' : 'px-2.5 lg:px-3.5 py-1.5 text-xs'}
                                        ${active ? 'text-cyan-600 dark:text-cyan-400 font-bold' : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'}
                                    `}
                                >
                                    {/* Sliding Nav Indicator pill */}
                                    {isHovered && (
                                        <motion.div
                                            layoutId="nav-pill-highlight"
                                            transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                                            className="absolute inset-0 rounded-full bg-white dark:bg-white/10 shadow-sm border border-[#005792]/20 dark:border-white/10 -z-10"
                                        />
                                    )}
                                    <span>{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* 3. RIGHT CONTROLS: THEME SWITCHER, CMS LINK & CTA */}
                    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                        {/* Segmented Dual-Theme Switcher (Terang Utama & Gelap) */}
                        {setTheme ? (
                            <div className={`flex items-center p-0.5 rounded-full bg-slate-200/80 dark:bg-white/10 border border-[#005792]/20 dark:border-[#005792]/30 shadow-inner transition-all duration-300 ${
                                scrolled ? 'gap-0.5' : 'gap-1'
                            }`}>
                                <button
                                    type="button"
                                    onClick={() => setTheme('light')}
                                    className={`flex items-center justify-center gap-1 rounded-full text-xs font-semibold transition-all duration-200 ${
                                        scrolled ? 'p-1.5' : 'px-2 sm:px-2.5 py-1'
                                    } ${
                                        theme === 'light'
                                            ? 'bg-white text-amber-600 shadow-sm font-bold scale-[1.02]'
                                            : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                                    }`}
                                    title="Pilih Tema Terang (Tema Utama)"
                                >
                                    <Sun className="w-3.5 h-3.5 shrink-0" />
                                    {!scrolled && (
                                        <span className="hidden sm:inline text-[11px]">Terang</span>
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setTheme('dark')}
                                    className={`flex items-center justify-center gap-1 rounded-full text-xs font-semibold transition-all duration-200 ${
                                        scrolled ? 'p-1.5' : 'px-2 sm:px-2.5 py-1'
                                    } ${
                                        theme === 'dark'
                                            ? 'bg-slate-900 text-indigo-300 shadow-sm font-bold scale-[1.02]'
                                            : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                                    }`}
                                    title="Pilih Tema Gelap (Tema Kedua)"
                                >
                                    <Moon className="w-3.5 h-3.5 shrink-0" />
                                    {!scrolled && (
                                        <span className="hidden sm:inline text-[11px]">Gelap</span>
                                    )}
                                </button>
                            </div>
                        ) : toggleTheme ? (
                            <button
                                type="button"
                                onClick={toggleTheme}
                                aria-label="Toggle Theme"
                                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-700 dark:text-amber-400 border border-[#005792]/20 dark:border-[#005792]/30 transition-transform active:scale-95 shadow-sm"
                            >
                                {theme === 'dark' ? (
                                    <Sun className="w-4 h-4 text-amber-400" />
                                ) : (
                                    <Moon className="w-4 h-4 text-slate-700" />
                                )}
                            </button>
                        ) : null}

                        {/* Admin CMS Portal link */}
                        <Link 
                            href="/admin/login" 
                            title="Admin CMS Portal"
                            className={`${scrolled ? 'hidden xl:flex' : 'hidden lg:flex'} shrink-0 items-center gap-1 px-2.5 py-1 text-xs font-mono text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-[#005792]/20 dark:border-[#005792]/30 rounded-full transition-all`}
                        >
                            <span>CMS</span>
                        </Link>

                        {/* Consultation CTA */}
                        <Link
                            href="/konsultasi"
                            className={`shrink-0 hidden sm:inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#005792] via-sky-500 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-[#005792]/25 hover:scale-105 active:scale-95 transition-all whitespace-nowrap ${
                                scrolled ? 'px-3 py-1.5' : 'px-3.5 sm:px-4 py-1.5'
                            }`}
                        >
                            <span>Konsultasi</span>
                            <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                        </Link>

                        {/* Mobile Hamburger Toggle */}
                        <button
                            type="button"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-white border border-[#005792]/25 dark:border-[#005792]/35"
                            aria-label="Toggle Menu"
                        >
                            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* 4. BENTO MEGA-MENU DROPDOWN STAGGERED REVEAL */}
            <AnimatePresence>
                {servicesMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -12, scale: 0.97 }}
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        onMouseLeave={() => setServicesMenuOpen(false)}
                        className="pointer-events-auto absolute top-20 left-1/2 -translate-x-1/2 w-full max-w-5xl px-4 z-40 hidden md:block"
                    >
                        <div className="p-6 rounded-3xl bg-white/95 dark:bg-[#07090E]/95 backdrop-blur-3xl border border-[#005792]/30 dark:border-[#005792]/40 shadow-2xl shadow-[#005792]/15 dark:shadow-black/80 ring-1 ring-[#005792]/20">
                            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-white/10">
                                <div>
                                    <span className="text-[10px] font-mono tracking-wider uppercase text-cyan-600 dark:text-cyan-400 font-bold block">
                                        Multi-Disciplinary Ecosystem
                                    </span>
                                    <h3 className="font-heading font-extrabold text-base text-slate-900 dark:text-white">
                                        Eksplorasi 7 Divisi Spesialis Langit
                                    </h3>
                                </div>
                                <span className="text-xs font-mono text-slate-500">
                                    Hover tiap card untuk melihat Quick-HUD info
                                </span>
                            </div>

                            {/* 7 Services Bento Grid with Staggered Reveal */}
                            <motion.div 
                                initial="hidden"
                                animate="visible"
                                variants={{
                                    hidden: { opacity: 0 },
                                    visible: {
                                        opacity: 1,
                                        transition: { staggerChildren: 0.04 }
                                    }
                                }}
                                className="grid grid-cols-1 md:grid-cols-2 gap-3"
                            >
                                {services.map((item) => {
                                    const Icon = item.icon;

                                    return (
                                        <motion.div
                                            key={item.slug}
                                            variants={{
                                                hidden: { opacity: 0, y: 14, scale: 0.96 },
                                                visible: { opacity: 1, y: 0, scale: 1 }
                                            }}
                                            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                                        >
                                            <InteractiveBentoCard
                                                href={item.href || `/layanan/${item.slug}`}
                                                serviceSlug={item.slug}
                                                accentColor={item.accent}
                                                onClick={() => setServicesMenuOpen(false)}
                                                className="p-3.5 h-full bg-slate-50/90 hover:bg-white dark:bg-white/[0.03] dark:hover:bg-white/[0.08] border border-slate-200/90 hover:border-slate-300 dark:border-white/10 dark:hover:border-white/20 hover:shadow-md transition-all rounded-2xl"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div 
                                                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-slate-200/80 dark:border-white/10 shadow-sm"
                                                        style={{ backgroundColor: `${item.accent}15`, color: item.accent }}
                                                    >
                                                        <Icon className="w-5 h-5" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between gap-1 mb-0.5">
                                                            <h4 className="font-heading font-bold text-xs text-slate-900 dark:text-white truncate group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors">
                                                                {item.name}
                                                            </h4>
                                                            <span 
                                                                className="text-[9px] font-mono px-1.5 py-0.2 rounded font-bold shrink-0"
                                                                style={{ backgroundColor: `${item.accent}20`, color: item.accent }}
                                                            >
                                                                {item.badge}
                                                            </span>
                                                        </div>
                                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                                                            {item.tagline}
                                                        </p>
                                                    </div>
                                                </div>
                                            </InteractiveBentoCard>
                                        </motion.div>
                                    );
                                })}
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 5. MOBILE MENU DRAWER */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                        className="pointer-events-auto fixed inset-x-4 top-20 z-50 md:hidden max-h-[85vh] overflow-y-auto p-5 rounded-3xl bg-white dark:bg-[#07090E] border border-[#005792]/30 dark:border-[#005792]/40 shadow-2xl shadow-[#005792]/15 ring-1 ring-[#005792]/20"
                    >
                        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10 mb-4">
                            <span className="text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400 uppercase">
                                Navigasi Ekosistem Langit
                            </span>
                            <button 
                                onClick={() => setMobileMenuOpen(false)}
                                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10"
                            >
                                <X className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                            </button>
                        </div>

                        <div className="space-y-2 mb-6">
                            <Link 
                                href="/" 
                                onClick={() => setMobileMenuOpen(false)}
                                className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5"
                            >
                                Beranda
                            </Link>
                            <Link 
                                href="/portofolio" 
                                onClick={() => setMobileMenuOpen(false)}
                                className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5"
                            >
                                Portofolio
                            </Link>
                            <Link 
                                href="/layanan/internship" 
                                onClick={() => setMobileMenuOpen(false)}
                                className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5"
                            >
                                Internship Program
                            </Link>
                            <Link 
                                href="/kontak" 
                                onClick={() => setMobileMenuOpen(false)}
                                className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5"
                            >
                                Kontak & Lokasi Studio
                            </Link>
                            <Link 
                                href="/konsultasi" 
                                onClick={() => setMobileMenuOpen(false)}
                                className="block px-3 py-2 rounded-xl text-sm font-bold text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-500/10"
                            >
                                Mulai Konsultasi 3 Langkah →
                            </Link>
                        </div>

                        <div className="pt-4 border-t border-slate-200 dark:border-white/10">
                            <span className="text-[10px] font-mono uppercase text-slate-500 block mb-3 font-semibold">
                                7 Divisi Layanan:
                            </span>
                            <div className="grid grid-cols-1 gap-2">
                                {services.map((srv) => (
                                    <Link
                                        key={srv.slug}
                                        href={`/layanan/${srv.slug}`}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="p-2.5 rounded-xl border border-slate-200/80 dark:border-white/5 hover:border-cyan-500/30 flex items-center gap-3 bg-slate-50/50 dark:bg-white/[0.02]"
                                    >
                                        <div 
                                            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                                            style={{ backgroundColor: `${srv.accent}20`, color: srv.accent }}
                                        >
                                            <srv.icon className="w-4 h-4" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                                {srv.name}
                                            </h5>
                                            <span className="text-[10px] text-slate-500 block truncate">
                                                {srv.tagline}
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
