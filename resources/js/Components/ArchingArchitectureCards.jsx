import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ChevronLeft, ChevronRight, Play, Pause, ArrowRight,
    Sparkles, ShieldCheck, Zap, Activity
} from 'lucide-react';

/* ── 1. REAL OFFICIAL SVGS FOR EACH ARCHITECTURE TECHNOLOGY ────────────── */

export function LogoLaravel({ className = "w-9 h-9" }) {
    return (
        <svg viewBox="0 0 24 24" className={className} fill="#FF2D20">
            <path d="M23.642 5.43a.364.364 0 01.014.1v5.149c0 .135-.073.26-.189.326l-4.323 2.49v4.934a.378.378 0 01-.188.326L9.93 23.949a.316.316 0 01-.066.027c-.008.002-.016.008-.024.01a.348.348 0 01-.192 0c-.011-.002-.02-.008-.03-.012-.02-.008-.042-.014-.062-.025L.533 18.755a.376.376 0 01-.189-.326V2.974c0-.033.005-.066.014-.098.003-.012.01-.02.014-.032a.369.369 0 01.023-.058c.004-.013.015-.022.023-.033l.033-.045c.012-.01.025-.018.037-.027.014-.012.027-.024.041-.034H.53L5.043.05a.375.375 0 01.375 0L9.93 2.647h.002c.015.01.027.021.04.033l.038.027c.013.014.02.03.033.045.008.011.02.021.025.033.01.02.017.038.024.058.003.011.01.021.013.032.01.031.014.064.014.098v9.652l3.76-2.164V5.527c0-.033.004-.066.013-.098.003-.01.01-.02.013-.032a.487.487 0 01.024-.059c.007-.012.018-.02.025-.033.012-.015.021-.03.033-.043.012-.012.025-.02.037-.028.014-.01.026-.023.041-.032h.001l4.513-2.598a.375.375 0 01.375 0l4.513 2.598c.016.01.027.021.042.031.012.01.025.018.036.028.013.014.022.03.034.044.008.012.019.021.024.033.011.02.018.04.024.06.006.01.012.021.015.032zm-.74 5.032V6.179l-1.578.908-2.182 1.256v4.283zm-4.51 7.75v-4.287l-2.147 1.225-6.126 3.498v4.325zM1.093 3.624v14.588l8.273 4.761v-4.325l-4.322-2.445-.002-.003H5.04c-.014-.01-.025-.021-.04-.031-.011-.01-.024-.018-.035-.027l-.001-.002c-.013-.012-.021-.025-.031-.04-.01-.011-.021-.022-.028-.036h-.002c-.008-.014-.013-.031-.02-.047-.006-.016-.014-.027-.018-.043a.49.49 0 01-.008-.057c-.002-.014-.006-.027-.006-.041V5.789l-2.18-1.257zM5.23.81L1.47 2.974l3.76 2.164 3.758-2.164zm1.956 13.505l2.182-1.256V3.624l-1.58.91-2.182 1.255v9.435zm11.581-10.95l-3.76 2.163 3.76 2.163 3.759-2.164zm-.376 4.978L16.21 7.087 14.63 6.18v4.283l2.182 1.256 1.58.908zm-8.65 9.654l5.514-3.148 2.756-1.572-3.757-2.163-4.323 2.489-3.941 2.27z"/>
        </svg>
    );
}

export function LogoReact({ className = "w-9 h-9" }) {
    return (
        <svg viewBox="-11.5 -10.23174 23 20.46348" className={className}>
            <circle cx="0" cy="0" r="2.05" fill="#61DAFB"/>
            <g stroke="#61DAFB" strokeWidth="1" fill="none">
                <ellipse rx="11" ry="4.2"/>
                <ellipse rx="11" ry="4.2" transform="rotate(60)"/>
                <ellipse rx="11" ry="4.2" transform="rotate(120)"/>
            </g>
        </svg>
    );
}

export function LogoVue({ className = "w-9 h-9" }) {
    return (
        <svg viewBox="0 0 24 24" className={className}>
            <path d="M0 1.61h9.94L12 5.16l2.06-3.55H24L12 22.39z" fill="#42B883"/>
            <path d="M5.16 2.23h4.43L12 6.41l2.41-4.18h4.43L12 14.08z" fill="#35495E"/>
        </svg>
    );
}

