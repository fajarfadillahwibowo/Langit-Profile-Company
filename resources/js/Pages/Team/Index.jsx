import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Head, Link } from '@inertiajs/react';
import { createPortal } from 'react-dom';
import { ArrowUpRight, ArrowRight, Search, Users, X, Sparkles } from 'lucide-react';
import PublicLayout from '@/Layouts/PublicLayout';
import { filterMembers, memberSkills, groupMembersByTier } from '@/Utils/team.mjs';
import { useQuality } from '@/Context/QualityContext';
import './team.css';

function PortraitQuality() {
    const { quality, setQuality } = useQuality();
    return <div className="flex items-center gap-1 rounded-full border border-slate-200 p-1 dark:border-white/15" role="group" aria-label="Kualitas foto tim">{['sd', 'hd'].map(mode => <button key={mode} type="button" aria-pressed={quality === mode} onClick={() => setQuality(mode)} className={`min-h-11 min-w-11 rounded-full px-3 text-xs font-semibold ${quality === mode ? 'bg-[#005792] text-white' : 'text-slate-600 dark:text-slate-300'}`}>{mode.toUpperCase()}</button>)}</div>;
}

const tierLabels = {
    founder: { title: 'Founder', caption: 'Di balik arah & visi', number: '01' },
    staff: { title: 'Karyawan', caption: 'Orang-orang di balik setiap karya', number: '02' },
    collaborator: { title: 'Internship & Freelancer', caption: 'Perspektif baru, kolaborasi yang berarti', number: '03' },
};

function TeamCard({ member, tier, index, onSelect }) {
    return <button type="button" data-tier={tier} onClick={() => onSelect(member)}
        aria-label={`Lihat profil ${member.name}`} className={`team-card team-card--${tier}`}
        style={{ '--entry-delay': `${Math.min(index, 5) * 65}ms` }}>
        <div className="team-card-photo"><Portrait member={member} />
            <span className="team-card-role">{member.role || 'Tim Langit'}</span>
            <span className="team-card-open" aria-hidden="true"><ArrowUpRight size={21} /></span>
        </div>
        <div className="team-card-info">
            <p className="team-card-division">{member.division && member.division !== '-' ? member.division : 'Langit Creative'}</p>
            <h4>{member.name}</h4>
            <span className="team-card-link">Kenali lebih dekat <ArrowRight size={15} aria-hidden="true" /></span>
        </div>
    </button>;
}

