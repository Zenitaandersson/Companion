import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BigButton } from '../../design/BigButton';
import { Screen } from '../../design/Screen';
import { acknowledge } from '../../data/db';
import type { Contact, Profile } from '../../data/types';
import { captureLocation } from '../../services/location';
import { speech } from '../../services/speech';
import { callHref } from './call';

interface Props {
  profile: Profile;
  contacts: Contact[];
  onBackToToday: () => void;
}

/** One big call button and one kind message. Location is shared only if the carer allowed it. */
export function Help({ profile, contacts, onBackToToday }: Props) {
  const { t } = useTranslation();
  const [shared, setShared] = useState(false);
  const primary = contacts.find((c) => c.id === profile.primaryContactId) ?? contacts[0];
  const href = primary ? callHref(primary) : null;
  const reassurance = profile.reassuranceText || t('help.defaultReassurance');

  const onHelpPressed = () => {
    void acknowledge('help', primary?.id ?? null);
    if (profile.shareLocationOnHelp) {
      void captureLocation().then((loc) => {
        if (loc) setShared(true);
      });
    }
  };

  const reassure = () => {
    speech.say(reassurance, profile.reassuranceAudio, profile.language);
  };

  return (
    <Screen title={t('help.title')} onBackToToday={onBackToToday} center>
      {href && primary ? (
        <a
          className="big-button big-button--help"
          href={href}
          onClick={onHelpPressed}
          data-testid="help-call"
        >
          <span className="big-button__icon" aria-hidden="true">
            📞
          </span>
          <span>{t('help.callPrimary', { name: primary.firstName })}</span>
        </a>
      ) : (
        <p className="big-text muted" style={{ textAlign: 'center' }}>
          {t('help.callNobody')}
        </p>
      )}
      <BigButton icon="🔊" tall onClick={reassure}>
        {t('help.reassure')}
      </BigButton>
      {shared ? <p className="muted" style={{ textAlign: 'center' }}>{t('help.locationShared')}</p> : null}
    </Screen>
  );
}
