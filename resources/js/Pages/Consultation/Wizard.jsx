import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import axios from 'axios';
import PublicLayout from '@/Layouts/PublicLayout';
import { 
    Code2, Camera, Cpu, GraduationCap, Handshake, Calendar,
    Clock, Video, MapPin, CheckCircle2, ArrowRight, ArrowLeft,
    Sparkles, ShieldCheck, Check, Loader2, Ticket, MessageSquare, PackageCheck
} from 'lucide-react';

export default function ConsultationWizard({ availableTopics = [], availableTimeslots = [] }) {
    const [step, setStep] = useState(1); // 1, 2, 3, 4 (Success Ticket)

    // Wizard Data State
    const [selectedTopic, setSelectedTopic] = useState(availableTopics[0]?.title || 'Pembuatan Website & Sistem Digital');
    const [meetingMethod, setMeetingMethod] = useState('online_meet'); // online_meet, offline_studio
    const [preferredDate, setPreferredDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() + 2);
        return d.toISOString().split('T')[0];
    });
    const [preferredTime, setPreferredTime] = useState(availableTimeslots[0] || '14:00 - 15:00 WIB');
    
    // Step 3 Details
    const [clientName, setClientName] = useState('');
    const [companyOrInstitution, setCompanyOrInstitution] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [email, setEmail] = useState('');
    const [projectBrief, setProjectBrief] = useState('');
    const [budgetEstimation, setBudgetEstimation] = useState('Rp 10.000.000 - Rp 25.000.000');

    const [loading, setLoading] = useState(false);
    const [generatedTicket, setGeneratedTicket] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);

    const topicIcons = {
        web_development: Code2,
        photo_video: Camera,
        computer_hardware: Cpu,
        education_training: GraduationCap,
        internship_program: Sparkles,
        rental_equipment: PackageCheck,
        collaboration_custom: Handshake,
    };

    const handleConfirmBooking = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage(null);

        try {
            const res = await axios.post('/konsultasi/book', {
                client_name: clientName,
                company_or_institution: companyOrInstitution,
                whatsapp: whatsapp,
                email: email,
                service_topic: selectedTopic,
                meeting_method: meetingMethod,
                preferred_date: preferredDate,
                preferred_time: preferredTime,
                project_brief: projectBrief,
                budget_estimation: budgetEstimation,
            });

            if (res.data.success) {
                setGeneratedTicket(res.data);
                setStep(4); // Success step
            }
        } catch (err) {
            setErrorMessage(err.response?.data?.message || 'Gagal menyimpan jadwal konsultasi. Mohon periksa kembali isian formulir.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <PublicLayout>
            <Head>
                <title>3-Step Interactive Consultation Wizard</title>
                <meta name="description" content="Jadwalkan sesi konsultasi proyek digital, visual, dan teknologi bersama konsultan ahli Langit. Pilih topik, waktu pertemuan, dan terbitkan tiket konsultasi Anda." />
            </Head>

            <div className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto pt-6 pb-20">
                {/* Stepper Progress Bar */}
                <div className="mb-10 text-center space-y-3">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 text-xs font-mono tracking-wider">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>3-STEP INTERACTIVE CONSULTATION WIZARD</span>
                    </div>

                    <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white">
                        Rancang Solusi Proyek Anda
                    </h1>

                    {step <= 3 && (
                        <div className="flex items-center justify-center gap-3 pt-4">
                            {[1, 2, 3].map((s) => (
                                <div key={s} className="flex items-center gap-2">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-bold transition-all ${
                                        step === s
                                            ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-lg shadow-cyan-500/30 ring-2 ring-cyan-400'
                                            : step > s
                                            ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40'
                                            : 'bg-slate-100 dark:bg-white/5 text-slate-500 border border-slate-200 dark:border-white/5'
                                    }`}>
                                        {step > s ? <Check className="w-4 h-4 stroke-[3]" /> : `0${s}`}
                                    </div>
                                    <span className={`text-xs font-mono hidden sm:inline ${
                                        step === s ? 'text-slate-900 dark:text-white font-semibold' : 'text-slate-500'
                                    }`}>
                                        {s === 1 ? 'Pilih Topik' : s === 2 ? 'Metode & Jadwal' : 'Rincian & Tiket'}
                                    </span>
                                    {s < 3 && <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">———</span>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* STEP 1: PILIH TOPIK KEBUTUHAN (PRD 5.3) */}
                {step === 1 && (
                    <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-[#090D16]/95 border border-slate-200 dark:border-white/10 backdrop-blur-2xl shadow-xl dark:shadow-2xl space-y-6 animate-in fade-in duration-200">
                        <div>
                            <span className="text-xs font-mono text-cyan-600 dark:text-cyan-400 uppercase tracking-wider block mb-1">Langkah 1 dari 3</span>
                            <h2 className="font-heading font-bold text-2xl text-slate-900 dark:text-white">
                                Pilih Bidang atau Topik Kebutuhan Proyek Anda
                            </h2>
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                                Sesi konsultasi akan dihadiri langsung oleh lead specialist divisi terkait.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            {availableTopics.map((top) => {
                                const Icon = topicIcons[top.id] || Sparkles;
                                const isSelected = selectedTopic === top.title;

                                return (
                                    <div
                                        key={top.id}
                                        onClick={() => setSelectedTopic(top.title)}
                                        className={`cursor-pointer p-5 rounded-2xl border transition-all flex items-center justify-between group ${
                                            isSelected
                                                ? 'bg-cyan-50 dark:bg-cyan-500/15 border-cyan-500 shadow-md shadow-cyan-500/10 ring-1 ring-cyan-500'
                                                : 'bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/5 hover:border-cyan-400/40 hover:bg-slate-100 dark:hover:bg-white/[0.04]'
                                        }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div 
                                                className="w-12 h-12 rounded-xl flex items-center justify-center border border-slate-200 dark:border-white/10 group-hover:scale-105 transition-transform"
                                                style={{ backgroundColor: `${top.accent}20`, color: top.accent }}
                                            >
                                                <Icon className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors">
                                                    {top.title}
                                                </h3>
                                                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                                                    Sesi 45 - 60 Menit • Dedicated Specialist
                                                </span>
                                            </div>
                                        </div>

                                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                                            isSelected ? 'bg-cyan-500 border-cyan-400 text-slate-950 font-bold' : 'border-slate-300 dark:border-slate-700'
                                        }`}>
                                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="pt-4 flex justify-end">
                            <button
                                onClick={() => setStep(2)}
                                className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/25 hover:scale-105 active:scale-95 transition-all"
                            >
                                <span>Lanjutkan ke Jadwal & Metode</span>
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 2: PILIH METODE & JADWAL (PRD 5.3) */}
                {step === 2 && (
                    <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-[#090D16]/95 border border-slate-200 dark:border-white/10 backdrop-blur-2xl shadow-xl dark:shadow-2xl space-y-6 animate-in fade-in duration-200">
                        <div>
                            <span className="text-xs font-mono text-cyan-600 dark:text-cyan-400 uppercase tracking-wider block mb-1">Langkah 2 dari 3</span>
                            <h2 className="font-heading font-bold text-2xl text-slate-900 dark:text-white">
                                Tentukan Metode Pertemuan & Slot Waktu
                            </h2>
                        </div>

                        {/* Meeting Method Switcher */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div
                                onClick={() => setMeetingMethod('online_meet')}
                                className={`cursor-pointer p-5 rounded-2xl border transition-all ${
                                    meetingMethod === 'online_meet'
                                        ? 'bg-cyan-50 dark:bg-cyan-500/15 border-cyan-500 shadow-md shadow-cyan-500/10'
                                        : 'bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20'
                                }`}
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                                        <Video className="w-5 h-5" />
                                    </div>
                                    <h4 className="font-bold text-slate-900 dark:text-white text-base">Online Video Meet</h4>
                                </div>
                                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                    Pertemuan virtual melalui Google Meet atau WhatsApp Video Call dengan screen-sharing konsep.
                                </p>
                            </div>

                            <div
                                onClick={() => setMeetingMethod('offline_studio')}
                                className={`cursor-pointer p-5 rounded-2xl border transition-all ${
                                    meetingMethod === 'offline_studio'
                                        ? 'bg-purple-50 dark:bg-purple-500/15 border-purple-500 shadow-md shadow-purple-500/10'
                                        : 'bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20'
                                }`}
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    <h4 className="font-bold text-slate-900 dark:text-white text-base">Tatap Muka di Studio</h4>
                                </div>
                                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                    Diskusi langsung di Langit Office (OKU Timur), melihat demo gear kamera atau lab teknologi.
                                </p>
                            </div>
                        </div>
                        {/* Date & Time Slot Picker */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                            <div>
                                <label className="block text-xs font-mono text-slate-700 dark:text-slate-300 mb-2">Pilih Tanggal Konsultasi *</label>
                                <input
                                    type="date"
                                    value={preferredDate}
                                    onChange={(e) => setPreferredDate(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white font-mono text-sm focus:outline-none focus:border-cyan-500 shadow-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-mono text-slate-700 dark:text-slate-300 mb-2">Pilih Slot Jam Tersedia *</label>
                                <div className="grid grid-cols-1 gap-2">
                                    {availableTimeslots.map((slot, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => setPreferredTime(slot)}
                                            className={`p-2.5 rounded-xl border text-xs font-mono transition-all text-left flex items-center justify-between ${
                                                preferredTime === slot
                                                    ? 'bg-cyan-50 dark:bg-cyan-500/20 border-cyan-500 text-cyan-700 dark:text-cyan-300 font-bold shadow-sm'
                                                    : 'bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.04]'
                                            }`}
                                        >
                                            <span className="flex items-center gap-2">
                                                <Clock className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                                                {slot}
                                            </span>
                                            {preferredTime === slot && <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-bold">Terpilih</span>}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 flex items-center justify-between border-t border-slate-100 dark:border-white/10">
                            <button
                                onClick={() => setStep(1)}
                                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center gap-2 transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                <span>Kembali</span>
                            </button>

                            <button
                                onClick={() => setStep(3)}
                                className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/25 hover:scale-105 active:scale-95 transition-all"
                            >
                                <span>Lanjutkan ke Rincian Proyek</span>
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 3: RINCIAN SINGKAT & KONFIRMASI (PRD 5.3) */}
                {step === 3 && (
                    <form onSubmit={handleConfirmBooking} className="p-6 md:p-8 rounded-3xl bg-white dark:bg-[#090D16]/95 border border-slate-200 dark:border-white/10 backdrop-blur-2xl shadow-xl dark:shadow-2xl space-y-6 animate-in fade-in duration-200">
                        <div>
                            <span className="text-xs font-mono text-cyan-600 dark:text-cyan-400 uppercase tracking-wider block mb-1">Langkah 3 dari 3</span>
                            <h2 className="font-heading font-bold text-2xl text-slate-900 dark:text-white">
                                Informasi Kontak & Brief Proyek
                            </h2>
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                                Topik: <strong className="text-cyan-700 dark:text-cyan-300">{selectedTopic}</strong> | Jadwal: <strong className="text-slate-900 dark:text-white font-mono">{preferredDate} jam {preferredTime}</strong>
                            </p>
                        </div>

                        {errorMessage && (
                            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs">
                                {errorMessage}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-mono text-slate-700 dark:text-slate-300 mb-1">Nama Lengkap Klien *</label>
                                <input
                                    type="text"
                                    required
                                    value={clientName}
                                    onChange={(e) => setClientName(e.target.value)}
                                    placeholder="Contoh: Hendro Setiawan"
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-cyan-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-mono text-slate-700 dark:text-slate-300 mb-1">Nama Perusahaan / Brand / Instansi</label>
                                <input
                                    type="text"
                                    value={companyOrInstitution}
                                    onChange={(e) => setCompanyOrInstitution(e.target.value)}
                                    placeholder="Contoh: PT Megah Surya Nusantara"
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-cyan-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-mono text-slate-700 dark:text-slate-300 mb-1">Nomor WhatsApp Aktif *</label>
                                <input
                                    type="text"
                                    required
                                    value={whatsapp}
                                    onChange={(e) => setWhatsapp(e.target.value)}
                                    placeholder="0812xxxxxxx"
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-cyan-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-mono text-slate-700 dark:text-slate-300 mb-1">Alamat Email *</label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="nama@email.com"
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-cyan-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-mono text-slate-700 dark:text-slate-300 mb-1">Alokasi Budget Proyek (Estimasi)</label>
                            <select
                                value={budgetEstimation}
                                onChange={(e) => setBudgetEstimation(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-cyan-500"
                            >
                                <option value="< Rp 5.000.000">&lt; Rp 5.000.000</option>
                                <option value="Rp 5.000.000 - Rp 15.000.000">Rp 5.000.000 - Rp 15.000.000</option>
                                <option value="Rp 15.000.000 - Rp 35.000.000">Rp 15.000.000 - Rp 35.000.000</option>
                                <option value="> Rp 35.000.000">&gt; Rp 35.000.000 (Enterprise Solution)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-mono text-slate-700 dark:text-slate-300 mb-1">Deskripsi Singkat Rencana Proyek *</label>
                            <textarea
                                rows={3}
                                required
                                value={projectBrief}
                                onChange={(e) => setProjectBrief(e.target.value)}
                                placeholder="Ceritakan tujuan proyek, ekspektasi, atau kendala yang ingin diatasi..."
                                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-cyan-500"
                            />
                        </div>

                        <div className="pt-4 flex items-center justify-between border-t border-slate-100 dark:border-white/10">
                            <button
                                type="button"
                                onClick={() => setStep(2)}
                                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center gap-2 transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                <span>Kembali</span>
                            </button>

                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-xl shadow-cyan-500/30 transition-transform active:scale-95 disabled:opacity-50"
                            >
                                {loading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <>
                                        <span>Konfirmasi & Terbitkan Tiket Konsultasi</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                )}

                {/* STEP 4: SUCCESS - DIGITAL CONSULTATION TICKET (PRD 5.3) */}
                {step === 4 && generatedTicket && (
                    <div className="p-8 rounded-3xl bg-white dark:bg-gradient-to-b dark:from-[#0F172A] dark:to-[#07090E] border border-slate-200 dark:border-cyan-500/40 backdrop-blur-2xl shadow-xl dark:shadow-2xl text-center space-y-6 animate-in zoom-in-95 duration-300">
                        <div className="w-16 h-16 rounded-full bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 flex items-center justify-center mx-auto border border-cyan-500/30 shadow-lg shadow-cyan-500/20">
                            <Ticket className="w-8 h-8 stroke-[2.5]" />
                        </div>

                        <div>
                            <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block font-bold">Tiket Konsultasi Resmi Terbit</span>
                            <h2 className="font-heading font-extrabold text-3xl text-slate-900 dark:text-white mt-1">
                                Jadwal Anda Telah Dikonfirmasi!
                            </h2>
                        </div>

                        {/* Digital Ticket Card */}
                        <div className="max-w-md mx-auto p-6 rounded-2xl bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 text-left space-y-4 font-mono text-xs shadow-md dark:shadow-2xl">
                            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
                                <div>
                                    <span className="text-slate-500 text-[10px] uppercase block">Kode Tiket</span>
                                    <span className="text-cyan-600 dark:text-cyan-400 font-bold text-base">{generatedTicket.ticket_code}</span>
                                </div>
                                <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[10px] uppercase font-bold">
                                    SCHEDULED
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <span className="text-slate-500 text-[10px] uppercase block">Klien</span>
                                    <span className="text-slate-800 dark:text-slate-200 font-bold">{clientName}</span>
                                </div>
                                <div>
                                    <span className="text-slate-500 text-[10px] uppercase block">Metode</span>
                                    <span className="text-slate-800 dark:text-slate-200 font-bold">
                                        {meetingMethod === 'online_meet' ? 'Online Google Meet' : 'Tatap Muka di Studio'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-slate-500 text-[10px] uppercase block">Tanggal</span>
                                    <span className="text-slate-800 dark:text-slate-200 font-bold">{preferredDate}</span>
                                </div>
                                <div>
                                    <span className="text-slate-500 text-[10px] uppercase block">Waktu</span>
                                    <span className="text-slate-800 dark:text-slate-200 font-bold">{preferredTime}</span>
                                </div>
                            </div>

                            <div className="pt-2 border-t border-slate-200 dark:border-white/5">
                                <span className="text-slate-500 text-[10px] uppercase block">Topik Diskusi</span>
                                <span className="text-slate-900 dark:text-amber-300 font-sans text-xs font-semibold">{selectedTopic}</span>
                            </div>
                        </div>

                        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                            <a
                                href={generatedTicket.wa_link}
                                target="_blank"
                                rel="noreferrer"
                                className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/30 transition-transform hover:scale-105 active:scale-95"
                            >
                                <MessageSquare className="w-4 h-4" />
                                <span>Kirim Konfirmasi Tiket ke WhatsApp Admin</span>
                            </a>
                            <Link
                                href="/"
                                className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors"
                            >
                                Kembali ke Beranda
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </PublicLayout>
    );
}
