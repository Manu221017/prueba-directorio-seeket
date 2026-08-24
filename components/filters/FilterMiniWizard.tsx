'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';

interface FilterMiniWizardProps {
  label: string;
  summary: string;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  children: ReactNode;
}

const PANEL_WIDTH_PX = 280;
const PANEL_MAX_HEIGHT_PX = 360;
const VIEWPORT_PAD = 12;
/** Estimación inicial antes de medir el DOM (header + lista corta). */
const PANEL_HEIGHT_ESTIMATE = 300;

function computePanelPosition(
  anchor: HTMLElement,
  panelHeight: number,
): { top: number; left: number } {
  const rect = anchor.getBoundingClientRect();
  const gap = 8;
  const vh = window.innerHeight;
  const vw = window.innerWidth;
  const maxVisibleHeight = Math.min(PANEL_MAX_HEIGHT_PX, vh - VIEWPORT_PAD * 2);
  const height = Math.min(panelHeight, maxVisibleHeight);

  let left = rect.right + gap;
  if (left + PANEL_WIDTH_PX > vw - VIEWPORT_PAD) {
    left = Math.max(VIEWPORT_PAD, rect.left);
  }

  // Alinear borde superior con el botón; si el marco no cabe, subirlo completo.
  let top = rect.top;
  if (top + height > vh - VIEWPORT_PAD) {
    top = vh - VIEWPORT_PAD - height;
  }
  if (top < VIEWPORT_PAD) {
    top = VIEWPORT_PAD;
  }

  return { top, left };
}

/** Fila compacta del panel + mini wizard en portal (marco siempre dentro del viewport). */
export default function FilterMiniWizard({
  label,
  summary,
  open,
  onToggle,
  onClose,
  children,
}: FilterMiniWizardProps) {
  const anchorRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [panelPos, setPanelPos] = useState<{ top: number; left: number } | null>(null);

  const syncPosition = useCallback(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;
    const measured = panelRef.current?.offsetHeight;
    const height = measured && measured > 0 ? measured : PANEL_HEIGHT_ESTIMATE;
    setPanelPos(computePanelPosition(anchor, height));
  }, []);

  useLayoutEffect(() => {
    if (!open) {
      setPanelPos(null);
      return;
    }
    syncPosition();
    const raf = requestAnimationFrame(() => syncPosition());
    return () => cancelAnimationFrame(raf);
  }, [open, syncPosition, children]);

  useEffect(() => {
    if (!open) return;
    window.addEventListener('resize', syncPosition);
    window.addEventListener('scroll', syncPosition, true);
    return () => {
      window.removeEventListener('resize', syncPosition);
      window.removeEventListener('scroll', syncPosition, true);
    };
  }, [open, syncPosition]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (anchorRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      onClose();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  const panel =
    open && typeof document !== 'undefined'
      ? createPortal(
          <div
            ref={panelRef}
            role="dialog"
            aria-label={label}
            style={{
              position: 'fixed',
              top: panelPos?.top ?? 0,
              left: panelPos?.left ?? 0,
              width: PANEL_WIDTH_PX,
              maxHeight: `min(${PANEL_MAX_HEIGHT_PX}px, calc(100vh - ${VIEWPORT_PAD * 2}px))`,
              zIndex: 9999,
              visibility: panelPos ? 'visible' : 'hidden',
            }}
            className="flex flex-col overflow-hidden rounded-lg border border-white/[0.14] bg-[#080706]/[0.98] shadow-2xl shadow-black/60 backdrop-blur-xl"
          >
            {children}
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        ref={anchorRef}
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className={`flex w-full items-center gap-2 rounded-lg border px-2.5 py-2 text-left transition-colors ${
          open
            ? 'border-seeket-orange/35 bg-seeket-orange/[0.1]'
            : 'border-white/[0.1] bg-white/[0.04] hover:border-white/20 hover:bg-white/[0.07]'
        }`}
      >
        <span className="min-w-0 flex-1">
          <span className="block text-[10px] font-semibold uppercase text-white/[0.55]">
            {label}
          </span>
          <span className="mt-0.5 block truncate text-[11px] font-medium text-white/[0.88]">
            {summary}
          </span>
        </span>
        <ChevronDown
          className={`h-3.5 w-3.5 shrink-0 text-white/[0.45] transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>
      {panel}
    </>
  );
}
