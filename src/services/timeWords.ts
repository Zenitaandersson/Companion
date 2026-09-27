import { LOCALE_TAGS } from '../i18n';
import type { Language } from '../data/types';

export type TimeOfDay = 'night' | 'morning' | 'midday' | 'afternoon' | 'evening';

/** Maps a clock time to a calm word for the part of the day. */
export function timeOfDay(date: Date): TimeOfDay {
  const h = date.getHours();
  if (h < 5) return 'night';
  if (h < 11) return 'morning';
  if (h < 13) return 'midday';
  if (h < 17) return 'afternoon';
  if (h < 21) return 'evening';
  return 'night';
}

/** "Tuesday" in the chosen language. */
export function weekdayName(date: Date, language: Language): string {
  return new Intl.DateTimeFormat(LOCALE_TAGS[language], { weekday: 'long' }).format(date);
}

/** "27 September" in the chosen language. */
export function dateLine(date: Date, language: Language): string {
  return new Intl.DateTimeFormat(LOCALE_TAGS[language], { day: 'numeric', month: 'long' }).format(
    date,
  );
}

/** "Tuesday 27 September" in the chosen language. */
export function fullDateLine(date: Date, language: Language): string {
  return new Intl.DateTimeFormat(LOCALE_TAGS[language], {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(date);
}

/** Clock time, 24-hour for Swedish and 12-hour with am/pm for English. */
export function clockTime(date: Date, language: Language): string {
  return new Intl.DateTimeFormat(LOCALE_TAGS[language], {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

/** Formats an "HH:MM" string the same way clockTime does. */
export function formatHHMM(hhmm: string, language: Language): string {
  const [h, m] = hhmm.split(':').map(Number);
  const d = new Date(2000, 0, 1, h, m);
  return clockTime(d, language);
}

/** Minutes since midnight for an "HH:MM" string. */
export function minutesOf(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

/** Minutes since midnight for a Date. */
export function minutesOfDate(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

/** "YYYY-MM-DD" in local time. */
export function isoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Current "HH:MM" in local time. */
export function hhmmOf(date: Date): string {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}
