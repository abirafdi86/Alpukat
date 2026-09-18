<script setup lang="ts">
import { useId } from 'vue'
import { ArrowUpRight, CircleAlert } from 'lucide-vue-next'
import type { DashboardStat } from '@/types/dashboard'

withDefaults(defineProps<Omit<DashboardStat, 'id'>>(), { tone: 'neutral' })
const titleId = useId()
const descriptionClasses = {
  positive: 'text-emerald-700',
  warning: 'text-amber-700',
  neutral: 'text-slate-500',
}
</script>

<template>
  <article class="ui-card flex min-w-0 flex-col p-5" :aria-labelledby="titleId">
    <div class="flex items-center justify-between gap-3">
      <h2 :id="titleId" class="text-sm font-medium text-slate-500">{{ label }}</h2>
      <span class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-green-50 text-green-700">
        <component :is="icon" :size="18" aria-hidden="true" />
      </span>
    </div>
    <p class="mt-5 flex flex-wrap items-baseline gap-x-1.5 gap-y-1 text-slate-900">
      <span v-if="prefix" class="text-sm font-medium">{{ prefix }} </span>
      <span class="text-2xl font-semibold tracking-tight tabular-nums">{{ value }}</span>
      <span v-if="unit" class="text-sm font-medium text-slate-500"> {{ unit }}</span>
    </p>
    <p v-if="description" class="mt-3 flex items-center gap-1.5 text-xs leading-5" :class="descriptionClasses[tone]">
      <ArrowUpRight v-if="tone === 'positive'" :size="14" class="shrink-0" aria-hidden="true" />
      <CircleAlert v-else-if="tone === 'warning'" :size="14" class="shrink-0" aria-hidden="true" />
      {{ description }}
    </p>
  </article>
</template>
