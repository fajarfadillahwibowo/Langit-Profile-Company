import React from 'react';

const FLOATING_ORBS = [
    { size: 10, x: '10%', y: '20%', dur: '15s', delay: '0s', dx: '28px', dy: '-46px', desktopOnly: false },
    { size: 7, x: '26%', y: '74%', dur: '12s', delay: '1.4s', dx: '-22px', dy: '-54px', desktopOnly: false },
    { size: 12, x: '74%', y: '24%', dur: '17s', delay: '0.6s', dx: '-30px', dy: '-42px', desktopOnly: false },
    { size: 8, x: '84%', y: '68%', dur: '13s', delay: '2.1s', dx: '24px', dy: '-50px', desktopOnly: false },
    { size: 9, x: '48%', y: '42%', dur: '16s', delay: '1s', dx: '26px', dy: '-44px', desktopOnly: true },
    { size: 6, x: '60%', y: '80%', dur: '11s', delay: '2.6s', dx: '-20px', dy: '-48px', desktopOnly: true },
];

/**
 * Ultra-lightweight moving ambient backdrop engineered for 4GB RAM & older devices:
 * - Zero CSS `filter: blur(...)` shaders (uses pre-feathered radial gradients instead)
 * - Zero JS animation ticks (100% pure CSS compositor `transform: translate3d` + `opacity`)
 * - Strict paint/layout containment (`contain: strict`) so scrolling stays locked at 60 FPS
 */
export default function AnimatedAmbientBackdrop({ variant = 'adaptive' }) {
    const isDarkOnly = variant === 'dark';

    return (
        <div
            aria-hidden="true"
            className="fixed inset-0 overflow-hidden pointer-events-none z-0"
            style={{ contain: 'strict' }}
        >
            {/* Flowing Aurora Glow 1 (Pre-feathered radial gradient — ZERO blur filter cost) */}
            <div
                className={`absolute -top-36 -left-32 w-[32rem] h-[32rem] sm:w-[44rem] sm:h-[44rem] rounded-full animate-aurora-1 ${
                    isDarkOnly ? 'opacity-55' : 'opacity-70 dark:opacity-55'
                }`}
                style={{
                    background:
                        'radial-gradient(circle, rgba(14,165,233,0.34) 0%, rgba(6,182,212,0.16) 34%, rgba(6,182,212,0.04) 58%, transparent 72%)',
                }}
            />

            {/* Flowing Aurora Glow 2 */}
            <div
                className={`absolute -bottom-40 -right-28 w-[34rem] h-[34rem] sm:w-[46rem] sm:h-[46rem] rounded-full animate-aurora-2 ${
                    isDarkOnly ? 'opacity-50' : 'opacity-60 dark:opacity-50'
                }`}
                style={{
                    background:
                        'radial-gradient(circle, rgba(99,102,241,0.32) 0%, rgba(0,87,146,0.16) 36%, rgba(14,165,233,0.04) 58%, transparent 72%)',
                }}
            />

            {/* Flowing Aurora Glow 3 (Desktop & Tablet only to save mobile VRAM) */}
            <div
                className={`hidden sm:block absolute top-1/3 left-1/3 w-[32rem] h-[32rem] rounded-full animate-aurora-3 ${
                    isDarkOnly ? 'opacity-35' : 'opacity-45 dark:opacity-35'
                }`}
                style={{
                    background:
                        'radial-gradient(circle, rgba(20,184,166,0.26) 0%, rgba(56,189,248,0.11) 38%, transparent 70%)',
                }}
            />

            {/* Pre-Feathered Moving Diagonal Light Ribbon (ZERO blur filter) */}
            <div
                className="absolute -top-1/4 left-0 h-[150%] w-72 animate-ambient-ribbon"
                style={{
                    background: isDarkOnly
                        ? 'linear-gradient(90deg, transparent 0%, rgba(56,189,248,0.03) 30%, rgba(34,211,238,0.08) 50%, rgba(56,189,248,0.03) 70%, transparent 100%)'
                        : 'linear-gradient(90deg, transparent 0%, rgba(14,165,233,0.04) 30%, rgba(56,189,248,0.09) 50%, rgba(14,165,233,0.04) 70%, transparent 100%)',
                }}
            />

            {/* Lightweight Drifting Bokeh Dots (Pure CSS Compositor) */}
            {FLOATING_ORBS.map((orb, idx) => (
                <span
                    key={idx}
                    className={`${orb.desktopOnly ? 'hidden sm:block' : 'block'} absolute rounded-full animate-ambient-orb ${
                        isDarkOnly ? 'bg-cyan-300/70' : 'bg-sky-500/50 dark:bg-cyan-300/70'
                    }`}
                    style={{
                        left: orb.x,
                        top: orb.y,
                        width: orb.size,
                        height: orb.size,
                        '--orb-dx': orb.dx,
                        '--orb-dy': orb.dy,
                        '--orb-dur': orb.dur,
                        '--orb-delay': orb.delay,
                    }}
                />
            ))}
        </div>
    );
}
