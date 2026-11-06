import React from 'react';
import { createPortal } from 'react-dom';
import { X, Camera, Aperture, Eye, Disc, Clock, Gauge, Sparkles, Zap, Images, ChevronRight } from 'lucide-react';
import { useQuality } from '@/Context/QualityContext';
import { getWhatsAppUrl } from '@/Utils/whatsapp';
import { albumPhotos } from '@/Utils/galleryAlbum.mjs';

export default function LightboxModal({ item, onClose, relatedGalleries = [], onSelectRelated, albumMode = false }) {
    if (!item) return null;

    const { isHd, toggleQuality, getOptimizedImage } = useQuality();
    const exif = item.exif_metadata_json || {};
    const useAlbum = albumMode && item.media_type !== 'video' && item.media_type !== 'before_after' && !item.video_url;
    const initialSrc = useAlbum ? albumPhotos(item)[0] : item.file_webp_path;
    const [currentImageSrc, setCurrentImageSrc] = React.useState(initialSrc);

    React.useEffect(() => {
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const handleEscape = (event) => {
            if (event.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEscape);
        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener('keydown', handleEscape);
        };
    }, [onClose]);

    // Sync whenever the parent item changes
    React.useEffect(() => {
        setCurrentImageSrc(initialSrc);
    }, [item, initialSrc]);

    const optimizedMainSrc = getOptimizedImage(currentImageSrc, { sdWidth: 600, hdWidth: 1600 });

    // 1. Check if the active item has embedded sub_photos (album foto per sesi)
    const embeddedSubPhotos = Array.isArray(exif.sub_photos) && exif.sub_photos.length > 0
        ? exif.sub_photos
        : [];

    // 2. Photos belonging to the same category
    const categoryGalleries = relatedGalleries.filter(
        g => g.category === item.category && g.media_type !== 'before_after'
    );

    // Build the 2-column mini gallery items:
    // If item has sub_photos, use those. If not, use category photos.
    const miniGalleryItems = useAlbum
        ? albumPhotos(item).map((url, idx) => ({
            id: `album_${idx}`, url, isCurrent: currentImageSrc === url,
            onClick: () => setCurrentImageSrc(url),
        }))
        : embeddedSubPhotos.length > 0
        ? embeddedSubPhotos.map((url, idx) => ({
            id: `sub_${idx}`,
            url: url,
            isCurrent: currentImageSrc === url,
            onClick: () => setCurrentImageSrc(url),
        }))
        : categoryGalleries.map((g) => ({
            id: g.id,
            url: g.file_webp_path,
            title: g.title,
            isCurrent: item.id === g.id && currentImageSrc === g.file_webp_path,
            onClick: () => {
                if (onSelectRelated) {
                    onSelectRelated(g);
                } else {
                    setCurrentImageSrc(g.file_webp_path);
                }
            },
        }));

    return createPortal(
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 dark:bg-black/90 backdrop-blur-xl animate-in fade-in duration-200">
            <div role="dialog" aria-modal="true" aria-label={item.title || 'Pratinjau karya'} className="relative max-w-6xl w-full max-h-[calc(100dvh-1rem)] sm:max-h-[92dvh] bg-white dark:bg-[#090D16] border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
                {/* Header Topbar inside Modal */}
                <div className="flex shrink-0 items-center justify-between gap-3 px-3 sm:px-5 py-3 border-b border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-white/[0.02]">
                    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                        <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-[#005792]/15 text-[#005792] dark:text-[#38BDF8] border border-[#005792]/30 uppercase font-bold tracking-wider">
                            {item.category ? item.category.toUpperCase() : 'VISUAL'}
                        </span>
                        <h2 className="font-heading font-extrabold text-sm sm:text-base text-slate-900 dark:text-white truncate max-w-md">
                            {item.title}
                        </h2>
                    </div>

                    <button
                        onClick={onClose}
                        className="shrink-0 min-w-10 min-h-10 flex items-center justify-center p-1.5 rounded-xl bg-slate-200/80 hover:bg-slate-300 dark:bg-white/10 dark:hover:bg-white/20 text-slate-700 dark:text-white transition-colors cursor-pointer"
                        title="Tutup Popup"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Main Content Area: Left Media Preview, Right Sidebar with 2-Column Mini Gallery + Description */}
                <div className="flex-1 overflow-y-auto flex flex-col lg:flex-row min-h-0">
                    {/* 1. Left: Main Media Preview */}
                    <div className="w-full shrink-0 lg:w-7/12 bg-slate-950 flex flex-col items-center justify-center p-4 relative group min-h-[220px] sm:min-h-[320px] lg:min-h-[500px]">
                        {item.media_type === 'video' || item.video_url ? (
                            <video 
                                src={item.video_url} 
                                poster={optimizedMainSrc}
                                controls
                                autoPlay
                                playsInline
                                className="max-h-[50dvh] lg:max-h-[68dvh] w-auto max-w-full rounded-lg shadow-2xl" 
                            />
                        ) : (
                            <img 
                                src={optimizedMainSrc} 
                                alt={item.title}
                                decoding="async"
                                className="max-h-[50dvh] lg:max-h-[68dvh] w-auto max-w-full object-contain rounded-lg shadow-2xl transition-all duration-300" 
                            />
                        )}

                        {/* Floating HD Resolution Switcher Button */}
                        <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
                            <button
                                type="button"
                                onClick={toggleQuality}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold shadow-lg backdrop-blur-md border transition-all hover:scale-105 active:scale-95 cursor-pointer ${
                                    isHd
                                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-500/30'
                                        : 'bg-black/75 text-emerald-300 border-white/20 hover:bg-black/90'
                                }`}
                                title="Klik untuk mengubah resolusi tampilan foto (SD Ringan / HD)"
                            >
                                {isHd ? <Sparkles className="w-3.5 h-3.5" /> : <Zap className="w-3.5 h-3.5 text-emerald-400" />}
                                <span>{isHd ? '✨ HD 100% Aktif' : '⚡ Mode SD (Klik untuk HD)'}</span>
                            </button>
                        </div>
                    </div>

                    {/* 2. Right: Split Column - 2-Column Mini Gallery Grid & Description / EXIF */}
                    <div className="min-w-0 shrink-0 lg:shrink lg:w-5/12 p-4 sm:p-6 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-white/10 bg-slate-50/90 dark:bg-[#0C101A]/95 overflow-y-auto">
                        <div className="space-y-5">
                            {/* Title & Description Area */}
                            <div>
                                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                                    Deskripsi Karya
                                </span>
                                <h3 className="font-heading font-black break-words text-lg text-slate-900 dark:text-white leading-snug">
                                    {item.title}
                                </h3>
                                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed bg-white/70 dark:bg-white/[0.03] p-3 rounded-xl border border-slate-200 dark:border-white/5">
                                    {item.exif_metadata_json?.description || item.description || 'Mahakarya visual sinematik Langit Creative Labs. Format beresolusi tinggi dengan kalibrasi warna presisi dan komposisi artistik.'}
                                </p>
                            </div>

                            {/* MINI GALLERY: 2-KOLOM DENGAN BEBERAPA BARIS KE BAWAH */}
                            {miniGalleryItems.length > 0 && (
                                <div className="space-y-2">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                            <Images className="w-3.5 h-3.5 text-amber-500" />
                                            <span>Galeri Foto {item.category ? item.category.toUpperCase() : ''} ({miniGalleryItems.length} Foto)</span>
                                        </span>
                                        <span className="text-[10px] font-mono text-slate-400">
                                            Klik untuk ganti foto
                                        </span>
                                    </div>

                                    {/* 2-Column Grid dengan scroll vertikal beberapa baris ke bawah */}
                                    <div className="grid grid-cols-2 gap-2.5 max-h-56 overflow-y-auto p-1 pr-1.5 scrollbar-thin rounded-2xl bg-slate-200/50 dark:bg-black/30 border border-slate-200 dark:border-white/10">
                                        {miniGalleryItems.map((thumb) => (
                                            <button
                                                key={thumb.id}
                                                type="button"
                                                onClick={thumb.onClick}
                                                className={`group relative aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all duration-200 cursor-pointer shadow-xs ${
                                                    thumb.isCurrent
                                                        ? 'border-amber-500 ring-2 ring-amber-500/50 scale-[0.98]'
                                                        : 'border-transparent hover:border-amber-400/60 opacity-80 hover:opacity-100 hover:scale-[1.02]'
                                                }`}
                                            >
                                                <img 
                                                    src={getOptimizedImage(thumb.url, { sdWidth: 200, hdWidth: 360, sdQuality: 75, hdQuality: 80 })} 
                                                    alt={thumb.title || item.title}
                                                    loading="lazy"
                                                    decoding="async"
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                                {thumb.isCurrent && (
                                                    <div className="absolute inset-0 bg-amber-500/25 flex items-center justify-center">
                                                        <span className="px-1.5 py-0.5 rounded-md bg-amber-500 text-slate-950 font-black text-[9px] font-mono uppercase tracking-wider shadow">
                                                            Aktif
                                                        </span>
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* EXIF Data Grid */}
                            <div className="pt-2 border-t border-slate-200 dark:border-white/10 space-y-2">
                                <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider block">
                                    Spesifikasi EXIF Kamera
                                </span>
                                <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                                    <div className="p-2 rounded-xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 flex items-center gap-2">
                                        <Camera className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                        <span className="truncate text-slate-800 dark:text-slate-200">{exif.camera || 'Sony Cinema'}</span>
                                    </div>
                                    <div className="p-2 rounded-xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 flex items-center gap-2">
                                        <Disc className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                                        <span className="truncate text-slate-800 dark:text-slate-200">{exif.lens || 'G Master'}</span>
                                    </div>
                                    <div className="p-2 rounded-xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 flex items-center gap-2">
                                        <Aperture className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                        <span className="text-slate-800 dark:text-slate-200">{exif.aperture || 'f/2.8'}</span>
                                    </div>
                                    <div className="p-2 rounded-xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 flex items-center gap-2">
                                        <Clock className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                                        <span className="text-slate-800 dark:text-slate-200">{exif.shutter || '1/500s'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action CTA */}
                        <div className="mt-5 pt-3 border-t border-slate-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-3">
                            <span className="text-[10px] font-mono text-slate-400">Color Profile: Rec.709 Cinema</span>
                            <a 
                                href={getWhatsAppUrl('portfolio', { 
                                    title: item.title,
                                    category: item.category || 'Dokumentasi Visual'
                                })}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3.5 py-2 rounded-xl bg-[#005792] hover:bg-[#004270] text-white text-xs font-bold transition-all shadow-sm shrink-0"
                            >
                                Konsultasi Sesi Serupa
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
