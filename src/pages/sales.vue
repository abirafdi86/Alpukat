<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { Banknote, CalendarRange, CircleDollarSign, Download, MoreHorizontal, Plus, ReceiptText, Scale, Search } from 'lucide-vue-next'
import StatCard from '@/components/StatCard.vue'
import { UiBadge, UiButton, UiEmptyState, UiInput, UiPagination, UiSelect, UiTable } from '@/components/ui'
import { mockCustomers, mockSales } from '@/data/sales'
import type { OrderStatus, PaymentStatus, Sale } from '@/types/sales'
import type { StatusTone } from '@/types/ui'
import { useLocale } from '@/composables/useLocale'

const { t, formatCurrency, formatDate, formatNumber } = useLocale()
const router = useRouter()
const search = ref('')
const dateRange = ref('all')
const customerFilter = ref('all')
const paymentFilter = ref('all')
const orderFilter = ref('all')
const currentPage = ref(1)
const pageSize = ref(10)

const customerById = (id: string) => mockCustomers.find((customer) => customer.id === id)
function paymentLabel(status: PaymentStatus) { return t(`salesPage.paymentStatus.${status.toLowerCase()}`) }
function orderLabel(status: OrderStatus) { return t(`salesPage.orderStatus.${status.toLowerCase()}`) }

const customerOptions = computed(() => [{ label: t('salesPage.filters.allCustomers'), value: 'all' }, ...mockCustomers.map((customer) => ({ label: customer.name, value: customer.id }))])
const dateOptions = computed(() => [
  { label: t('salesPage.filters.allDates'), value: 'all' }, { label: t('salesPage.filters.today'), value: 'today' },
  { label: t('salesPage.filters.last7Days'), value: '7days' }, { label: t('salesPage.filters.last30Days'), value: '30days' },
])
const paymentOptions = computed(() => [{ label: t('salesPage.filters.allPaymentStatuses'), value: 'all' }, ...(['Paid', 'Partial', 'Unpaid'] as PaymentStatus[]).map((status) => ({ label: paymentLabel(status), value: status }))])
const orderOptions = computed(() => [{ label: t('salesPage.filters.allOrderStatuses'), value: 'all' }, ...(['Draft', 'Confirmed', 'Processing', 'Ready', 'Delivered', 'Cancelled'] as OrderStatus[]).map((status) => ({ label: orderLabel(status), value: status }))])
const summaryCards = computed(() => [
  { id: 'today', label: t('salesPage.summary.today'), value: formatCurrency(3_850_000), icon: Banknote },
  { id: 'month', label: t('salesPage.summary.month'), value: formatCurrency(42_750_000), icon: CalendarRange },
  { id: 'sold', label: t('salesPage.summary.sold'), value: formatNumber(1_850), unit: t('common.kg'), icon: Scale },
  { id: 'transactions', label: t('salesPage.summary.transactions'), value: formatNumber(38), unit: t('salesPage.summary.transactionUnit'), icon: ReceiptText },
  { id: 'outstanding', label: t('salesPage.summary.outstanding'), value: formatCurrency(6_500_000), tone: 'warning' as const, icon: CircleDollarSign },
])
const filteredSales = computed(() => {
  const query = search.value.trim().toLowerCase()
  const minimumDate = dateRange.value === 'today' ? '2026-09-17' : dateRange.value === '7days' ? '2026-09-11' : dateRange.value === '30days' ? '2026-08-19' : ''
  return mockSales.filter((sale) => {
    const customer = customerById(sale.customerId)
    return (!query || `${sale.invoiceNumber} ${customer?.name ?? ''} ${sale.variety}`.toLowerCase().includes(query))
      && (!minimumDate || sale.saleDate >= minimumDate)
      && (customerFilter.value === 'all' || sale.customerId === customerFilter.value)
      && (paymentFilter.value === 'all' || sale.paymentStatus === paymentFilter.value)
      && (orderFilter.value === 'all' || sale.orderStatus === orderFilter.value)
  })
})
const paginatedSales = computed(() => filteredSales.value.slice((currentPage.value - 1) * pageSize.value, currentPage.value * pageSize.value))
const paymentTone: Record<PaymentStatus, StatusTone> = { Paid: 'success', Partial: 'warning', Unpaid: 'danger' }
const orderTone: Record<OrderStatus, StatusTone> = { Draft: 'neutral', Confirmed: 'info', Processing: 'warning', Ready: 'success', Delivered: 'success', Cancelled: 'danger' }
function rowLabel(sale: Sale) { return t('salesPage.actionsFor', { invoice: sale.invoiceNumber }) }
watch([search, dateRange, customerFilter, paymentFilter, orderFilter], () => { currentPage.value = 1 })
</script>

