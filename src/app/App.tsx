import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { setLanguage } from '../i18n';
import { getProfile } from '../data/db';
import { useProfile } from './useLiveData';
import { PersonRoot } from '../features/person/PersonRoot';
import { CarerRoot } from '../features/carer/CarerRoot';

type Mode = 'person' | 'carer';

/**
 * Root of the app. Person mode is the default; Carer mode is entered from the hidden
 * corner control and left with an explicit Close button.
 */
export function App() {
  const profile = useProfile();
  const [mode, setMode] = useState<Mode>('person');
  const { t } = useTranslation();

  // Create the profile row on first launch. Live queries must not write, so this happens here.
  useEffect(() => {
    void getProfile();
  }, []);

  useEffect(() => {
    if (profile) void setLanguage(profile.language);
  }, [profile?.language]);

  if (!profile) {
    return (
      <main className="screen screen__body--center" aria-busy="true">
        <p className="lead" style={{ textAlign: 'center' }}>
          {t('common.loading')}
        </p>
      </main>
    );
  }

  if (mode === 'carer') {
    return <CarerRoot profile={profile} onClose={() => setMode('person')} />;
  }

  return <PersonRoot profile={profile} onEnterCarer={() => setMode('carer')} />;
}
