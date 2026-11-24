import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Link } from '@inertiajs/react';
import { Settings, Clock } from 'lucide-react';

const TONE_CLASSES = {
    default: 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10',
    primary: 'text-[#005792] dark:text-cyan-300 hover:bg-sky-50 dark:hover:bg-cyan-500/15',
    amber: 'text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-500/15',
    emerald: 'text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-500/15',
    danger: 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/15',
};

const ICON_TONE_CLASSES = {
    default: 'text-slate-500 dark:text-slate-400',
    primary: 'text-cyan-600 dark:text-cyan-400',
    amber: 'text-amber-600 dark:text-amber-400',
    emerald: 'text-emerald-600 dark:text-emerald-400',
    danger: 'text-rose-500 dark:text-rose-400',
};

export default function AdminActionMenu({
    items = [],
    metaText = '',
    metaTitle = '',
    buttonTitle = 'Menu Aksi',
}) {
    const visibleItems = items.filter((item) => item && !item.hidden);
    const [open, setOpen] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0, placeAbove: false });
    const buttonRef = useRef(null);
    const menuRef = useRef(null);

    const updatePosition = useCallback(() => {
        if (!buttonRef.current) return;
        const rect = buttonRef.current.getBoundingClientRect();
        const menuWidth = 216;
        const estimatedHeight = visibleItems.length * 40 + (metaText ? 36 : 12);
        const spaceBelow = window.innerHeight - rect.bottom;
        const placeAbove = spaceBelow < estimatedHeight + 16 && rect.top > estimatedHeight + 16;

        let left = rect.right - menuWidth;
        if (left < 12) left = 12;
        if (left + menuWidth > window.innerWidth - 12) {
            left = window.innerWidth - menuWidth - 12;
        }

        setCoords({
            top: placeAbove ? rect.top - 6 : rect.bottom + 6,
            left,
            placeAbove,
        });
    }, [visibleItems.length, metaText]);

    useEffect(() => {
        if (!open) return;
        updatePosition();

        const handleOutsideClick = (event) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target)
            ) {
                setOpen(false);
            }
        };

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                setOpen(false);
                buttonRef.current?.focus();
            }
        };

        const handleScrollOrResize = () => setOpen(false);

        document.addEventListener('mousedown', handleOutsideClick);
        document.addEventListener('keydown', handleKeyDown);
        window.addEventListener('resize', handleScrollOrResize);
        window.addEventListener('scroll', handleScrollOrResize, true);

        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
            document.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('resize', handleScrollOrResize);
            window.removeEventListener('scroll', handleScrollOrResize, true);
        };
    }, [open, updatePosition]);

    if (visibleItems.length === 0) return null;

    const menuNode = open && typeof document !== 'undefined'
        ? createPortal(
              <div
                  ref={menuRef}
                  role="menu"
                  aria-label={buttonTitle}
                  style={{
                      position: 'fixed',
                      top: coords.top,
                      left: coords.left,
                      transform: coords.placeAbove ? 'translateY(-100%)' : undefined,
                  }}
                  className="z-[9999] w-[216px] rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-white/15 shadow-2xl shadow-slate-900/20 dark:shadow-black/60 p-1.5 text-left font-sans [overflow-wrap:normal] break-normal"
              >
                  <div className="space-y-0.5">
                      {visibleItems.map((item, idx) => {
                          const Icon = item.icon;
                          const tone = item.tone || 'default';
                          const rowClass = `w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${TONE_CLASSES[tone] || TONE_CLASSES.default}`;
                          const iconClass = `w-3.5 h-3.5 shrink-0 ${ICON_TONE_CLASSES[tone] || ICON_TONE_CLASSES.default}`;

                          return (
                              <React.Fragment key={`${item.label}-${idx}`}>
                                  {item.dividerBefore && (
                                      <div className="my-1 border-t border-slate-200/80 dark:border-white/10" />
                                  )}

                                  {item.href && item.external ? (
                                      <a
                                          href={item.href}
                                          target="_blank"
                                          rel="noreferrer"
                                          role="menuitem"
                                          title={item.title || item.label}
                                          onClick={() => setOpen(false)}
                                          className={rowClass}
                                      >
                                          {Icon && <Icon className={iconClass} />}
                                          <span className="truncate">{item.label}</span>
                                      </a>
                                  ) : item.href ? (
                                      <Link
                                          href={item.href}
                                          role="menuitem"
                                          title={item.title || item.label}
                                          onClick={() => {
                                              item.onClick?.();
                                              setOpen(false);
                                          }}
                                          className={rowClass}
                                      >
                                          {Icon && <Icon className={iconClass} />}
                                          <span className="truncate">{item.label}</span>
                                      </Link>
                                  ) : (
                                      <button
                                          type="button"
                                          role="menuitem"
                                          title={item.title || item.label}
                                          onClick={(e) => {
                                              e.stopPropagation();
                                              setOpen(false);
                                              item.onClick?.(e);
                                          }}
                                          className={rowClass}
                                      >
                                          {Icon && <Icon className={iconClass} />}
                                          <span className="truncate">{item.label}</span>
                                      </button>
                                  )}
                              </React.Fragment>
                          );
                      })}
                  </div>

                  {metaText && (
                      <div
                          title={metaTitle || metaText}
                          className="mt-1.5 pt-1.5 px-3 pb-1 border-t border-slate-200/80 dark:border-white/10 text-[10px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5 whitespace-nowrap"
                      >
                          <Clock className="w-3 h-3 text-cyan-500 dark:text-cyan-400 shrink-0" />
                          <span className="truncate">{metaText}</span>
                      </div>
                  )}
              </div>,
              document.body
          )
        : null;

    return (
        <div className="inline-flex justify-end">
            <button
                ref={buttonRef}
                type="button"
                aria-haspopup="menu"
                aria-expanded={open}
                aria-label={buttonTitle}
                title={metaTitle ? `${buttonTitle} — ${metaTitle}` : buttonTitle}
                onClick={(e) => {
                    e.stopPropagation();
                    setOpen((prev) => !prev);
                }}
                className={`inline-flex items-center justify-center w-9 h-9 rounded-xl border transition-all cursor-pointer shrink-0 ${
                    open
                        ? 'bg-[#005792] text-white border-[#005792] shadow-md shadow-[#005792]/30'
                        : 'bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/15 text-slate-600 dark:text-slate-300 hover:text-[#005792] dark:hover:text-cyan-300 border-slate-200/80 dark:border-white/10'
                }`}
            >
                <Settings className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-90' : ''}`} />
            </button>
            {menuNode}
        </div>
    );
}
