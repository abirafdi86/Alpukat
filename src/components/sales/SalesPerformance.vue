<script setup lang="ts">
import { computed, ref } from 'vue'
import { Bar, Doughnut, Line } from 'vue-chartjs'
import { ArcElement, BarElement, CategoryScale, Chart as ChartJS, Filler, Legend, LineElement, LinearScale, PointElement, Tooltip } from 'chart.js'
import { Award, Banknote, CircleDollarSign, Scale } from 'lucide-vue-next'
import { UiCard, UiTable } from '@/components/ui'
import { mockCustomers, mockSalesAnalytics, mockSalesByGrade, mockSalesByVariety, mockTopCustomerSales } from '@/data/sales'
import type { SalesAnalyticsRange } from '@/types/sales'
import { useLocale } from '@/composables/useLocale'

ChartJS.register(ArcElement, BarElement, CategoryScale, Filler, Legend, LineElement, LinearScale, PointElement, Tooltip)
const { t, formatCurrency, formatNumber } = useLocale()
const selectedRange = ref<SalesAnalyticsRange>('30d')
const ranges: SalesAnalyticsRange[] = ['7d', '30d', '3m', '6m', '1y']
const series = computed(() => mockSalesAnalytics[selectedRange.value])
const metrics = computed(() => [
  { label: t('salesAnalytics.metrics.revenue'), value: formatCurrency(42_750_000), icon: Banknote },
  { label: t('salesAnalytics.metrics.sold'), value: `${formatNumber(1_850)} ${t('common.kg')}`, icon: Scale },
  { label: t('salesAnalytics.metrics.averagePrice'), value: `${formatCurrency(31_500)}/${t('common.kg')}`, icon: CircleDollarSign },
  { label: t('salesAnalytics.metrics.outstanding'), value: formatCurrency(6_500_000), icon: CircleDollarSign },
])
const localizeLabels = (labels: string[]) => labels.map((label) => { const [day, month] = label.split(' '); return month ? `${day} ${t(`salesAnalytics.months.${month}`)}` : t(`salesAnalytics.months.${day}`) })
const lineOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, border: { display: false }, grid: { color: '#e2e8f0' }, ticks: { color: '#64748b', callback: (value: string | number) => `${formatNumber(Number(value) / 1_000_000)} ${t('salesAnalytics.millionShort')}` } }, x: { border: { display: false }, grid: { display: false }, ticks: { color: '#64748b' } } } }
const barOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, border: { display: false }, grid: { color: '#e2e8f0' }, ticks: { color: '#64748b', callback: (value: string | number) => `${value} kg` } }, x: { border: { display: false }, grid: { display: false }, ticks: { color: '#64748b' } } } }
const doughnutOptions = { responsive: true, maintainAspectRatio: false, cutout: '66%', plugins: { legend: { position: 'bottom' as const, labels: { usePointStyle: true, padding: 14, boxWidth: 8 } } } }
const revenueData = computed(() => ({ labels: localizeLabels(series.value.labels), datasets: [{ data: series.value.revenue, borderColor: '#15803d', backgroundColor: 'rgba(21,128,61,.1)', fill: true, tension: .35, pointRadius: 3 }] }))
const volumeData = computed(() => ({ labels: localizeLabels(series.value.labels), datasets: [{ data: series.value.volume, backgroundColor: '#65a30d', borderRadius: 5, borderSkipped: false }] }))
const varietyData = { labels: mockSalesByVariety.labels, datasets: [{ data: mockSalesByVariety.values, backgroundColor: ['#15803d', '#65a30d', '#eab308', '#0ea5e9'], borderWidth: 0 }] }
const gradeData = { labels: mockSalesByGrade.labels, datasets: [{ data: mockSalesByGrade.values, backgroundColor: ['#15803d', '#0ea5e9', '#eab308'], borderWidth: 0 }] }
const customerName = (id: string) => mockCustomers.find((item) => item.id === id)?.name ?? id
</script>

<template><section class="mt-10 border-t border-slate-200 pt-8" aria-labelledby="sales-performance-title">
  <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p class="text-xs font-semibold uppercase tracking-widest text-green-700">{{ t('salesAnalytics.eyebrow') }}</p><h2 id="sales-performance-title" class="mt-1 text-xl font-semibold text-slate-900">{{ t('salesAnalytics.title') }}</h2><p class="secondary-text mt-1">{{ t('salesAnalytics.description') }}</p></div><div class="flex flex-wrap gap-1 rounded-lg bg-slate-100 p-1" role="group" :aria-label="t('salesAnalytics.dateRange')"><button v-for="range in ranges" :key="range" type="button" class="rounded-md px-3 py-1.5 text-xs font-medium" :class="selectedRange === range ? 'bg-white text-green-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'" :aria-pressed="selectedRange === range" @click="selectedRange = range">{{ t(`salesAnalytics.ranges.${range}`) }}</button></div></div>
  <div class="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><article v-for="metric in metrics" :key="metric.label" class="ui-card flex items-center gap-4 p-4"><span class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-green-50 text-green-700"><component :is="metric.icon" :size="18" /></span><div class="min-w-0"><p class="truncate text-xs text-slate-500">{{ metric.label }}</p><p class="mt-1 truncate text-lg font-semibold text-slate-900">{{ metric.value }}</p></div></article></div>
  <div class="mt-5 grid gap-5 xl:grid-cols-2"><UiCard :title="t('salesAnalytics.charts.revenue')"><div class="h-64"><Line :data="revenueData" :options="lineOptions" /></div></UiCard><UiCard :title="t('salesAnalytics.charts.volume')"><div class="h-64"><Bar :data="volumeData" :options="barOptions" /></div></UiCard></div>
  <div class="mt-5 grid gap-5 lg:grid-cols-[minmax(0,.7fr)_minmax(0,.7fr)_minmax(20rem,1.2fr)]"><UiCard :title="t('salesAnalytics.charts.variety')"><div class="h-56"><Doughnut :data="varietyData" :options="doughnutOptions" /></div></UiCard><UiCard :title="t('salesAnalytics.charts.grade')"><div class="h-56"><Doughnut :data="gradeData" :options="doughnutOptions" /></div></UiCard><UiCard :title="t('salesAnalytics.topCustomers')"><UiTable :caption="t('salesAnalytics.topCustomers')"><template #head><tr><th>{{ t('salesAnalytics.customer') }}</th><th class="numeric">{{ t('salesAnalytics.purchase') }}</th><th class="numeric">{{ t('salesAnalytics.weight') }}</th><th class="numeric">{{ t('salesAnalytics.transactions') }}</th></tr></template><tr v-for="item in mockTopCustomerSales" :key="item.customerId"><td class="font-medium">{{ customerName(item.customerId) }}</td><td class="numeric">{{ formatCurrency(item.totalPurchase) }}</td><td class="numeric">{{ formatNumber(item.totalWeightKg) }} kg</td><td class="numeric">{{ formatNumber(item.transactions) }}</td></tr></UiTable></UiCard></div>
  <div class="mt-5 flex items-center gap-4 rounded-xl border border-green-100 bg-green-50 p-5"><span class="flex size-11 items-center justify-center rounded-xl bg-white text-green-700"><Award :size="22" /></span><div><p class="text-sm text-green-800">{{ t('salesAnalytics.bestVariety') }}</p><p class="mt-1 text-lg font-semibold text-green-950">Hass <span class="ml-2 text-sm font-medium text-green-700">650 kg</span></p></div></div>
</section></template>
