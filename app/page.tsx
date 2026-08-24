'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import AnimatedBubbles from '@/components/AnimatedBubbles';
import FiltersPanel from '@/components/FiltersPanel';
import {
  DEFAULT_DIRECTORIO_FILTERS,
  type DirectorioFilters,
} from '@/lib/directorio-filters';
import VideoFeed from '@/components/VideoFeed';
import { PERFILES_MOCK } from '@/data/perfiles';
import type { PublicServiceEntry } from '@/lib/types';
import { Search, SlidersHorizontal, Sparkles, X } from 'lucide-react';

type Filters = DirectorioFilters;

const MOCK_LOAD_DELAY_MS = 500;

function applyClientSideFilters(services: PublicServiceEntry[], filters: Filters): PublicServiceEntry[] {
  let filtered = services;

  if (filters.countryCodes.length > 0) {
    filtered = filtered.filter(
      (s) => s.country != null && filters.countryCodes.includes(s.country),
    );
  }

  if (filters.profileTier.length > 0) {
    filtered = filtered.filter((s) => filters.profileTier.includes(s.tier_level));
  }

  if (filters.serviceLevel.length > 0) {
    filtered = filtered.filter((s) => filters.serviceLevel.includes(s.active_service_level));
  }

  if (filters.talentType && filters.talentType !== 'both') {
    filtered = filtered.filter((s) =>
      filters.talentType === 'agency' ? s.is_agency : !s.is_agency,
    );
  }

  if (filters.category.length > 0) {
    filtered = filtered.filter((s) =>
      s.macro_category_name ? filters.category.includes(s.macro_category_name) : false,
    );
  }

  if (filters.microCategory.length > 0) {
    filtered = filtered.filter(
      (s) => s.micro_category_name != null && filters.microCategory.includes(s.micro_category_name),
    );
  }

  if (filters.languages.length > 0) {
    filtered = filtered.filter((s) =>
      s.languages.some((l) =>
        filters.languages.some(
          (sel) => l.idioma?.trim().toLowerCase() === sel.trim().toLowerCase(),
        ),
      ),
    );
  }

  if (filters.budgetType) {
    filtered = filtered.filter((s) => {
      if (s.precio_inicial_num == null) return false;
      return (
        s.precio_inicial_num >= filters.budgetRange[0] &&
        s.precio_inicial_num <= filters.budgetRange[1]
      );
    });
  }

  return filtered;
}

function DirectorioLoading() {
  return (
    <div className="flex h-[calc(100svh-3.5rem)] min-h-0 items-center justify-center">
      <div className="text-center">
        <Sparkles className="mx-auto mb-4 h-12 w-12 animate-pulse text-seeket-orange" />
        <p className="text-white/70">Cargando directorio...</p>
      </div>
    </div>
  );
}

