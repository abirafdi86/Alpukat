import { computed } from 'vue'
import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'
import { i18n, LOCALE_STORAGE_KEY, type Locale } from '@/i18n'
import type { AppSettings, UserPreferences } from '@/types/settings'

function cloneSettings(value: AppSettings): AppSettings { return JSON.parse(JSON.stringify(value)) as AppSettings }

export const defaultPreferences: UserPreferences = { language: 'en', dateFormat: 'DD MMM YYYY', weightUnit: 'kg', areaUnit: 'ha', theme: 'light' }
export const defaultSettings: AppSettings = {
  profile: { photo: '', fullName: 'Abi', email: 'abi@example.com', phone: '081234567890' },
  preferences: { ...defaultPreferences, language: i18n.global.locale.value as Locale },
  farm: { defaultFarmId: 'FRM-001', defaultVariety: 'Hass', lowStockThresholdKg: 50, grades: [
    { id: 'gradeA', descriptionId: 'Kualitas terbaik, ukuran dan kondisi buah memenuhi standar utama.', descriptionEn: 'Premium quality meeting the primary size and condition standards.' },
    { id: 'gradeB', descriptionId: 'Kualitas baik dengan sedikit variasi ukuran atau tampilan.', descriptionEn: 'Good quality with minor size or appearance variation.' },
    { id: 'gradeC', descriptionId: 'Kualitas layak jual untuk pengolahan atau pasar sekunder.', descriptionEn: 'Sellable quality for processing or secondary markets.' },
    { id: 'rejected', descriptionId: 'Tidak memenuhi standar penjualan.', descriptionEn: 'Does not meet the selling standard.' },
  ] },
  sales: { currency: 'IDR', defaultPaymentMethod: 'Bank Transfer', defaultPaymentStatus: 'Unpaid', defaultDeliveryMethod: 'Customer Pickup', invoicePrefix: 'INV', defaultInvoiceNotesId: 'Terima kasih telah membeli produk alpukat dari kebun kami.', defaultInvoiceNotesEn: 'Thank you for purchasing avocado products from our farm.' },
  notifications: { activityDue: true, activityOverdue: true, activityCompleted: false, harvestRecorded: true, harvestTarget: true, salesStockLow: true, inventoryStockLow: true, stockOut: true, saleRecorded: true, paymentReceived: true, paymentOutstanding: true, orderStatusChanged: true },
}

export const useSettingsStore = defineStore('settings', () => {
  const settings = useStorage<AppSettings>('afms:settings', defaultSettings, localStorage, { mergeDefaults: true })
  const language = computed(() => i18n.global.locale.value as Locale)
  function applyLanguage(locale: Locale) { i18n.global.locale.value = locale; settings.value.preferences.language = locale; localStorage.setItem(LOCALE_STORAGE_KEY, locale); document.documentElement.lang = locale }
  function save(next: AppSettings) { settings.value = cloneSettings(next); applyLanguage(next.preferences.language) }
  function resetPreferences() { settings.value.preferences = { ...defaultPreferences, language: language.value }; return cloneSettings(settings.value) }
  return { settings, language, save, applyLanguage, resetPreferences }
})
