<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { ArrowRight } from 'lucide-vue-next'
import { UiButton, UiInput } from '@/components/ui'
import AuthPasswordInput from '@/components/auth/AuthPasswordInput.vue'
import AuthError from '@/components/auth/AuthError.vue'
import AuthLocaleSwitcher from '@/components/auth/AuthLocaleSwitcher.vue'
import { loginSchema } from '../../shared/schemas/auth'
import type { AuthErrorCode } from '../../shared/types/auth'
import { useZodForm } from '@/composables/useZodForm'
import { useLocale } from '@/composables/useLocale'
import {
  authErrorMessageKeys,
  normalizeAuthError,
} from '@/services/auth.service'
import { useAuthStore } from '@/stores/auth.store'
import { resolveAuthenticatedDestination } from '@/router/guards'

const { t } = useLocale()
const auth = useAuthStore()
const route = useRoute()
const router = useRouter()
const values = reactive({ email: '', password: '', remember: false })
const errorCode = ref<AuthErrorCode>()
const activeRequest = ref<'login' | 'demo' | null>(null)
const retryAfterSeconds = ref(0)
const { form, errors, blur, validate } = useZodForm(loginSchema, values)
let controller: AbortController | undefined
let retryTimer: number | undefined

const errorMessage = computed(() => {
  if (!errorCode.value) return ''
  if (errorCode.value === 'TOO_MANY_ATTEMPTS' && retryAfterSeconds.value > 0) {
    return t('authErrors.tooManyAttemptsWithRetry', { seconds: retryAfterSeconds.value })
  }
  return t(authErrorMessageKeys[errorCode.value])
})
const submissionDisabled = computed(() => auth.isLoading || retryAfterSeconds.value > 0)
const fieldError = (field: string) => errors.value[field] ? t(errors.value[field]) : undefined

watch(values, () => {
  if (errorCode.value !== 'TOO_MANY_ATTEMPTS') errorCode.value = undefined
}, { deep: true })

function startRetryCountdown(seconds?: number) {
  if (!seconds || seconds <= 0) return
  retryAfterSeconds.value = seconds
  if (retryTimer) window.clearInterval(retryTimer)
  retryTimer = window.setInterval(() => {
    retryAfterSeconds.value = Math.max(0, retryAfterSeconds.value - 1)
    if (retryAfterSeconds.value === 0 && retryTimer) {
      window.clearInterval(retryTimer)
      retryTimer = undefined
      errorCode.value = undefined
    }
  }, 1000)
}

async function runAuthRequest(kind: 'login' | 'demo', request: (signal: AbortSignal) => Promise<unknown>) {
  if (submissionDisabled.value) return
  const current = new AbortController()
  controller = current
  activeRequest.value = kind
  errorCode.value = undefined
  try {
    await request(current.signal)
    if (!current.signal.aborted) {
      await router.replace(resolveAuthenticatedDestination(router, auth.workspaceCount, route.query.redirect))
    }
  } catch (cause) {
    if (current.signal.aborted) return
    const error = normalizeAuthError(cause)
    errorCode.value = error.code
    if (error.code === 'INVALID_CREDENTIALS') values.password = ''
    if (error.code === 'TOO_MANY_ATTEMPTS') startRetryCountdown(error.retryAfterSeconds)
  } finally {
    if (controller === current) { controller = undefined; activeRequest.value = null }
  }
}

async function submit() {
  if (submissionDisabled.value) return
  const data = await validate()
  if (!data) return
  values.email = data.email
  await runAuthRequest('login', signal => auth.login(data, signal))
}

async function exploreDemo() {
  await runAuthRequest('demo', signal => auth.loginDemo(signal))
}

onBeforeUnmount(() => {
  controller?.abort()
  if (retryTimer) window.clearInterval(retryTimer)
})
</script>

<template>
  <section aria-labelledby="login-title">
    <div class="mb-3 flex items-center justify-between gap-4">
      <p class="text-xs font-semibold uppercase tracking-widest text-green-700">{{ t('auth.workspace') }}</p>
      <AuthLocaleSwitcher />
    </div>
    <h1 id="login-title" class="page-title">{{ t('auth.welcome') }}</h1>
    <p class="secondary-text mt-2">{{ t('auth.loginSubtitle') }}</p>

    <form ref="form" novalidate class="mt-8 space-y-5" :aria-busy="auth.isLoading" @submit.prevent="submit">
      <AuthError :message="errorMessage" />
      <UiInput v-model="values.email" :label="t('auth.email')" name="email" type="email" autocomplete="email" placeholder="you@example.com" :error="fieldError('email')" :disabled="auth.isLoading" required @blur="blur('email')" />
      <AuthPasswordInput v-model="values.password" :label="t('auth.password')" name="password" autocomplete="current-password" :placeholder="t('auth.passwordPlaceholder')" :show-label="t('auth.showPassword')" :hide-label="t('auth.hidePassword')" :error="fieldError('password')" :disabled="auth.isLoading" required @blur="blur('password')" />
      <div class="flex flex-wrap items-center justify-between gap-3">
        <label class="flex min-h-11 cursor-pointer items-center gap-2 text-sm text-slate-600">
          <input v-model="values.remember" name="remember" type="checkbox" class="size-4 rounded border-slate-300 accent-green-700" :disabled="auth.isLoading" />
          {{ t('auth.rememberMe') }}
        </label>
        <RouterLink to="/forgot-password" class="inline-flex min-h-11 items-center text-sm font-medium text-green-700 hover:text-green-800 hover:underline">{{ t('auth.forgotPassword') }}</RouterLink>
      </div>
      <UiButton type="submit" class="w-full" :loading="activeRequest === 'login'" :loading-label="t('auth.loggingIn')" :disabled="submissionDisabled">
        {{ activeRequest === 'login' ? t('auth.loggingIn') : retryAfterSeconds > 0 ? t('authStatus.retryIn', { seconds: retryAfterSeconds }) : t('auth.login') }}
        <template #trailing><ArrowRight v-if="activeRequest !== 'login'" :size="17" aria-hidden="true" /></template>
      </UiButton>
      <UiButton variant="secondary" class="w-full" :loading="activeRequest === 'demo'" :loading-label="t('authActions.exploringDemo')" :disabled="submissionDisabled" @click="exploreDemo">{{ activeRequest === 'demo' ? t('authActions.exploringDemo') : t('auth.exploreDemo') }}</UiButton>
    </form>

    <p class="mt-7 text-center text-sm text-slate-500">{{ t('auth.newToKebunku') }} <RouterLink to="/register" class="font-medium text-green-700 hover:text-green-800 hover:underline">{{ t('auth.createWorkspace') }}</RouterLink></p>
    <nav class="mt-8 flex justify-center gap-4 text-xs text-slate-500" :aria-label="t('auth.footerLinks')">
      <RouterLink to="/privacy" class="hover:text-green-700 hover:underline">{{ t('auth.privacy') }}</RouterLink>
      <RouterLink to="/terms" class="hover:text-green-700 hover:underline">{{ t('auth.terms') }}</RouterLink>
      <RouterLink to="/help" class="hover:text-green-700 hover:underline">{{ t('auth.help') }}</RouterLink>
    </nav>
  </section>
</template>
