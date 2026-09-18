<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { RouterLink } from 'vue-router'
import { ArrowLeft, Plus, Trash2, UserPlus } from 'lucide-vue-next'
import { z } from 'zod'
import { UiButton, UiCard, UiInput, UiModal, UiSelect, UiToast } from '@/components/ui'
import { mockCustomers } from '@/data/sales'
import type { Customer, DeliveryMethod, NewSaleForm, PaymentMethod, PaymentStatus, SaleProductLine, SaleUnit } from '@/types/sales'
import { useLocale } from '@/composables/useLocale'
import { useSalesStockStore } from '@/stores/salesStock'
import { useSettingsStore } from '@/stores/settings'

const { t, formatCurrency, formatNumber } = useLocale()
const salesStockStore = useSalesStockStore()
const settingsStore = useSettingsStore()
const { stock } = storeToRefs(salesStockStore)
const customers = ref<Customer[]>(mockCustomers.map((customer) => ({ ...customer })))
const confirmOpen = ref(false)
const customerModalOpen = ref(false)
const toast = ref<{ title: string; description: string; tone: 'success' | 'info' } | null>(null)
const errors = ref<Record<string, string>>({})
const submitIntent = ref<'draft' | 'create'>('create')
let nextLineId = 2

const form = reactive<NewSaleForm>({
  customerId: '', transactionDate: '2026-09-18', invoiceNumber: `${settingsStore.settings.sales.invoicePrefix}-2026-0093`,
  products: [{ id: 'line-1', stockId: 'STK-0001', quantity: 100, unit: 'kg', pricePerUnit: 35_000, discount: 0 }],
  additionalCost: 0, paymentMethod: settingsStore.settings.sales.defaultPaymentMethod, paymentStatus: settingsStore.settings.sales.defaultPaymentStatus, amountPaid: 0,
  deliveryMethod: settingsStore.settings.sales.defaultDeliveryMethod, deliveryDate: '', deliveryAddress: '', deliveryCost: 0, deliveryNotes: '', notes: settingsStore.settings.preferences.language === 'id' ? settingsStore.settings.sales.defaultInvoiceNotesId : settingsStore.settings.sales.defaultInvoiceNotesEn,
})
const newCustomer = reactive({ name: '', phone: '', location: '' })

const customerOptions = computed(() => customers.value.map((customer) => ({ label: customer.name, value: customer.id })))
const stockOptions = computed(() => stock.value.map((item) => ({ label: `${item.variety} · ${item.grade}`, value: item.id, disabled: item.availableWeightKg <= 0 })))
const unitOptions = computed(() => ([{ label: t('newSale.units.kg'), value: 'kg' }, { label: t('newSale.units.crate'), value: 'crate' }]))
const paymentMethodOptions = computed(() => (['Cash', 'Bank Transfer', 'Other'] as PaymentMethod[]).map((value) => ({ label: t(`newSale.paymentMethods.${value === 'Bank Transfer' ? 'bankTransfer' : value.toLowerCase()}`), value })))
const paymentStatusOptions = computed(() => (['Paid', 'Partial', 'Unpaid'] as PaymentStatus[]).map((value) => ({ label: t(`salesPage.paymentStatus.${value.toLowerCase()}`), value })))
const deliveryOptions = computed(() => (['Customer Pickup', 'Farm Delivery', 'Third Party Delivery'] as DeliveryMethod[]).map((value) => ({ label: t(`newSale.deliveryMethods.${value === 'Customer Pickup' ? 'pickup' : value === 'Farm Delivery' ? 'farm' : 'thirdParty'}`), value })))

const stockFor = (line: SaleProductLine) => stock.value.find((item) => item.id === line.stockId)!
const lineSubtotal = (line: SaleProductLine) => Math.max(0, Math.round(line.quantity) * Math.round(line.pricePerUnit) - Math.round(line.discount))
const productSubtotal = computed(() => form.products.reduce((total, line) => total + Math.round(line.quantity) * Math.round(line.pricePerUnit), 0))
const totalDiscount = computed(() => form.products.reduce((total, line) => total + Math.round(line.discount), 0))
const grandTotal = computed(() => Math.max(0, productSubtotal.value - totalDiscount.value + Math.round(form.additionalCost) + Math.round(form.deliveryCost)))
const remainingBalance = computed(() => form.paymentStatus === 'Paid' ? 0 : form.paymentStatus === 'Unpaid' ? grandTotal.value : Math.max(0, grandTotal.value - Math.round(form.amountPaid)))
const deliveryFieldsRequired = computed(() => form.deliveryMethod !== 'Customer Pickup')

