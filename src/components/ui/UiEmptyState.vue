<script setup lang="ts">
import { Sprout } from 'lucide-vue-next'
defineProps<{ title: string; description: string }>()
</script>

<template>
  <div class="px-5 py-12 text-center sm:py-16">
    <div class="mx-auto flex size-11 items-center justify-center rounded-lg bg-green-50 text-green-700" aria-hidden="true"><slot name="icon"><Sprout :size="22" /></slot></div>
    <h2 class="mt-4 text-base font-semibold text-slate-900">{{ title }}</h2>
    <p class="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">{{ description }}</p>
    <div v-if="$slots.default" class="mt-5 flex flex-wrap justify-center gap-3"><slot /></div>
  </div>
</template>
