<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import {
  Activity,
  ArrowRight,
  BarChart3,
  Boxes,
  ChartNoAxesCombined,
  ClipboardCheck,
  ClipboardList,
  Database,
  LayoutDashboard,
  Map as MapIcon,
  Menu,
  PackageCheck,
  ShoppingCart,
  Sprout,
  TrendingUp,
  Trees,
  UsersRound,
  WalletCards,
  X,
} from 'lucide-vue-next'
import AppBrand from '@/components/AppBrand.vue'
import AuthError from '@/components/auth/AuthError.vue'
import AuthLocaleSwitcher from '@/components/auth/AuthLocaleSwitcher.vue'
import { UiButton } from '@/components/ui'
import { useLocale } from '@/composables/useLocale'
import { useAuthStore } from '@/stores/auth.store'
import { authErrorMessageKeys, normalizeAuthError } from '@/services/auth.service'
import { resolveAuthenticatedDestination } from '@/router/guards'
import {
  landingHarvestTrend,
  landingPreviewActivities,
  landingPreviewMetrics,
} from '@/data/landingPreview'
import type { AuthErrorCode } from '../../../shared/types/auth'

const { t } = useLocale()
const router = useRouter()
const auth = useAuthStore()
const isMenuOpen = ref(false)
const demoPending = ref(false)
const demoErrorCode = ref<AuthErrorCode>()
const demoErrorOrigin = ref<'hero' | 'final'>()
const retryAfterSeconds = ref(0)
let demoController: AbortController | undefined
let retryTimer: number | undefined

const isAuthenticatedVisitor = computed(() => auth.isHydrated && auth.isAuthenticated)
const primaryDestination = computed(() => isAuthenticatedVisitor.value
  ? resolveAuthenticatedDestination(router, auth.workspaceCount)
  : { name: 'register' })
const primaryActionLabel = computed(() => isAuthenticatedVisitor.value ? t('landing.actions.openDashboard') : t('landing.actions.getStarted'))
const demoDisabled = computed(() => demoPending.value || auth.isLoading || retryAfterSeconds.value > 0)
const demoActionLabel = computed(() => {
  if (demoPending.value) return t('authActions.exploringDemo')
  if (retryAfterSeconds.value > 0) return t('authStatus.retryIn', { seconds: retryAfterSeconds.value })
  return t('landing.actions.exploreDemo')
})
const demoError = computed(() => {
  if (!demoErrorCode.value) return ''
  if (demoErrorCode.value === 'TOO_MANY_ATTEMPTS' && retryAfterSeconds.value > 0) {
    return t('authErrors.tooManyAttemptsWithRetry', { seconds: retryAfterSeconds.value })
  }
  return t(authErrorMessageKeys[demoErrorCode.value])
})
const currentYear = new Date().getFullYear()

const featureItems = [
  { key: 'farm', icon: MapIcon },
  { key: 'plants', icon: Trees },
  { key: 'activities', icon: ClipboardCheck },
  { key: 'harvest', icon: PackageCheck },
  { key: 'inventory', icon: Boxes },
  { key: 'expenses', icon: WalletCards },
  { key: 'sales', icon: ShoppingCart },
  { key: 'analytics', icon: ChartNoAxesCombined },
] as const

const flowSteps = ['workspace', 'farm', 'operations', 'harvestSales', 'performance'] as const

function closeMenu() {
  isMenuOpen.value = false
}

function startRetryCountdown(seconds?: number) {
  if (!seconds || seconds <= 0) return
  retryAfterSeconds.value = seconds
  if (retryTimer) window.clearInterval(retryTimer)
  retryTimer = window.setInterval(() => {
    retryAfterSeconds.value = Math.max(0, retryAfterSeconds.value - 1)
    if (retryAfterSeconds.value === 0 && retryTimer) {
      window.clearInterval(retryTimer)
      retryTimer = undefined
      demoErrorCode.value = undefined
    }
  }, 1000)
}

