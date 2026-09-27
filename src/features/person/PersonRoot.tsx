import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CalmFallback } from '../../design/CalmFallback';
import { acknowledge } from '../../data/db';
import type { Contact, FrequentQuestion, Profile } from '../../data/types';
import {
  EMPTY_REMINDER_STATE,
  dueReminder,
  markAcknowledged,
  markAnnounced,
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
  const [reminderState, setReminderState] = useState<ReminderState>(EMPTY_REMINDER_STATE);
  const [activeReminder, setActiveReminder] = useState<number | null>(null);

  const goToday = useCallback(() => {
    speech.stop();
    setOpenContact(null);
    setOpenQuestion(null);
    setScreen('today');
    window.scrollTo({ top: 0 });
  }, []);

  // Reminder engine: check every tick whether a step is due.
  useEffect(() => {
    if (activeReminder !== null) return;
    const due = dueReminder(steps, reminderState, now);
    if (due && due.id !== undefined) {
      setActiveReminder(due.id);
      setReminderState((s) => markAnnounced(s, due.id as number, now));
      speech.speak(due.spokenText || t('myDay.reminderTitle', { title: due.title }), profile.language);
    }
  }, [now, steps, reminderState, activeReminder, profile.language, t]);

  const thanks = () => {
    if (activeReminder === null) return;
    setReminderState((s) => markAcknowledged(s, activeReminder, now));
    void acknowledge('reminder', activeReminder);
    setActiveReminder(null);
    speech.stop();
  };

  // Repeats: once the repeat interval passes, hide the banner so the engine can announce again.
  useEffect(() => {
    if (activeReminder === null) return;
    const step = steps.find((s) => s.id === activeReminder);
    if (!step) {
      setActiveReminder(null);
      return;
    }
    const record = reminderState.announced[activeReminder];
    if (!record) return;
    const ageMinutes = (now.getTime() - record.lastAt) / 60000;
    if (step.repeatMinutes > 0 && ageMinutes >= step.repeatMinutes && record.count < 3) {
      setActiveReminder(null);
    }
  }, [now, steps, activeReminder, reminderState]);

  const reminderStep = activeReminder !== null ? steps.find((s) => s.id === activeReminder) : undefined;

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
