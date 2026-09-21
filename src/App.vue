<script setup lang="ts">
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import DefaultLayout from '@/layouts/default.vue'
import AuthLayout from '@/layouts/auth.vue'
import PublicLayout from '@/layouts/public.vue'

const route = useRoute()
const layout = computed(() => {
  if (route.meta.layout === 'auth') return AuthLayout
  if (route.meta.layout === 'public') return PublicLayout
  return DefaultLayout
})
</script>

<template>
  <component :is="layout"><RouterView /></component>
</template>
