import React, { useState, useRef, useCallback } from 'react';
import { SlidersHorizontal } from 'lucide-react';

export default function BeforeAfterSlider({ 
    beforeImg, 
    afterImg, 
    beforeLabel = 'RAW S-Log3 Log Flat', 
    afterLabel = 'Langit Cinema Grade (Kodak 2383)' 
}) {
    const [sliderPosition, setSliderPosition] = useState(50);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef(null);

    const handleMove = useCallback((clientX) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = clientX - rect.left;
        const width = rect.width;
        let pos = (x / width) * 100;
        if (pos < 0) pos = 0;
        if (pos > 100) pos = 100;
        setSliderPosition(pos);
    }, []);

    const handleTouchMove = (e) => {
        handleMove(e.touches[0].clientX);
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        handleMove(e.clientX);
    };

    const handleMouseDown = () => setIsDragging(true);
    const handleMouseUp = () => setIsDragging(false);

    return (
        <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-[#090D16] select-none group">
            <div 
                ref={containerRef}
                role="slider"
                tabIndex={0}
                aria-label="Perbandingan foto sebelum dan sesudah color grading"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(sliderPosition)}
                onKeyDown={(event) => {
                    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
                    event.preventDefault();
                    setSliderPosition(position => event.key === 'Home' ? 0 : event.key === 'End' ? 100 : Math.min(100, Math.max(0, position + (event.key === 'ArrowRight' ? 5 : -5))));
                }}
                className="relative w-full aspect-[16/10] sm:aspect-[16/9] md:aspect-[21/9] min-h-[240px] sm:min-h-[380px] md:min-h-[420px] max-h-[500px] overflow-hidden cursor-ew-resize touch-none"
                onMouseMove={handleMouseMove}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={(e) => handleMove(e.touches[0].clientX)}
                onTouchMove={handleTouchMove}
            >
                {/* AFTER Image (Color Graded - Base Layer) */}
                <img 
                    src={afterImg} 
                    alt="Color Graded (After)" 
                    className="absolute inset-0 w-full h-full object-cover object-center select-none pointer-events-none"
                />

                {/* BEFORE Image (RAW Flat - Clipped via clip-path for pixel-perfect alignment) */}
                <div 
                    className="absolute inset-0 overflow-hidden pointer-events-none"
                    style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                >
                    <img 
                        src={beforeImg} 
                        alt="RAW Flat (Before)" 
                        className="absolute inset-0 w-full h-full object-cover object-center select-none pointer-events-none"
                    />
                </div>

                {/* Split Handle Divider Line */}
                <div 
                    className="absolute inset-y-0 z-20 w-0.5 bg-white shadow-[0_0_12px_rgba(255,255,255,0.8)] pointer-events-none"
                    style={{ left: `${sliderPosition}%` }}
                >
                    {/* Circle handle button */}
                    <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-white text-black font-bold flex items-center justify-center shadow-xl border border-black/20 group-hover:scale-110 transition-transform">
                        <SlidersHorizontal className="w-4 h-4 text-slate-800" />
                    </div>
                </div>

                {/* Labels */}
                <div className="absolute top-3 left-3 max-w-[44%] sm:top-4 sm:left-4 z-20 px-2 sm:px-3 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-xs font-mono text-amber-300">
                    {beforeLabel}
                </div>
                <div className="absolute top-3 right-3 max-w-[44%] sm:top-4 sm:right-4 z-20 px-2 sm:px-3 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-xs font-mono text-cyan-300">
                    {afterLabel}
                </div>

                {/* Helper instruction overlay */}
                <div className="absolute bottom-3 inset-x-3 z-20 flex justify-center pointer-events-none">
                    <span className="px-3 py-1.5 text-center rounded-2xl bg-black/70 backdrop-blur-md border border-white/10 text-[11px] font-mono text-slate-300 shadow-lg">
                        ↔ Geser slider untuk membandingkan grading warna RAW vs Post-Production
                    </span>
                </div>
            </div>
        </div>
    );
}
