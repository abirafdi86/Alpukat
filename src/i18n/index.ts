import { createI18n } from 'vue-i18n'
import id from './locales/id.json'
import en from './locales/en.json'

export const LOCALE_STORAGE_KEY = 'afms_locale'
export const supportedLocales = ['id', 'en'] as const
export type Locale = (typeof supportedLocales)[number]

function getInitialLocale(): Locale {
  const saved = localStorage.getItem(LOCALE_STORAGE_KEY)
  return saved === 'en' || saved === 'id' ? saved : 'id'
}

export const i18n = createI18n({
  legacy: false,
  locale: getInitialLocale(),
  fallbackLocale: 'en',
  messages: { id, en },
  datetimeFormats: {
    id: { short: { day: '2-digit', month: 'short', year: 'numeric' }, long: { day: 'numeric', month: 'long', year: 'numeric' } },
    en: { short: { month: 'short', day: 'numeric', year: 'numeric' }, long: { month: 'long', day: 'numeric', year: 'numeric' } },
  },
  numberFormats: {
    id: { decimal: { maximumFractionDigits: 2 }, currency: { style: 'currency', currency: 'IDR', currencyDisplay: 'symbol', maximumFractionDigits: 0 } },
    en: { decimal: { maximumFractionDigits: 2 }, currency: { style: 'currency', currency: 'IDR', currencyDisplay: 'code', maximumFractionDigits: 0 } },
  },
})

document.documentElement.lang = i18n.global.locale.value
