import React, { useMemo, useState } from 'react';
import { router } from '@inertiajs/react';
import {
    GraduationCap,
    CalendarCheck,
    CheckCircle2,
    Clock,
    AlertCircle,
    Wallet,
    TrendingUp,
    Plus,
    Search,
    MessageCircle,
    UserCheck,
    Receipt,
    Pencil,
    Trash2,
    X,
    Sparkles,
    Check,
    CreditCard,
    ChevronRight,
    Users,
    Filter,
    ArrowUpRight,
    HelpCircle,
    FileSpreadsheet,
    Terminal,
    Cpu,
    Palette,
    Award
} from 'lucide-react';

const CATEGORY_PRESETS = [
    { label: 'Coding & Robotik (AI & Python)', icon: Terminal, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30' },
    { label: 'Microsoft Office & Administrasi', icon: FileSpreadsheet, color: 'text-sky-500 bg-sky-500/10 border-sky-500/30' },
    { label: 'Hardware & Perakitan PC Lab', icon: Cpu, color: 'text-amber-500 bg-amber-500/10 border-amber-500/30' },
    { label: 'Desain Grafis & Multimedia', icon: Palette, color: 'text-purple-500 bg-purple-500/10 border-purple-500/30' },
    { label: 'Web Development (HTML/CSS & React)', icon: Sparkles, color: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/30' },
];

const TOPIC_SUGGESTIONS = {
    'Coding & Robotik (AI & Python)': [
        'Algoritma & Logika Komputasi',
        'Sintaks Python & Variabel',
        'Percabangan Logika If-Else',
        'Perulangan For & While Loop',
        'Fungsi (Def) & Modul Kode',
        'Robotik Sensor & Arduino/ESP32',
        'Mini Project Game Interaktif'
    ],
    'Microsoft Office & Administrasi': [
        'Word: Format Surat Resmi & Margin',
        'Word: Heading & Daftar Isi Otomatis',
        'Word: Mail Merge Sertifikat',
        'Excel: Rumus Statistik & Aritmatika',
        'Excel: Rumus Logika IF Bertingkat',
        'Excel: VLOOKUP & XLOOKUP',
        'Excel: Pivot Table & Chart',
        'PowerPoint: Desain Slide Presentasi'
    ],
    'Hardware & Perakitan PC Lab': [
        'Pengenalan Komponen CPU & Socket',
        'RAM, Storage NVMe & Bus Speed',
        'Power Supply Unit & Efisiensi 80+',
        'Instalasi CPU, Cooler & Thermal Paste',
        'Cable Management & Airflow Casing',
        'First Boot, BIOS Setup & XMP',
        'Instalasi Windows 11 & Driver',
        'Diagnostic & Stress Test Stabilitas'
    ],
    'Desain Grafis & Multimedia': [
        'Prinsip Desain Visual & Kontras',
        'Eksplorasi Palet Warna & Tipografi',
        'Desain Konten Media Sosial Canva',
        'Editing Foto & Manipulasi Gambar',
        'Desain Brosur & Media Promosi'
    ],
};

function formatRupiah(num) {
    return 'Rp ' + Number(num || 0).toLocaleString('id-ID');
}

function cleanWhatsAppNumber(phone) {
    if (!phone) return '';
    let p = String(phone).replace(/\D/g, '');
    if (p.startsWith('0')) p = '62' + p.slice(1);
    return p;
}

export default function AdminEducationAttendance({ students = [], financials = {} }) {
    const [subTab, setSubTab] = useState('punch_cards'); // 'punch_cards', 'students_table', 'attendances_log', 'payments_log'
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [paymentFilter, setPaymentFilter] = useState('all'); // 'all', 'needs_payment', 'paid'
    const [selectedStudentDetail, setSelectedStudentDetail] = useState(null);

    // Modal States
    const [attendanceModal, setAttendanceModal] = useState({ open: false, student: null, meetingNumber: 1 });
    const [paymentModal, setPaymentModal] = useState({ open: false, student: null, cycleNumber: 1, amount: 600000 });
    const [studentModal, setStudentModal] = useState({ open: false, editing: null });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form inputs for Attendance
    const [attForm, setAttForm] = useState({
        date: new Date().toISOString().split('T')[0],
        status: 'hadir',
        topic: '',
        mentor_name: 'Instruktur Langit Education',
        notes: '',
    });

    // Form inputs for Payment
    const [payForm, setPayForm] = useState({
        amount: 600000,
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: 'transfer',
        notes: '',
    });

    // Form inputs for Student
    const [stuForm, setStuForm] = useState({
        name: '',
        category: 'Coding & Robotik (AI & Python)',
        parent_name: '',
        whatsapp: '',
        fee_per_cycle: 600000,
        status: 'active',
        joined_at: new Date().toISOString().split('T')[0],
        notes: '',
    });

    // Extract unique categories across students
    const availableCategories = useMemo(() => {
        const set = new Set();
        students.forEach(s => { if (s.category) set.add(s.category); });
        CATEGORY_PRESETS.forEach(p => set.add(p.label));
        return Array.from(set);
    }, [students]);

    // Filter students
    const filteredStudents = useMemo(() => {
        return students.filter(student => {
            const matchesSearch = student.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                student.parent_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                student.whatsapp?.includes(searchQuery);

            const matchesCategory = categoryFilter === 'all' || student.category === categoryFilter;

            let matchesPayment = true;
            if (paymentFilter === 'needs_payment') {
                matchesPayment = Boolean(student.needs_payment_reminder);
            } else if (paymentFilter === 'paid') {
                matchesPayment = !student.needs_payment_reminder;
            }

            return matchesSearch && matchesCategory && matchesPayment;
        });
    }, [students, searchQuery, categoryFilter, paymentFilter]);

    // Flatten all attendances for the log tab
    const allAttendances = useMemo(() => {
        const list = [];
        students.forEach(s => {
            if (Array.isArray(s.attendances)) {
                s.attendances.forEach(a => {
                    list.push({ ...a, student_name: s.name, category: s.category, student_obj: s });
                });
            }
        });
        return list.sort((a, b) => new Date(b.date || b.created_at) - new Date(a.date || a.created_at));
    }, [students]);

    // Flatten all payments for the kas tab
    const allPayments = useMemo(() => {
        const list = [];
        students.forEach(s => {
            if (Array.isArray(s.payments)) {
                s.payments.forEach(p => {
                    list.push({ ...p, student_name: s.name, category: s.category, student_obj: s });
                });
            }
        });
        return list.sort((a, b) => new Date(b.payment_date || b.created_at) - new Date(a.payment_date || a.created_at));
    }, [students]);

    // Open Attendance Modal
    const handleOpenAttendance = (student, targetMeetingNumber = null) => {
        const nextNumber = targetMeetingNumber || (student.total_meetings ? student.total_meetings + 1 : 1);
        setAttendanceModal({
            open: true,
            student,
            meetingNumber: nextNumber,
        });
        setAttForm({
            date: new Date().toISOString().split('T')[0],
            status: 'hadir',
            topic: '',
            mentor_name: 'Instruktur Langit Education',
            notes: '',
        });
    };

    // Submit Attendance
    const handleSubmitAttendance = (e) => {
        e.preventDefault();
        if (!attendanceModal.student) return;
        setIsSubmitting(true);

        router.post('/admin/education-attendance', {
            student_id: attendanceModal.student.id,
            meeting_number: attendanceModal.meetingNumber,
            date: attForm.date,
            status: attForm.status,
            topic: attForm.topic,
            mentor_name: attForm.mentor_name,
            notes: attForm.notes,
        }, {
            preserveScroll: true,
            onFinish: () => {
                setIsSubmitting(false);
                setAttendanceModal({ open: false, student: null, meetingNumber: 1 });
            }
        });
    };

    // Open Payment Modal
    const handleOpenPayment = (student, cycleNumber = null) => {
        const targetCycle = cycleNumber || (student.current_cycle || 1);
        setPaymentModal({
            open: true,
            student,
            cycleNumber: targetCycle,
            amount: student.fee_per_cycle || 600000,
        });
        setPayForm({
            amount: student.fee_per_cycle || 600000,
            payment_date: new Date().toISOString().split('T')[0],
            payment_method: 'transfer',
            notes: `Pembayaran Paket 8 Sesi Pertemuan (Siklus ${targetCycle})`,
        });
    };

    // Submit Payment
    const handleSubmitPayment = (e) => {
        e.preventDefault();
        if (!paymentModal.student) return;
        setIsSubmitting(true);

        router.post('/admin/education-payments', {
            student_id: paymentModal.student.id,
            cycle_number: paymentModal.cycleNumber,
            amount: payForm.amount,
            payment_date: payForm.payment_date,
            payment_method: payForm.payment_method,
            notes: payForm.notes,
        }, {
            preserveScroll: true,
            onFinish: () => {
                setIsSubmitting(false);
                setPaymentModal({ open: false, student: null, cycleNumber: 1, amount: 600000 });
            }
        });
    };

    // Open Student Modal (Create or Edit)
    const handleOpenStudentModal = (student = null) => {
        if (student) {
            setStudentModal({ open: true, editing: student });
            setStuForm({
                name: student.name || '',
                category: student.category || 'Coding & Robotik (AI & Python)',
                parent_name: student.parent_name || '',
                whatsapp: student.whatsapp || '',
                fee_per_cycle: student.fee_per_cycle || 600000,
                status: student.status || 'active',
                joined_at: student.joined_at ? String(student.joined_at).split('T')[0] : new Date().toISOString().split('T')[0],
                notes: student.notes || '',
            });
        } else {
            setStudentModal({ open: true, editing: null });
            setStuForm({
                name: '',
                category: 'Coding & Robotik (AI & Python)',
                parent_name: '',
                whatsapp: '',
                fee_per_cycle: 600000,
                status: 'active',
                joined_at: new Date().toISOString().split('T')[0],
                notes: '',
            });
        }
    };

    // Submit Student
    const handleSubmitStudent = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        if (studentModal.editing) {
            router.put(`/admin/education-students/${studentModal.editing.id}`, stuForm, {
                preserveScroll: true,
                onFinish: () => {
                    setIsSubmitting(false);
                    setStudentModal({ open: false, editing: null });
                }
            });
        } else {
            router.post('/admin/education-students', stuForm, {
                preserveScroll: true,
                onFinish: () => {
                    setIsSubmitting(false);
                    setStudentModal({ open: false, editing: null });
                }
            });
        }
    };

    // Delete Student
    const handleDeleteStudent = (student) => {
        if (window.confirm(`Hapus data anak les ${student.name}? Seluruh catatan absensi dan riwayat pembayaran akan ikut terhapus.`)) {
            router.delete(`/admin/education-students/${student.id}`, { preserveScroll: true });
        }
    };

    // Delete Attendance
    const handleDeleteAttendance = (attendance) => {
        if (window.confirm(`Hapus catatan absensi Pertemuan ke-${attendance.meeting_number}?`)) {
            router.delete(`/admin/education-attendance/${attendance.id}`, { preserveScroll: true });
        }
    };

    // Delete Payment
    const handleDeletePayment = (payment) => {
        if (window.confirm(`Hapus kuitansi pembayaran ${payment.receipt_number}?`)) {
            router.delete(`/admin/education-payments/${payment.id}`, { preserveScroll: true });
        }
    };

    // Send WhatsApp Reminder or Billing
    const handleSendWhatsApp = (student, type = 'billing') => {
        const cleanPhone = cleanWhatsAppNumber(student.whatsapp);
        if (!cleanPhone) {
            alert('Nomor WhatsApp belum valid.');
            return;
        }

        const totalMeetings = student.total_meetings || 0;
        const currentCycle = student.current_cycle || 1;
        const feeFormatted = formatRupiah(student.fee_per_cycle || 600000);

        let msg = '';
        if (type === 'billing') {
            msg = `Halo Bapak/Ibu ${student.parent_name || 'Orang Tua'} dari ananda *${student.name}*.\n\n` +
                `Kami dari *Langit Education* ingin menginformasikan bahwa ananda telah mengikuti *${totalMeetings} kali pertemuan* les program *${student.category}*.\n\n` +
                `Sesuai siklus belajar 8 kali pertemuan, saat ini telah memasuki periode baru (*Siklus ${currentCycle}*).\n` +
                `• Biaya Paket 8 Pertemuan: *${feeFormatted}*\n` +
                `• Keterangan: Pembayaran dapat dilakukan via Transfer Bank / QRIS Langit Creative.\n\n` +
                `_Catatan: Sesuai kebijakan Langit Education, absensi pertemuan berikutnya tetap dapat berjalan lancar._\n\n` +
                `Terima kasih atas kepercayaan Bapak/Ibu membimbing ananda bersama kami. 🙏`;
        } else {
            msg = `Halo Bapak/Ibu ${student.parent_name || 'Orang Tua'} dari ananda *${student.name}*.\n\n` +
                `Update presensi belajar *Langit Education* (${student.category}):\n` +
                `• Total Pertemuan: *${totalMeetings} sesi*\n` +
                `• Status: Aktif bersemangat\n\n` +
                `Terima kasih! Salam hangat dari Tim Instruktur Langit Education.`;
        }

        window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
    };

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* ── 1. COCKPIT HEADER & KAS PEMASUKAN CARDS ── */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-[#002b49] p-6 sm:p-8 text-white border border-cyan-500/20 shadow-2xl">
                <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
                <div className="absolute right-40 -bottom-20 w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/10">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                            <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Langit Education Cockpit</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-black font-heading tracking-tight">
                            Absensi & Kas <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-emerald-400 bg-clip-text text-transparent">Langit Education</span>
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                            Sistem presensi per 8 pertemuan dengan visual kartu progres. Pembayaran bersifat fleksibel—ketika 8 sesi lengkap, sesi berikutnya tetap bebas absen dan tidak terkunci.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            onClick={() => handleOpenStudentModal()}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.02] cursor-pointer"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Tambah Anak Les</span>
                        </button>
                    </div>
                </div>

                {/* 4 Cards Pemasukan Uang Langit Education */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
                    {/* Card 1: Total Pemasukan All-Time */}
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:border-emerald-500/40 transition-all">
                        <div className="flex items-center justify-between text-xs font-mono text-emerald-400 mb-2">
                            <span>TOTAL PEMASUKAN (LUNAS)</span>
                            <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300">
                                <Wallet className="w-4 h-4" />
                            </span>
                        </div>
                        <div className="text-xl sm:text-2xl font-black font-mono text-white tracking-tight">
                            {formatRupiah(financials.total_income || 0)}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 inline" />
                            <span>Akumulasi kas terverifikasi</span>
                        </p>
                    </div>

                    {/* Card 2: Pemasukan Bulan Ini */}
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:border-cyan-500/40 transition-all">
                        <div className="flex items-center justify-between text-xs font-mono text-cyan-400 mb-2">
                            <span>PEMASUKAN BULAN INI</span>
                            <span className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300">
                                <TrendingUp className="w-4 h-4" />
                            </span>
                        </div>
                        <div className="text-xl sm:text-2xl font-black font-mono text-white tracking-tight">
                            {formatRupiah(financials.this_month_income || 0)}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">
                            Penerimaan bulan berjalan
                        </p>
                    </div>

                    {/* Card 3: Tagihan Berjalan (8 Sesi Selesai) */}
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:border-amber-500/40 transition-all">
                        <div className="flex items-center justify-between text-xs font-mono text-amber-400 mb-2">
                            <span>TAGIHAN SIKLUS (PENDING)</span>
                            <span className="p-2 rounded-xl bg-amber-500/20 text-amber-300">
                                <AlertCircle className="w-4 h-4" />
                            </span>
                        </div>
                        <div className="text-xl sm:text-2xl font-black font-mono text-amber-300 tracking-tight">
                            {financials.pending_cycles_count || 0} <span className="text-sm font-sans font-normal text-slate-300">Paket</span>
                        </div>
                        <p className="text-[11px] text-slate-300 mt-1">
                            Est. {formatRupiah(financials.pending_amount_estimate || 0)} • <span className="text-cyan-300">Bebas Absen Lanjut</span>
                        </p>
                    </div>

                    {/* Card 4: Siswa & Sesi */}
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:border-purple-500/40 transition-all">
                        <div className="flex items-center justify-between text-xs font-mono text-purple-400 mb-2">
                            <span>SISWA AKTIF & TOTAL SESI</span>
                            <span className="p-2 rounded-xl bg-purple-500/20 text-purple-300">
                                <Users className="w-4 h-4" />
                            </span>
                        </div>
                        <div className="text-xl sm:text-2xl font-black font-mono text-white tracking-tight">
                            {students.length} <span className="text-sm font-sans font-normal text-slate-300">Siswa /</span> {financials.total_sessions || 0} <span className="text-sm font-sans font-normal text-slate-300">Sesi</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">
                            Beragam kategori les & kursus
                        </p>
                    </div>
                </div>
            </div>

            {/* ── 2. SUB-VIEW SELECTOR & SEARCH / FILTER BAR ── */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-[#090D16] border border-slate-200/90 dark:border-white/10 shadow-sm">
                {/* View Tabs */}
                <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-white/5 text-xs font-bold">
                    <button
                        onClick={() => setSubTab('punch_cards')}
                        className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                            subTab === 'punch_cards'
                                ? 'bg-white dark:bg-slate-900 text-[#005792] dark:text-cyan-400 shadow-xs'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                        <Award className="w-3.5 h-3.5" />
                        <span>Kartu Presensi 8 Sesi</span>
                    </button>

                    <button
                        onClick={() => setSubTab('students_table')}
                        className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                            subTab === 'students_table'
                                ? 'bg-white dark:bg-slate-900 text-[#005792] dark:text-cyan-400 shadow-xs'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                        <Users className="w-3.5 h-3.5" />
                        <span>Daftar Siswa ({students.length})</span>
                    </button>

                    <button
                        onClick={() => setSubTab('attendances_log')}
                        className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                            subTab === 'attendances_log'
                                ? 'bg-white dark:bg-slate-900 text-[#005792] dark:text-cyan-400 shadow-xs'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                        <CalendarCheck className="w-3.5 h-3.5" />
                        <span>Log Riwayat Presensi</span>
                    </button>

                    <button
                        onClick={() => setSubTab('payments_log')}
                        className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                            subTab === 'payments_log'
                                ? 'bg-white dark:bg-slate-900 text-[#005792] dark:text-cyan-400 shadow-xs'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                        <Receipt className="w-3.5 h-3.5" />
                        <span>Buku Kas & Pembayaran</span>
                    </button>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-2.5">
                    {/* Search */}
                    <div className="relative min-w-[200px]">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Cari anak / ortu / WA..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                        />
                    </div>

                    {/* Category Filter */}
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
                    >
                        <option value="all">Semua Kategori Les</option>
                        {availableCategories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>

                    {/* Payment Status Filter */}
                    <select
                        value={paymentFilter}
                        onChange={(e) => setPaymentFilter(e.target.value)}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
                    >
                        <option value="all">Semua Status Bayar</option>
                        <option value="needs_payment">⚠️ Tagihan Belum Dibayar</option>
                        <option value="paid">✓ Lunas Semua Siklus</option>
                    </select>
                </div>
            </div>

            {/* ── 3. VIEW 1: KARTU PRESENSI 8 SESI (VISUAL PUNCH CARDS) ── */}
            {subTab === 'punch_cards' && (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {filteredStudents.length === 0 ? (
                        <div className="col-span-full p-12 text-center rounded-3xl bg-white dark:bg-[#090D16] border border-slate-200/90 dark:border-white/10">
                            <GraduationCap className="w-12 h-12 text-slate-400 mx-auto mb-3 opacity-50" />
                            <h4 className="font-heading font-bold text-base text-slate-900 dark:text-white">Tidak ada data anak les</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Coba sesuaikan kata kunci pencarian atau tambah anak les baru.</p>
                            <button
                                onClick={() => handleOpenStudentModal()}
                                className="mt-4 px-4 py-2 rounded-xl bg-cyan-600 text-white text-xs font-bold inline-flex items-center gap-1.5"
                            >
                                <Plus className="w-4 h-4" /> Tambah Siswa Sekarang
                            </button>
                        </div>
                    ) : (
                        filteredStudents.map((student) => {
                            const totalMeetings = student.total_meetings || 0;
                            const currentCycle = student.current_cycle || 1;
                            const sessionInCycle = student.session_in_cycle || 0; // 1..8 (or 0)
                            const isCycleCompleted = student.is_cycle_completed;
                            const isPaidCurrentCycle = (student.paid_cycles || []).includes(currentCycle);

                            // Find attendances in current cycle
                            const currentCycleAttendances = (student.attendances || []).filter(
                                a => a.cycle_number === currentCycle
                            );

                            return (
                                <div
                                    key={student.id}
                                    className="relative flex flex-col justify-between p-6 rounded-3xl bg-white dark:bg-[#0c1220] border border-slate-200/90 dark:border-white/10 shadow-sm hover:shadow-xl transition-all duration-300 space-y-5"
                                >
                                    {/* Student Header & Metadata */}
                                    <div>
                                        <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/20">
                                                        {student.category}
                                                    </span>
                                                    <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">
                                                        ID #{String(student.id).padStart(3, '0')}
                                                    </span>
                                                </div>
                                                <h3 className="text-lg font-black font-heading text-slate-900 dark:text-white">
                                                    {student.name}
                                                </h3>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                                    Ortu: <span className="font-semibold text-slate-700 dark:text-slate-300">{student.parent_name || '-'}</span> • WA: <span className="font-mono">{student.whatsapp}</span>
                                                </p>
                                            </div>

                                            {/* Status Badge */}
                                            <div className="text-right">
                                                {isPaidCurrentCycle ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                                        <span>Lunas Siklus {currentCycle}</span>
                                                    </span>
                                                ) : (
                                                    <div className="space-y-1">
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                                                            <AlertCircle className="w-3.5 h-3.5" />
                                                            <span>Tagihan Siklus {currentCycle}</span>
                                                        </span>
                                                        <div className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400">
                                                            (Bebas Absen Lanjut)
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Cycle Progress Summary */}
                                        <div className="flex items-center justify-between text-xs font-mono py-2 border-y border-slate-100 dark:border-white/5">
                                            <span className="text-slate-600 dark:text-slate-400">
                                                Progres: <strong className="text-slate-900 dark:text-white">{sessionInCycle}/8 Sesi</strong> (Siklus {currentCycle})
                                            </span>
                                            <span className="text-slate-500 dark:text-slate-400">
                                                Total Sesi: <strong className="text-cyan-600 dark:text-cyan-400">{totalMeetings} Sesi</strong>
                                            </span>
                                        </div>
                                    </div>

                                    {/* ── 8-SESSION INTERACTIVE PUNCH CARD ── */}
                                    <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/5 space-y-3">
                                        <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                                            <span>KARTU PRESENSI SIKLUS {currentCycle} (8 SESI)</span>
                                            <span className="text-[11px] text-cyan-600 dark:text-cyan-400 font-semibold">
                                                {formatRupiah(student.fee_per_cycle)} / paket
                                            </span>
                                        </div>

                                        {/* 8 Punch Track Discs */}
                                        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                                            {[1, 2, 3, 4, 5, 6, 7, 8].map((slotNumber) => {
                                                const attRecord = currentCycleAttendances.find(a => a.session_in_cycle === slotNumber);
                                                const isFilled = Boolean(attRecord);
                                                const isNextTarget = !isFilled && (slotNumber === sessionInCycle + 1 || (sessionInCycle === 8 && slotNumber === 1));

                                                let statusColor = 'border-slate-300 dark:border-white/20 bg-white dark:bg-slate-800 text-slate-400';
                                                let icon = null;

                                                if (attRecord) {
                                                    if (attRecord.status === 'hadir') {
                                                        statusColor = 'border-emerald-500 bg-emerald-500 text-white shadow-md shadow-emerald-500/20';
                                                        icon = <Check className="w-4 h-4 stroke-[3]" />;
                                                    } else if (attRecord.status === 'izin') {
                                                        statusColor = 'border-amber-500 bg-amber-500 text-white shadow-md shadow-amber-500/20';
                                                        icon = <Clock className="w-3.5 h-3.5" />;
                                                    } else if (attRecord.status === 'sakit') {
                                                        statusColor = 'border-sky-500 bg-sky-500 text-white';
                                                        icon = <HelpCircle className="w-3.5 h-3.5" />;
                                                    } else {
                                                        statusColor = 'border-rose-500 bg-rose-500 text-white';
                                                        icon = <X className="w-3.5 h-3.5" />;
                                                    }
                                                } else if (isNextTarget) {
                                                    statusColor = 'border-cyan-500 text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 ring-2 ring-cyan-500/30 animate-pulse';
                                                }

                                                return (
                                                    <div
                                                        key={slotNumber}
                                                        onClick={() => {
                                                            if (!attRecord) {
                                                                handleOpenAttendance(student, (currentCycle - 1) * 8 + slotNumber);
                                                            } else {
                                                                setSelectedStudentDetail(student);
                                                            }
                                                        }}
                                                        title={attRecord ? `Pertemuan ${attRecord.meeting_number} (${attRecord.status}): ${attRecord.topic || 'Belum ada catatan materi'}` : `Klik untuk absen pertemuan ${slotNumber}`}
                                                        className={`relative flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all cursor-pointer hover:scale-105 min-h-[60px] ${statusColor}`}
                                                    >
                                                        <span className="text-[10px] font-mono font-bold opacity-80 mb-0.5">#{slotNumber}</span>
                                                        <div className="flex items-center justify-center h-5">
                                                            {icon ? icon : (
                                                                <span className="text-xs font-bold font-mono">
                                                                    {isNextTarget ? 'Absen' : slotNumber}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {attRecord?.date && (
                                                            <span className="text-[9px] font-mono mt-1 opacity-90 truncate max-w-full">
                                                                {String(attRecord.date).slice(5)}
                                                            </span>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Celebration Banner when 8 sessions completed */}
                                        {sessionInCycle === 8 && (
                                            <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/15 via-emerald-500/15 to-cyan-500/15 border border-amber-500/30 flex items-center justify-between gap-3 text-xs">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg">🎉</span>
                                                    <div>
                                                        <strong className="text-slate-900 dark:text-white">8 Pertemuan Selesai!</strong>
                                                        <p className="text-[11px] text-slate-600 dark:text-slate-400">
                                                            Paket Siklus {currentCycle} lengkap. {isPaidCurrentCycle ? 'Siap tagih Siklus ' + (currentCycle + 1) : 'Segera catat pembayaran.'}
                                                        </p>
                                                    </div>
                                                </div>
                                                {!isPaidCurrentCycle && (
                                                    <button
                                                        onClick={() => handleOpenPayment(student, currentCycle)}
                                                        className="px-2.5 py-1 rounded-lg bg-amber-500 text-white font-bold text-[11px] shrink-0 hover:bg-amber-600 cursor-pointer"
                                                    >
                                                        Catat Bayar
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Buttons Row */}
                                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-white/5">
                                        <div className="flex items-center gap-1.5">
                                            {/* Quick Attendance */}
                                            <button
                                                type="button"
                                                onClick={() => handleOpenAttendance(student)}
                                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#005792] hover:bg-[#00487a] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                                            >
                                                <UserCheck className="w-3.5 h-3.5" />
                                                <span>Absen Sesi #{totalMeetings + 1}</span>
                                            </button>

                                            {/* Record Payment */}
                                            <button
                                                type="button"
                                                onClick={() => handleOpenPayment(student)}
                                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold border border-emerald-600/20 transition-all cursor-pointer"
                                            >
                                                <CreditCard className="w-3.5 h-3.5" />
                                                <span>Catat Bayar</span>
                                            </button>
                                        </div>

                                        <div className="flex items-center gap-1">
                                            {/* WhatsApp Ortu */}
                                            <button
                                                type="button"
                                                onClick={() => handleSendWhatsApp(student, student.needs_payment_reminder ? 'billing' : 'summary')}
                                                title="Hubungi WhatsApp Orang Tua"
                                                className="p-2 rounded-xl text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 transition-colors cursor-pointer"
                                            >
                                                <MessageCircle className="w-4 h-4" />
                                            </button>

                                            {/* Detail Riwayat */}
                                            <button
                                                type="button"
                                                onClick={() => setSelectedStudentDetail(student)}
                                                title="Lihat Detail Riwayat & Edit"
                                                className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
                                            >
                                                <FileSpreadsheet className="w-4 h-4" />
                                            </button>

                                            {/* Edit Student */}
                                            <button
                                                type="button"
                                                onClick={() => handleOpenStudentModal(student)}
                                                title="Edit Profil Siswa"
                                                className="p-2 rounded-xl text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/10 transition-colors cursor-pointer"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}

            {/* ── 4. VIEW 2: TABEL DAFTAR SISWA (DATA MANAGEMENT) ── */}
            {subTab === 'students_table' && (
                <div className="rounded-3xl bg-white dark:bg-[#090D16] border border-slate-200/90 dark:border-white/10 shadow-sm overflow-hidden">
                    <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h3 className="font-heading font-black text-lg text-slate-900 dark:text-white">Daftar Seluruh Anak Les</h3>
                            <p className="text-xs text-slate-500">Manajemen kategori program belajar, orang tua, dan histori paket.</p>
                        </div>
                        <button
                            onClick={() => handleOpenStudentModal()}
                            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                        >
                            <Plus className="w-4 h-4" /> Tambah Siswa Baru
                        </button>
                    </div>

                    <div className="min-w-0 max-w-full overflow-x-auto">
                        <table className="w-full min-w-[56rem] text-left text-xs font-sans">
                            <thead className="border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-semibold tracking-wider bg-slate-50/50 dark:bg-white/[0.02]">
                                <tr>
                                    <th className="py-3 px-4 w-12 text-center">No</th>
                                    <th className="py-3 px-4">Nama Siswa</th>
                                    <th className="py-3 px-4">Kategori Les</th>
                                    <th className="py-3 px-4">Orang Tua & WA</th>
                                    <th className="py-3 px-4 text-center">Sesi / Siklus</th>
                                    <th className="py-3 px-4">Biaya / 8 Sesi</th>
                                    <th className="py-3 px-4">Status Tagihan</th>
                                    <th className="py-3 px-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200/60 dark:divide-white/5">
                                {filteredStudents.map((st, idx) => (
                                    <tr key={st.id} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors">
                                        <td className="py-3 px-4 text-center font-mono text-slate-400">{idx + 1}</td>
                                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{st.name}</td>
                                        <td className="py-3 px-4">
                                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-cyan-500/10 text-cyan-700 dark:text-cyan-400">
                                                {st.category}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="text-slate-800 dark:text-slate-200">{st.parent_name || '-'}</div>
                                            <div className="text-[11px] font-mono text-slate-500">{st.whatsapp}</div>
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400">{st.total_meetings} Sesi</span>
                                            <div className="text-[10px] text-slate-500">Siklus {st.current_cycle}</div>
                                        </td>
                                        <td className="py-3 px-4 font-mono font-semibold text-slate-800 dark:text-slate-200">
                                            {formatRupiah(st.fee_per_cycle)}
                                        </td>
                                        <td className="py-3 px-4">
                                            {st.needs_payment_reminder ? (
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                                                    Belum Bayar (Bebas Absen)
                                                </span>
                                            ) : (
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                                                    ✓ Lunas
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button
                                                    onClick={() => handleOpenAttendance(st)}
                                                    className="px-2.5 py-1 rounded-lg bg-[#005792] text-white text-[11px] font-bold hover:bg-[#00487a]"
                                                >
                                                    + Absen
                                                </button>
                                                <button
                                                    onClick={() => handleOpenPayment(st)}
                                                    className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-bold hover:bg-emerald-500"
                                                >
                                                    Bayar
                                                </button>
                                                <button
                                                    onClick={() => handleOpenStudentModal(st)}
                                                    className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10"
                                                >
                                                    <Pencil className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteStudent(st)}
                                                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ── 5. VIEW 3: LOG RIWAYAT SELURUH PRESENSI ── */}
            {subTab === 'attendances_log' && (
                <div className="rounded-3xl bg-white dark:bg-[#090D16] border border-slate-200/90 dark:border-white/10 shadow-sm overflow-hidden">
                    <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
                        <div>
                            <h3 className="font-heading font-black text-lg text-slate-900 dark:text-white">Log Riwayat Presensi Masuk</h3>
                            <p className="text-xs text-slate-500">Seluruh rekaman absensi yang telah diinput oleh admin.</p>
                        </div>
                        <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                            {allAttendances.length} Catatan Absensi
                        </span>
                    </div>

                    <div className="min-w-0 max-w-full overflow-x-auto">
                        <table className="w-full min-w-[56rem] text-left text-xs font-sans">
                            <thead className="border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-semibold tracking-wider bg-slate-50/50 dark:bg-white/[0.02]">
                                <tr>
                                    <th className="py-3 px-4 w-12 text-center">No</th>
                                    <th className="py-3 px-4">Tanggal</th>
                                    <th className="py-3 px-4">Nama Siswa</th>
                                    <th className="py-3 px-4">Kategori Les</th>
                                    <th className="py-3 px-4 text-center">Pertemuan Ke</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4">Materi / Topik</th>
                                    <th className="py-3 px-4">Instruktur</th>
                                    <th className="py-3 px-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200/60 dark:divide-white/5">
                                {allAttendances.map((att, idx) => (
                                    <tr key={att.id} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors">
                                        <td className="py-3 px-4 text-center font-mono text-slate-400">{idx + 1}</td>
                                        <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-300">
                                            {String(att.date || '').slice(0, 10)}
                                        </td>
                                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{att.student_name}</td>
                                        <td className="py-3 px-4 text-cyan-600 dark:text-cyan-400 font-medium">{att.category}</td>
                                        <td className="py-3 px-4 text-center">
                                            <span className="font-mono font-bold text-slate-900 dark:text-white">#{att.meeting_number}</span>
                                            <span className="text-[10px] text-slate-400 block font-mono">Siklus {att.cycle_number} ({att.session_in_cycle}/8)</span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                                att.status === 'hadir' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' :
                                                att.status === 'izin' ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400' :
                                                att.status === 'sakit' ? 'bg-sky-500/15 text-sky-600 dark:text-sky-400' :
                                                'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                                            }`}>
                                                {att.status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 max-w-xs truncate text-slate-700 dark:text-slate-300">
                                            {att.topic || '-'}
                                        </td>
                                        <td className="py-3 px-4 text-slate-500 dark:text-slate-400">{att.mentor_name || '-'}</td>
                                        <td className="py-3 px-4 text-right">
                                            <button
                                                onClick={() => handleDeleteAttendance(att)}
                                                className="p-1 rounded-lg text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                                                title="Hapus Catatan Absen"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ── 6. VIEW 4: BUKU KAS & PEMBAYARAN LANGIT EDUCATION ── */}
            {subTab === 'payments_log' && (
                <div className="rounded-3xl bg-white dark:bg-[#090D16] border border-slate-200/90 dark:border-white/10 shadow-sm overflow-hidden">
                    <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h3 className="font-heading font-black text-lg text-slate-900 dark:text-white">Buku Kas & Riwayat Pembayaran</h3>
                            <p className="text-xs text-slate-500">Catatan pemasukan uang paket 8 sesi pertemuan Langit Education.</p>
                        </div>
                        <div className="text-right font-mono">
                            <span className="text-[11px] text-slate-400 block uppercase">Total Saldo Masuk:</span>
                            <span className="text-base font-bold text-emerald-500">{formatRupiah(financials.total_income || 0)}</span>
                        </div>
                    </div>

                    <div className="min-w-0 max-w-full overflow-x-auto">
                        <table className="w-full min-w-[56rem] text-left text-xs font-sans">
                            <thead className="border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-semibold tracking-wider bg-slate-50/50 dark:bg-white/[0.02]">
                                <tr>
                                    <th className="py-3 px-4 w-12 text-center">No</th>
                                    <th className="py-3 px-4">No. Kuitansi</th>
                                    <th className="py-3 px-4">Tanggal Bayar</th>
                                    <th className="py-3 px-4">Nama Siswa</th>
                                    <th className="py-3 px-4">Kategori Les</th>
                                    <th className="py-3 px-4 text-center">Siklus</th>
                                    <th className="py-3 px-4">Nominal</th>
                                    <th className="py-3 px-4">Metode</th>
                                    <th className="py-3 px-4">Catatan</th>
                                    <th className="py-3 px-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200/60 dark:divide-white/5">
                                {allPayments.map((pay, idx) => (
                                    <tr key={pay.id} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors">
                                        <td className="py-3 px-4 text-center font-mono text-slate-400">{idx + 1}</td>
                                        <td className="py-3 px-4 font-mono font-bold text-cyan-600 dark:text-cyan-400">{pay.receipt_number}</td>
                                        <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-300">{String(pay.payment_date || '').slice(0, 10)}</td>
                                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{pay.student_name}</td>
                                        <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{pay.category}</td>
                                        <td className="py-3 px-4 text-center">
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600">
                                                Siklus {pay.cycle_number}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                            {formatRupiah(pay.amount)}
                                        </td>
                                        <td className="py-3 px-4 uppercase font-mono font-semibold text-slate-700 dark:text-slate-300">
                                            {pay.payment_method}
                                        </td>
                                        <td className="py-3 px-4 max-w-xs truncate text-slate-500">{pay.notes || '-'}</td>
                                        <td className="py-3 px-4 text-right">
                                            <button
                                                onClick={() => handleDeletePayment(pay)}
                                                className="p-1 rounded-lg text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                                                title="Hapus Catatan Pembayaran"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ── 7. MODAL INPUT ABSENSI (ADMIN INPUT) ── */}
            {attendanceModal.open && attendanceModal.student && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white dark:bg-[#0c1220] rounded-3xl border border-slate-200 dark:border-white/10 p-6 sm:p-8 w-full max-w-lg shadow-2xl my-8 space-y-5 animate-scaleUp">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
                            <div>
                                <h3 className="font-heading font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
                                    <UserCheck className="w-5 h-5 text-cyan-500" />
                                    <span>Input Presensi Langit Education</span>
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Siswa: <strong className="text-slate-900 dark:text-white">{attendanceModal.student.name}</strong> • {attendanceModal.student.category}
                                </p>
                            </div>
                            <button
                                onClick={() => setAttendanceModal({ open: false, student: null, meetingNumber: 1 })}
                                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Non-blocking Informative Banner (Aturan Opsional Bayar) */}
                        <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-950 dark:text-cyan-200 space-y-1">
                            <div className="flex items-center gap-2 font-bold">
                                <Sparkles className="w-4 h-4 text-cyan-500 shrink-0" />
                                <span>Pertemuan Ke-{attendanceModal.meetingNumber} (Siklus {intdivSafe(attendanceModal.meetingNumber - 1, 8) + 1} - Sesi {((attendanceModal.meetingNumber - 1) % 8) + 1}/8)</span>
                            </div>
                            <p className="text-[11px] leading-relaxed text-slate-600 dark:text-cyan-300/80">
                                Kebijakan Langit Education: Sesi ke-8 dan seterusnya tidak mengunci absensi. Anda bebas menginput kehadiran tanpa hambatan pembayaran.
                            </p>
                        </div>

                        <form onSubmit={handleSubmitAttendance} className="space-y-4">
                            {/* Tanggal & Pertemuan */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Tanggal Pertemuan:
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={attForm.date}
                                        onChange={(e) => setAttForm({ ...attForm, date: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-xs text-slate-900 dark:text-white font-mono"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Nomor Pertemuan:
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        required
                                        value={attendanceModal.meetingNumber}
                                        onChange={(e) => setAttendanceModal({ ...attendanceModal, meetingNumber: Number(e.target.value) })}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-xs text-slate-900 dark:text-white font-mono font-bold"
                                    />
                                </div>
                            </div>

                            {/* Status Presensi */}
                            <div>
                                <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                    Status Kehadiran Siswa:
                                </label>
                                <div className="grid grid-cols-4 gap-2">
                                    {[
                                        { val: 'hadir', label: 'Hadir', col: 'text-emerald-600 border-emerald-500 bg-emerald-500/10' },
                                        { val: 'izin', label: 'Izin', col: 'text-amber-600 border-amber-500 bg-amber-500/10' },
                                        { val: 'sakit', label: 'Sakit', col: 'text-sky-600 border-sky-500 bg-sky-500/10' },
                                        { val: 'alpa', label: 'Alpa', col: 'text-rose-600 border-rose-500 bg-rose-500/10' },
                                    ].map((opt) => (
                                        <button
                                            type="button"
                                            key={opt.val}
                                            onClick={() => setAttForm({ ...attForm, status: opt.val })}
                                            className={`py-2 px-2 rounded-xl border text-xs font-bold transition-all ${
                                                attForm.status === opt.val
                                                    ? opt.col + ' ring-2 ring-offset-1 ring-cyan-500'
                                                    : 'border-slate-200 dark:border-white/10 text-slate-500 bg-slate-50 dark:bg-white/5'
                                            }`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Topik / Pembahasan Materi */}
                            <div>
                                <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Topik & Materi Pembelajaran:
                                </label>
                                <input
                                    type="text"
                                    placeholder="Contoh: Logika Percabangan If-Else & Flowchart"
                                    value={attForm.topic}
                                    onChange={(e) => setAttForm({ ...attForm, topic: e.target.value })}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-xs text-slate-900 dark:text-white"
                                />

                                {/* Topic Suggestions */}
                                {TOPIC_SUGGESTIONS[attendanceModal.student.category] && (
                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                        {TOPIC_SUGGESTIONS[attendanceModal.student.category].map((sugg) => (
                                            <button
                                                type="button"
                                                key={sugg}
                                                onClick={() => setAttForm({ ...attForm, topic: sugg })}
                                                className="px-2 py-0.5 rounded-lg text-[10px] bg-slate-200/60 dark:bg-white/10 text-slate-700 dark:text-slate-300 hover:bg-cyan-500 hover:text-white transition-colors"
                                            >
                                                + {sugg}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Tentor / Instruktur */}
                            <div>
                                <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Instruktur / Tentor:
                                </label>
                                <input
                                    type="text"
                                    value={attForm.mentor_name}
                                    onChange={(e) => setAttForm({ ...attForm, mentor_name: e.target.value })}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-xs text-slate-900 dark:text-white"
                                />
                            </div>

                            {/* Catatan / Perkembangan Anak */}
                            <div>
                                <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Catatan Perkembangan Anak (Opsional):
                                </label>
                                <textarea
                                    rows="2"
                                    placeholder="Contoh: Anak sangat aktif, tugas logika berhasil diselesaikan tepat waktu."
                                    value={attForm.notes}
                                    onChange={(e) => setAttForm({ ...attForm, notes: e.target.value })}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-xs text-slate-900 dark:text-white"
                                />
                            </div>

                            <div className="pt-2 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setAttendanceModal({ open: false, student: null, meetingNumber: 1 })}
                                    className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-5 py-2.5 rounded-xl bg-[#005792] hover:bg-[#00487a] text-white text-xs font-bold shadow-md shadow-[#005792]/30 disabled:opacity-50 flex items-center gap-2"
                                >
                                    <Check className="w-4 h-4" />
                                    <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Presensi'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── 8. MODAL CATAT PEMBAYARAN KAS ── */}
            {paymentModal.open && paymentModal.student && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white dark:bg-[#0c1220] rounded-3xl border border-slate-200 dark:border-white/10 p-6 sm:p-8 w-full max-w-md shadow-2xl my-8 space-y-5 animate-scaleUp">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
                            <div>
                                <h3 className="font-heading font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
                                    <CreditCard className="w-5 h-5 text-emerald-500" />
                                    <span>Catat Pemasukan Kas Les</span>
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Siswa: <strong className="text-slate-900 dark:text-white">{paymentModal.student.name}</strong>
                                </p>
                            </div>
                            <button
                                onClick={() => setPaymentModal({ open: false, student: null, cycleNumber: 1, amount: 600000 })}
                                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitPayment} className="space-y-4">
                            <div>
                                <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Pembayaran Untuk Paket Siklus Ke:
                                </label>
                                <select
                                    value={paymentModal.cycleNumber}
                                    onChange={(e) => setPaymentModal({ ...paymentModal, cycleNumber: Number(e.target.value) })}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-xs font-bold text-slate-900 dark:text-white"
                                >
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map(c => (
                                        <option key={c} value={c}>Siklus {c} (Pertemuan {(c - 1) * 8 + 1} - {c * 8})</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Nominal Pembayaran (Rp):
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    required
                                    value={payForm.amount}
                                    onChange={(e) => setPayForm({ ...payForm, amount: Number(e.target.value) })}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400"
                                />
                                <span className="text-[11px] text-slate-500 mt-1 block">
                                    Terbilang: {formatRupiah(payForm.amount)}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Tanggal Bayar:
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={payForm.payment_date}
                                        onChange={(e) => setPayForm({ ...payForm, payment_date: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-xs font-mono"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Metode Bayar:
                                    </label>
                                    <select
                                        value={payForm.payment_method}
                                        onChange={(e) => setPayForm({ ...payForm, payment_method: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-xs font-bold uppercase"
                                    >
                                        <option value="transfer">Transfer Bank</option>
                                        <option value="cash">Tunai / Cash</option>
                                        <option value="qris">QRIS Langit</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Keterangan / Catatan Bukti:
                                </label>
                                <textarea
                                    rows="2"
                                    placeholder="Contoh: Transfer BCA an Budi Santoso"
                                    value={payForm.notes}
                                    onChange={(e) => setPayForm({ ...payForm, notes: e.target.value })}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-xs"
                                />
                            </div>

                            <div className="pt-2 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setPaymentModal({ open: false, student: null, cycleNumber: 1, amount: 600000 })}
                                    className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-slate-300"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 disabled:opacity-50 flex items-center gap-2"
                                >
                                    <Check className="w-4 h-4" />
                                    <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Pembayaran'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── 9. MODAL TAMBAH / EDIT ANAK LES ── */}
            {studentModal.open && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white dark:bg-[#0c1220] rounded-3xl border border-slate-200 dark:border-white/10 p-6 sm:p-8 w-full max-w-lg shadow-2xl my-8 space-y-5 animate-scaleUp">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
                            <div>
                                <h3 className="font-heading font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
                                    <GraduationCap className="w-5 h-5 text-emerald-500" />
                                    <span>{studentModal.editing ? 'Edit Data Anak Les' : 'Pendaftaran Anak Les Baru'}</span>
                                </h3>
                                <p className="text-xs text-slate-500">Kategori program les dapat dibedakan per masing-masing anak.</p>
                            </div>
                            <button
                                onClick={() => setStudentModal({ open: false, editing: null })}
                                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitStudent} className="space-y-4">
                            <div>
                                <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Nama Lengkap Siswa / Anak Les:
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Contoh: Alvaro Narendra"
                                    value={stuForm.name}
                                    onChange={(e) => setStuForm({ ...stuForm, name: e.target.value })}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-xs text-slate-900 dark:text-white font-semibold"
                                />
                            </div>

                            {/* Kategori Program Les */}
                            <div>
                                <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Kategori Program Belajar (Berbeda Tiap Anak):
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Pilih atau ketik kategori kustom..."
                                    value={stuForm.category}
                                    onChange={(e) => setStuForm({ ...stuForm, category: e.target.value })}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-xs font-bold text-cyan-600 dark:text-cyan-400"
                                />
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                    {CATEGORY_PRESETS.map((cp) => (
                                        <button
                                            type="button"
                                            key={cp.label}
                                            onClick={() => setStuForm({ ...stuForm, category: cp.label })}
                                            className="px-2 py-0.5 rounded-lg text-[10px] bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-cyan-500"
                                        >
                                            {cp.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Nama Orang Tua / Wali:
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Contoh: Hendra Narendra"
                                        value={stuForm.parent_name}
                                        onChange={(e) => setStuForm({ ...stuForm, parent_name: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-xs"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        No. WhatsApp:
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="08xxxxxxxxxx"
                                        value={stuForm.whatsapp}
                                        onChange={(e) => setStuForm({ ...stuForm, whatsapp: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-xs font-mono"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Biaya per 8 Pertemuan (Rp):
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        required
                                        value={stuForm.fee_per_cycle}
                                        onChange={(e) => setStuForm({ ...stuForm, fee_per_cycle: Number(e.target.value) })}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-xs font-mono font-bold"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Status Siswa:
                                    </label>
                                    <select
                                        value={stuForm.status}
                                        onChange={(e) => setStuForm({ ...stuForm, status: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-xs font-bold"
                                    >
                                        <option value="active">Aktif Les</option>
                                        <option value="inactive">Nonaktif / Cuti</option>
                                        <option value="graduated">Lulus</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Catatan / Minat Khusus Siswa:
                                </label>
                                <textarea
                                    rows="2"
                                    placeholder="Contoh: Tertarik pada robotik ESP32, les diadakan tiap Selasa & Kamis."
                                    value={stuForm.notes}
                                    onChange={(e) => setStuForm({ ...stuForm, notes: e.target.value })}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-xs"
                                />
                            </div>

                            <div className="pt-2 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setStudentModal({ open: false, editing: null })}
                                    className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-slate-300"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 disabled:opacity-50 flex items-center gap-2"
                                >
                                    <Check className="w-4 h-4" />
                                    <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Siswa'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── 10. MODAL DETAIL RIWAYAT SISWA ── */}
            {selectedStudentDetail && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white dark:bg-[#0c1220] rounded-3xl border border-slate-200 dark:border-white/10 p-6 sm:p-8 w-full max-w-2xl shadow-2xl my-8 space-y-6 max-h-[90vh] overflow-y-auto animate-scaleUp">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
                            <div>
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                                    {selectedStudentDetail.category}
                                </span>
                                <h3 className="font-heading font-black text-xl text-slate-900 dark:text-white mt-1">
                                    {selectedStudentDetail.name}
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Ortu: {selectedStudentDetail.parent_name || '-'} • WA: {selectedStudentDetail.whatsapp}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedStudentDetail(null)}
                                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Presensi Sesi Berdasarkan Siklus */}
                        <div className="space-y-4">
                            <h4 className="font-heading font-bold text-sm text-slate-900 dark:text-white flex items-center justify-between">
                                <span>Riwayat Sesi Pertemuan ({selectedStudentDetail.attendances?.length || 0} Sesi)</span>
                                <button
                                    onClick={() => {
                                        const st = selectedStudentDetail;
                                        setSelectedStudentDetail(null);
                                        handleOpenAttendance(st);
                                    }}
                                    className="text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline"
                                >
                                    + Catat Sesi Baru
                                </button>
                            </h4>

                            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                                {(!selectedStudentDetail.attendances || selectedStudentDetail.attendances.length === 0) ? (
                                    <p className="text-xs text-slate-400 italic">Belum ada sesi presensi yang tercatat.</p>
                                ) : (
                                    selectedStudentDetail.attendances.map((att) => (
                                        <div
                                            key={att.id}
                                            className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 flex items-center justify-between gap-3 text-xs"
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-mono font-bold flex items-center justify-center shrink-0">
                                                    #{att.meeting_number}
                                                </span>
                                                <div>
                                                    <div className="font-bold text-slate-900 dark:text-white">
                                                        {att.topic || 'Sesi Pembahasan Modul'}
                                                    </div>
                                                    <div className="text-[11px] text-slate-500">
                                                        {String(att.date || '').slice(0, 10)} • Siklus {att.cycle_number} (Sesi {att.session_in_cycle}/8) • {att.mentor_name}
                                                    </div>
                                                    {att.notes && (
                                                        <div className="text-[11px] text-slate-600 dark:text-slate-400 italic mt-0.5">
                                                            "{att.notes}"
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase shrink-0 ${
                                                att.status === 'hadir' ? 'bg-emerald-500/15 text-emerald-600' :
                                                att.status === 'izin' ? 'bg-amber-500/15 text-amber-600' : 'bg-rose-500/15 text-rose-600'
                                            }`}>
                                                {att.status}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Riwayat Pembayaran Siswa */}
                        <div className="space-y-4 pt-3 border-t border-slate-200 dark:border-white/10">
                            <h4 className="font-heading font-bold text-sm text-slate-900 dark:text-white flex items-center justify-between">
                                <span>Riwayat Pembayaran Kas ({selectedStudentDetail.payments?.length || 0})</span>
                                <button
                                    onClick={() => {
                                        const st = selectedStudentDetail;
                                        setSelectedStudentDetail(null);
                                        handleOpenPayment(st);
                                    }}
                                    className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                                >
                                    + Catat Pembayaran
                                </button>
                            </h4>

                            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                {(!selectedStudentDetail.payments || selectedStudentDetail.payments.length === 0) ? (
                                    <p className="text-xs text-slate-400 italic">Belum ada riwayat pembayaran tercatat.</p>
                                ) : (
                                    selectedStudentDetail.payments.map((pay) => (
                                        <div
                                            key={pay.id}
                                            className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-between gap-3 text-xs"
                                        >
                                            <div>
                                                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                                    <span>Siklus {pay.cycle_number}</span>
                                                    <span className="font-mono text-cyan-600 dark:text-cyan-400 text-[11px] font-normal">{pay.receipt_number}</span>
                                                </div>
                                                <div className="text-[11px] text-slate-500">
                                                    {String(pay.payment_date || '').slice(0, 10)} • Metode: <strong className="uppercase">{pay.payment_method}</strong>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 block">
                                                    {formatRupiah(pay.amount)}
                                                </span>
                                                <span className="text-[10px] text-emerald-500">✓ Lunas</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="pt-2 flex justify-between items-center border-t border-slate-200 dark:border-white/10">
                            <button
                                type="button"
                                onClick={() => handleSendWhatsApp(selectedStudentDetail, selectedStudentDetail.needs_payment_reminder ? 'billing' : 'summary')}
                                className="px-3 py-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold inline-flex items-center gap-1.5"
                            >
                                <MessageCircle className="w-4 h-4" /> Kirim Rincian via WA
                            </button>
                            <button
                                type="button"
                                onClick={() => setSelectedStudentDetail(null)}
                                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/10 text-xs font-bold text-slate-700 dark:text-slate-300"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function intdivSafe(val, divisor) {
    if (val < 0) return 0;
    return Math.floor(val / divisor);
}
