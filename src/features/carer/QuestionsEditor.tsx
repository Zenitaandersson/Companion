import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useEvents, useQuestions, useRoutineSteps } from '../../app/useLiveData';
import { db, moveItem, nextSortOrder } from '../../data/db';
import type { FrequentQuestion, Profile } from '../../data/types';
import { PLACEHOLDERS, fillTemplate, hasPlaceholders, type Placeholder } from '../../services/dynamicText';
import { CarerButton, Field } from './fields';
import { RecorderControl } from './RecorderControl';

interface Props {
  profile: Profile;
}

const INSERT_LABEL: Record<Placeholder, string> = {
  time: 'insertTime',
  day: 'insertDay',
  date: 'insertDate',
  next: 'insertNext',
  name: 'insertName',
  home: 'insertHome',
};

/** The person's frequent questions and the carer's answers, with dynamic placeholders. */
export function QuestionsEditor({ profile }: Props) {
  const { t } = useTranslation();
  const questions = useQuestions();
  const [editing, setEditing] = useState<FrequentQuestion | null>(null);

  if (editing) return <QuestionForm question={editing} profile={profile} onDone={() => setEditing(null)} />;

  return (
    <>
      <p className="field__hint">{t('carer.questions.intro')}</p>
      {questions.length === 0 ? <p className="field__hint">{t('carer.questions.empty')}</p> : null}
      {questions.map((q, i) => (
        <div key={q.id} className="list-item">
          <div className="list-item__text">
            <div className="list-item__title">{q.question}</div>
            <div className="list-item__sub">{q.answer}</div>
          </div>
          <div className="list-item__actions">
            <CarerButton small onClick={() => setEditing(q)}>
              {t('carer.edit')}
            </CarerButton>
            <div className="chips">
              <CarerButton small ariaLabel={t('carer.people.moveUp')} disabled={i === 0} onClick={() => void moveItem(db.questions, questions, i, -1)}>
                ↑
              </CarerButton>
              <CarerButton small ariaLabel={t('carer.people.moveDown')} disabled={i === questions.length - 1} onClick={() => void moveItem(db.questions, questions, i, 1)}>
                ↓
              </CarerButton>
            </div>
          </div>
        </div>
      ))}
      <CarerButton variant="primary" block onClick={() => setEditing({ question: '', answer: '', answerAudio: null, sortOrder: 0 })}>
        + {t('carer.questions.addQuestion')}
      </CarerButton>
    </>
  );
}

function QuestionForm({ question, profile, onDone }: { question: FrequentQuestion; profile: Profile; onDone: () => void }) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState(question);
  const answerRef = useRef<HTMLTextAreaElement>(null);
  const steps = useRoutineSteps();
  const events = useEvents();

  const insert = (key: Placeholder) => {
    const el = answerRef.current;
    const token = `{${key}}`;
    if (!el) {
      setDraft({ ...draft, answer: draft.answer + token });
      return;
    }
    const start = el.selectionStart ?? draft.answer.length;
    const end = el.selectionEnd ?? draft.answer.length;
    const next = draft.answer.slice(0, start) + token + draft.answer.slice(end);
    setDraft({ ...draft, answer: next });
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + token.length, start + token.length);
    });
  };

  const preview = fillTemplate(draft.answer, { profile, steps, events, now: new Date(), language: profile.language });
  const valid = draft.question.trim() && draft.answer.trim();

  const save = async () => {
    if (!valid) return;
    const clean = { ...draft, question: draft.question.trim(), answer: draft.answer.trim() };
    if (clean.id === undefined) await db.questions.add({ ...clean, sortOrder: await nextSortOrder(db.questions) });
    else await db.questions.put(clean);
    onDone();
  };

  const remove = async () => {
    if (draft.id !== undefined) await db.questions.delete(draft.id);
    onDone();
  };

  return (
    <>
      <Field label={t('carer.questions.question')} htmlFor="q-q">
        <input id="q-q" type="text" value={draft.question} placeholder={t('carer.questions.questionPlaceholder')} onChange={(e) => setDraft({ ...draft, question: e.target.value })} />
      </Field>
      <Field label={t('carer.questions.answer')} hint={t('carer.questions.answerHint')} htmlFor="q-a">
        <textarea id="q-a" ref={answerRef} value={draft.answer} onChange={(e) => setDraft({ ...draft, answer: e.target.value })} />
      </Field>
      <Field label={t('carer.questions.insert')}>
        <div className="chips">
          {PLACEHOLDERS.map((p) => (
            <CarerButton key={p} small onClick={() => insert(p)}>
              + {t(`carer.questions.${INSERT_LABEL[p]}`)}
            </CarerButton>
          ))}
        </div>
      </Field>
      {draft.answer ? (
        <Field label={t('carer.questions.preview')}>
          <p className="notice" style={{ margin: 0 }}>
            {preview}
          </p>
        </Field>
      ) : null}
      {!hasPlaceholders(draft.answer) ? (
        <RecorderControl label={t('carer.questions.recordAnswer')} value={draft.answerAudio} onChange={(b) => setDraft({ ...draft, answerAudio: b })} />
      ) : null}
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
