import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { config } from '../config';
import { setMockLocale } from '../api/mockStore';
import ar from './ar.json';
import en from './en.json';

export type AppLocale = 'ar' | 'en';

export function readStoredLocale(): AppLocale {
  const stored = window.localStorage.getItem(config.localeKey);
  return stored === 'en' ? 'en' : 'ar';
}

export function applyDocumentLocale(locale: AppLocale): void {
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = locale;
  document.documentElement.dir = dir;
  document.body.dir = dir;
}

export function persistLocale(locale: AppLocale): void {
  window.localStorage.setItem(config.localeKey, locale);
  applyDocumentLocale(locale);
  setMockLocale(locale);
}

const initial = typeof window === 'undefined' ? 'ar' : readStoredLocale();
if (typeof window !== 'undefined') {
  applyDocumentLocale(initial);
  setMockLocale(initial);
}

void i18n.use(initReactI18next).init({
  resources: {
    ar: { translation: ar },
    en: { translation: en },
  },
  lng: initial,
  fallbackLng: 'ar',
  interpolation: { escapeValue: false },
});

export default i18n;
