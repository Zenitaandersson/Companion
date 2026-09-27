import { useTranslation } from 'react-i18next';
import { BigButton } from '../../design/BigButton';
import { Screen } from '../../design/Screen';
import type { PlannedEvent, Profile, RoutineStep } from '../../data/types';
import { nextThingText } from '../../services/dynamicText';
import { speech } from '../../services/speech';
import { clockTime, fullDateLine, timeOfDay, weekdayName } from '../../services/timeWords';
import type { PersonScreen } from './PersonRoot';

interface Props {
  profile: Profile;
  steps: RoutineStep[];
  events: PlannedEvent[];
  now: Date;
  onNavigate: (screen: PersonScreen) => void;
}

/** The calm home screen: who, when, where, and what comes next. */
export function Today({ profile, steps, events, now, onNavigate }: Props) {
  const { t } = useTranslation();
  const language = profile.language;
  const ctx = { profile, steps, events, now, language };

  const day = weekdayName(now, language);
  const tod = t(`timeOfDay.${timeOfDay(now)}`);
  const time = clockTime(now, language);
  const next = nextThingText(ctx);

  const greeting = profile.name ? t('today.greeting', { name: profile.name }) : t('today.greetingNoName');
  const dayLine = t('today.dayLine', { day, timeOfDay: tod });
  const whereLine = profile.homeLabel ? t('today.whereLine', { home: profile.homeLabel }) : '';
  const nextLine = t('today.nextLine', { text: next });

  const speakAll = () => {
    speech.speak(
      [greeting + '.', dayLine, t('today.timeLine', { time }), whereLine, nextLine].join(' '),
      language,
    );
  };

  const go = (screen: PersonScreen) => () => {
    speech.warmUp();
    onNavigate(screen);
  };

  return (
    <Screen
      isToday
      title={t('common.today')}
      onBackToToday={() => window.scrollTo({ top: 0 })}
      headerAction={
        <BigButton variant="quiet" icon="🔊" onClick={speakAll} aria-label={t('common.readAloud')}>
          {t('common.readAloud')}
        </BigButton>
      }
    >
      <section className="card stack" aria-label={t('common.today')} data-testid="today-card">
        <p className="lead">{greeting}</p>
        <p className="big-text">
          <strong>{fullDateLine(now, language)}</strong>
        </p>
        <p className="big-text">{dayLine}</p>
        <p className="big-text">{t('today.timeLine', { time })}</p>
        {whereLine ? <p className="big-text">{whereLine}</p> : null}
        <p className="big-text">{nextLine}</p>
      </section>

      <BigButton icon="👥" onClick={go('people')}>
        {t('today.nav.people')}
      </BigButton>
      <BigButton icon="📅" onClick={go('myDay')}>
        {t('today.nav.myDay')}
      </BigButton>
      <BigButton icon="❓" onClick={go('questions')}>
        {t('today.nav.questions')}
      </BigButton>
      <BigButton icon="📖" onClick={go('myLife')}>
        {t('today.nav.myLife')}
      </BigButton>
      <BigButton icon="🤍" onClick={go('help')} variant="help" style={{ minHeight: 'var(--tap)', fontSize: '1.1em' }}>
        {t('today.nav.help')}
      </BigButton>
    </Screen>
  );
}
