import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useContacts } from '../../app/useLiveData';
import { updateProfile } from '../../data/db';
import type { Profile } from '../../data/types';
import { isLocationSupported, lastSharedLocation, requestLocationPermission } from '../../services/location';
import { Field, Toggle } from './fields';
import { RecorderControl } from './RecorderControl';
import { useDraft } from './useDraft';

interface Props {
  profile: Profile;
}

/** Who the Help button calls, the kind message, and optional location sharing. */
export function HelpEditor({ profile }: Props) {
  const { t } = useTranslation();
  const contacts = useContacts();
  const [locationResult, setLocationResult] = useState<'granted' | 'denied' | null>(null);
  const [reassurance, setReassurance] = useDraft(profile.reassuranceText, (v) => void updateProfile({ reassuranceText: v.trim() }));
  const last = lastSharedLocation();

  /** The permission prompt happens here, in carer mode. Sharing is stored only when it was granted. */
  const toggleLocation = async (on: boolean) => {
    if (!on) {
      await updateProfile({ shareLocationOnHelp: false });
      setLocationResult(null);
      return;
    }
    const ok = await requestLocationPermission();
    setLocationResult(ok ? 'granted' : 'denied');
    await updateProfile({ shareLocationOnHelp: ok });
  };

  return (
    <>
      <Field label={t('carer.help.primary')} htmlFor="h-primary">
        <select
          id="h-primary"
          value={profile.primaryContactId ?? ''}
          onChange={(e) => void updateProfile({ primaryContactId: e.target.value ? Number(e.target.value) : null })}
        >
          <option value="">{t('carer.help.nobody')}</option>
          {contacts.map((c) => (
            <option key={c.id} value={c.id}>
              {c.firstName} · {c.relationship}
            </option>
          ))}
        </select>
      </Field>

      <Field label={t('carer.help.reassurance')} hint={t('carer.help.reassuranceHint')} htmlFor="h-text">
        <textarea
          id="h-text"
          value={reassurance}
          placeholder={t('help.defaultReassurance')}
          onChange={(e) => setReassurance(e.target.value)}
        />
      </Field>
      <RecorderControl
        label={t('carer.help.recordReassurance')}
        value={profile.reassuranceAudio}
        onChange={(b) => void updateProfile({ reassuranceAudio: b })}
      />

      {isLocationSupported() ? (
        <>
          <Toggle
            label={t('carer.help.shareLocation')}
            hint={t('carer.help.shareLocationHint')}
            checked={profile.shareLocationOnHelp}
            onChange={(v) => void toggleLocation(v)}
          />
          {locationResult === 'granted' ? <p className="field__hint">{t('carer.help.locationGranted')}</p> : null}
          {locationResult === 'denied' ? <p className="notice">{t('carer.help.locationDenied')}</p> : null}
          {last ? (
            <p className="field__hint">
              <a href={`https://maps.apple.com/?ll=${last.latitude},${last.longitude}`} target="_blank" rel="noreferrer">
                {new Date(last.at).toLocaleString()} · {last.latitude.toFixed(5)}, {last.longitude.toFixed(5)}
              </a>
            </p>
          ) : null}
        </>
      ) : null}
    </>
  );
}
