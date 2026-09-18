<script setup lang="ts">
import { computed, ref } from 'vue'
import { Boxes, CircleDollarSign, Edit3, Search, ShieldAlert, Tags } from 'lucide-vue-next'
import StatCard from '@/components/StatCard.vue'
import { UiBadge, UiButton, UiEmptyState, UiInput, UiModal, UiSelect, UiTable, UiToast } from '@/components/ui'
import type { SalesStockItem } from '@/types/sales'
import type { StatusTone } from '@/types/ui'
import { useAuthStore } from '@/stores/auth'
import { useSalesStockStore } from '@/stores/salesStock'
import { useSettingsStore } from '@/stores/settings'
import { storeToRefs } from 'pinia'
import { useLocale } from '@/composables/useLocale'

type StockStatus = 'Available' | 'Low Stock' | 'Out of Stock'
const { t, formatCurrency, formatDate, formatNumber } = useLocale()
const auth = useAuthStore()
const salesStockStore = useSalesStockStore()
const settingsStore = useSettingsStore()
const { stock, priceHistory } = storeToRefs(salesStockStore)
const search = ref(''); const varietyFilter = ref('all'); const gradeFilter = ref('all'); const statusFilter = ref('all')
const priceModalOpen = ref(false); const selectedStock = ref<SalesStockItem | null>(null); const newPrice = ref(0); const priceError = ref('')
const toast = ref<{ title: string; description: string; tone: StatusTone } | null>(null)
const canUpdatePrice = computed(() => auth.user?.role === 'OWNER')
const statusOf = (item: SalesStockItem): StockStatus => item.availableWeightKg === 0 ? 'Out of Stock' : item.availableWeightKg < settingsStore.settings.farm.lowStockThresholdKg ? 'Low Stock' : 'Available'
const statusKey = (status: StockStatus) => status === 'Available' ? 'available' : status === 'Low Stock' ? 'low' : 'out'
const statusTone: Record<StockStatus, StatusTone> = { Available: 'success', 'Low Stock': 'warning', 'Out of Stock': 'danger' }
const varietyOptions = computed(() => [{ label: t('salesStock.filters.allVarieties'), value: 'all' }, ...[...new Set(stock.value.map((item) => item.variety))].map((value) => ({ label: value, value }))])
const gradeOptions = computed(() => [{ label: t('salesStock.filters.allGrades'), value: 'all' }, ...['Grade A', 'Grade B', 'Grade C'].map((value) => ({ label: value, value }))])
const stockStatusOptions = computed(() => [{ label: t('salesStock.filters.allStatuses'), value: 'all' }, ...(['Available', 'Low Stock', 'Out of Stock'] as StockStatus[]).map((value) => ({ label: t(`salesStock.status.${statusKey(value)}`), value }))])
const filteredStock = computed(() => { const query = search.value.trim().toLowerCase(); return stock.value.filter((item) => (!query || `${item.variety} ${item.grade}`.toLowerCase().includes(query)) && (varietyFilter.value === 'all' || item.variety === varietyFilter.value) && (gradeFilter.value === 'all' || item.grade === gradeFilter.value) && (statusFilter.value === 'all' || statusOf(item) === statusFilter.value)).sort((a, b) => a.variety.localeCompare(b.variety) || a.grade.localeCompare(b.grade)) })
const summaryCards = computed(() => [
  { id: 'available', label: t('salesStock.summary.available'), value: formatNumber(stock.value.reduce((sum, item) => sum + item.availableWeightKg, 0)), unit: t('common.kg'), icon: Boxes },
  { id: 'a', label: t('salesStock.summary.gradeA'), value: formatNumber(stock.value.filter((item) => item.grade === 'Grade A').reduce((sum, item) => sum + item.availableWeightKg, 0)), unit: t('common.kg'), icon: Tags },
  { id: 'b', label: t('salesStock.summary.gradeB'), value: formatNumber(stock.value.filter((item) => item.grade === 'Grade B').reduce((sum, item) => sum + item.availableWeightKg, 0)), unit: t('common.kg'), icon: Tags },
  { id: 'c', label: t('salesStock.summary.gradeC'), value: formatNumber(stock.value.filter((item) => item.grade === 'Grade C').reduce((sum, item) => sum + item.availableWeightKg, 0)), unit: t('common.kg'), icon: Tags },
  { id: 'value', label: t('salesStock.summary.value'), value: formatCurrency(stock.value.reduce((sum, item) => sum + item.availableWeightKg * item.pricePerKg, 0)), icon: CircleDollarSign },
])
const visibleHistory = computed(() => priceHistory.value.slice().sort((a, b) => b.effectiveDate.localeCompare(a.effectiveDate)))
const stockById = (id: string) => stock.value.find((item) => item.id === id)
function openPriceModal(item: SalesStockItem) { selectedStock.value = item; newPrice.value = item.pricePerKg; priceError.value = ''; priceModalOpen.value = true }
function updatePrice() { if (!selectedStock.value || !Number.isInteger(Number(newPrice.value)) || Number(newPrice.value) <= 0) { priceError.value = t('salesStock.validation.price'); return } const updatedPrice = Math.round(Number(newPrice.value)); if (selectedStock.value.pricePerKg === updatedPrice) { priceError.value = t('salesStock.validation.changed'); return } salesStockStore.updatePrice(selectedStock.value.id, updatedPrice, auth.user?.name ?? 'OWNER'); priceModalOpen.value = false; toast.value = { title: t('salesStock.toast.title'), description: t('salesStock.toast.description', { product: `${selectedStock.value.variety} ${selectedStock.value.grade}` }), tone: 'success' }; window.setTimeout(() => { toast.value = null }, 4000) }
</script>

