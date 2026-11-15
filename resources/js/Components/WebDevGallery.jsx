import React, { useState } from 'react';

export default function WebDevGallery({ galleries = [] }) {
    const [selected, setSelected] = useState(null);
    const albums = galleries.filter((gallery) => gallery.file_webp_path && !['video', 'before_after'].includes(gallery.media_type));

    if (!albums.length) return null;

    return (
        <section id="galeri-web-development" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-200 dark:border-white/10">
            <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-slate-900 dark:text-white">Galeri Proyek Web Development</h2>
            <p className="mt-3 mb-8 text-slate-600 dark:text-slate-400">Dokumentasi dan tampilan proyek yang kami kembangkan.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {albums.map((gallery) => {
                    const photos = [...new Set([gallery.file_webp_path, ...(gallery.exif_metadata_json?.sub_photos || [])])].filter(Boolean);
                    return (
                        <article key={gallery.id} className="overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900">
                            <button type="button" onClick={() => setSelected({ title: gallery.title, photos, index: 0 })} className="block w-full text-left cursor-pointer" aria-label={`Lihat foto ${gallery.title}`}>
                                <img src={gallery.file_webp_path} alt={gallery.title} loading="lazy" decoding="async" className="w-full aspect-[4/3] object-cover" />
                                <div className="p-5"><h3 className="font-bold text-slate-900 dark:text-white">{gallery.title}</h3><p className="mt-2 text-sm text-cyan-700 dark:text-cyan-300">Lihat {photos.length} foto</p></div>
                            </button>
                        </article>
                    );
                })}
            </div>
            {selected && (
                <dialog open aria-label={selected.title} className="fixed inset-0 z-[100] m-0 w-screen h-dvh max-w-none max-h-none bg-slate-950/95 text-white p-4 sm:p-8 flex flex-col items-center justify-center" onKeyDown={(event) => { if (event.key === 'Escape') setSelected(null); }}>
                    <button autoFocus type="button" onClick={() => setSelected(null)} className="absolute top-4 right-4 px-4 py-3 rounded-xl bg-white/15 cursor-pointer">Tutup ✕</button>
                    <img src={selected.photos[selected.index]} alt={`${selected.title} — foto ${selected.index + 1}`} className="max-w-full max-h-[72dvh] object-contain" />
                    <p className="mt-4 text-center">{selected.title} · {selected.index + 1} / {selected.photos.length}</p>
                    {selected.photos.length > 1 && <div className="flex gap-4 mt-4"><button type="button" className="px-5 py-3 bg-white/15 rounded-xl cursor-pointer" onClick={() => setSelected({ ...selected, index: (selected.index - 1 + selected.photos.length) % selected.photos.length })}>Sebelumnya</button><button type="button" className="px-5 py-3 bg-white/15 rounded-xl cursor-pointer" onClick={() => setSelected({ ...selected, index: (selected.index + 1) % selected.photos.length })}>Berikutnya</button></div>}
                </dialog>
            )}
        </section>
    );
}
