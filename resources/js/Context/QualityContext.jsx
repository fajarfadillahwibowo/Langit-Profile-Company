import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const QualityContext = createContext(null);

function formatOptimizedUrl(url, options = {}, isHd = false) {
    if (!url || typeof url !== 'string') return '';

    // 1. Optimize Unsplash images dynamically
    if (url.includes('images.unsplash.com')) {
        const baseUrl = url.split('?')[0];
        if (isHd) {
            const width = options.hdWidth || 1400;
            const q = options.hdQuality || 85;
            return `${baseUrl}?auto=format&fit=crop&w=${width}&q=${q}`;
        } else {
            // In SD mode, scale down width and quality for ultra-fast loading and minimal RAM usage
            const width = options.sdWidth || 480;
            const q = options.sdQuality || 55;
            return `${baseUrl}?auto=format&fit=crop&w=${width}&q=${q}`;
        }
    }

    // 2. Optimize local storage / uploads / images dynamically
    const isLocal = url.startsWith('/') 
        || url.includes('langitcreative.pro')
        || (typeof window !== 'undefined' && url.includes(window.location.hostname));

    if (isLocal && (url.includes('/storage/') || url.includes('/uploads/') || url.includes('/images/'))) {
        let cleanPath = url;
        try {
            if (url.startsWith('http://') || url.startsWith('https://')) {
                const u = new URL(url);
                cleanPath = u.pathname;
            }
        } catch (e) {}
        cleanPath = cleanPath.replace(/^\/+/, '');

        if (cleanPath.endsWith('.svg')) return url;

        const width = isHd ? (options.hdWidth || 1400) : (options.sdWidth || 480);
        const q = isHd ? (options.hdQuality || 85) : (options.sdQuality || 78);

        return `/media/optimized?p=${encodeURIComponent(cleanPath)}&w=${width}&q=${q}`;
    }

    return url;
}

export function QualityProvider({ children }) {
    // Quality Mode: 'sd' (Standard / Ringan / Hemat Kuota - Default) or 'hd' (High Definition / Tajam Maksimal)
    const [quality, setQualityState] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('langit_quality_mode') || 'sd';
        }
        return 'sd';
    });

    useEffect(() => {
        if (typeof window === 'undefined') return;
        localStorage.setItem('langit_quality_mode', quality);
        document.documentElement.setAttribute('data-quality', quality);
        if (quality === 'hd') {
            document.documentElement.classList.add('quality-hd');
            document.documentElement.classList.remove('quality-sd');
        } else {
            document.documentElement.classList.add('quality-sd');
            document.documentElement.classList.remove('quality-hd');
        }
    }, [quality]);

    const setQuality = useCallback((mode) => {
        setQualityState(mode === 'hd' ? 'hd' : 'sd');
    }, []);

    const toggleQuality = useCallback(() => {
        setQualityState((prev) => (prev === 'hd' ? 'sd' : 'hd'));
    }, []);

    const isHd = quality === 'hd';

    // Helper to dynamically scale images according to quality mode
    const getOptimizedImage = useCallback((url, options = {}) => {
        return formatOptimizedUrl(url, options, isHd);
    }, [isHd]);

    const value = {
        quality,
        isHd,
        setQuality,
        toggleQuality,
        getOptimizedImage,
    };

    return (
        <QualityContext.Provider value={value}>
            {children}
        </QualityContext.Provider>
    );
}

export function useQuality() {
    const context = useContext(QualityContext);
    if (!context) {
        // Fallback if rendered outside provider
        return {
            quality: 'sd',
            isHd: false,
            setQuality: () => {},
            toggleQuality: () => {},
            getOptimizedImage: (url, options = {}) => {
                return formatOptimizedUrl(url, options, false);
            },
        };
    }
    return context;
}
