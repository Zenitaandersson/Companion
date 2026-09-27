import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useEvents } from '../../app/useLiveData';
import { db } from '../../data/db';
import type { PlannedEvent, Profile } from '../../data/types';
import { upcomingEvents } from '../../services/schedule';
import { formatHHMM, fullDateLine, isoDate } from '../../services/timeWords';
import { CarerButton, Field } from './fields';

interface Props {
  profile: Profile;
}

/** Dated plans such as "Anna comes at 3". Past plans are removed automatically from the list. */
export function EventsEditor({ profile }: Props) {
  const { t } = useTranslation();
  const events = useEvents();
  const now = new Date();
  const upcoming = upcomingEvents(events, now);
  const [editing, setEditing] = useState<PlannedEvent | null>(null);

  if (editing) return <EventForm event={editing} onDone={() => setEditing(null)} />;

  return (
    <>
      <p className="field__hint">{t('carer.events.intro')}</p>
      {upcoming.length === 0 ? <p className="field__hint">{t('carer.events.empty')}</p> : null}
      {upcoming.map((e) => (
        <div key={e.id} className="list-item">
          <div className="list-item__text">
            <div className="list-item__title">{e.text}</div>
            <div className="list-item__sub">
              {fullDateLine(new Date(`${e.date}T12:00:00`), profile.language)} · {formatHHMM(e.time, profile.language)}
            </div>
          </div>
          <CarerButton small onClick={() => setEditing(e)}>
            {t('carer.edit')}
          </CarerButton>
        </div>
      ))}
      <CarerButton variant="primary" block onClick={() => setEditing({ date: isoDate(now), time: '15:00', text: '' })}>
        + {t('carer.events.addEvent')}
      </CarerButton>
    </>
  );
}

function EventForm({ event, onDone }: { event: PlannedEvent; onDone: () => void }) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState(event);
  const valid = draft.text.trim() && /^\d{4}-\d{2}-\d{2}$/.test(draft.date) && /^\d{2}:\d{2}$/.test(draft.time);

  const save = async () => {
    if (!valid) return;
    const clean = { ...draft, text: draft.text.trim() };
    if (clean.id === undefined) await db.events.add(clean);
    else await db.events.put(clean);
    onDone();
  };

  const remove = async () => {
    if (draft.id !== undefined) await db.events.delete(draft.id);
    onDone();
  };

  return (
    <>
      <Field label={t('carer.events.text')} htmlFor="e-text">
        <input id="e-text" type="text" value={draft.text} placeholder={t('carer.events.textPlaceholder')} onChange={(e) => setDraft({ ...draft, text: e.target.value })} />
      </Field>
      <Field label={t('carer.events.date')} htmlFor="e-date">
        <input id="e-date" type="date" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} />
      </Field>
      <Field label={t('carer.events.time')} htmlFor="e-time">
        <input id="e-time" type="time" value={draft.time} onChange={(e) => setDraft({ ...draft, time: e.target.value })} />
      </Field>
      <div className="chips">
        <CarerButton variant="primary" onClick={() => void save()} disabled={!valid}>
          {t('carer.save')}
        </CarerButton>
        <CarerButton onClick={onDone}>{t('carer.cancel')}</CarerButton>
        {draft.id !== undefined ? (
          <CarerButton variant="danger" onClick={() => void remove()}>
            {t('carer.delete')}
          </CarerButton>
        ) : null}
      </div>
    </>
  );
}
