<script setup lang="ts">
import { computed, useId } from 'vue'
defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<{
  id?: string; label: string; hint?: string; error?: string
  type?: 'text' | 'email' | 'password' | 'number' | 'date' | 'search' | 'tel' | 'url'
}>(), { type: 'text' })
const model = defineModel<string | number>()
const generatedId = useId()
const inputId = computed(() => props.id ?? generatedId)
const descriptionId = computed(() => props.error || props.hint ? `${inputId.value}-description` : undefined)
</script>

<template>
  <div class="space-y-1.5">
    <label :for="inputId" class="ui-label">{{ label }}</label>
    <div class="relative">
      <input v-bind="$attrs" :id="inputId" v-model="model" :type="type" class="ui-field" :class="{ 'pr-12': $slots.trailing }"
        :aria-invalid="error ? true : undefined"
        :aria-describedby="[descriptionId, $attrs['aria-describedby']].filter(Boolean).join(' ') || undefined" />
      <div v-if="$slots.trailing" class="absolute inset-y-0 right-1 flex items-center"><slot name="trailing" /></div>
    </div>
    <p v-if="error || hint" :id="descriptionId" :aria-live="error ? 'polite' : undefined" class="text-xs leading-5" :class="error ? 'text-red-700' : 'text-slate-500'">{{ error || hint }}</p>
  </div>
</template>
