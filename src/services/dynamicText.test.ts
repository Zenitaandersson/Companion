import { describe, expect, it } from 'vitest';
import i18n from '../i18n';
import type { RoutineStep } from '../data/types';
import { fillTemplate, hasPlaceholders, type DynamicContext } from './dynamicText';

const steps: RoutineStep[] = [
  { id: 1, title: 'Dinner', time: '17:30', spokenText: '', icon: '🍽', sortOrder: 0, remind: true, repeatMinutes: 0 },
];

const ctx: DynamicContext = {
  profile: { name: 'Erik', homeLabel: 'at home in Lerum' },
  steps,
  events: [{ id: 1, date: '2026-09-29', time: '15:00', text: 'Anna comes' }],
  now: new Date(2026, 8, 29, 13, 5),
  language: 'en',
};

describe('fillTemplate', () => {
  it('fills every placeholder', () => {
    const out = fillTemplate('{name} is {home}. It is {day}, {date}. Time: {time}. Next: {next}', ctx);
    expect(out).toContain('Erik is at home in Lerum');
    expect(out).toContain('Tuesday');
    expect(out).toContain('29 September');
    expect(out).toMatch(/1:05|13:05/);
    expect(out).toContain('Anna comes at');
  });

  it('leaves unknown placeholders untouched so nothing disappears', () => {
    expect(fillTemplate('Hello {nobody}', ctx)).toBe('Hello {nobody}');
  });

  it('uses the calm fallback when nothing is left today', () => {
    const late = { ...ctx, now: new Date(2026, 8, 29, 22, 0) };
    expect(fillTemplate('{next}', late)).toBe(i18n.t('today.nothingNext'));
  });

  it('localises to Swedish', async () => {
    await i18n.changeLanguage('sv');
    const out = fillTemplate('{day} {next}', { ...ctx, language: 'sv' });
    expect(out).toContain('tisdag');
    expect(out).toContain('klockan 15:00');
    await i18n.changeLanguage('en');
  });
});

describe('hasPlaceholders', () => {
  it('detects dynamic answers', () => {
    expect(hasPlaceholders('It is {time}.')).toBe(true);
    expect(hasPlaceholders('Martin is at work.')).toBe(false);
  });
});
