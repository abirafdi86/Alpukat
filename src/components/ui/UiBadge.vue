<script setup lang="ts">
import type { StatusTone } from '@/types/ui'
import { toneClasses } from '@/constants/ui'
withDefaults(defineProps<{ tone?: StatusTone }>(), { tone: 'neutral' })
</script>

<template><span class="ui-badge" :class="toneClasses[tone]"><slot /></span></template>
