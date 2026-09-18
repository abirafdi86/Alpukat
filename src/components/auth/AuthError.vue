<script setup lang="ts">
import { CircleAlert } from 'lucide-vue-next'
defineProps<{ message: string }>()
</script>

<template>
  <div v-if="message" role="alert" class="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm leading-5 text-red-800">
    <CircleAlert :size="18" class="mt-0.5 shrink-0" aria-hidden="true" /><p>{{ message }}</p>
  </div>
</template>
