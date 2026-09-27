import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { updateProfile } from '../../data/db';
import type { Profile } from '../../data/types';
import { CarerButton } from './fields';
import { HelpEditor } from './HelpEditor';
import { MemoriesEditor } from './MemoriesEditor';
import { PeopleEditor } from './PeopleEditor';
import { PersonEditor } from './PersonEditor';
import { QuestionsEditor } from './QuestionsEditor';
import { RoutineEditor } from './RoutineEditor';

interface Props {
  profile: Profile;
  onFinish: () => void;
}

const STEPS = ['person', 'people', 'routine', 'questions', 'memories', 'help'] as const;

/** Six optional steps through the same editors used elsewhere. Finishing marks onboarding done. */
export function Onboarding({ profile, onFinish }: Props) {
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);
  const step = STEPS[index];
  const last = index === STEPS.length - 1;

  const advance = async () => {
    if (last) {
      await updateProfile({ onboardingDone: true });
      onFinish();
    } else {
      setIndex(index + 1);
      window.scrollTo({ top: 0 });
    }
  };

  return (
    <>
      <p className="wizard-steps">{t('carer.onboarding.stepOf', { current: index + 1, total: STEPS.length })}</p>
      <h2 className="carer__title">{t(`carer.home.${step}`)}</h2>
      {index === 0 ? <p className="field__hint">{t('carer.onboarding.intro')}</p> : null}

      {step === 'person' ? <PersonEditor profile={profile} /> : null}
      {step === 'people' ? <PeopleEditor profile={profile} /> : null}
      {step === 'routine' ? <RoutineEditor profile={profile} /> : null}
      {step === 'questions' ? <QuestionsEditor profile={profile} /> : null}
      {step === 'memories' ? <MemoriesEditor /> : null}
      {step === 'help' ? <HelpEditor profile={profile} /> : null}

      <div className="chips" style={{ marginTop: '1rem' }}>
        {index > 0 ? <CarerButton onClick={() => setIndex(index - 1)}>← {t('carer.backToList')}</CarerButton> : null}
        <CarerButton variant="primary" onClick={() => void advance()}>
          {last ? t('carer.onboarding.finish') : `${t('common.next')} →`}
        </CarerButton>
        {!last ? <CarerButton onClick={() => void advance()}>{t('carer.onboarding.skip')}</CarerButton> : null}
      </div>
    </>
  );
}
