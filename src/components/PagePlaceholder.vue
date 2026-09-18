<script setup lang="ts">
import { UiBadge, UiEmptyState } from '@/components/ui'

defineProps<{ title: string; description: string }>()
</script>

<template>
  <section>
    <h1 class="page-title">{{ title }}</h1>
    <p class="secondary-text mt-2">{{ description }}</p>
    <div class="ui-card mt-8">
      <UiEmptyState :title="`${title} is ready to grow`" description="This module is a placeholder. Features will be added in a future development phase.">
        <UiBadge>Coming soon</UiBadge>
      </UiEmptyState>
    </div>
  </section>
</template>
