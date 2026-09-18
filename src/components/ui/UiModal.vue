<script setup lang="ts">
import { ref, useId, watch, onBeforeUnmount } from 'vue'
import { X } from 'lucide-vue-next'
import UiButton from './UiButton.vue'

defineProps<{ title: string; description?: string }>()
const open = defineModel<boolean>({ required: true })
const dialog = ref<HTMLDialogElement>()
const titleId = useId()
const descriptionId = useId()
let previousFocus: HTMLElement | null = null

watch([open, dialog], ([isOpen, element]) => {
  if (!element) return
  if (isOpen && !element.open) {
    previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    element.showModal()
  } else if (!isOpen && element.open) {
    element.close()
    previousFocus?.focus()
  }
}, { flush: 'post' })

function onClose() {
  // Ignore a queued close event if the dialog has already reopened.
  if (!dialog.value?.open) open.value = false
}
onBeforeUnmount(() => {
  dialog.value?.close()
  previousFocus?.focus()
})
</script>

<template>
  <Teleport to="body">
    <dialog ref="dialog" class="ui-modal max-w-lg" :aria-labelledby="titleId" :aria-describedby="description ? descriptionId : undefined"
      @cancel.prevent="open = false" @close="onClose">
      <header class="flex items-start justify-between gap-4 border-b border-slate-200 p-5 sm:p-6">
        <div><h2 :id="titleId" class="section-title">{{ title }}</h2><p v-if="description" :id="descriptionId" class="secondary-text mt-1">{{ description }}</p></div>
        <UiButton variant="ghost" class="shrink-0 px-2" aria-label="Close dialog" @click="open = false"><X :size="18" aria-hidden="true" /></UiButton>
      </header>
      <div class="p-5 sm:p-6"><slot /></div>
      <footer v-if="$slots.footer" class="flex flex-wrap justify-end gap-3 border-t border-slate-200 p-5 sm:p-6"><slot name="footer" /></footer>
    </dialog>
  </Teleport>
</template>