export function LogoPhp({ className = "w-9 h-9" }) {
    return (
        <svg viewBox="0 0 24 24" className={className} fill="#777BB4">
            <path d="M7.01 10.207h-.944l-.515 2.648h.838c.556 0 .97-.105 1.242-.314.272-.21.455-.559.55-1.049.092-.47.05-.802-.124-.995-.175-.193-.523-.29-1.047-.29zM12 5.688C5.373 5.688 0 8.514 0 12s5.373 6.313 12 6.313S24 15.486 24 12c0-3.486-5.373-6.312-12-6.312zm-3.26 7.451c-.261.25-.575.438-.917.551-.336.108-.765.164-1.285.164H5.357l-.327 1.681H3.652l1.23-6.326h2.65c.797 0 1.378.209 1.744.628.366.418.476 1.002.33 1.752a2.836 2.836 0 0 1-.305.847c-.143.255-.33.49-.561.703zm4.024.715l.543-2.799c.063-.318.039-.536-.068-.651-.107-.116-.336-.174-.687-.174H11.46l-.704 3.625H9.388l1.23-6.327h1.367l-.327 1.682h1.218c.767 0 1.295.134 1.586.401s.378.7.263 1.299l-.572 2.944h-1.389zm7.597-2.265a2.782 2.782 0 0 1-.305.847c-.143.255-.33.49-.561.703a2.44 2.44 0 0 1-.917.551c-.336.108-.765.164-1.286.164h-1.18l-.327 1.682h-1.378l1.23-6.326h2.649c.797 0 1.378.209 1.744.628.366.417.477 1.001.331 1.751zM17.766 10.207h-.943l-.516 2.648h.838c.557 0 .971-.105 1.242-.314.272-.21.455-.559.551-1.049.092-.47.049-.802-.125-.995s-.524-.29-1.047-.29z"/>
        </svg>
    );
}

