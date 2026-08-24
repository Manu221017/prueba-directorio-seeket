'use client';

import { useCallback, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import FilterMiniWizard from '@/components/filters/FilterMiniWizard';
import DualRangeSlider from '@/components/filters/DualRangeSlider';
import { CATEGORY_LABEL_TO_SLUG, MACRO_CATEGORIES, MICRO_CATEGORIES } from '@/lib/categories';
import {
  type DirectorioFilters,
  PROFILE_TIER_OPTIONS,
  SERVICE_LEVEL_OPTIONS,
  TALENT_TYPE_OPTIONS,
  MACRO_CATEGORY_LABELS,
  FILTER_LANGUAGE_OPTIONS,
  REGION_GROUPS,
  getFilterCountryName,
  summarizeFilterSelection,
} from '@/lib/directorio-filters';

interface FiltersPanelProps {
  filters: DirectorioFilters;
  onFiltersChange: (filters: DirectorioFilters) => void;
}

type WizardId =
  | 'profileTier'
  | 'serviceLevel'
  | 'location'
  | 'languages'
  | 'category'
  | 'talentType'
  | null;

const checkboxClass =
  'mt-0.5 h-3.5 w-3.5 shrink-0 rounded border-white/[0.25] bg-white/[0.1] text-seeket-orange focus:ring-seeket-orange focus:ring-offset-0';

const wizardScroll =
  'custom-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-3 py-2';

function toggleInList<T>(list: T[], item: T, checked: boolean): T[] {
  if (checked) return list.includes(item) ? list : [...list, item];
  return list.filter((x) => x !== item);
}

export default function FiltersPanel({ filters, onFiltersChange }: FiltersPanelProps) {
  const [openWizard, setOpenWizard] = useState<WizardId>(null);
  const [locationSearch, setLocationSearch] = useState('');
  const [languageSearch, setLanguageSearch] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  const macros = MACRO_CATEGORIES;
  const micros = MICRO_CATEGORIES;

  const updateFilter = useCallback(
    <K extends keyof DirectorioFilters>(key: K, value: DirectorioFilters[K]) => {
      onFiltersChange({ ...filters, [key]: value });
    },
    [filters, onFiltersChange],
  );

  const toggleWizard = (id: WizardId) => {
    setOpenWizard((prev) => (prev === id ? null : id));
  };

  const closeWizard = useCallback(() => setOpenWizard(null), []);

  const macroLabelBySlug = useMemo(() => {
    const map = new Map<string, string>();
    for (const [label, slug] of Object.entries(CATEGORY_LABEL_TO_SLUG)) {
      map.set(slug, label);
    }
    for (const m of macros) {
      if (!map.has(m.slug)) map.set(m.slug, m.name);
    }
    return map;
  }, [macros]);

  const macroSlugByLabel = useMemo(
    () => new Map(Object.entries(CATEGORY_LABEL_TO_SLUG)),
    [],
  );

  const selectedMacroIds = useMemo(() => {
    const ids = new Set<string>();
    for (const label of filters.category) {
      const slug = macroSlugByLabel.get(label);
      if (!slug) continue;
      const macro = macros.find((m) => m.slug === slug);
      if (macro) ids.add(macro.id);
    }
    return ids;
  }, [filters.category, macroSlugByLabel, macros]);

  const visibleMicros = useMemo(() => {
    if (selectedMacroIds.size === 0) return [];
    const q = categorySearch.trim().toLowerCase();
    return micros.filter((m) => {
      if (!selectedMacroIds.has(m.macro_id)) return false;
      if (!q) return true;
      return m.name.toLowerCase().includes(q);
    });
  }, [micros, selectedMacroIds, categorySearch]);

  const filteredCountries = useMemo(() => {
    const q = locationSearch.trim().toLowerCase();
    return REGION_GROUPS.map((region) => ({
      ...region,
      countries: region.codes
        .map((code) => ({ code, name: getFilterCountryName(code) }))
        .filter((c) => !q || c.name.toLowerCase().includes(q) || region.label.toLowerCase().includes(q)),
    })).filter((r) => r.countries.length > 0);
  }, [locationSearch]);

  const filteredLanguages = useMemo(() => {
    const q = languageSearch.trim().toLowerCase();
    return FILTER_LANGUAGE_OPTIONS.filter((lang) => !q || lang.toLowerCase().includes(q));
  }, [languageSearch]);

  const profileSummary = summarizeFilterSelection(
    filters.profileTier.map((t) => PROFILE_TIER_OPTIONS.find((o) => o.id === t)?.label ?? t),
  );

  const serviceSummary = summarizeFilterSelection(
    filters.serviceLevel.map((l) => SERVICE_LEVEL_OPTIONS.find((o) => o.id === l)?.label ?? `Nivel ${l}`),
  );

  const locationSummary = summarizeFilterSelection(
    filters.countryCodes.map(getFilterCountryName),
  );

  const languageSummary = summarizeFilterSelection(filters.languages);

  const categorySummary = useMemo(() => {
    const parts: string[] = [];
    if (filters.category.length > 0) {
      parts.push(
        filters.category.length === 1 ? filters.category[0] : `${filters.category.length} macros`,
      );
    }
    if (filters.microCategory.length > 0) {
      parts.push(
        filters.microCategory.length === 1
          ? filters.microCategory[0]
          : `${filters.microCategory.length} micros`,
      );
    }
    return parts.length > 0 ? parts.join(' · ') : 'Cualquiera';
  }, [filters.category, filters.microCategory]);

  const talentSummary =
    TALENT_TYPE_OPTIONS.find((t) => t.id === filters.talentType)?.label ?? 'Cualquiera';

  const budgetSummary = !filters.budgetType
    ? 'Sin filtro'
    : filters.budgetType === 'hourly'
      ? `$${filters.budgetRange[0]} – $${filters.budgetRange[1]} / hr`
      : `$${filters.budgetRange[0]} – $${filters.budgetRange[1]}`;

  const macroOptions = macros.length > 0
    ? macros.map((m) => macroLabelBySlug.get(m.slug) ?? m.name)
    : MACRO_CATEGORY_LABELS;

  const filteredMacroOptions = useMemo(() => {
    const q = categorySearch.trim().toLowerCase();
    return macroOptions.filter((label) => !q || label.toLowerCase().includes(q));
  }, [macroOptions, categorySearch]);

  const wizardPanelHeader = (title: string) => (
    <div className="shrink-0 border-b border-white/[0.1] px-3 py-2.5">
      <p className="text-xs font-semibold text-white/90">{title}</p>
    </div>
  );

  const searchField = (value: string, onChange: (v: string) => void, placeholder: string) => (
    <div className="relative shrink-0 border-b border-white/[0.1] px-3 py-2">
      <Search className="pointer-events-none absolute left-5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/40" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-white/[0.12] bg-white/[0.06] py-1.5 pl-8 pr-2 text-[11px] text-white placeholder:text-white/35 focus:border-seeket-orange/35 focus:outline-none"
      />
    </div>
  );

  return (
    <GlassCard className="flex h-full min-h-0 w-full flex-col overflow-hidden rounded-lg p-0">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-3 py-3 sm:px-3.5 sm:py-3.5">
        <h2 className="brand-display mb-3 shrink-0 text-2xl leading-none text-white">Filtros</h2>

        <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden">
          {/* Presupuesto — compacto inline (sin wizard) */}
          <div className="shrink-0 rounded-lg border border-white/[0.1] bg-black/[0.22] px-2.5 py-2">
            <p className="text-[10px] font-semibold uppercase text-white/[0.55]">Presupuesto</p>
            <p className="mt-0.5 truncate text-[11px] font-medium text-white/[0.88]">{budgetSummary}</p>
            <div className="mt-2 flex gap-1.5">
              <button
                type="button"
                onClick={() =>
                  updateFilter('budgetType', filters.budgetType === 'hourly' ? null : 'hourly')
                }
                className={`flex-1 rounded-lg px-2 py-1.5 text-[10px] font-semibold transition-all sm:text-[11px] ${
                  filters.budgetType === 'hourly'
                    ? 'bg-seeket-orange text-black'
                    : 'bg-white/[0.08] hover:bg-white/[0.14]'
                }`}
              >
                Por hora
              </button>
              <button
                type="button"
                onClick={() =>
                  updateFilter('budgetType', filters.budgetType === 'project' ? null : 'project')
                }
                className={`flex-1 rounded-lg px-2 py-1.5 text-[10px] font-semibold transition-all sm:text-[11px] ${
                  filters.budgetType === 'project'
                    ? 'bg-seeket-orange text-black'
                    : 'bg-white/[0.08] hover:bg-white/[0.14]'
                }`}
              >
                Por proyecto
              </button>
            </div>
            {filters.budgetType && (
              <div className="mt-2 border-t border-white/8 pt-2">
                <DualRangeSlider
                  min={0}
                  max={5000}
                  step={50}
                  value={filters.budgetRange}
                  onChange={(range) => updateFilter('budgetRange', range)}
                />
              </div>
            )}
          </div>

          <FilterMiniWizard
            label="Etiqueta de perfil"
            summary={profileSummary}
            open={openWizard === 'profileTier'}
            onToggle={() => toggleWizard('profileTier')}
            onClose={closeWizard}
          >
            {wizardPanelHeader('Etiqueta de perfil')}
            <div className={wizardScroll}>
              {PROFILE_TIER_OPTIONS.map((opt) => (
                <label
                  key={opt.id}
                  className="flex cursor-pointer items-start gap-2 py-1.5 text-xs text-white/80 hover:text-seeket-orange"
                >
                  <input
                    type="checkbox"
                    checked={filters.profileTier.includes(opt.id)}
                    onChange={(e) =>
                      updateFilter(
                        'profileTier',
                        toggleInList(filters.profileTier, opt.id, e.target.checked),
                      )
                    }
                    className={checkboxClass}
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </FilterMiniWizard>

          <FilterMiniWizard
            label="Nivel del servicio"
            summary={serviceSummary}
            open={openWizard === 'serviceLevel'}
            onToggle={() => toggleWizard('serviceLevel')}
            onClose={closeWizard}
          >
            {wizardPanelHeader('Nivel del servicio')}
            <div className={wizardScroll}>
              {SERVICE_LEVEL_OPTIONS.map((opt) => (
                <label
                  key={opt.id}
                  className="flex cursor-pointer items-start gap-2 py-1.5 text-xs text-white/80 hover:text-seeket-orange"
                >
                  <input
                    type="checkbox"
                    checked={filters.serviceLevel.includes(opt.id)}
                    onChange={(e) =>
                      updateFilter(
                        'serviceLevel',
                        toggleInList(filters.serviceLevel, opt.id, e.target.checked),
                      )
                    }
                    className={checkboxClass}
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </FilterMiniWizard>

          <FilterMiniWizard
            label="Ubicación"
            summary={locationSummary}
            open={openWizard === 'location'}
            onToggle={() => toggleWizard('location')}
            onClose={closeWizard}
          >
            {wizardPanelHeader('País del proveedor')}
            {searchField(locationSearch, setLocationSearch, 'Buscar país o región…')}
            <div className={wizardScroll}>
              {filteredCountries.map((region) => (
                <div key={region.id} className="mb-3 last:mb-0">
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-white/45">
                    {region.label}
                  </p>
                  <div className="space-y-0.5">
                    {region.countries.map(({ code, name }) => (
                      <label
                        key={code}
                        className="flex cursor-pointer items-start gap-2 py-1 text-[11px] text-white/78 hover:text-seeket-orange"
                      >
                        <input
                          type="checkbox"
                          checked={filters.countryCodes.includes(code)}
                          onChange={(e) =>
                            updateFilter(
                              'countryCodes',
                              toggleInList(filters.countryCodes, code, e.target.checked),
                            )
                          }
                          className={checkboxClass}
                        />
                        <span>{name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </FilterMiniWizard>

          <FilterMiniWizard
            label="Tipo de talento"
            summary={talentSummary}
            open={openWizard === 'talentType'}
            onToggle={() => toggleWizard('talentType')}
            onClose={closeWizard}
          >
            {wizardPanelHeader('Tipo de talento')}
            <div className="px-3 py-2">
              {TALENT_TYPE_OPTIONS.map((type) => (
                <label
                  key={type.id}
                  className="flex cursor-pointer items-start gap-2 py-1.5 text-xs text-white/80 hover:text-seeket-orange"
                >
                  <input
                    type="radio"
                    name="talentType"
                    checked={filters.talentType === type.id}
                    onChange={() => updateFilter('talentType', type.id)}
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 border-white/[0.25] bg-white/[0.1] text-seeket-orange focus:ring-seeket-orange focus:ring-offset-0"
                  />
                  <span>{type.label}</span>
                </label>
              ))}
              <button
                type="button"
                onClick={() => updateFilter('talentType', null)}
                className="mt-2 text-[10px] font-medium text-white/45 underline-offset-2 hover:text-white/70 hover:underline"
              >
                Limpiar
              </button>
            </div>
          </FilterMiniWizard>

          <FilterMiniWizard
            label="Idiomas"
            summary={languageSummary}
            open={openWizard === 'languages'}
            onToggle={() => toggleWizard('languages')}
            onClose={closeWizard}
          >
            {wizardPanelHeader('Otros idiomas')}
            {searchField(languageSearch, setLanguageSearch, 'Buscar idioma…')}
            <div className={wizardScroll}>
              {filteredLanguages.map((lang) => (
                <label
                  key={lang}
                  className="flex cursor-pointer items-start gap-2 py-1.5 text-xs text-white/80 hover:text-seeket-orange"
                >
                  <input
                    type="checkbox"
                    checked={filters.languages.includes(lang)}
                    onChange={(e) =>
                      updateFilter(
                        'languages',
                        toggleInList(filters.languages, lang, e.target.checked),
                      )
                    }
                    className={checkboxClass}
                  />
                  <span>{lang}</span>
                </label>
              ))}
            </div>
          </FilterMiniWizard>

          <FilterMiniWizard
            label="Categoría"
            summary={categorySummary}
            open={openWizard === 'category'}
            onToggle={() => toggleWizard('category')}
            onClose={closeWizard}
          >
            {wizardPanelHeader('Macro y micro categoría')}
            {searchField(categorySearch, setCategorySearch, 'Buscar categoría…')}
            <div className={wizardScroll}>
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-white/45">
                Macro categorías
              </p>
              {filteredMacroOptions.map((label) => (
                <label
                  key={label}
                  className="flex cursor-pointer items-start gap-2 py-1.5 text-[11px] leading-snug text-white/78 hover:text-seeket-orange"
                >
                  <input
                    type="checkbox"
                    checked={filters.category.includes(label)}
                    onChange={(e) => {
                      const nextCategory = toggleInList(filters.category, label, e.target.checked);
                      const stillValidMicros = filters.microCategory.filter((microName) => {
                        const micro = micros.find((m) => m.name === microName);
                        if (!micro) return false;
                        const macro = macros.find((m) => m.id === micro.macro_id);
                        if (!macro) return false;
                        const macroLabel = macroLabelBySlug.get(macro.slug) ?? macro.name;
                        return nextCategory.includes(macroLabel);
                      });
                      onFiltersChange({
                        ...filters,
                        category: nextCategory,
                        microCategory: stillValidMicros,
                      });
                    }}
                    className={checkboxClass}
                  />
                  <span>{label}</span>
                </label>
              ))}

              {selectedMacroIds.size > 0 && (
                <>
                  <div className="my-2 border-t border-white/10" />
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-white/45">
                    Micro categorías
                  </p>
                  {visibleMicros.length === 0 ? (
                    <p className="py-2 text-[10px] text-white/40">Sin coincidencias.</p>
                  ) : (
                    visibleMicros.map((micro) => (
                      <label
                        key={micro.id}
                        className="flex cursor-pointer items-start gap-2 py-1.5 text-[11px] leading-snug text-white/72 hover:text-seeket-orange"
                      >
                        <input
                          type="checkbox"
                          checked={filters.microCategory.includes(micro.name)}
                          onChange={(e) =>
                            updateFilter(
                              'microCategory',
                              toggleInList(filters.microCategory, micro.name, e.target.checked),
                            )
                          }
                          className={checkboxClass}
                        />
                        <span>{micro.name}</span>
                      </label>
                    ))
                  )}
                </>
              )}
            </div>
          </FilterMiniWizard>
        </div>
      </div>
    </GlassCard>
  );
}

export type { DirectorioFilters };
