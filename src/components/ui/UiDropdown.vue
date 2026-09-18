<script setup lang="ts">
import { ref, useId } from 'vue'
import { onClickOutside } from '@vueuse/core'
import { ChevronDown } from 'lucide-vue-next'
import type { ButtonVariant, DropdownItem } from '@/types/ui'
import UiButton from './UiButton.vue'

withDefaults(defineProps<{ label: string; items: DropdownItem[]; variant?: ButtonVariant }>(), { variant: 'secondary' })
const emit = defineEmits<{ select: [id: string] }>()
const root = ref<HTMLElement>()
const open = ref(false)
const panelId = useId()
onClickOutside(root, () => { open.value = false })
function close(restoreFocus = false) {
  open.value = false
  if (restoreFocus) root.value?.querySelector('button')?.focus()
}
function select(id: string) { close(true); emit('select', id) }
function onFocusOut(event: FocusEvent) {
  if (!root.value?.contains(event.relatedTarget as Node | null)) close()
}
</script>

<template>
  <div ref="root" class="relative inline-block" @keydown.esc.stop.prevent="close(true)" @focusout="onFocusOut">
    <UiButton :variant="variant" :aria-label="label" :aria-expanded="open" :aria-controls="panelId" @click="open = !open">
      <slot name="trigger">{{ label }}</slot><ChevronDown :size="16" aria-hidden="true" />
    </UiButton>
    <div v-if="open" :id="panelId" class="absolute right-0 z-30 mt-2 w-56 max-w-[calc(100vw-2rem)] rounded-lg border border-slate-200 bg-white p-1.5 shadow-sm">
      <ul :aria-label="label">
        <li v-for="item in items" :key="item.id">
          <button type="button" :disabled="item.disabled" class="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-slate-50 disabled:opacity-50"
            :class="item.danger ? 'text-red-700' : 'text-slate-700'" @click="select(item.id)">{{ item.label }}</button>
        </li>
      </ul>
    </div>
  </div>
</template>
