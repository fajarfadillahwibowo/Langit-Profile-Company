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
    Award,
    Layers,
    History,
    Calendar,
    ChevronDown,
    ListFilter,
    LayoutGrid,
    Table as TableIcon
} from 'lucide-react';

const CATEGORY_PRESETS = [
    { label: 'Coding & Robotik (AI & Python)', icon: Terminal, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30' },
    { label: 'Microsoft Office & Administrasi', icon: FileSpreadsheet, color: 'text-sky-500 bg-sky-500/10 border-sky-500/30' },
    { label: 'Hardware & Perakitan PC Lab', icon: Cpu, color: 'text-amber-500 bg-amber-500/10 border-amber-500/30' },
    { label: 'Desain Grafis & Multimedia', icon: Palette, color: 'text-purple-500 bg-purple-500/10 border-purple-500/30' },
    { label: 'Web Development (HTML/CSS & React)', icon: Sparkles, color: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/30' },
];

const TOPIC_SUGGESTIONS = {
    'Coding': [
        'Algoritma & Logika Komputasi',
        'Sintaks Python & Variabel',
        'Percabangan Logika If-Else',
        'Perulangan For & While Loop',
        'Fungsi (Def) & Modul Kode',
        'Robotik Sensor & Arduino/ESP32',
        'Mini Project Game Interaktif'
    ],
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

function formatDate(dateStr) {
    if (!dateStr) return '-';
    return String(dateStr).slice(0, 10);
}

function cleanWhatsAppNumber(phone) {
    if (!phone) return '';
    let p = String(phone).replace(/\D/g, '');
    if (p.startsWith('0')) p = '62' + p.slice(1);
    return p;
}

// Generate cycle groups for a student (Siklus 1, 2, 3...)
function getStudentCycleGroups(student) {
    const totalMeetings = student.total_meetings || 0;
    const activeCycle = Math.floor(totalMeetings / 8) + 1;
    const attendances = student.attendances || [];
    const payments = student.payments || [];

    let maxCycle = activeCycle;
    attendances.forEach(a => { if (a.cycle_number > maxCycle) maxCycle = a.cycle_number; });
    payments.forEach(p => { if (p.cycle_number > maxCycle) maxCycle = p.cycle_number; });

    const cycles = [];
    for (let c = 1; c <= maxCycle; c++) {
        const startMeeting = (c - 1) * 8 + 1;
        const endMeeting = c * 8;
        const cycleAttendances = attendances.filter(a => a.cycle_number === c || (a.meeting_number >= startMeeting && a.meeting_number <= endMeeting));
        const cyclePayment = payments.find(p => p.cycle_number === c && p.status === 'paid');

        let cycleTitle = '';
        if (c === 1) cycleTitle = '8 Sesi Pertama (Pertemuan 1 - 8)';
        else if (c === 2) cycleTitle = '8 Sesi Kedua (Pertemuan 9 - 16)';
        else if (c === 3) cycleTitle = '8 Sesi Ketiga (Pertemuan 17 - 24)';
        else if (c === 4) cycleTitle = '8 Sesi Keempat (Pertemuan 25 - 32)';
        else cycleTitle = `8 Sesi Ke-${c} (Pertemuan ${startMeeting} - ${endMeeting})`;

        cycles.push({
            cycleNumber: c,
            title: cycleTitle,
            shortLabel: `Siklus ${c}`,
            startMeeting,
            endMeeting,
            attendances: cycleAttendances,
            attendancesCount: cycleAttendances.length,
            isCompleted: cycleAttendances.length >= 8,
            isActive: c === activeCycle,
            payment: cyclePayment,
            isPaid: Boolean(cyclePayment),
        });
    }
    return cycles;
}

export default function AdminEducationAttendance({ students = [], financials = {} }) {
    const [subTab, setSubTab] = useState('punch_cards'); // 'punch_cards', 'all_cycles', 'students_table', 'attendances_log', 'payments_log'
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [paymentFilter, setPaymentFilter] = useState('all'); // 'all', 'needs_payment', 'paid'

    // Selected cycle per student on punch card view
    const [studentCycleView, setStudentCycleView] = useState({});

    // Detailed cycle modal state
    const [detailCycleStudent, setDetailCycleStudent] = useState(null);
    const [modalCycleFilter, setModalCycleFilter] = useState('all'); // 'all' or cycleNumber
    const [modalViewMode, setModalViewMode] = useState('cards'); // 'cards' or 'table'

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
        const targetCycle = cycleNumber || (student.active_cycle || student.current_cycle || 1);
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
    const handleSendWhatsApp = (student, type = 'billing', cycleNumber = null) => {
        const cleanPhone = cleanWhatsAppNumber(student.whatsapp);
        if (!cleanPhone) {
            alert('Nomor WhatsApp belum valid.');
            return;
        }

        const totalMeetings = student.total_meetings || 0;
        const currentCycle = cycleNumber || (student.active_cycle || 1);
        const feeFormatted = formatRupiah(student.fee_per_cycle || 600000);

        let msg = '';
        if (type === 'billing') {
            msg = `Halo Bapak/Ibu ${student.parent_name || 'Orang Tua'} dari ananda *${student.name}*.\n\n` +
                `Kami dari *Langit Education* ingin menginformasikan rekap presensi belajar:\n` +
                `• Program: *${student.category}*\n` +
                `• Total Kehadiran: *${totalMeetings} kali pertemuan*\n` +
                `• Periode Belajar: *Siklus ${currentCycle}*\n` +
                `• Biaya Paket 8 Sesi: *${feeFormatted}*\n\n` +
                `_Catatan Penting: Sesuai kebijakan Langit Education, absensi pertemuan berikutnya tetap dapat berjalan lancar tanpa terkunci._\n\n` +
                `Pembayaran dapat ditransfer via rekening bank / QRIS Langit Creative. Terima kasih atas kerja sama dan kepercayaan Bapak/Ibu! 🙏`;
        } else {
            msg = `Halo Bapak/Ibu ${student.parent_name || 'Orang Tua'} dari ananda *${student.name}*.\n\n` +
                `Update presensi belajar *Langit Education* (${student.category}):\n` +
                `• Total Pertemuan: *${totalMeetings} sesi*\n` +
                `• Sesi Aktif: Siklus ${currentCycle}\n` +
                `• Evaluasi: Ananda aktif mengikuti materi dan praktik di lab.\n\n` +
                `Terima kasih! Salam hangat dari Tim Instruktur Langit Education.`;
        }

        window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
    };

    return (
        <div className="space-y-8 animate-fadeIn [overflow-wrap:normal] break-normal">
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
                            Sistem presensi per 8 pertemuan tanpa sesi terhenti—ketika 8 sesi lengkap, langsung otomatis membuka siklus sesi absen baru. Riwayat lengkap dapat dilihat per siklus ke-1, 2, 3, dan seterusnya.
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

                    {/* TAB: Riwayat Lengkap Semua Siklus */}
                    <button
                        onClick={() => setSubTab('all_cycles')}
                        className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                            subTab === 'all_cycles'
                                ? 'bg-white dark:bg-slate-900 text-[#005792] dark:text-cyan-400 shadow-xs'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                        <Layers className="w-3.5 h-3.5 text-cyan-500" />
                        <span>Riwayat Semua Siklus (1, 2, 3...)</span>
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
                        <span>Log Presensi</span>
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
                        <span>Buku Kas</span>
                    </button>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-2.5">
                    {/* Search */}
                    <div className="relative min-w-[180px]">
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

            {/* ── 3. VIEW 1: KARTU PRESENSI 8 SESI (AUTO-ADVANCE SESI BARU) ── */}
            {subTab === 'punch_cards' && (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {filteredStudents.length === 0 ? (
                        <div className="col-span-full p-12 text-center rounded-3xl bg-white dark:bg-[#090D16] border border-slate-200/90 dark:border-white/10">
                            <GraduationCap className="w-12 h-12 text-slate-400 mx-auto mb-3 opacity-50" />
                            <h4 className="font-heading font-bold text-base text-slate-900 dark:text-white">Tidak ada data anak les</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Coba sesuaikan kata kunci pencarian atau tambah anak les baru.</p>
                            <button
                                onClick={() => handleOpenStudentModal()}
                                className="mt-4 px-4 py-2 rounded-xl bg-cyan-600 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                            >
                                <Plus className="w-4 h-4" /> Tambah Siswa Sekarang
                            </button>
                        </div>
                    ) : (
                        filteredStudents.map((student) => {
                            const totalMeetings = student.total_meetings || 0;
                            const activeCycle = Math.floor(totalMeetings / 8) + 1;
                            const nextMeetingNumber = totalMeetings + 1;

                            // All cycle groups for this student
                            const cycleGroups = getStudentCycleGroups(student);

                            // The cycle currently selected in the UI card (defaults to activeCycle)
                            const currentViewedCycle = studentCycleView[student.id] || activeCycle;
                            const currentCycleObj = cycleGroups.find(c => c.cycleNumber === currentViewedCycle) || cycleGroups[cycleGroups.length - 1];

                            const isCurrentCyclePaid = currentCycleObj?.isPaid;
                            const cycleAttendances = currentCycleObj?.attendances || [];
                            const sessionsInThisCycle = cycleAttendances.length;

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
                                                {isCurrentCyclePaid ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                                        <span>Lunas Siklus {currentViewedCycle}</span>
                                                    </span>
                                                ) : (
                                                    <div className="space-y-1">
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                                                            <AlertCircle className="w-3.5 h-3.5" />
                                                            <span>Tagihan Siklus {currentViewedCycle}</span>
                                                        </span>
                                                        <div className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400">
                                                            (Bebas Absen Lanjut)
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Cycle Switcher Navigation Pills (Siklus 1, 2, 3...) */}
                                        <div className="pt-2 pb-1 flex flex-wrap items-center gap-1.5 border-t border-slate-100 dark:border-white/5">
                                            <span className="text-[10px] font-mono font-bold text-slate-400 mr-1 uppercase">Pilih Siklus:</span>
                                            {cycleGroups.map((cg) => {
                                                const isSelected = cg.cycleNumber === currentViewedCycle;
                                                return (
                                                    <button
                                                        key={cg.cycleNumber}
                                                        onClick={() => setStudentCycleView({ ...studentCycleView, [student.id]: cg.cycleNumber })}
                                                        className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                                            isSelected
                                                                ? 'bg-[#005792] text-white shadow-xs'
                                                                : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
                                                        }`}
                                                    >
                                                        <span>{cg.shortLabel}</span>
                                                        <span className={`text-[10px] px-1 py-0.2 rounded-md ${
                                                            isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-white/10'
                                                        }`}>
                                                            {cg.attendancesCount}/8
                                                        </span>
                                                        {cg.isCompleted && <span className="text-emerald-400 text-xs">✓</span>}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* ── 8-SESSION INTERACTIVE PUNCH CARD ── */}
                                    <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/5 space-y-3">
                                        <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                                            <span className="text-slate-800 dark:text-slate-200">
                                                {currentCycleObj?.title || `Siklus ${currentViewedCycle}`}
                                            </span>
                                            <span className="text-[11px] text-cyan-600 dark:text-cyan-400 font-semibold">
                                                {formatRupiah(student.fee_per_cycle)} / 8 sesi
                                            </span>
                                        </div>

                                        {/* 8 Punch Track Discs */}
                                        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                                            {[1, 2, 3, 4, 5, 6, 7, 8].map((slotIdx) => {
                                                const meetingTargetNumber = (currentViewedCycle - 1) * 8 + slotIdx;
                                                const attRecord = cycleAttendances.find(
                                                    a => a.meeting_number === meetingTargetNumber || a.session_in_cycle === slotIdx
                                                );
                                                const isFilled = Boolean(attRecord);
                                                const isNextTarget = !isFilled && meetingTargetNumber === nextMeetingNumber;

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
                                                        key={slotIdx}
                                                        onClick={() => {
                                                            if (!attRecord) {
                                                                handleOpenAttendance(student, meetingTargetNumber);
                                                            } else {
                                                                setDetailCycleStudent(student);
                                                                setModalCycleFilter(currentViewedCycle);
                                                            }
                                                        }}
                                                        title={attRecord ? `Pertemuan #${attRecord.meeting_number} (${attRecord.status}): ${attRecord.topic || 'Belum ada catatan materi'}` : `Klik untuk absen pertemuan #${meetingTargetNumber}`}
                                                        className={`relative flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all cursor-pointer hover:scale-105 min-h-[60px] ${statusColor}`}
                                                    >
                                                        <span className="text-[10px] font-mono font-bold opacity-80 mb-0.5">#{meetingTargetNumber}</span>
                                                        <div className="flex items-center justify-center h-5">
                                                            {icon ? icon : (
                                                                <span className="text-xs font-bold font-mono">
                                                                    {isNextTarget ? 'Absen' : slotIdx}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {attRecord?.date && (
                                                            <span className="text-[9px] font-mono mt-1 opacity-90 truncate max-w-full">
                                                                {formatDate(attRecord.date).slice(5)}
                                                            </span>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Status Bar: Sesi Baru Otomatis Terbuka */}
                                        <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs">
                                            <div className="flex items-center gap-2">
                                                <Sparkles className="w-4 h-4 text-cyan-500 shrink-0" />
                                                <span className="text-slate-700 dark:text-slate-300">
                                                    {currentCycleObj?.isCompleted ? (
                                                        <>
                                                            <strong className="text-emerald-600 dark:text-emerald-400">8/8 Sesi Selesai.</strong>{' '}
                                                            {activeCycle > currentViewedCycle ? (
                                                                <button
                                                                    onClick={() => setStudentCycleView({ ...studentCycleView, [student.id]: activeCycle })}
                                                                    className="font-bold text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer"
                                                                >
                                                                    Buka Sesi Baru Siklus {activeCycle} (Sesi #{nextMeetingNumber}) →
                                                                </button>
                                                            ) : 'Siap mulai sesi berikutnya.'}
                                                        </>
                                                    ) : (
                                                        <>
                                                            Siklus {currentViewedCycle} aktif • Sesi berikutnya: <strong className="text-cyan-600 dark:text-cyan-400">Pertemuan #{nextMeetingNumber}</strong>
                                                        </>
                                                    )}
                                                </span>
                                            </div>

                                            {!isCurrentCyclePaid && (
                                                <button
                                                    onClick={() => handleOpenPayment(student, currentViewedCycle)}
                                                    className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] shrink-0 cursor-pointer"
                                                >
                                                    Catat Bayar Siklus {currentViewedCycle}
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Buttons Row */}
                                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-white/5">
                                        <div className="flex items-center gap-1.5">
                                            {/* Quick Attendance: Always points to the next real meeting */}
                                            <button
                                                type="button"
                                                onClick={() => handleOpenAttendance(student, nextMeetingNumber)}
                                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#005792] hover:bg-[#00487a] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                                            >
                                                <UserCheck className="w-3.5 h-3.5" />
                                                <span>Absen Sesi #{nextMeetingNumber}</span>
                                            </button>

                                            {/* Record Payment */}
                                            <button
                                                type="button"
                                                onClick={() => handleOpenPayment(student, currentViewedCycle)}
                                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold border border-emerald-600/20 transition-all cursor-pointer"
                                            >
                                                <CreditCard className="w-3.5 h-3.5" />
                                                <span>Catat Bayar</span>
                                            </button>
                                        </div>

                                        <div className="flex items-center gap-1">
                                            {/* Button: Lihat Lengkap Semua Sesi (Clean & Prominent) */}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setDetailCycleStudent(student);
                                                    setModalCycleFilter('all');
                                                }}
                                                title={`Lihat lengkap riwayat seluruh sesi untuk ${student.name}`}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 text-xs font-bold transition-all cursor-pointer shadow-xs"
                                            >
                                                <History className="w-3.5 h-3.5" />
                                                <span>Semua Sesi ({totalMeetings})</span>
                                            </button>

                                            {/* WhatsApp Ortu */}
                                            <button
                                                type="button"
                                                onClick={() => handleSendWhatsApp(student, student.needs_payment_reminder ? 'billing' : 'summary', currentViewedCycle)}
                                                title="Hubungi WhatsApp Orang Tua"
                                                className="p-2 rounded-xl text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 transition-colors cursor-pointer"
                                            >
                                                <MessageCircle className="w-4 h-4" />
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

                                            {/* Delete Student */}
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteStudent(student)}
                                                title="Hapus Siswa"
                                                className="p-2 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}

            {/* ── 4. VIEW 2: RIWAYAT LENGKAP SEMUA SIKLUS (MATRIX 1, 2, 3...) ── */}
            {subTab === 'all_cycles' && (
                <div className="space-y-6 [overflow-wrap:normal] break-normal">
                    <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-[#090D16] border border-slate-200/90 dark:border-white/10 shadow-sm flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <h3 className="font-heading font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
                                <Layers className="w-5 h-5 text-cyan-500" />
                                <span>Detail Riwayat Lengkap Seluruh Sesi (Siklus 1, 2, 3...)</span>
                            </h3>
                            <p className="text-xs text-slate-500">
                                Rekap kronologis 8 sesi pertama, kedua, ketiga, dan seterusnya per masing-masing anak les.
                            </p>
                        </div>
                        <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                            {filteredStudents.length} Siswa Terdaftar
                        </span>
                    </div>

                    {filteredStudents.map((student) => {
                        const cycleGroups = getStudentCycleGroups(student);
                        const totalMeetings = student.total_meetings || 0;

                        return (
                            <div
                                key={student.id}
                                className="p-6 rounded-3xl bg-white dark:bg-[#0c1220] border border-slate-200/90 dark:border-white/10 shadow-sm space-y-6"
                            >
                                {/* Header Siswa */}
                                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-white/5">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold uppercase bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                                                {student.category}
                                            </span>
                                            <span className="text-xs text-slate-400 font-mono">
                                                Total {totalMeetings} Sesi Pertemuan
                                            </span>
                                        </div>
                                        <h4 className="font-heading font-black text-xl text-slate-900 dark:text-white">
                                            {student.name}
                                        </h4>
                                        <p className="text-xs text-slate-500">
                                            Orang Tua: <span className="font-semibold text-slate-700 dark:text-slate-300">{student.parent_name || '-'}</span> • WA: {student.whatsapp}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleOpenAttendance(student, totalMeetings + 1)}
                                            className="px-3 py-1.5 rounded-xl bg-[#005792] text-white text-xs font-bold hover:bg-[#00487a] cursor-pointer"
                                        >
                                            + Absen Sesi #{totalMeetings + 1}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setDetailCycleStudent(student);
                                                setModalCycleFilter('all');
                                            }}
                                            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer"
                                        >
                                            Buka Modal Penuh ↗
                                        </button>
                                    </div>
                                </div>

                                {/* Siklus-Siklus Siswa (8 Sesi Pertama, Kedua, Ketiga...) */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    {cycleGroups.map((cg) => (
                                        <div
                                            key={cg.cycleNumber}
                                            className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200/70 dark:border-white/5 space-y-3"
                                        >
                                            {/* Cycle Header */}
                                            <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-200/50 dark:border-white/5">
                                                <div>
                                                    <span className="font-heading font-bold text-sm text-slate-900 dark:text-white block">
                                                        {cg.title}
                                                    </span>
                                                    <span className="text-[11px] font-mono text-slate-500">
                                                        Progres: {cg.attendancesCount}/8 Sesi Hadir
                                                    </span>
                                                </div>

                                                {cg.isPaid ? (
                                                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                                        ✓ Lunas ({cg.payment?.receipt_number || 'Kuitansi'})
                                                    </span>
                                                ) : (
                                                    <button
                                                        onClick={() => handleOpenPayment(student, cg.cycleNumber)}
                                                        className="px-2 py-0.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-[10px] cursor-pointer"
                                                    >
                                                        + Bayar {formatRupiah(student.fee_per_cycle)}
                                                    </button>
                                                )}
                                            </div>

                                            {/* Sesi-Sesi di dalam Siklus */}
                                            {cg.attendances.length === 0 ? (
                                                <div className="p-4 text-center rounded-xl border border-dashed border-slate-300 dark:border-white/10 text-xs text-slate-400">
                                                    Sesi baru siap dimulai (Belum ada absensi di {cg.shortLabel}).
                                                    <button
                                                        onClick={() => handleOpenAttendance(student, cg.startMeeting)}
                                                        className="mt-2 block mx-auto text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer"
                                                    >
                                                        + Mulai Pertemuan #{cg.startMeeting}
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                                                    {cg.attendances.map((att) => (
                                                        <div
                                                            key={att.id}
                                                            className="p-3 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200/70 dark:border-white/5 shadow-xs flex items-start justify-between gap-3 text-xs"
                                                        >
                                                            <div className="flex items-start gap-2.5 min-w-0">
                                                                <span className="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-mono font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                                                                    #{att.meeting_number}
                                                                </span>
                                                                <div className="min-w-0 space-y-0.5">
                                                                    <div className="font-bold text-slate-900 dark:text-white leading-tight">
                                                                        {att.topic || 'Sesi Pembahasan Materi'}
                                                                    </div>
                                                                    <div className="text-[11px] text-slate-500 font-mono flex items-center gap-2">
                                                                        <span>{formatDate(att.date)}</span>
                                                                        <span>•</span>
                                                                        <span>{att.mentor_name || 'Instruktur'}</span>
                                                                    </div>
                                                                    {att.notes && (
                                                                        <div className="text-[11px] text-slate-600 dark:text-slate-400 italic">
                                                                            "{att.notes}"
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-1.5 shrink-0">
                                                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                                                                    att.status === 'hadir' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' :
                                                                    att.status === 'izin' ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400' :
                                                                    'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                                                                }`}>
                                                                    {att.status}
                                                                </span>
                                                                <button
                                                                    onClick={() => handleDeleteAttendance(att)}
                                                                    className="p-1 rounded text-slate-400 hover:text-rose-500 cursor-pointer"
                                                                    title="Hapus Sesi"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ── 5. VIEW 3: TABEL DAFTAR SISWA (DATA MANAGEMENT) ── */}
            {subTab === 'students_table' && (
                <div className="rounded-3xl bg-white dark:bg-[#090D16] border border-slate-200/90 dark:border-white/10 shadow-sm overflow-hidden [overflow-wrap:normal] break-normal">
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
                        <table className="w-full min-w-[700px] text-left text-xs font-sans">
                            <thead className="border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-semibold tracking-wider bg-slate-50/50 dark:bg-white/[0.02]">
                                <tr>
                                    <th className="py-3 px-4 w-12 text-center whitespace-nowrap">No</th>
                                    <th className="py-3 px-4 whitespace-nowrap">Nama Siswa</th>
                                    <th className="py-3 px-4 whitespace-nowrap">Kategori Les</th>
                                    <th className="py-3 px-4 whitespace-nowrap">Orang Tua & WA</th>
                                    <th className="py-3 px-4 text-center whitespace-nowrap">Sesi / Siklus</th>
                                    <th className="py-3 px-4 whitespace-nowrap">Biaya / 8 Sesi</th>
                                    <th className="py-3 px-4 whitespace-nowrap">Status Tagihan</th>
                                    <th className="py-3 px-4 text-right whitespace-nowrap">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200/60 dark:divide-white/5">
                                {filteredStudents.map((st, idx) => (
                                    <tr key={st.id} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors">
                                        <td className="py-3 px-4 text-center font-mono text-slate-400">{idx + 1}</td>
                                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white whitespace-nowrap">{st.name}</td>
                                        <td className="py-3 px-4 whitespace-nowrap">
                                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-cyan-500/10 text-cyan-700 dark:text-cyan-400">
                                                {st.category}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 whitespace-nowrap">
                                            <div className="text-slate-800 dark:text-slate-200">{st.parent_name || '-'}</div>
                                            <div className="text-[11px] font-mono text-slate-500">{st.whatsapp}</div>
                                        </td>
                                        <td className="py-3 px-4 text-center whitespace-nowrap">
                                            <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400">{st.total_meetings} Sesi</span>
                                            <div className="text-[10px] text-slate-500">Siklus {st.active_cycle || st.current_cycle}</div>
                                        </td>
                                        <td className="py-3 px-4 font-mono font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                                            {formatRupiah(st.fee_per_cycle)}
                                        </td>
                                        <td className="py-3 px-4 whitespace-nowrap">
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
                                        <td className="py-3 px-4 text-right whitespace-nowrap">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button
                                                    onClick={() => {
                                                        setDetailCycleStudent(st);
                                                        setModalCycleFilter('all');
                                                    }}
                                                    className="px-2 py-1 rounded-lg bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 text-[11px] font-bold hover:bg-cyan-500/20 cursor-pointer"
                                                    title="Lihat Semua Sesi Lengkap"
                                                >
                                                    Semua Sesi
                                                </button>
                                                <button
                                                    onClick={() => handleOpenAttendance(st, (st.total_meetings || 0) + 1)}
                                                    className="px-2.5 py-1 rounded-lg bg-[#005792] text-white text-[11px] font-bold hover:bg-[#00487a] cursor-pointer"
                                                >
                                                    + Absen
                                                </button>
                                                <button
                                                    onClick={() => handleOpenPayment(st)}
                                                    className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-bold hover:bg-emerald-500 cursor-pointer"
                                                >
                                                    Bayar
                                                </button>
                                                <button
                                                    onClick={() => handleOpenStudentModal(st)}
                                                    className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 cursor-pointer"
                                                >
                                                    <Pencil className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteStudent(st)}
                                                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 cursor-pointer"
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

            {/* ── 6. VIEW 4: LOG RIWAYAT SELURUH PRESENSI ── */}
            {subTab === 'attendances_log' && (
                <div className="rounded-3xl bg-white dark:bg-[#090D16] border border-slate-200/90 dark:border-white/10 shadow-sm overflow-hidden [overflow-wrap:normal] break-normal">
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
                        <table className="w-full min-w-[700px] text-left text-xs font-sans">
                            <thead className="border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-semibold tracking-wider bg-slate-50/50 dark:bg-white/[0.02]">
                                <tr>
                                    <th className="py-3 px-4 w-12 text-center whitespace-nowrap">No</th>
                                    <th className="py-3 px-4 whitespace-nowrap">Tanggal</th>
                                    <th className="py-3 px-4 whitespace-nowrap">Nama Siswa</th>
                                    <th className="py-3 px-4 whitespace-nowrap">Kategori Les</th>
                                    <th className="py-3 px-4 text-center whitespace-nowrap">Pertemuan Ke</th>
                                    <th className="py-3 px-4 text-center whitespace-nowrap">Status</th>
                                    <th className="py-3 px-4 min-w-[200px]">Materi / Topik</th>
                                    <th className="py-3 px-4 whitespace-nowrap">Instruktur</th>
                                    <th className="py-3 px-4 text-right whitespace-nowrap">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200/60 dark:divide-white/5">
                                {allAttendances.map((att, idx) => (
                                    <tr key={att.id} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors">
                                        <td className="py-3 px-4 text-center font-mono text-slate-400">{idx + 1}</td>
                                        <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-300 whitespace-nowrap">
                                            {formatDate(att.date)}
                                        </td>
                                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white whitespace-nowrap">{att.student_name}</td>
                                        <td className="py-3 px-4 text-cyan-600 dark:text-cyan-400 font-medium whitespace-nowrap">{att.category}</td>
                                        <td className="py-3 px-4 text-center whitespace-nowrap">
                                            <span className="font-mono font-bold text-slate-900 dark:text-white">#{att.meeting_number}</span>
                                            <span className="text-[10px] text-slate-400 block font-mono">Siklus {att.cycle_number} ({att.session_in_cycle}/8)</span>
                                        </td>
                                        <td className="py-3 px-4 text-center whitespace-nowrap">
                                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                att.status === 'hadir' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' :
                                                att.status === 'izin' ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400' :
                                                att.status === 'sakit' ? 'bg-sky-500/15 text-sky-600 dark:text-sky-400' :
                                                'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                                            }`}>
                                                {att.status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 max-w-xs text-slate-700 dark:text-slate-300">
                                            {att.topic || '-'}
                                        </td>
                                        <td className="py-3 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">{att.mentor_name || '-'}</td>
                                        <td className="py-3 px-4 text-right whitespace-nowrap">
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

            {/* ── 7. VIEW 5: BUKU KAS & PEMBAYARAN LANGIT EDUCATION ── */}
            {subTab === 'payments_log' && (
                <div className="rounded-3xl bg-white dark:bg-[#090D16] border border-slate-200/90 dark:border-white/10 shadow-sm overflow-hidden [overflow-wrap:normal] break-normal">
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
                        <table className="w-full min-w-[700px] text-left text-xs font-sans">
                            <thead className="border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-semibold tracking-wider bg-slate-50/50 dark:bg-white/[0.02]">
                                <tr>
                                    <th className="py-3 px-4 w-12 text-center whitespace-nowrap">No</th>
                                    <th className="py-3 px-4 whitespace-nowrap">No. Kuitansi</th>
                                    <th className="py-3 px-4 whitespace-nowrap">Tanggal Bayar</th>
                                    <th className="py-3 px-4 whitespace-nowrap">Nama Siswa</th>
                                    <th className="py-3 px-4 whitespace-nowrap">Kategori Les</th>
                                    <th className="py-3 px-4 text-center whitespace-nowrap">Siklus</th>
                                    <th className="py-3 px-4 whitespace-nowrap">Nominal</th>
                                    <th className="py-3 px-4 whitespace-nowrap">Metode</th>
                                    <th className="py-3 px-4 min-w-[160px]">Catatan</th>
                                    <th className="py-3 px-4 text-right whitespace-nowrap">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200/60 dark:divide-white/5">
                                {allPayments.map((pay, idx) => (
                                    <tr key={pay.id} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors">
                                        <td className="py-3 px-4 text-center font-mono text-slate-400">{idx + 1}</td>
                                        <td className="py-3 px-4 font-mono font-bold text-cyan-600 dark:text-cyan-400 whitespace-nowrap">{pay.receipt_number}</td>
                                        <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-300 whitespace-nowrap">{formatDate(pay.payment_date)}</td>
                                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white whitespace-nowrap">{pay.student_name}</td>
                                        <td className="py-3 px-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">{pay.category}</td>
                                        <td className="py-3 px-4 text-center whitespace-nowrap">
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600">
                                                Siklus {pay.cycle_number}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                                            {formatRupiah(pay.amount)}
                                        </td>
                                        <td className="py-3 px-4 uppercase font-mono font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                                            {pay.payment_method}
                                        </td>
                                        <td className="py-3 px-4 text-slate-500">{pay.notes || '-'}</td>
                                        <td className="py-3 px-4 text-right whitespace-nowrap">
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

            {/* ── 8. MODAL DETAIL SEMUA SIKLUS (MODAL DETAIL LENGKAP BENTO / TABEL RAPI) ── */}
            {detailCycleStudent && (
                <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto [overflow-wrap:normal] break-normal">
                    <div className="bg-white dark:bg-[#0c1220] rounded-3xl border border-slate-200 dark:border-white/10 p-5 sm:p-7 w-full max-w-4xl shadow-2xl my-6 space-y-6 max-h-[92vh] overflow-y-auto animate-scaleUp">
                        {/* Modal Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/10">
                            <div className="flex items-center gap-3.5">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#005792] to-cyan-500 text-white font-black text-lg flex items-center justify-center shadow-md shrink-0">
                                    {detailCycleStudent.name?.slice(0, 2).toUpperCase() || 'ES'}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                                            {detailCycleStudent.category}
                                        </span>
                                        <span className="text-xs text-slate-400 font-mono">
                                            Total {detailCycleStudent.total_meetings || 0} Sesi Pertemuan
                                        </span>
                                    </div>
                                    <h3 className="font-heading font-black text-xl sm:text-2xl text-slate-900 dark:text-white leading-tight">
                                        {detailCycleStudent.name}
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Orang Tua: <strong className="text-slate-700 dark:text-slate-300">{detailCycleStudent.parent_name || '-'}</strong> • WA: <span className="font-mono">{detailCycleStudent.whatsapp}</span> • Paket: {formatRupiah(detailCycleStudent.fee_per_cycle)} / 8 sesi
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 self-end sm:self-auto">
                                {/* View Mode Toggle (Grid Bento Cards vs Structured Table) */}
                                <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-bold">
                                    <button
                                        type="button"
                                        onClick={() => setModalViewMode('cards')}
                                        className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
                                            modalViewMode === 'cards'
                                                ? 'bg-white dark:bg-slate-800 text-[#005792] dark:text-cyan-400 shadow-xs'
                                                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                                        }`}
                                        title="Mode Kartu Bento Sesi"
                                    >
                                        <LayoutGrid className="w-3.5 h-3.5" />
                                        <span className="hidden sm:inline">Kartu</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setModalViewMode('table')}
                                        className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
                                            modalViewMode === 'table'
                                                ? 'bg-white dark:bg-slate-800 text-[#005792] dark:text-cyan-400 shadow-xs'
                                                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                                        }`}
                                        title="Mode Tabel Rinci"
                                    >
                                        <TableIcon className="w-3.5 h-3.5" />
                                        <span className="hidden sm:inline">Tabel</span>
                                    </button>
                                </div>

                                <button
                                    onClick={() => setDetailCycleStudent(null)}
                                    className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Filter Tabs by Cycle in Modal */}
                        {(() => {
                            const allCycles = getStudentCycleGroups(detailCycleStudent);
                            return (
                                <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-white/5 text-xs font-bold">
                                    <button
                                        type="button"
                                        onClick={() => setModalCycleFilter('all')}
                                        className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                                            modalCycleFilter === 'all'
                                                ? 'bg-white dark:bg-slate-800 text-[#005792] dark:text-cyan-400 shadow-xs'
                                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                        }`}
                                    >
                                        Semua Siklus ({allCycles.length})
                                    </button>

                                    {allCycles.map((cg) => (
                                        <button
                                            type="button"
                                            key={cg.cycleNumber}
                                            onClick={() => setModalCycleFilter(cg.cycleNumber)}
                                            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                                                modalCycleFilter === cg.cycleNumber
                                                    ? 'bg-[#005792] text-white shadow-xs'
                                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                            }`}
                                        >
                                            <span>{cg.shortLabel}</span>
                                            <span className="px-1.5 py-0.2 rounded-md bg-black/10 dark:bg-white/10 text-[10px]">
                                                {cg.attendancesCount}/8
                                            </span>
                                            {cg.isCompleted && <span className="text-emerald-400">✓</span>}
                                        </button>
                                    ))}
                                </div>
                            );
                        })()}

                        {/* List Siklus yang Difilter */}
                        <div className="space-y-6">
                            {getStudentCycleGroups(detailCycleStudent)
                                .filter(cg => modalCycleFilter === 'all' || cg.cycleNumber === modalCycleFilter)
                                .map((cg) => (
                                    <div
                                        key={cg.cycleNumber}
                                        className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/10 space-y-4"
                                    >
                                        {/* Cycle Card Header */}
                                        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200/60 dark:border-white/5">
                                            <div>
                                                <h4 className="font-heading font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                                                    <Layers className="w-4 h-4 text-cyan-500" />
                                                    <span>{cg.title}</span>
                                                </h4>
                                                <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                                                    Progres Pertemuan: <strong className="text-slate-900 dark:text-white">{cg.attendancesCount}/8 Sesi Hadir</strong> {cg.isCompleted ? '(Paket Lengkap ✓)' : '(Sedang Berjalan ⬤)'}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {cg.isPaid ? (
                                                    <div className="text-right">
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                                            <span>Lunas {formatRupiah(cg.payment?.amount || detailCycleStudent.fee_per_cycle)}</span>
                                                        </span>
                                                        <span className="block text-[10px] font-mono text-slate-400 mt-0.5">
                                                            {cg.payment?.receipt_number} • {formatDate(cg.payment?.payment_date)}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                                                            Tagihan Siklus Pending
                                                        </span>
                                                        <button
                                                            onClick={() => {
                                                                const st = detailCycleStudent;
                                                                setDetailCycleStudent(null);
                                                                handleOpenPayment(st, cg.cycleNumber);
                                                            }}
                                                            className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer shadow-xs"
                                                        >
                                                            Catat Bayar
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Sesi-Sesi di dalam Siklus */}
                                        {cg.attendances.length === 0 ? (
                                            <div className="p-6 text-center rounded-2xl border border-dashed border-slate-300 dark:border-white/10 text-xs text-slate-400">
                                                <CalendarCheck className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-40" />
                                                <p className="font-semibold text-slate-700 dark:text-slate-300">Belum ada catatan presensi di {cg.shortLabel}.</p>
                                                <p className="text-[11px] text-slate-500 mt-0.5">Sesi baru siap dimulai kapan saja tanpa terkunci.</p>
                                                <button
                                                    onClick={() => {
                                                        const st = detailCycleStudent;
                                                        setDetailCycleStudent(null);
                                                        handleOpenAttendance(st, cg.startMeeting);
                                                    }}
                                                    className="mt-3 px-3.5 py-1.5 rounded-xl bg-[#005792] hover:bg-[#00487a] text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                                                >
                                                    <Plus className="w-3.5 h-3.5" />
                                                    <span>Mulai Absen Pertemuan #{cg.startMeeting}</span>
                                                </button>
                                            </div>
                                        ) : modalViewMode === 'cards' ? (
                                            /* ── MODE 1: VISUAL BENTO SESSION CARDS (GORGEOUS, NON-COLLAPSING) ── */
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {cg.attendances.map((att) => (
                                                    <div
                                                        key={att.id}
                                                        className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/90 dark:border-white/10 shadow-xs space-y-2.5 hover:border-cyan-500/40 transition-all"
                                                    >
                                                        <div className="flex items-center justify-between gap-2">
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#005792]/10 dark:bg-cyan-500/10 text-[#005792] dark:text-cyan-400 font-mono font-bold text-xs">
                                                                <Calendar className="w-3.5 h-3.5" />
                                                                <span>Pertemuan #{att.meeting_number}</span>
                                                            </span>

                                                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                                att.status === 'hadir' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' :
                                                                att.status === 'izin' ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20' :
                                                                att.status === 'sakit' ? 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/20' :
                                                                'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                                                            }`}>
                                                                {att.status}
                                                            </span>
                                                        </div>

                                                        {/* Topic / Materi */}
                                                        <div>
                                                            <div className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
                                                                {att.topic || 'Sesi Pembahasan Materi'}
                                                            </div>
                                                            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono mt-1">
                                                                <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                                                                <span>{formatDate(att.date)}</span>
                                                                <span>•</span>
                                                                <span className="truncate">{att.mentor_name || 'Instruktur Langit Education'}</span>
                                                            </div>
                                                        </div>

                                                        {/* Catatan Guru */}
                                                        {att.notes && (
                                                            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 text-[11px] text-slate-600 dark:text-slate-300 italic border-l-2 border-cyan-500/40">
                                                                "{att.notes}"
                                                            </div>
                                                        )}

                                                        <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 dark:border-white/5 text-[11px]">
                                                            <span className="text-slate-400 font-mono text-[10px]">
                                                                Siklus {cg.cycleNumber} ({att.session_in_cycle || ((att.meeting_number - 1) % 8) + 1}/8)
                                                            </span>
                                                            <button
                                                                onClick={() => handleDeleteAttendance(att)}
                                                                className="text-slate-400 hover:text-rose-500 transition-colors flex items-center gap-1 cursor-pointer"
                                                                title="Hapus rekaman sesi ini"
                                                            >
                                                                <Trash2 className="w-3 h-3" />
                                                                <span>Hapus</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            /* ── MODE 2: PRISTINE STRUCTURED TABLE (WITH SAFE COLUMN BOUNDS) ── */
                                            <div className="overflow-x-auto min-w-0 max-w-full rounded-2xl border border-slate-200/80 dark:border-white/10">
                                                <table className="w-full min-w-[700px] text-left text-xs [overflow-wrap:normal] break-normal font-sans">
                                                    <thead className="bg-slate-100/70 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 font-mono text-[10px] uppercase text-slate-500 dark:text-slate-400">
                                                        <tr>
                                                            <th className="py-2.5 px-3 w-16 text-center whitespace-nowrap">Sesi</th>
                                                            <th className="py-2.5 px-3 w-28 whitespace-nowrap">Tanggal</th>
                                                            <th className="py-2.5 px-3 w-24 text-center whitespace-nowrap">Status</th>
                                                            <th className="py-2.5 px-3 min-w-[200px]">Materi / Topik Pembelajaran</th>
                                                            <th className="py-2.5 px-3 w-36 whitespace-nowrap">Instruktur</th>
                                                            <th className="py-2.5 px-3 min-w-[160px]">Catatan Evaluasi</th>
                                                            <th className="py-2.5 px-3 w-16 text-right whitespace-nowrap">Aksi</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                                        {cg.attendances.map((att) => (
                                                            <tr key={att.id} className="hover:bg-white/60 dark:hover:bg-white/[0.02]">
                                                                <td className="py-2.5 px-3 text-center font-mono font-bold text-cyan-600 dark:text-cyan-400 whitespace-nowrap">
                                                                    #{att.meeting_number}
                                                                </td>
                                                                <td className="py-2.5 px-3 font-mono text-slate-700 dark:text-slate-300 whitespace-nowrap">
                                                                    {formatDate(att.date)}
                                                                </td>
                                                                <td className="py-2.5 px-3 text-center whitespace-nowrap">
                                                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                                                                        att.status === 'hadir' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' :
                                                                        att.status === 'izin' ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400' :
                                                                        'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                                                                    }`}>
                                                                        {att.status}
                                                                    </span>
                                                                </td>
                                                                <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">
                                                                    {att.topic || '-'}
                                                                </td>
                                                                <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                                                                    {att.mentor_name || '-'}
                                                                </td>
                                                                <td className="py-2.5 px-3 text-slate-500 italic text-[11px]">
                                                                    {att.notes || '-'}
                                                                </td>
                                                                <td className="py-2.5 px-3 text-right whitespace-nowrap">
                                                                    <button
                                                                        onClick={() => handleDeleteAttendance(att)}
                                                                        className="p-1 rounded text-slate-400 hover:text-rose-500 cursor-pointer"
                                                                        title="Hapus Sesi"
                                                                    >
                                                                        <Trash2 className="w-3.5 h-3.5" />
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                ))}
                        </div>

                        {/* Modal Footer */}
                        <div className="pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 dark:border-white/10">
                            <button
                                type="button"
                                onClick={() => handleSendWhatsApp(detailCycleStudent, 'summary')}
                                className="px-4 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold inline-flex items-center gap-2 cursor-pointer transition-colors"
                            >
                                <MessageCircle className="w-4 h-4" />
                                <span>Kirim Rekap Lengkap via WhatsApp Ortu</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setDetailCycleStudent(null)}
                                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── 9. MODAL INPUT ABSENSI (ADMIN INPUT) ── */}
            {attendanceModal.open && attendanceModal.student && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto [overflow-wrap:normal] break-normal">
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
                                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
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
                                Sesi absen langsung lanjut otomatis tanpa henti. Pembayaran bersifat fleksibel dan tidak mengunci presensi.
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
                                            className={`py-2 px-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
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
                                {(TOPIC_SUGGESTIONS[attendanceModal.student.category] || TOPIC_SUGGESTIONS['Coding']) && (
                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                        {(TOPIC_SUGGESTIONS[attendanceModal.student.category] || TOPIC_SUGGESTIONS['Coding']).map((sugg) => (
                                            <button
                                                type="button"
                                                key={sugg}
                                                onClick={() => setAttForm({ ...attForm, topic: sugg })}
                                                className="px-2 py-0.5 rounded-lg text-[10px] bg-slate-200/60 dark:bg-white/10 text-slate-700 dark:text-slate-300 hover:bg-cyan-500 hover:text-white transition-colors cursor-pointer"
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
                                    className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-5 py-2.5 rounded-xl bg-[#005792] hover:bg-[#00487a] text-white text-xs font-bold shadow-md shadow-[#005792]/30 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                                >
                                    <Check className="w-4 h-4" />
                                    <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Presensi'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── 10. MODAL CATAT PEMBAYARAN KAS ── */}
            {paymentModal.open && paymentModal.student && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto [overflow-wrap:normal] break-normal">
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
                                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
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
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-xs font-bold text-slate-900 dark:text-white cursor-pointer"
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
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-xs font-bold uppercase cursor-pointer"
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
                                    placeholder="Contoh: Transfer BCA an Orang Tua Siswa"
                                    value={payForm.notes}
                                    onChange={(e) => setPayForm({ ...payForm, notes: e.target.value })}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-xs"
                                />
                            </div>

                            <div className="pt-2 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setPaymentModal({ open: false, student: null, cycleNumber: 1, amount: 600000 })}
                                    className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                                >
                                    <Check className="w-4 h-4" />
                                    <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Pembayaran'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── 11. MODAL TAMBAH / EDIT ANAK LES ── */}
            {studentModal.open && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto [overflow-wrap:normal] break-normal">
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
                                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
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
                                            className="px-2 py-0.5 rounded-lg text-[10px] bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-cyan-500 cursor-pointer"
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
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-xs font-bold cursor-pointer"
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
                                    className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                                >
                                    <Check className="w-4 h-4" />
                                    <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Siswa'}</span>
                                </button>
                            </div>
                        </form>
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
