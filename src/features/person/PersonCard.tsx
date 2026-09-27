import { useTranslation } from 'react-i18next';
import { BigButton } from '../../design/BigButton';
import { Screen } from '../../design/Screen';
import { acknowledge } from '../../data/db';
import type { Contact, Language } from '../../data/types';
import { speech } from '../../services/speech';
import { BlobImage } from './BlobImage';
import { callHref } from './call';

interface Props {
  contact: Contact;
  language: Language;
  onBack: () => void;
  onBackToToday: () => void;
}

/** One person: face, name, relationship, one sentence, greeting and call. */
export function PersonCard({ contact, language, onBack, onBackToToday }: Props) {
  const { t } = useTranslation();
  const relationship = t('people.yourRelationship', { relationship: contact.relationship });
  const spoken = `${contact.firstName}. ${contact.sentence || relationship}`;

  const hear = () => {
    speech.say(spoken, contact.greetingAudio, language);
    void acknowledge('greeting', contact.id ?? null);
  };

  const href = callHref(contact);

  return (
    <Screen title={contact.firstName} onBackToToday={onBackToToday}>
      <BlobImage
        blob={contact.photo}
        alt={contact.firstName}
        fallback={contact.firstName.slice(0, 1)}
        className="photo--portrait"
      />
      <p className="lead">{contact.firstName}</p>
      <p className="big-text">{contact.sentence || relationship}</p>

      <BigButton icon="🔊" onClick={hear}>
        {t('common.playGreeting', { name: contact.firstName })}
      </BigButton>

      {href ? (
        <a className="big-button big-button--primary" href={href} data-testid="call-link">
          <span className="big-button__icon" aria-hidden="true">
            📞
          </span>
          <span>{t('common.call', { name: contact.firstName })}</span>
        </a>
      ) : null}

      <BigButton variant="quiet" icon="←" onClick={onBack}>
        {t('people.title')}
      </BigButton>
    </Screen>
  );
}
