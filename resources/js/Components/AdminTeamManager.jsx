import { guardPhotoSelection } from '@/Utils/photoUploadPolicy.mjs';
import React, { useEffect, useRef, useState } from 'react';
import { Link, router, useForm } from '@inertiajs/react';
import { Users, Plus, Pencil, Trash2, ImagePlus, ExternalLink, X } from 'lucide-react';
import { memberForm } from '@/Utils/team.mjs';

const fieldClass = 'mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 dark:border-white/10 dark:bg-slate-950 dark:text-white';

export default function AdminTeamManager({ teamMembers = [] }) {
    const [editing, setEditing] = useState(null);
    const [formOpen, setFormOpen] = useState(false);
    const [preview, setPreview] = useState(null);
    const [busyId, setBusyId] = useState(null);
    const [actionError, setActionError] = useState('');
    const [notice, setNotice] = useState('');
    const fileRef = useRef(null);
    const formRef = useRef(null);
    const form = useForm(memberForm());
    const busy = form.processing || busyId !== null;
    useEffect(() => {
        if (!form.data.photo) { setPreview(null); return; }
        const url = URL.createObjectURL(form.data.photo);
        setPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [form.data.photo]);

    const openForm = (member = null) => {
        setEditing(member); form.setData(memberForm(member || {})); form.clearErrors(); setFormOpen(true); setNotice('');
        if (fileRef.current) fileRef.current.value = '';
        requestAnimationFrame(() => { formRef.current?.scrollIntoView({ behavior: 'auto', block: 'start' }); formRef.current?.querySelector('input')?.focus(); });
    };
    const closeForm = () => { setFormOpen(false); setEditing(null); form.reset(); form.clearErrors(); };
    const submit = event => {
        event.preventDefault();
        form.transform(data => ({ ...data, is_active: data.is_active ? 1 : 0 }));
        form.post(editing ? `/admin/team-members/${editing.id}/update` : '/admin/team-members', {
            forceFormData: true, preserveScroll: true,
            onSuccess: () => { closeForm(); setNotice('Profil tim berhasil disimpan.'); },
        });
    };
    const runAction = (member, action) => {
        if (busy) return;
        if (action === 'delete' && !window.confirm(`Hapus ${member.name} dari tim? Tindakan ini tidak dapat dibatalkan.`)) return;
        setBusyId(member.id); setActionError(''); setNotice('');
        const options = { preserveScroll: true, onError: errors => setActionError(Object.values(errors).flat().join(' ') || 'Perubahan gagal disimpan. Silakan coba lagi.'), onFinish: () => setBusyId(null), onSuccess: () => setNotice(action === 'delete' ? 'Anggota tim berhasil dihapus.' : 'Status publikasi berhasil diperbarui.') };
        if (action === 'delete') router.delete(`/admin/team-members/${member.id}`, options);
        else router.post(`/admin/team-members/${member.id}/update`, { ...memberForm(member), is_active: [true, 1, '1'].includes(member.is_active) ? 0 : 1 }, { ...options, forceFormData: true });
    };
    const errorFor = name => form.errors[name] && <p id={`team-${name}-error`} className="mt-1 text-xs text-red-600 dark:text-red-400">{form.errors[name]}</p>;
    return <section className="min-w-0 space-y-6 [overflow-wrap:anywhere] [&_div]:min-w-0 [&_label]:min-w-0 [&_input]:min-w-0 [&_button]:min-h-10 [&_svg]:shrink-0">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><h2 className="flex items-center gap-3 text-2xl font-bold"><Users className="text-cyan-600" /> Our Team</h2><p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Kelola profil, foto, urutan, dan publikasi anggota tim.</p></div><div className="flex flex-wrap gap-3"><Link href="/our-team" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm dark:border-white/10">Lihat halaman <ExternalLink size={16} /></Link><button type="button" disabled={busy} onClick={() => openForm()} className="inline-flex items-center gap-2 rounded-xl bg-[#005792] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"><Plus size={17} /> Tambah anggota</button></div></div>
        {notice && <p role="status" className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">{notice}</p>}
        {actionError && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950 dark:text-red-200">{actionError}</p>}
        {formOpen && <form ref={formRef} onSubmit={submit} className="scroll-mt-24 rounded-2xl border border-cyan-200 bg-white p-5 sm:p-7 dark:border-cyan-900 dark:bg-slate-900" aria-label={editing ? 'Edit anggota tim' : 'Tambah anggota tim'}><div className="mb-5 flex items-center justify-between gap-3"><h3 className="text-lg font-bold">{editing ? `Edit ${editing.name}` : 'Anggota baru'}</h3><button type="button" onClick={closeForm} disabled={busy} aria-label="Tutup formulir" className="rounded-lg p-2 disabled:opacity-50"><X size={20} /></button></div>
            {Object.keys(form.errors).length > 0 && <div role="alert" className="mb-5 rounded-xl bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950 dark:text-red-200"><p className="font-bold">Profil belum tersimpan. Periksa isian berikut:</p><ul className="mt-2 list-inside list-disc">{Object.entries(form.errors).map(([key, value]) => <li key={key}>{value}</li>)}</ul></div>}
            <fieldset disabled={busy} className="grid min-w-0 gap-5 disabled:opacity-60 sm:grid-cols-2">
                {[[ 'name', 'Nama', true ], [ 'role', 'Peran / jabatan', true ], [ 'division', 'Divisi', true ], [ 'skills', 'Keahlian (pisahkan dengan koma)', false ]].map(([name, label, required]) => <label key={name} htmlFor={`team-${name}`} className="text-sm font-semibold">{label}{required && ' *'}<input id={`team-${name}`} required={required} maxLength={name === 'skills' ? undefined : 255} value={form.data[name]} onChange={event => form.setData(name, event.target.value)} aria-invalid={!!form.errors[name]} aria-describedby={form.errors[name] ? `team-${name}-error` : undefined} className={fieldClass} />{errorFor(name)}</label>)}
                <label htmlFor="team-bio" className="text-sm font-semibold sm:col-span-2">Bio<textarea id="team-bio" rows={4} value={form.data.bio} onChange={event => form.setData('bio', event.target.value)} aria-invalid={!!form.errors.bio} className={fieldClass} />{errorFor('bio')}</label>
                <div><label htmlFor="team-photo" className="text-sm font-semibold">Foto profil</label><div className="mt-2 flex flex-wrap items-start gap-4">{(preview || editing?.photo_url) ? <img src={preview || editing.photo_url} alt="Pratinjau foto profil" className="h-28 w-24 rounded-xl object-cover" /> : <div className="flex h-28 w-24 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 dark:bg-cyan-950"><ImagePlus size={28} /></div>}<div className="min-w-0 flex-1"><input ref={fileRef} id="team-photo" type="file" accept="image/jpeg,image/png,image/webp" onChange={event => { if (guardPhotoSelection(event)) form.setData('photo', event.target.files?.[0] || null); }} aria-invalid={!!form.errors.photo} className="block w-full max-w-full text-xs file:mr-3 file:rounded-lg file:border-0 file:bg-cyan-50 file:px-3 file:py-2 file:font-semibold file:text-cyan-800" /><p className="mt-2 text-xs text-slate-500">JPG, PNG, atau WebP. Maksimal 2 MiB/foto. Gunakan foto potret. Kosongkan untuk mempertahankan foto saat ini.</p>{form.data.photo && <button type="button" onClick={() => { form.setData('photo', null); if (fileRef.current) fileRef.current.value = ''; }} className="mt-2 text-xs font-semibold text-cyan-700 dark:text-cyan-400">Batalkan foto baru</button>}{errorFor('photo')}</div></div></div>
                <div className="space-y-4"><label htmlFor="team-sort_order" className="block text-sm font-semibold">Urutan tampil<input id="team-sort_order" type="number" min="0" step="1" required value={form.data.sort_order} onChange={event => form.setData('sort_order', event.target.value)} aria-invalid={!!form.errors.sort_order} className={fieldClass} />{errorFor('sort_order')}<span className="mt-1 block text-xs font-normal text-slate-500">Angka lebih kecil ditampilkan lebih dulu.</span></label><label className="flex items-start gap-3 text-sm"><input type="checkbox" checked={form.data.is_active} onChange={event => form.setData('is_active', event.target.checked)} className="mt-1 h-4 w-4 accent-cyan-700" /><span><strong>Aktif / tampil di halaman publik</strong><span className="block text-xs text-slate-500">Nonaktifkan untuk menyimpan sebagai draf.</span></span></label>{errorFor('is_active')}</div>
                {form.progress && <p className="text-sm text-cyan-700 sm:col-span-2" role="status">Mengunggah {form.progress.percentage}%</p>}
                <div className="flex flex-wrap gap-3 sm:col-span-2"><button type="submit" className="rounded-xl bg-[#005792] px-5 py-3 text-sm font-bold text-white">{form.processing ? 'Menyimpan…' : 'Simpan profil'}</button><button type="button" onClick={closeForm} className="rounded-xl border border-slate-200 px-5 py-3 text-sm dark:border-white/10">Batal</button></div>
            </fieldset></form>}
        <div className="space-y-3">{teamMembers.length ? teamMembers.map(member => {
            const active = [true, 1, '1'].includes(member.is_active);
            return <article key={member.id} className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center dark:border-white/10 dark:bg-slate-900"><div className="flex min-w-0 flex-1 items-center gap-4">{member.photo_url ? <img src={member.photo_url} alt={member.name} loading="lazy" className="h-20 w-16 shrink-0 rounded-xl object-cover" /> : <div className="flex h-20 w-16 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700 dark:bg-cyan-950"><Users size={25} /></div>}<div className="min-w-0"><h3 className="break-words font-bold">{member.name}</h3><p className="mt-1 break-words text-sm text-slate-500">{member.role} · {member.division}</p><p className="mt-2 text-xs text-slate-500">Urutan {member.sort_order ?? 0} · <span className={active ? 'text-emerald-700 dark:text-emerald-400' : ''}>{active ? 'Aktif / publik' : 'Nonaktif / draf'}</span></p></div></div><div className="flex flex-wrap items-center gap-2"><button type="button" role="switch" aria-checked={active} aria-label={`Publikasi ${member.name}`} disabled={busy} onClick={() => runAction(member, 'toggle')} className={`rounded-xl border px-3 py-2 text-xs font-bold disabled:opacity-50 ${active ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200' : 'border-slate-200 text-slate-500 dark:border-white/10'}`}>{busyId === member.id ? 'Memproses…' : active ? 'Nonaktifkan' : 'Aktifkan'}</button><button type="button" disabled={busy} onClick={() => openForm(member)} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold disabled:opacity-50 dark:border-white/10"><Pencil size={15} /> Edit</button><button type="button" disabled={busy} onClick={() => runAction(member, 'delete')} aria-label={`Hapus ${member.name}`} className="rounded-xl p-2.5 text-red-600 hover:bg-red-50 disabled:opacity-50 dark:hover:bg-red-950"><Trash2 size={17} /></button></div></article>;
        }) : <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center dark:border-white/10"><Users className="mx-auto mb-4 h-10 w-10 text-cyan-600" /><h3 className="font-bold">Belum ada anggota tim</h3><p className="mt-2 text-sm text-slate-500">Tambahkan profil pertama. Hanya profil aktif yang muncul di halaman publik.</p></div>}</div>
    </section>;
}
