<script setup lang="ts">
defineProps<{ title?: string; description?: string }>()
</script>

<template>
  <section class="ui-card">
    <header v-if="title || $slots.header || $slots.actions" class="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-6">
      <slot name="header">
        <div><h2 v-if="title" class="section-title">{{ title }}</h2><p v-if="description" class="secondary-text mt-1">{{ description }}</p></div>
      </slot>
      <slot name="actions" />
    </header>
    <div class="p-5 sm:p-6"><slot /></div>
    <footer v-if="$slots.footer" class="border-t border-slate-200 px-5 py-4 sm:px-6"><slot name="footer" /></footer>
  </section>
</template>
