import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { LOCALE_STORAGE_KEY, type Locale } from '@/i18n'

export function useLocale() {
  const { locale, t, d, n } = useI18n()
  const currentLocale = computed(() => locale.value as Locale)

  function setLocale(nextLocale: Locale) {
    locale.value = nextLocale
    localStorage.setItem(LOCALE_STORAGE_KEY, nextLocale)
    document.documentElement.lang = nextLocale
  }

  function formatDate(value: string | Date, format: 'short' | 'long' = 'short') {
    return d(typeof value === 'string' ? new Date(`${value}T12:00:00`) : value, format)
  }

  function formatNumber(value: number) { return n(value, 'decimal') }
  function formatCurrency(value: number) { return n(value, 'currency') }

  return { locale: currentLocale, t, setLocale, formatDate, formatNumber, formatCurrency }
}
