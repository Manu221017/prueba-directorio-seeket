'use client';

import type { TierLevel } from '@/lib/types';

type ServiceLevel = 1 | 2 | 3;

const LEVEL_STYLE: Record<ServiceLevel, string> = {
  1: 'border-white/[0.25] bg-white/[0.1] text-white/[0.62]',
  2: 'border-seeket-orange/45 bg-seeket-orange/[0.14] text-seeket-orange',
  3: 'border-seeket-red-vibrant/50 bg-seeket-red-vibrant/[0.14] text-seeket-red-vibrant',
};

const PROFILE_LABEL: Record<TierLevel, { label: string; level: ServiceLevel }> = {
  ascenso: { label: 'A', level: 1 },
  verificado: { label: 'V', level: 2 },
  premium: { label: 'P', level: 3 },
};

const SERVICE_LABEL: Record<ServiceLevel, string> = {
  1: 'n1',
  2: 'n2',
  3: 'n3',
};

function squareClass(level: ServiceLevel, compact?: boolean, className?: string) {
  return [
    'ml-0.5 inline-flex shrink-0 items-center justify-center rounded border align-middle font-bold leading-none',
    compact ? 'h-3.5 min-w-3.5 px-0.5 text-[7px]' : 'h-4 min-w-4 px-0.5 text-[8px]',
    LEVEL_STYLE[level],
    className,
  ]
    .filter(Boolean)
    .join(' ');
}

/** Cuadradito de nivel de perfil: A (gris) · V (azul) · P (morado). */
export function ProfileProgressionSquare({
  tierLevel,
  compact,
  className,
}: {
  tierLevel: TierLevel;
  compact?: boolean;
  className?: string;
}) {
  const { label, level } = PROFILE_LABEL[tierLevel];
  return (
    <span
      className={squareClass(level, compact, className)}
      title={`Nivel ${tierLevel}`}
      aria-label={`Nivel de perfil: ${tierLevel}`}
    >
      {label}
    </span>
  );
}

/** Cuadradito de pase operativo del servicio: n1 · n2 · n3 (misma paleta). */
export function ServiceProgressionSquare({
  activeLevel,
  compact,
  className,
}: {
  activeLevel: ServiceLevel;
  compact?: boolean;
  className?: string;
}) {
  const level = (activeLevel >= 1 && activeLevel <= 3 ? activeLevel : 1) as ServiceLevel;
  return (
    <span
      className={squareClass(level, compact, className)}
      title={`Nivel ${level}`}
      aria-label={`Nivel del servicio: ${level}`}
    >
      {SERVICE_LABEL[level]}
    </span>
  );
}
