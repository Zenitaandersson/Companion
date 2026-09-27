import type { PlannedEvent, RoutineStep } from '../data/types';
import { isoDate, minutesOf, minutesOfDate } from './timeWords';

export type StepPhase = 'done' | 'now' | 'later';

/** The routine sorted by clock time. sortOrder is only a tiebreaker. */
export function sortSteps(steps: RoutineStep[]): RoutineStep[] {
  return [...steps].sort((a, b) => minutesOf(a.time) - minutesOf(b.time) || a.sortOrder - b.sortOrder);
}

/**
 * Which step is "now": the latest step whose time has passed.
 * Before the first step of the day, the first step is "now" so the screen always has a focus.
 */
export function currentStepIndex(steps: RoutineStep[], now: Date): number {
  const sorted = sortSteps(steps);
  if (sorted.length === 0) return -1;
  const minutes = minutesOfDate(now);
  let index = 0;
  for (let i = 0; i < sorted.length; i++) {
    if (minutesOf(sorted[i].time) <= minutes) index = i;
  }
  return index;
}

/** Phase for each sorted step relative to the current one. */
export function stepPhases(steps: RoutineStep[], now: Date): { step: RoutineStep; phase: StepPhase }[] {
  const sorted = sortSteps(steps);
  const current = currentStepIndex(sorted, now);
  return sorted.map((step, i) => ({
    step,
    phase: i < current ? 'done' : i === current ? 'now' : 'later',
  }));
}

export interface NextThing {
  text: string;
  /** "HH:MM" */
  time: string;
  source: 'event' | 'step';
}

/**
 * The next thing that happens today, preferring a dated plan over a routine step
 * when both fall at the same minute. Returns null when the day is over.
 */
export function nextThing(steps: RoutineStep[], events: PlannedEvent[], now: Date): NextThing | null {
  const minutes = minutesOfDate(now);
  const today = isoDate(now);
  const candidates: NextThing[] = [];
  for (const e of events) {
    if (e.date === today && minutesOf(e.time) > minutes) {
      candidates.push({ text: e.text, time: e.time, source: 'event' });
    }
  }
  for (const s of steps) {
    if (minutesOf(s.time) > minutes) {
      candidates.push({ text: s.title, time: s.time, source: 'step' });
    }
  }
  candidates.sort(
    (a, b) => minutesOf(a.time) - minutesOf(b.time) || (a.source === 'event' ? -1 : 1),
  );
  return candidates[0] ?? null;
}

/** Upcoming events for today and tomorrow, for the carer's "What happens next" list. */
export function upcomingEvents(events: PlannedEvent[], now: Date): PlannedEvent[] {
  const today = isoDate(now);
  return [...events]
    .filter((e) => e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date) || minutesOf(a.time) - minutesOf(b.time));
}

const MAX_REPEATS = 3;

/** A reminder older than this is no longer shown or spoken. There is no "overdue" state. */
export const STALE_MINUTES = 90;

/** True when the step's time is more than STALE_MINUTES ago, or still in the future. */
export function isStale(step: RoutineStep, now: Date): boolean {
  const age = minutesOfDate(now) - minutesOf(step.time);
  return age < 0 || age > STALE_MINUTES;
}

const STORAGE_KEY = 'companion.reminderState';

/** Loads the reminder state saved for today, so a reload never repeats a reminder already answered. */
export function loadReminderState(now: Date): ReminderState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_REMINDER_STATE;
    const parsed = JSON.parse(raw) as ReminderState & { day?: string };
    if (parsed.day !== isoDate(now)) return EMPTY_REMINDER_STATE;
    return { announced: parsed.announced ?? {}, acknowledged: parsed.acknowledged ?? {} };
  } catch {
    return EMPTY_REMINDER_STATE;
  }
}

export function saveReminderState(state: ReminderState, now: Date): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, day: isoDate(now) }));
  } catch {
    /* storage unavailable: reminders simply start fresh next time */
  }
}

export interface ReminderState {
  /** Step id → timestamp of the last time it was announced today. */
  announced: Record<number, { count: number; lastAt: number; day: string }>;
  /** Step id → day it was acknowledged. */
  acknowledged: Record<number, string>;
}

export const EMPTY_REMINDER_STATE: ReminderState = { announced: {}, acknowledged: {} };

/**
 * Decides which reminder, if any, should be shown right now.
 * Rules: only steps with remind = true; only after the step time today;
 * never more than three announcements; repeats every `repeatMinutes`;
 * never once acknowledged today; never for steps more than 90 minutes old.
 */
export function dueReminder(
  steps: RoutineStep[],
  state: ReminderState,
  now: Date,
): RoutineStep | null {
  const today = isoDate(now);
  const candidates = sortSteps(steps).filter((s) => s.remind && s.id !== undefined);
  for (const step of candidates) {
    const id = step.id as number;
    if (isStale(step, now)) continue;
    if (state.acknowledged[id] === today) continue;
    const record = state.announced[id];
    if (!record || record.day !== today) return step;
    if (record.count >= MAX_REPEATS) continue;
    if (step.repeatMinutes <= 0) continue;
    const elapsedMinutes = (now.getTime() - record.lastAt) / 60000;
    if (elapsedMinutes >= step.repeatMinutes) return step;
  }
  return null;
}

/** Marks a step as announced now. */
export function markAnnounced(state: ReminderState, stepId: number, now: Date): ReminderState {
  const today = isoDate(now);
  const prev = state.announced[stepId];
  const count = prev && prev.day === today ? prev.count + 1 : 1;
  return {
    ...state,
    announced: { ...state.announced, [stepId]: { count, lastAt: now.getTime(), day: today } },
  };
}

/** Marks a step as acknowledged for today. */
export function markAcknowledged(state: ReminderState, stepId: number, now: Date): ReminderState {
  return { ...state, acknowledged: { ...state.acknowledged, [stepId]: isoDate(now) } };
}
