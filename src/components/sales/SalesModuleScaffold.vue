<script setup lang="ts">
import type { LucideIcon } from 'lucide-vue-next'
import { UiBadge, UiCard, UiEmptyState } from '@/components/ui'
import { useLocale } from '@/composables/useLocale'

defineProps<{
  titleKey: string
  descriptionKey: string
  icon: LucideIcon
  recordCount: number
}>()

const { t, formatNumber } = useLocale()
</script>

<template>
  <div class="@container">
    <header class="flex items-start gap-4">
      <span class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-700">
        <component :is="icon" :size="22" aria-hidden="true" />
      </span>
      <div>
        <h1 class="page-title">{{ t(titleKey) }}</h1>
        <p class="secondary-text mt-2">{{ t(descriptionKey) }}</p>
      </div>
    </header>

    <UiCard class="mt-8" :title="t('salesModule.moduleOverview')" :description="t('salesModule.structureReady')">
      <UiEmptyState :title="t('salesModule.readyTitle')" :description="t('salesModule.readyDescription')">
        <div class="flex flex-wrap items-center justify-center gap-2">
          <UiBadge tone="success">{{ t('salesModule.mockData') }}</UiBadge>
          <UiBadge>{{ t('salesModule.records', { count: formatNumber(recordCount) }) }}</UiBadge>
        </div>
      </UiEmptyState>
    </UiCard>
  </div>
</template>
