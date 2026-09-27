import i18n from '../i18n';
import type { Language, PlannedEvent, Profile, RoutineStep } from '../data/types';
import { nextThing } from './schedule';
import { clockTime, dateLine, formatHHMM, weekdayName } from './timeWords';

export const PLACEHOLDERS = ['time', 'day', 'date', 'next', 'name', 'home'] as const;
export type Placeholder = (typeof PLACEHOLDERS)[number];

export interface DynamicContext {
  profile: Pick<Profile, 'name' | 'homeLabel'>;
  steps: RoutineStep[];
  events: PlannedEvent[];
  now: Date;
  language: Language;
}

/** Text for the "what happens next" line, or the calm fallback when nothing is left today. */
export function nextThingText(ctx: DynamicContext): string {
  const next = nextThing(ctx.steps, ctx.events, ctx.now);
  if (!next) return i18n.t('today.nothingNext');
  return i18n.t('today.nextAt', { text: next.text, time: formatHHMM(next.time, ctx.language) });
}

/** Resolves a single placeholder to its current value. */
export function resolvePlaceholder(key: Placeholder, ctx: DynamicContext): string {
  switch (key) {
    case 'time':
      return clockTime(ctx.now, ctx.language);
    case 'day':
      return weekdayName(ctx.now, ctx.language);
    case 'date':
      return dateLine(ctx.now, ctx.language);
    case 'next':
      return nextThingText(ctx);
    case 'name':
      return ctx.profile.name;
    case 'home':
      return ctx.profile.homeLabel;
  }
}

/**
 * Fills {placeholders} in a carer-written answer. Unknown placeholders are left as written,
 * so a typo never makes text disappear.
 */
export function fillTemplate(template: string, ctx: DynamicContext): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => {
    if ((PLACEHOLDERS as readonly string[]).includes(key)) {
      return resolvePlaceholder(key as Placeholder, ctx);
    }
    return match;
  });
}

/** True when a template contains any dynamic placeholder, meaning recorded audio would go stale. */
export function hasPlaceholders(template: string): boolean {
  return PLACEHOLDERS.some((p) => template.includes(`{${p}}`));
}
