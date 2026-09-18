<script setup lang="ts">
import { watch } from 'vue'
import { useRoute } from 'vue-router'
import AppSidebar from '@/components/AppSidebar.vue'
import AppHeader from '@/components/AppHeader.vue'
import AppMobileDrawer from '@/components/AppMobileDrawer.vue'
import { useAppStore } from '@/stores/app'
import { useLocale } from '@/composables/useLocale'

const appStore = useAppStore()
const route = useRoute()
const { t } = useLocale()
watch(() => route.fullPath, () => appStore.closeNavigation())
</script>

<template>
  <div class="min-h-dvh">
    <a href="#main-content" class="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-white focus:p-3">{{ t('common.skipToContent') }}</a>
    <aside class="fixed inset-y-0 left-0 z-30 hidden border-r border-slate-200 lg:block" :class="appStore.sidebarCollapsed ? 'w-20' : 'w-[260px]'">
      <AppSidebar :collapsed="appStore.sidebarCollapsed" @toggle-collapse="appStore.toggleSidebar" />
    </aside>
    <div :class="appStore.sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-[260px]'">
      <AppHeader :navigation-open="appStore.navigationOpen" @open-navigation="appStore.toggleNavigation" />
      <main id="main-content" tabindex="-1" class="min-w-0 p-6 lg:p-8"><div class="mx-auto max-w-screen-2xl"><slot /></div></main>
    </div>
    <AppMobileDrawer v-model="appStore.navigationOpen" />
  </div>
</template>
