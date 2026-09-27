import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { updateProfile } from '../../data/db';
import type { Profile } from '../../data/types';
import { hashPin, verifyPin } from '../../services/pin';
import { CarerHome } from './CarerHome';
import { CarerScreen } from './CarerScreen';
import { EventsEditor } from './EventsEditor';
import { HelpEditor } from './HelpEditor';
import { Install } from './Install';
import { MemoriesEditor } from './MemoriesEditor';
import { Onboarding } from './Onboarding';
import { PeopleEditor } from './PeopleEditor';
import { PersonEditor } from './PersonEditor';
import { PinPad } from './PinPad';
import { QuestionsEditor } from './QuestionsEditor';
import { RoutineEditor } from './RoutineEditor';
import { Summary } from './Summary';

export type CarerPage =
  | 'home'
  | 'onboarding'
  | 'person'
  | 'people'
  | 'routine'
  | 'events'
  | 'questions'
  | 'memories'
  | 'help'
  | 'summary'
  | 'install';

interface Props {
  profile: Profile;
  onClose: () => void;
}

type Gate = 'locked' | 'setting' | 'confirming' | 'open';

/** Carer mode: PIN gate, then onboarding on first use, then the settings pages. */
export function CarerRoot({ profile, onClose }: Props) {
  const { t } = useTranslation();
  const [gate, setGate] = useState<Gate>(profile.carerPinHash ? 'locked' : 'setting');
  const [firstPin, setFirstPin] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<CarerPage>(profile.onboardingDone ? 'home' : 'onboarding');
  const [changingPin, setChangingPin] = useState(false);

  const onPin = useCallback(
    async (pin: string) => {
      setError(null);
      if (gate === 'locked') {
        if (profile.carerPinHash && (await verifyPin(pin, profile.carerPinHash))) setGate('open');
        else setError(t('carer.pinWrong'));
      } else if (gate === 'setting') {
        setFirstPin(pin);
        setGate('confirming');
      } else if (gate === 'confirming') {
        if (pin === firstPin) {
          await updateProfile({ carerPinHash: await hashPin(pin) });
          setFirstPin(null);
          setChangingPin(false);
          setGate('open');
        } else {
          setFirstPin(null);
          setGate('setting');
          setError(t('carer.pinMismatch'));
        }
      }
    },
    [gate, firstPin, profile.carerPinHash, t],
  );

  if (gate !== 'open') {
    const title =
      gate === 'locked' ? t('carer.pinTitle') : gate === 'setting' ? t('carer.pinSetTitle') : t('carer.pinConfirmTitle');
    return (
      <PinPad
        title={title}
        error={error}
        onComplete={(pin) => void onPin(pin)}
        onCancel={() => {
          if (changingPin) {
            setChangingPin(false);
            setGate('open');
          } else onClose();
        }}
      />
    );
  }

  const startChangePin = () => {
    setChangingPin(true);
    setFirstPin(null);
    setError(null);
    setGate('setting');
  };

  const back = () => setPage('home');

  if (page === 'onboarding') {
    return (
      <CarerScreen title={t('carer.onboarding.title')} onClose={onClose}>
        <Onboarding profile={profile} onFinish={() => setPage('home')} />
      </CarerScreen>
    );
  }

  if (page === 'home') {
    return (
      <CarerScreen title={t('carer.home.title')} onClose={onClose}>
        <CarerHome onOpen={setPage} onClose={onClose} />
      </CarerScreen>
    );
  }

  const titles: Record<Exclude<CarerPage, 'home' | 'onboarding'>, string> = {
    person: t('carer.person.title'),
    people: t('carer.people.title'),
    routine: t('carer.routine.title'),
    events: t('carer.events.title'),
    questions: t('carer.questions.title'),
    memories: t('carer.memories.title'),
    help: t('carer.help.title'),
    summary: t('carer.summary.title'),
    install: t('carer.install.title'),
  };

  return (
    <CarerScreen title={titles[page]} onBack={back} onClose={onClose}>
      {page === 'person' ? <PersonEditor profile={profile} onChangePin={startChangePin} /> : null}
      {page === 'people' ? <PeopleEditor profile={profile} /> : null}
      {page === 'routine' ? <RoutineEditor profile={profile} /> : null}
      {page === 'events' ? <EventsEditor profile={profile} /> : null}
      {page === 'questions' ? <QuestionsEditor profile={profile} /> : null}
      {page === 'memories' ? <MemoriesEditor /> : null}
      {page === 'help' ? <HelpEditor profile={profile} /> : null}
      {page === 'summary' ? <Summary profile={profile} /> : null}
      {page === 'install' ? <Install /> : null}
    </CarerScreen>
  );
}
