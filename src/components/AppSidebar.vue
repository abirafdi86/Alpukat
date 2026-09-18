<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { PanelLeftClose, PanelLeftOpen, X } from 'lucide-vue-next'
import { navigationGroups } from '@/constants/navigation'
import AppBrand from './AppBrand.vue'
import { useAuthStore } from '@/stores/auth'
import { useLocale } from '@/composables/useLocale'

defineProps<{ collapsed?: boolean; mobile?: boolean }>()
defineEmits<{ navigate: []; close: []; toggleCollapse: [] }>()
const auth = useAuthStore()
const { t, locale } = useLocale()
const visibleGroups = computed(() => navigationGroups.map((group) => ({ ...group, items: group.items.filter((item) => item.to !== '/users' || auth.user?.role === 'OWNER') })).filter((group) => group.items.length))
</script>

<template>
  <div class="flex h-full min-h-0 flex-col bg-white">
    <div class="flex h-16 shrink-0 items-center border-b border-slate-200" :class="collapsed ? 'justify-center px-3' : 'justify-between px-5'">
      <AppBrand :collapsed="collapsed" @click="$emit('navigate')" />
      <button v-if="mobile" type="button" class="rounded-lg p-2 text-slate-500 hover:bg-slate-100" :aria-label="t('common.close')" @click="$emit('close')"><X :size="20" aria-hidden="true" /></button>
    </div>
    <nav :aria-label="mobile ? t('navigation.dashboard') : t('navigation.management')" class="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-5">
      <div v-for="(group, index) in visibleGroups" :key="group.id" :class="index ? (collapsed ? 'mt-3 border-t border-slate-100 pt-3' : 'mt-5') : ''">
        <p v-if="group.labelKey" :class="collapsed ? 'sr-only' : 'mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-500'">{{ t(group.labelKey) }}</p>
        <div class="space-y-1">
          <RouterLink v-for="item in group.items" :key="item.to" :to="item.to" class="app-nav-link flex min-h-10 items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
            :class="{ 'justify-center': collapsed }" :title="collapsed ? t(item.labelKey) : undefined" @click="$emit('navigate')">
            <component :is="item.icon" :size="18" class="shrink-0" aria-hidden="true" />
            <span :class="{ 'sr-only': collapsed }">{{ t(item.labelKey) }}</span>
          </RouterLink>
        </div>
      </div>
    </nav>
    <div v-if="!mobile" class="shrink-0 border-t border-slate-200 p-3">
      <button type="button" class="flex min-h-10 w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-500 hover:bg-slate-50 hover:text-slate-900"
        :class="{ 'justify-center': collapsed }" :aria-label="collapsed ? (locale === 'id' ? 'Buka sidebar' : 'Expand sidebar') : (locale === 'id' ? 'Tutup sidebar' : 'Collapse sidebar')" :aria-expanded="!collapsed" :title="collapsed ? (locale === 'id' ? 'Buka sidebar' : 'Expand sidebar') : undefined" @click="$emit('toggleCollapse')">
        <PanelLeftOpen v-if="collapsed" :size="18" aria-hidden="true" /><PanelLeftClose v-else :size="18" aria-hidden="true" />
        <span v-if="!collapsed">{{ locale === 'id' ? 'Tutup sidebar' : 'Collapse sidebar' }}</span>
      </button>
    </div>
  </div>
</template>
