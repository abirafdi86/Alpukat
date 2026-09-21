<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { Bell, ChevronRight, Menu, Search } from 'lucide-vue-next'
import { navigationGroups, navigationItems } from '@/constants/navigation'
import { UiDropdown, UiInput, UiModal } from '@/components/ui'
import type { DropdownItem } from '@/types/ui'
import { useAuthStore } from '@/stores/auth'
import { useLocale } from '@/composables/useLocale'

defineProps<{ navigationOpen: boolean }>()
defineEmits<{ openNavigation: [] }>()
const route = useRoute()
const router = useRouter()
const section = computed(() => { const group = navigationGroups.find((candidate) => candidate.items.some((item) => item.to === route.path)); return group?.labelKey ? t(group.labelKey) : t('common.details') })
const title = computed(() => {
  const routeKey = route.path.startsWith('/sales/') ? 'sales' : route.path.startsWith('/customers/') ? 'customers' : typeof route.name === 'string' ? route.name.replace(/-detail$/, '') : 'dashboard'
  return routeKey === 'login' || routeKey === 'register' ? String(route.meta.title ?? '') : t(`navigation.${routeKey}`)
})
const auth = useAuthStore()
const { t, locale, setLocale } = useLocale()
const user = computed(() => {
  const profile = auth.user ?? { name: 'Demo Owner', role: 'OWNER' as const }
  return { ...profile, initials: profile.name.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase() }
})
const userActions = computed<DropdownItem[]>(() => [
  { id: 'profile', label: t('common.details') },
  { id: 'settings', label: t('navigation.settings') },
  { id: 'logout', label: locale.value === 'id' ? 'Keluar' : 'Logout', danger: true },
])
const searchOpen = ref(false)
const notificationsOpen = ref(false)
const profileOpen = ref(false)
const query = ref('')
const results = computed(() => navigationItems.filter(item => (item.to !== '/users' || auth.user?.role === 'OWNER') && t(item.labelKey).toLowerCase().includes(query.value.trim().toLowerCase())))
watch(searchOpen, value => { if (value) query.value = '' })
watch(() => route.fullPath, () => { searchOpen.value = false; notificationsOpen.value = false; profileOpen.value = false })
async function handleUserAction(action: string) {
  if (action === 'profile') profileOpen.value = true
  else if (action === 'settings') void router.push('/settings')
  else if (action === 'logout') { await auth.logout(); await router.replace('/login') }
}
</script>

<template>
  <header class="sticky top-0 z-20 flex h-16 items-center justify-between gap-2 border-b border-slate-200 bg-white px-4 sm:gap-4 lg:px-6 xl:px-8">
    <div class="flex min-w-0 items-center gap-2 sm:gap-3">
      <button type="button" class="shrink-0 rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden" aria-label="Open navigation" :aria-expanded="navigationOpen" aria-controls="mobile-navigation" @click="$emit('openNavigation')"><Menu :size="21" aria-hidden="true" /></button>
      <nav :aria-label="t('common.details')" class="min-w-0">
        <ol class="flex min-w-0 items-center gap-2 text-sm">
          <li class="hidden whitespace-nowrap text-slate-500 xl:block">{{ section }}</li>
          <li class="hidden text-slate-300 xl:block"><ChevronRight :size="15" aria-hidden="true" /></li>
          <li aria-current="page" class="truncate font-medium text-slate-900">{{ title }}</li>
        </ol>
      </nav>
    </div>
    <div class="flex shrink-0 items-center gap-1 sm:gap-3">
      <button type="button" class="flex size-10 items-center justify-center gap-2 rounded-lg text-slate-500 hover:bg-slate-50 md:w-44 md:justify-start md:border md:border-slate-200 md:px-3 xl:w-56" :aria-label="t('common.search')" aria-haspopup="dialog" @click="searchOpen = true">
        <Search :size="18" aria-hidden="true" /><span class="hidden text-sm md:inline">{{ t('common.search') }}…</span>
      </button>
      <button type="button" class="rounded-lg p-2.5 text-slate-500 hover:bg-slate-100" :aria-label="locale === 'id' ? 'Notifikasi' : 'Notifications'" aria-haspopup="dialog" @click="notificationsOpen = true"><Bell :size="19" aria-hidden="true" /></button>
      <label class="sr-only" for="locale-switcher">{{ t('common.language') }}</label><select id="locale-switcher" class="ui-field h-11 min-h-11 w-[5.5rem] px-2 text-xs" :value="locale" @change="setLocale(($event.target as HTMLSelectElement).value as 'id' | 'en')"><option value="id">ID</option><option value="en">EN</option></select>
      <div class="ml-1 border-l border-slate-200 pl-2 sm:pl-4">
        <UiDropdown :label="locale === 'id' ? 'Menu pengguna' : 'User menu'" :items="userActions" variant="ghost" @select="handleUserAction">
          <template #trigger>
            <span class="flex size-8 shrink-0 items-center justify-center rounded-full bg-green-50 text-xs font-semibold text-green-700" aria-hidden="true">{{ user.initials }}</span>
            <span class="hidden text-left lg:block"><span class="block text-sm font-medium leading-5 text-slate-900">{{ user.name }}</span><span class="block text-xs leading-4 text-slate-500">{{ user.role }}</span></span>
          </template>
        </UiDropdown>
      </div>
    </div>
  </header>
  <UiModal v-model="searchOpen" :title="t('common.search')" :description="locale === 'id' ? 'Buka halaman ruang kerja.' : 'Jump to a workspace page.'">
    <UiInput v-model="query" :label="locale === 'id' ? 'Nama halaman' : 'Page name'" type="search" placeholder="Search farms, trees, reports…" autocomplete="off" autofocus />
    <ul v-if="results.length" class="mt-4 max-h-72 space-y-1 overflow-y-auto" aria-label="Search results">
      <li v-for="item in results" :key="item.to"><RouterLink :to="item.to" class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-green-50 hover:text-green-700" @click="searchOpen = false"><component :is="item.icon" :size="18" aria-hidden="true" />{{ t(item.labelKey) }}</RouterLink></li>
    </ul>
    <p v-else class="secondary-text mt-4" role="status">{{ locale === 'id' ? 'Tidak ada halaman yang cocok dengan' : 'No pages match' }} “{{ query }}”.</p>
  </UiModal>
  <UiModal v-model="notificationsOpen" :title="locale === 'id' ? 'Notifikasi' : 'Notifications'">
    <div class="py-6 text-center"><Bell :size="24" class="mx-auto text-slate-400" aria-hidden="true" /><p class="mt-3 font-medium">{{ t('notifications.noNotifications') }}</p><p class="secondary-text mt-1">{{ t('notifications.noNotificationsDescription') }}</p></div>
  </UiModal>
  <UiModal v-model="profileOpen" :title="locale === 'id' ? 'Profil' : 'Profile'" :description="locale === 'id' ? 'Akun ruang kerja' : 'Workspace account'">
    <dl class="space-y-4"><div><dt class="secondary-text">{{ locale === 'id' ? 'Nama' : 'Name' }}</dt><dd class="font-medium">{{ user.name }}</dd></div><div><dt class="secondary-text">{{ locale === 'id' ? 'Peran' : 'Role' }}</dt><dd class="font-medium">{{ user.role }}</dd></div></dl>
  </UiModal>
</template>