<template>
  <div class="@container">
    <header class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div class="max-w-3xl"><h1 class="page-title">{{ t('salesStock.title') }}</h1><p class="secondary-text mt-2">{{ t('salesStock.description') }}</p></div>
      <div v-if="!canUpdatePrice" class="flex max-w-sm items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800"><ShieldAlert :size="17" class="mt-0.5 shrink-0" />{{ t('salesStock.ownerOnly') }}</div>
    </header>

    <section class="mt-8 grid grid-cols-1 gap-4 @min-[34rem]:grid-cols-2 @min-[64rem]:grid-cols-3 @min-[86rem]:grid-cols-5" :aria-label="t('salesStock.summary.label')">
      <StatCard v-for="item in summaryCards" :key="item.id" v-bind="item" />
    </section>

    <section class="mt-10" :aria-labelledby="'sales-stock-title'">
      <div class="mb-5"><h2 id="sales-stock-title" class="section-title">{{ t('salesStock.tableTitle') }}</h2><p class="secondary-text mt-1">{{ t('salesStock.tableDescription') }}</p></div>
      <div class="ui-card mb-5 grid gap-4 p-4 sm:grid-cols-2 sm:p-5 xl:grid-cols-[minmax(15rem,1.4fr)_repeat(3,minmax(10rem,1fr))]">
        <UiInput v-model="search" :label="t('common.search')" type="search" :placeholder="t('salesStock.filters.searchPlaceholder')"><template #trailing><Search :size="17" class="text-slate-400" /></template></UiInput>
        <UiSelect v-model="varietyFilter" :label="t('salesStock.columns.variety')" :options="varietyOptions" />
        <UiSelect v-model="gradeFilter" :label="t('salesStock.columns.grade')" :options="gradeOptions" />
        <UiSelect v-model="statusFilter" :label="t('salesStock.columns.status')" :options="stockStatusOptions" />
      </div>

      <UiEmptyState v-if="!filteredStock.length" :title="t('salesStock.empty.title')" :description="t('salesStock.empty.description')" />
      <UiTable v-else class="hidden xl:block" :caption="t('salesStock.tableTitle')">
        <template #head><tr><th>{{ t('salesStock.columns.variety') }}</th><th>{{ t('salesStock.columns.grade') }}</th><th class="numeric">{{ t('salesStock.columns.available') }}</th><th class="numeric">{{ t('salesStock.columns.reserved') }}</th><th class="numeric">{{ t('salesStock.columns.sold') }}</th><th>{{ t('salesStock.columns.price') }}</th><th>{{ t('salesStock.columns.updated') }}</th><th>{{ t('salesStock.columns.status') }}</th><th><span class="sr-only">{{ t('common.actions') }}</span></th></tr></template>
        <tr v-for="item in filteredStock" :key="item.id"><td class="font-semibold text-slate-900">{{ item.variety }}</td><td><UiBadge>{{ item.grade }}</UiBadge></td><td class="numeric font-medium">{{ formatNumber(item.availableWeightKg) }} <span class="font-normal text-slate-400">{{ item.unit }}</span></td><td class="numeric">{{ formatNumber(item.reservedWeightKg) }} <span class="text-slate-400">{{ item.unit }}</span></td><td class="numeric">{{ formatNumber(item.soldWeightKg) }} <span class="text-slate-400">{{ item.unit }}</span></td><td class="whitespace-nowrap font-medium">{{ formatCurrency(item.pricePerKg) }}/{{ item.unit }}</td><td class="whitespace-nowrap">{{ formatDate(item.updatedAt) }}</td><td><UiBadge :tone="statusTone[statusOf(item)]">{{ t(`salesStock.status.${statusKey(statusOf(item))}`) }}</UiBadge></td><td><button v-if="canUpdatePrice" type="button" class="rounded-md p-2 text-green-700 hover:bg-green-50" :aria-label="t('salesStock.editPriceFor', { product: `${item.variety} ${item.grade}` })" @click="openPriceModal(item)"><Edit3 :size="16" /></button><span v-else class="text-slate-300">—</span></td></tr>
      </UiTable>

      <div v-if="filteredStock.length" class="grid gap-4 sm:grid-cols-2 xl:hidden">
        <article v-for="item in filteredStock" :key="item.id" class="ui-card overflow-hidden">
          <div class="flex items-start justify-between gap-3 border-b border-slate-100 p-4"><div><h3 class="font-semibold text-slate-900">{{ item.variety }}</h3><div class="mt-2 flex flex-wrap gap-2"><UiBadge>{{ item.grade }}</UiBadge><UiBadge :tone="statusTone[statusOf(item)]">{{ t(`salesStock.status.${statusKey(statusOf(item))}`) }}</UiBadge></div></div><button v-if="canUpdatePrice" type="button" class="rounded-lg border border-slate-200 p-2 text-green-700 hover:bg-green-50" :aria-label="t('salesStock.editPriceFor', { product: `${item.variety} ${item.grade}` })" @click="openPriceModal(item)"><Edit3 :size="17" /></button></div>
          <div class="grid grid-cols-3 divide-x divide-slate-100 px-2 py-4 text-center"><div class="px-2"><p class="text-xs text-slate-500">{{ t('salesStock.columns.available') }}</p><p class="mt-1 font-semibold text-slate-900">{{ formatNumber(item.availableWeightKg) }} kg</p></div><div class="px-2"><p class="text-xs text-slate-500">{{ t('salesStock.columns.reserved') }}</p><p class="mt-1 font-medium">{{ formatNumber(item.reservedWeightKg) }} kg</p></div><div class="px-2"><p class="text-xs text-slate-500">{{ t('salesStock.columns.sold') }}</p><p class="mt-1 font-medium">{{ formatNumber(item.soldWeightKg) }} kg</p></div></div>
          <div class="flex items-end justify-between gap-3 bg-slate-50 px-4 py-3"><div><p class="text-xs text-slate-500">{{ t('salesStock.columns.price') }}</p><p class="mt-0.5 font-semibold text-green-700">{{ formatCurrency(item.pricePerKg) }}/kg</p></div><div class="text-right"><p class="text-xs text-slate-500">{{ t('salesStock.columns.updated') }}</p><p class="mt-0.5 text-sm text-slate-700">{{ formatDate(item.updatedAt) }}</p></div></div>
        </article>
      </div>
    </section>

    <section class="mt-10" :aria-labelledby="'price-history-title'">
      <div class="mb-5"><h2 id="price-history-title" class="section-title">{{ t('salesStock.history.title') }}</h2><p class="secondary-text mt-1">{{ t('salesStock.history.description') }}</p></div>
      <UiTable class="hidden md:block" :caption="t('salesStock.history.title')"><template #head><tr><th>{{ t('salesStock.history.product') }}</th><th class="numeric">{{ t('salesStock.history.previous') }}</th><th class="numeric">{{ t('salesStock.history.new') }}</th><th>{{ t('salesStock.history.date') }}</th><th>{{ t('salesStock.history.changedBy') }}</th></tr></template><tr v-for="item in visibleHistory" :key="item.id"><td class="font-medium text-slate-900">{{ stockById(item.stockId)?.variety }} <span class="ml-1 text-slate-500">{{ stockById(item.stockId)?.grade }}</span></td><td class="numeric">{{ formatCurrency(item.previousPrice) }}</td><td class="numeric font-semibold text-green-700">{{ formatCurrency(item.newPrice) }}</td><td class="whitespace-nowrap">{{ formatDate(item.effectiveDate) }}</td><td>{{ item.changedBy }}</td></tr></UiTable>
      <div class="space-y-3 md:hidden"><article v-for="item in visibleHistory" :key="item.id" class="ui-card p-4"><div class="flex justify-between gap-4"><div><p class="font-medium text-slate-900">{{ stockById(item.stockId)?.variety }} {{ stockById(item.stockId)?.grade }}</p><p class="mt-1 text-xs text-slate-500">{{ formatDate(item.effectiveDate) }} · {{ item.changedBy }}</p></div><div class="text-right"><p class="text-xs text-slate-400 line-through">{{ formatCurrency(item.previousPrice) }}</p><p class="mt-1 font-semibold text-green-700">{{ formatCurrency(item.newPrice) }}</p></div></div></article></div>
    </section>

    <UiModal v-model="priceModalOpen" :title="t('salesStock.modal.title')" :description="selectedStock ? `${selectedStock.variety} · ${selectedStock.grade}` : undefined"><div class="space-y-4"><div class="rounded-lg bg-slate-50 p-4"><p class="text-sm text-slate-500">{{ t('salesStock.modal.currentPrice') }}</p><p class="mt-1 text-lg font-semibold">{{ formatCurrency(selectedStock?.pricePerKg ?? 0) }}/kg</p></div><UiInput v-model="newPrice" :label="t('salesStock.modal.newPrice')" type="number" min="1" step="1" :error="priceError" /></div><template #footer><UiButton variant="secondary" @click="priceModalOpen = false">{{ t('common.cancel') }}</UiButton><UiButton @click="updatePrice">{{ t('salesStock.modal.update') }}</UiButton></template></UiModal>
    <div v-if="toast" class="fixed right-4 bottom-4 z-50 sm:right-6 sm:bottom-6"><UiToast v-bind="toast" @dismiss="toast = null" /></div>
  </div>
</template>
