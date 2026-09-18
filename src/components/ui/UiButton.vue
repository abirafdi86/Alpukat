<script setup lang="ts">
import { LoaderCircle } from 'lucide-vue-next'
import type { ButtonVariant } from '@/types/ui'

withDefaults(defineProps<{
  variant?: ButtonVariant
  size?: 'sm' | 'md' | 'lg'
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  loading?: boolean
}>(), { variant: 'primary', size: 'md', type: 'button' })

const variants: Record<ButtonVariant, string> = {
  primary: 'ui-button-primary', secondary: 'ui-button-secondary',
  ghost: 'ui-button-ghost', danger: 'ui-button-danger',
}
const sizes = { sm: 'min-h-9 px-3 py-1.5', md: '', lg: 'min-h-11 px-5 py-2.5' }
</script>

<template>
  <button :type="type" :disabled="disabled || loading" :aria-busy="loading || undefined" class="ui-button" :class="[variants[variant], sizes[size]]">
    <LoaderCircle v-if="loading" :size="16" class="motion-safe:animate-spin" aria-hidden="true" />
    <slot name="leading" v-else />
    <slot />
    <span v-if="loading" class="sr-only">Loading</span>
    <slot name="trailing" />
  </button>
</template>
