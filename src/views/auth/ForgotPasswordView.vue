<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { MailCheck } from 'lucide-vue-next'
import { UiButton, UiInput } from '@/components/ui'
import AuthError from '@/components/auth/AuthError.vue'
import AuthLocaleSwitcher from '@/components/auth/AuthLocaleSwitcher.vue'
import { forgotPasswordSchema } from '../../../shared/schemas/auth'
import type { AuthErrorCode } from '../../../shared/types/auth'
import { useZodForm } from '@/composables/useZodForm'
import { authErrorMessageKeys, normalizeAuthError, requestPasswordReset } from '@/services/auth.service'
import { useLocale } from '@/composables/useLocale'

const { t } = useLocale()
const values = reactive({ email: '' })
const isSubmitting = ref(false)
const sent = ref(false)
const errorCode = ref<AuthErrorCode>()
const { form, errors, blur, validate } = useZodForm(forgotPasswordSchema, values)
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
  const data = await validate()
  if (!data) return
  values.email = data.email
  const current = new AbortController()
  controller = current
  isSubmitting.value = true
  errorCode.value = undefined
  try {
    await requestPasswordReset(data, current.signal)
    if (!current.signal.aborted) sent.value = true
  } catch (cause) {
    if (!current.signal.aborted) {
      const error = normalizeAuthError(cause)
      if (error.status === 400 || error.status === 403 || error.status === 404) sent.value = true
      else errorCode.value = error.code
    }
  } finally {
    if (controller === current) { controller = undefined; isSubmitting.value = false }
  }
}

onBeforeUnmount(() => controller?.abort())
</script>

<template>
  <section aria-labelledby="forgot-title">
    <div class="mb-3 flex items-center justify-between gap-4"><p class="text-xs font-semibold uppercase tracking-widest text-green-700">{{ t('passwordRecovery.forgot.eyebrow') }}</p><AuthLocaleSwitcher /></div>
    <template v-if="sent">
      <MailCheck :size="32" class="text-green-700" aria-hidden="true" />
      <h1 id="forgot-title" class="page-title mt-4">{{ t('passwordRecovery.forgot.successTitle') }}</h1>
      <p role="status" class="secondary-text mt-3">{{ t('passwordRecovery.forgot.successMessage') }}</p>
      <RouterLink to="/login" class="ui-button ui-button-secondary mt-7 w-full">{{ t('passwordRecovery.backToLogin') }}</RouterLink>
    </template>
    <template v-else>
      <h1 id="forgot-title" class="page-title">{{ t('passwordRecovery.forgot.title') }}</h1>
      <p class="secondary-text mt-2">{{ t('passwordRecovery.forgot.description') }}</p>
      <form ref="form" novalidate class="mt-8 space-y-5" :aria-busy="isSubmitting" @submit.prevent="submit">
        <AuthError :message="errorMessage" />
        <UiInput v-model="values.email" :label="t('auth.email')" name="email" type="email" autocomplete="email" placeholder="you@example.com" :error="fieldError('email')" :disabled="isSubmitting" required autofocus @blur="blur('email')" />
        <UiButton type="submit" class="w-full" :loading="isSubmitting" :loading-label="t('passwordRecovery.forgot.submitting')">{{ isSubmitting ? t('passwordRecovery.forgot.submitting') : t('passwordRecovery.forgot.submit') }}</UiButton>
      </form>
      <RouterLink to="/login" class="mt-5 inline-flex min-h-11 items-center text-sm font-medium text-green-700 hover:underline">{{ t('passwordRecovery.backToLogin') }}</RouterLink>
    </template>
  </section>
</template>