export function LogoMysql({ className = "w-9 h-9" }) {
    return (
        <svg viewBox="0 0 24 24" className={className} fill="#00758F">
            <path d="M16.405 5.501c-.115 0-.193.014-.274.033v.013h.014c.054.104.146.18.214.273.054.107.1.214.154.32l.014-.015c.094-.066.14-.172.14-.333-.04-.047-.046-.094-.08-.14-.04-.067-.126-.1-.18-.153zM5.77 18.695h-.927a50.854 50.854 0 00-.27-4.41h-.008l-1.41 4.41H2.45l-1.4-4.41h-.01a72.892 72.892 0 00-.195 4.41H0c.055-1.966.192-3.81.41-5.53h1.15l1.335 4.064h.008l1.347-4.064h1.095c.242 2.015.384 3.86.428 5.53zm4.017-4.08c-.378 2.045-.876 3.533-1.492 4.46-.482.716-1.01 1.073-1.583 1.073-.153 0-.34-.046-.566-.138v-.494c.11.017.24.026.386.026.268 0 .483-.075.647-.222.197-.18.295-.382.295-.605 0-.155-.077-.47-.23-.944L6.23 14.615h.91l.727 2.36c.164.536.233.91.205 1.123.4-1.064.678-2.227.835-3.483zm12.325 4.08h-2.63v-5.53h.885v4.85h1.745zm-3.32.135l-1.016-.5c.09-.076.177-.158.255-.25.433-.506.648-1.258.648-2.253 0-1.83-.718-2.746-2.155-2.746-.704 0-1.254.232-1.65.697-.43.508-.646 1.256-.646 2.245 0 .972.19 1.686.574 2.14.35.41.877.615 1.583.615.264 0 .506-.033.725-.098l1.325.772.36-.622zM15.5 17.588c-.225-.36-.337-.94-.337-1.736 0-1.393.424-2.09 1.27-2.09.443 0 .77.167.977.5.224.362.336.936.336 1.723 0 1.404-.424 2.108-1.27 2.108-.445 0-.77-.167-.978-.5zm-1.658-.425c0 .47-.172.856-.516 1.156-.344.3-.803.45-1.384.45-.543 0-1.064-.172-1.573-.515l.237-.476c.438.22.833.328 1.19.328.332 0 .593-.073.783-.22a.754.754 0 00.3-.615c0-.33-.23-.61-.648-.845-.388-.213-1.163-.657-1.163-.657-.422-.307-.632-.636-.632-1.177 0-.45.157-.81.47-1.085.315-.278.72-.415 1.22-.415.512 0 .98.136 1.4.41l-.213.476a2.726 2.726 0 00-1.064-.23c-.283 0-.502.068-.654.206a.685.685 0 00-.248.524c0 .328.234.61.666.85.393.215 1.187.67 1.187.67.433.305.648.63.648 1.168zm9.382-5.852c-.535-.014-.95.04-1.297.188-.1.04-.26.04-.274.167.055.053.063.14.11.214.08.134.218.313.346.407.14.11.28.216.427.31.26.16.555.255.81.416.145.094.293.213.44.313.073.05.12.14.214.172v-.02c-.046-.06-.06-.147-.105-.214-.067-.067-.134-.127-.2-.193a3.223 3.223 0 00-.695-.675c-.214-.146-.682-.35-.77-.595l-.013-.014c.146-.013.32-.066.46-.106.227-.06.435-.047.67-.106.106-.027.213-.06.32-.094v-.06c-.12-.12-.21-.283-.334-.395a8.867 8.867 0 00-1.104-.823c-.21-.134-.476-.22-.697-.334-.08-.04-.214-.06-.26-.127-.12-.146-.19-.34-.275-.514a17.69 17.69 0 01-.547-1.163c-.12-.262-.193-.523-.34-.763-.69-1.137-1.437-1.826-2.586-2.5-.247-.14-.543-.2-.856-.274-.167-.008-.334-.02-.5-.027-.11-.047-.216-.174-.31-.235-.38-.24-1.364-.76-1.644-.072-.18.434.267.862.422 1.082.115.153.26.328.34.5.047.116.06.235.107.356.106.294.207.622.347.897.073.14.153.287.247.413.054.073.146.107.167.227-.094.136-.1.334-.154.5-.24.757-.146 1.693.194 2.25.107.166.362.534.703.393.3-.12.234-.5.32-.835.02-.08.007-.133.048-.187v.015c.094.188.188.367.274.555.206.328.566.668.867.895.16.12.287.328.487.402v-.02h-.015c-.043-.058-.1-.086-.154-.133a3.445 3.445 0 01-.35-.4 8.76 8.76 0 01-.747-1.218c-.11-.21-.202-.436-.29-.643-.04-.08-.04-.2-.107-.24-.1.146-.247.273-.32.453-.127.288-.14.642-.188 1.01-.027.007-.014 0-.027.014-.214-.052-.287-.274-.367-.46-.2-.475-.233-1.238-.06-1.785.047-.14.247-.582.167-.716-.042-.127-.174-.2-.247-.303a2.478 2.478 0 01-.24-.427c-.16-.374-.24-.788-.414-1.162-.08-.173-.22-.354-.334-.513-.127-.18-.267-.307-.368-.52-.033-.073-.08-.194-.027-.274.014-.054.042-.075.094-.09.088-.072.335.022.422.062.247.1.455.194.662.334.094.066.195.193.315.226h.14c.214.047.455.014.655.073.355.114.675.28.962.46a5.953 5.953 0 012.085 2.286c.08.154.115.295.188.455.14.33.313.663.455.982.14.315.275.636.476.897.1.14.502.213.682.286.133.06.34.115.46.188.23.14.454.3.67.454.11.076.443.243.463.378z"/>
        </svg>
    );
}

export function LogoCss({ className = "w-9 h-9" }) {
    return (
        <svg viewBox="0 0 24 24" className={className}>
            <path d="M1.5 0h21l-1.9 21.2L12 24l-8.6-2.8L1.5 0z" fill="#1572B6"/>
            <path d="M12 2.2v19.6l6.8-2.2 1.6-17.4H12z" fill="#33A9DC"/>
            <path d="M12 8.7H8l-.3-3.3h8.6V2.2H4.4l.8 9.7H12v-3.2zm0 6.6l-.1.1-3.6-1-.2-2.7H5l.4 5.3 6.6 1.8V15.3zm0-3.2h4.5l-.4 4.5-4.1 1.1v3.2l6.6-1.8.8-10.2H12v3.2z" fill="#ffffff"/>
        </svg>
    );
}

