<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { Sprout } from 'lucide-vue-next'
import { useLocale } from '@/composables/useLocale'
defineProps<{ collapsed?: boolean }>()
const { t } = useLocale()
</script>

<template>
  <RouterLink to="/dashboard" class="flex min-w-0 items-center gap-3 rounded-lg" :class="{ 'justify-center': collapsed }" :aria-label="`Kebunku.com ${t('navigation.dashboard')}`" :title="collapsed ? `Kebunku.com — ${t('navigation.farmManagement')}` : undefined">
    <span class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-green-700 text-white"><Sprout :size="23" aria-hidden="true" /></span>
    <span :class="collapsed ? 'sr-only' : 'min-w-0'"><span class="block text-lg font-semibold leading-6 tracking-tight">Kebunku.com</span><span class="block whitespace-nowrap text-xs leading-4 text-slate-500">{{ t('navigation.farmManagement') }}</span></span>
  </RouterLink>
</template>
