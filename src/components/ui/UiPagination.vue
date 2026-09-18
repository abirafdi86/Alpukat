<script setup lang="ts">
import { computed, watch } from 'vue'
import Paginate from 'vuejs-paginate-next'
import UiSelect from './UiSelect.vue'
import { useLocale } from '@/composables/useLocale'

const props = withDefaults(defineProps<{ page: number; pageSize: number; total: number; pageSizes?: number[] }>(), { pageSizes: () => [10, 25, 50] })
const emit = defineEmits<{ 'update:page': [value: number]; 'update:pageSize': [value: number] }>()
const { t } = useLocale()
const totalPages = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)))
const first = computed(() => props.total ? (props.page - 1) * props.pageSize + 1 : 0)
const last = computed(() => Math.min(props.page * props.pageSize, props.total))
const sizeOptions = computed(() => props.pageSizes.map((size) => ({ label: String(size), value: String(size) })))
const selectedSize = computed({ get: () => String(props.pageSize), set: (value) => { emit('update:pageSize', Number(value)); emit('update:page', 1) } })
watch(totalPages, (pages) => { if (props.page > pages) emit('update:page', pages) })
</script>

<template>
  <nav v-if="total" class="mt-5 flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4 lg:flex-row lg:items-end lg:justify-between" :aria-label="t('common.pagination.label')">
    <div><p class="text-sm font-medium text-slate-700">{{ t('common.pagination.showing', { first, last, total }) }}</p><p class="mt-1 text-xs text-slate-400">{{ t('common.pagination.page', { page, total: totalPages }) }}</p></div>
    <div class="flex flex-wrap items-end gap-3">
      <div class="w-24"><UiSelect v-model="selectedSize" label="" :aria-label="t('common.pagination.pageSize')" :options="sizeOptions" /></div>
      <Paginate
        :page-count="totalPages"
        :force-page="page"
        :click-handler="(value: number) => emit('update:page', value)"
        prev-text="<"
        next-text=">"
        container-class="flex flex-wrap items-center gap-1 rounded-lg bg-slate-50 p-1"
        page-class="flex"
        page-link-class="inline-flex min-h-9 min-w-9 items-center justify-center rounded-md px-2 text-sm font-semibold text-slate-600 transition hover:bg-white hover:text-green-700 hover:shadow-sm"
        active-class="[&>a]:bg-green-700 [&>a]:text-white [&>a]:shadow-sm [&>a]:hover:bg-green-800 [&>a]:hover:text-white"
        prev-class="flex"
        next-class="flex"
        prev-link-class="inline-flex min-h-9 items-center justify-center rounded-md px-3 text-sm font-medium text-slate-600 transition hover:bg-white hover:text-green-700 hover:shadow-sm"
        next-link-class="inline-flex min-h-9 items-center justify-center rounded-md px-3 text-sm font-medium text-slate-600 transition hover:bg-white hover:text-green-700 hover:shadow-sm"
        disabled-class="pointer-events-none opacity-40"
      />
    </div>
  </nav>
</template>
