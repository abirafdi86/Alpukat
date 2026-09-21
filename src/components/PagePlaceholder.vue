<script setup lang="ts">
import { UiBadge, UiEmptyState } from '@/components/ui'

const props = withDefaults(defineProps<{ title: string; description: string; emptyTitle?: string; emptyDescription?: string; badge?: string }>(), {
  emptyTitle: undefined,
  emptyDescription: 'This module is a placeholder. Features will be added in a future development phase.',
  badge: 'Coming soon',
})
</script>

<template>
  <section>
    <h1 class="page-title">{{ title }}</h1>
    <p class="secondary-text mt-2">{{ description }}</p>
    <div class="ui-card mt-8">
      <UiEmptyState :title="props.emptyTitle ?? `${title} is ready to grow`" :description="props.emptyDescription">
        <UiBadge>{{ props.badge }}</UiBadge>
      </UiEmptyState>
    </div>
  </section>
</template>
