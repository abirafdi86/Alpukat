<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import PagePlaceholder from '@/components/PagePlaceholder.vue'
import AuthLocaleSwitcher from '@/components/auth/AuthLocaleSwitcher.vue'
import { useLocale } from '@/composables/useLocale'

const route = useRoute()
const { t } = useLocale()
const page = computed(() => typeof route.name === 'string' ? route.name : 'help')
</script>

<template>
  <section>
    <div class="mb-5 flex justify-end"><AuthLocaleSwitcher /></div>
    <PagePlaceholder :title="t(`publicPages.${page}.title`)" :description="t(`publicPages.${page}.description`)" :empty-title="t('publicPages.pendingTitle')" :empty-description="t('publicPages.pendingDescription')" :badge="t('publicPages.comingSoon')" />
    <RouterLink to="/login" class="mt-5 inline-flex min-h-11 items-center text-sm font-medium text-green-700 hover:underline">{{ t('passwordRecovery.backToLogin') }}</RouterLink>
  </section>
</template>
