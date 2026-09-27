import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CalmFallback } from '../../design/CalmFallback';
import { acknowledge } from '../../data/db';
import type { Contact, FrequentQuestion, Profile } from '../../data/types';
import {
  dueReminder,
  isStale,
  loadReminderState,
  markAcknowledged,
  markAnnounced,
  saveReminderState,
  type ReminderState,
} from '../../services/schedule';
import { speech } from '../../services/speech';
import { useNow } from '../../app/useNow';
import {
  useContacts,
  useEvents,
  useMemories,
  useQuestions,
  useRoutineSteps,
} from '../../app/useLiveData';
import { Answer } from './Answer';
import { Help } from './Help';
import { MyDay } from './MyDay';
import { MyLife } from './MyLife';
import { People } from './People';
import { PersonCard } from './PersonCard';
import { Questions } from './Questions';
import { ReminderBanner } from './ReminderBanner';
import { Today } from './Today';

export type PersonScreen = 'today' | 'people' | 'myDay' | 'questions' | 'myLife' | 'help';

interface Props {
  profile: Profile;
  onEnterCarer: () => void;
}

const LONG_PRESS_MS = 2000;

/**
 * Person mode. Plain state-based navigation, one purpose per screen, a reminder banner that
 * appears above any screen, and the hidden long-press corner that leads to carer mode.
 */
export function PersonRoot({ profile, onEnterCarer }: Props) {
  const { t } = useTranslation();
  const now = useNow();
  const contacts = useContacts();
  const steps = useRoutineSteps();
  const events = useEvents();
  const questions = useQuestions();
  const memories = useMemories();

  const [screen, setScreen] = useState<PersonScreen>('today');
  const [openContact, setOpenContact] = useState<Contact | null>(null);
  const [openQuestion, setOpenQuestion] = useState<FrequentQuestion | null>(null);
  const [reminderState, setReminderState] = useState<ReminderState>(() => loadReminderState(new Date()));
  const [activeReminder, setActiveReminder] = useState<number | null>(null);

  // Keep today's reminder state across reloads so nothing is announced twice after "Thank you".
  useEffect(() => saveReminderState(reminderState, now), [reminderState, now]);

  const goToday = useCallback(() => {
    speech.stop();
    setOpenContact(null);
    setOpenQuestion(null);
    setScreen('today');
    window.scrollTo({ top: 0 });
  }, []);

  // Reminder engine. All timing rules live in services/schedule.ts; this only reacts to them.
  // A due step is spoken and shown. A repeat of the visible step speaks again. A newer step
  // replaces the visible one, which is then treated as answered so the two never alternate.
  useEffect(() => {
    const due = dueReminder(steps, reminderState, now);
    if (!due || due.id === undefined) return;
    const dueId = due.id;
    setReminderState((s) => {
      const superseded = activeReminder !== null && activeReminder !== dueId ? markAcknowledged(s, activeReminder, now) : s;
      return markAnnounced(superseded, dueId, now);
    });
    setActiveReminder(dueId);
    speech.speak(due.spokenText || t('myDay.reminderTitle', { title: due.title }), profile.language);
  }, [now, steps, reminderState, activeReminder, profile.language, t]);

  const thanks = () => {
    if (activeReminder === null) return;
    setReminderState((s) => markAcknowledged(s, activeReminder, now));
    void acknowledge('reminder', activeReminder);
    setActiveReminder(null);
    speech.stop();
  };

  // The banner stays until "Thank you", or quietly goes when the step is long past or removed.
  const activeStep = activeReminder !== null ? steps.find((s) => s.id === activeReminder) : undefined;
  const reminderStep = activeStep && !isStale(activeStep, now) ? activeStep : undefined;
  useEffect(() => {
    if (activeReminder !== null && !reminderStep) setActiveReminder(null);
  }, [activeReminder, reminderStep]);

  // Hidden corner: hold for two seconds.
  const pressTimer = useRef<number | null>(null);
  const startPress = () => {
    cancelPress();
    pressTimer.current = window.setTimeout(() => {
      pressTimer.current = null;
      speech.stop();
      onEnterCarer();
    }, LONG_PRESS_MS);
  };
  const cancelPress = () => {
    if (pressTimer.current !== null) {
      window.clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  };

  const openQuestionAndSpeak = (q: FrequentQuestion) => {
    speech.warmUp();
    setOpenQuestion(q);
    void acknowledge('question', q.id ?? null);
  };

  let content;
  if (screen === 'people' && openContact) {
    content = (
      <PersonCard
        contact={openContact}
        language={profile.language}
        onBack={() => setOpenContact(null)}
        onBackToToday={goToday}
      />
    );
  } else if (screen === 'people') {
    content = <People contacts={contacts} onOpen={setOpenContact} onBackToToday={goToday} />;
  } else if (screen === 'myDay') {
    content = <MyDay steps={steps} language={profile.language} now={now} onBackToToday={goToday} />;
  } else if (screen === 'questions' && openQuestion) {
    content = (
      <Answer
        question={openQuestion}
        profile={profile}
        steps={steps}
        events={events}
        now={now}
        onBack={() => setOpenQuestion(null)}
        onBackToToday={goToday}
      />
    );
  } else if (screen === 'questions') {
    content = <Questions questions={questions} onOpen={openQuestionAndSpeak} onBackToToday={goToday} />;
  } else if (screen === 'myLife') {
    content = <MyLife memories={memories} language={profile.language} onBackToToday={goToday} />;
  } else if (screen === 'help') {
    content = <Help profile={profile} contacts={contacts} onBackToToday={goToday} />;
  } else {
    content = <Today profile={profile} steps={steps} events={events} now={now} onNavigate={setScreen} />;
  }

  return (
    <CalmFallback onBackToToday={goToday}>
      {reminderStep ? (
        <div style={{ padding: '1rem var(--gap) 0' }}>
          <ReminderBanner step={reminderStep} language={profile.language} onThanks={thanks} />
        </div>
      ) : null}
      {content}
      <button
        type="button"
        className="corner-entry"
        aria-label={t('carer.enterTitle')}
        title={t('carer.enterHint')}
        onPointerDown={startPress}
        onPointerUp={cancelPress}
        onPointerLeave={cancelPress}
        onPointerCancel={cancelPress}
        onContextMenu={(e) => e.preventDefault()}
        data-testid="carer-entry"
      >
        ·
      </button>
    </CalmFallback>
  );
}
