import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { BigButton } from './BigButton';

interface ScreenProps {
  title?: string;
  /** Optional element shown at the right of the header, e.g. a Read aloud button. */
  headerAction?: ReactNode;
  children: ReactNode;
  center?: boolean;
  onBackToToday: () => void;
  /** On the Today screen the bar is still shown, for consistency, but marked as current. */
  isToday?: boolean;
}

/**
 * The single layout used by every Person-mode screen:
 * header, body, and a fixed "Back to Today" bar in the same position everywhere.
 */
export function Screen({
  title,
  headerAction,
  children,
  center,
  onBackToToday,
  isToday,
}: ScreenProps) {
  const { t } = useTranslation();
  return (
    <main className="screen fade-in">
      {title || headerAction ? (
        <header className="screen__header">
          {title ? <h1 className="screen__title">{title}</h1> : <span />}
          {headerAction}
        </header>
      ) : null}
      <div className={center ? 'screen__body screen__body--center' : 'screen__body'}>{children}</div>
      <nav className="bottom-bar" aria-label={t('common.today')}>
        <BigButton
          icon="☀️"
          variant={isToday ? 'quiet' : 'primary'}
          onClick={onBackToToday}
          aria-current={isToday ? 'page' : undefined}
          data-testid="back-to-today"
        >
          {isToday ? t('common.today') : t('common.backToToday')}
        </BigButton>
      </nav>
    </main>
  );
}
