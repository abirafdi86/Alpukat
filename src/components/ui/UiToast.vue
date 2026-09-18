<script setup lang="ts">
import { CircleCheck, TriangleAlert, CircleX, Info, X } from 'lucide-vue-next'
import type { StatusTone } from '@/types/ui'
import { toneClasses } from '@/constants/ui'

withDefaults(defineProps<{ title: string; description?: string; tone?: StatusTone; dismissible?: boolean }>(), { tone: 'info', dismissible: true })
defineEmits<{ dismiss: [] }>()
const icons = { neutral: Info, success: CircleCheck, warning: TriangleAlert, danger: CircleX, info: Info }
</script>

<template>
  <div class="flex w-full max-w-sm items-start gap-3 rounded-xl border p-4 shadow-sm" :class="toneClasses[tone]" :role="tone === 'danger' ? 'alert' : 'status'" aria-atomic="true">
    <component :is="icons[tone]" :size="20" class="mt-0.5 shrink-0" aria-hidden="true" />
    <div class="min-w-0 flex-1"><p class="text-sm font-semibold">{{ title }}</p><p v-if="description" class="mt-1 text-sm leading-5">{{ description }}</p></div>
    <button v-if="dismissible" type="button" class="-m-1 rounded-md p-2 hover:bg-white/60" aria-label="Dismiss notification" @click="$emit('dismiss')"><X :size="16" aria-hidden="true" /></button>
  </div>
</template>
