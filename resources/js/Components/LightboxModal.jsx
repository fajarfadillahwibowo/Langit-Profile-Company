import React from 'react';
import { X, Camera, Aperture, Eye, Disc, Clock, Gauge } from 'lucide-react';

export default function LightboxModal({ item, onClose }) {
    if (!item) return null;

    const exif = item.exif_metadata_json || {};

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 dark:bg-black/90 backdrop-blur-xl animate-in fade-in duration-200">
            <div className="relative max-w-5xl w-full bg-white dark:bg-[#090D16] border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col lg:flex-row">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/90 text-slate-700 hover:text-slate-950 hover:bg-white dark:bg-black/60 dark:text-white/80 dark:hover:text-white dark:hover:bg-black/90 border border-slate-200 dark:border-white/10 transition-colors shadow-sm"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Main Media Preview */}
                <div className="lg:w-2/3 bg-slate-100 dark:bg-black/60 flex items-center justify-center p-4 relative group min-h-[350px] lg:min-h-[500px]">
                    <img 
                        src={item.file_webp_path} 
                        alt={item.title}
                        className="max-h-[75vh] w-auto max-w-full object-contain rounded-lg shadow-2xl" 
                    />
                </div>

                {/* EXIF Inspector Sidebar (PRD 4.1) */}
                <div className="lg:w-1/3 p-6 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-white/10 bg-slate-50/90 dark:bg-[#0C101A]/80">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#005792]/15 text-[#005792] dark:text-[#38BDF8] border border-[#005792]/30 uppercase font-semibold">
                                {item.category}
                            </span>
                            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                                EXIF Inspector
                            </span>
                        </div>

                        <h3 className="font-heading font-bold text-xl text-slate-900 dark:text-white mb-2 leading-tight">
                            {item.title}
                        </h3>

                        <p className="text-xs text-slate-600 dark:text-slate-400 mb-6">
                            Mahakarya visual sinematik Langit Creative Labs. Format beresolusi tinggi dengan kalibrasi warna presisi.
                        </p>

                        {/* EXIF Data Grid */}
                        <div className="space-y-3 font-mono text-xs">
                            <div className="p-3 rounded-xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 flex items-center gap-3 shadow-sm dark:shadow-none">
                                <Camera className="w-4 h-4 text-[#005792] dark:text-[#38BDF8] shrink-0" />
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-slate-500 uppercase">Camera Body</span>
                                    <span className="text-slate-800 dark:text-slate-200 font-semibold">{exif.camera || 'Sony Cinema Line'}</span>
                                </div>
                            </div>

                            <div className="p-3 rounded-xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 flex items-center gap-3 shadow-sm dark:shadow-none">
                                <Disc className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-slate-500 uppercase">Lens Optics</span>
                                    <span className="text-slate-800 dark:text-slate-200 font-semibold">{exif.lens || 'G Master Prime'}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div className="p-2.5 rounded-xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 flex items-center gap-2.5 shadow-sm dark:shadow-none">
                                    <Aperture className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-slate-500 uppercase">Aperture</span>
                                        <span className="text-slate-800 dark:text-slate-200 font-semibold">{exif.aperture || 'f/2.8'}</span>
                                    </div>
                                </div>

                                <div className="p-2.5 rounded-xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 flex items-center gap-2.5 shadow-sm dark:shadow-none">
                                    <Clock className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-slate-500 uppercase">Shutter</span>
                                        <span className="text-slate-800 dark:text-slate-200 font-semibold">{exif.shutter || '1/500s'}</span>
                                    </div>
                                </div>

                                <div className="p-2.5 rounded-xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 flex items-center gap-2.5 shadow-sm dark:shadow-none">
                                    <Gauge className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400 shrink-0" />
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-slate-500 uppercase">ISO Sensitivity</span>
                                        <span className="text-slate-800 dark:text-slate-200 font-semibold">{exif.iso || '100'}</span>
                                    </div>
                                </div>

                                <div className="p-2.5 rounded-xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 flex items-center gap-2.5 shadow-sm dark:shadow-none">
                                    <Eye className="w-3.5 h-3.5 text-pink-600 dark:text-pink-400 shrink-0" />
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-slate-500 uppercase">Focal Length</span>
                                        <span className="text-slate-800 dark:text-slate-200 font-semibold">{exif.focal_length || '50mm'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-between">
                        <span className="text-[11px] font-mono text-slate-500">Color Profile: Rec.709</span>
                        <a 
                            href="https://wa.me/6282246142791?text=Halo%20Admin%20Langit,%20saya%20tertarik%20dengan%20gaya%20visual%20karya%20foto%20ini"
                            target="_blank"
                            rel="noreferrer"
                            className="px-3.5 py-1.5 rounded-lg bg-[#005792] hover:bg-[#004270] text-white text-xs font-semibold transition-colors shadow-sm"
                        >
                            Konsultasikan Shoot Serupa
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
