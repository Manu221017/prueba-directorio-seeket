'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { DirectorioPortfolioProject } from '@/lib/types';

interface ServiceCardPortfolioSliderProps {
  projects: DirectorioPortfolioProject[];
  /** Vista compacta para la ficha 9:16 del directorio (menos altura). */
  compact?: boolean;
}

function hasPortfolioCover(url: string | null | undefined): url is string {
  return typeof url === 'string' && url.trim().length > 0;
}

export default function ServiceCardPortfolioSlider({ projects, compact = false }: ServiceCardPortfolioSliderProps) {
  const [current, setCurrent] = useState(0);

  if (projects.length === 0) return null;

  const hasSingle = projects.length === 1;
  const proj = projects[current];
  const showCover = hasPortfolioCover(proj.cover_url);

  const prev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrent(i => (i > 0 ? i - 1 : projects.length - 1));
  };

  const next = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrent(i => (i < projects.length - 1 ? i + 1 : 0));
  };

  return (
    <div role="region" aria-label="Portafolio" className="w-full">
      <div className="relative overflow-hidden rounded-lg border border-white/10 bg-white/5">
        <div className={`relative w-full ${compact ? 'aspect-[2/1]' : 'aspect-[5/3]'}`}>
          {showCover ? (
            <img
              src={proj.cover_url}
              alt={proj.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div
              className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-white/[0.07] to-white/[0.02] px-3"
              aria-hidden
            >
              <FileText className={`text-white/35 ${compact ? 'h-6 w-6' : 'h-8 w-8'}`} />
            </div>
          )}
          {!hasSingle && (
            <>
              <button
                onClick={prev}
                aria-label="Proyecto anterior"
                className="absolute left-1.5 top-1/2 -translate-y-1/2 flex items-center justify-center w-7 h-7 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 text-white hover:bg-black/70 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={next}
                aria-label="Proyecto siguiente"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center justify-center w-7 h-7 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 text-white hover:bg-black/70 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
        <p className={`truncate font-medium text-white/85 ${compact ? 'px-2 py-1 text-[10px]' : 'px-2.5 py-2 text-xs'}`}>
          {proj.title}
        </p>
      </div>
      {!hasSingle && (
        <div className="flex justify-center gap-1 mt-1.5">
          {projects.map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all duration-200 ${
                i === current ? 'w-3 h-1.5 bg-seeket-orange' : 'w-1.5 h-1.5 bg-white/30'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
