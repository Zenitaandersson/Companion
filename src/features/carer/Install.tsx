import { useTranslation } from 'react-i18next';

/** Plain instructions for putting Companion on the home screen. */
export function Install() {
  const { t } = useTranslation();
  return (
    <>
      <p>{t('carer.install.iphone')}</p>
      <p>{t('carer.install.android')}</p>
      <p>{t('carer.install.after')}</p>
      <p>{t('carer.install.sameApp')}</p>
      <p>{t('carer.install.entry')}</p>
      <p className="field__hint">{t('carer.install.textSize')}</p>
      <p className="field__hint" style={{ overflowWrap: 'anywhere' }}>
        {window.location.origin}
        {window.location.pathname}
      </p>
    </>
  );
}