async function exploreDemo(origin: 'hero' | 'final' = 'hero') {
  if (demoDisabled.value) return
  demoErrorOrigin.value = origin
  demoErrorCode.value = undefined
  if (auth.isAuthenticated) {
    await router.replace(resolveAuthenticatedDestination(router, auth.workspaceCount))
    return
  }

  const controller = new AbortController()
  demoController = controller
  demoPending.value = true
  try {
    await auth.loginDemo(controller.signal)
    if (!controller.signal.aborted) {
      await router.replace(resolveAuthenticatedDestination(router, auth.workspaceCount))
    }
  } catch (cause) {
    if (!controller.signal.aborted) {
      const error = normalizeAuthError(cause)
      demoErrorCode.value = error.code
      if (error.code === 'TOO_MANY_ATTEMPTS') startRetryCountdown(error.retryAfterSeconds)
    }
  } finally {
    if (demoController === controller) {
      demoController = undefined
      demoPending.value = false
    }
  }
}

onBeforeUnmount(() => {
  demoController?.abort()
  if (retryTimer) window.clearInterval(retryTimer)
})
</script>

<template>
  <a href="#main-content"
    class="sr-only z-50 rounded-lg bg-white px-4 py-3 font-medium text-green-800 focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
    {{ t('common.skipToContent') }}
  </a>

  <header class="relative z-40 border-b border-slate-200 bg-white" @keydown.esc="closeMenu">
    <nav class="mx-auto flex min-h-18 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8"
      :aria-label="t('landing.nav.label')">
      <AppBrand to="/" :aria-label="t('landing.nav.home')" />

      <div class="hidden items-center gap-8 md:flex">
        <a href="#features" class="inline-flex min-h-11 items-center font-medium text-slate-600 hover:text-green-700">{{
          t('landing.nav.features') }}</a>
        <a href="#how-it-works"
          class="inline-flex min-h-11 items-center font-medium text-slate-600 hover:text-green-700">{{
            t('landing.nav.howItWorks') }}</a>
      </div>

      <div class="hidden items-center gap-2 md:flex">
        <AuthLocaleSwitcher />
        <RouterLink v-if="!isAuthenticatedVisitor" to="/login" class="ui-button ui-button-ghost">{{
          t('landing.actions.signIn') }}</RouterLink>
        <RouterLink :to="primaryDestination" class="ui-button ui-button-primary">{{ primaryActionLabel }}</RouterLink>
      </div>

      <div class="flex items-center gap-2 md:hidden">
        <button type="button"
          class="inline-flex size-11 items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
          :aria-label="isMenuOpen ? t('landing.nav.closeMenu') : t('landing.nav.openMenu')" :aria-expanded="isMenuOpen"
          aria-controls="landing-mobile-menu" @click="isMenuOpen = !isMenuOpen">
          <X v-if="isMenuOpen" :size="22" aria-hidden="true" />
          <Menu v-else :size="22" aria-hidden="true" />
        </button>
      </div>
    </nav>

    <div v-if="isMenuOpen" id="landing-mobile-menu"
      class="border-t border-slate-200 bg-white px-4 py-4 shadow-sm md:hidden">
      <div class="mx-auto grid max-w-7xl gap-1">
        <a href="#features"
          class="flex min-h-11 items-center rounded-lg px-3 font-medium text-slate-700 hover:bg-green-50 hover:text-green-700"
          @click="closeMenu">{{ t('landing.nav.features') }}</a>
        <a href="#how-it-works"
          class="flex min-h-11 items-center rounded-lg px-3 font-medium text-slate-700 hover:bg-green-50 hover:text-green-700"
          @click="closeMenu">{{ t('landing.nav.howItWorks') }}</a>
        <div class="my-2 border-t border-slate-200"></div>
        <div class="flex min-h-11 items-center justify-between gap-3 px-3"><span
            class="text-sm font-medium text-slate-700">{{ t('common.language') }}</span>
          <AuthLocaleSwitcher />
        </div>
        <RouterLink v-if="!isAuthenticatedVisitor" to="/login" class="ui-button ui-button-secondary w-full"
          @click="closeMenu">{{ t('landing.actions.signIn') }}</RouterLink>
        <RouterLink :to="primaryDestination" class="ui-button ui-button-primary mt-2 w-full" @click="closeMenu">{{
          primaryActionLabel }}</RouterLink>
      </div>
    </div>
  </header>

  <main id="main-content">
    <section class="relative overflow-hidden bg-gradient-to-b from-green-50/80 to-white"
      aria-labelledby="landing-title">
      <div
        class="pointer-events-none absolute -right-32 top-10 size-80 rounded-full border border-green-100 bg-green-50"
        aria-hidden="true"></div>
      <div
        class="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[minmax(0,0.9fr)_minmax(520px,1.1fr)] lg:gap-16 lg:px-8 lg:py-14">
        <div class="min-w-0">
          <p
            class="inline-flex items-center gap-2 rounded-full border border-green-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-widest text-green-700">
            <Sprout :size="15" aria-hidden="true" />{{ t('landing.hero.eyebrow') }}
          </p>
          <h1 id="landing-title"
            class="mt-6 max-w-2xl text-4xl font-semibold leading-tight tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
            {{ t('landing.hero.title') }}
          </h1>
          <p class="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
            {{ t('landing.hero.description') }}
          </p>

          <AuthError v-if="demoErrorOrigin === 'hero'" class="mt-6 max-w-xl" :message="demoError" />
          <div v-if="isAuthenticatedVisitor" class="mt-8 flex">
            <RouterLink :to="primaryDestination" class="ui-button ui-button-primary min-w-44">{{ t('landing.actions.openDashboard') }}<ArrowRight :size="17" aria-hidden="true" /></RouterLink>
          </div>
          <div v-else class="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <RouterLink to="/login" class="ui-button ui-button-secondary sm:min-w-32">{{ t('landing.actions.signIn') }}</RouterLink>
            <RouterLink to="/register" class="ui-button ui-button-primary sm:min-w-40">{{ t('landing.actions.getStarted') }}<ArrowRight :size="17" aria-hidden="true" /></RouterLink>
            <UiButton variant="ghost" class="sm:min-w-36" :loading="demoPending"
              :loading-label="t('authActions.exploringDemo')" :disabled="demoDisabled" @click="exploreDemo('hero')">
              {{ demoActionLabel }}
            </UiButton>
          </div>
        </div>

        <div class="min-w-0" role="region" :aria-label="t('landing.preview.ariaLabel')">
          <div class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div class="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 sm:px-5">
              <div class="flex min-w-0 items-center gap-3">
                <span class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-green-700 text-white">
                  <LayoutDashboard :size="19" aria-hidden="true" />
                </span>
                <div class="min-w-0">
                  <p class="truncate font-semibold text-slate-900">{{ t('landing.preview.title') }}</p>
                  <p class="truncate text-xs text-slate-500">{{ t('landing.preview.workspace') }}</p>
                </div>
              </div>
              <span class="shrink-0 rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700">{{
                t('landing.preview.status') }}</span>
            </div>

            <div class="grid grid-cols-2 gap-3 bg-slate-50 p-3 sm:p-5">
              <div v-for="metric in landingPreviewMetrics" :key="metric.labelKey"
                class="min-w-0 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
                <p class="min-h-8 text-xs leading-4 text-slate-500">{{ t(metric.labelKey) }}</p>
                <p class="mt-1 text-xl font-semibold tabular-nums text-slate-900">{{ t(metric.valueKey) }}</p>
                <p class="mt-1 text-[11px] leading-4 text-green-700">{{ t(metric.detailKey) }}</p>
              </div>
            </div>

            <div class="grid gap-4 p-3 sm:p-5 lg:grid-cols-[1.1fr_0.9fr]">
              <div class="rounded-lg border border-slate-200 p-4">
                <div class="flex items-center justify-between gap-3">
                  <p class="text-sm font-semibold text-slate-800">{{ t('landing.preview.trend') }}</p>
                  <TrendingUp :size="18" class="text-green-700" aria-hidden="true" />
                </div>
                <div class="mt-5 flex h-28 items-end gap-2" role="img" :aria-label="t('landing.preview.trendLabel')">
                  <span v-for="(height, index) in landingHarvestTrend" :key="index"
                    class="min-w-0 flex-1 rounded-t bg-green-600"
                    :style="{ height: `${height}%`, opacity: `${0.62 + index * 0.045}` }"></span>
                </div>
                <div class="mt-2 flex justify-between text-[10px] text-slate-400"><span>{{
                  t('landing.preview.weekStart') }}</span><span>{{ t('landing.preview.weekEnd') }}</span></div>
              </div>

              <div class="rounded-lg border border-slate-200 p-4">
                <p class="text-sm font-semibold text-slate-800">{{ t('landing.preview.recentActivities') }}</p>
                <ul class="mt-3 space-y-3">
                  <li v-for="activityItem in landingPreviewActivities" :key="activityItem.titleKey"
                    class="flex min-w-0 items-start gap-3">
                    <span class="mt-1.5 size-2 shrink-0 rounded-full"
                      :class="{ 'bg-emerald-500': activityItem.tone === 'success', 'bg-blue-500': activityItem.tone === 'info', 'bg-amber-500': activityItem.tone === 'warning' }"
                      aria-hidden="true"></span>
                    <div class="min-w-0">
                      <p class="text-xs font-medium leading-4 text-slate-700">{{ t(activityItem.titleKey) }}</p>
                      <p class="mt-0.5 text-[11px] leading-4 text-slate-500">{{ t(activityItem.metaKey) }}</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <p class="mt-3 text-center text-xs text-slate-500">{{ t('landing.preview.note') }}</p>
        </div>
      </div>
    </section>

    <section class="border-y border-slate-200 bg-slate-50" :aria-label="t('landing.capabilities.label')">
      <div class="mx-auto grid max-w-7xl grid-cols-2 gap-px bg-slate-200 sm:grid-cols-4">
        <div class="flex min-h-24 items-center gap-3 bg-slate-50 px-4 py-5 sm:px-6">
          <Database :size="20" class="shrink-0 text-green-700" aria-hidden="true" /><span
            class="text-sm font-medium text-slate-700">{{ t('landing.capabilities.centralized') }}</span>
        </div>
        <div class="flex min-h-24 items-center gap-3 bg-slate-50 px-4 py-5 sm:px-6">
          <ClipboardList :size="20" class="shrink-0 text-green-700" aria-hidden="true" /><span
            class="text-sm font-medium text-slate-700">{{ t('landing.capabilities.structured') }}</span>
        </div>
        <div class="flex min-h-24 items-center gap-3 bg-slate-50 px-4 py-5 sm:px-6">
          <Activity :size="20" class="shrink-0 text-green-700" aria-hidden="true" /><span
            class="text-sm font-medium text-slate-700">{{ t('landing.capabilities.monitored') }}</span>
        </div>
        <div class="flex min-h-24 items-center gap-3 bg-slate-50 px-4 py-5 sm:px-6">
          <BarChart3 :size="20" class="shrink-0 text-green-700" aria-hidden="true" /><span
            class="text-sm font-medium text-slate-700">{{ t('landing.capabilities.dataDriven') }}</span>
        </div>
      </div>
    </section>

    <section id="features" class="scroll-mt-20 px-4 py-16 sm:px-6 sm:py-20 lg:px-8" aria-labelledby="features-title">
      <div class="mx-auto max-w-7xl">
        <div class="max-w-2xl">
          <p class="text-xs font-semibold uppercase tracking-widest text-green-700">{{ t('landing.features.eyebrow') }}
          </p>
          <h2 id="features-title" class="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{{
            t('landing.features.title') }}</h2>
          <p class="mt-4 leading-7 text-slate-600">{{ t('landing.features.description') }}</p>
        </div>
        <div class="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <article v-for="feature in featureItems" :key="feature.key"
            class="group min-w-0 rounded-xl border border-slate-200 bg-white p-5 shadow-sm motion-safe:transition-colors hover:border-green-200 hover:bg-green-50/40">
            <span
              class="flex size-10 items-center justify-center rounded-lg bg-green-50 text-green-700 group-hover:bg-green-100">
              <component :is="feature.icon" :size="21" aria-hidden="true" />
            </span>
            <h3 class="mt-4 font-semibold text-slate-900">{{ t(`landing.features.items.${feature.key}.title`) }}</h3>
            <p class="mt-2 text-sm leading-6 text-slate-600">{{ t(`landing.features.items.${feature.key}.description`)
            }}</p>
          </article>
        </div>
      </div>
    </section>

    <section id="how-it-works"
      class="scroll-mt-20 border-y border-green-100 bg-green-50 px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
      aria-labelledby="how-title">
      <div class="mx-auto max-w-7xl">
        <div class="max-w-2xl">
          <p class="text-xs font-semibold uppercase tracking-widest text-green-700">{{ t('landing.how.eyebrow') }}</p>
          <h2 id="how-title" class="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{{ t('landing.how.title')
          }}</h2>
          <p class="mt-4 leading-7 text-slate-600">{{ t('landing.how.description') }}</p>
        </div>
        <ol class="mt-10 flex flex-col gap-8 lg:flex-row">
          <li v-for="(step, index) in flowSteps" :key="step"
            class="relative min-w-0 flex-1 rounded-xl border border-green-200 bg-white p-5 shadow-sm">
            <span class="flex size-9 items-center justify-center rounded-lg bg-green-700 font-semibold text-white"
              aria-hidden="true">{{ index + 1 }}</span>
            <h3 class="mt-4 font-semibold text-slate-900">{{ t(`landing.how.steps.${step}.title`) }}</h3>
            <p class="mt-2 text-sm leading-6 text-slate-600">{{ t(`landing.how.steps.${step}.description`) }}</p>
            <ArrowRight v-if="index < flowSteps.length - 1" :size="20"
              class="absolute -bottom-7 left-1/2 -translate-x-1/2 rotate-90 text-green-600 lg:-right-7 lg:bottom-auto lg:left-auto lg:top-1/2 lg:-translate-y-1/2 lg:translate-x-0 lg:rotate-0"
              aria-hidden="true" />
          </li>
        </ol>
        <div class="mt-10 rounded-xl border border-green-200 bg-white p-5 sm:p-6">
          <div class="flex items-start gap-3">
            <UsersRound :size="23" class="mt-0.5 shrink-0 text-green-700" aria-hidden="true" />
            <div>
              <h3 class="font-semibold text-slate-900">{{ t('landing.how.workspaceContext.title') }}</h3>
              <p class="mt-1 max-w-3xl text-sm leading-6 text-slate-600">{{
                t('landing.how.workspaceContext.description') }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="final-entry" class="px-4 py-16 sm:px-6 sm:py-20 lg:px-8" aria-labelledby="final-entry-title">
      <div
        class="mx-auto max-w-5xl rounded-xl border border-green-200 bg-green-50 px-5 py-10 text-center shadow-sm sm:px-10 sm:py-12">
        <p class="text-xs font-semibold uppercase tracking-widest text-green-700">{{ t('landing.finalCta.eyebrow') }}
        </p>
        <h2 id="final-entry-title"
          class="mx-auto mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">{{
            t('landing.finalCta.title') }}</h2>
        <p class="mx-auto mt-4 max-w-2xl leading-7 text-slate-600">{{ t('landing.finalCta.description') }}</p>
        <AuthError v-if="demoErrorOrigin === 'final'" class="mx-auto mt-6 max-w-xl text-left" :message="demoError" />

        <div v-if="isAuthenticatedVisitor" class="mt-8 flex justify-center">
          <RouterLink :to="primaryDestination" class="ui-button ui-button-primary min-w-44">{{
            t('landing.actions.openDashboard') }}
            <ArrowRight :size="17" aria-hidden="true" />
          </RouterLink>
        </div>
        <div v-else class="mx-auto mt-8 flex max-w-2xl flex-col justify-center gap-3 sm:flex-row">
          <RouterLink to="/register" class="ui-button ui-button-primary sm:min-w-40">{{
            t('landing.actions.createWorkspace') }}</RouterLink>
          <RouterLink to="/login" class="ui-button ui-button-secondary sm:min-w-32">{{ t('landing.actions.signIn') }}
          </RouterLink>
        </div>
      </div>
    </section>
  </main>

  <footer class="px-4 py-10 text-green-100/80 sm:px-6 lg:px-8" style="background-color: oklch(0.43 0.09 153.54);">
    <div class="mx-auto grid max-w-7xl gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_0.7fr_0.7fr]">
      <div class="max-w-sm">
        <RouterLink to="/" class="inline-flex min-h-11 items-center gap-3 rounded-lg text-white"
          :aria-label="t('landing.nav.home')">
          <span class="flex size-9 items-center justify-center rounded-lg bg-green-700">
            <Sprout :size="22" aria-hidden="true" />
          </span>
          <span class="text-lg font-semibold tracking-tight">KebunHub</span>
        </RouterLink>
        <p class="mt-3 text-sm leading-6 text-green-100/65">{{ t('landing.footer.description') }}</p>
      </div>

      <nav :aria-label="t('landing.footer.application')">
        <p class="font-semibold text-white">{{ t('landing.footer.application') }}</p>
        <ul class="mt-3 space-y-1 text-sm">
          <li><a href="#features" class="inline-flex min-h-11 items-center hover:text-white hover:underline">{{
            t('landing.nav.features') }}</a></li>
          <li><a href="#how-it-works" class="inline-flex min-h-11 items-center hover:text-white hover:underline">{{
            t('landing.nav.howItWorks') }}</a></li>
          <li v-if="!isAuthenticatedVisitor">
            <RouterLink to="/login" class="inline-flex min-h-11 items-center hover:text-white hover:underline">{{
              t('landing.actions.signIn') }}</RouterLink>
          </li>
          <li v-if="!isAuthenticatedVisitor">
            <RouterLink to="/register" class="inline-flex min-h-11 items-center hover:text-white hover:underline">{{
              t('landing.actions.createWorkspace') }}</RouterLink>
          </li>
          <li v-if="!isAuthenticatedVisitor"><button type="button"
              class="text-left text-sm hover:text-white hover:underline disabled:opacity-60" :disabled="demoDisabled"
              @click="exploreDemo('final')">{{ demoActionLabel }}</button></li>
          <li v-else>
            <RouterLink :to="primaryDestination"
              class="inline-flex min-h-11 items-center hover:text-white hover:underline">{{
                t('landing.actions.openDashboard') }}</RouterLink>
          </li>
        </ul>
      </nav>

      <nav :aria-label="t('landing.footer.help')">
        <p class="font-semibold text-white">{{ t('landing.footer.help') }}</p>
        <RouterLink to="/help" class="mt-3 inline-flex min-h-11 items-center text-sm hover:text-white hover:underline">
          {{ t('auth.help') }}</RouterLink>
      </nav>

      <nav :aria-label="t('landing.footer.legal')">
        <p class="font-semibold text-white">{{ t('landing.footer.legal') }}</p>
        <ul class="mt-3 space-y-1 text-sm">
          <li>
            <RouterLink to="/privacy" class="inline-flex min-h-11 items-center hover:text-white hover:underline">{{
              t('auth.privacy') }}</RouterLink>
          </li>
          <li>
            <RouterLink to="/terms" class="inline-flex min-h-11 items-center hover:text-white hover:underline">{{
              t('auth.terms') }}</RouterLink>
          </li>
        </ul>
      </nav>

    </div>
    <p class="mx-auto mt-10 max-w-7xl border-t border-green-200/20 pt-6 text-center text-xs text-green-100/70">
      {{ t('landing.footer.copyright', { year: currentYear }) }}
    </p>
  </footer>
</template>
