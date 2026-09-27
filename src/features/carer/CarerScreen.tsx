import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  title: string;
  onBack?: () => void;
  onClose: () => void;
  children: ReactNode;
}

/** Carer-mode layout: sticky header with Back and Close, scrolling form body. */
export function CarerScreen({ title, onBack, onClose, children }: Props) {
  const { t } = useTranslation();
  return (
    <div className="carer fade-in">
      <header className="carer__header">
        {onBack ? (
          <button type="button" className="carer-button carer-button--small" onClick={onBack}>
            ← {t('carer.backToList')}
          </button>
        ) : null}
        <h1 className="carer__title">{title}</h1>
        <button
          type="button"
          className="carer-button carer-button--small"
          onClick={onClose}
          aria-label={t('carer.close')}
          data-testid="carer-close"
        >
          ✕
        </button>
      </header>
      <div className="carer__body">{children}</div>
    </div>
  );
}
