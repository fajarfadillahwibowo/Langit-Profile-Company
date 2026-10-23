import React, { useState, useEffect, useRef } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import ThemeToggle from '@/Components/ThemeToggle';
import { 
    User, Camera, Upload, Trash2, Mail, Phone, Lock, Eye, EyeOff,
    Shield, Check, X, ArrowLeft, RefreshCw, Sparkles, AlertCircle,
    CheckCircle2, Video, VideoOff, SwitchCamera, ExternalLink, LogOut,
    LayoutDashboard, FileText, Key, CheckCheck, Loader2
} from 'lucide-react';

export default function Profile({ admin }) {
    const { flash = {}, errors = {} } = usePage().props;

    // Theme state
    const [theme, setTheme] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('langit_theme') || 'dark';
        }
        return 'dark';
    });

    useEffect(() => {
        const root = document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('langit_theme', theme);
    }, [theme]);

    // Admin Info Form State
    const [infoData, setInfoData] = useState({
        name: admin?.name || '',
        email: admin?.email || '',
        phone: admin?.phone || '',
        bio: admin?.bio || '',
    });
    const [isSavingInfo, setIsSavingInfo] = useState(false);

    // Password Form State
    const [passwordData, setPasswordData] = useState({
        current_password: '',
        password: '',
        password_confirmation: '',
    });
    const [showCurrentPass, setShowCurrentPass] = useState(false);
    const [showNewPass, setShowNewPass] = useState(false);
    const [showConfirmPass, setShowConfirmPass] = useState(false);
    const [isSavingPassword, setIsSavingPassword] = useState(false);

    // Modal State: null | 'camera' | 'upload'
    const [activeModal, setActiveModal] = useState(null);

    // Live Camera State
    const [cameraStream, setCameraStream] = useState(null);
    const [availableCameras, setAvailableCameras] = useState([]);
    const [selectedCameraId, setSelectedCameraId] = useState('');
    const [capturedPhotoUrl, setCapturedPhotoUrl] = useState(null);
    const [cameraError, setCameraError] = useState(null);
    const [isSavingCameraPhoto, setIsSavingCameraPhoto] = useState(false);

    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    // File Upload State
    const [uploadFile, setUploadFile] = useState(null);
    const [uploadPreview, setUploadPreview] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isSavingUpload, setIsSavingUpload] = useState(false);
    const fileInputRef = useRef(null);

    // Helper: Admin Initials for Default Avatar
    const getInitials = (name) => {
        if (!name) return 'AD';
        const parts = name.trim().split(/\s+/);
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    // Camera Lifecycle & Streaming
    const startCamera = async (deviceId = '') => {
        setCameraError(null);
        setCapturedPhotoUrl(null);

        // Stop any existing stream
        if (cameraStream) {
            cameraStream.getTracks().forEach(t => t.stop());
            setCameraStream(null);
        }

        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('Browser Anda tidak mendukung akses perangkat kamera (WebRTC).');
            }

            const constraints = {
                video: deviceId 
                    ? { deviceId: { exact: deviceId }, width: { ideal: 1280 }, height: { ideal: 720 } }
                    : { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
                audio: false
            };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            setCameraStream(stream);

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
            }

            // Enumerate devices if not already done
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter(d => d.kind === 'videoinput');
            setAvailableCameras(videoDevices);
            if (!selectedCameraId && videoDevices.length > 0) {
                setSelectedCameraId(videoDevices[0].deviceId);
            }
        } catch (err) {
            console.error('Camera Access Error:', err);
            let msg = 'Gagal mengakses kamera. Pastikan Anda mengizinkan izin kamera di peramban browser.';
            if (err.name === 'NotAllowedError') {
                msg = 'Izin kamera ditolak. Harap izinkan akses kamera di pengaturan browser.';
            } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
                msg = 'Perangkat kamera tidak ditemukan pada komputer / laptop ini.';
            }
            setCameraError(msg);
        }
    };

    const stopCamera = () => {
        if (cameraStream) {
            cameraStream.getTracks().forEach(t => t.stop());
            setCameraStream(null);
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
    };

    // Capture Frame to Canvas
    const handleSnapPhoto = () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const width = video.videoWidth || 640;
        const height = video.videoHeight || 480;

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        // Mirror horizontally if user facing camera for natural mirror feel
        ctx.translate(width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/png', 0.95);
        setCapturedPhotoUrl(dataUrl);
        stopCamera();
    };

    const handleRetakePhoto = () => {
        setCapturedPhotoUrl(null);
        startCamera(selectedCameraId);
    };

    const handleSaveCameraPhoto = () => {
        if (!capturedPhotoUrl) return;

        setIsSavingCameraPhoto(true);
        router.post('/admin/profile/avatar', {
            avatar_camera_base64: capturedPhotoUrl,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setActiveModal(null);
                setCapturedPhotoUrl(null);
                stopCamera();
            },
            onFinish: () => {
                setIsSavingCameraPhoto(false);
            }
        });
    };

    // Handle File Drop & Selection
    const handleFileSelect = (file) => {
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            alert('Silakan pilih berkas format gambar (JPG, PNG, atau WebP).');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            alert('Ukuran gambar maksimal 5 MB.');
            return;
        }

        setUploadFile(file);
        const reader = new FileReader();
        reader.onload = (e) => {
            setUploadPreview(e.target.result);
        };
        reader.readAsDataURL(file);
    };

    const handleSaveUploadPhoto = () => {
        if (!uploadFile) return;

        setIsSavingUpload(true);
        const formData = new FormData();
        formData.append('avatar_file', uploadFile);

        router.post('/admin/profile/avatar', formData, {
            preserveScroll: true,
            onSuccess: () => {
                setActiveModal(null);
                setUploadFile(null);
                setUploadPreview(null);
            },
            onFinish: () => {
                setIsSavingUpload(false);
            }
        });
    };

    // Delete Avatar Handler
    const handleDeleteAvatar = () => {
        if (confirm('Yakin ingin menghapus foto profil ini? Foto akan digantikan dengan avatar inisial default.')) {
            router.delete('/admin/profile/avatar', {
                preserveScroll: true,
                onSuccess: () => {
                    setActiveModal(null);
                }
            });
        }
    };

    // Save Profile Info
    const handleSaveInfo = (e) => {
        e.preventDefault();
        setIsSavingInfo(true);
        router.put('/admin/profile', {
            name: infoData.name,
            email: infoData.email,
            phone: infoData.phone,
            bio: infoData.bio,
        }, {
            preserveScroll: true,
            onFinish: () => setIsSavingInfo(false),
        });
    };

    // Save Password
    const handleSavePassword = (e) => {
        e.preventDefault();
        setIsSavingPassword(true);
        router.put('/admin/profile', {
            name: infoData.name,
            email: infoData.email,
            phone: infoData.phone,
            bio: infoData.bio,
            current_password: passwordData.current_password,
            password: passwordData.password,
            password_confirmation: passwordData.password_confirmation,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setPasswordData({
                    current_password: '',
                    password: '',
                    password_confirmation: '',
                });
            },
            onFinish: () => setIsSavingPassword(false),
        });
    };

    // Clean up camera stream on modal close or unmount
    useEffect(() => {
        if (activeModal === 'camera') {
            startCamera(selectedCameraId);
        } else {
            stopCamera();
        }
        return () => {
            stopCamera();
        };
    }, [activeModal]);

    return (
        <div className="min-h-screen bg-[#EDF9FC] text-slate-800 dark:bg-[#07090E] dark:text-slate-100 flex font-sans transition-colors duration-200">
            <Head title="Profil Administrator — Langit Back-Office" />

            {/* Hidden canvas for taking snapshot */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Sidebar Navigation matching Dashboard */}
            <aside className="w-64 border-r border-[#004270]/70 bg-[#005792] flex flex-col justify-between p-4 shrink-0 hidden md:flex transition-colors duration-200 shadow-2xl shadow-[#005792]/25">
                <div className="space-y-6">
                    {/* Header Logo */}
                    <Link href="/" className="block px-2 group">
                        <div className="flex items-center gap-1.5">
                            <span 
                                className="font-etna font-bold text-3xl tracking-tight text-white flex items-center gap-1.5 leading-none transition-all duration-300 group-hover:text-cyan-200"
                                style={{ fontFamily: "'Etna Sans Serif', 'Etna', sans-serif" }}
                            >
                                langit
                                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-hud-pulse shadow-[0_0_10px_rgba(34,211,238,0.9)] shrink-0"></span>
                            </span>
                        </div>
                        <span className="text-[11px] font-semibold text-sky-200 block mt-1.5 tracking-wider uppercase">
                            Back-Office CMS
                        </span>
                    </Link>

                    {/* Nav Items */}
                    <nav className="space-y-1.5 text-xs font-medium">
                        <Link
                            href="/admin/dashboard"
                            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-white/90 hover:text-white hover:bg-white/10"
                        >
                            <LayoutDashboard className="w-4 h-4 text-sky-200" />
                            <span>Executive Dashboard</span>
                        </Link>
                    </nav>
                </div>

                {/* Footer Actions */}
                <div className="pt-4 border-t border-white/20 space-y-2">
                    <Link
                        href="/"
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-white/90 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        <ExternalLink className="w-4 h-4 text-sky-200" />
                        <span>Lihat Website Publik</span>
                    </Link>

                    <Link
                        href="/admin/logout"
                        method="post"
                        as="button"
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-200 hover:text-white hover:bg-rose-500/25 transition-colors"
                    >
                        <LogOut className="w-4 h-4 text-rose-300" />
                        <span>Keluar / Logout</span>
                    </Link>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 min-w-0 p-6 md:p-8 overflow-y-auto bg-[#EDF9FC] dark:bg-[#07090E]">
                {/* Topbar Info */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 mb-6 border-b border-[#005792]/15 dark:border-white/10">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/admin/dashboard"
                            className="p-2 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300 transition-colors"
                            title="Kembali ke Dashboard"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#005792]/10 dark:bg-sky-500/20 text-[#005792] dark:text-sky-300 font-bold uppercase">
                                    Admin Security & Identity
                                </span>
                            </div>
                            <h1 className="font-heading font-extrabold text-2xl text-slate-900 dark:text-white mt-0.5">
                                Profil Administrator
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <ThemeToggle theme={theme} setTheme={setTheme} />
                        <Link
                            href="/admin/dashboard"
                            className="px-4 py-2 rounded-xl bg-[#005792] hover:bg-[#004270] text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-[#005792]/20 transition-all hover:scale-105 active:scale-95"
                        >
                            <LayoutDashboard className="w-3.5 h-3.5" />
                            <span>Kembali ke Dashboard</span>
                        </Link>
                    </div>
                </div>

                {/* Flash Messages */}
                {flash.success && (
                    <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 flex items-center justify-between shadow-sm animate-fadeIn">
                        <div className="flex items-center gap-2.5 text-xs font-semibold">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            <span>{flash.success}</span>
                        </div>
                    </div>
                )}
                {flash.error && (
                    <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-800 dark:text-rose-300 flex items-center justify-between shadow-sm animate-fadeIn">
                        <div className="flex items-center gap-2.5 text-xs font-semibold">
                            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                            <span>{flash.error}</span>
                        </div>
                    </div>
                )}

                {/* Profile Grid: Left (Avatar & Quick Controls), Right (Data Forms) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* LEFT COLUMN: Foto Profil & Kamera Card */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="p-6 rounded-3xl bg-white dark:bg-[#0E131F] border border-slate-200 dark:border-white/10 shadow-sm relative overflow-hidden text-center">
                            {/* Decorative background glow */}
                            <div className="absolute -top-16 -left-16 w-44 h-44 rounded-full bg-[#005792]/15 blur-3xl pointer-events-none" />
                            <div className="absolute -bottom-16 -right-16 w-44 h-44 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

                            {/* Avatar Display Frame */}
                            <div className="relative mx-auto w-36 h-36 sm:w-40 sm:h-40 rounded-full p-1.5 bg-gradient-to-tr from-[#005792] via-cyan-500 to-sky-400 shadow-xl group">
                                <div className="w-full h-full rounded-full overflow-hidden bg-slate-900 relative flex items-center justify-center">
                                    {admin?.avatar ? (
                                        <img
                                            src={admin.avatar}
                                            alt={admin.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#005792] to-[#002a47] text-white font-extrabold text-3xl font-heading tracking-wider">
                                            {getInitials(admin?.name)}
                                        </div>
                                    )}

                                    {/* Hover overlay hint */}
                                    <div className="absolute inset-0 bg-black/50 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs gap-1 cursor-pointer"
                                         onClick={() => setActiveModal('upload')}>
                                        <Camera className="w-6 h-6 text-cyan-300" />
                                        <span className="font-semibold text-[11px]">Ganti Foto</span>
                                    </div>
                                </div>

                                {/* Active Live Status Dot */}
                                <div className="absolute bottom-2 right-2 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white dark:border-[#0E131F] shadow-md flex items-center justify-center"
                                     title="Akun Administrator Aktif">
                                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                                </div>
                            </div>

                            {/* User Header Info */}
                            <div className="mt-4">
                                <h3 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white">
                                    {admin?.name || 'Administrator'}
                                </h3>
                                <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                                    {admin?.email}
                                </p>
                                <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#005792]/10 dark:bg-[#005792]/25 border border-[#005792]/30 text-[#005792] dark:text-sky-300 text-[11px] font-bold uppercase tracking-wider font-mono">
                                    <Shield className="w-3.5 h-3.5" />
                                    <span>{admin?.role || 'Superadministrator'}</span>
                                </div>
                            </div>

                            {/* Action Buttons: Kamera, Upload, Hapus */}
                            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-white/10 space-y-2.5">
                                <button
                                    onClick={() => setActiveModal('camera')}
                                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#005792] to-cyan-600 hover:from-[#004270] hover:to-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-[#005792]/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    <Camera className="w-4 h-4" />
                                    <span>Ambil Foto Kamera Langsung</span>
                                </button>

                                <button
                                    onClick={() => setActiveModal('upload')}
                                    className="w-full py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-800 dark:text-white font-semibold text-xs border border-slate-200 dark:border-white/10 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    <Upload className="w-4 h-4 text-sky-500" />
                                    <span>Unggah Berkas Foto File</span>
                                </button>

                                {admin?.avatar && (
                                    <button
                                        onClick={handleDeleteAvatar}
                                        className="w-full py-2.5 px-4 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        <span>Hapus Foto Profil</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Quick Tips Box */}
                        <div className="p-5 rounded-2xl bg-sky-50 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-800/30 text-xs text-sky-900 dark:text-sky-200 space-y-2">
                            <div className="flex items-center gap-2 font-bold font-mono">
                                <Sparkles className="w-4 h-4 text-[#005792] dark:text-sky-400" />
                                <span>Panduan Foto Profil</span>
                            </div>
                            <p className="text-[11px] leading-relaxed text-sky-800 dark:text-sky-300">
                                Foto profil digunakan pada sidebar dashboard, topbar, dan tanda tangan digital saat merespons tiket layanan pelanggan. Format yang didukung: JPG, PNG, dan WebP hingga ukuran 5MB.
                            </p>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Edit Info & Password Forms */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* FORM 1: Informasi Administrator */}
                        <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-[#0E131F] border border-slate-200 dark:border-white/10 shadow-sm">
                            <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100 dark:border-white/10">
                                <div>
                                    <h3 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                                        <User className="w-5 h-5 text-[#005792] dark:text-sky-400" />
                                        <span>Data Pribadi Administrator</span>
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                        Perbarui nama lengkap, email, nomor kontak dan bio akun Anda.
                                    </p>
                                </div>
                            </div>

                            <form onSubmit={handleSaveInfo} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                            Nama Lengkap *
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                required
                                                value={infoData.name}
                                                onChange={(e) => setInfoData({ ...infoData, name: e.target.value })}
                                                placeholder="Nama lengkap Anda..."
                                                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:border-[#005792] focus:ring-1 focus:ring-[#005792]"
                                            />
                                            <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                                        </div>
                                        {errors.name && <p className="text-rose-500 text-[11px] mt-1">{errors.name}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                            Alamat Email Login *
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="email"
                                                required
                                                value={infoData.email}
                                                onChange={(e) => setInfoData({ ...infoData, email: e.target.value })}
                                                placeholder="admin@langit.id"
                                                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:border-[#005792] focus:ring-1 focus:ring-[#005792]"
                                            />
                                            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                                        </div>
                                        {errors.email && <p className="text-rose-500 text-[11px] mt-1">{errors.email}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                            Nomor WhatsApp / Telepon
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={infoData.phone}
                                                onChange={(e) => setInfoData({ ...infoData, phone: e.target.value })}
                                                placeholder="0812xxxxxxxx"
                                                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:border-[#005792] focus:ring-1 focus:ring-[#005792]"
                                            />
                                            <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                            Peran Akun
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                disabled
                                                value={admin?.role ? admin.role.toUpperCase() : 'SUPERADMIN'}
                                                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-400 text-xs font-mono cursor-not-allowed"
                                            />
                                            <Shield className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                        Bio Singkat / Catatan Administrator
                                    </label>
                                    <div className="relative">
                                        <textarea
                                            rows={3}
                                            value={infoData.bio}
                                            onChange={(e) => setInfoData({ ...infoData, bio: e.target.value })}
                                            placeholder="Tuliskan catatan singkat mengenai jabatan atau tanggung jawab divisi..."
                                            className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:border-[#005792] focus:ring-1 focus:ring-[#005792]"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end pt-2">
                                    <button
                                        type="submit"
                                        disabled={isSavingInfo}
                                        className="px-6 py-2.5 rounded-xl bg-[#005792] hover:bg-[#004270] text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-[#005792]/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-60"
                                    >
                                        {isSavingInfo ? (
                                            <>
                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                <span>Menyimpan...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Check className="w-3.5 h-3.5" />
                                                <span>Simpan Perubahan Profil</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* FORM 2: Keamanan Akun & Ubah Password */}
                        <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-[#0E131F] border border-slate-200 dark:border-white/10 shadow-sm">
                            <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100 dark:border-white/10">
                                <div>
                                    <h3 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                                        <Key className="w-5 h-5 text-amber-500" />
                                        <span>Keamanan & Kata Sandi (Password)</span>
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                        Perbarui kata sandi secara berkala untuk menjaga keamanan akses sistem CMS.
                                    </p>
                                </div>
                            </div>

                            <form onSubmit={handleSavePassword} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                        Password Saat Ini
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showCurrentPass ? 'text' : 'password'}
                                            value={passwordData.current_password}
                                            onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                                            placeholder="Masukkan password saat ini..."
                                            className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:border-[#005792] focus:ring-1 focus:ring-[#005792]"
                                        />
                                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                                        <button
                                            type="button"
                                            onClick={() => setShowCurrentPass(!showCurrentPass)}
                                            className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                                        >
                                            {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    {errors.current_password && <p className="text-rose-500 text-[11px] mt-1">{errors.current_password}</p>}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                            Password Baru (Minimal 6 karakter)
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showNewPass ? 'text' : 'password'}
                                                value={passwordData.password}
                                                onChange={(e) => setPasswordData({ ...passwordData, password: e.target.value })}
                                                placeholder="Password baru..."
                                                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:border-[#005792] focus:ring-1 focus:ring-[#005792]"
                                            />
                                            <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                                            <button
                                                type="button"
                                                onClick={() => setShowNewPass(!showNewPass)}
                                                className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                                            >
                                                {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                        {errors.password && <p className="text-rose-500 text-[11px] mt-1">{errors.password}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                            Konfirmasi Password Baru
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showConfirmPass ? 'text' : 'password'}
                                                value={passwordData.password_confirmation}
                                                onChange={(e) => setPasswordData({ ...passwordData, password_confirmation: e.target.value })}
                                                placeholder="Ulangi password baru..."
                                                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:border-[#005792] focus:ring-1 focus:ring-[#005792]"
                                            />
                                            <CheckCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPass(!showConfirmPass)}
                                                className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                                            >
                                                {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-2">
                                    <button
                                        type="submit"
                                        disabled={isSavingPassword || !passwordData.password}
                                        className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-md shadow-amber-500/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-40"
                                    >
                                        {isSavingPassword ? (
                                            <>
                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                <span>Mengubah Password...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Key className="w-3.5 h-3.5" />
                                                <span>Perbarui Password Akun</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </main>

            {/* ======================================================== */}
            {/* MODAL 1: AMBIL FOTO KAMERA LANGSUNG (LIVE WEBCAM)        */}
            {/* ======================================================== */}
            {activeModal === 'camera' && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
                    <div className="w-full max-w-xl rounded-3xl bg-white dark:bg-[#0E131F] border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden flex flex-col">
                        {/* Modal Header */}
                        <div className="p-4 px-6 border-b border-slate-100 dark:border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-[#005792]/15 text-[#005792] dark:text-sky-400 flex items-center justify-center">
                                    <Camera className="w-4 h-4" />
                                </div>
                                <div>
                                    <h4 className="font-heading font-extrabold text-sm text-slate-900 dark:text-white">
                                        Ambil Foto Kamera Langsung
                                    </h4>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                        Posisikan wajah Anda pada lingkaran panduan dan klik tombol ambil foto
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setActiveModal(null)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body / Camera Viewport */}
                        <div className="p-6 space-y-4">
                            {cameraError ? (
                                <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-800 dark:text-rose-300 text-center space-y-3">
                                    <VideoOff className="w-8 h-8 text-rose-500 mx-auto" />
                                    <p className="text-xs font-semibold">{cameraError}</p>
                                    <button
                                        onClick={() => startCamera(selectedCameraId)}
                                        className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-sm"
                                    >
                                        <RefreshCw className="w-3.5 h-3.5" />
                                        <span>Coba Hubungkan Ulang</span>
                                    </button>
                                </div>
                            ) : (
                                <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-black flex items-center justify-center border border-slate-800 shadow-inner group">
                                    {capturedPhotoUrl ? (
                                        // Captured Image Preview
                                        <img
                                            src={capturedPhotoUrl}
                                            alt="Captured Preview"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        // Live Camera Feed
                                        <>
                                            <video
                                                ref={videoRef}
                                                autoPlay
                                                playsInline
                                                muted
                                                className="w-full h-full object-cover -scale-x-100"
                                            />
                                            {/* Circular Portrait Guide Overlay */}
                                            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                                <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-full border-2 border-dashed border-cyan-400/70 shadow-[0_0_20px_rgba(34,211,238,0.3)] animate-pulse" />
                                            </div>
                                            {/* Live Recording Badge */}
                                            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white font-mono text-[10px] flex items-center gap-1.5">
                                                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                                                <span>LIVE WEBCAM</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}

                            {/* Camera Selector Switcher */}
                            {availableCameras.length > 1 && !capturedPhotoUrl && (
                                <div className="flex items-center justify-between text-xs font-mono">
                                    <span className="text-slate-500 flex items-center gap-1">
                                        <SwitchCamera className="w-3.5 h-3.5" />
                                        Pilih Kamera:
                                    </span>
                                    <select
                                        value={selectedCameraId}
                                        onChange={(e) => {
                                            setSelectedCameraId(e.target.value);
                                            startCamera(e.target.value);
                                        }}
                                        className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-xs font-sans text-slate-800 dark:text-white"
                                    >
                                        {availableCameras.map((dev, idx) => (
                                            <option key={dev.deviceId || idx} value={dev.deviceId}>
                                                {dev.label || `Kamera ${idx + 1}`}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer Controls */}
                        <div className="p-4 px-6 border-t border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] flex items-center justify-between">
                            <button
                                type="button"
                                onClick={() => setActiveModal(null)}
                                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
                            >
                                Batal
                            </button>

                            {capturedPhotoUrl ? (
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={handleRetakePhoto}
                                        className="px-4 py-2 rounded-xl border border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                                    >
                                        <RefreshCw className="w-3.5 h-3.5" />
                                        <span>Ulangi Jepretan</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleSaveCameraPhoto}
                                        disabled={isSavingCameraPhoto}
                                        className="px-5 py-2 rounded-xl bg-[#005792] hover:bg-[#004270] text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-[#005792]/25 transition-all hover:scale-105 active:scale-95 disabled:opacity-60"
                                    >
                                        {isSavingCameraPhoto ? (
                                            <>
                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                <span>Menyimpan...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Check className="w-3.5 h-3.5" />
                                                <span>Gunakan & Pasang Foto</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleSnapPhoto}
                                    disabled={!cameraStream || !!cameraError}
                                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#005792] to-cyan-600 hover:from-[#004270] hover:to-cyan-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-[#005792]/25 transition-transform hover:scale-105 active:scale-95 disabled:opacity-40"
                                >
                                    <Camera className="w-4 h-4" />
                                    <span>Jepret Foto Sekarang</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ======================================================== */}
            {/* MODAL 2: UNGGAH BERKAS FOTO DARI FILE (FILE PICKER)      */}
            {/* ======================================================== */}
            {activeModal === 'upload' && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
                    <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#0E131F] border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden flex flex-col">
                        {/* Modal Header */}
                        <div className="p-4 px-6 border-b border-slate-100 dark:border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-sky-500/15 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                                    <Upload className="w-4 h-4" />
                                </div>
                                <div>
                                    <h4 className="font-heading font-extrabold text-sm text-slate-900 dark:text-white">
                                        Unggah Foto Profil
                                    </h4>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                        Pilih foto dari komputer Anda (JPG, PNG, WebP)
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setActiveModal(null)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-4">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp,image/jpg"
                                onChange={(e) => handleFileSelect(e.target.files[0])}
                                className="hidden"
                            />

                            {uploadPreview ? (
                                <div className="space-y-4 text-center">
                                    <div className="w-36 h-36 mx-auto rounded-full p-1 bg-gradient-to-tr from-[#005792] to-cyan-400 shadow-lg overflow-hidden">
                                        <img
                                            src={uploadPreview}
                                            alt="Preview"
                                            className="w-full h-full object-cover rounded-full"
                                        />
                                    </div>
                                    <p className="text-xs font-mono text-slate-500">
                                        {uploadFile?.name} ({(uploadFile?.size / 1024).toFixed(0)} KB)
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="text-xs font-semibold text-[#005792] dark:text-sky-400 hover:underline"
                                    >
                                        Pilih berkas gambar lain
                                    </button>
                                </div>
                            ) : (
                                <div
                                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                    onDragLeave={() => setIsDragging(false)}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        setIsDragging(false);
                                        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                            handleFileSelect(e.dataTransfer.files[0]);
                                        }
                                    }}
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`p-8 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all ${
                                        isDragging
                                            ? 'border-[#005792] bg-[#005792]/10 scale-[1.01]'
                                            : 'border-slate-300 dark:border-white/10 hover:border-[#005792] dark:hover:border-sky-500 hover:bg-slate-50 dark:hover:bg-white/[0.02]'
                                    }`}
                                >
                                    <Upload className="w-10 h-10 text-[#005792] dark:text-sky-400 mx-auto mb-3" />
                                    <p className="text-xs font-bold text-slate-800 dark:text-white">
                                        Klik untuk memilih foto atau seret berkas ke sini
                                    </p>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-mono">
                                        Format: PNG, JPG, WebP (Maks 5MB)
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 px-6 border-t border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] flex items-center justify-between">
                            <button
                                type="button"
                                onClick={() => setActiveModal(null)}
                                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
                            >
                                Batal
                            </button>

                            <button
                                type="button"
                                onClick={handleSaveUploadPhoto}
                                disabled={!uploadFile || isSavingUpload}
                                className="px-5 py-2 rounded-xl bg-[#005792] hover:bg-[#004270] text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-[#005792]/25 transition-all hover:scale-105 active:scale-95 disabled:opacity-40"
                            >
                                {isSavingUpload ? (
                                    <>
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        <span>Mengunggah...</span>
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-3.5 h-3.5" />
                                        <span>Simpan & Pasang Foto</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