function addProduct() { form.products.push({ id: `line-${nextLineId++}`, stockId: 'STK-0001', quantity: 1, unit: 'kg', pricePerUnit: 35_000, discount: 0 }) }
function removeProduct(id: string) { if (form.products.length > 1) form.products = form.products.filter((line) => line.id !== id) }
function selectStock(line: SaleProductLine) { const stock = stockFor(line); line.pricePerUnit = stock.pricePerKg }
function createSchema() {
  return z.object({ customerId: z.string().min(1, t('newSale.validation.customer')), transactionDate: z.string().min(1, t('validation.required')), products: z.array(z.object({ stockId: z.string().min(1), quantity: z.coerce.number().int().positive(), pricePerUnit: z.coerce.number().int().nonnegative(), discount: z.coerce.number().int().nonnegative() })).min(1, t('newSale.validation.product')), amountPaid: z.coerce.number().int().nonnegative(), deliveryDate: z.string(), deliveryAddress: z.string() }).superRefine((data, ctx) => {
    if (form.paymentStatus === 'Partial' && (data.amountPaid <= 0 || data.amountPaid >= grandTotal.value)) ctx.addIssue({ code: 'custom', path: ['amountPaid'], message: t('newSale.validation.partialAmount') })
    if (deliveryFieldsRequired.value && !data.deliveryDate) ctx.addIssue({ code: 'custom', path: ['deliveryDate'], message: t('validation.required') })
    if (deliveryFieldsRequired.value && !data.deliveryAddress.trim()) ctx.addIssue({ code: 'custom', path: ['deliveryAddress'], message: t('validation.required') })
    if (!salesStockStore.validateSale(form.products).valid) ctx.addIssue({ code: 'custom', path: ['products'], message: t('newSale.validation.stockExceeded') })
  })
}
function prepareSubmit(intent: 'draft' | 'create') {
  const result = createSchema().safeParse(form)
  errors.value = {}
  if (!result.success) { for (const issue of result.error.issues) { const field = String(issue.path[0]); if (!errors.value[field]) errors.value[field] = issue.message } return }
  submitIntent.value = intent
  confirmOpen.value = true
}
function confirmSubmit() {
  if (submitIntent.value === 'create' && !salesStockStore.commitSale(form.products).valid) { confirmOpen.value = false; errors.value.products = t('newSale.validation.stockExceeded'); return }
  confirmOpen.value = false
  toast.value = { title: t(submitIntent.value === 'draft' ? 'newSale.toast.draftTitle' : 'newSale.toast.createdTitle'), description: t(submitIntent.value === 'draft' ? 'newSale.toast.draftDescription' : 'newSale.toast.createdDescription', { invoice: form.invoiceNumber }), tone: submitIntent.value === 'draft' ? 'info' : 'success' }
  window.setTimeout(() => { toast.value = null }, 4500)
}
function addCustomer() {
  if (!newCustomer.name.trim()) return
  const customer: Customer = { id: `CUS-${String(customers.value.length + 1).padStart(4, '0')}`, name: newCustomer.name.trim(), phone: newCustomer.phone.trim(), email: '', address: newCustomer.location.trim(), contactPerson: newCustomer.name.trim(), notes: '', totalTransactions: 0, totalPurchase: 0, outstandingPayment: 0, lastPurchase: '', type: 'Individual', active: true }
  customers.value.push(customer); form.customerId = customer.id; customerModalOpen.value = false
  Object.assign(newCustomer, { name: '', phone: '', location: '' })
}
</script>

