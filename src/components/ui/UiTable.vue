<script setup lang="ts">
defineProps<{ caption: string }>()
</script>

<template>
  <div class="ui-card overflow-hidden">
    <div class="overflow-x-auto focus-visible:outline-offset-[-2px]" role="region" :aria-label="caption" tabindex="0">
      <table class="ui-table">
        <caption>{{ caption }}</caption>
        <thead><slot name="head" /></thead>
        <tbody><slot /></tbody>
        <tfoot v-if="$slots.footer"><slot name="footer" /></tfoot>
      </table>
    </div>
  </div>
</template>
