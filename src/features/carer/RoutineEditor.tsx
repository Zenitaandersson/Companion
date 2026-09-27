import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRoutineSteps } from '../../app/useLiveData';
import { db, nextSortOrder } from '../../data/db';
import type { Profile, RoutineStep } from '../../data/types';
import { sortSteps } from '../../services/schedule';
import { formatHHMM } from '../../services/timeWords';
import { CarerButton, Field, Toggle } from './fields';
import { STEP_ICONS, routineTemplate, type TemplateName } from './routineTemplates';

interface Props {
  profile: Profile;
}

const EMPTY: RoutineStep = {
  title: '',
  time: '12:00',
  spokenText: '',
  icon: '☀️',
  sortOrder: 0,
  remind: true,
  repeatMinutes: 15,
};

/** Daily routine: templates, ordered by time, each step editable. */
export function RoutineEditor({ profile }: Props) {
  const { t } = useTranslation();
  const steps = sortSteps(useRoutineSteps());
  const [editing, setEditing] = useState<RoutineStep | null>(null);
  const [confirmTemplate, setConfirmTemplate] = useState<TemplateName | 'empty' | null>(null);

  const applyTemplate = async (name: TemplateName | 'empty') => {
    await db.routineSteps.clear();
    if (name !== 'empty') {
      const seeds = routineTemplate(name, profile.language);
      await db.routineSteps.bulkAdd(seeds.map((s, i) => ({ ...s, sortOrder: i })));
    }
    setConfirmTemplate(null);
  };

  /** Applies at once when there is nothing to lose, otherwise asks first. */
  const chooseTemplate = (name: TemplateName | 'empty') => {
    if (steps.length === 0) void applyTemplate(name);
    else setConfirmTemplate(name);
  };

  if (editing) return <StepForm step={editing} onDone={() => setEditing(null)} />;

  return (
    <>
      <div className="field">
        <span className="field__label">{t('carer.routine.template')}</span>
        <div className="chips">
          <CarerButton onClick={() => chooseTemplate('gentle')}>{t('carer.routine.templateGentle')}</CarerButton>
          <CarerButton onClick={() => chooseTemplate('full')}>{t('carer.routine.templateFull')}</CarerButton>
          <CarerButton onClick={() => chooseTemplate('empty')}>{t('carer.routine.templateEmpty')}</CarerButton>
        </div>
        {confirmTemplate ? (
          <div className="notice">
            <p style={{ margin: '0 0 0.5rem' }}>{t('carer.routine.templateWarning')}</p>
            <div className="chips">
              <CarerButton variant="primary" onClick={() => void applyTemplate(confirmTemplate)}>
                {t('carer.done')}
              </CarerButton>
              <CarerButton onClick={() => setConfirmTemplate(null)}>{t('carer.cancel')}</CarerButton>
            </div>
          </div>
        ) : null}
      </div>

      {steps.length === 0 ? <p className="field__hint">{t('carer.routine.empty')}</p> : null}
      {steps.map((s) => (
        <div key={s.id} className="list-item">
          <span className="thumb" aria-hidden="true" style={{ fontSize: '1.6em' }}>
            {s.icon}
          </span>
          <div className="list-item__text">
            <div className="list-item__title">
              {formatHHMM(s.time, profile.language)} · {s.title}
            </div>
            <div className="list-item__sub">{s.remind ? '🔔 ' : ''}{s.spokenText}</div>
          </div>
          <CarerButton small onClick={() => setEditing(s)}>
            {t('carer.edit')}
          </CarerButton>
        </div>
      ))}
      <CarerButton variant="primary" block onClick={() => setEditing({ ...EMPTY })}>
        + {t('carer.routine.addStep')}
      </CarerButton>
    </>
  );
}

function StepForm({ step, onDone }: { step: RoutineStep; onDone: () => void }) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState<RoutineStep>(step);
  const set = <K extends keyof RoutineStep>(key: K, value: RoutineStep[K]) => setDraft((d) => ({ ...d, [key]: value }));

  const save = async () => {
    const trimmed = { ...draft, title: draft.title.trim(), spokenText: draft.spokenText.trim() };
    if (!trimmed.title || !/^\d{2}:\d{2}$/.test(trimmed.time)) return;
    if (trimmed.id === undefined) {
      await db.routineSteps.add({ ...trimmed, sortOrder: await nextSortOrder(db.routineSteps) });
    } else {
      await db.routineSteps.put(trimmed);
    }
    onDone();
  };

  const remove = async () => {
    if (draft.id !== undefined) await db.routineSteps.delete(draft.id);
    onDone();
  };

  return (
    <>
      <Field label={t('carer.routine.stepTitle')} htmlFor="s-title">
        <input id="s-title" type="text" value={draft.title} placeholder={t('carer.routine.stepTitlePlaceholder')} onChange={(e) => set('title', e.target.value)} />
      </Field>
      <Field label={t('carer.routine.time')} htmlFor="s-time">
        <input id="s-time" type="time" value={draft.time} onChange={(e) => set('time', e.target.value)} />
      </Field>
      <Field label={t('carer.routine.icon')}>
        <div className="chips" role="radiogroup">
          {STEP_ICONS.map((icon) => (
            <button
              key={icon}
              type="button"
              role="radio"
              aria-checked={draft.icon === icon}
              className="carer-button"
              style={{ fontSize: '1.4em', minWidth: 56, borderColor: draft.icon === icon ? 'var(--accent)' : undefined, background: draft.icon === icon ? 'var(--highlight)' : undefined }}
              onClick={() => set('icon', icon)}
            >
              {icon}
            </button>
          ))}
        </div>
      </Field>
      <Field label={t('carer.routine.spokenText')} hint={t('carer.routine.spokenTextHint')} htmlFor="s-spoken">
        <textarea id="s-spoken" value={draft.spokenText} onChange={(e) => set('spokenText', e.target.value)} />
      </Field>
      <Toggle label={t('carer.routine.remind')} checked={draft.remind} onChange={(v) => set('remind', v)} />
      {draft.remind ? (
        <Field label={t('carer.routine.repeat')} htmlFor="s-repeat">
          <select id="s-repeat" value={draft.repeatMinutes} onChange={(e) => set('repeatMinutes', Number(e.target.value))}>
            <option value={0}>{t('carer.routine.repeatNever')}</option>
            {[10, 15, 20, 30].map((m) => (
              <option key={m} value={m}>
                {t('carer.routine.repeatMinutes', { minutes: m })}
              </option>
            ))}
          </select>
        </Field>
      ) : null}
      <div className="chips">
        <CarerButton variant="primary" onClick={() => void save()} disabled={!draft.title.trim()}>
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
