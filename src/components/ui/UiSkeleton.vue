<script setup lang="ts">
withDefaults(defineProps<{ shape?: 'text' | 'rectangle' | 'circle' }>(), { shape: 'text' })
const shapes = { text: 'h-4 w-full rounded', rectangle: 'h-24 w-full rounded-lg', circle: 'size-10 rounded-full' }
</script>

<template><div aria-hidden="true" class="bg-slate-200 motion-safe:animate-pulse" :class="shapes[shape]" /></template>
