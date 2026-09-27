import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useTranslation } from 'react-i18next';
import { useContacts, useQuestions, useRoutineSteps } from '../../app/useLiveData';
import { db, updateProfile } from '../../data/db';
import type { Acknowledgement, Profile } from '../../data/types';
import { Toggle } from './fields';

interface Props {
  profile: Profile;
}

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/** Counts acknowledgements per kind and per item. Pure, so it is unit-testable. */
export function summarise(acks: Acknowledgement[]) {
  const byKind: Record<Acknowledgement['kind'], number> = { reminder: 0, question: 0, help: 0, greeting: 0 };
  const byRef: Record<string, number> = {};
  for (const a of acks) {
    byKind[a.kind] += 1;
    const key = `${a.kind}:${a.refId ?? 'none'}`;
    byRef[key] = (byRef[key] ?? 0) + 1;
  }
  return { byKind, byRef };
}

/** Quiet weekly overview for the carer. Informational, and switchable off. */
export function Summary({ profile }: Props) {
  const { t } = useTranslation();
  const [since] = useState(() => Date.now() - WEEK_MS);
  const acks = useLiveQuery(() => db.acknowledgements.where('at').above(since).toArray(), [since]) ?? [];

  return (
    <>
      <Toggle label={t('carer.summary.enabled')} checked={profile.weeklySummaryEnabled} onChange={(v) => void updateProfile({ weeklySummaryEnabled: v })} />
      {!profile.weeklySummaryEnabled ? null : (
        <SummaryBody acks={acks} />
      )}
    </>
  );
}

function SummaryBody({ acks }: { acks: Acknowledgement[] }) {
  const { t } = useTranslation();
  const steps = useRoutineSteps();
  const questions = useQuestions();
  const contacts = useContacts();
  const { byKind, byRef } = summarise(acks);

  const topQuestions = questions
    .map((q) => ({ q, n: byRef[`question:${q.id}`] ?? 0 }))
    .filter((x) => x.n > 0)
    .sort((a, b) => b.n - a.n)
    .slice(0, 5);

  const reminderSteps = steps
    .map((s) => ({ s, n: byRef[`reminder:${s.id}`] ?? 0 }))
    .filter((x) => x.n > 0);

  const greetings = contacts
    .map((c) => ({ c, n: byRef[`greeting:${c.id}`] ?? 0 }))
    .filter((x) => x.n > 0);

  return (
    <>
      <p className="field__hint">{t('carer.summary.intro')}</p>
      {acks.length === 0 ? <p className="field__hint">{t('carer.summary.nothing')}</p> : null}

      <section>
        <h2 className="field__label">{t('carer.summary.reminders')}</h2>
        {reminderSteps.map(({ s, n }) => (
          <div key={s.id} className="summary-row">
            <span>{s.icon} {s.title}</span>
            <span>{t('carer.summary.times', { count: n })}</span>
          </div>
        ))}
      </section>

      <section>
        <h2 className="field__label">{t('carer.summary.questions')}</h2>
        {topQuestions.map(({ q, n }) => (
          <div key={q.id} className="summary-row">
            <span>{q.question}</span>
            <span>{t('carer.summary.times', { count: n })}</span>
          </div>
        ))}
      </section>

      <section>
        <h2 className="field__label">{t('carer.summary.greetings')}</h2>
        {greetings.map(({ c, n }) => (
          <div key={c.id} className="summary-row">
            <span>{c.firstName}</span>
            <span>{t('carer.summary.times', { count: n })}</span>
          </div>
        ))}
      </section>

      <div className="summary-row">
        <span>{t('carer.summary.help')}</span>
        <span>{t('carer.summary.times', { count: byKind.help })}</span>
      </div>
    </>
  );
}
