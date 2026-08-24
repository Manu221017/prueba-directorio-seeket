'use client';

import { DollarSign, Globe, MapPin } from 'lucide-react';
import GlassCard from './GlassCard';
import ServiceCardPortfolioSlider from './ServiceCardPortfolioSlider';
import { PublicServiceEntry } from '@/lib/types';
import { getCountryNameByCode } from '@/lib/constants/countries-latam';
import { formatAgencyNichosLine } from '@/lib/format-agency-nichos';
import {
  ProfileProgressionSquare,
  ServiceProgressionSquare,
} from '@/components/progression/ProgressionSquareBadge';

interface PublicServiceCardProps {
  service: PublicServiceEntry;
  onOpen?: () => void;
  onOpenProfile?: () => void;
}

function formatLanguages(languages: PublicServiceEntry['languages']): string {
  return languages
    .filter((l) => l.idioma?.trim())
    .map((l) => {
      const name = l.idioma.trim();
      const level = l.nivel?.trim();
      return level ? `${name} - ${level}` : name;
    })
    .join(' · ');
}

export default function PublicServiceCard({ service, onOpen, onOpenProfile }: PublicServiceCardProps) {
  const countryName = service.country ? getCountryNameByCode(service.country) : null;
  const profession = service.profession?.trim() || null;
  const roleLine = service.is_agency
    ? formatAgencyNichosLine(service.agency_nichos)
    : profession;
  const languagesLabel = formatLanguages(service.languages);

  const precioFormatted =
    service.precio_inicial_num != null
      ? new Intl.NumberFormat('es-MX').format(service.precio_inicial_num) + ' USD'
      : null;

  const visibleTags = service.search_tags.slice(0, 4);
  const extraTags = service.search_tags.length - visibleTags.length;

  const visibleMarkets = service.service_markets.slice(0, 4);
  const extraMarkets = service.service_markets.length - visibleMarkets.length;

  const hasMacroCategory = Boolean(service.macro_category_name);
  const hasTags = visibleTags.length > 0;
  const hasMarkets = visibleMarkets.length > 0;

  return (
    <div className="flex h-auto w-full min-h-0 flex-col gap-2 md:h-full">
      <button
        type="button"
        onClick={() => onOpenProfile?.()}
        disabled={!onOpenProfile}
        className="w-full shrink-0 rounded-lg text-left transition-opacity hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-seeket-orange/45 disabled:cursor-default disabled:opacity-100"
      >
        <GlassCard variant="strong" className="w-full border border-white/[0.14] p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-[10px] font-semibold uppercase text-seeket-orange">Proveedor</p>
            {service.is_agency && (
              <span className="shrink-0 rounded-lg border border-seeket-orange/25 bg-seeket-orange/[0.12] px-2 py-0.5 text-[10px] font-medium text-seeket-orange">
                Agencia
              </span>
            )}
          </div>
          <p className="line-clamp-2 min-w-0 text-xl font-black leading-[1.02] text-white">
            {service.display_name ?? 'Proveedor'}
            <ProfileProgressionSquare tierLevel={service.tier_level} />
          </p>
          {roleLine && (
            <p className="mt-1.5 line-clamp-2 text-xs leading-snug text-white/[0.62]">{roleLine}</p>
          )}
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1.5 text-[11px] leading-snug text-white/[0.55]">
            {countryName && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-seeket-orange/90" />
                {countryName}
              </span>
            )}
            {languagesLabel && (
              <span className="inline-flex min-w-0 items-start gap-1.5">
                <Globe className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white/40" />
                <span className="line-clamp-1">{languagesLabel}</span>
              </span>
            )}
          </div>
        </GlassCard>
      </button>

      <div
        className={`flex min-h-[24rem] flex-1 flex-col md:min-h-0 ${onOpen ? 'cursor-pointer' : 'cursor-default'}`}
        onClick={onOpen}
        role={onOpen ? 'button' : undefined}
        tabIndex={onOpen ? 0 : undefined}
        onKeyDown={
          onOpen
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onOpen();
                }
              }
            : undefined
        }
      >
        <GlassCard
          variant="strong"
          className="custom-scrollbar flex h-full min-h-0 w-full flex-col gap-3 overflow-y-auto border border-white/[0.14] p-3"
        >
          <div className="shrink-0">
            <div className="mb-2 flex items-start justify-between gap-3">
              <p className="text-[10px] font-semibold uppercase text-seeket-orange">Servicio</p>
              {precioFormatted && (
                <div className="shrink-0 rounded-lg border border-white/[0.12] bg-black/[0.32] px-2 py-1">
                  <p className="text-[8px] font-semibold uppercase text-white/40">
                    Desde
                  </p>
                  <div className="mt-0.5 flex items-center gap-1">
                    <DollarSign className="h-3.5 w-3.5 shrink-0 text-seeket-orange" />
                    <span className="whitespace-nowrap text-sm font-black leading-none text-white">
                      {precioFormatted}
                    </span>
                  </div>
                </div>
              )}
            </div>
            <h2 className="line-clamp-4 text-2xl font-black leading-[1.03] text-white">
              {service.service_title}
              <ServiceProgressionSquare activeLevel={service.active_service_level} />
            </h2>
          </div>

          {hasMacroCategory && (
            <div className="shrink-0">
              <p className="mb-1 text-[10px] font-semibold uppercase text-white/40">
                Especialidad principal
              </p>
              <span className="inline-block max-w-full truncate rounded-lg border border-seeket-orange/25 bg-seeket-orange/[0.12] px-2 py-1 text-[11px] text-seeket-orange">
                {service.macro_category_name}
              </span>
            </div>
          )}

          {service.portfolio_projects.length > 0 && (
            <div className="shrink-0">
              <p className="mb-1 text-[10px] font-semibold uppercase text-white/40">
                Portafolio
              </p>
              <div onClick={(e) => e.stopPropagation()}>
                <ServiceCardPortfolioSlider projects={service.portfolio_projects} compact />
              </div>
            </div>
          )}

          {(hasTags || hasMarkets) && (
            <div className="grid shrink-0 gap-3 sm:grid-cols-2 md:grid-cols-1 xl:grid-cols-2">
              {hasTags && (
                <div className="min-w-0">
                  <p className="mb-1 text-[10px] font-semibold uppercase text-white/40">
                    Enfoque
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {visibleTags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-lg border border-white/[0.14] bg-white/[0.06] px-2 py-1 text-[10px] text-white/[0.72]"
                      >
                        {tag}
                      </span>
                    ))}
                    {extraTags > 0 && (
                      <span className="rounded-lg border border-white/[0.14] bg-white/[0.06] px-2 py-1 text-[10px] text-white/50">
                        +{extraTags} mas
                      </span>
                    )}
                  </div>
                </div>
              )}

              {hasMarkets && (
                <div className="min-w-0">
                  <p className="mb-1 text-[10px] font-semibold uppercase text-white/40">
                    Mercados
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {visibleMarkets.map((market) => (
                      <span
                        key={market}
                        className="rounded-lg border border-seeket-orange/20 bg-seeket-orange/[0.08] px-2 py-1 text-[10px] text-seeket-orange/85"
                      >
                        {market}
                      </span>
                    ))}
                    {extraMarkets > 0 && (
                      <span className="rounded-lg border border-seeket-orange/20 bg-seeket-orange/[0.08] px-2 py-1 text-[10px] text-seeket-orange/55">
                        +{extraMarkets} mas
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
