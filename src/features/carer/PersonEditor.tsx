import { useTranslation } from 'react-i18next';
import { updateProfile } from '../../data/db';
import type { Language, Profile } from '../../data/types';
import { CarerButton, Field } from './fields';
import { useDraft } from './useDraft';

interface Props {
  profile: Profile;
  onChangePin?: () => void;
}

/** Name, home label and language. Text saves shortly after typing stops. */
export function PersonEditor({ profile, onChangePin }: Props) {
  const { t } = useTranslation();
  const [name, setName] = useDraft(profile.name, (v) => void updateProfile({ name: v.trim() }));
  const [home, setHome] = useDraft(profile.homeLabel, (v) => void updateProfile({ homeLabel: v.trim() }));

  return (
    <>
      <Field label={t('carer.person.name')} htmlFor="person-name">
        <input
          id="person-name"
          type="text"
          value={name}
          placeholder={t('carer.person.namePlaceholder')}
          autoComplete="off"
          onChange={(e) => setName(e.target.value)}
        />
      </Field>
      <Field label={t('carer.person.homeLabel')} hint={t('carer.person.homeLabelHint')} htmlFor="person-home">
        <input
          id="person-home"
          type="text"
          value={home}
          placeholder={t('carer.person.homeLabelPlaceholder')}
          autoComplete="off"
          onChange={(e) => setHome(e.target.value)}
        />
      </Field>
      <Field label={t('carer.person.language')} htmlFor="person-language">
        <select
          id="person-language"
          value={profile.language}
          onChange={(e) => void updateProfile({ language: e.target.value as Language })}
        >
          <option value="en">{t('carer.person.english')}</option>
          <option value="sv">{t('carer.person.swedish')}</option>
        </select>
      </Field>
      <p className="field__hint">{t('carer.person.textSizeNote')}</p>
      {onChangePin ? <CarerButton onClick={onChangePin}>{t('carer.person.changePin')}</CarerButton> : null}
    </>
  );
}
