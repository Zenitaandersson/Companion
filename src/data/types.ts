/**
 * Companion data model.
 *
 * Every piece of content the person sees or hears is carer-entered text,
 * optionally paired with a carer-recorded audio Blob. A future assistant
 * can be grounded on these text fields alone, which is why nothing is
 * stored as free-form rich content.
 */

export type Language = 'en' | 'sv';

export type CallMethod = 'phone' | 'whatsapp';

/** Single-row profile for the person using Person mode. Always id 1. */
export interface Profile {
  id: 1;
  name: string;
  /** Shown as "You are {homeLabel}", e.g. "at home in Lerum". */
  homeLabel: string;
  language: Language;
  /** SHA-256 hex of the carer PIN, or null before a PIN is set. */
  carerPinHash: string | null;
  primaryContactId: number | null;
  reassuranceText: string;
  reassuranceAudio: Blob | null;
  shareLocationOnHelp: boolean;
  weeklySummaryEnabled: boolean;
  onboardingDone: boolean;
  createdAt: number;
  updatedAt: number;
}

/** A family member or carer shown as a photo card. */
export interface Contact {
  id?: number;
  firstName: string;
  /** In the person's words: "daughter", "neighbour". */
  relationship: string;
  /** One calm sentence: "Your daughter. She lives in Lerum." */
  sentence: string;
  photo: Blob | null;
  greetingAudio: Blob | null;
  phone: string;
  callMethod: CallMethod;
  sortOrder: number;
}

/** One step in the daily routine. Times are "HH:MM" in local time. */
export interface RoutineStep {
  id?: number;
  title: string;
  time: string;
  /** What is spoken when the reminder fires. Falls back to the title. */
  spokenText: string;
  /** Emoji symbol shown next to the step. */
  icon: string;
  sortOrder: number;
  remind: boolean;
  /** 0 = remind once; otherwise repeat every N minutes, at most three times. */
  repeatMinutes: number;
}

/** A dated plan such as "Anna comes" on a specific day. Date is "YYYY-MM-DD". */
export interface PlannedEvent {
  id?: number;
  date: string;
  time: string;
  text: string;
}

/** A question the person asks often, with the carer's answer template. */
export interface FrequentQuestion {
  id?: number;
  question: string;
  /** May contain placeholders: {time} {day} {date} {next} {name} {home}. */
  answer: string;
  answerAudio: Blob | null;
  sortOrder: number;
}

/** One page of the memory book. */
export interface Memory {
  id?: number;
  photo: Blob | null;
  caption: string;
  voiceNote: Blob | null;
  sortOrder: number;
}

export type AcknowledgementKind = 'reminder' | 'question' | 'help' | 'greeting';

/** A quiet usage record used only for the carer's weekly summary. */
export interface Acknowledgement {
  id?: number;
  kind: AcknowledgementKind;
  refId: number | null;
  at: number;
}

export const DEFAULT_PROFILE: Profile = {
  id: 1,
  name: '',
  homeLabel: '',
  language: 'en',
  carerPinHash: null,
  primaryContactId: null,
  reassuranceText: '',
  reassuranceAudio: null,
  shareLocationOnHelp: false,
  weeklySummaryEnabled: true,
  onboardingDone: false,
  createdAt: 0,
  updatedAt: 0,
};