<template>
  <div class="@container pb-24">
    <header><RouterLink to="/sales" class="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-green-700 hover:text-green-800"><ArrowLeft :size="16" aria-hidden="true" />{{ t('newSale.back') }}</RouterLink><h1 class="page-title">{{ t('newSale.title') }}</h1><p class="secondary-text mt-2">{{ t('newSale.description') }}</p></header>
    <form class="mt-8 space-y-6" novalidate @submit.prevent="prepareSubmit('create')">
      <UiCard :title="t('newSale.sections.customer')" :description="t('newSale.sectionDescriptions.customer')"><div class="grid gap-4 md:grid-cols-3"><div><UiSelect v-model="form.customerId" :label="t('newSale.fields.customer')" :options="customerOptions" :placeholder="t('newSale.placeholders.customer')" :error="errors.customerId" /><UiButton variant="ghost" size="sm" class="mt-2" @click="customerModalOpen = true"><template #leading><UserPlus :size="16" aria-hidden="true" /></template>{{ t('newSale.addCustomer') }}</UiButton></div><UiInput v-model="form.transactionDate" :label="t('newSale.fields.transactionDate')" type="date" :error="errors.transactionDate" /><UiInput v-model="form.invoiceNumber" :label="t('newSale.fields.invoiceNumber')" readonly /></div></UiCard>

      <UiCard :title="t('newSale.sections.products')" :description="t('newSale.sectionDescriptions.products')">
        <div class="space-y-4"><article v-for="(line, index) in form.products" :key="line.id" class="rounded-xl border border-slate-200 p-4"><div class="mb-4 flex items-center justify-between"><h3 class="font-semibold text-slate-800">{{ t('newSale.productNumber', { number: index + 1 }) }}</h3><button type="button" class="rounded-md p-2 text-red-600 hover:bg-red-50 disabled:opacity-40" :disabled="form.products.length === 1" :aria-label="t('newSale.removeProduct')" @click="removeProduct(line.id)"><Trash2 :size="17" aria-hidden="true" /></button></div><div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><UiSelect v-model="line.stockId" :label="t('newSale.fields.product')" :options="stockOptions" @change="selectStock(line)" /><div><p class="ui-label">{{ t('newSale.fields.availableStock') }}</p><p class="mt-3 text-sm font-medium text-green-700">{{ t('newSale.available', { amount: formatNumber(stockFor(line).availableWeightKg), unit: t('common.kg') }) }}</p></div><UiInput v-model="line.quantity" :label="t('newSale.fields.quantityWeight')" type="number" min="1" step="1" /><UiSelect v-model="line.unit" :label="t('newSale.fields.unit')" :options="unitOptions" /><UiInput v-model="line.pricePerUnit" :label="t('newSale.fields.pricePerUnit')" type="number" min="0" step="1" /><UiInput v-model="line.discount" :label="t('newSale.fields.discount')" type="number" min="0" step="1" /><div class="sm:col-span-2"><p class="ui-label">{{ t('newSale.fields.subtotal') }}</p><p class="mt-2 text-xl font-semibold text-slate-900">{{ formatCurrency(lineSubtotal(line)) }}</p></div></div></article></div><p v-if="errors.products" class="mt-3 text-sm text-red-700" role="alert">{{ errors.products }}</p><template #footer><UiButton variant="secondary" @click="addProduct"><template #leading><Plus :size="17" aria-hidden="true" /></template>{{ t('newSale.addProduct') }}</UiButton></template>
      </UiCard>

      <div class="grid gap-6 xl:grid-cols-2">
        <UiCard :title="t('newSale.sections.calculation')"><div class="space-y-3 text-sm"><div class="flex justify-between"><span class="text-slate-500">{{ t('newSale.calculation.subtotal') }}</span><strong>{{ formatCurrency(productSubtotal) }}</strong></div><div class="flex justify-between"><span class="text-slate-500">{{ t('newSale.calculation.discount') }}</span><strong>- {{ formatCurrency(totalDiscount) }}</strong></div><UiInput v-model="form.additionalCost" :label="t('newSale.calculation.additionalCost')" type="number" min="0" step="1" /><div class="flex justify-between"><span class="text-slate-500">{{ t('newSale.calculation.delivery') }}</span><strong>{{ formatCurrency(form.deliveryCost) }}</strong></div><div class="flex justify-between border-t border-slate-200 pt-4 text-lg"><span class="font-semibold">{{ t('newSale.calculation.grandTotal') }}</span><strong class="text-green-700">{{ formatCurrency(grandTotal) }}</strong></div></div></UiCard>
        <UiCard :title="t('newSale.sections.payment')"><div class="grid gap-4 sm:grid-cols-2"><UiSelect v-model="form.paymentMethod" :label="t('newSale.fields.paymentMethod')" :options="paymentMethodOptions" /><UiSelect v-model="form.paymentStatus" :label="t('newSale.fields.paymentStatus')" :options="paymentStatusOptions" /><template v-if="form.paymentStatus === 'Partial'"><UiInput v-model="form.amountPaid" :label="t('newSale.fields.amountPaid')" type="number" min="0" step="1" :error="errors.amountPaid" /><div><p class="ui-label">{{ t('newSale.fields.remainingBalance') }}</p><p class="mt-2 text-xl font-semibold text-amber-700">{{ formatCurrency(remainingBalance) }}</p></div></template></div></UiCard>
      </div>

      <UiCard :title="t('newSale.sections.delivery')"><div class="grid gap-4 sm:grid-cols-2"><UiSelect v-model="form.deliveryMethod" :label="t('newSale.fields.deliveryMethod')" :options="deliveryOptions" /><template v-if="deliveryFieldsRequired"><UiInput v-model="form.deliveryDate" :label="t('newSale.fields.deliveryDate')" type="date" :error="errors.deliveryDate" /><UiInput v-model="form.deliveryAddress" :label="t('newSale.fields.deliveryAddress')" :placeholder="t('newSale.placeholders.address')" :error="errors.deliveryAddress" /><UiInput v-model="form.deliveryCost" :label="t('newSale.fields.deliveryCost')" type="number" min="0" step="1" /><div class="space-y-1.5 sm:col-span-2"><label for="delivery-notes" class="ui-label">{{ t('newSale.fields.deliveryNotes') }}</label><textarea id="delivery-notes" v-model="form.deliveryNotes" class="ui-field min-h-24 resize-y" :placeholder="t('newSale.placeholders.deliveryNotes')" /></div></template></div></UiCard>
      <UiCard :title="t('newSale.sections.notes')"><div class="space-y-1.5"><label for="sale-notes" class="ui-label">{{ t('newSale.fields.transactionNotes') }}</label><textarea id="sale-notes" v-model="form.notes" class="ui-field min-h-28 resize-y" :placeholder="t('newSale.placeholders.notes')" /></div></UiCard>
      <div class="sticky bottom-0 z-10 -mx-6 flex flex-wrap justify-end gap-3 border-t border-slate-200 bg-white/95 px-6 py-4 backdrop-blur lg:-mx-8 lg:px-8"><RouterLink to="/sales" class="ui-button ui-button-secondary">{{ t('common.cancel') }}</RouterLink><UiButton variant="secondary" @click="prepareSubmit('draft')">{{ t('newSale.saveDraft') }}</UiButton><UiButton type="submit">{{ t('newSale.createSale') }}</UiButton></div>
    </form>

    <UiModal v-model="confirmOpen" :title="t(submitIntent === 'draft' ? 'newSale.confirm.draftTitle' : 'newSale.confirm.createTitle')" :description="t('newSale.confirm.description')"><dl class="space-y-3 text-sm"><div class="flex justify-between"><dt class="text-slate-500">{{ t('newSale.fields.invoiceNumber') }}</dt><dd class="font-medium">{{ form.invoiceNumber }}</dd></div><div class="flex justify-between"><dt class="text-slate-500">{{ t('newSale.calculation.grandTotal') }}</dt><dd class="font-semibold text-green-700">{{ formatCurrency(grandTotal) }}</dd></div></dl><template #footer><UiButton variant="secondary" @click="confirmOpen = false">{{ t('common.back') }}</UiButton><UiButton @click="confirmSubmit">{{ t(submitIntent === 'draft' ? 'newSale.saveDraft' : 'newSale.confirmCreate') }}</UiButton></template></UiModal>
    <UiModal v-model="customerModalOpen" :title="t('newSale.addCustomer')" :description="t('newSale.customerModal.description')"><div class="space-y-4"><UiInput v-model="newCustomer.name" :label="t('users.name')" :placeholder="t('newSale.placeholders.customerName')" /><UiInput v-model="newCustomer.phone" :label="t('users.phone')" type="tel" /><UiInput v-model="newCustomer.location" :label="t('farms.location')" /></div><template #footer><UiButton variant="secondary" @click="customerModalOpen = false">{{ t('common.cancel') }}</UiButton><UiButton :disabled="!newCustomer.name.trim()" @click="addCustomer">{{ t('newSale.customerModal.add') }}</UiButton></template></UiModal>
    <div v-if="toast" class="fixed right-4 bottom-4 z-50 sm:right-6 sm:bottom-6"><UiToast v-bind="toast" @dismiss="toast = null" /></div>
  </div>
</template>
