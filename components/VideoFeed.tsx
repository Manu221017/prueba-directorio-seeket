'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PublicServiceCard from './PublicServiceCard';
import { PublicServiceEntry } from '@/lib/types';
import { ChevronDown, ChevronUp, Play, Volume2, VolumeX } from 'lucide-react';

interface VideoFeedProps {
  services: PublicServiceEntry[];
  onViewStrategy: (service: PublicServiceEntry) => void;
  onViewProfile?: (profileId: string) => void;
  suppressBackgroundPlayback?: boolean;
  resultsKey?: string;
}

const SCROLL_DEBOUNCE_MS = 320;

function shouldUseGesturePaging() {
  return typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches;
}

export default function VideoFeed({
  services,
  onViewStrategy,
  onViewProfile,
  suppressBackgroundPlayback = false,
  resultsKey,
}: VideoFeedProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [videoMuted, setVideoMuted] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const bgVideoRef = useRef<HTMLVideoElement>(null);
  const mutedSnapshotRef = useRef(true);
  const indexRef = useRef(0);
  const lastScrollTimeRef = useRef(0);

  indexRef.current = currentIndex;

  useEffect(() => {
    setCurrentIndex(0);
    indexRef.current = 0;
  }, [resultsKey]);

  const currentService = services[currentIndex];

  useEffect(() => {
    const v = bgVideoRef.current;
    if (!v) return;
    if (suppressBackgroundPlayback) {
      mutedSnapshotRef.current = videoMuted;
      void v.pause();
      v.muted = true;
      setVideoMuted(true);
    } else {
      setVideoMuted(mutedSnapshotRef.current);
      void v.play().catch(() => {
        /* ignore autoplay after closing detail overlays */
      });
    }
  }, [suppressBackgroundPlayback]);

  useEffect(() => {
    if (services.length > 0 && currentIndex >= services.length) {
      setCurrentIndex(Math.max(0, services.length - 1));
    }
  }, [services.length, currentIndex]);

  const goNext = useCallback(() => {
    if (indexRef.current < services.length - 1) {
      setDirection(1);
      setCurrentIndex(prev => prev + 1);
      lastScrollTimeRef.current = Date.now();
    }
  }, [services.length]);

  const goPrev = useCallback(() => {
    if (indexRef.current > 0) {
      setDirection(-1);
      setCurrentIndex(prev => prev - 1);
      lastScrollTimeRef.current = Date.now();
    }
  }, []);

  const handleViewStrategy = useCallback(() => {
    if (currentService) onViewStrategy(currentService);
  }, [currentService, onViewStrategy]);

  const handleViewProfile = useCallback(() => {
    if (currentService?.profile_id) onViewProfile?.(currentService.profile_id);
  }, [currentService, onViewProfile]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let startY = 0;
    let touchHandled = false;

    const handleWheel = (e: WheelEvent) => {
      if (!shouldUseGesturePaging()) return;
      e.preventDefault();
      const now = Date.now();
      if (now - lastScrollTimeRef.current < SCROLL_DEBOUNCE_MS) return;

      const i = indexRef.current;
      if (e.deltaY > 0 && i < services.length - 1) {
        goNext();
      } else if (e.deltaY < 0 && i > 0) {
        goPrev();
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (!shouldUseGesturePaging()) return;
      startY = e.touches[0].clientY;
      touchHandled = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!shouldUseGesturePaging() || touchHandled) return;
      e.preventDefault();

      const currentY = e.touches[0].clientY;
      const diff = startY - currentY;
      const i = indexRef.current;

      if (Math.abs(diff) > 50) {
        touchHandled = true;
        if (diff > 0 && i < services.length - 1) {
          goNext();
        } else if (diff < 0 && i > 0) {
          goPrev();
        }
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('touchstart', handleTouchStart);
    container.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
    };
  }, [services.length, goNext, goPrev]);

  if (!currentService) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-white/50">No hay proveedores que coincidan</p>
      </div>
    );
  }

  const slideVariants = {
    next: {
      initial: { opacity: 0, y: 80, scale: 0.98 },
      animate: { opacity: 1, y: 0, scale: 1 },
      exit: { opacity: 0, y: -80, scale: 0.98 },
    },
    prev: {
      initial: { opacity: 0, y: -80, scale: 0.98 },
      animate: { opacity: 1, y: 0, scale: 1 },
      exit: { opacity: 0, y: 80, scale: 0.98 },
    },
  };

  const v = direction === 1 ? slideVariants.next : slideVariants.prev;
  const spring = { type: 'spring' as const, stiffness: 400, damping: 32 };
  const progressLabel = `${currentIndex + 1}`.padStart(2, '0');
  const totalLabel = `${services.length}`.padStart(2, '0');

  return (
    <div ref={containerRef} className="relative h-full w-full overflow-hidden">
      <div className="pointer-events-none absolute left-3 top-3 z-20 flex items-center gap-2 rounded-lg border border-white/[0.12] bg-black/[0.36] px-2.5 py-1.5 backdrop-blur-xl sm:left-4 sm:top-4">
        <span className="text-xs font-semibold text-seeket-orange">{progressLabel}</span>
        <span className="h-3 w-px bg-white/[0.18]" aria-hidden />
        <span className="text-xs text-white/[0.55]">{totalLabel}</span>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={currentIndex}
          initial={v.initial}
          animate={v.animate}
          exit={v.exit}
          transition={spring}
          className="custom-scrollbar absolute inset-0 flex flex-col items-center gap-3 overflow-y-auto px-3 pb-16 pt-12 sm:px-5 md:flex-row md:items-center md:justify-center md:gap-4 md:overflow-hidden md:pb-14 md:pt-12 lg:px-6"
        >
          <div className="relative aspect-[4/5] w-full max-w-[16.5rem] shrink-0 overflow-hidden rounded-lg border border-white/[0.16] bg-black/50 shadow-[0_22px_70px_rgba(0,0,0,0.48)] sm:max-w-[18rem] md:h-full md:max-h-[38rem] md:w-auto md:max-w-none md:aspect-[9/16]">
            {currentService.video_portfolio ? (
              <>
                <video
                  ref={bgVideoRef}
                  src={currentService.video_portfolio}
                  className="h-full w-full object-cover"
                  autoPlay
                  loop
                  muted={videoMuted}
                  playsInline
                />
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setVideoMuted(m => !m); }}
                  aria-label={videoMuted ? 'Activar sonido' : 'Silenciar'}
                  className="absolute bottom-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-lg border border-white/20 bg-black/55 text-white backdrop-blur-sm transition-colors hover:bg-black/75"
                >
                  {videoMuted
                    ? <VolumeX className="h-4 w-4" />
                    : <Volume2 className="h-4 w-4" />
                  }
                </button>
              </>
            ) : (
              <div className="video-simulate relative flex h-full w-full items-center justify-center">
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.18)_0%,rgba(0,0,0,0.02)_38%,rgba(0,0,0,0.72)_100%)]" />
                <div className="relative z-10 flex h-full w-full flex-col justify-between p-4 sm:p-5">
                  <div>
                    <p className="text-xs font-semibold uppercase text-white/[0.58]">SEEKET / Perfil</p>
                    <div className="mt-2 h-px w-10 bg-seeket-orange/70" />
                  </div>
                  <div>
                    <p className="brand-display line-clamp-3 text-4xl leading-[0.92] text-white drop-shadow-lg sm:text-5xl">
                      {currentService.display_name ?? 'Proveedor'}
                    </p>
                    <p className="brand-serif mt-3 line-clamp-2 text-lg italic leading-tight text-seeket-orange drop-shadow">
                      {currentService.macro_category_name ?? 'Marketing digital'}
                    </p>
                  </div>
                  <div className="flex w-max max-w-full items-center gap-2 rounded-lg border border-white/[0.16] bg-black/[0.48] px-3 py-2 backdrop-blur-sm">
                    <Play className="h-4 w-4 fill-white text-white" />
                    <span className="truncate text-xs font-medium text-white/90">Video pendiente</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="w-full max-w-[29rem] shrink-0 md:h-full md:max-h-[38rem] md:w-auto md:max-w-none md:aspect-[9/16]">
            <PublicServiceCard
              service={currentService}
              onOpen={handleViewStrategy}
              onOpenProfile={handleViewProfile}
            />
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-x-0 bottom-0 z-20 flex items-center justify-center gap-3 border-t border-white/[0.08] bg-black/[0.34] px-3 py-2 backdrop-blur-xl">
        <button
          type="button"
          onClick={goPrev}
          disabled={currentIndex === 0}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.12] bg-white/[0.06] text-white transition-colors hover:bg-white/[0.12] disabled:cursor-not-allowed disabled:opacity-35"
          aria-label="Perfil anterior"
        >
          <ChevronUp className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-1.5" aria-label="Progreso del feed">
          {services.map((service, index) => (
            <span
              key={service.service_id}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'w-8 bg-gradient-to-r from-seeket-red-vibrant to-seeket-orange'
                  : 'w-1.5 bg-white/30'
              }`}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={goNext}
          disabled={currentIndex === services.length - 1}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.12] bg-white/[0.06] text-white transition-colors hover:bg-white/[0.12] disabled:cursor-not-allowed disabled:opacity-35"
          aria-label="Perfil siguiente"
        >
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
