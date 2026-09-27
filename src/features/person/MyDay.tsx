import { useTranslation } from 'react-i18next';
import { BigButton } from '../../design/BigButton';
import { Screen } from '../../design/Screen';
import type { Language, RoutineStep } from '../../data/types';
import { stepPhases } from '../../services/schedule';
import { speech } from '../../services/speech';
import { formatHHMM } from '../../services/timeWords';

interface Props {
  steps: RoutineStep[];
  language: Language;
  now: Date;
  onBackToToday: () => void;
}

/** The day as a simple sequence. The current step is highlighted, earlier steps are dimmed. */
export function MyDay({ steps, language, now, onBackToToday }: Props) {
  const { t } = useTranslation();
  const phases = stepPhases(steps, now);
  const current = phases.find((p) => p.phase === 'now');
  const next = phases.find((p) => p.phase === 'later');

  const speak = () => {
    const parts = [t('myDay.spokenIntro')];
    if (current) parts.push(t('myDay.spokenNow', { title: current.step.title }));
    if (next)
      parts.push(
        t('myDay.spokenNext', { title: next.step.title, time: formatHHMM(next.step.time, language) }),
      );
    speech.speak(parts.join(' '), language);
  };

  return (
    <Screen
      title={t('myDay.title')}
      onBackToToday={onBackToToday}
      headerAction={
        <BigButton variant="quiet" icon="🔊" onClick={speak}>
          {t('common.readAloud')}
        </BigButton>
      }
    >
      {phases.length === 0 ? (
        <p className="big-text muted">{t('myDay.empty')}</p>
      ) : (
        <ol className="stack" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {phases.map(({ step, phase }) => (
            <li
              key={step.id}
              className={`card step ${phase === 'now' ? 'card--highlight' : ''} ${phase === 'done' ? 'card--dim' : ''}`}
              aria-current={phase === 'now' ? 'step' : undefined}
            >
              <span className="step__icon" aria-hidden="true">
                {step.icon}
              </span>
              <span className="step__time">{formatHHMM(step.time, language)}</span>
              <span className="step__title">
                {step.title}
                {phase === 'now' ? (
                  <>
                    <br />
                    <span className="step__tag">{t('myDay.now')}</span>
                  </>
                ) : null}
              </span>
            </li>
          ))}
        </ol>
      )}
    </Screen>
  );
}
