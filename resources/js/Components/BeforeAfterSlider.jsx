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
        <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-[#090D16] select-none group">
            <div 
                ref={containerRef}
                className="relative w-full aspect-[16/9] md:aspect-[21/9] overflow-hidden cursor-ew-resize"
                onMouseMove={handleMouseMove}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchMove={handleTouchMove}
            >
                {/* AFTER Image (Color Graded - Background full) */}
                <img 
                    src={afterImg} 
                    alt="Color Graded" 
                    className="absolute inset-0 w-full h-full object-cover"
                />

                {/* BEFORE Image (RAW - Clipped by sliderPosition) */}
                <div 
                    className="absolute inset-y-0 left-0 overflow-hidden"
                    style={{ width: `${sliderPosition}%` }}
                >
                    <img 
                        src={beforeImg} 
                        alt="RAW Flat" 
                        className="absolute inset-y-0 left-0 w-full h-full object-cover"
                        style={{ 
                            width: containerRef.current ? `${containerRef.current.offsetWidth}px` : '100%',
                            maxWidth: 'none'
                        }}
                    />
                </div>

                {/* Split Handle Divider Line */}
                <div 
                    className="absolute inset-y-0 z-20 w-0.5 bg-white shadow-[0_0_12px_rgba(255,255,255,0.8)]"
                    style={{ left: `${sliderPosition}%` }}
                >
                    {/* Circle handle button */}
                    <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-white text-black font-bold flex items-center justify-center shadow-xl border border-black/20 group-hover:scale-110 transition-transform">
                        <SlidersHorizontal className="w-4 h-4 text-slate-800" />
                    </div>
                </div>

                {/* Labels */}
                <div className="absolute top-4 left-4 z-20 px-3 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-xs font-mono text-amber-300">
                    {beforeLabel}
                </div>
                <div className="absolute top-4 right-4 z-20 px-3 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-xs font-mono text-cyan-300">
                    {afterLabel}
                </div>

                {/* Helper instruction overlay */}
                <div className="absolute bottom-4 inset-x-0 z-20 flex justify-center pointer-events-none">
                    <span className="px-4 py-1.5 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-[11px] font-mono text-slate-300 shadow-lg">
                        ↔ Geser slider untuk membandingkan grading warna RAW vs Post-Production
                    </span>
                </div>
            </div>
        </div>
    );
}
