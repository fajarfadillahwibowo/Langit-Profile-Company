import React, { useState } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ScanFace,
    Images,
    ShoppingBag,
    DownloadCloud,
    User,
    LogOut,
    Menu,
    X,
    Camera,
    Lock,
    CheckCircle2,
    AlertCircle,
    Home,
} from 'lucide-react';
import AnimatedAmbientBackdrop from '@/Components/AnimatedAmbientBackdrop';

export default function ScanCustomerLayout({ title = 'LangitLens', children }) {
    const { url, props } = usePage();
    const { auth, sidebarBadges, flash } = props;
    const [mobileOpen, setMobileOpen] = useState(false);

    const hasScanned = Boolean(sidebarBadges?.hasScanned);
    const matchedCount = sidebarBadges?.matchedCount || 0;
    const cartCount = sidebarBadges?.cartCount || 0;
    const readyDownloadsCount = sidebarBadges?.readyDownloadsCount || 0;

    const isScanPage = url === '/scan-foto' || url === '/scan-foto/' || url.startsWith('/scan-foto?');
    const userInitial = (auth?.user?.name || auth?.user?.username || 'L').charAt(0).toUpperCase();

    const navItems = [
        {
            name: 'Scan Wajah',
            href: '/scan-foto',
            icon: ScanFace,
            active: isScanPage,
            locked: false,
        },
        {
            name: 'Foto Saya',
            href: '/scan-foto/hasil',
            icon: Images,
            badge: hasScanned ? matchedCount : null,
            active: url.startsWith('/scan-foto/hasil'),
            locked: !hasScanned,
        },
        {
            name: 'Keranjang',
            href: '/scan-foto/keranjang',
            icon: ShoppingBag,
            badge: cartCount > 0 ? cartCount : null,
            badgeColor: 'bg-amber-400 text-slate-950',
            active: url.startsWith('/scan-foto/keranjang'),
            locked: !hasScanned,
        },
        {
            name: 'Unduh Foto',
            href: '/scan-foto/unduhan',
            icon: DownloadCloud,
            badge: readyDownloadsCount > 0 ? readyDownloadsCount : null,
            badgeColor: 'bg-emerald-400 text-slate-950',
            active: url.startsWith('/scan-foto/unduhan'),
            locked: false,
        },
        {
            name: 'Profil',
            href: '/scan-foto/profil',
            icon: User,
            active: url.startsWith('/scan-foto/profil'),
            locked: false,
        },
    ];

    const handleLogout = () => {
        router.post('/logout');
    };

    const SidebarContent = ({ isMobile = false }) => (
        <div className="flex flex-col h-full bg-[#090E1A]/96 border-r border-white/10 text-slate-200 relative overflow-hidden">
            {/* Brand Header */}
            <div className="relative z-10 flex items-center justify-between px-4 py-4 border-b border-white/10">
                <Link href="/scan-foto" className="flex items-center gap-3 min-w-0 group">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#005792] via-sky-500 to-cyan-400 flex items-center justify-center shrink-0 shadow-lg shadow-sky-500/25 group-hover:scale-105 transition-transform">
                        <Camera className="w-5 h-5 text-white" />
                    </div>
                    <div className="min-w-0">
                        <div className="font-heading font-black text-white text-sm tracking-tight truncate">
                            LangitLens
                        </div>
                        <div className="text-[11px] text-sky-300/80 truncate">Galeri Foto</div>
                    </div>
                </Link>
                <button
                    type="button"
                    onClick={() => setMobileOpen(false)}
                    className="lg:hidden min-w-10 min-h-10 flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
                    aria-label="Tutup menu"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Navigation Items */}
            <nav className="relative z-10 flex-1 overflow-y-auto sidebar-scroll px-3 py-3.5 space-y-1">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileOpen(false)}
                            className={`relative min-h-11 flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm font-medium transition-all duration-200 group ${
                                item.active
                                    ? 'text-white'
                                    : item.locked
                                      ? 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.03]'
                                      : 'text-slate-300 hover:text-white hover:bg-white/[0.06]'
                            }`}
                        >
                            {item.active && (
                                <motion.span
                                    layoutId={isMobile ? 'scan-mobile-nav-pill' : 'scan-desktop-nav-pill'}
                                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                                    className="absolute inset-0 rounded-2xl bg-gradient-to-r from-sky-500/20 via-cyan-500/15 to-indigo-500/15 border border-sky-400/35 shadow-md shadow-sky-500/10"
                                />
                            )}

                            <span className="relative z-10 flex items-center gap-3 min-w-0">
                                <span
                                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                                        item.active
                                            ? 'bg-sky-500/25 text-cyan-300'
                                            : 'bg-white/[0.04] text-slate-400 group-hover:text-sky-300'
                                    }`}
                                >
                                    <Icon className="w-4 h-4" />
                                </span>
                                <span className="truncate font-semibold text-[13px]">{item.name}</span>
                            </span>

                            <span className="relative z-10 shrink-0">
                                {item.locked ? (
                                    <Lock className="w-3.5 h-3.5 text-slate-600" />
                                ) : item.badge !== null && item.badge !== undefined ? (
                                    <span
                                        className={`ml-2 px-2 py-0.5 text-[10px] font-extrabold rounded-full ${
                                            item.badgeColor || 'bg-sky-400 text-slate-950'
                                        }`}
                                    >
                                        {item.badge}
                                    </span>
                                ) : null}
                            </span>
                        </Link>
                    );
                })}
            </nav>

            {/* Footer Account & Actions */}
            <div className="relative z-10 p-3.5 border-t border-white/10 space-y-2.5 bg-black/20">
                <div className="p-2.5 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 via-sky-500 to-indigo-500 text-slate-950 font-black text-sm flex items-center justify-center shrink-0">
                        {userInitial}
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-white truncate">{auth?.user?.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">
                            {auth?.user?.username || auth?.user?.whatsapp_number || auth?.user?.email}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <Link
                        href="/"
                        className="min-h-10 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.09] border border-white/10 transition-colors"
                    >
                        <Home className="w-3.5 h-3.5 text-sky-400" />
                        <span>Beranda</span>
                    </Link>
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="min-h-10 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-colors active:scale-[0.98] cursor-pointer"
                    >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Keluar</span>
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#050811] text-slate-100 flex pb-22 lg:pb-0 relative overflow-x-clip">
            {/* Flowing Moving Background (Aurora + Light Ribbon + Drifting Orbs) */}
            <AnimatedAmbientBackdrop variant="dark" />

            {/* Desktop Fixed Sidebar */}
            <aside className="hidden lg:block w-64 shrink-0 fixed inset-y-0 left-0 z-30">
                <SidebarContent />
            </aside>

            {/* Mobile Drawer */}
            <AnimatePresence>
                {mobileOpen && (
                    <div className="fixed inset-0 z-50 lg:hidden flex">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/75 backdrop-blur-xs"
                            onClick={() => setMobileOpen(false)}
                        />
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', stiffness: 360, damping: 34 }}
                            className="relative w-72 max-w-[85vw] h-full z-10 shadow-2xl"
                        >
                            <SidebarContent isMobile />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Main Content Column */}
            <div className="relative z-10 flex-1 lg:pl-64 flex flex-col min-w-0">
                <header className="sticky top-0 z-20 bg-[#050811]/90 backdrop-blur-md border-b border-white/10 px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                        <button
                            type="button"
                            onClick={() => setMobileOpen(true)}
                            className="lg:hidden min-w-10 min-h-10 flex items-center justify-center rounded-xl bg-white/[0.06] border border-white/10 text-slate-200 hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
                            aria-label="Buka menu"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                        <h1 className="font-heading text-base sm:text-lg font-bold text-white truncate">
                            {title}
                        </h1>
                    </div>

                    <Link
                        href="/scan-foto/keranjang"
                        className="min-h-10 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white/[0.06] hover:bg-white/[0.12] border border-white/12 text-white transition-all active:scale-[0.98] shrink-0"
                    >
                        {!hasScanned ? (
                            <Lock className="w-3.5 h-3.5 text-slate-500" />
                        ) : (
                            <ShoppingBag className="w-4 h-4 text-cyan-400" />
                        )}
                        <span>Keranjang</span>
                        <span
                            className={`px-2 py-0.5 rounded-full font-extrabold text-[11px] ${
                                cartCount > 0
                                    ? 'bg-gradient-to-r from-sky-400 to-cyan-300 text-slate-950'
                                    : 'bg-white/10 text-slate-300'
                            }`}
                        >
                            {cartCount}
                        </span>
                    </Link>
                </header>

                <main className="flex-1 p-4 sm:p-6 max-w-5xl w-full mx-auto space-y-5">
                    <AnimatePresence>
                        {flash?.success && (
                            <motion.div
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                className="flex items-start gap-3 p-3.5 rounded-2xl bg-emerald-500/12 border border-emerald-400/35 text-emerald-200 text-sm backdrop-blur-md"
                            >
                                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                                <span>{flash.success}</span>
                            </motion.div>
                        )}
                        {flash?.error && (
                            <motion.div
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                className="flex items-start gap-3 p-3.5 rounded-2xl bg-rose-500/12 border border-rose-400/35 text-rose-200 text-sm backdrop-blur-md"
                            >
                                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                                <span>{flash.error}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {children}
                </main>
            </div>

            {/* Floating Glass Mobile Bottom Navigation */}
            <nav className="lg:hidden fixed bottom-2.5 inset-x-3 z-30 bg-[#0B1222]/94 backdrop-blur-md border border-white/12 rounded-2xl shadow-2xl shadow-black/70 grid grid-cols-4 px-1.5 py-1.5">
                <Link
                    href="/scan-foto"
                    className={`min-h-12 flex flex-col items-center justify-center gap-0.5 rounded-xl text-[10px] font-bold transition-all active:scale-95 ${
                        isScanPage
                            ? 'text-cyan-300 bg-sky-500/20 border border-sky-400/30'
                            : 'text-slate-400'
                    }`}
                >
                    <ScanFace className="w-5 h-5" />
                    <span>Scan</span>
                </Link>
                <Link
                    href="/scan-foto/hasil"
                    className={`min-h-12 flex flex-col items-center justify-center gap-0.5 rounded-xl text-[10px] font-bold relative transition-all active:scale-95 ${
                        url.startsWith('/scan-foto/hasil')
                            ? 'text-cyan-300 bg-sky-500/20 border border-sky-400/30'
                            : !hasScanned
                              ? 'text-slate-600'
                              : 'text-slate-400'
                    }`}
                >
                    <Images className="w-5 h-5" />
                    <span className="inline-flex items-center gap-0.5">
                        Foto Saya
                        {!hasScanned && <Lock className="w-2.5 h-2.5" />}
                    </span>
                    {hasScanned && matchedCount > 0 && (
                        <span className="absolute top-1 right-2.5 px-1.5 rounded-full bg-cyan-400 text-slate-950 text-[9px] font-black">
                            {matchedCount}
                        </span>
                    )}
                </Link>
                <Link
                    href="/scan-foto/keranjang"
                    className={`min-h-12 flex flex-col items-center justify-center gap-0.5 rounded-xl text-[10px] font-bold relative transition-all active:scale-95 ${
                        url.startsWith('/scan-foto/keranjang')
                            ? 'text-cyan-300 bg-sky-500/20 border border-sky-400/30'
                            : !hasScanned
                              ? 'text-slate-600'
                              : 'text-slate-400'
                    }`}
                >
                    <ShoppingBag className="w-5 h-5" />
                    <span className="inline-flex items-center gap-0.5">
                        Keranjang
                        {!hasScanned && <Lock className="w-2.5 h-2.5" />}
                    </span>
                    {cartCount > 0 && (
                        <span className="absolute top-1 right-2.5 px-1.5 rounded-full bg-amber-400 text-slate-950 text-[9px] font-black">
                            {cartCount}
                        </span>
                    )}
                </Link>
                <Link
                    href="/scan-foto/unduhan"
                    className={`min-h-12 flex flex-col items-center justify-center gap-0.5 rounded-xl text-[10px] font-bold relative transition-all active:scale-95 ${
                        url.startsWith('/scan-foto/unduhan')
                            ? 'text-emerald-300 bg-emerald-500/20 border border-emerald-400/30'
                            : 'text-slate-400'
                    }`}
                >
                    <DownloadCloud className="w-5 h-5" />
                    <span>Unduh</span>
                    {readyDownloadsCount > 0 && (
                        <span className="absolute top-1 right-2.5 px-1.5 rounded-full bg-emerald-400 text-slate-950 text-[9px] font-black">
                            {readyDownloadsCount}
                        </span>
                    )}
                </Link>
            </nav>
        </div>
    );
}