export function LogoGit({ className = "w-9 h-9" }) {
    return (
        <svg viewBox="0 0 24 24" className={className} fill="#F05032">
            <path d="M13.09 23.549a1.54 1.54 0 0 1-2.18 0L.451 13.089a1.54 1.54 0 0 1 0-2.179l7.191-7.19 2.733 2.733a1.85 1.85 0 0 0 .964 2.326v6.66a1.849 1.849 0 1 0 1.54 0V8.957l2.508 2.508a1.85 1.85 0 1 0 1.09-1.09l-2.634-2.634a1.85 1.85 0 0 0-2.378-2.377L8.73 2.63 10.91.451a1.54 1.54 0 0 1 2.179 0l10.459 10.46a1.54 1.54 0 0 1 0 2.179z"/>
        </svg>
    );
}

export function LogoInertia({ className = "w-9 h-9" }) {
    return (
        <svg viewBox="0 0 24 24" className={className} fill="#9553E9">
            <path d="M13.2 2.3l-8.4 8.4a1.8 1.8 0 000 2.6l8.4 8.4a1.8 1.8 0 002.6 0l2.6-2.6a1.8 1.8 0 000-2.6L13.1 12l5.3-4.5a1.8 1.8 0 000-2.6l-2.6-2.6a1.8 1.8 0 00-2.6 0z"/>
        </svg>
    );
}

/* ── 2. EIGHT FULL-STACK ARCHITECTURE TECHNOLOGIES ──────────────────────── */

export const ARCH_STACK = [
    {
        id: 'laravel',
        name: 'Laravel 13',
        tagline: 'Backend Core & Enterprise API',
        role: 'ROBUST BACKEND',
        color: '#FF2D20',
        colorRgb: '255, 45, 32',
        latency: '8.4ms',
        badge: 'PHP 8.4 JIT Engine',
        logo: LogoLaravel,
        features: [
            'Arsitektur MVC Modular dengan RESTful API terstruktur',
            'Validasi ketat standar OWASP & proteksi CSRF instan',
            'Queue asynchronous untuk pengiriman email & background jobs'
        ],
        description: 'Pondasi logika bisnis yang kokoh, mengendalikan orkestrasi data, otentikasi multi-guard, dan pemrosesan transaksi berkecepatan tinggi.',
    },
    {
        id: 'react',
        name: 'React 19',
        tagline: 'Component UI & Instant Routing',
        role: 'CLIENT ENGINE',
        color: '#61DAFB',
        colorRgb: '97, 218, 251',
        latency: '0ms (Cache)',
        badge: 'Concurrent Hydration',
        logo: LogoReact,
        features: [
            'Navigasi instan 0ms tanpa refresh halaman (Zero Reload)',
            'Virtual DOM berkinerja tinggi dengan code-splitting otomatis',
            'Komponen UI modular, teruji, dan mudah dirawat'
        ],
        description: 'Mesin antarmuka klien yang responsif dan luwes, menghasilkan pengalaman aplikasi web secepat aplikasi desktop (SPA).',
    },
    {
        id: 'vue',
        name: 'Vue.js 3',
        tagline: 'Progressive Reactive SPA',
        role: 'REACTIVE UI',
        color: '#42B883',
        colorRgb: '66, 184, 131',
        latency: '0ms (Virtual DOM)',
        badge: 'Composition API',
        logo: LogoVue,
        features: [
            'Sistem reaktivitas mendalam berbasis JavaScript Proxy',
            'Sintaks template bersih dengan single-file components (SFC)',
            'Transisi animasi bawaan yang sangat halus dan fleksibel'
        ],
        description: 'Framework progresif alternatif yang ringan dan sangat reaktif, ideal untuk portal interaktif dan dashboard manajemen modern.',
    },
    {
        id: 'php',
        name: 'PHP 8.4',
        tagline: 'High-Throughput Runtime',
        role: 'JIT COMPILER',
        color: '#777BB4',
        colorRgb: '119, 123, 180',
        latency: '1.2ms (Compiled)',
        badge: 'OPcache + JIT',
        logo: LogoPhp,
        features: [
            'Kompilasi Just-In-Time (JIT) untuk komputasi cepat',
            'Type-safety ketat, readonly properties, dan fiber concurrency',
            'Ekosistem matang dengan manajemen dependensi Composer'
        ],
        description: 'Runtime server generasi terbaru dengan eksekusi kode terkompilasi, menghantarkan ribuan request per detik dengan konsumsi RAM rendah.',
    },
    {
        id: 'mysql',
        name: 'MySQL 8',
        tagline: 'Enterprise Relational Storage',
        role: 'PRIMARY DATABASE',
        color: '#00758F',
        colorRgb: '0, 117, 143',
        latency: '0.8ms (Indexed)',
        badge: 'ACID Transactions',
        logo: LogoMysql,
        features: [
            'Penyimpanan relasional InnoDB dengan integritas data ACID penuh',
            'Indexing multi-kolom dan partisi tabel untuk jutaan baris data',
            'Dukungan native JSON column indexing dan full-text search cepat'
        ],
        description: 'Sistem basis data teruji untuk mencatat seluruh transaksi, inventori, dan data pengguna secara aman tanpa risiko korupsi data.',
    },
    {
        id: 'css',
        name: 'Modern CSS',
        tagline: 'Styling & Micro-Animations',
        role: 'DESIGN SYSTEM',
        color: '#1572B6',
        colorRgb: '21, 114, 182',
        latency: '0ms (GPU Accelerated)',
        badge: 'CSS3 + Tailwind Engine',
        logo: LogoCss,
        features: [
            'Layout adaptif berbasis modern CSS Grid & Flexbox',
            'Dukungan native Dark/Light mode dengan CSS Variables',
            'Akselerasi hardware 60 FPS untuk transisi dan efek glassmorphism'
        ],
        description: 'Lapisan estetika visual modern yang memastikan tampilan website presisi di semua resolusi layar mulai dari smartphone hingga monitor ultrawide.',
    },
    {
        id: 'git',
        name: 'Git & CI/CD',
        tagline: 'Version Control & Pipelines',
        role: 'DEVOPS PIPELINE',
        color: '#F05032',
        colorRgb: '240, 80, 50',
        latency: 'Automated Deploy',
        badge: 'Branch Protection',
        logo: LogoGit,
        features: [
            'Pelacakan riwayat perubahan kode dengan branching terstandar',
            'Pemeriksaan linting, unit test, dan security scan otomatis',
            'Zero-downtime deployment langsung ke server produksi'
        ],
        description: 'Sistem kontrol versi dan pipeline otomatisasi yang menjamin stabilitas kode sebelum dirilis ke lingkungan pengguna akhir.',
    },
    {
        id: 'inertia',
        name: 'Inertia.js v3',
        tagline: 'Full-Stack Monolith Bridge',
        role: 'PROTOCOL BRIDGE',
        color: '#9553E9',
        colorRgb: '149, 83, 233',
        latency: '60 FPS Transitions',
        badge: 'No REST API Overhead',
        logo: LogoInertia,
        features: [
            'Membangun SPA modern tanpa kompleksitas GraphQL atau REST terpisah',
            'Props passing langsung dari controller Laravel ke komponen React/Vue',
            'Prefetching cerdas saat mouse mendekati link navigasi'
        ],
        description: 'Jembatan protokol yang menggabungkan kemudahan backend monolith Laravel dengan antarmuka reaktif single-page application.',
    },
];

