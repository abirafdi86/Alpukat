<script setup lang="ts">
import { useLocale } from '@/composables/useLocale'

const { t, locale, setLocale } = useLocale()
</script>

<template>
  <div role="group" class="flex items-center rounded-lg border border-slate-200 bg-white p-1 text-xs" :aria-label="t('common.language')">
    <button type="button" class="min-h-8 min-w-0 rounded px-2 font-medium" :class="locale === 'id' ? 'bg-green-50 text-green-700' : 'text-slate-500'" :aria-pressed="locale === 'id'" @click="setLocale('id')">ID</button>
    <button type="button" class="min-h-8 min-w-0 rounded px-2 font-medium" :class="locale === 'en' ? 'bg-green-50 text-green-700' : 'text-slate-500'" :aria-pressed="locale === 'en'" @click="setLocale('en')">EN</button>
  </div>
</template>
