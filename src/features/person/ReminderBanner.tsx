import { useTranslation } from 'react-i18next';
import { BigButton } from '../../design/BigButton';
import type { Language, RoutineStep } from '../../data/types';
import { speech } from '../../services/speech';

interface Props {
  step: RoutineStep;
  language: Language;
  onThanks: () => void;
}

/** Calm reminder shown at the top of any Person-mode screen. Never says "missed" or "overdue". */
export function ReminderBanner({ step, language, onThanks }: Props) {
  const { t } = useTranslation();
  const text = step.spokenText || t('myDay.reminderTitle', { title: step.title });
  return (
    <section className="reminder fade-in" role="status" aria-live="polite" data-testid="reminder">
      <p className="big-text" style={{ margin: 0 }}>
        <span aria-hidden="true">{step.icon} </span>
        {text}
      </p>
      <div className="row">
        <BigButton variant="quiet" icon="🔊" onClick={() => speech.speak(text, language)}>
          {t('reminder.speak')}
        </BigButton>
        <BigButton variant="primary" onClick={onThanks}>
          {t('reminder.thanks')}
        </BigButton>
      </div>
    </section>
  );
}
