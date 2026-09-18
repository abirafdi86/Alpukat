import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useStorage } from '@vueuse/core'

export const useAppStore = defineStore('app', () => {
  const navigationOpen = ref(false)
  const sidebarCollapsed = useStorage('afms:sidebar-collapsed', false)
  function closeNavigation() { navigationOpen.value = false }
  function toggleNavigation() { navigationOpen.value = !navigationOpen.value }
  function toggleSidebar() { sidebarCollapsed.value = !sidebarCollapsed.value }
  return { navigationOpen, sidebarCollapsed, closeNavigation, toggleNavigation, toggleSidebar }
})
