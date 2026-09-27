import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';
import sv from './sv.json';
import type { Language } from '../data/types';

/** Locale tags used for Intl date and time formatting. */
export const LOCALE_TAGS: Record<Language, string> = {
  en: 'en-GB',
  sv: 'sv-SE',
};

/** BCP-47 tags handed to speech synthesis. */
export const SPEECH_TAGS: Record<Language, string> = {
  en: 'en-GB',
  sv: 'sv-SE',
};

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    sv: { translation: sv },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  returnNull: false,
});

/** Switches the UI language and the document language attribute. */
export async function setLanguage(language: Language): Promise<void> {
  await i18n.changeLanguage(language);
  document.documentElement.lang = language;
}

export default i18n;
