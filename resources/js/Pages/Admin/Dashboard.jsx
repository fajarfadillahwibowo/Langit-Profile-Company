import React, { useState, useEffect, useMemo } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import ThemeToggle from '@/Components/ThemeToggle';
import ExecutiveAnalyticsCharts from '@/Components/ExecutiveAnalyticsCharts';
import { 
    LayoutDashboard, Cpu, PackageCheck, Camera, Sparkles, Handshake,
    Ticket, LogOut, Check, X, Plus, Trash2, Edit3, ExternalLink,
    Phone, Mail, Calendar, Clock, AlertCircle, CheckCircle2, ShieldCheck,
    Search, Layers, ArrowUpRight, FileText, Download, Eye, Building2, User, Filter,
    Sun, Moon, ChevronDown, ChevronRight, Upload, Image as ImageIcon, RefreshCw,
    Code2, GraduationCap, SlidersHorizontal, Video, Film, Play
} from 'lucide-react';

export default function AdminDashboard({
    metrics = {},
    serviceTickets = [],
    rentalBookings = [],
    internshipApplications = [],
    collaborations = [],
    galleries = [],
    services = [],
    equipments = [],
    courses = [],
    webPortfolios = [],
    recentConsultations = [],
}) {
    const { auth } = usePage().props;
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

    const [activeTab, setActiveTab] = useState('overview'); // overview, tickets, rentals, galleries, internships, collaborations, consultations

    // Gallery Sub-Sidebar & Filtering State
    const [isGalleryMenuOpen, setIsGalleryMenuOpen] = useState(true);
    const [selectedGalleryService, setSelectedGalleryService] = useState('all'); // 'all' or slug
    const [gallerySubCategoryFilter, setGallerySubCategoryFilter] = useState('all');

    // Collaboration Detail & Filter State
    const [selectedCollabDetail, setSelectedCollabDetail] = useState(null);
    const [collabFilter, setCollabFilter] = useState('all');

    // New Ticket Modal State
    const [ticketModalOpen, setTicketModalOpen] = useState(false);
    const [newTicketData, setNewTicketData] = useState({
        customer_name: '',
        whatsapp: '',
        device_type: 'Laptop Windows',
        device_brand_model: '',
        problem_reported: '',
        estimated_cost: 250000,
    });

    // New Gallery Modal State
    const [galleryModalOpen, setGalleryModalOpen] = useState(false);
    const [newGalleryData, setNewGalleryData] = useState({
        title: '',
        service_id: '',
        category: 'commercial',
        media_type: 'photo',
        file_webp_path: '',
        camera: 'Sony FX3 Cinema Line',
        lens: 'Sony FE 24-70mm F2.8 GM II',
        shutter: '1/500s',
        aperture: 'f/2.8',
        iso: '100',
    });
    const [newGalleryFilePhoto, setNewGalleryFilePhoto] = useState(null);
    const [newGalleryInputMode, setNewGalleryInputMode] = useState('url');

    // Edit / Replace Photo Modal State
    const [editPhotoModalOpen, setEditPhotoModalOpen] = useState(false);
    const [editingGalleryItem, setEditingGalleryItem] = useState(null);
    const [editPhotoData, setEditPhotoData] = useState({
        id: null,
        title: '',
        service_id: '',
        category: 'general',
        media_type: 'photo',
        file_webp_path: '',
        camera: '',
        lens: '',
        shutter: '',
        aperture: '',
        iso: '',
    });
    const [editFilePhoto, setEditFilePhoto] = useState(null);
    const [previewPhotoUrl, setPreviewPhotoUrl] = useState('');
    const [editInputMode, setEditInputMode] = useState('url'); // 'url', 'upload', 'preset'
    const [isSubmittingPhoto, setIsSubmittingPhoto] = useState(false);

    // Dedicated Before / After Color Grading Modal State
    const [beforeAfterModalOpen, setBeforeAfterModalOpen] = useState(false);
    const [beforeAfterData, setBeforeAfterData] = useState({
        before_file_path: '',
        after_file_path: '',
        before_label: 'Sony S-Log3 RAW Flat',
        after_label: 'Langit Cinema Grade (Kodak 2383)',
        title: 'Cinema Color Grading Master Showcase',
    });
    const [beforePhotoFile, setBeforePhotoFile] = useState(null);
    const [afterPhotoFile, setAfterPhotoFile] = useState(null);
    const [beforeInputMode, setBeforeInputMode] = useState('url'); // 'url', 'upload'
    const [afterInputMode, setAfterInputMode] = useState('url'); // 'url', 'upload'
    const [isSubmittingBeforeAfter, setIsSubmittingBeforeAfter] = useState(false);

    // Dedicated Showreel Video Showcase Modal State
    const [showreelModalOpen, setShowreelModalOpen] = useState(false);
    const [showreelData, setShowreelData] = useState({
        video_url: '',
        poster_url: '',
        title: 'Visual Sinematik Kelas Dunia.',
        subtitle: 'Dari storyboard komersial brand ternama hingga mahakarya pernikahan abadi, direkam dengan standar kamera sinema dan kalibrasi warna presisi.',
    });
    const [videoFile, setVideoFile] = useState(null);
    const [posterFile, setPosterFile] = useState(null);
    const [videoInputMode, setVideoInputMode] = useState('upload'); // 'upload', 'url'
    const [posterInputMode, setPosterInputMode] = useState('url'); // 'url', 'upload'
    const [isSubmittingShowreel, setIsSubmittingShowreel] = useState(false);

    // 7 Real Sub-Sidebar Items matching the authentic services of Langit
    const serviceNavItems = [
        {
            id: 'all',
            slug: 'all',
            name: 'Semua Galeri (Global)',
            badge: 'Master Showcase',
            subtitle: 'Kompilasi Seluruh Dokumentasi & EXIF',
            icon: Camera,
            color: '#F59E0B',
        },
        {
            id: 'photography-videography',
            slug: 'photography-videography',
            name: 'Photography & Videography',
            badge: 'Visual & Cinema',
            subtitle: 'Wedding, Wisuda, Event, Traveling, Drone & Cinema',
            icon: Camera,
            color: '#F59E0B',
        },
        {
            id: 'web-development',
            slug: 'web-development',
            name: 'Web Development',
            badge: 'Cyber Architecture',
            subtitle: 'Operasi Internal, Company Profile, Portal Pendidikan',
            icon: Code2,
            color: '#0EA5E9',
        },
        {
            id: 'langit-education',
            slug: 'langit-education',
            name: 'Langit Education',
            badge: 'Academy & Training',
            subtitle: 'Kursus Coding (Robotik/Web/AI), Office, Rakit PC',
            icon: GraduationCap,
            color: '#10B981',
        },
        {
            id: 'computer-service',
            slug: 'computer-service',
            name: 'Computer Service',
            badge: 'Hardware Lab',
            subtitle: 'Installasi Software, Upgrade SSD, Rakit PC & Sparepart',
            icon: Cpu,
            color: '#F97316',
        },
        {
            id: 'internship',
            slug: 'internship',
            name: 'Internship',
            badge: 'Career Hub',
            subtitle: 'Form Pendaftaran Magang / PKL Industri & Inkubasi',
            icon: Sparkles,
            color: '#8B5CF6',
        },
        {
            id: 'sewa-alat',
            slug: 'sewa-alat',
            name: 'Sewa Alat',
            badge: 'Rental Gear',
            subtitle: 'Rental Proyektor + Screen, Smart TV Display & Drone 4K',
            icon: PackageCheck,
            color: '#14B8A6',
        },
    ];

    // Curated high quality presets matching the real cards on the service pages
    const servicePhotoPresets = {
        'photography-videography': [
            { title: 'Royal Heritage Wedding Film', category: 'wedding', url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80', camera: 'Sony A7 IV', lens: 'FE 85mm F1.4 GM' },
            { title: 'Wisuda Sarjana Studio Portrait', category: 'wisuda', url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80', camera: 'Sony A7R V', lens: 'FE 50mm F1.2 GM' },
            { title: 'National Music Festival Gathering', category: 'event', url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80', camera: 'Sony FX3', lens: 'FE 70-200mm F2.8 GM' },
            { title: 'DJI Mavic 3 Cine Aerial Mapping', category: 'drone', url: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=1200&q=80', camera: 'DJI Mavic 3 Cine', lens: 'Hasselblad 24mm' },
        ],
        'web-development': [
            { title: 'Sistem Operasi Internal Perusahaan & ERP', category: 'enterprise', url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80', camera: 'Cyber Architecture', lens: 'Laravel 13 & React' },
            { title: 'Website Profile Perusahaan Korporat Modern', category: 'corporate', url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80', camera: 'Corporate Branding', lens: 'Bento 3D Grid' },
            { title: 'EduSmart: Portal Pendidikan, Absensi & Akademik', category: 'edtech', url: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=1200&q=80', camera: 'EdTech Architecture', lens: 'QR Presensi Gateway' },
            { title: 'E-Commerce Marketplace & Sistem Booking', category: 'ecommerce', url: 'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?auto=format&fit=crop&w=1200&q=80', camera: 'Digital Retail Hub', lens: 'Midtrans QRIS & VA' },
        ],
        'computer-service': [
            { title: 'Installasi Software (OS & Aplikasi)', category: 'software', url: '/images/services/service_software.jpg', camera: 'Clean OS Lab', lens: 'Windows 11 & macOS' },
            { title: 'Upgrade SSD (Speed Boost 10x)', category: 'hardware', url: '/images/services/service_ssd.jpg', camera: 'Speed Boost Lab', lens: 'NVMe PCIe Gen4 M.2' },
            { title: 'Rakit PC Custom Build (Custom Rig & Tuning)', category: 'custom_pc', url: '/images/services/service_pc.jpg', camera: 'Precision Assembly', lens: 'Thermal Paste PTM7950' },
            { title: 'Penggantian Part (Sparepart Original)', category: 'sparepart', url: '/images/services/service_part.jpg', camera: 'Component Lab', lens: 'Panel LCD IPS Original' },
        ],
        'sewa-alat': [
            { title: 'Proyektor Epson EB-E01 3300 Lumens', category: 'proyektor', url: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1200&q=80', camera: 'Rental Gear Lab', lens: '3300 ANSI Lumens' },
            { title: 'Proyektor Laser ViewSonic 4K UHD 5000 Lumens', category: 'proyektor', url: 'https://images.unsplash.com/photo-1535016120720-40c646be5580?auto=format&fit=crop&w=1200&q=80', camera: 'Rental Gear Lab', lens: '5000 ANSI Lumens' },
            { title: 'Screen Layar Proyektor Tripod 84 Inch', category: 'proyektor', url: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80', camera: 'Rental Gear Lab', lens: '178 x 178 cm' },
            { title: 'Smart TV 55 Inch 4K UHD Standing Bracket', category: 'tv', url: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=1200&q=80', camera: 'Rental Gear Lab', lens: 'Crystal 4K UHD Display' },
            { title: 'Smart TV 65 Inch 4K HDR Heavy Duty', category: 'tv', url: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?auto=format&fit=crop&w=1200&q=80', camera: 'Rental Gear Lab', lens: '65 Inch Ultra Vivid HDR' },
            { title: 'DJI Mavic 3 Pro Cine Drone Kit', category: 'drone', url: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=1200&q=80', camera: 'DJI Mavic 3 Pro Cine', lens: 'Hasselblad 4/3 CMOS' },
            { title: 'DJI Mini 4 Pro Fly More Combo', category: 'drone', url: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=1200&q=80', camera: 'DJI Mini 4 Pro', lens: '4K 60fps HDR True Vertical' },
        ],
        'langit-education': [
            { title: 'Kursus Coding (Robotik, Web Dev & AI)', category: 'coding', url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80', camera: 'Workstation Studio Lab', lens: 'Python, React & ESP32 IoT' },
            { title: 'Kursus Office (Microsoft Office & Google Workspace)', category: 'office', url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80', camera: 'Office Command Lab', lens: 'Word, Excel Advanced, PPT & Cloud' },
            { title: 'Kursus Rakit Komputer & Hardware Lab', category: 'hardware', url: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=1200&q=80', camera: 'Hardware Diagnostic Lab', lens: 'ESD Safe Workbench & Soldering' },
        ],
        'internship': [
            { title: 'Posisi Magang: Videographer (Cinema & Visual)', category: 'onsite', url: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80', camera: 'Sony FX3 Cinema Line', lens: 'FE 24-70mm F2.8 GM II' },
            { title: 'Posisi Magang: Talent / Model (Creative)', category: 'onsite', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80', camera: 'Sony A7R V', lens: 'FE 85mm F1.4 GM' },
            { title: 'Posisi Magang: Video Editor (Post-Production)', category: 'hybrid', url: 'https://images.unsplash.com/photo-1535016120720-40c646be5580?auto=format&fit=crop&w=1200&q=80', camera: 'DaVinci Resolve & Premiere', lens: 'Dual Screen 4K Grading' },
            { title: 'Posisi Magang: Web Developer (React & Laravel)', category: 'hybrid', url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80', camera: 'Engineering Hub', lens: 'Laravel 13 & React SPA' },
        ],
    };

    const getServiceGalleryCount = (serviceSlug) => {
        if (serviceSlug === 'all') return galleries.length;
        return galleries.filter((g) => {
            if (g.service?.slug === serviceSlug) return true;
            const matched = services.find(s => s.slug === serviceSlug);
            if (matched && g.service_id === matched.id) return true;
            return false;
        }).length;
    };

    // Current active service item metadata
    const activeServiceInfo = useMemo(() => {
        return serviceNavItems.find(s => s.slug === selectedGalleryService) || serviceNavItems[0];
    }, [selectedGalleryService]);

    // Filter galleries by active sub-sidebar service and sub-category
    const filteredGalleries = useMemo(() => {
        let list = galleries;
        if (selectedGalleryService !== 'all') {
            list = list.filter((g) => {
                if (g.service?.slug === selectedGalleryService) return true;
                const matched = services.find(s => s.slug === selectedGalleryService);
                if (matched && g.service_id === matched.id) return true;
                return false;
            });
        }
        if (gallerySubCategoryFilter !== 'all') {
            list = list.filter((g) => g.category === gallerySubCategoryFilter);
        }
        return list;
    }, [galleries, selectedGalleryService, gallerySubCategoryFilter, services]);

    // Available sub-categories in current service
    const availableSubCategories = useMemo(() => {
        let baseList = galleries;
        if (selectedGalleryService !== 'all') {
            baseList = baseList.filter((g) => {
                if (g.service?.slug === selectedGalleryService) return true;
                const matched = services.find(s => s.slug === selectedGalleryService);
                return matched && g.service_id === matched.id;
            });
        }
        const cats = Array.from(new Set(baseList.map(g => g.category).filter(Boolean)));
        return cats;
    }, [galleries, selectedGalleryService, services]);

    // Active Before/After and Showreel items
    const currentBeforeAfterItem = useMemo(() => {
        return galleries.find(g => g.media_type === 'before_after') || null;
    }, [galleries]);

    const currentShowreelItem = useMemo(() => {
        return galleries.find(g => g.media_type === 'video' || g.category === 'showreel') || null;
    }, [galleries]);

    const formatRupiah = (val) => {
        if (!val) return 'Rp 0';
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(val);
    };

    // Actions
    const handleUpdateTicketStatus = (id, newStatus) => {
        router.put(`/admin/tickets/${id}/status`, { status: newStatus }, { preserveScroll: true });
    };

    const handleUpdateRentalStatus = (id, newStatus) => {
        router.put(`/admin/rentals/${id}/status`, { status: newStatus }, { preserveScroll: true });
    };

    const handleUpdateInternshipStatus = (id, newStatus) => {
        router.put(`/admin/internships/${id}/status`, { status: newStatus }, { preserveScroll: true });
    };

    const handleUpdateConsultationStatus = (id, newStatus) => {
        router.put(`/admin/consultations/${id}/status`, { status: newStatus }, { preserveScroll: true });
    };

    const handleDeleteGallery = (id) => {
        if (confirm('Yakin ingin menghapus item galeri ini?')) {
            router.delete(`/admin/galleries/${id}`, { preserveScroll: true });
        }
    };

    const handleUpdateCollaborationStatus = (id, newStatus) => {
        router.put(`/admin/collaborations/${id}/status`, { status: newStatus }, { preserveScroll: true });
    };

    const handleDeleteCollaboration = (id) => {
        if (confirm('Yakin ingin menghapus berkas pengajuan kerja sama ini?')) {
            router.delete(`/admin/collaborations/${id}`, { preserveScroll: true });
        }
    };

    const getCollabTypeInfo = (type) => {
        switch (type) {
            case 'media_partner':
                return { label: 'Media Partner & Coverage', color: 'bg-rose-500/20 text-rose-300 border-rose-500/30' };
            case 'sponsorship':
                return { label: 'Sponsorship Kegiatan', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
            case 'campus_visit':
                return { label: 'Company Visit / Kuliah Tamu', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' };
            case 'b2b_project':
                return { label: 'Proyek Vendor Kreatif B2B', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' };
            default:
                return { label: 'Kemitraan Lainnya', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' };
        }
    };

    const filteredCollaborations = collaborations.filter((c) => {
        if (collabFilter === 'all') return true;
        return c.status === collabFilter;
    });

    const handleCreateTicketSubmit = (e) => {
        e.preventDefault();
        router.post('/admin/tickets', newTicketData, {
            preserveScroll: true,
            onSuccess: () => {
                setTicketModalOpen(false);
                setNewTicketData({
                    customer_name: '',
                    whatsapp: '',
                    device_type: 'Laptop Windows',
                    device_brand_model: '',
                    problem_reported: '',
                    estimated_cost: 250000,
                });
            }
        });
    };

    const handleCreateGallerySubmit = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('title', newGalleryData.title);
        if (newGalleryData.service_id) formData.append('service_id', newGalleryData.service_id);
        formData.append('category', newGalleryData.category);
        formData.append('media_type', newGalleryData.media_type);
        formData.append('file_webp_path', newGalleryData.file_webp_path || '');
        if (newGalleryFilePhoto) formData.append('file_photo', newGalleryFilePhoto);
        formData.append('camera', newGalleryData.camera || '');
        formData.append('lens', newGalleryData.lens || '');
        formData.append('shutter', newGalleryData.shutter || '');
        formData.append('aperture', newGalleryData.aperture || '');
        formData.append('iso', newGalleryData.iso || '');

        router.post('/admin/galleries', formData, {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                setGalleryModalOpen(false);
                setNewGalleryFilePhoto(null);
                setNewGalleryData({
                    title: '',
                    service_id: '',
                    category: 'commercial',
                    media_type: 'photo',
                    file_webp_path: '',
                    camera: 'Sony FX3 Cinema Line',
                    lens: 'Sony FE 24-70mm F2.8 GM II',
                    shutter: '1/500s',
                    aperture: 'f/2.8',
                    iso: '100',
                });
            }
        });
    };

    // Open Replace Photo Modal
    const openEditPhotoModal = (item) => {
        setEditingGalleryItem(item);
        const targetServiceId = item.service_id || (services.find(s => s.slug === selectedGalleryService)?.id || '');
        setEditPhotoData({
            id: item.id,
            title: item.title || '',
            service_id: targetServiceId,
            category: item.category || 'general',
            media_type: item.media_type || 'photo',
            file_webp_path: item.file_webp_path || '',
            camera: item.exif_metadata_json?.camera || '',
            lens: item.exif_metadata_json?.lens || '',
            shutter: item.exif_metadata_json?.shutter || '',
            aperture: item.exif_metadata_json?.aperture || '',
            iso: item.exif_metadata_json?.iso || '',
        });
        setPreviewPhotoUrl(item.file_webp_path || '');
        setEditFilePhoto(null);
        setEditInputMode('url');
        setEditPhotoModalOpen(true);
    };

    // Submit Replace Photo
    const handleUpdatePhotoSubmit = (e) => {
        e.preventDefault();
        if (!editPhotoData.id) return;
        setIsSubmittingPhoto(true);

        const formData = new FormData();
        formData.append('title', editPhotoData.title);
        if (editPhotoData.service_id) formData.append('service_id', editPhotoData.service_id);
        formData.append('category', editPhotoData.category);
        formData.append('media_type', editPhotoData.media_type);
        formData.append('file_webp_path', editPhotoData.file_webp_path || '');
        if (editFilePhoto) formData.append('file_photo', editFilePhoto);
        formData.append('camera', editPhotoData.camera || '');
        formData.append('lens', editPhotoData.lens || '');
        formData.append('shutter', editPhotoData.shutter || '');
        formData.append('aperture', editPhotoData.aperture || '');
        formData.append('iso', editPhotoData.iso || '');

        router.post(`/admin/galleries/${editPhotoData.id}/update`, formData, {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                setEditPhotoModalOpen(false);
                setIsSubmittingPhoto(false);
            },
            onError: () => {
                setIsSubmittingPhoto(false);
            }
        });
    };

    // Handle Local File Selection
    const handleEditFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setEditFilePhoto(file);
            const objUrl = URL.createObjectURL(file);
            setPreviewPhotoUrl(objUrl);
        }
    };

    // 1-Click Apply Preset
    const handleApplyPreset = (preset) => {
        setEditPhotoData(prev => ({
            ...prev,
            title: preset.title || prev.title,
            file_webp_path: preset.url,
            category: preset.category || prev.category,
            camera: preset.camera || prev.camera,
            lens: preset.lens || prev.lens,
        }));
        setPreviewPhotoUrl(preset.url);
        setEditFilePhoto(null);
    };

    // Open Before/After Modal
    const openBeforeAfterModal = () => {
        const item = currentBeforeAfterItem;
        setBeforeAfterData({
            before_file_path: item?.before_file_path || 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1400&q=80',
            after_file_path: item?.file_webp_path || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1400&q=80',
            before_label: item?.exif_metadata_json?.before_label || 'Sony S-Log3 RAW Flat',
            after_label: item?.exif_metadata_json?.after_label || 'Langit Cinema Grade (Kodak 2383)',
            title: item?.title || 'Cinema Color Grading Master Showcase',
        });
        setBeforePhotoFile(null);
        setAfterPhotoFile(null);
        setBeforeAfterModalOpen(true);
    };

    const handleBeforeAfterSubmit = (e) => {
        e.preventDefault();
        setIsSubmittingBeforeAfter(true);
        const formData = new FormData();
        if (beforePhotoFile) formData.append('before_photo', beforePhotoFile);
        if (beforeAfterData.before_file_path) formData.append('before_file_path', beforeAfterData.before_file_path);
        if (afterPhotoFile) formData.append('after_photo', afterPhotoFile);
        if (beforeAfterData.after_file_path) formData.append('after_file_path', beforeAfterData.after_file_path);
        formData.append('title', beforeAfterData.title || 'Cinema Color Grading Master Showcase');
        formData.append('before_label', beforeAfterData.before_label || 'Sony S-Log3 RAW Flat');
        formData.append('after_label', beforeAfterData.after_label || 'Langit Cinema Grade (Kodak 2383)');

        router.post('/admin/galleries/before-after', formData, {
            preserveScroll: true,
            forceFormData: true,
            onFinish: () => setIsSubmittingBeforeAfter(false),
            onSuccess: () => {
                setBeforeAfterModalOpen(false);
                setBeforePhotoFile(null);
                setAfterPhotoFile(null);
            }
        });
    };

    // Open Showreel Modal
    const openShowreelModal = () => {
        const item = currentShowreelItem;
        setShowreelData({
            video_url: item?.video_url || '',
            poster_url: item?.file_webp_path || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1600&q=80',
            title: item?.title || 'Visual Sinematik Kelas Dunia.',
            subtitle: 'Dari storyboard komersial brand ternama hingga mahakarya pernikahan abadi, direkam dengan standar kamera sinema dan kalibrasi warna presisi.',
        });
        setVideoFile(null);
        setPosterFile(null);
        setShowreelModalOpen(true);
    };

    const handleShowreelSubmit = (e) => {
        e.preventDefault();
        setIsSubmittingShowreel(true);
        const formData = new FormData();
        if (videoFile) formData.append('video_file', videoFile);
        if (showreelData.video_url) formData.append('video_url', showreelData.video_url);
        if (posterFile) formData.append('poster_photo', posterFile);
        if (showreelData.poster_url) formData.append('poster_url', showreelData.poster_url);
        if (showreelData.title) formData.append('title', showreelData.title);
        if (showreelData.subtitle) formData.append('subtitle', showreelData.subtitle);

        router.post('/admin/galleries/showreel', formData, {
            preserveScroll: true,
            forceFormData: true,
            onFinish: () => setIsSubmittingShowreel(false),
            onSuccess: () => {
                setShowreelModalOpen(false);
                setVideoFile(null);
                setPosterFile(null);
            }
        });
    };

    return (
        <div className="min-h-screen bg-[#EDF9FC] text-slate-800 dark:bg-[#07090E] dark:text-slate-100 flex font-sans transition-colors duration-200">
            <Head title="Admin CMS Executive Dashboard — Langit" />

            {/* Sidebar Navigation */}
            <aside className="w-64 border-r border-[#004270]/70 bg-[#005792] flex flex-col justify-between p-4 shrink-0 hidden md:flex transition-colors duration-200 shadow-2xl shadow-[#005792]/25">
                <div className="space-y-6">
                    {/* Header Logo — Brand Logo Identik Halaman Publik */}
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
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                                activeTab === 'overview'
                                    ? 'bg-white text-[#005792] font-bold shadow-md shadow-black/15'
                                    : 'text-white/90 hover:text-white hover:bg-white/10'
                            }`}
                        >
                            <LayoutDashboard className={`w-4 h-4 ${activeTab === 'overview' ? 'text-[#005792]' : 'text-sky-200'}`} />
                            <span>Executive Overview</span>
                        </button>

                        <button
                            onClick={() => setActiveTab('tickets')}
                            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                                activeTab === 'tickets'
                                    ? 'bg-white text-[#005792] font-bold shadow-md shadow-black/15'
                                    : 'text-white/90 hover:text-white hover:bg-white/10'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <Cpu className={`w-4 h-4 ${activeTab === 'tickets' ? 'text-[#005792]' : 'text-orange-300'}`} />
                                <span>Computer Servis</span>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                                activeTab === 'tickets'
                                    ? 'bg-[#005792]/15 text-[#005792]'
                                    : 'bg-white/20 text-white'
                            }`}>
                                {serviceTickets.length}
                            </span>
                        </button>

                        <button
                            onClick={() => setActiveTab('rentals')}
                            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                                activeTab === 'rentals'
                                    ? 'bg-white text-[#005792] font-bold shadow-md shadow-black/15'
                                    : 'text-white/90 hover:text-white hover:bg-white/10'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <PackageCheck className={`w-4 h-4 ${activeTab === 'rentals' ? 'text-[#005792]' : 'text-teal-300'}`} />
                                <span>Sewa Alat & Gear</span>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                                activeTab === 'rentals'
                                    ? 'bg-[#005792]/15 text-[#005792]'
                                    : 'bg-white/20 text-white'
                            }`}>
                                {rentalBookings.length}
                            </span>
                        </button>

                        {/* Sub-Sidebar: Galeri & EXIF Media with Services Accordion */}
                        <div className="space-y-1">
                            <button
                                onClick={() => {
                                    if (activeTab !== 'galleries') {
                                        setActiveTab('galleries');
                                        setIsGalleryMenuOpen(true);
                                    } else {
                                        setIsGalleryMenuOpen(!isGalleryMenuOpen);
                                    }
                                }}
                                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                                    activeTab === 'galleries'
                                        ? 'bg-white text-[#005792] font-bold shadow-md shadow-black/15'
                                        : 'text-white/90 hover:text-white hover:bg-white/10'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <Camera className={`w-4 h-4 shrink-0 ${activeTab === 'galleries' ? 'text-[#005792]' : 'text-amber-300'}`} />
                                    <span>Galeri & EXIF Media</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                                        activeTab === 'galleries'
                                            ? 'bg-[#005792]/15 text-[#005792]'
                                            : 'bg-white/20 text-white'
                                    }`}>
                                        {galleries.length}
                                    </span>
                                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${
                                        isGalleryMenuOpen ? 'rotate-180' : ''
                                    } ${activeTab === 'galleries' ? 'text-[#005792]' : 'text-white/70'}`} />
                                </div>
                            </button>

                            {/* Sub Sidebar: Dropdown Daftar Layanan */}
                            {isGalleryMenuOpen && (
                                <div className="ml-3 pl-2.5 border-l-2 border-white/30 space-y-1 pt-1.5 pb-1">
                                    {serviceNavItems.map((sItem) => {
                                        const isSelected = activeTab === 'galleries' && selectedGalleryService === sItem.slug;
                                        const count = getServiceGalleryCount(sItem.slug);

                                        return (
                                            <button
                                                key={sItem.id}
                                                onClick={() => {
                                                    setActiveTab('galleries');
                                                    setSelectedGalleryService(sItem.slug);
                                                    setGallerySubCategoryFilter('all');
                                                }}
                                                className={`w-full text-left px-2.5 py-2 rounded-xl text-xs transition-all flex items-center justify-between group ${
                                                    isSelected
                                                        ? 'bg-white text-[#005792] font-bold shadow-sm'
                                                        : 'text-white/85 hover:text-white hover:bg-white/10'
                                                }`}
                                            >
                                                <div className="flex items-center gap-2 min-w-0 pr-1">
                                                    <span
                                                        className="w-2.5 h-2.5 rounded-full shrink-0 transition-transform group-hover:scale-125 ring-1 ring-white/30"
                                                        style={{ backgroundColor: sItem.color }}
                                                    />
                                                    <div className="min-w-0">
                                                        <span className="block truncate font-semibold text-xs leading-tight">
                                                            {sItem.name}
                                                        </span>
                                                        <span className={`block text-[10px] truncate leading-tight mt-0.5 ${
                                                            isSelected ? 'text-[#005792]/70 font-medium' : 'text-sky-200/75'
                                                        }`}>
                                                            {sItem.badge}
                                                        </span>
                                                    </div>
                                                </div>
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                                                    isSelected
                                                        ? 'bg-[#005792] text-white shadow-xs'
                                                        : 'bg-white/20 text-white'
                                                }`}>
                                                    {count}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => setActiveTab('internships')}
                            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                                activeTab === 'internships'
                                    ? 'bg-white text-[#005792] font-bold shadow-md shadow-black/15'
                                    : 'text-white/90 hover:text-white hover:bg-white/10'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <Sparkles className={`w-4 h-4 ${activeTab === 'internships' ? 'text-[#005792]' : 'text-purple-300'}`} />
                                <span>Internship Pelamar</span>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                                activeTab === 'internships'
                                    ? 'bg-[#005792]/15 text-[#005792]'
                                    : 'bg-white/20 text-white'
                            }`}>
                                {internshipApplications.length}
                            </span>
                        </button>

                        <button
                            onClick={() => setActiveTab('collaborations')}
                            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                                activeTab === 'collaborations'
                                    ? 'bg-white text-[#005792] font-bold shadow-md shadow-black/15'
                                    : 'text-white/90 hover:text-white hover:bg-white/10'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <Handshake className={`w-4 h-4 ${activeTab === 'collaborations' ? 'text-[#005792]' : 'text-rose-300'}`} />
                                <span>Proposal Kerja Sama</span>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                                activeTab === 'collaborations'
                                    ? 'bg-[#005792]/15 text-[#005792]'
                                    : 'bg-white/20 text-white'
                            }`}>
                                {collaborations.length}
                            </span>
                        </button>

                        <button
                            onClick={() => setActiveTab('consultations')}
                            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                                activeTab === 'consultations'
                                    ? 'bg-white text-[#005792] font-bold shadow-md shadow-black/15'
                                    : 'text-white/90 hover:text-white hover:bg-white/10'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <Ticket className={`w-4 h-4 ${activeTab === 'consultations' ? 'text-[#005792]' : 'text-sky-300'}`} />
                                <span>Jadwal Konsultasi</span>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                                activeTab === 'consultations'
                                    ? 'bg-[#005792]/15 text-[#005792]'
                                    : 'bg-white/20 text-white'
                            }`}>
                                {recentConsultations.length}
                            </span>
                        </button>
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

            {/* Main Content Dashboard */}
            <main className="flex-1 min-w-0 p-6 md:p-8 overflow-y-auto bg-[#EDF9FC] dark:bg-[#07090E]">
                {/* Topbar Info */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 mb-6 border-b border-[#005792]/15 dark:border-white/10">
                    <div>
                        <h1 className="font-heading font-extrabold text-2xl text-slate-900 dark:text-white">
                            {activeTab === 'overview' && 'Executive Dashboard & Metrics'}
                            {activeTab === 'tickets' && 'Manajemen Tiket Servis Komputer'}
                            {activeTab === 'rentals' && 'Manajemen Sewa Alat & Inventaris Gear'}
                            {activeTab === 'galleries' && 'Manajemen Galeri Mahakarya & EXIF'}
                            {activeTab === 'internships' && 'Review Pelamar Magang & CV'}
                            {activeTab === 'collaborations' && 'Manajemen Pengajuan Kerja Sama & Kemitraan (B2B)'}
                            {activeTab === 'consultations' && 'Manajemen Tiket Jadwal Konsultasi'}
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                            Status Server: Online 200 OK • Laravel 13 • MySQL phpMyAdmin Connected
                        </p>
                    </div>

                    {/* Topbar Theme Toggle & Admin Profile */}
                    <div className="flex items-center gap-2.5">
                        {/* Theme Toggle in Header */}
                        <ThemeToggle theme={theme} setTheme={setTheme} />

                        {/* Admin Profile Pill */}
                        <Link
                            href="/admin/profile"
                            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 border border-[#005792]/20 dark:border-white/10 transition-colors shadow-xs group"
                            title="Buka Pengaturan Profil Administrator"
                        >
                            <div className="w-6 h-6 rounded-full overflow-hidden bg-[#005792] text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                                {auth?.user?.avatar ? (
                                    <img src={auth.user.avatar} alt={auth.user.name} className="w-full h-full object-cover" />
                                ) : (
                                    <span>{(auth?.user?.name || 'AD').substring(0, 2).toUpperCase()}</span>
                                )}
                            </div>
                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 group-hover:text-[#005792] dark:group-hover:text-white hidden sm:inline truncate max-w-[130px]">
                                {auth?.user?.name || 'Admin'}
                            </span>
                        </Link>
                    </div>
                </div>

                {/* Mobile Tabs Switcher */}
                <div className="flex md:hidden items-center gap-1.5 overflow-x-auto pb-3 mb-6 no-scrollbar text-xs font-medium">
                    {[
                        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
                        { id: 'tickets', label: `Servis (${serviceTickets.length})`, icon: Cpu },
                        { id: 'rentals', label: `Rental (${rentalBookings.length})`, icon: PackageCheck },
                        { id: 'galleries', label: `Galeri (${galleries.length})`, icon: Camera },
                        { id: 'internships', label: `Magang (${internshipApplications.length})`, icon: Sparkles },
                        { id: 'collaborations', label: `Kerja Sama (${collaborations.length})`, icon: Handshake },
                        { id: 'consultations', label: `Konsultasi (${recentConsultations.length})`, icon: Ticket },
                    ].map(tab => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl whitespace-nowrap shrink-0 transition-all ${
                                    activeTab === tab.id
                                        ? 'bg-[#005792] text-white font-bold shadow-md shadow-[#005792]/25'
                                        : 'bg-slate-200/80 dark:bg-white/5 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                }`}
                            >
                                <Icon className="w-3.5 h-3.5" />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* TAB 1: EXECUTIVE OVERVIEW (PRD 6.1) */}
                {activeTab === 'overview' && (
                    <div className="space-y-8">
                        {/* 7 Key Executive Metric Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
                            <div onClick={() => setActiveTab('consultations')} className="p-4 rounded-2xl bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/30 cursor-pointer hover:border-cyan-400 dark:hover:border-cyan-500/60 transition-all shadow-sm">
                                <span className="text-[11px] text-cyan-700 dark:text-cyan-400 uppercase block font-semibold tracking-wider">Leads Konsultasi</span>
                                <span className="text-2xl font-extrabold font-heading text-slate-900 dark:text-white mt-1 block">{metrics.total_consultations || 0}</span>
                            </div>
                            <div onClick={() => setActiveTab('tickets')} className="p-4 rounded-2xl bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/30 cursor-pointer hover:border-orange-400 dark:hover:border-orange-500/60 transition-all shadow-sm">
                                <span className="text-[11px] text-orange-700 dark:text-orange-400 uppercase block font-semibold tracking-wider">Tiket Servis Aktif</span>
                                <span className="text-2xl font-extrabold font-heading text-slate-900 dark:text-white mt-1 block">{metrics.pending_service_tickets || 0}</span>
                            </div>
                            <div onClick={() => setActiveTab('rentals')} className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-500/30 cursor-pointer hover:border-teal-400 dark:hover:border-teal-500/60 transition-all shadow-sm">
                                <span className="text-[11px] text-teal-700 dark:text-teal-400 uppercase block font-semibold tracking-wider">Alat Sedang Disewa</span>
                                <span className="text-2xl font-extrabold font-heading text-slate-900 dark:text-white mt-1 block">{metrics.active_rentals || 0}</span>
                            </div>
                            <div onClick={() => setActiveTab('internships')} className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/30 cursor-pointer hover:border-purple-400 dark:hover:border-purple-500/60 transition-all shadow-sm">
                                <span className="text-[11px] text-purple-700 dark:text-purple-400 uppercase block font-semibold tracking-wider">Pelamar Magang</span>
                                <span className="text-2xl font-extrabold font-heading text-slate-900 dark:text-white mt-1 block">{metrics.internship_applicants || 0}</span>
                            </div>
                            <div onClick={() => setActiveTab('collaborations')} className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 cursor-pointer hover:border-rose-400 dark:hover:border-rose-500/60 transition-all hover:scale-[1.02] shadow-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] text-rose-700 dark:text-rose-400 uppercase block font-semibold tracking-wider">Kerja Sama & B2B</span>
                                    <Handshake className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
                                </div>
                                <span className="text-2xl font-extrabold font-heading text-slate-900 dark:text-white mt-1 block">{metrics.total_collaborations || collaborations.length}</span>
                                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block mt-0.5">{metrics.pending_collaborations || 0} Perlu Respon</span>
                            </div>
                            <div onClick={() => setActiveTab('galleries')} className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 cursor-pointer hover:border-amber-400 dark:hover:border-amber-500/60 transition-all shadow-sm">
                                <span className="text-[11px] text-amber-700 dark:text-amber-400 uppercase block font-semibold tracking-wider">Koleksi Galeri</span>
                                <span className="text-2xl font-extrabold font-heading text-slate-900 dark:text-white mt-1 block">{metrics.total_galleries || 0}</span>
                            </div>
                            <div onClick={() => setActiveTab('rentals')} className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 cursor-pointer hover:border-emerald-400 dark:hover:border-emerald-500/60 transition-all shadow-sm">
                                <span className="text-[11px] text-emerald-700 dark:text-emerald-400 uppercase block font-semibold tracking-wider">Katalog Rental</span>
                                <span className="text-2xl font-extrabold font-heading text-slate-900 dark:text-white mt-1 block">{metrics.total_equipments || 0}</span>
                            </div>
                        </div>

                        {/* Interactive Animated Analytics Charts (Curved Spline Wave + 7-Divisions Donut + Velocity Meters) */}
                        <ExecutiveAnalyticsCharts
                            metrics={metrics}
                            serviceTickets={serviceTickets}
                            rentalBookings={rentalBookings}
                            internshipApplications={internshipApplications}
                            collaborations={collaborations}
                            galleries={galleries}
                            recentConsultations={recentConsultations}
                            services={services}
                        />

                        {/* Recent Consultations Table */}
                        <div className="p-6 rounded-3xl bg-white dark:bg-[#090D16] border border-slate-200/90 dark:border-white/10 shadow-sm dark:shadow-xl space-y-4 transition-colors">
                            <div className="flex items-center justify-between">
                                <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                                    <Ticket className="w-5 h-5 text-cyan-500 dark:text-cyan-400" />
                                    <span>Jadwal Konsultasi Terbaru Masuk</span>
                                </h3>
                                <button onClick={() => setActiveTab('consultations')} className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline">
                                    Lihat Semua →
                                </button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs font-sans">
                                    <thead className="border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-semibold tracking-wider">
                                        <tr>
                                            <th className="py-2.5 px-3">No. Tiket</th>
                                            <th className="py-2.5 px-3">Klien & Instansi</th>
                                            <th className="py-2.5 px-3">Topik</th>
                                            <th className="py-2.5 px-3">Metode</th>
                                            <th className="py-2.5 px-3">Jadwal</th>
                                            <th className="py-2.5 px-3">Status</th>
                                            <th className="py-2.5 px-3">Follow-Up</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-slate-700 dark:text-slate-300">
                                        {recentConsultations.map((c) => (
                                            <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02]">
                                                <td className="py-3 px-3 font-bold text-cyan-600 dark:text-cyan-400">{c.ticket_code}</td>
                                                <td className="py-3 px-3">
                                                    <span className="font-bold text-slate-900 dark:text-white block">{c.client_name}</span>
                                                    <span className="text-[10px] text-slate-500">{c.company_or_institution || '-'}</span>
                                                </td>
                                                <td className="py-3 px-3 text-slate-700 dark:text-slate-200">{c.service_topic}</td>
                                                <td className="py-3 px-3">
                                                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 text-[10px]">
                                                        {c.meeting_method === 'online_meet' ? 'Online Meet' : 'Studio'}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-3 text-slate-600 dark:text-slate-400">{c.preferred_date} ({c.preferred_time})</td>
                                                <td className="py-3 px-3">
                                                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold uppercase text-[10px]">
                                                        {c.status}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-3">
                                                    <a
                                                        href={`https://wa.me/${c.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Halo ${c.client_name}, kami dari Langit mengonfirmasi tiket konsultasi ${c.ticket_code}`)}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="px-2.5 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center gap-1 w-fit font-semibold"
                                                    >
                                                        <Phone className="w-3 h-3" />
                                                        <span>WA</span>
                                                    </a>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Recent Collaborations Table */}
                        <div className="p-6 rounded-3xl bg-white dark:bg-[#090D16] border border-slate-200/90 dark:border-white/10 shadow-sm dark:shadow-xl space-y-4 transition-colors">
                            <div className="flex items-center justify-between">
                                <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                                    <Handshake className="w-5 h-5 text-rose-500 dark:text-rose-400" />
                                    <span>Pengajuan Proposal Kerja Sama Terbaru</span>
                                </h3>
                                <button onClick={() => setActiveTab('collaborations')} className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline">
                                    Kelola Semua Proposal ({collaborations.length}) →
                                </button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs font-sans">
                                    <thead className="border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-semibold tracking-wider">
                                        <tr>
                                            <th className="py-2.5 px-3">Instansi / Perusahaan</th>
                                            <th className="py-2.5 px-3">PIC Penanggung Jawab</th>
                                            <th className="py-2.5 px-3">Skema Kemitraan</th>
                                            <th className="py-2.5 px-3">Target Waktu</th>
                                            <th className="py-2.5 px-3">Status</th>
                                            <th className="py-2.5 px-3">Proposal</th>
                                            <th className="py-2.5 px-3">Follow-Up</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-slate-700 dark:text-slate-300">
                                        {collaborations.slice(0, 5).map((c) => {
                                            const typeInfo = getCollabTypeInfo(c.collab_type);
                                            return (
                                                <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02]">
                                                    <td className="py-3 px-3">
                                                        <span className="font-bold text-slate-900 dark:text-white block">{c.organization_name}</span>
                                                        <span className="text-[10px] text-slate-500 font-medium">{c.email}</span>
                                                    </td>
                                                    <td className="py-3 px-3 text-slate-800 dark:text-slate-200 font-semibold">{c.pic_name}</td>
                                                    <td className="py-3 px-3">
                                                        <span className={`px-2 py-0.5 rounded text-[10px] border font-medium ${typeInfo.color}`}>
                                                            {typeInfo.label}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-3 text-slate-600 dark:text-slate-400 font-medium">
                                                        {c.event_date ? new Date(c.event_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Fleksibel'}
                                                    </td>
                                                    <td className="py-3 px-3">
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                                            c.status === 'approved' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' :
                                                            c.status === 'in_discussion' ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400' :
                                                            c.status === 'declined' ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400' :
                                                            'bg-blue-500/20 text-blue-600 dark:text-blue-400'
                                                        }`}>
                                                            {c.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-3">
                                                        {c.proposal_pdf_path ? (
                                                            <a
                                                                href={c.proposal_pdf_path}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 font-bold"
                                                            >
                                                                <FileText className="w-3.5 h-3.5" />
                                                                <span>PDF</span>
                                                            </a>
                                                        ) : (
                                                            <span className="text-slate-400 dark:text-slate-600">-</span>
                                                        )}
                                                    </td>
                                                    <td className="py-3 px-3">
                                                        <a
                                                            href={`https://wa.me/${c.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Halo ${c.pic_name} (${c.organization_name}), kami dari Tim Partnership Langit ingin berdiskusi mengenai proposal kerja sama Anda.`)}`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="px-2.5 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center gap-1 w-fit font-semibold"
                                                        >
                                                            <Phone className="w-3 h-3" />
                                                            <span>WA</span>
                                                        </a>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {collaborations.length === 0 && (
                                            <tr>
                                                <td colSpan="7" className="py-6 text-center text-slate-500 font-medium">
                                                    Belum ada berkas proposal kerja sama yang masuk.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 2: COMPUTER SERVICE TICKETS (PRD 6.5) */}
                {activeTab === 'tickets' && (
                    <div className="space-y-6">
                        <div className="p-6 rounded-3xl bg-white dark:bg-[#090D16] border border-slate-200/90 dark:border-white/10 shadow-sm dark:shadow-xl">
                            {/* Card Header with Action Button */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 mb-5 border-b border-slate-100 dark:border-white/10">
                                <div>
                                    <h2 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                                        <Cpu className="w-5 h-5 text-orange-500" />
                                        <span>Daftar Tiket & Nota Servis Komputer</span>
                                    </h2>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                        Kelola tahapan pengerjaan hardware/software, estimasi biaya, dan pelacakan pelanggan live.
                                    </p>
                                </div>
                                <button
                                    onClick={() => setTicketModalOpen(true)}
                                    className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-orange-500/25 transition-transform active:scale-95 shrink-0 self-start sm:self-auto"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>+ Buat Nota Servis Baru</span>
                                </button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs font-sans">
                                    <thead className="border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-semibold tracking-wider">
                                        <tr>
                                            <th className="py-3 px-3">Nota Servis</th>
                                            <th className="py-3 px-3">Pelanggan</th>
                                            <th className="py-3 px-3">Perangkat</th>
                                            <th className="py-3 px-3">Keluhan</th>
                                            <th className="py-3 px-3">Tahap Perbaikan (Update Live)</th>
                                            <th className="py-3 px-3">Biaya</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-slate-700 dark:text-slate-300">
                                        {serviceTickets.map((t) => (
                                            <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                                                <td className="py-3.5 px-3 font-bold text-orange-600 dark:text-orange-400 tracking-wide">{t.receipt_number}</td>
                                                <td className="py-3.5 px-3">
                                                    <span className="font-bold text-slate-900 dark:text-white block">{t.customer_name}</span>
                                                    <span className="text-[10px] text-slate-500 font-medium">{t.whatsapp}</span>
                                                </td>
                                                <td className="py-3.5 px-3">
                                                    <span className="text-slate-800 dark:text-slate-200 block font-semibold">{t.device_brand_model}</span>
                                                    <span className="text-[10px] text-slate-500 font-medium">{t.device_type}</span>
                                                </td>
                                                <td className="py-3.5 px-3 max-w-xs truncate text-slate-600 dark:text-slate-400 font-medium">{t.problem_reported}</td>
                                                <td className="py-3.5 px-3">
                                                    {/* Pipeline Status Selector */}
                                                    <select
                                                        value={t.status}
                                                        onChange={(e) => handleUpdateTicketStatus(t.id, e.target.value)}
                                                        className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-orange-500/40 text-orange-700 dark:text-orange-300 font-bold text-xs uppercase focus:outline-none"
                                                    >
                                                        <option value="received">Diterima & Diagnosa</option>
                                                        <option value="waiting_part">Menunggu Sparepart</option>
                                                        <option value="repairing">Dalam Perbaikan</option>
                                                        <option value="qc_testing">Uji Fungsi (QC)</option>
                                                        <option value="ready">Siap Diambil</option>
                                                        <option value="completed">Selesai / Diambil</option>
                                                    </select>
                                                </td>
                                                <td className="py-3.5 px-3 font-bold text-emerald-600 dark:text-emerald-400">
                                                    {formatRupiah(t.final_cost || t.estimated_cost)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 3: RENTAL GEAR & BOOKINGS (PRD 6.4) */}
                {activeTab === 'rentals' && (
                    <div className="space-y-6">
                        <div className="p-6 rounded-3xl bg-white dark:bg-[#090D16] border border-slate-200/90 dark:border-white/10 shadow-sm dark:shadow-xl">
                            <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white mb-4">Daftar Booking Sewa Alat</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs font-sans">
                                    <thead className="border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-semibold tracking-wider">
                                        <tr>
                                            <th className="py-3 px-3">Kode Booking</th>
                                            <th className="py-3 px-3">Penyewa</th>
                                            <th className="py-3 px-3">Durasi</th>
                                            <th className="py-3 px-3">Item Sewa</th>
                                            <th className="py-3 px-3">Total Biaya</th>
                                            <th className="py-3 px-3">Status Booking</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-slate-700 dark:text-slate-300">
                                        {rentalBookings.map((b) => (
                                            <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                                                <td className="py-3 px-3 font-bold text-teal-600 dark:text-teal-400">{b.booking_code}</td>
                                                <td className="py-3 px-3">
                                                    <span className="font-bold text-slate-900 dark:text-white block">{b.customer_name}</span>
                                                    <span className="text-[10px] text-slate-500">{b.whatsapp} • {b.identity_card_type}</span>
                                                </td>
                                                <td className="py-3 px-3 text-slate-700 dark:text-slate-300">
                                                    {b.total_days} Hari ({b.start_date} s/d {b.end_date})
                                                </td>
                                                <td className="py-3 px-3 text-slate-600 dark:text-slate-400 max-w-xs truncate">
                                                    {(b.rented_items_json || []).map(i => `${i.name} (${i.qty}x)`).join(', ')}
                                                </td>
                                                <td className="py-3 px-3 font-bold text-emerald-600 dark:text-emerald-400">
                                                    {formatRupiah(b.total_price)}
                                                </td>
                                                <td className="py-3 px-3">
                                                    <select
                                                        value={b.status}
                                                        onChange={(e) => handleUpdateRentalStatus(b.id, e.target.value)}
                                                        className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-teal-500/40 text-teal-700 dark:text-teal-300 font-bold text-xs uppercase focus:outline-none"
                                                    >
                                                        <option value="pending">Pending Approval</option>
                                                        <option value="approved">Approved</option>
                                                        <option value="picked_up">Picked Up (Alat Dibawa)</option>
                                                        <option value="returned">Returned (Dikembalikan)</option>
                                                        <option value="cancelled">Cancelled</option>
                                                    </select>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 4: GALLERIES & EXIF MEDIA (PRD 6.2) */}
                {activeTab === 'galleries' && (
                    <div className="space-y-6">
                        {/* Service Cockpit Header */}
                        <div className="p-6 rounded-3xl bg-white dark:bg-[#090D16] border border-slate-200/90 dark:border-white/10 shadow-sm dark:shadow-xl space-y-4 transition-colors">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-center gap-3.5">
                                    <div
                                        className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-md"
                                        style={{ backgroundColor: `${activeServiceInfo.color}20`, border: `1px solid ${activeServiceInfo.color}40` }}
                                    >
                                        {React.createElement(activeServiceInfo.icon, {
                                            className: 'w-6 h-6',
                                            style: { color: activeServiceInfo.color }
                                        })}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h2 className="font-heading font-extrabold text-xl text-slate-900 dark:text-white">
                                                {activeServiceInfo.name}
                                            </h2>
                                            <span
                                                className="px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide border shadow-xs"
                                                style={{ backgroundColor: `${activeServiceInfo.color}15`, borderColor: `${activeServiceInfo.color}40`, color: activeServiceInfo.color }}
                                            >
                                                {activeServiceInfo.badge}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                                            {activeServiceInfo.subtitle}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 flex-wrap">
                                    {selectedGalleryService !== 'all' && (
                                        <Link
                                            href={`/layanan/${selectedGalleryService}`}
                                            target="_blank"
                                            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                                        >
                                            <ExternalLink className="w-3.5 h-3.5" />
                                            <span>Lihat di Halaman Layanan</span>
                                        </Link>
                                    )}

                                    <button
                                        onClick={() => {
                                            const matchedService = services.find(s => s.slug === selectedGalleryService);
                                            setNewGalleryData({
                                                title: '',
                                                service_id: matchedService ? matchedService.id : '',
                                                category: selectedGalleryService !== 'all' ? selectedGalleryService : 'general',
                                                media_type: 'photo',
                                                file_webp_path: '',
                                                camera: 'Sony FX3 Cinema Line',
                                                lens: 'Sony FE 24-70mm F2.8 GM II',
                                                shutter: '1/500s',
                                                aperture: 'f/2.8',
                                                iso: '100',
                                            });
                                            setNewGalleryFilePhoto(null);
                                            setGalleryModalOpen(true);
                                        }}
                                        className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/25 transition-transform active:scale-95"
                                    >
                                        <Plus className="w-4 h-4" />
                                        <span>+ Upload Foto Baru</span>
                                    </button>
                                </div>
                            </div>

                            {/* Service Quick-Switch Tabs & Sub-Category Pills */}
                            <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs font-medium">
                                    <span className="text-[11px] text-slate-500 dark:text-slate-400 mr-1 flex items-center gap-1">
                                        <Filter className="w-3.5 h-3.5" /> Kategori:
                                    </span>
                                    <button
                                        onClick={() => setGallerySubCategoryFilter('all')}
                                        className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                                            gallerySubCategoryFilter === 'all'
                                                ? 'bg-amber-500 text-slate-950 font-bold shadow'
                                                : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                        }`}
                                    >
                                        Semua ({getServiceGalleryCount(selectedGalleryService)})
                                    </button>
                                    {availableSubCategories.map((cat) => (
                                        <button
                                            key={cat}
                                            onClick={() => setGallerySubCategoryFilter(cat)}
                                            className={`px-3 py-1 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all shrink-0 ${
                                                gallerySubCategoryFilter === cat
                                                    ? 'bg-amber-500 text-slate-950 font-bold shadow'
                                                    : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                            }`}
                                        >
                                            {cat.replace(/_/g, ' ')}
                                        </button>
                                    ))}
                                </div>

                                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 shrink-0">
                                    Menampilkan {filteredGalleries.length} foto
                                </span>
                            </div>
                        </div>

                        {/* SPECIAL HIGHLIGHT CARDS: Showreel Video & Before/After Slider (Photography & Videography) */}
                        {(selectedGalleryService === 'photography-videography' || selectedGalleryService === 'all') && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {/* Card 1: Video Showreel Showcase */}
                                <div className="p-5 rounded-3xl bg-gradient-to-br from-amber-500/10 via-slate-900/40 to-slate-950 border border-amber-500/30 dark:border-amber-500/20 shadow-xl flex flex-col justify-between space-y-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                                                <Film className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-mono font-bold uppercase tracking-wider border border-amber-500/30">
                                                        Header Video Showcase
                                                    </span>
                                                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                                                        Cinema Showreel
                                                    </span>
                                                </div>
                                                <h4 className="font-heading font-extrabold text-sm text-slate-900 dark:text-white mt-0.5">
                                                    {currentShowreelItem?.title || "Visual Sinematik Kelas Dunia."}
                                                </h4>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={openShowreelModal}
                                            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-transform active:scale-95 cursor-pointer shrink-0"
                                        >
                                            <Upload className="w-3.5 h-3.5" />
                                            <span>Upload Video dari PC</span>
                                        </button>
                                    </div>

                                    <div className="relative rounded-2xl overflow-hidden aspect-[21/9] bg-black/60 border border-white/10 flex items-center justify-center group">
                                        {currentShowreelItem?.video_url ? (
                                            <video
                                                src={currentShowreelItem.video_url}
                                                poster={currentShowreelItem.file_webp_path || "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1600&q=80"}
                                                controls
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <>
                                                <img
                                                    src={currentShowreelItem?.file_webp_path || "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1600&q=80"}
                                                    alt="Showreel Poster"
                                                    className="w-full h-full object-cover opacity-60"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />
                                                <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center pointer-events-none">
                                                    <div className="w-10 h-10 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-lg mb-1">
                                                        <Play className="w-5 h-5 fill-slate-950 ml-0.5" />
                                                    </div>
                                                    <span className="text-xs font-bold text-white">Video Showreel Aktif di Website</span>
                                                    <span className="text-[10px] text-slate-300">Klik "Upload Video dari PC" untuk mengganti</span>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-white/5">
                                        <span className="truncate max-w-[280px]">
                                            Status: <strong className="text-slate-700 dark:text-slate-200">{currentShowreelItem?.video_url ? 'File Video Kustom Aktif' : 'Default Cinematic Demo Reel'}</strong>
                                        </span>
                                        <span className="text-amber-500 font-semibold font-mono">
                                            Format: MP4, MOV, WebM
                                        </span>
                                    </div>
                                </div>

                                {/* Card 2: Interactive Before / After Color Grading */}
                                <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-500/10 via-slate-900/40 to-slate-950 border border-indigo-500/30 dark:border-indigo-500/20 shadow-xl flex flex-col justify-between space-y-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/30">
                                                <SlidersHorizontal className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 text-[10px] font-mono font-bold uppercase tracking-wider border border-indigo-500/30">
                                                        Before / After Slider
                                                    </span>
                                                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                                                        DaVinci Color Science
                                                    </span>
                                                </div>
                                                <h4 className="font-heading font-extrabold text-sm text-slate-900 dark:text-white mt-0.5">
                                                    {currentBeforeAfterItem?.title || "Interactive Before / After Color Grading"}
                                                </h4>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={openBeforeAfterModal}
                                            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-400 hover:to-sky-400 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-500/20 transition-transform active:scale-95 cursor-pointer shrink-0"
                                        >
                                            <RefreshCw className="w-3.5 h-3.5" />
                                            <span>Ganti Foto Before / After</span>
                                        </button>
                                    </div>

                                    {/* Split Preview */}
                                    <div className="grid grid-cols-2 gap-2 rounded-2xl overflow-hidden aspect-[21/9] bg-black/60 border border-white/10 p-1">
                                        <div className="relative rounded-xl overflow-hidden bg-slate-900">
                                            <img
                                                src={currentBeforeAfterItem?.before_file_path || "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1400&q=80"}
                                                alt="Before RAW Flat"
                                                className="w-full h-full object-cover"
                                            />
                                            <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-md bg-black/70 text-[9px] font-mono text-amber-300 backdrop-blur-md">
                                                {currentBeforeAfterItem?.exif_metadata_json?.before_label || "RAW Flat (Before)"}
                                            </span>
                                        </div>
                                        <div className="relative rounded-xl overflow-hidden bg-slate-900">
                                            <img
                                                src={currentBeforeAfterItem?.file_webp_path || "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1400&q=80"}
                                                alt="After Cinema Grade"
                                                className="w-full h-full object-cover"
                                            />
                                            <span className="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded-md bg-black/70 text-[9px] font-mono text-cyan-300 backdrop-blur-md">
                                                {currentBeforeAfterItem?.exif_metadata_json?.after_label || "Cinema Grade (After)"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-white/5">
                                        <span>
                                            Status: <strong className="text-emerald-500 font-semibold">Tampil Aktif di Website</strong>
                                        </span>
                                        <span className="text-indigo-400 font-medium">
                                            Upload Foto dari PC / Tautan URL
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Gallery Cards Grid */}
                        {filteredGalleries.length === 0 ? (
                            <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#090D16] border border-slate-200/90 dark:border-white/10 space-y-3">
                                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
                                    <Camera className="w-7 h-7" />
                                </div>
                                <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white">
                                    Belum Ada Foto untuk {activeServiceInfo.name}
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                                    Belum ada foto yang di-upload atau dipasangkan untuk layanan ini. Anda dapat menambahkan foto baru sekarang.
                                </p>
                                <button
                                    onClick={() => {
                                        const matchedService = services.find(s => s.slug === selectedGalleryService);
                                        setNewGalleryData({
                                            title: `Dokumentasi ${activeServiceInfo.name}`,
                                            service_id: matchedService ? matchedService.id : '',
                                            category: selectedGalleryService !== 'all' ? selectedGalleryService : 'general',
                                            media_type: 'photo',
                                            file_webp_path: '',
                                            camera: 'Sony FX3 Cinema Line',
                                            lens: 'Sony FE 24-70mm F2.8 GM II',
                                            shutter: '1/500s',
                                            aperture: 'f/2.8',
                                            iso: '100',
                                        });
                                        setGalleryModalOpen(true);
                                    }}
                                    className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs inline-flex items-center gap-2 shadow-lg shadow-amber-500/25"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>Upload Foto Pertama</span>
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                                {filteredGalleries.map((g) => {
                                    const serviceOfGallery = g.service || services.find(s => s.id === g.service_id);
                                    const serviceInfo = serviceNavItems.find(s => s.slug === serviceOfGallery?.slug) || serviceNavItems[1];

                                    return (
                                        <div
                                            key={g.id}
                                            className="p-3.5 rounded-2xl bg-white dark:bg-[#090D16] border border-slate-200/90 dark:border-white/10 group hover:border-amber-400/50 dark:hover:border-amber-500/50 shadow-sm dark:shadow-lg flex flex-col justify-between transition-all"
                                        >
                                            <div>
                                                {/* Image Preview & Badges */}
                                                <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-slate-950 mb-3 border border-slate-100 dark:border-white/5">
                                                    <img
                                                        src={g.file_webp_path}
                                                        alt={g.title}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80';
                                                        }}
                                                    />

                                                    {/* Top Badges */}
                                                    <div className="absolute top-2 left-2 flex items-center gap-1.5 flex-wrap">
                                                        <span
                                                            className="px-2 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider text-white shadow-md backdrop-blur-md"
                                                            style={{ backgroundColor: `${serviceInfo.color}CC` }}
                                                        >
                                                            {serviceInfo.badge}
                                                        </span>
                                                    </div>

                                                    <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/75 text-[9px] font-semibold text-amber-300 backdrop-blur-md uppercase tracking-wider">
                                                        {g.category}
                                                    </span>

                                                    {/* Bottom Media Type Indicator */}
                                                    {g.media_type === 'before_after' && (
                                                        <span className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-cyan-500/90 text-slate-950 text-[9px] font-bold">
                                                            Before/After
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Title & Service */}
                                                <h4 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors" title={g.title}>
                                                    {g.title}
                                                </h4>
                                                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block mt-0.5 truncate">
                                                    {serviceOfGallery?.name || 'Langit Multi-Division'}
                                                </span>

                                                {/* EXIF / Specs Metadata Pill */}
                                                <div className="mt-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-white/5 space-y-1 text-[11px] font-sans">
                                                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                                                        <span className="text-slate-400 dark:text-slate-500 font-medium">Kamera:</span>
                                                        <span className="font-semibold truncate max-w-[140px] text-right text-slate-800 dark:text-slate-200">{g.exif_metadata_json?.camera || 'Sony FX3'}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                                                        <span className="text-slate-400 dark:text-slate-500 font-medium">Lensa:</span>
                                                        <span className="font-semibold truncate max-w-[140px] text-right text-slate-800 dark:text-slate-200">{g.exif_metadata_json?.lens || '24-70mm GM II'}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                                                        <span className="text-slate-400 dark:text-slate-500 font-medium">Shutter / Spek:</span>
                                                        <span className="font-semibold text-slate-800 dark:text-slate-200">{g.exif_metadata_json?.shutter || '1/500s'}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action Bar: Ganti Foto & Edit EXIF */}
                                            <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-white/5 flex items-center justify-between gap-1.5">
                                                <button
                                                    onClick={() => openEditPhotoModal(g)}
                                                    className="flex-1 py-1.5 px-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] flex items-center justify-center gap-1.5 shadow-sm transition-transform active:scale-95"
                                                    title="Ganti Foto Ini"
                                                >
                                                    <RefreshCw className="w-3.5 h-3.5" />
                                                    <span>Ganti Foto</span>
                                                </button>

                                                <button
                                                    onClick={() => openEditPhotoModal(g)}
                                                    className="p-1.5 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300 transition-colors"
                                                    title="Edit Metadata EXIF"
                                                >
                                                    <Edit3 className="w-3.5 h-3.5" />
                                                </button>

                                                <button
                                                    onClick={() => handleDeleteGallery(g.id)}
                                                    className="p-1.5 rounded-xl text-rose-500 dark:text-rose-400 hover:bg-rose-500/10 transition-colors"
                                                    title="Hapus Foto"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 5: INTERNSHIP APPLICANTS (PRD 6.6) */}
                {activeTab === 'internships' && (
                    <div className="space-y-6">
                        <div className="p-6 rounded-3xl bg-white dark:bg-[#090D16] border border-slate-200/90 dark:border-white/10 shadow-sm dark:shadow-xl">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs font-sans">
                                    <thead className="border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-semibold tracking-wider">
                                        <tr>
                                            <th className="py-3 px-3">Nama Pelamar</th>
                                            <th className="py-3 px-3">Instansi & Jurusan</th>
                                            <th className="py-3 px-3">Posisi</th>
                                            <th className="py-3 px-3">Berkas CV & Portofolio</th>
                                            <th className="py-3 px-3">Status Review</th>
                                            <th className="py-3 px-3">Kontak</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-slate-700 dark:text-slate-300">
                                        {internshipApplications.map((app) => (
                                            <tr key={app.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                                                <td className="py-3.5 px-3">
                                                    <span className="font-bold text-slate-900 dark:text-white block">{app.full_name}</span>
                                                    <span className="text-[10px] text-slate-500 font-medium">{app.email}</span>
                                                </td>
                                                <td className="py-3.5 px-3">
                                                    <span className="text-slate-800 dark:text-slate-200 block font-semibold">{app.institution_name}</span>
                                                    <span className="text-[10px] text-slate-500 font-medium">{app.major}</span>
                                                </td>
                                                <td className="py-3.5 px-3 text-purple-700 dark:text-purple-300 font-bold">
                                                    {app.position?.title || 'Divisi Terkait'}
                                                </td>
                                                <td className="py-3.5 px-3">
                                                    <div className="flex items-center gap-2">
                                                        {app.cv_pdf_path ? (
                                                            <a
                                                                href={app.cv_pdf_path}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="px-2 py-1 rounded bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 hover:underline text-[10px] font-semibold"
                                                            >
                                                                Buka CV PDF
                                                            </a>
                                                        ) : (
                                                            <span className="text-slate-400 dark:text-slate-600 text-[10px]">-</span>
                                                        )}
                                                        {app.portfolio_url && (
                                                            <a
                                                                href={app.portfolio_url}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="text-cyan-600 dark:text-cyan-400 hover:underline text-[10px] font-semibold"
                                                            >
                                                                Portofolio ↗
                                                            </a>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-3.5 px-3">
                                                    <select
                                                        value={app.status}
                                                        onChange={(e) => handleUpdateInternshipStatus(app.id, e.target.value)}
                                                        className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-purple-500/40 text-purple-700 dark:text-purple-300 font-bold text-xs uppercase focus:outline-none"
                                                    >
                                                        <option value="submitted">Submitted</option>
                                                        <option value="reviewed">Reviewed</option>
                                                        <option value="interview">Interview</option>
                                                        <option value="accepted">Accepted (Diterima)</option>
                                                        <option value="rejected">Rejected</option>
                                                    </select>
                                                </td>
                                                <td className="py-3.5 px-3">
                                                    <a
                                                        href={`https://wa.me/${app.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Halo ${app.full_name}, kami dari Langit mengonfirmasi lamaran magang Anda.`)}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="px-2.5 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center gap-1 w-fit font-semibold"
                                                    >
                                                        <Phone className="w-3 h-3" />
                                                        <span>WA</span>
                                                    </a>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 6: CONSULTATIONS & PROPOSALS (PRD 6.7) */}
                {activeTab === 'consultations' && (
                    <div className="space-y-6">
                        <div className="p-6 rounded-3xl bg-white dark:bg-[#090D16] border border-slate-200/90 dark:border-white/10 shadow-sm dark:shadow-xl">
                            <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white mb-4">Seluruh Tiket Jadwal Konsultasi Klien</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs font-sans">
                                    <thead className="border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-semibold tracking-wider">
                                        <tr>
                                            <th className="py-3 px-3">Tiket</th>
                                            <th className="py-3 px-3">Klien & Instansi</th>
                                            <th className="py-3 px-3">Topik & Brief</th>
                                            <th className="py-3 px-3">Jadwal & Metode</th>
                                            <th className="py-3 px-3">Budget</th>
                                            <th className="py-3 px-3">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-slate-700 dark:text-slate-300">
                                        {recentConsultations.map((c) => (
                                            <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                                                <td className="py-3.5 px-3 font-bold text-cyan-600 dark:text-cyan-400 tracking-wide">{c.ticket_code}</td>
                                                <td className="py-3.5 px-3">
                                                    <span className="font-bold text-slate-900 dark:text-white block">{c.client_name}</span>
                                                    <span className="text-[10px] text-slate-500 font-medium">{c.company_or_institution} • {c.whatsapp}</span>
                                                </td>
                                                <td className="py-3.5 px-3 max-w-xs">
                                                    <span className="text-cyan-700 dark:text-cyan-300 font-semibold block">{c.service_topic}</span>
                                                    <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate block font-medium">{c.project_brief || '-'}</span>
                                                </td>
                                                <td className="py-3.5 px-3">
                                                    <span className="text-slate-800 dark:text-slate-200 block font-semibold">{c.preferred_date}</span>
                                                    <span className="text-[10px] text-slate-500 font-medium">{c.preferred_time} • {c.meeting_method}</span>
                                                </td>
                                                <td className="py-3.5 px-3 text-amber-600 dark:text-amber-300 font-semibold">
                                                    {c.budget_estimation || '-'}
                                                </td>
                                                <td className="py-3.5 px-3">
                                                    <select
                                                        value={c.status}
                                                        onChange={(e) => handleUpdateConsultationStatus(c.id, e.target.value)}
                                                        className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-cyan-500/40 text-cyan-700 dark:text-cyan-300 font-bold text-xs uppercase focus:outline-none"
                                                    >
                                                        <option value="scheduled">Scheduled</option>
                                                        <option value="completed">Completed</option>
                                                        <option value="rescheduled">Rescheduled</option>
                                                        <option value="cancelled">Cancelled</option>
                                                    </select>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 7: COLLABORATION PROPOSALS (B2B & KEMITRAAN) */}
                {activeTab === 'collaborations' && (
                    <div className="space-y-6">
                        {/* Header Filters & Stats */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-[#090D16] border border-slate-200/90 dark:border-white/10 shadow-sm dark:shadow-md">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mr-1 flex items-center gap-1.5">
                                    <Filter className="w-3.5 h-3.5" /> Filter Status:
                                </span>
                                {[
                                    { id: 'all', label: 'Semua', count: collaborations.length },
                                    { id: 'new', label: 'Baru Masuk', count: collaborations.filter(c => c.status === 'new').length },
                                    { id: 'in_discussion', label: 'Sedang Diskusi', count: collaborations.filter(c => c.status === 'in_discussion').length },
                                    { id: 'approved', label: 'Disetujui', count: collaborations.filter(c => c.status === 'approved').length },
                                    { id: 'declined', label: 'Ditolak', count: collaborations.filter(c => c.status === 'declined').length },
                                ].map(f => (
                                    <button
                                        key={f.id}
                                        onClick={() => setCollabFilter(f.id)}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                                            collabFilter === f.id
                                                ? 'bg-rose-500 text-white font-bold shadow-lg shadow-rose-500/25'
                                                : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10'
                                        }`}
                                    >
                                        {f.label} ({f.count})
                                    </button>
                                ))}
                            </div>

                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                Menampilkan {filteredCollaborations.length} dari {collaborations.length} pengajuan
                            </span>
                        </div>

                        {/* Collaborations Table */}
                        <div className="p-6 rounded-3xl bg-white dark:bg-[#090D16] border border-slate-200/90 dark:border-white/10 shadow-sm dark:shadow-xl">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs font-sans">
                                    <thead className="border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-semibold tracking-wider">
                                        <tr>
                                            <th className="py-3 px-3">Instansi / Perusahaan</th>
                                            <th className="py-3 px-3">PIC Penanggung Jawab</th>
                                            <th className="py-3 px-3">Skema Kerja Sama</th>
                                            <th className="py-3 px-3">Target Tanggal</th>
                                            <th className="py-3 px-3">Berkas Proposal</th>
                                            <th className="py-3 px-3">Status Pipeline</th>
                                            <th className="py-3 px-3 text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-slate-700 dark:text-slate-300">
                                        {filteredCollaborations.length === 0 ? (
                                            <tr>
                                                <td colSpan="7" className="py-8 text-center text-slate-500 font-medium">
                                                    Belum ada berkas proposal kerja sama dengan filter ini.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredCollaborations.map((c) => {
                                                const typeInfo = getCollabTypeInfo(c.collab_type);
                                                return (
                                                    <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                                                        <td className="py-3.5 px-3">
                                                            <span className="font-bold text-slate-900 dark:text-white block text-sm">{c.organization_name}</span>
                                                            <span className="text-[10px] text-slate-500 block font-medium">
                                                                Diterima: {c.created_at ? new Date(c.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                                                            </span>
                                                        </td>
                                                        <td className="py-3.5 px-3">
                                                            <span className="text-slate-800 dark:text-slate-200 font-semibold block">{c.pic_name}</span>
                                                            <span className="text-[10px] text-slate-500 block">{c.email}</span>
                                                            <a
                                                                href={`https://wa.me/${c.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Halo ${c.pic_name} (${c.organization_name}), kami dari Tim Partnership Langit ingin berdiskusi terkait proposal kerja sama yang diajukan.`)}`}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="inline-flex items-center gap-1.5 mt-1 px-2 py-0.5 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] transition-colors font-semibold"
                                                            >
                                                                <Phone className="w-3 h-3" />
                                                                <span>{c.whatsapp}</span>
                                                            </a>
                                                        </td>
                                                        <td className="py-3.5 px-3">
                                                            <span className={`inline-block px-2.5 py-1 rounded-lg border text-[11px] font-medium ${typeInfo.color}`}>
                                                                {typeInfo.label}
                                                            </span>
                                                        </td>
                                                        <td className="py-3.5 px-3 text-slate-700 dark:text-slate-300">
                                                            {c.event_date ? (
                                                                <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                                                                    <Calendar className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
                                                                    <span>{new Date(c.event_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                                                </div>
                                                            ) : (
                                                                <span className="text-slate-400 dark:text-slate-500 italic">Fleksibel / Sesuai Kesepakatan</span>
                                                            )}
                                                        </td>
                                                        <td className="py-3.5 px-3">
                                                            {c.proposal_pdf_path ? (
                                                                <a
                                                                    href={c.proposal_pdf_path}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-500/15 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-500/25 transition-all text-[11px] font-bold"
                                                                >
                                                                    <FileText className="w-3.5 h-3.5" />
                                                                    <span>Unduh PDF</span>
                                                                </a>
                                                            ) : (
                                                                <span className="text-slate-400 dark:text-slate-600 italic text-[11px]">Tanpa Berkas PDF</span>
                                                            )}
                                                        </td>
                                                        <td className="py-3.5 px-3">
                                                            <select
                                                                value={c.status}
                                                                onChange={(e) => handleUpdateCollaborationStatus(c.id, e.target.value)}
                                                                className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-rose-500/40 text-rose-700 dark:text-rose-300 font-bold text-xs uppercase focus:outline-none"
                                                            >
                                                                <option value="new">Baru Masuk</option>
                                                                <option value="in_discussion">Sedang Diskusi</option>
                                                                <option value="approved">Disetujui</option>
                                                                <option value="declined">Ditolak</option>
                                                            </select>
                                                        </td>
                                                        <td className="py-3.5 px-3 text-right">
                                                            <div className="flex items-center justify-end gap-1.5">
                                                                <button
                                                                    onClick={() => setSelectedCollabDetail(c)}
                                                                    className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-800 dark:text-white flex items-center gap-1 text-[11px] transition-colors font-medium"
                                                                    title="Lihat Detail Lengkap"
                                                                >
                                                                    <Eye className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                                                                    <span>Detail</span>
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteCollaboration(c.id)}
                                                                    className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 dark:text-rose-400 transition-colors"
                                                                    title="Hapus Data"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Modal: New Service Ticket */}
            {ticketModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/85 backdrop-blur-xl animate-in fade-in">
                    <div className="relative max-w-lg w-full bg-white dark:bg-[#090D16] border border-orange-500/30 rounded-3xl p-6 md:p-8 shadow-2xl text-slate-900 dark:text-slate-100">
                        <button onClick={() => setTicketModalOpen(false)} className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                        <h3 className="font-heading font-bold text-xl text-slate-900 dark:text-white mb-4">Terbitkan Nota Servis Baru</h3>
                        <form onSubmit={handleCreateTicketSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Nama Pelanggan *</label>
                                <input
                                    type="text"
                                    required
                                    value={newTicketData.customer_name}
                                    onChange={(e) => setNewTicketData({ ...newTicketData, customer_name: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-orange-500"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">WhatsApp *</label>
                                    <input
                                        type="text"
                                        required
                                        value={newTicketData.whatsapp}
                                        onChange={(e) => setNewTicketData({ ...newTicketData, whatsapp: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-orange-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Tipe Perangkat *</label>
                                    <input
                                        type="text"
                                        required
                                        value={newTicketData.device_type}
                                        onChange={(e) => setNewTicketData({ ...newTicketData, device_type: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-orange-500"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Merek & Model Perangkat *</label>
                                <input
                                    type="text"
                                    required
                                    value={newTicketData.device_brand_model}
                                    onChange={(e) => setNewTicketData({ ...newTicketData, device_brand_model: e.target.value })}
                                    placeholder="Contoh: ASUS ROG Zephyrus G14 (2024)"
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-orange-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Keluhan Kerusakan *</label>
                                <textarea
                                    rows={2}
                                    required
                                    value={newTicketData.problem_reported}
                                    onChange={(e) => setNewTicketData({ ...newTicketData, problem_reported: e.target.value })}
                                    className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-orange-500"
                                />
                            </div>
                            <button type="submit" className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 font-bold text-slate-950 text-xs transition-colors shadow-lg shadow-orange-500/25">
                                Terbitkan Nota Servis
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Tambah Foto Baru Layanan Langit */}
            {galleryModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/85 backdrop-blur-xl animate-in fade-in">
                    <div className="relative max-w-xl w-full bg-white dark:bg-[#090D16] border border-amber-500/40 rounded-3xl p-6 md:p-8 shadow-2xl text-slate-900 dark:text-slate-100 max-h-[92vh] overflow-y-auto">
                        <button
                            onClick={() => setGalleryModalOpen(false)}
                            className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-500 shrink-0">
                                <Plus className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-heading font-extrabold text-xl text-slate-900 dark:text-white">
                                    Tambah Foto Baru Layanan
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                    Upload atau masukkan foto baru untuk halaman layanan Langit
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleCreateGallerySubmit} className="space-y-4">
                            {/* Target Service Selector */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                    Pilih Divisi Layanan *
                                </label>
                                <select
                                    required
                                    value={newGalleryData.service_id}
                                    onChange={(e) => setNewGalleryData({ ...newGalleryData, service_id: e.target.value })}
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:border-amber-500"
                                >
                                    <option value="">-- Pilih Layanan Terkait --</option>
                                    {services.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.name} ({s.tagline || s.slug})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Input Mode Switcher */}
                            <div className="space-y-1.5">
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                                    Sumber Foto *
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setNewGalleryInputMode('url')}
                                        className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                                            newGalleryInputMode === 'url'
                                                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                                                : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400'
                                        }`}
                                    >
                                        <ExternalLink className="w-3.5 h-3.5" />
                                        <span>Tautan URL Gambar</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setNewGalleryInputMode('upload')}
                                        className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                                            newGalleryInputMode === 'upload'
                                                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                                                : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400'
                                        }`}
                                    >
                                        <Upload className="w-3.5 h-3.5" />
                                        <span>Upload File dari PC</span>
                                    </button>
                                </div>
                            </div>

                            {newGalleryInputMode === 'url' ? (
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                        URL Foto WebP / JPG *
                                    </label>
                                    <input
                                        type="url"
                                        required={!newGalleryFilePhoto}
                                        value={newGalleryData.file_webp_path}
                                        onChange={(e) => setNewGalleryData({ ...newGalleryData, file_webp_path: e.target.value })}
                                        placeholder="https://images.unsplash.com/... atau /uploads/..."
                                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs font-sans focus:outline-none focus:border-amber-500"
                                    />
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                        Pilih Berkas Foto Lokal *
                                    </label>
                                    <div className="border-2 border-dashed border-slate-300 dark:border-white/20 rounded-2xl p-4 text-center hover:border-amber-500 transition-colors bg-slate-50 dark:bg-slate-900/40">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            required={!newGalleryData.file_webp_path}
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) setNewGalleryFilePhoto(file);
                                            }}
                                            id="new-gallery-file-input"
                                            className="hidden"
                                        />
                                        <label
                                            htmlFor="new-gallery-file-input"
                                            className="cursor-pointer flex flex-col items-center justify-center gap-1.5"
                                        >
                                            <Upload className="w-6 h-6 text-amber-500" />
                                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                                {newGalleryFilePhoto ? newGalleryFilePhoto.name : 'Pilih file foto dari laptop/PC'}
                                            </span>
                                            <span className="text-[10px] text-slate-500 font-medium">
                                                WebP, PNG, JPG • Maksimal 10MB
                                            </span>
                                        </label>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Judul Foto / Dokumen *</label>
                                <input
                                    type="text"
                                    required
                                    value={newGalleryData.title}
                                    onChange={(e) => setNewGalleryData({ ...newGalleryData, title: e.target.value })}
                                    placeholder="e.g. Sesi Dokumentasi Praktikum Siswa"
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-amber-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Kategori / Tag *</label>
                                    <input
                                        type="text"
                                        required
                                        value={newGalleryData.category}
                                        onChange={(e) => setNewGalleryData({ ...newGalleryData, category: e.target.value })}
                                        placeholder="e.g. wedding, enterprise, hardware"
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-amber-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Tipe Media *</label>
                                    <select
                                        value={newGalleryData.media_type}
                                        onChange={(e) => setNewGalleryData({ ...newGalleryData, media_type: e.target.value })}
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-amber-500"
                                    >
                                        <option value="photo">Foto Standar</option>
                                        <option value="before_after">Before / After Pair</option>
                                        <option value="video">Video Teaser</option>
                                    </select>
                                </div>
                            </div>

                            {/* Metadata EXIF */}
                            <div className="pt-2 border-t border-slate-100 dark:border-white/5 space-y-2">
                                <span className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold tracking-wider">
                                    Parameter Teknis EXIF (Opsional):
                                </span>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[10px] font-medium text-slate-500 mb-1">Kamera / Engine</label>
                                        <input
                                            type="text"
                                            value={newGalleryData.camera}
                                            onChange={(e) => setNewGalleryData({ ...newGalleryData, camera: e.target.value })}
                                            className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-amber-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-medium text-slate-500 mb-1">Lensa / Tech</label>
                                        <input
                                            type="text"
                                            value={newGalleryData.lens}
                                            onChange={(e) => setNewGalleryData({ ...newGalleryData, lens: e.target.value })}
                                            className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-amber-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-3 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setGalleryModalOpen(false)}
                                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-700 dark:text-slate-300 font-medium text-xs transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 font-bold text-slate-950 text-xs transition-colors shadow-lg shadow-amber-500/25"
                                >
                                    Simpan ke Galeri Layanan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Ganti Foto & Edit Metadata EXIF */}
            {editPhotoModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/85 backdrop-blur-xl animate-in fade-in">
                    <div className="relative max-w-2xl w-full bg-white dark:bg-[#090D16] border border-amber-500/40 rounded-3xl p-6 md:p-8 shadow-2xl text-slate-900 dark:text-slate-100 max-h-[92vh] overflow-y-auto">
                        <button
                            onClick={() => setEditPhotoModalOpen(false)}
                            className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-500 shrink-0">
                                <RefreshCw className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-heading font-extrabold text-xl text-slate-900 dark:text-white">
                                    Ganti Foto & Kelola EXIF
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                    Perbarui foto yang tampil di halaman layanan Langit
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleUpdatePhotoSubmit} className="space-y-5">
                            {/* Live Preview Box */}
                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 space-y-3">
                                <div className="flex items-center justify-between text-xs font-semibold">
                                    <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                        <ImageIcon className="w-3.5 h-3.5 text-amber-500" /> Preview Tampilan Baru
                                    </span>
                                    {previewPhotoUrl && (
                                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                                            ✓ Foto Siap Disimpan
                                        </span>
                                    )}
                                </div>
                                <div className="relative aspect-[16/9] max-h-56 rounded-xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-white/10 shadow-inner">
                                    {previewPhotoUrl ? (
                                        <img
                                            src={previewPhotoUrl}
                                            alt="Preview Foto Baru"
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80';
                                            }}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 text-xs font-medium">
                                            <ImageIcon className="w-8 h-8 text-slate-600 mb-1" />
                                            <span>Masukkan URL atau pilih file gambar</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Replacement Mode Selector */}
                            <div className="space-y-2">
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                                    Metode Penggantian Foto:
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { id: 'url', label: 'Tautan URL / WebP', icon: ExternalLink },
                                        { id: 'upload', label: 'Upload Berkas File', icon: Upload },
                                        { id: 'preset', label: 'Preset Layanan', icon: Sparkles },
                                    ].map((m) => {
                                        const MIcon = m.icon;
                                        return (
                                            <button
                                                key={m.id}
                                                type="button"
                                                onClick={() => setEditInputMode(m.id)}
                                                className={`py-2 px-3 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                                                    editInputMode === m.id
                                                        ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                                                        : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                                }`}
                                            >
                                                <MIcon className="w-3.5 h-3.5" />
                                                <span>{m.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Mode 1: URL Input */}
                            {editInputMode === 'url' && (
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                        URL Gambar WebP / JPG / PNG:
                                    </label>
                                    <input
                                        type="url"
                                        value={editPhotoData.file_webp_path}
                                        onChange={(e) => {
                                            setEditPhotoData({ ...editPhotoData, file_webp_path: e.target.value });
                                            setPreviewPhotoUrl(e.target.value);
                                            setEditFilePhoto(null);
                                        }}
                                        placeholder="https://images.unsplash.com/... atau /uploads/..."
                                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-amber-500"
                                    />
                                </div>
                            )}

                            {/* Mode 2: File Upload */}
                            {editInputMode === 'upload' && (
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                        Pilih Berkas Foto dari Komputer:
                                    </label>
                                    <div className="border-2 border-dashed border-slate-300 dark:border-white/20 rounded-2xl p-4 text-center hover:border-amber-500 transition-colors bg-slate-50 dark:bg-slate-900/40">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleEditFileChange}
                                            id="edit-photo-file-input"
                                            className="hidden"
                                        />
                                        <label
                                            htmlFor="edit-photo-file-input"
                                            className="cursor-pointer flex flex-col items-center justify-center gap-1.5"
                                        >
                                            <Upload className="w-6 h-6 text-amber-500" />
                                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                                {editFilePhoto ? editFilePhoto.name : 'Klik untuk memilih file gambar (WebP, JPG, PNG)'}
                                            </span>
                                            <span className="text-[10px] text-slate-500 font-medium">
                                                Maksimal 10MB • Auto Kompresi WebP
                                            </span>
                                        </label>
                                    </div>
                                </div>
                            )}

                            {/* Mode 3: Curated Presets for Current Service */}
                            {editInputMode === 'preset' && (
                                <div className="space-y-2">
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                        Pilih Foto Rekomendasi Siap Pakai:
                                    </label>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                        {(servicePhotoPresets[selectedGalleryService] || servicePhotoPresets['photography-videography']).map((preset, idx) => (
                                            <div
                                                key={idx}
                                                onClick={() => handleApplyPreset(preset)}
                                                className="group cursor-pointer rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 hover:border-amber-500 transition-all p-1.5 bg-slate-50 dark:bg-slate-900/60"
                                            >
                                                <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-slate-950 mb-1">
                                                    <img src={preset.url} alt={preset.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                                </div>
                                                <span className="text-[10px] font-bold line-clamp-1 text-slate-800 dark:text-slate-200 block">
                                                    {preset.title}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Meta & Info Form */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Judul Foto / Dokumen *</label>
                                    <input
                                        type="text"
                                        required
                                        value={editPhotoData.title}
                                        onChange={(e) => setEditPhotoData({ ...editPhotoData, title: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-amber-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Divisi Layanan *</label>
                                    <select
                                        value={editPhotoData.service_id}
                                        onChange={(e) => setEditPhotoData({ ...editPhotoData, service_id: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-amber-500"
                                    >
                                        <option value="">Pilih Layanan Terkait...</option>
                                        {services.map((s) => (
                                            <option key={s.id} value={s.id}>
                                                {s.name} ({s.slug})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Kategori / Tag *</label>
                                    <input
                                        type="text"
                                        required
                                        value={editPhotoData.category}
                                        onChange={(e) => setEditPhotoData({ ...editPhotoData, category: e.target.value })}
                                        placeholder="e.g. wedding, enterprise, hardware_lab"
                                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-amber-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Tipe Media</label>
                                    <select
                                        value={editPhotoData.media_type}
                                        onChange={(e) => setEditPhotoData({ ...editPhotoData, media_type: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-amber-500"
                                    >
                                        <option value="photo">Foto Standar</option>
                                        <option value="before_after">Before / After Pair</option>
                                        <option value="video">Video Teaser</option>
                                    </select>
                                </div>
                            </div>

                            {/* EXIF Parameters Grid */}
                            <div className="pt-2 border-t border-slate-100 dark:border-white/5 space-y-2">
                                <span className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold tracking-wider">
                                    Parameter Teknis & Metadata EXIF:
                                </span>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-[10px] font-medium text-slate-500 mb-1">Kamera / Engine</label>
                                        <input
                                            type="text"
                                            value={editPhotoData.camera}
                                            onChange={(e) => setEditPhotoData({ ...editPhotoData, camera: e.target.value })}
                                            placeholder="Sony FX3 / Cyber Arch"
                                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-amber-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-medium text-slate-500 mb-1">Lensa / Tech Stack</label>
                                        <input
                                            type="text"
                                            value={editPhotoData.lens}
                                            onChange={(e) => setEditPhotoData({ ...editPhotoData, lens: e.target.value })}
                                            placeholder="FE 24-70mm GM II"
                                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-amber-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-medium text-slate-500 mb-1">Shutter / Uptime</label>
                                        <input
                                            type="text"
                                            value={editPhotoData.shutter}
                                            onChange={(e) => setEditPhotoData({ ...editPhotoData, shutter: e.target.value })}
                                            placeholder="1/500s / 99.8%"
                                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-amber-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-medium text-slate-500 mb-1">Aperture / Score</label>
                                        <input
                                            type="text"
                                            value={editPhotoData.aperture}
                                            onChange={(e) => setEditPhotoData({ ...editPhotoData, aperture: e.target.value })}
                                            placeholder="f/2.8 / Score 99"
                                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-amber-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-medium text-slate-500 mb-1">ISO / Tier</label>
                                        <input
                                            type="text"
                                            value={editPhotoData.iso}
                                            onChange={(e) => setEditPhotoData({ ...editPhotoData, iso: e.target.value })}
                                            placeholder="100 / Enterprise"
                                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-amber-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Submit & Cancel */}
                            <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setEditPhotoModalOpen(false)}
                                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-700 dark:text-slate-300 font-medium text-xs transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmittingPhoto}
                                    className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/25 transition-transform active:scale-95 flex items-center gap-2"
                                >
                                    <RefreshCw className={`w-4 h-4 ${isSubmittingPhoto ? 'animate-spin' : ''}`} />
                                    <span>{isSubmittingPhoto ? 'Menyimpan...' : 'Simpan & Ganti Foto'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Collaboration Detail */}
            {selectedCollabDetail && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/85 backdrop-blur-xl animate-in fade-in">
                    <div className="relative max-w-2xl w-full bg-white dark:bg-[#090D16] border border-rose-500/30 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto text-slate-900 dark:text-slate-100">
                        <button
                            onClick={() => setSelectedCollabDetail(null)}
                            className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-500 dark:text-rose-400 shrink-0">
                                <Handshake className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-heading font-extrabold text-xl text-slate-900 dark:text-white">
                                    {selectedCollabDetail.organization_name}
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                    Pengajuan Kerja Sama #{selectedCollabDetail.id} • Diterima {selectedCollabDetail.created_at ? new Date(selectedCollabDetail.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                                </p>
                            </div>
                        </div>

                        {/* Meta Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 text-xs font-sans">
                            <div>
                                <span className="text-slate-500 block text-[10px] uppercase font-semibold">PIC Penanggung Jawab</span>
                                <span className="text-slate-900 dark:text-white font-bold text-sm block mt-0.5">{selectedCollabDetail.pic_name}</span>
                            </div>
                            <div>
                                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Email Resmi</span>
                                <a href={`mailto:${selectedCollabDetail.email}`} className="text-rose-600 dark:text-rose-400 hover:underline block mt-0.5 font-semibold">
                                    {selectedCollabDetail.email}
                                </a>
                            </div>
                            <div>
                                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Nomor WhatsApp</span>
                                <a
                                    href={`https://wa.me/${selectedCollabDetail.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Halo ${selectedCollabDetail.pic_name} (${selectedCollabDetail.organization_name}), kami dari Tim Partnership Langit ingin menindaklanjuti proposal kerja sama.`)}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-emerald-600 dark:text-emerald-400 hover:underline block mt-0.5 flex items-center gap-1 font-semibold"
                                >
                                    <Phone className="w-3 h-3" />
                                    <span>{selectedCollabDetail.whatsapp}</span>
                                </a>
                            </div>
                            <div>
                                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Target Waktu / Pelaksanaan</span>
                                <span className="text-slate-800 dark:text-slate-200 block mt-0.5 font-medium">
                                    {selectedCollabDetail.event_date ? new Date(selectedCollabDetail.event_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Fleksibel / Sesuai Kesepakatan'}
                                </span>
                            </div>
                            <div>
                                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Skema Kemitraan</span>
                                <span className={`inline-block mt-1 px-2.5 py-1 rounded-lg border text-[11px] font-semibold ${getCollabTypeInfo(selectedCollabDetail.collab_type).color}`}>
                                    {getCollabTypeInfo(selectedCollabDetail.collab_type).label}
                                </span>
                            </div>
                            <div>
                                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Status Saat Ini</span>
                                <div className="mt-1">
                                    <select
                                        value={selectedCollabDetail.status}
                                        onChange={(e) => {
                                            handleUpdateCollaborationStatus(selectedCollabDetail.id, e.target.value);
                                            setSelectedCollabDetail({ ...selectedCollabDetail, status: e.target.value });
                                        }}
                                        className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-rose-500/40 text-rose-700 dark:text-rose-300 font-bold text-xs uppercase focus:outline-none"
                                    >
                                        <option value="new">Baru Masuk</option>
                                        <option value="in_discussion">Sedang Diskusi</option>
                                        <option value="approved">Disetujui</option>
                                        <option value="declined">Ditolak</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Ringkasan Konsep / Harapan Kerja Sama */}
                        <div className="space-y-2">
                            <h4 className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold tracking-wider">
                                Ringkasan Konsep & Harapan Kerja Sama:
                            </h4>
                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">
                                {selectedCollabDetail.description || 'Tidak ada keterangan tambahan.'}
                            </div>
                        </div>

                        {/* Berkas Proposal PDF */}
                        <div className="space-y-2">
                            <h4 className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold tracking-wider">
                                Dokumen Proposal PDF:
                            </h4>
                            {selectedCollabDetail.proposal_pdf_path ? (
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <span className="font-bold text-xs text-slate-900 dark:text-white block">Berkas Proposal Terlampir (.PDF)</span>
                                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block">Tersimpan aman di non-public storage server</span>
                                        </div>
                                    </div>
                                    <a
                                        href={selectedCollabDetail.proposal_pdf_path}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-lg shadow-rose-500/25 shrink-0"
                                    >
                                        <Download className="w-4 h-4" />
                                        <span>Buka Dokumen PDF</span>
                                    </a>
                                </div>
                            ) : (
                                <p className="text-xs text-slate-500 italic">Pendaftar tidak melampirkan berkas PDF pada formulir ini.</p>
                            )}
                        </div>

                        {/* Quick Action Buttons */}
                        <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                            <a
                                href={`https://wa.me/${selectedCollabDetail.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Halo ${selectedCollabDetail.pic_name} (${selectedCollabDetail.organization_name}), kami dari Tim Partnership Langit ingin menindaklanjuti proposal kerja sama terkait "${selectedCollabDetail.organization_name}".`)}`}
                                target="_blank"
                                rel="noreferrer"
                                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/25"
                            >
                                <Phone className="w-4 h-4" />
                                <span>Hubungi PIC via WhatsApp</span>
                            </a>

                            <button
                                onClick={() => setSelectedCollabDetail(null)}
                                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-700 dark:text-slate-300 font-medium text-xs transition-colors"
                            >
                                Tutup Detail
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Kelola Foto Before / After Color Grading */}
            {beforeAfterModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/85 backdrop-blur-xl animate-in fade-in">
                    <div className="relative max-w-4xl w-full bg-white dark:bg-[#090D16] border border-indigo-500/30 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto text-slate-900 dark:text-slate-100">
                        <button
                            type="button"
                            onClick={() => setBeforeAfterModalOpen(false)}
                            className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                                <SlidersHorizontal className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-heading font-extrabold text-xl text-slate-900 dark:text-white">
                                    Kelola Foto Before / After Color Grading
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                    Ganti foto RAW Flat (Sisi Kiri) dan foto Cinema Grade (Sisi Kanan) pada slider interaktif DaVinci Resolve.
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleBeforeAfterSubmit} className="space-y-6">
                            {/* Judul Showcase */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                                    Judul Komponen Before / After
                                </label>
                                <input
                                    type="text"
                                    value={beforeAfterData.title}
                                    onChange={(e) => setBeforeAfterData({ ...beforeAfterData, title: e.target.value })}
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:border-indigo-500"
                                    placeholder="Interactive Before / After Color Grading"
                                />
                            </div>

                            {/* Dual Column: Kiri (Before) & Kanan (After) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* KIRI: FOTO BEFORE (RAW FLAT) */}
                                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-amber-500/30 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-500 dark:text-amber-300 text-[10px] font-mono font-bold uppercase tracking-wider border border-amber-500/30">
                                            Sisi Kiri: Foto Before (RAW Flat)
                                        </span>
                                        <div className="flex rounded-lg bg-slate-200 dark:bg-white/10 p-0.5 text-[10px] font-semibold">
                                            <button
                                                type="button"
                                                onClick={() => setBeforeInputMode('upload')}
                                                className={`px-2 py-1 rounded-md transition-colors ${beforeInputMode === 'upload' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-600 dark:text-slate-300'}`}
                                            >
                                                Upload PC
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setBeforeInputMode('url')}
                                                className={`px-2 py-1 rounded-md transition-colors ${beforeInputMode === 'url' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-600 dark:text-slate-300'}`}
                                            >
                                                Link URL
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                                            Label Badge Foto Kiri:
                                        </label>
                                        <input
                                            type="text"
                                            value={beforeAfterData.before_label}
                                            onChange={(e) => setBeforeAfterData({ ...beforeAfterData, before_label: e.target.value })}
                                            placeholder="Sony S-Log3 RAW Flat"
                                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 font-mono"
                                        />
                                    </div>

                                    {beforeInputMode === 'upload' ? (
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                                                Pilih Foto RAW Flat dari Komputer:
                                            </label>
                                            <label className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-amber-500/40 hover:border-amber-500 bg-amber-500/5 cursor-pointer transition-all">
                                                <Upload className="w-6 h-6 text-amber-500 mb-1" />
                                                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                                                    {beforePhotoFile ? beforePhotoFile.name : 'Pilih file gambar (.jpg, .png, .webp)'}
                                                </span>
                                                <span className="text-[10px] text-slate-500 mt-0.5">Maks. 10MB</span>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            setBeforePhotoFile(file);
                                                            setBeforeAfterData({ ...beforeAfterData, before_file_path: URL.createObjectURL(file) });
                                                        }
                                                    }}
                                                />
                                            </label>
                                        </div>
                                    ) : (
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                                                Tautan URL Foto Kiri:
                                            </label>
                                            <input
                                                type="text"
                                                value={beforeAfterData.before_file_path}
                                                onChange={(e) => setBeforeAfterData({ ...beforeAfterData, before_file_path: e.target.value })}
                                                placeholder="https://images.unsplash.com/..."
                                                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 font-mono"
                                            />
                                        </div>
                                    )}

                                    {/* Preview Box */}
                                    <div className="relative aspect-video rounded-xl overflow-hidden bg-black/60 border border-slate-200 dark:border-white/10 flex items-center justify-center">
                                        {beforeAfterData.before_file_path ? (
                                            <img
                                                src={beforeAfterData.before_file_path}
                                                alt="Preview Before"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-xs text-slate-500">Belum ada preview foto kiri</span>
                                        )}
                                        <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/80 text-[10px] font-mono text-amber-300">
                                            {beforeAfterData.before_label || 'Preview Sisi Kiri'}
                                        </span>
                                    </div>
                                </div>

                                {/* KANAN: FOTO AFTER (CINEMA GRADE) */}
                                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-cyan-500/30 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-500 dark:text-cyan-300 text-[10px] font-mono font-bold uppercase tracking-wider border border-cyan-500/30">
                                            Sisi Kanan: Foto After (Cinema Grade)
                                        </span>
                                        <div className="flex rounded-lg bg-slate-200 dark:bg-white/10 p-0.5 text-[10px] font-semibold">
                                            <button
                                                type="button"
                                                onClick={() => setAfterInputMode('upload')}
                                                className={`px-2 py-1 rounded-md transition-colors ${afterInputMode === 'upload' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-600 dark:text-slate-300'}`}
                                            >
                                                Upload PC
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setAfterInputMode('url')}
                                                className={`px-2 py-1 rounded-md transition-colors ${afterInputMode === 'url' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-600 dark:text-slate-300'}`}
                                            >
                                                Link URL
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                                            Label Badge Foto Kanan:
                                        </label>
                                        <input
                                            type="text"
                                            value={beforeAfterData.after_label}
                                            onChange={(e) => setBeforeAfterData({ ...beforeAfterData, after_label: e.target.value })}
                                            placeholder="Langit Cinema Grade (Kodak 2383)"
                                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 font-mono"
                                        />
                                    </div>

                                    {afterInputMode === 'upload' ? (
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                                                Pilih Foto Cinema Grade dari Komputer:
                                            </label>
                                            <label className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-cyan-500/40 hover:border-cyan-500 bg-cyan-500/5 cursor-pointer transition-all">
                                                <Upload className="w-6 h-6 text-cyan-500 mb-1" />
                                                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                                                    {afterPhotoFile ? afterPhotoFile.name : 'Pilih file gambar (.jpg, .png, .webp)'}
                                                </span>
                                                <span className="text-[10px] text-slate-500 mt-0.5">Maks. 10MB</span>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            setAfterPhotoFile(file);
                                                            setBeforeAfterData({ ...beforeAfterData, after_file_path: URL.createObjectURL(file) });
                                                        }
                                                    }}
                                                />
                                            </label>
                                        </div>
                                    ) : (
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                                                Tautan URL Foto Kanan:
                                            </label>
                                            <input
                                                type="text"
                                                value={beforeAfterData.after_file_path}
                                                onChange={(e) => setBeforeAfterData({ ...beforeAfterData, after_file_path: e.target.value })}
                                                placeholder="https://images.unsplash.com/..."
                                                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 font-mono"
                                            />
                                        </div>
                                    )}

                                    {/* Preview Box */}
                                    <div className="relative aspect-video rounded-xl overflow-hidden bg-black/60 border border-slate-200 dark:border-white/10 flex items-center justify-center">
                                        {beforeAfterData.after_file_path ? (
                                            <img
                                                src={beforeAfterData.after_file_path}
                                                alt="Preview After"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-xs text-slate-500">Belum ada preview foto kanan</span>
                                        )}
                                        <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/80 text-[10px] font-mono text-cyan-300">
                                            {beforeAfterData.after_label || 'Preview Sisi Kanan'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setBeforeAfterModalOpen(false)}
                                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-700 dark:text-slate-300 font-medium text-xs transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmittingBeforeAfter}
                                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-400 hover:to-sky-400 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 transition-transform active:scale-95 flex items-center gap-2 disabled:opacity-50"
                                >
                                    <RefreshCw className={`w-4 h-4 ${isSubmittingBeforeAfter ? 'animate-spin' : ''}`} />
                                    <span>{isSubmittingBeforeAfter ? 'Menyimpan ke Server...' : 'Simpan & Publikasikan ke Website'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Upload Video Showreel Cinema & Poster */}
            {showreelModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/85 backdrop-blur-xl animate-in fade-in">
                    <div className="relative max-w-3xl w-full bg-white dark:bg-[#090D16] border border-amber-500/30 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto text-slate-900 dark:text-slate-100">
                        <button
                            type="button"
                            onClick={() => setShowreelModalOpen(false)}
                            className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-500 shrink-0">
                                <Film className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-heading font-extrabold text-xl text-slate-900 dark:text-white">
                                    Upload Video Showreel Cinema & Poster
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                    Upload video sinematik (.MP4, .MOV, .WebM) langsung dari komputer Anda untuk diputar di bagian header showreel.
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleShowreelSubmit} className="space-y-5">
                            {/* Judul Showcase Header */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                                        Judul Showcase Header:
                                    </label>
                                    <input
                                        type="text"
                                        value={showreelData.title}
                                        onChange={(e) => setShowreelData({ ...showreelData, title: e.target.value })}
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:border-amber-500"
                                        placeholder="Visual Sinematik Kelas Dunia."
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                                        Deskripsi Subtitle Header:
                                    </label>
                                    <input
                                        type="text"
                                        value={showreelData.subtitle}
                                        onChange={(e) => setShowreelData({ ...showreelData, subtitle: e.target.value })}
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:border-amber-500"
                                        placeholder="Dari storyboard komersial brand ternama hingga mahakarya pernikahan abadi..."
                                    />
                                </div>
                            </div>

                            {/* Section: File Video */}
                            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-amber-500/30 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Video className="w-4 h-4 text-amber-500" />
                                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                                            File Video Showreel (Dengan Audio)
                                        </span>
                                    </div>
                                    <div className="flex rounded-lg bg-slate-200 dark:bg-white/10 p-0.5 text-[10px] font-semibold">
                                        <button
                                            type="button"
                                            onClick={() => setVideoInputMode('upload')}
                                            className={`px-2.5 py-1 rounded-md transition-colors ${videoInputMode === 'upload' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-600 dark:text-slate-300'}`}
                                        >
                                            Upload dari PC
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setVideoInputMode('url')}
                                            className={`px-2.5 py-1 rounded-md transition-colors ${videoInputMode === 'url' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-600 dark:text-slate-300'}`}
                                        >
                                            Link URL
                                        </button>
                                    </div>
                                </div>

                                {videoInputMode === 'upload' ? (
                                    <div className="space-y-2">
                                        <label className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-amber-500/40 hover:border-amber-500 bg-amber-500/5 cursor-pointer transition-all">
                                            <Upload className="w-8 h-8 text-amber-500 mb-2 animate-bounce" />
                                            <span className="text-sm font-bold text-slate-800 dark:text-slate-200 text-center">
                                                {videoFile ? videoFile.name : 'Pilih File Video dari Komputer (.mp4, .mov, .webm, .mkv)'}
                                            </span>
                                            <span className="text-xs text-slate-500 mt-1">
                                                Mendukung file video sinematik hingga 100MB (Otomatis disimpan di server lokal website)
                                            </span>
                                            <input
                                                type="file"
                                                accept="video/mp4,video/webm,video/quicktime,video/x-matroska"
                                                className="hidden"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        setVideoFile(file);
                                                        setShowreelData({ ...showreelData, video_url: URL.createObjectURL(file) });
                                                    }
                                                }}
                                            />
                                        </label>
                                    </div>
                                ) : (
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                                            Masukkan Tautan URL Video:
                                        </label>
                                        <input
                                            type="text"
                                            value={showreelData.video_url}
                                            onChange={(e) => setShowreelData({ ...showreelData, video_url: e.target.value })}
                                            placeholder="https://commondatastorage.googleapis.com/... atau /uploads/videos/..."
                                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 font-mono"
                                        />
                                    </div>
                                )}

                                {/* Video Live Preview */}
                                {showreelData.video_url && (
                                    <div className="space-y-1.5 pt-2">
                                        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                                            Pratinjau Video (Player Preview):
                                        </span>
                                        <div className="relative rounded-xl overflow-hidden bg-black aspect-video max-h-56">
                                            <video
                                                src={showreelData.video_url}
                                                controls
                                                playsInline
                                                className="w-full h-full object-contain"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Section: Thumbnail / Poster Video */}
                            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <ImageIcon className="w-4 h-4 text-cyan-500" />
                                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                                            Foto Poster / Thumbnail Video (Sebelum Play)
                                        </span>
                                    </div>
                                    <div className="flex rounded-lg bg-slate-200 dark:bg-white/10 p-0.5 text-[10px] font-semibold">
                                        <button
                                            type="button"
                                            onClick={() => setPosterInputMode('upload')}
                                            className={`px-2.5 py-1 rounded-md transition-colors ${posterInputMode === 'upload' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-600 dark:text-slate-300'}`}
                                        >
                                            Upload PC
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setPosterInputMode('url')}
                                            className={`px-2.5 py-1 rounded-md transition-colors ${posterInputMode === 'url' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-600 dark:text-slate-300'}`}
                                        >
                                            Link URL
                                        </button>
                                    </div>
                                </div>

                                {posterInputMode === 'upload' ? (
                                    <label className="flex flex-col items-center justify-center p-4 rounded-xl border border-dashed border-cyan-500/40 hover:border-cyan-500 bg-cyan-500/5 cursor-pointer transition-all">
                                        <Upload className="w-5 h-5 text-cyan-500 mb-1" />
                                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                                            {posterFile ? posterFile.name : 'Pilih poster gambar (.jpg, .png, .webp)'}
                                        </span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    setPosterFile(file);
                                                    setShowreelData({ ...showreelData, poster_url: URL.createObjectURL(file) });
                                                }
                                            }}
                                        />
                                    </label>
                                ) : (
                                    <input
                                        type="text"
                                        value={showreelData.poster_url}
                                        onChange={(e) => setShowreelData({ ...showreelData, poster_url: e.target.value })}
                                        placeholder="https://images.unsplash.com/..."
                                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 font-mono"
                                    />
                                )}

                                {showreelData.poster_url && (
                                    <div className="relative aspect-[21/9] rounded-xl overflow-hidden bg-black/60 max-h-36">
                                        <img
                                            src={showreelData.poster_url}
                                            alt="Preview Poster"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowreelModalOpen(false)}
                                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-700 dark:text-slate-300 font-medium text-xs transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmittingShowreel}
                                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/25 transition-transform active:scale-95 flex items-center gap-2 disabled:opacity-50"
                                >
                                    <RefreshCw className={`w-4 h-4 ${isSubmittingShowreel ? 'animate-spin' : ''}`} />
                                    <span>{isSubmittingShowreel ? 'Mengupload Video...' : 'Simpan & Upload Video Showreel'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