export default function DirectorioPage() {
  const [services, setServices] = useState<PublicServiceEntry[]>([]);
  const [filteredServices, setFilteredServices] = useState<PublicServiceEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Filters>({ ...DEFAULT_DIRECTORIO_FILTERS });
  const [loading, setLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setServices(PERFILES_MOCK);
      setFilteredServices(PERFILES_MOCK);
      setLoading(false);
    }, MOCK_LOAD_DELAY_MS);
    return () => clearTimeout(t);
  }, []);

  const applyFilters = useCallback(() => {
    const qLower = searchQuery.trim().toLowerCase();
    let filtered = [...services];
    if (qLower) {
      filtered = filtered.filter(s =>
        (s.display_name ?? '').toLowerCase().includes(qLower) ||
        s.service_title.toLowerCase().includes(qLower)
      );
    }
    filtered = applyClientSideFilters(filtered, filters);
    setFilteredServices(filtered);
  }, [services, searchQuery, filters]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  useEffect(() => {
    if (!mobileFiltersOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileFiltersOpen]);

  const resultsKey = useMemo(
    () => `${searchQuery.trim()}::${JSON.stringify(filters)}`,
    [searchQuery, filters],
  );

  const handleViewStrategy = useCallback((_service: PublicServiceEntry) => {}, []);
  const handleViewProfile = useCallback((_profileId: string) => {}, []);

  if (loading) {
    return <DirectorioLoading />;
  }

  return (
    <div className="relative h-[calc(100svh-3.5rem)] min-h-0 overflow-hidden">
      <AnimatedBubbles />
      <main className="relative z-10 flex h-full min-h-0 flex-col gap-3 px-3 pb-3 pt-3 sm:px-4 sm:pb-4 lg:flex-row lg:gap-4 lg:px-5">
        <section className="shrink-0 rounded-lg border border-white/[0.12] bg-black/[0.38] p-2.5 shadow-2xl shadow-black/25 backdrop-blur-xl lg:hidden">
          <div className="mb-2 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="brand-display text-2xl leading-none text-white">Directorio</p>
              <p className="mt-0.5 text-xs text-white/[0.55]">
                {filteredServices.length} de {services.length} perfiles
              </p>
            </div>
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(true)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-seeket-orange/35 bg-seeket-orange/[0.12] text-seeket-orange transition-colors hover:bg-seeket-orange/[0.18] focus:outline-none focus-visible:ring-2 focus-visible:ring-seeket-orange/45"
              aria-label="Abrir filtros"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </button>
          </div>
          <label className="sr-only" htmlFor="mobile-search">Buscar por nombre o servicio</label>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/[0.45]" />
            <input
              id="mobile-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Busca nombre, servicio o especialidad"
              className="w-full rounded-lg border border-white/[0.12] bg-white/[0.07] py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-white/35 transition-all focus:border-seeket-orange/45 focus:outline-none focus:ring-2 focus:ring-seeket-orange/25"
            />
          </div>
        </section>

        <aside className="hidden min-h-0 lg:flex lg:w-[17rem] lg:shrink-0 lg:flex-col lg:gap-3 xl:w-[18rem]">
          <div className="flex shrink-0 flex-col rounded-lg border border-white/[0.12] bg-black/[0.36] p-3 shadow-2xl shadow-black/20 backdrop-blur-xl">
            <p className="brand-display text-3xl leading-none text-white">Directorio</p>
            <p className="mt-1 text-xs leading-snug text-white/[0.55]">
              Proveedores listos para crecer con marcas que buscan criterio, ejecucion y resultados.
            </p>
            <div className="my-3 h-px bg-gradient-to-r from-seeket-red-vibrant/[0.55] via-seeket-orange/35 to-transparent" />
            <label className="mb-1.5 block text-xs font-semibold text-white/75">Buscar por nombre</label>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/[0.45]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Busca por nombre o servicio..."
                className="w-full rounded-lg border border-white/[0.15] bg-white/[0.08] py-2 pl-9 pr-3 text-xs text-white placeholder:text-white/35 transition-all focus:border-seeket-orange/45 focus:outline-none focus:ring-2 focus:ring-seeket-orange/25"
              />
            </div>
            <p className="mt-2 text-[11px] text-white/[0.45]">
              {filteredServices.length} resultados visibles
            </p>
          </div>
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg shadow-lg shadow-black/25">
            <FiltersPanel filters={filters} onFiltersChange={setFilters} />
          </div>
        </aside>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-white/10 bg-black/[0.24] shadow-2xl shadow-black/30 backdrop-blur-[2px]">
          {filteredServices.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <div className="max-w-xs text-center">
                <p className="brand-display text-3xl leading-none text-white">Sin match</p>
                <p className="mt-2 text-sm text-white/[0.55]">Prueba ajustar la busqueda o limpiar algun filtro.</p>
              </div>
            </div>
          ) : (
            <VideoFeed
              services={filteredServices}
              onViewStrategy={handleViewStrategy}
              onViewProfile={handleViewProfile}
              resultsKey={resultsKey}
            />
          )}
        </div>
      </main>

      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-[120] lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/[0.68] backdrop-blur-sm"
            aria-label="Cerrar filtros"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="absolute inset-x-2 bottom-2 flex max-h-[82svh] min-h-0 flex-col overflow-hidden rounded-lg border border-white/[0.14] bg-[#080706]/[0.96] shadow-2xl shadow-black/70">
            <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-3 py-3">
              <div>
                <p className="brand-display text-2xl leading-none text-white">Afinar busqueda</p>
                <p className="mt-0.5 text-xs text-white/50">Filtros y presupuesto.</p>
              </div>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.12] bg-white/[0.06] text-white/80 transition-colors hover:bg-white/[0.1] focus:outline-none focus-visible:ring-2 focus-visible:ring-seeket-orange/45"
                aria-label="Cerrar filtros"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-hidden">
              <FiltersPanel filters={filters} onFiltersChange={setFilters} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