/* ── 3. MAIN COMPONENT: 3D ARCHING CAROUSEL (Pinterest Reference) ───────── */

export default function ArchingArchitectureCards({ activeTechId, onSelectTech }) {
    const total = ARCH_STACK.length;
    const [activeIndex, setActiveIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const touchStartXRef = useRef(null);

    // Sync external activeTechId if passed
    useEffect(() => {
        if (activeTechId) {
            const idx = ARCH_STACK.findIndex(t => t.id === activeTechId);
            if (idx !== -1 && idx !== activeIndex) {
                setActiveIndex(idx);
            }
        }
    }, [activeTechId]);

    const activeTech = ARCH_STACK[activeIndex];

    const goToNext = useCallback(() => {
        setActiveIndex((prev) => {
            const next = (prev + 1) % total;
            onSelectTech?.(ARCH_STACK[next].id);
            return next;
        });
    }, [total, onSelectTech]);

    const goToPrev = useCallback(() => {
        setActiveIndex((prev) => {
            const next = (prev - 1 + total) % total;
            onSelectTech?.(ARCH_STACK[next].id);
            return next;
        });
    }, [total, onSelectTech]);

    const handleSelectIndex = (idx) => {
        setActiveIndex(idx);
        onSelectTech?.(ARCH_STACK[idx].id);
    };

    // Auto-play timer (smooth continuous cycling ~3.5s)
    useEffect(() => {
        if (isPaused || isHovered) return;
        const interval = setInterval(goToNext, 3500);
        return () => clearInterval(interval);
    }, [isPaused, isHovered, goToNext]);

    // Touch swipe gestures
    const handleTouchStart = (e) => {
        touchStartXRef.current = e.touches[0].clientX;
    };

    const handleTouchEnd = (e) => {
        if (touchStartXRef.current === null) return;
        const deltaX = e.changedTouches[0].clientX - touchStartXRef.current;
        touchStartXRef.current = null;
        if (Math.abs(deltaX) > 40) {
            if (deltaX < 0) goToNext();
            else goToPrev();
        }
    };

    return (
        <div 
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="w-full select-none"
        >
            {/* Top Technology Selector Chips */}
            <div className="flex items-center justify-between gap-3 mb-6 pb-3 border-b border-slate-200/60 dark:border-white/5">
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                    {ARCH_STACK.map((tech, idx) => {
                        const isCur = idx === activeIndex;
                        const MiniLogo = tech.logo;
                        return (
                            <button
                                key={tech.id}
                                type="button"
                                onClick={() => handleSelectIndex(idx)}
                                style={{
                                    backgroundColor: isCur ? `${tech.color}15` : 'transparent',
                                    borderColor: isCur ? tech.color : 'transparent',
                                }}
                                className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-bold transition-all border ${
                                    isCur 
                                        ? 'shadow-xs scale-105' 
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100/60 dark:bg-white/[0.03]'
                                }`}
                            >
                                <MiniLogo className="w-4 h-4 shrink-0" />
                                <span style={{ color: isCur ? tech.color : 'inherit' }}>{tech.name}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Autoplay & Arrow Controls */}
                <div className="flex items-center gap-1.5 shrink-0 pl-2">
                    <button
                        type="button"
                        onClick={() => setIsPaused(p => !p)}
                        className="w-7 h-7 rounded-full flex items-center justify-center bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition-colors"
                        title={isPaused ? "Putar Otomatis" : "Jeda"}
                    >
                        {isPaused ? <Play className="w-3 h-3 text-emerald-500" /> : <Pause className="w-3 h-3 text-amber-500" />}
                    </button>
                    <button
                        type="button"
                        onClick={goToPrev}
                        className="w-7 h-7 rounded-full flex items-center justify-center bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition-colors"
                        title="Sebelumnya"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={goToNext}
                        className="w-7 h-7 rounded-full flex items-center justify-center bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition-colors"
                        title="Selanjutnya"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* 3D ARCHING / CYLINDER CAROUSEL STAGE (Pinterest Reference: pin.it/3WqP8jryH) */}
            <div className="relative w-full h-[320px] sm:h-[340px] md:h-[360px] flex items-center justify-center overflow-hidden py-4 perspective-[1000px]">
                {/* Ambient Center Aura */}
                <div 
                    style={{ backgroundColor: `${activeTech.color}25` }}
                    className="absolute w-72 h-72 rounded-full blur-3xl pointer-events-none transition-colors duration-500"
                />

                {/* Arching Cards Container */}
                <div className="relative w-full max-w-4xl h-full flex items-center justify-center">
                    {ARCH_STACK.map((tech, idx) => {
                        // Shortest circular offset
                        let diff = idx - activeIndex;
                        if (diff > total / 2) diff -= total;
                        if (diff < -total / 2) diff += total;

                        const isCenter = diff === 0;
                        const isVisible = Math.abs(diff) <= 3;

                        // 3D Parabolic Arch Math (Smile / Downward Arch Curve)
                        // x = horizontal spacing along track
                        // y = parabolic drop on the sides (Apex in center!)
                        // rotateZ = angle tilting outwards
                        // rotateY = 3D perspective inward tilt
                        const spacing = 180;
                        const x = diff * spacing;
                        const y = Math.pow(diff, 2) * 14; 
                        const rotateZ = diff * 5.5;
                        const rotateY = -diff * 7;
                        const scale = isCenter ? 1.05 : Math.max(0.72, 1 - Math.abs(diff) * 0.09);
                        const opacity = isCenter ? 1 : Math.max(0, 0.9 - Math.abs(diff) * 0.28);
                        const zIndex = 30 - Math.abs(diff) * 5;

                        const LogoComponent = tech.logo;

                        if (!isVisible) return null;

                        return (
                            <motion.div
                                key={tech.id}
                                initial={false}
                                animate={{
                                    x,
                                    y,
                                    rotateZ,
                                    rotateY,
                                    scale,
                                    opacity,
                                    zIndex,
                                }}
                                transition={{
                                    type: 'spring',
                                    stiffness: 280,
                                    damping: 24,
                                    mass: 0.8,
                                }}
                                onClick={() => handleSelectIndex(idx)}
                                style={{
                                    boxShadow: isCenter
                                        ? `0 20px 45px -10px ${tech.color}45, 0 10px 20px -5px rgba(0,0,0,0.2)`
                                        : '0 8px 20px -5px rgba(0,0,0,0.1)',
                                    borderColor: isCenter ? tech.color : undefined,
                                }}
                                className={`absolute w-[185px] sm:w-[210px] md:w-[225px] h-[250px] sm:h-[265px] md:h-[280px] rounded-3xl p-5 flex flex-col justify-between cursor-pointer border transition-all duration-300 select-none ${
                                    isCenter
                                        ? 'bg-white/95 dark:bg-[#0c1220]/95 backdrop-blur-2xl ring-2 ring-white/60 dark:ring-white/20'
                                        : 'bg-white/70 dark:bg-[#090d18]/70 backdrop-blur-md border-slate-200/80 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                                }`}
                            >
                                {/* Card Top: Real Logo & Latency Tag */}
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <div 
                                            style={{ backgroundColor: `${tech.color}15` }}
                                            className="w-12 h-12 rounded-2xl flex items-center justify-center p-2 border border-black/5 dark:border-white/10 shadow-xs transition-transform group-hover:scale-110"
                                        >
                                            <LogoComponent className="w-7 h-7" />
                                        </div>

                                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10">
                                            {tech.latency}
                                        </span>
                                    </div>

                                    {/* Tech Title */}
                                    <h4 className="font-heading font-black text-base sm:text-lg text-slate-900 dark:text-white leading-tight">
                                        {tech.name}
                                    </h4>

                                    <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                                        {tech.tagline}
                                    </p>
                                </div>

                                {/* Card Bottom: Role Tag & Arrow */}
                                <div className="pt-3 border-t border-slate-200/60 dark:border-white/10 flex items-center justify-between text-[10px] font-mono">
                                    <span 
                                        style={{ color: isCenter ? tech.color : undefined }}
                                        className="font-bold uppercase tracking-wider truncate max-w-[130px]"
                                    >
                                        {tech.role}
                                    </span>
                                    <span 
                                        style={{ color: isCenter ? tech.color : undefined }}
                                        className="font-bold text-xs"
                                    >
                                        {isCenter ? '●' : '→'}
                                    </span>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* DETAILED ACTIVE INSPECTOR PANEL */}
            <div className="mt-4 p-5 rounded-2xl bg-slate-50/90 dark:bg-slate-900/80 border border-slate-200/90 dark:border-white/10 backdrop-blur-xl shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-5 transition-all">
                <div className="flex items-start gap-4">
                    <div 
                        style={{ backgroundColor: `${activeTech.color}20` }}
                        className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 p-2.5 border border-black/5 dark:border-white/10 shadow-sm"
                    >
                        {React.createElement(activeTech.logo, { className: "w-8 h-8" })}
                    </div>

                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <h5 className="font-heading font-black text-base sm:text-lg text-slate-900 dark:text-white">
                                {activeTech.name} Inspector
                            </h5>
                            <span 
                                style={{ backgroundColor: `${activeTech.color}15`, color: activeTech.color }}
                                className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-black/5 dark:border-white/10"
                            >
                                {activeTech.badge}
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-200/70 dark:bg-white/10 text-slate-700 dark:text-slate-300">
                                Latensi: {activeTech.latency}
                            </span>
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-2xl leading-relaxed">
                            {activeTech.description}
                        </p>

                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                            {activeTech.features.map((feat, i) => (
                                <span key={i} className="flex items-center gap-1">
                                    <span style={{ color: activeTech.color }}>✓</span>
                                    <span>{feat}</span>
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="shrink-0 w-full md:w-auto flex justify-end">
                    <a
                        href="#interactive-arena"
                        style={{ backgroundColor: activeTech.color }}
                        className="w-full md:w-auto px-5 py-2.5 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 transition-transform hover:scale-105 active:scale-95 shadow-md"
                    >
                        <span>Konsultasi Stack Ini</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                </div>
            </div>
        </div>
    );
}
