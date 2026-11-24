import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import ScanCustomerLayout from '@/Layouts/ScanCustomerLayout';
import PasswordStrengthMeter, { evaluatePasswordStrength } from '@/Components/PasswordStrengthMeter';
import { User, Save, Loader2, Lock, KeyRound, Eye, EyeOff, ShieldCheck } from 'lucide-react';

export default function Profile({ user }) {
    const [showPasswords, setShowPasswords] = useState(false);

    const profileForm = useForm({
        name: user?.name || '',
        whatsapp_number: user?.whatsapp_number || '',
    });

    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const passwordStrength = evaluatePasswordStrength(passwordForm.data.password);
    const userInitial = (user?.name || user?.username || 'L').charAt(0).toUpperCase();

    const submitProfile = (e) => {
        e.preventDefault();
        profileForm.put('/scan-foto/profil', {
            preserveScroll: true,
        });
    };

    const submitPassword = (e) => {
        e.preventDefault();
        passwordForm.put('/scan-foto/profil/password', {
            preserveScroll: true,
            onSuccess: () => passwordForm.reset(),
        });
    };

    return (
        <ScanCustomerLayout title="Profil">
            <Head title="Profil" />

            <div className="max-w-4xl space-y-5">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {/* Kartu Profil & WhatsApp */}
                    <motion.form
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 }}
                        onSubmit={submitProfile}
                        className="bg-[#0B1222]/95 border border-white/10 rounded-3xl p-5 sm:p-6 space-y-4 h-fit shadow-xl shadow-black/30"
                    >
                        <div className="flex items-center gap-3 pb-3.5 border-b border-white/10">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-sky-500 text-slate-950 font-black text-sm flex items-center justify-center shrink-0">
                                {userInitial}
                            </div>
                            <div className="min-w-0">
                                <h3 className="font-heading text-sm font-bold text-white truncate">{user?.name}</h3>
                                <p className="text-xs text-slate-400 truncate">@{user?.username || user?.email}</p>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                                Nama Lengkap
                            </label>
                            <input
                                type="text"
                                value={profileForm.data.name}
                                onChange={(e) => profileForm.setData('name', e.target.value)}
                                className="w-full min-h-11 px-3.5 py-2.5 rounded-xl bg-[#060B15] border border-white/12 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/30 focus:border-cyan-400 transition-all"
                            />
                            {profileForm.errors.name && (
                                <p className="text-xs text-rose-400 mt-1">{profileForm.errors.name}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                                Nomor WhatsApp
                            </label>
                            <input
                                type="text"
                                value={profileForm.data.whatsapp_number}
                                onChange={(e) => profileForm.setData('whatsapp_number', e.target.value)}
                                className="w-full min-h-11 px-3.5 py-2.5 rounded-xl bg-[#060B15] border border-white/12 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/30 focus:border-cyan-400 transition-all"
                            />
                            {profileForm.errors.whatsapp_number && (
                                <p className="text-xs text-rose-400 mt-1">{profileForm.errors.whatsapp_number}</p>
                            )}
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={profileForm.processing}
                            className="w-full sm:w-auto min-h-11 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-400 to-cyan-400 hover:from-sky-300 hover:to-cyan-300 text-slate-950 font-black text-sm shadow-lg shadow-sky-500/25 transition-all cursor-pointer disabled:opacity-60"
                        >
                            {profileForm.processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            <span>{profileForm.processing ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
                        </motion.button>
                    </motion.form>

                    {/* Kartu Ubah Kata Sandi */}
                    <motion.form
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        onSubmit={submitPassword}
                        className="bg-[#0B1222]/95 border border-white/10 rounded-3xl p-5 sm:p-6 space-y-4 h-fit shadow-xl shadow-black/30"
                    >
                        <div className="flex items-center justify-between gap-3 pb-3.5 border-b border-white/10">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-center text-amber-300 shrink-0">
                                    <KeyRound className="w-5 h-5" />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-heading text-sm font-black text-white truncate">Ubah Kata Sandi</h3>
                                    <p className="text-xs text-slate-400 truncate">Perbarui keamanan akun secara berkala</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowPasswords(!showPasswords)}
                                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                                title={showPasswords ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                            >
                                {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>

                        <div>
                            <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                                Kata Sandi Saat Ini
                            </label>
                            <div className="relative">
                                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                <input
                                    type={showPasswords ? 'text' : 'password'}
                                    required
                                    value={passwordForm.data.current_password}
                                    onChange={(e) => passwordForm.setData('current_password', e.target.value)}
                                    placeholder="Masukkan kata sandi saat ini"
                                    className="w-full min-h-11 pl-10 pr-3.5 py-2.5 rounded-xl bg-[#060B15] border border-white/12 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 transition-all"
                                />
                            </div>
                            {passwordForm.errors.current_password && (
                                <p className="text-xs text-rose-400 mt-1">{passwordForm.errors.current_password}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                                Kata Sandi Baru
                            </label>
                            <div className="relative">
                                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                <input
                                    type={showPasswords ? 'text' : 'password'}
                                    required
                                    value={passwordForm.data.password}
                                    onChange={(e) => passwordForm.setData('password', e.target.value)}
                                    placeholder="Min. 8 karakter (huruf & angka)"
                                    className="w-full min-h-11 pl-10 pr-3.5 py-2.5 rounded-xl bg-[#060B15] border border-white/12 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 transition-all"
                                />
                            </div>
                            <PasswordStrengthMeter password={passwordForm.data.password} />
                            {passwordForm.errors.password && (
                                <p className="text-xs text-rose-400 mt-1">{passwordForm.errors.password}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                                Konfirmasi Kata Sandi Baru
                            </label>
                            <div className="relative">
                                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                <input
                                    type={showPasswords ? 'text' : 'password'}
                                    required
                                    value={passwordForm.data.password_confirmation}
                                    onChange={(e) => passwordForm.setData('password_confirmation', e.target.value)}
                                    placeholder="Ulangi kata sandi baru"
                                    className="w-full min-h-11 pl-10 pr-3.5 py-2.5 rounded-xl bg-[#060B15] border border-white/12 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 transition-all"
                                />
                            </div>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={passwordForm.processing || !passwordStrength.isValid}
                            className="w-full sm:w-auto min-h-11 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
                        >
                            {passwordForm.processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                            <span>{passwordForm.processing ? 'Memperbarui...' : 'Perbarui Kata Sandi'}</span>
                        </motion.button>
                    </motion.form>
                </div>
            </div>
        </ScanCustomerLayout>
    );
}
