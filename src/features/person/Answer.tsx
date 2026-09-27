import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { BigButton } from '../../design/BigButton';
import { Screen } from '../../design/Screen';
import type { FrequentQuestion, PlannedEvent, Profile, RoutineStep } from '../../data/types';
import { fillTemplate, hasPlaceholders } from '../../services/dynamicText';
import { speech } from '../../services/speech';

interface Props {
  question: FrequentQuestion;
  profile: Profile;
  steps: RoutineStep[];
  events: PlannedEvent[];
  now: Date;
  onBack: () => void;
  onBackToToday: () => void;
}

/**
 * Shows and speaks the carer's answer. Dynamic parts fill in automatically.
 * A recording is used only when the answer has no dynamic parts, so it never goes stale.
 */
export function Answer({ question, profile, steps, events, now, onBack, onBackToToday }: Props) {
  const { t } = useTranslation();
  const language = profile.language;
  const text = useMemo(
    () => fillTemplate(question.answer, { profile, steps, events, now, language }),
    [question.answer, profile, steps, events, now, language],
  );
  const audio = hasPlaceholders(question.answer) ? null : question.answerAudio;

  const say = () => speech.say(text, audio, language);

  // Speak once when the answer opens.
  useEffect(() => {
    speech.say(text, audio, language);
    return () => speech.stop();
  }, [question.id]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Screen title={t('questions.title')} onBackToToday={onBackToToday}>
      <p className="big-text muted">{question.question}</p>
      <p className="lead" data-testid="answer-text">
        {text}
      </p>
      <BigButton icon="🔊" onClick={say}>
        {t('common.hearAgain')}
      </BigButton>
      <BigButton variant="quiet" icon="←" onClick={onBack}>
        {t('questions.title')}
      </BigButton>
    </Screen>
  );
}
