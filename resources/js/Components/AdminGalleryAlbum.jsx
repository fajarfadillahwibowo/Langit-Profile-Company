import React, { useEffect, useState } from 'react';

export function GalleryPhotoPreview({ file, url, label = 'Thumbnail / Cover' }) {
    const [src, setSrc] = useState(url || '');
    useEffect(() => {
        const objectUrl = file ? URL.createObjectURL(file) : null;
        setSrc(objectUrl || url || '');
        return () => { if (objectUrl) URL.revokeObjectURL(objectUrl); };
    }, [file, url]);
    return src ? <img src={src} alt={label} className="w-full max-h-40 object-contain rounded-xl bg-slate-900" /> : null;
}

export default function AdminGalleryAlbum({ existing = [], files, removed, onFiles, onRemoved, error }) {
    const [localError, setLocalError] = useState('');
    const count = existing.length - removed.length + files.length;
    return <fieldset className="min-w-0 max-w-full space-y-3 p-3 sm:p-4 border border-amber-500/30 rounded-2xl [overflow-wrap:anywhere]">
        <legend className="max-w-full px-1 font-bold text-sm">Foto Album ({count}/10) — terpisah dari thumbnail</legend>
        <p className="text-xs text-slate-500">Upload 1–10 foto album. Thumbnail hanya tampil di kartu; popup menampilkan foto album ini. JPG, PNG, WebP, GIF, AVIF • Maks. 5 MiB/foto.</p>
        <input type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif,image/avif" aria-label="Tambah foto album" onChange={e => {
            const added = Array.from(e.target.files || []);
            e.target.value = '';
            if (count + added.length > 10) { setLocalError('Maksimal 10 foto album, tidak termasuk thumbnail.'); return; }
            if (added.some(file => !['image/jpeg','image/png','image/webp','image/gif','image/avif'].includes(file.type) || file.size > 5 * 1024 * 1024)) {
                setLocalError('Pilih gambar valid maksimal 5 MiB/foto.'); return;
            }
            setLocalError(''); onFiles([...files, ...added]);
        }} className="block min-w-0 w-full max-w-full text-base sm:text-xs" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {existing.map((url, index) => !removed.includes(index) && <div key={index} className="space-y-1">
                <GalleryPhotoPreview url={url} label={`Foto album ${index + 1}`} />
                <button type="button" className="text-xs text-red-500" onClick={() => onRemoved([...removed, index])}>Hapus foto lama</button>
            </div>)}
            {files.map((file, index) => <div key={index} className="space-y-1">
                <GalleryPhotoPreview file={file} label={file.name} />
                <button type="button" className="text-xs text-red-500" onClick={() => onFiles(files.filter((_, i) => i !== index))}>Batal upload {index + 1}</button>
            </div>)}
        </div>
        {(localError || error) && <p role="alert" className="text-red-500 text-xs">{localError || error}</p>}
    </fieldset>;
}
