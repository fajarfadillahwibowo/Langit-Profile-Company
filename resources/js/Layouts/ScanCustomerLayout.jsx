import React, { useState } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
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
} from 'lucide-react';

export default function ScanCustomerLayout({ title = 'LangitLens', children }) {
    const { url, props } = usePage();
    const { auth, sidebarBadges, flash } = props;
    const [mobileOpen, setMobileOpen] = useState(false);

    const hasScanned = Boolean(sidebarBadges?.hasScanned);
    const matchedCount = sidebarBadges?.matchedCount || 0;
    const cartCount = sidebarBadges?.cartCount || 0;
    const readyDownloadsCount = sidebarBadges?.readyDownloadsCount || 0;

    const isScanPage = url === '/scan-foto' || url === '/scan-foto/' || url.startsWith('/scan-foto?');

    const navItems = [
        {
            name: 'Scan Wajah',
            subtitle: 'Langkah 1',
            href: '/scan-foto',
            icon: ScanFace,
            active: isScanPage,
            locked: false,
        },
        {
            name: 'Foto Saya',
            subtitle: 'Langkah 2',
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
            active: url.startsWith('/scan-foto/keranjang'),
            locked: !hasScanned,
        },
        {
            name: 'Unduh Foto',
            href: '/scan-foto/unduhan',
            icon: DownloadCloud,
            badge: readyDownloadsCount > 0 ? readyDownloadsCount : null,
            badgeColor: 'bg-emerald-500 text-slate-950',
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

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-[#0D1320] border-r border-slate-800 text-slate-200">
            <div className="flex items-center justify-between px-4 py-4 border-b border-slate-800">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-sky-500 flex items-center justify-center shrink-0">
                        <Camera className="w-5 h-5 text-slate-950" />
                    </div>
                    <div className="min-w-0">
                        <div className="font-bold text-white text-sm tracking-tight truncate">LangitLens</div>
                        <div className="text-[11px] font-medium text-sky-400">Galeri Pelanggan</div>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => setMobileOpen(false)}
                    className="lg:hidden min-w-10 min-h-10 flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 active:scale-95 transition-transform"
                    aria-label="Tutup menu"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            <nav className="flex-1 overflow-y-auto sidebar-scroll px-3 py-3 space-y-1">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileOpen(false)}
                            className={`min-h-11 flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150 active:scale-[0.99] ${
                                item.active
                                    ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30'
                                    : item.locked
                                      ? 'text-slate-500 hover:text-slate-300 hover:bg-slate-900/50 border border-transparent'
                                      : 'text-slate-300 hover:text-white hover:bg-slate-800/70 border border-transparent'
                            }`}
                        >
                            <span className="flex items-center gap-3 min-w-0">
                                <Icon className={`w-4 h-4 shrink-0 ${item.active ? 'text-sky-400' : ''}`} />
                                <span className="min-w-0">
                                    <span className="block truncate">{item.name}</span>
                                    {item.subtitle && (
                                        <span className="block text-[11px] text-slate-400 font-normal">
                                            {item.subtitle}
                                        </span>
                                    )}
                                </span>
                            </span>
                            {item.locked ? (
                                <Lock className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                            ) : item.badge !== null && item.badge !== undefined ? (
                                <span
                                    className={`ml-2 px-2 py-0.5 text-[11px] font-bold rounded-full shrink-0 ${
                                        item.badgeColor || 'bg-sky-500 text-slate-950'
                                    }`}
                                >
                                    {item.badge}
                                </span>
                            ) : null}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-3.5 border-t border-slate-800 space-y-2.5">
                <div className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800">
                    <p className="text-xs font-semibold text-white truncate">{auth?.user?.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">
                        {auth?.user?.username || auth?.user?.whatsapp_number || auth?.user?.email}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full min-h-11 flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-medium text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-colors active:scale-[0.98] cursor-pointer"
                >
                    <LogOut className="w-4 h-4" />
                    <span>Keluar</span>
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#090D16] text-slate-100 flex pb-20 lg:pb-0">
            <aside className="hidden lg:block w-64 shrink-0 fixed inset-y-0 left-0 z-30">
                <SidebarContent />
            </aside>

            {mobileOpen && (
                <div className="fixed inset-0 z-50 lg:hidden flex">
                    <div
                        className="fixed inset-0 bg-black/75"
                        onClick={() => setMobileOpen(false)}
                    />
                    <div className="relative w-72 max-w-[85vw] h-full z-10 animate-fade-in">
                        <SidebarContent />
                    </div>
                </div>
            )}

            <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
                <header className="sticky top-0 z-20 bg-[#090D16]/95 border-b border-slate-800 px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                        <button
                            type="button"
                            onClick={() => setMobileOpen(true)}
                            className="lg:hidden min-w-10 min-h-10 flex items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-slate-200 hover:bg-slate-800 active:scale-95 transition-transform"
                            aria-label="Buka menu"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                        <h1 className="text-base sm:text-lg font-bold text-white truncate">{title}</h1>
                    </div>

                    <Link
                        href="/scan-foto/keranjang"
                        className="min-h-10 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 transition-colors active:scale-[0.98] shrink-0"
                    >
                        {!hasScanned ? (
                            <Lock className="w-3.5 h-3.5 text-slate-500" />
                        ) : (
                            <ShoppingBag className="w-4 h-4 text-sky-400" />
                        )}
                        <span>Keranjang</span>
                        <span className="px-1.5 py-0.5 rounded-md bg-sky-500/20 text-sky-300 font-bold">
                            {cartCount}
                        </span>
                    </Link>
                </header>

                <main className="flex-1 p-4 sm:p-6 max-w-5xl w-full mx-auto space-y-4 sm:space-y-5">
                    {flash?.success && (
                        <div className="animate-fade-in flex items-start gap-3 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 text-sm">
                            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                            <span>{flash.success}</span>
                        </div>
                    )}
                    {flash?.error && (
                        <div className="animate-fade-in flex items-start gap-3 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-sm">
                            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                            <span>{flash.error}</span>
                        </div>
                    )}

                    {children}
                </main>
            </div>

            {/* Navigasi Bawah Smartphone (Touch-friendly) */}
            <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-[#0D1320] border-t border-slate-800 grid grid-cols-4 px-1 py-1.5">
                <Link
                    href="/scan-foto"
                    className={`min-h-12 flex flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-medium transition-colors active:scale-95 ${
                        isScanPage ? 'text-sky-400 bg-sky-500/10' : 'text-slate-400'
                    }`}
                >
                    <ScanFace className="w-5 h-5" />
                    <span>Scan</span>
                </Link>
                <Link
                    href="/scan-foto/hasil"
                    className={`min-h-12 flex flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-medium relative transition-colors active:scale-95 ${
                        url.startsWith('/scan-foto/hasil') ? 'text-sky-400 bg-sky-500/10' : !hasScanned ? 'text-slate-600' : 'text-slate-400'
                    }`}
                >
                    <Images className="w-5 h-5" />
                    <span className="inline-flex items-center gap-1">
                        Foto Saya
                        {!hasScanned && <Lock className="w-3 h-3" />}
                    </span>
                    {hasScanned && matchedCount > 0 && (
                        <span className="absolute top-1 right-3 px-1.5 rounded-full bg-sky-500 text-slate-950 text-[10px] font-bold">
                            {matchedCount}
                        </span>
                    )}
                </Link>
                <Link
                    href="/scan-foto/keranjang"
                    className={`min-h-12 flex flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-medium relative transition-colors active:scale-95 ${
                        url.startsWith('/scan-foto/keranjang') ? 'text-sky-400 bg-sky-500/10' : !hasScanned ? 'text-slate-600' : 'text-slate-400'
                    }`}
                >
                    <ShoppingBag className="w-5 h-5" />
                    <span className="inline-flex items-center gap-1">
                        Keranjang
                        {!hasScanned && <Lock className="w-3 h-3" />}
                    </span>
                    {cartCount > 0 && (
                        <span className="absolute top-1 right-3 px-1.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-bold">
                            {cartCount}
                        </span>
                    )}
                </Link>
                <Link
                    href="/scan-foto/unduhan"
                    className={`min-h-12 flex flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-medium relative transition-colors active:scale-95 ${
                        url.startsWith('/scan-foto/unduhan') ? 'text-sky-400 bg-sky-500/10' : 'text-slate-400'
                    }`}
                >
                    <DownloadCloud className="w-5 h-5" />
                    <span>Unduh</span>
                    {readyDownloadsCount > 0 && (
                        <span className="absolute top-1 right-3 px-1.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-bold">
                            {readyDownloadsCount}
                        </span>
                    )}
                </Link>
            </nav>
        </div>
    );
}
