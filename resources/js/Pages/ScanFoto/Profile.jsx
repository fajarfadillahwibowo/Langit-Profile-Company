import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import ScanCustomerLayout from '@/Layouts/ScanCustomerLayout';
import PasswordStrengthMeter, { evaluatePasswordStrength } from '@/Components/PasswordStrengthMeter';
import { User, Save, Loader2, Lock, KeyRound, Eye, EyeOff } from 'lucide-react';

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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl animate-fade-in">
                {/* Kartu Profil & WhatsApp */}
                <form
                    onSubmit={submitProfile}
                    className="bg-[#111827] border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4 h-fit"
                >
                    <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                        <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
                            <User className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-sm font-bold text-white truncate">{user?.name}</h2>
                            <p className="text-xs text-slate-400 truncate">{user?.username || user?.email}</p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">Nama Lengkap</label>
                        <input
                            type="text"
                            value={profileForm.data.name}
                            onChange={(e) => profileForm.setData('name', e.target.value)}
                            className="w-full min-h-11 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-sky-400"
                        />
                        {profileForm.errors.name && (
                            <p className="text-xs text-rose-400 mt-1">{profileForm.errors.name}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                            Nomor WhatsApp
                        </label>
                        <input
                            type="text"
                            value={profileForm.data.whatsapp_number}
                            onChange={(e) => profileForm.setData('whatsapp_number', e.target.value)}
                            className="w-full min-h-11 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-sky-400"
                        />
                        {profileForm.errors.whatsapp_number && (
                            <p className="text-xs text-rose-400 mt-1">{profileForm.errors.whatsapp_number}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={profileForm.processing}
                        className="w-full sm:w-auto min-h-11 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 active:scale-[0.98] text-slate-950 font-bold text-sm transition-all cursor-pointer disabled:opacity-60"
                    >
                        {profileForm.processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        <span>{profileForm.processing ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
                    </button>
                </form>

                {/* Kartu Ubah Kata Sandi */}
                <form
                    onSubmit={submitPassword}
                    className="bg-[#111827] border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4 h-fit"
                >
                    <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-800">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                                <KeyRound className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                                <h2 className="text-sm font-bold text-white truncate">Ubah Kata Sandi</h2>
                                <p className="text-xs text-slate-400 truncate">Perbarui kata sandi akun Anda secara berkala</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowPasswords(!showPasswords)}
                            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                            title={showPasswords ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                        >
                            {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">Kata Sandi Saat Ini</label>
                        <div className="relative">
                            <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type={showPasswords ? 'text' : 'password'}
                                required
                                value={passwordForm.data.current_password}
                                onChange={(e) => passwordForm.setData('current_password', e.target.value)}
                                placeholder="Masukkan kata sandi saat ini"
                                className="w-full min-h-11 pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-sky-400"
                            />
                        </div>
                        {passwordForm.errors.current_password && (
                            <p className="text-xs text-rose-400 mt-1">{passwordForm.errors.current_password}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">Kata Sandi Baru</label>
                        <div className="relative">
                            <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type={showPasswords ? 'text' : 'password'}
                                required
                                value={passwordForm.data.password}
                                onChange={(e) => passwordForm.setData('password', e.target.value)}
                                placeholder="Min. 8 karakter (huruf & angka)"
                                className="w-full min-h-11 pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-sky-400"
                            />
                        </div>
                        <PasswordStrengthMeter password={passwordForm.data.password} />
                        {passwordForm.errors.password && (
                            <p className="text-xs text-rose-400 mt-1">{passwordForm.errors.password}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">Konfirmasi Kata Sandi Baru</label>
                        <div className="relative">
                            <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type={showPasswords ? 'text' : 'password'}
                                required
                                value={passwordForm.data.password_confirmation}
                                onChange={(e) => passwordForm.setData('password_confirmation', e.target.value)}
                                placeholder="Ulangi kata sandi baru"
                                className="w-full min-h-11 pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-sky-400"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={passwordForm.processing || !passwordStrength.isValid}
                        className="w-full sm:w-auto min-h-11 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-slate-950 font-bold text-sm transition-all cursor-pointer disabled:opacity-50"
                    >
                        {passwordForm.processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                        <span>{passwordForm.processing ? 'Memperbarui...' : 'Perbarui Kata Sandi'}</span>
                    </button>
                </form>
            </div>
        </ScanCustomerLayout>
    );
}