function Portrait({ member, className = '' }) {
    const [failed, setFailed] = useState(false);
    const { getOptimizedImage } = useQuality();
    const source = getOptimizedImage(member.photo_url, { sdWidth: 640, hdWidth: 1200 });
    useEffect(() => setFailed(false), [source]);
    return member.photo_url && !failed ? <img src={source} alt={`Foto ${member.name}`} loading="lazy" decoding="async" onError={() => setFailed(true)} className={`h-full w-full object-cover ${className}`} /> : <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br from-cyan-100 to-slate-200 text-[#005792] dark:from-cyan-950 dark:to-slate-900 dark:text-cyan-300 ${className}`}><Users className="h-16 w-16" aria-hidden="true" /><span className="sr-only">Foto belum tersedia</span></div>;
}

function ProfileDialog({ member, onClose }) {
    const dialogRef = useRef(null);
    useEffect(() => {
        const previousFocus = document.activeElement;
        const overflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        dialogRef.current?.focus();
        const handleKey = (event) => {
            if (event.key === 'Escape') { event.preventDefault(); onClose(); }
            if (event.key === 'Tab') {
                const nodes = [...dialogRef.current.querySelectorAll('button, a[href], [tabindex="0"]')];
                const first = nodes[0]; const last = nodes[nodes.length - 1];
                if (event.shiftKey && (document.activeElement === first || document.activeElement === dialogRef.current)) { event.preventDefault(); last?.focus(); }
                else if (!event.shiftKey && (document.activeElement === last || document.activeElement === dialogRef.current)) { event.preventDefault(); first?.focus(); }
            }
        };
        document.addEventListener('keydown', handleKey);
        return () => { document.body.style.overflow = overflow; document.removeEventListener('keydown', handleKey); previousFocus?.focus(); };
    }, [onClose]);
    return createPortal(<div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/75 p-4" onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
        <section ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="team-profile-title" className="relative min-w-0 max-h-[calc(100dvh-2rem)] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white text-slate-900 shadow-2xl outline-none dark:bg-slate-900 dark:text-white">
            <button type="button" onClick={onClose} aria-label="Tutup profil" className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white p-2 text-slate-900 shadow focus-visible:ring-2 focus-visible:ring-cyan-500"><X size={22} /></button>
            <div className="grid sm:grid-cols-5"><div className="min-w-0 aspect-[4/3] sm:col-span-2 sm:aspect-auto sm:min-h-96"><Portrait member={member} /></div><div className="min-w-0 p-5 sm:col-span-3 sm:p-9">
                <p className="mb-3 break-words text-xs font-bold uppercase tracking-widest text-cyan-700 dark:text-cyan-300">{member.division && member.division !== '-' ? member.division : 'Tim Langit'}</p>
                <h2 id="team-profile-title" className="text-2xl sm:text-3xl font-bold break-words">{member.name}</h2><p className="mt-2 break-words font-medium text-[#005792] dark:text-cyan-300">{member.role}</p>
                <p className="mt-6 whitespace-pre-line break-words leading-relaxed text-slate-600 dark:text-slate-300">{member.bio || 'Profil lengkap akan segera tersedia.'}</p>
                {memberSkills(member.skills).length > 0 && <div className="mt-6"><h3 className="mb-3 text-sm font-bold">Keahlian</h3><div className="flex flex-wrap gap-2">{memberSkills(member.skills).map((skill, index) => <span key={`${skill}-${index}`} className="max-w-full break-words rounded-lg bg-cyan-50 px-3 py-1.5 text-xs text-cyan-900 dark:bg-cyan-950 dark:text-cyan-200">{skill}</span>)}</div></div>}
                <Link href="/konsultasi" className="mt-8 w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#005792] px-5 py-3 text-sm font-bold text-white hover:bg-cyan-800">Diskusikan proyek <ArrowUpRight size={16} className="shrink-0" /></Link>
            </div></div>
        </section>
    </div>, document.body);
}

export default function TeamIndex({ teamMembers: members = [] }) {
    const [division, setDivision] = useState('all');
    const [query, setQuery] = useState('');
    const [selected, setSelected] = useState(null);
    const closeProfile = React.useCallback(() => setSelected(null), []);
    const entries = Array.isArray(members) ? members : [];
    const divisions = useMemo(() => [...new Set(entries.map(member => member.division).filter(value => value && value !== '-'))], [members]);
    const filtered = filterMembers(entries, division, query);
    return <PublicLayout><Head title="Our Team — Langit" /><div className="team-page mx-auto max-w-7xl px-5 sm:px-8">
        <section className="team-intro relative overflow-hidden rounded-[2rem] bg-[#06283D] px-5 py-10 text-white sm:px-12 sm:py-16">
            <div aria-hidden="true" className="team-orbit"><span /><span /><span /></div>
            <div className="relative min-w-0 max-w-3xl team-intro-copy"><p className="mb-6 inline-flex max-w-full items-center gap-2 text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] sm:tracking-[0.25em] text-cyan-300"><Sparkles size={16} className="shrink-0" /> Our Team / Langit</p><h1 className="text-3xl min-[390px]:text-4xl break-words font-bold leading-tight tracking-tight sm:text-6xl">Beragam keahlian.<br /><span className="team-intro-highlight text-cyan-300">Satu ruang berkarya.</span></h1><p className="mt-6 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">Kenali orang-orang di balik ide, karya visual, dan solusi digital Langit. Temukan rekan kolaborasi untuk langkah berikutnya.</p><a href="#kenali-tim" className="team-intro-link mt-8 inline-flex min-h-11 items-center gap-2 border-b border-cyan-300 pb-2 font-semibold text-cyan-200">Kenali tim kami <ArrowRight size={18} className="shrink-0" /></a></div>
        </section>
        <section id="kenali-tim" className="scroll-mt-28 py-14 sm:py-20"><div className="mb-8 flex flex-col justify-between gap-6 md:flex-row md:items-end"><div><p className="mb-2 text-xs font-bold uppercase tracking-widest text-cyan-700 dark:text-cyan-400">Orang-orang di balik karya</p><h2 className="text-3xl font-bold text-[#06283D] dark:text-white">Talenta di balik Langit</h2></div><label className="relative w-full md:max-w-xs"><span className="sr-only">Cari nama, peran, atau keahlian</span><Search aria-hidden="true" className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" /><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Cari nama, peran, keahlian…" className="w-full min-w-0 rounded-xl border border-slate-200 bg-white py-3 pl-12 pr-4 text-base sm:text-sm focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 dark:border-white/10 dark:bg-slate-900" /></label></div>
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4"><div className="flex flex-wrap gap-2" role="group" aria-label="Filter divisi">{['all', ...divisions].map(value => <button type="button" key={value} aria-pressed={division === value} onClick={() => setDivision(value)} className={`max-w-full min-h-11 break-words rounded-full border px-4 sm:px-5 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-cyan-500 ${division === value ? 'border-[#005792] bg-[#005792] text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-cyan-500 dark:border-white/10 dark:bg-slate-900 dark:text-slate-300'}`}>{value === 'all' ? 'Semua divisi' : value}</button>)}</div>{entries.length > 0 && <PortraitQuality />}</div>
            <p className="sr-only" role="status">{filtered.length} anggota ditampilkan</p>
            {filtered.length ? <div className="team-hierarchy">{groupMembersByTier(filtered).map(group => <section key={group.id} className={`team-tier team-tier--${group.id}`} aria-labelledby={`tier-${group.id}`}>
                <div className="team-tier-heading"><span className="team-tier-number" aria-hidden="true">{tierLabels[group.id].number}</span><div><p>{tierLabels[group.id].caption}</p><h3 id={`tier-${group.id}`}>{tierLabels[group.id].title}</h3></div><span className="team-tier-count">{group.members.length} anggota</span></div>
                <div className="team-tier-cards">{group.members.map((member, index) => <TeamCard key={member.id} member={member} tier={group.id} index={index} onSelect={setSelected} />)}</div>
            </section>)}</div> : <div className="rounded-3xl border border-dashed border-cyan-300 bg-white/60 px-6 py-16 text-center dark:border-cyan-900 dark:bg-slate-900/50"><Users aria-hidden="true" className="mx-auto mb-5 h-12 w-12 text-cyan-600" /><h3 className="text-xl font-bold">{entries.length ? 'Belum menemukan yang dicari?' : 'Ruang untuk mengenal kami lebih dekat.'}</h3><p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-500 dark:text-slate-400">{entries.length ? 'Coba kata kunci lain atau tampilkan semua divisi.' : 'Profil tim sedang disiapkan. Sementara itu, ceritakan kebutuhan Anda langsung kepada kami.'}</p>{entries.length > 0 && <button type="button" onClick={() => { setQuery(''); setDivision('all'); }} className="mt-6 rounded-xl bg-[#005792] px-5 py-3 text-sm font-bold text-white">Reset pencarian</button>}</div>}
        </section>
        <section className="flex flex-col justify-between gap-6 rounded-3xl border border-cyan-200 bg-cyan-50 p-5 lg:flex-row lg:items-center sm:p-10 dark:border-cyan-900 dark:bg-cyan-950/30"><div className="min-w-0"><h2 className="text-2xl font-bold">Ide Anda, kolaborasi kita.</h2><p className="mt-2 text-slate-600 dark:text-slate-400">Mari mulai percakapan dan wujudkan langkah berikutnya.</p></div><Link href="/konsultasi" className="inline-flex shrink-0 items-center justify-center gap-3 rounded-xl bg-[#005792] px-4 sm:px-6 py-4 text-sm sm:text-base font-semibold text-white hover:bg-cyan-800">Mulai konsultasi <ArrowUpRight size={20} className="shrink-0" /></Link></section>
    </div>{selected && <ProfileDialog member={selected} onClose={closeProfile} />}</PublicLayout>;
}
