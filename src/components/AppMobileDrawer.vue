<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from 'vue'
import { useMediaQuery, useScrollLock } from '@vueuse/core'
import AppSidebar from './AppSidebar.vue'

const open = defineModel<boolean>({ required: true })
const dialog = ref<HTMLDialogElement>()
const desktop = useMediaQuery('(min-width: 1024px)')
const scrollLocked = useScrollLock(document.body)
let trigger: HTMLElement | null = null

watch(desktop, value => { if (value) open.value = false })
watch([open, dialog], ([visible, element]) => {
  if (!element) return
  if (visible && !element.open) {
    trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null
    element.showModal()
    scrollLocked.value = true
  } else if (!visible && element.open) {
    element.close()
    scrollLocked.value = false
    if (!desktop.value) trigger?.focus()
  }
}, { flush: 'post' })
function onClose() {
  if (!dialog.value?.open) { open.value = false; scrollLocked.value = false }
}
function onBackdropClick(event: MouseEvent) {
  if (event.target !== dialog.value) return
  const bounds = dialog.value.getBoundingClientRect()
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) open.value = false
}
onBeforeUnmount(() => { dialog.value?.close(); scrollLocked.value = false })
</script>

<template>
  <Teleport to="body">
    <dialog id="mobile-navigation" ref="dialog" aria-label="Farm Management navigation" class="app-drawer" @cancel.prevent="open = false" @close="onClose" @click="onBackdropClick">
      <AppSidebar mobile @close="open = false" @navigate="open = false" />
    </dialog>
  </Teleport>
</template>
