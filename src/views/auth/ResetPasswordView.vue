<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { CircleCheck } from 'lucide-vue-next'
import { UiButton, UiInput } from '@/components/ui'
import AuthError from '@/components/auth/AuthError.vue'
import AuthLocaleSwitcher from '@/components/auth/AuthLocaleSwitcher.vue'
import AuthPasswordInput from '@/components/auth/AuthPasswordInput.vue'
import { resetPasswordSchema } from '../../../shared/schemas/auth'
import type { AuthErrorCode } from '../../../shared/types/auth'
import { useZodForm } from '@/composables/useZodForm'
import { authErrorMessageKeys, normalizeAuthError, resetPassword } from '@/services/auth.service'
import { useLocale } from '@/composables/useLocale'

const route = useRoute()
const router = useRouter()
const { t } = useLocale()
const token = computed(() => typeof route.query.token === 'string' ? route.query.token : '')
const initialEmail = typeof route.query.email === 'string' ? route.query.email : ''
const values = reactive({ email: initialEmail, password: '', passwordConfirmation: '' })
const isSubmitting = ref(false)
const completed = ref(false)
const errorCode = ref<AuthErrorCode | undefined>(token.value ? undefined : 'INVALID_RESET_TOKEN')
const { form, errors, blur, validate } = useZodForm(resetPasswordSchema, values)
let controller: AbortController | undefined

const errorMessage = computed(() => {
  if (!errorCode.value) return ''
  if (errorCode.value === 'VALIDATION_ERROR') return t('passwordRecoveryErrors.validation')
  if (errorCode.value === 'TOO_MANY_ATTEMPTS') return t('passwordRecoveryErrors.tooMany')
  if (errorCode.value === 'INTERNAL_ERROR') return t('passwordRecoveryErrors.retry')
  return t(authErrorMessageKeys[errorCode.value])
})
const fieldError = (field: string) => errors.value[field] ? t(errors.value[field]) : undefined

async function submit() {
  if (isSubmitting.value) return
  if (!token.value) { errorCode.value = 'INVALID_RESET_TOKEN'; return }
  const data = await validate()
  if (!data) return
  values.email = data.email
  const current = new AbortController()
  controller = current
  isSubmitting.value = true
  errorCode.value = undefined
  try {
    await resetPassword({ token: token.value, ...data }, current.signal)
    if (!current.signal.aborted) {
      values.password = ''
      values.passwordConfirmation = ''
      completed.value = true
      await router.replace({ name: 'reset-password' })
    }
  } catch (cause) {
    if (!current.signal.aborted) errorCode.value = normalizeAuthError(cause).code
  } finally {
    if (controller === current) { controller = undefined; isSubmitting.value = false }
  }
}

onBeforeUnmount(() => controller?.abort())
</script>

<template>
  <section aria-labelledby="reset-title">
    <div class="mb-3 flex items-center justify-between gap-4"><p class="text-xs font-semibold uppercase tracking-widest text-green-700">{{ t('passwordRecovery.reset.eyebrow') }}</p><AuthLocaleSwitcher /></div>
    <template v-if="completed">
      <CircleCheck :size="32" class="text-green-700" aria-hidden="true" />
      <h1 id="reset-title" class="page-title mt-4">{{ t('passwordRecovery.reset.successTitle') }}</h1>
      <p role="status" class="secondary-text mt-3">{{ t('passwordRecovery.reset.successMessage') }}</p>
      <RouterLink to="/login" class="ui-button ui-button-primary mt-7 w-full">{{ t('auth.loginLink') }}</RouterLink>
    </template>
    <template v-else>
      <h1 id="reset-title" class="page-title">{{ t('passwordRecovery.reset.title') }}</h1>
      <p class="secondary-text mt-2">{{ t('passwordRecovery.reset.description') }}</p>
      <form ref="form" novalidate class="mt-8 space-y-5" :aria-busy="isSubmitting" @submit.prevent="submit">
        <AuthError :message="errorMessage" />
        <UiInput v-model="values.email" :label="t('auth.email')" name="email" type="email" autocomplete="email" placeholder="you@example.com" :error="fieldError('email')" :disabled="isSubmitting || !token" required @blur="blur('email')" />
        <AuthPasswordInput v-model="values.password" :label="t('passwordRecovery.reset.newPassword')" name="password" autocomplete="new-password" :show-label="t('auth.showPassword')" :hide-label="t('auth.hidePassword')" :error="fieldError('password')" :disabled="isSubmitting || !token" required @blur="blur('password')" />
        <AuthPasswordInput v-model="values.passwordConfirmation" :label="t('passwordRecovery.reset.confirmPassword')" name="passwordConfirmation" autocomplete="new-password" :show-label="t('auth.showPassword')" :hide-label="t('auth.hidePassword')" :error="fieldError('passwordConfirmation')" :disabled="isSubmitting || !token" required @blur="blur('passwordConfirmation')" />
        <UiButton type="submit" class="w-full" :loading="isSubmitting" :loading-label="t('passwordRecovery.reset.submitting')" :disabled="!token">{{ isSubmitting ? t('passwordRecovery.reset.submitting') : t('passwordRecovery.reset.submit') }}</UiButton>
      </form>
      <RouterLink to="/forgot-password" class="mt-5 inline-flex min-h-11 items-center text-sm font-medium text-green-700 hover:underline">{{ t('auth.forgotPassword') }}</RouterLink>
    </template>
  </section>
</template>
