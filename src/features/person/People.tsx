import { useTranslation } from 'react-i18next';
import { Screen } from '../../design/Screen';
import type { Contact } from '../../data/types';
import { BlobImage } from './BlobImage';

interface Props {
  contacts: Contact[];
  onOpen: (contact: Contact) => void;
  onBackToToday: () => void;
}

/** Photo cards of family and carers. One tap opens a card. */
export function People({ contacts, onOpen, onBackToToday }: Props) {
  const { t } = useTranslation();
  return (
    <Screen title={t('people.title')} onBackToToday={onBackToToday}>
      {contacts.length === 0 ? (
        <p className="big-text muted">{t('people.empty')}</p>
      ) : (
        <div className="people-grid">
          {contacts.map((c) => (
            <button
              key={c.id}
              type="button"
              className="people-card"
              onClick={() => onOpen(c)}
              aria-label={`${c.firstName}. ${t('people.yourRelationship', { relationship: c.relationship })}`}
            >
              <BlobImage blob={c.photo} alt="" fallback={c.firstName.slice(0, 1)} />
              <span className="people-card__name">{c.firstName}</span>
              <span className="muted" style={{ fontSize: '0.85em' }}>
                {c.relationship}
              </span>
            </button>
          ))}
        </div>
      )}
    </Screen>
  );
}
