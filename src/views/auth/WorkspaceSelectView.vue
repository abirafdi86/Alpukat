<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowRight, Building2, ShieldAlert } from 'lucide-vue-next'
import { UiButton } from '@/components/ui'
import { useAuthStore } from '@/stores/auth.store'
import { useWorkspaceStore } from '@/stores/workspace.store'
import { resolvePostWorkspaceSelectionDestination } from '@/router/guards'
import { useLocale } from '@/composables/useLocale'

const auth = useAuthStore()
const workspace = useWorkspaceStore()
const route = useRoute()
const router = useRouter()
const { t } = useLocale()
const selectingId = ref<string | null>(null)

async function selectWorkspace(workspaceId: string) {
  if (selectingId.value || !workspace.selectWorkspace(workspaceId)) return
  selectingId.value = workspaceId
  await router.replace(resolvePostWorkspaceSelectionDestination(router, route.query.redirect))
}

async function signOut() {
  await auth.logout()
  await router.replace({ name: 'login' })
}
</script>

<template>
  <section aria-labelledby="workspace-title">
    <p class="mb-3 text-xs font-semibold uppercase tracking-widest text-green-700">{{ t('workspaceSelect.eyebrow') }}</p>
    <h1 id="workspace-title" class="page-title">{{ workspace.availableMemberships.length ? t('workspaceSelect.title') : t('workspaceSelect.noAccessTitle') }}</h1>
    <p class="secondary-text mt-2">{{ workspace.availableMemberships.length ? t('workspaceSelect.description') : t('workspaceSelect.noAccessDescription') }}</p>

    <div v-if="route.query.error === 'access-denied'" role="alert" class="mt-6 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
      <ShieldAlert :size="20" class="mt-0.5 shrink-0" aria-hidden="true" />
      <p>{{ t('workspaceSelect.accessDenied') }}</p>
    </div>

    <ul v-if="workspace.availableMemberships.length" class="mt-7 space-y-3" :aria-label="t('workspaceSelect.listLabel')">
      <li v-for="membership in workspace.availableMemberships" :key="membership.id">
        <button type="button" class="flex min-h-20 w-full items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-colors hover:border-green-300 hover:bg-green-50 focus-visible:outline-green-700 disabled:opacity-60" :disabled="selectingId !== null" @click="selectWorkspace(membership.workspaceId)">
          <span class="flex size-11 shrink-0 items-center justify-center rounded-lg bg-green-50 text-green-700"><Building2 :size="22" aria-hidden="true" /></span>
          <span class="min-w-0 flex-1"><span class="block truncate font-semibold text-slate-900">{{ membership.workspaceName }}</span><span class="mt-0.5 block text-xs text-slate-500">{{ t(`workspaceSelect.roles.${membership.role.toLowerCase()}`) }}</span></span>
          <ArrowRight :size="18" class="shrink-0 text-slate-400" aria-hidden="true" />
        </button>
      </li>
    </ul>

    <div v-else class="mt-7 rounded-xl border border-slate-200 bg-white p-6 text-center">
      <Building2 :size="28" class="mx-auto text-slate-400" aria-hidden="true" />
      <p class="mt-3 text-sm text-slate-600">{{ t('workspaceSelect.contactSupport') }}</p>
      <UiButton variant="secondary" class="mt-5" :loading="auth.isLoading" :loading-label="t('common.loading')" @click="signOut">{{ t('workspaceSelect.signOut') }}</UiButton>
    </div>
  </section>
</template>
