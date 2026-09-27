import { useTranslation } from 'react-i18next';
import type { CarerPage } from './CarerRoot';
import { CarerButton } from './fields';

interface Props {
  onOpen: (page: CarerPage) => void;
  onClose: () => void;
}

const ITEMS: { page: CarerPage; icon: string; key: string }[] = [
  { page: 'person', icon: '🙂', key: 'person' },
  { page: 'people', icon: '👥', key: 'people' },
  { page: 'routine', icon: '📅', key: 'routine' },
  { page: 'events', icon: '🗓', key: 'events' },
  { page: 'questions', icon: '❓', key: 'questions' },
  { page: 'memories', icon: '📖', key: 'memories' },
  { page: 'help', icon: '🤍', key: 'help' },
  { page: 'summary', icon: '📋', key: 'summary' },
  { page: 'install', icon: '📲', key: 'install' },
];

/** Carer landing page: one card per section. */
export function CarerHome({ onOpen, onClose }: Props) {
  const { t } = useTranslation();
  return (
    <>
      <p className="field__hint">{t('carer.home.intro')}</p>
      {ITEMS.map((item) => (
        <button key={item.page} type="button" className="menu-card" onClick={() => onOpen(item.page)}>
          <span className="menu-card__icon" aria-hidden="true">
            {item.icon}
          </span>
          <span className="menu-card__text">
            <span className="menu-card__title">{t(`carer.home.${item.key}`)}</span>
            <span className="menu-card__hint">{t(`carer.home.${item.key}Hint`)}</span>
          </span>
          <span aria-hidden="true">›</span>
        </button>
      ))}
      <CarerButton variant="primary" block onClick={onClose}>
        {t('carer.home.preview')}
      </CarerButton>
    </>
  );
}
