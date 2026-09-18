<script setup lang="ts">
import { computed, useId } from 'vue'
import { ChevronDown } from 'lucide-vue-next'
import type { SelectOption } from '@/types/ui'
defineOptions({ inheritAttrs: false })
const props = defineProps<{ id?: string; label: string; options: SelectOption[]; placeholder?: string; hint?: string; error?: string }>()
const model = defineModel<string>()
const generatedId = useId()
const selectId = computed(() => props.id ?? generatedId)
const descriptionId = computed(() => props.error || props.hint ? `${selectId.value}-description` : undefined)
</script>

<template>
  <div class="space-y-1.5">
    <label v-if="label" :for="selectId" class="ui-label">{{ label }}</label>
    <div class="relative">
      <select v-bind="$attrs" :id="selectId" v-model="model" class="ui-field appearance-none pr-10"
        :aria-invalid="error ? true : undefined"
        :aria-describedby="[descriptionId, $attrs['aria-describedby']].filter(Boolean).join(' ') || undefined">
        <option v-if="placeholder" disabled value="">{{ placeholder }}</option>
        <option v-for="option in options" :key="option.value" :value="option.value" :disabled="option.disabled">{{ option.label }}</option>
      </select>
      <ChevronDown :size="16" class="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-slate-500" aria-hidden="true" />
    </div>
    <p v-if="error || hint" :id="descriptionId" class="text-xs leading-5" :class="error ? 'text-red-700' : 'text-slate-500'">{{ error || hint }}</p>
  </div>
</template>
