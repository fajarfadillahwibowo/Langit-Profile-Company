import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import LangitLensAdminLayout from '@/Layouts/LangitLensAdminLayout';
import AdminActionMenu from '@/Components/AdminActionMenu';
import { Users, Phone, Trash2, AlertTriangle, Loader2 } from 'lucide-react';

export default function Customers({ customers }) {
    const [targetCustomer, setTargetCustomer] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const confirmDelete = () => {
        if (!targetCustomer || deleting) return;
        setDeleting(true);
        router.delete(`/admin/langitlens/customers/${targetCustomer.id}`, {
            preserveScroll: true,
            onFinish: () => {
                setDeleting(false);
                setTargetCustomer(null);
            },
        });
    };

    return (
        <>
            <Head title="Pelanggan" />

            <div className="bg-[#111827] border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 animate-fade-in">
                <div className="flex items-center gap-2.5">
                    <Users className="w-5 h-5 text-sky-400" />
                    <h2 className="text-base font-bold text-white">Pelanggan Terdaftar ({customers.length})</h2>
                </div>

                {customers.length === 0 ? (
                    <p className="text-xs text-slate-400 py-4 text-center">Belum ada pelanggan terdaftar.</p>
                ) : (
                    <div className="min-w-0 max-w-full overflow-x-auto overscroll-x-contain">
                        <table className="w-full min-w-[48rem] text-left text-xs [overflow-wrap:normal] break-normal [&_th]:whitespace-nowrap">
                            <thead>
                                <tr className="border-b border-slate-800 text-slate-400">
                                    <th className="pb-2.5 pr-4">Nama</th>
                                    <th className="pb-2.5 pr-4">Username / Email</th>
                                    <th className="pb-2.5 pr-4">WhatsApp</th>
                                    <th className="pb-2.5 pr-4">Scan</th>
                                    <th className="pb-2.5 pr-4">Pesanan</th>
                                    <th className="pb-2.5 pr-4">Login Terakhir</th>
                                    <th className="pb-2.5 pr-4">Terdaftar</th>
                                    <th className="pb-2.5 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {customers.map((c) => (
                                    <tr key={c.id} className="hover:bg-slate-800/30 transition-colors">
                                        <td className="py-3 pr-4 font-semibold text-white">{c.name}</td>
                                        <td className="py-3 pr-4 text-slate-300">
                                            <div>{c.username || '-'}</div>
                                            {c.email && (
                                                <div className="text-[11px] text-slate-500">{c.email}</div>
                                            )}
                                        </td>
                                        <td className="py-3 pr-4 text-emerald-400">
                                            {c.whatsapp_number ? (
                                                <span className="inline-flex items-center gap-1">
                                                    <Phone className="w-3 h-3" />
                                                    {c.whatsapp_number}
                                                </span>
                                            ) : (
                                                '-'
                                            )}
                                        </td>
                                        <td className="py-3 pr-4 text-slate-300">{c.face_scans_count}×</td>
                                        <td className="py-3 pr-4 text-slate-300">{c.photo_requests_count}</td>
                                        <td className="py-3 pr-4 text-slate-300">
                                            {c.last_login_at ? (
                                                <span title={c.last_login_ip ? `IP: ${c.last_login_ip}` : ''}>
                                                    {c.last_login_at}
                                                </span>
                                            ) : (
                                                <span className="text-slate-500">Belum pernah</span>
                                            )}
                                        </td>
                                        <td className="py-3 pr-4 text-slate-400">{c.created_at}</td>
                                        <td className="py-3 text-right">
                                            <AdminActionMenu
                                                buttonTitle={`Aksi Pelanggan ${c.name}`}
                                                items={[
                                                    {
                                                        label: 'Hubungi via WhatsApp',
                                                        icon: Phone,
                                                        tone: 'emerald',
                                                        hidden: !c.whatsapp_number,
                                                        external: true,
                                                        href: c.whatsapp_number
                                                            ? `https://wa.me/${c.whatsapp_number.replace(/[^0-9]/g, '')}`
                                                            : undefined,
                                                    },
                                                    {
                                                        label: 'Hapus Akun',
                                                        icon: Trash2,
                                                        tone: 'danger',
                                                        dividerBefore: Boolean(c.whatsapp_number),
                                                        onClick: () => setTargetCustomer(c),
                                                    },
                                                ]}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal Konfirmasi Hapus Pelanggan */}
            {targetCustomer && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4"
                    onClick={() => !deleting && setTargetCustomer(null)}
                >
                    <div
                        className="w-full max-w-md rounded-2xl bg-[#111827] border border-slate-700 p-5 sm:p-6 shadow-2xl space-y-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0">
                                <AlertTriangle className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-sm font-bold text-white">Hapus Akun Pelanggan?</h3>
                                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                                    Akun <strong className="text-white">{targetCustomer.name}</strong> (
                                    <span className="text-slate-300">{targetCustomer.email || targetCustomer.username}</span>)
                                    beserta riwayat scan ({targetCustomer.face_scans_count}×) dan pesanan ({targetCustomer.photo_requests_count}) akan dihapus permanen.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-2.5 pt-2">
                            <button
                                type="button"
                                disabled={deleting}
                                onClick={() => setTargetCustomer(null)}
                                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                disabled={deleting}
                                onClick={confirmDelete}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                            >
                                {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                                <span>{deleting ? 'Menghapus...' : 'Ya, Hapus Akun'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

Customers.layout = (page) => <LangitLensAdminLayout title="Pelanggan">{page}</LangitLensAdminLayout>;
