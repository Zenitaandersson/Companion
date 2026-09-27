import { describe, expect, it } from 'vitest';
import type { PlannedEvent, RoutineStep } from '../data/types';
import {
  EMPTY_REMINDER_STATE,
  currentStepIndex,
  dueReminder,
  isStale,
  loadReminderState,
  markAcknowledged,
  markAnnounced,
  nextThing,
  saveReminderState,
  stepPhases,
} from './schedule';

const step = (id: number, time: string, extra: Partial<RoutineStep> = {}): RoutineStep => ({
  id,
  title: `Step ${id}`,
  time,
  spokenText: '',
  icon: '☀️',
  sortOrder: id,
  remind: true,
  repeatMinutes: 15,
  ...extra,
});

const at = (h: number, m = 0) => new Date(2026, 8, 29, h, m); // Tuesday 29 Sep 2026

describe('currentStepIndex', () => {
  const steps = [step(1, '08:00'), step(2, '12:30'), step(3, '17:30')];

  it('is the latest step whose time has passed', () => {
    expect(currentStepIndex(steps, at(13))).toBe(1);
    expect(currentStepIndex(steps, at(18))).toBe(2);
  });

  it('is the first step before the day begins', () => {
    expect(currentStepIndex(steps, at(6))).toBe(0);
  });

  it('is -1 with no steps', () => {
    expect(currentStepIndex([], at(10))).toBe(-1);
  });

  it('sorts by clock time, not sortOrder', () => {
    const unsorted = [step(1, '17:30'), step(2, '08:00')];
    expect(stepPhases(unsorted, at(9)).map((p) => p.step.id)).toEqual([2, 1]);
  });
});

describe('stepPhases', () => {
  it('labels done, now and later', () => {
    const steps = [step(1, '08:00'), step(2, '12:30'), step(3, '17:30')];
    expect(stepPhases(steps, at(13)).map((p) => p.phase)).toEqual(['done', 'now', 'later']);
  });
});

describe('nextThing', () => {
  const steps = [step(1, '08:00'), step(2, '12:30'), step(3, '17:30')];
  const events: PlannedEvent[] = [{ id: 1, date: '2026-09-29', time: '15:00', text: 'Anna comes' }];

  it('returns the earliest upcoming step or event', () => {
    expect(nextThing(steps, events, at(13))).toMatchObject({ text: 'Anna comes', time: '15:00' });
    expect(nextThing(steps, events, at(16))).toMatchObject({ text: 'Step 3', time: '17:30' });
  });

  it('ignores events on other days', () => {
    const other: PlannedEvent[] = [{ id: 2, date: '2026-09-30', time: '09:00', text: 'Doctor' }];
    expect(nextThing(steps, other, at(18))).toBeNull();
  });

  it('prefers an event over a step at the same minute', () => {
    const same: PlannedEvent[] = [{ id: 3, date: '2026-09-29', time: '17:30', text: 'Anna comes' }];
    expect(nextThing(steps, same, at(16))?.source).toBe('event');
  });
});

describe('isStale', () => {
  it('is stale before the time and after 90 minutes, fresh in between', () => {
    const s = step(1, '12:30');
    expect(isStale(s, at(12, 0))).toBe(true);
    expect(isStale(s, at(12, 30))).toBe(false);
    expect(isStale(s, at(14, 0))).toBe(false);
    expect(isStale(s, at(14, 1))).toBe(true);
  });
});

describe('reminder state persistence', () => {
  it('survives a reload on the same day and resets on the next', () => {
    const state = markAcknowledged(markAnnounced(EMPTY_REMINDER_STATE, 1, at(12, 30)), 1, at(12, 31));
    saveReminderState(state, at(12, 31));
    expect(loadReminderState(at(12, 50))).toEqual(state);
    expect(loadReminderState(new Date(2026, 8, 30, 8, 0))).toEqual(EMPTY_REMINDER_STATE);
  });
});

describe('dueReminder', () => {
  const steps = [step(1, '12:30', { repeatMinutes: 15 }), step(2, '17:30', { remind: false })];

  it('is silent before the step time', () => {
    expect(dueReminder(steps, EMPTY_REMINDER_STATE, at(12, 29))).toBeNull();
  });

  it('fires at the step time', () => {
    expect(dueReminder(steps, EMPTY_REMINDER_STATE, at(12, 30))?.id).toBe(1);
  });

  it('ignores steps with reminders switched off', () => {
    expect(dueReminder(steps, EMPTY_REMINDER_STATE, at(17, 30))).toBeNull();
  });

  it('repeats after the interval, at most three times, then stops quietly', () => {
    let state = markAnnounced(EMPTY_REMINDER_STATE, 1, at(12, 30));
    expect(dueReminder(steps, state, at(12, 40))).toBeNull();
    expect(dueReminder(steps, state, at(12, 45))?.id).toBe(1);
    state = markAnnounced(state, 1, at(12, 45));
    state = markAnnounced(state, 1, at(13, 0));
    expect(state.announced[1].count).toBe(3);
    expect(dueReminder(steps, state, at(13, 30))).toBeNull();
  });

  it('does not repeat when repeatMinutes is 0', () => {
    const once = [step(1, '12:30', { repeatMinutes: 0 })];
    const state = markAnnounced(EMPTY_REMINDER_STATE, 1, at(12, 30));
    expect(dueReminder(once, state, at(13, 0))).toBeNull();
  });

  it('never fires again once acknowledged that day', () => {
    const state = markAcknowledged(markAnnounced(EMPTY_REMINDER_STATE, 1, at(12, 30)), 1, at(12, 31));
    expect(dueReminder(steps, state, at(12, 50))).toBeNull();
  });

  it('never fires for a step more than 90 minutes old, so there is no "overdue"', () => {
    expect(dueReminder(steps, EMPTY_REMINDER_STATE, at(14, 30))).toBeNull();
  });

  it('keeps announcing later steps even when an earlier one was never answered', () => {
    const two = [step(1, '08:30', { repeatMinutes: 15 }), step(2, '09:00', { repeatMinutes: 15 })];
    let state = markAnnounced(EMPTY_REMINDER_STATE, 1, at(8, 30));
    state = markAnnounced(state, 1, at(8, 45));
    state = markAnnounced(state, 1, at(9, 0));
    expect(dueReminder(two, state, at(9, 0))?.id).toBe(2);
  });

  it('starts fresh on a new day', () => {
    const yesterday = new Date(2026, 8, 28, 12, 30);
    const state = markAcknowledged(EMPTY_REMINDER_STATE, 1, yesterday);
    expect(dueReminder(steps, state, at(12, 30))?.id).toBe(1);
  });
});
