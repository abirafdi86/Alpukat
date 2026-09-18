<script setup lang="ts">
import { ref } from 'vue'
import { Eye, EyeOff } from 'lucide-vue-next'
import { UiInput } from '@/components/ui'
defineOptions({ inheritAttrs: false })
defineProps<{ label: string; error?: string; hint?: string; disabled?: boolean }>()
const model = defineModel<string>({ required: true })
const visible = ref(false)
</script>

<template>
  <UiInput v-bind="$attrs" v-model="model" :label="label" :type="visible ? 'text' : 'password'" :hint="hint" :error="error" :disabled="disabled">
    <template #trailing>
      <button type="button" :disabled="disabled" class="flex size-10 items-center justify-center rounded-lg text-slate-500 hover:text-green-700 disabled:opacity-50"
        :aria-label="visible ? 'Hide ' + label.toLowerCase() : 'Show ' + label.toLowerCase()" :aria-pressed="visible" @click="visible = !visible">
        <EyeOff v-if="visible" :size="18" aria-hidden="true" /><Eye v-else :size="18" aria-hidden="true" />
      </button>
    </template>
  </UiInput>
</template>