<template>
  <div class="@container">
    <header class="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
      <div><h1 class="page-title">{{ t('salesPage.title') }}</h1><p class="secondary-text mt-2">{{ t('salesPage.description') }}</p></div>
      <div class="flex flex-wrap gap-3"><UiButton variant="secondary"><template #leading><Download :size="17" aria-hidden="true" /></template>{{ t('common.export') }}</UiButton><UiButton @click="router.push('/sales/new')"><template #leading><Plus :size="18" aria-hidden="true" /></template>{{ t('salesPage.newSale') }}</UiButton></div>
    </header>

    <section class="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5" :aria-label="t('salesPage.summary.label')"><StatCard v-for="stat in summaryCards" :key="stat.id" v-bind="stat" /></section>

    <section class="mt-8" :aria-label="t('salesPage.listLabel')">
      <div class="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(15rem,1.4fr)_repeat(4,minmax(10rem,1fr))]">
        <UiInput v-model="search" :label="t('common.search')" type="search" :placeholder="t('salesPage.filters.searchPlaceholder')"><template #trailing><Search :size="17" class="text-slate-400" aria-hidden="true" /></template></UiInput>
        <UiSelect v-model="dateRange" :label="t('salesPage.filters.dateRange')" :options="dateOptions" /><UiSelect v-model="customerFilter" :label="t('salesPage.columns.customer')" :options="customerOptions" /><UiSelect v-model="paymentFilter" :label="t('salesPage.columns.paymentStatus')" :options="paymentOptions" /><UiSelect v-model="orderFilter" :label="t('salesPage.columns.orderStatus')" :options="orderOptions" />
      </div>
      <UiEmptyState v-if="!paginatedSales.length" :title="t('salesPage.empty.title')" :description="t('salesPage.empty.description')" />
      <UiTable v-else class="hidden md:block" :caption="t('salesPage.tableCaption')">
        <template #head><tr><th>{{ t('salesPage.columns.invoice') }}</th><th>{{ t('salesPage.columns.date') }}</th><th>{{ t('salesPage.columns.customer') }}</th><th>{{ t('salesPage.columns.variety') }}</th><th class="numeric">{{ t('salesPage.columns.quantity') }}</th><th class="numeric">{{ t('salesPage.columns.weight') }}</th><th class="numeric">{{ t('salesPage.columns.total') }}</th><th>{{ t('salesPage.columns.paymentStatus') }}</th><th>{{ t('salesPage.columns.orderStatus') }}</th><th><span class="sr-only">{{ t('common.actions') }}</span></th></tr></template>
        <tr v-for="sale in paginatedSales" :key="sale.id" class="cursor-pointer transition-colors hover:bg-green-50/50" tabindex="0" @click="router.push(`/sales/${sale.id}`)" @keydown.enter="router.push(`/sales/${sale.id}`)"><td class="whitespace-nowrap font-medium text-green-700">{{ sale.invoiceNumber }}</td><td class="whitespace-nowrap">{{ formatDate(sale.saleDate) }}</td><td class="whitespace-nowrap font-medium text-slate-800">{{ customerById(sale.customerId)?.name }}</td><td>{{ sale.variety }}</td><td class="numeric">{{ formatNumber(sale.quantity) }}</td><td class="numeric whitespace-nowrap">{{ formatNumber(sale.totalWeightKg) }} {{ t('common.kg') }}</td><td class="numeric whitespace-nowrap font-medium">{{ formatCurrency(sale.totalAmount) }}</td><td><UiBadge :tone="paymentTone[sale.paymentStatus]">{{ paymentLabel(sale.paymentStatus) }}</UiBadge></td><td><UiBadge :tone="orderTone[sale.orderStatus]">{{ orderLabel(sale.orderStatus) }}</UiBadge></td><td><button type="button" class="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800" :aria-label="rowLabel(sale)" @click.stop="router.push(`/sales/${sale.id}`)"><MoreHorizontal :size="18" aria-hidden="true" /></button></td></tr>
      </UiTable>
      <div v-if="paginatedSales.length" class="grid gap-4 md:hidden">
        <article v-for="sale in paginatedSales" :key="sale.id" class="ui-card p-5"><div class="flex items-start justify-between gap-3"><div><RouterLink :to="`/sales/${sale.id}`" class="font-semibold text-green-700 hover:underline">{{ sale.invoiceNumber }}</RouterLink><p class="mt-1 text-xs text-slate-500">{{ formatDate(sale.saleDate) }}</p></div><button type="button" class="rounded-md p-1.5 text-slate-500 hover:bg-slate-100" :aria-label="rowLabel(sale)" @click="router.push(`/sales/${sale.id}`)"><MoreHorizontal :size="18" aria-hidden="true" /></button></div><div class="mt-4 border-y border-slate-100 py-4"><p class="font-medium text-slate-900">{{ customerById(sale.customerId)?.name }}</p><p class="mt-1 text-sm text-slate-500">{{ sale.variety }} · {{ formatNumber(sale.quantity) }} {{ t('salesPage.units.fruits') }} · {{ formatNumber(sale.totalWeightKg) }} {{ t('common.kg') }}</p><p class="mt-3 text-lg font-semibold text-slate-900">{{ formatCurrency(sale.totalAmount) }}</p></div><div class="mt-4 flex flex-wrap gap-2"><UiBadge :tone="paymentTone[sale.paymentStatus]">{{ paymentLabel(sale.paymentStatus) }}</UiBadge><UiBadge :tone="orderTone[sale.orderStatus]">{{ orderLabel(sale.orderStatus) }}</UiBadge></div></article>
      </div>
      <UiPagination v-model:page="currentPage" v-model:page-size="pageSize" :total="filteredSales.length" />
    </section>
  </div>
</template>
