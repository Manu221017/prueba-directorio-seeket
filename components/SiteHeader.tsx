'use client';

import { Briefcase, LayoutGrid, User } from 'lucide-react';
import SeeketLogo from '@/components/SeeketLogo';

/**
 * Mock estático del header real de SEEKET. Sin auth, sin datos: solo la fachada visual
 * que enmarca la pantalla del directorio para este reto.
 */
export default function SiteHeader() {
  return (
    <header
      className="sticky top-0 z-[100] w-full border-b border-white/10"
      style={{
        background: 'linear-gradient(90deg, rgba(5,5,5,0.92), rgba(18,7,6,0.86), rgba(56,16,8,0.72))',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      <div className="mx-auto flex h-14 max-w-[90rem] items-center justify-between px-3 sm:px-5 lg:px-7">
        <div className="flex min-w-0 items-center gap-3">
          <SeeketLogo size="sm" animated={false} className="text-[1.45rem]" />
          <span className="hidden h-5 w-px bg-white/[0.15] sm:block" aria-hidden />
          <span className="hidden text-xs font-semibold uppercase text-white/[0.55] sm:block">
            Directorio
          </span>
        </div>

        <nav className="flex items-center gap-1 sm:gap-2" aria-label="Principal">
          <span className="flex h-9 items-center gap-2 rounded-lg border border-seeket-red-vibrant/25 bg-seeket-red-vibrant/[0.12] px-3 text-sm font-semibold text-white sm:px-4">
            <LayoutGrid className="h-4 w-4" strokeWidth={1.5} />
            <span className="hidden sm:inline">Directorio</span>
          </span>

          <span className="hidden h-9 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-white/70 transition-colors hover:text-white md:flex sm:px-4">
            <Briefcase className="h-4 w-4 shrink-0" strokeWidth={1.5} />
            <span>Tus servicios</span>
          </span>

          <div className="relative ml-1 flex h-9 items-center gap-2 rounded-lg border border-white/[0.12] bg-black/30 px-2 text-sm font-medium text-white sm:ml-3 sm:px-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/[0.12]">
              <User className="h-3.5 w-3.5 text-white/80" strokeWidth={1.5} />
            </div>
            <span className="hidden sm:inline max-w-[120px] truncate">@candidato</span>
          </div>
        </nav>
      </div>
    </header>
  );
}
