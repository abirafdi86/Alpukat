<script setup lang="ts">
import { reactive, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { ArrowRight } from 'lucide-vue-next'
import { UiButton, UiInput } from '@/components/ui'
import AuthPasswordInput from '@/components/auth/AuthPasswordInput.vue'
import AuthError from '@/components/auth/AuthError.vue'
import { registerSchema } from '../../shared/schemas/auth'
import { useZodForm } from '@/composables/useZodForm'
import { useMockAuthRequest } from '@/composables/useMockAuthRequest'
import { mockRegister } from '@/services/mockAuth'
import { useLocale } from '@/composables/useLocale'

const router = useRouter()
const { t } = useLocale()
const values = reactive({ fullName: '', email: '', phone: '', password: '', confirmPassword: '' })
const { form, errors, blur, validate } = useZodForm(registerSchema, values)
const { loading, error, run } = useMockAuthRequest()
const fieldError = (field: string) => errors.value[field] ? t(errors.value[field]) : undefined
watch(values, () => { error.value = '' }, { deep: true })
async function submit() {
  if (loading.value) return
  const data = await validate()
  if (!data) return
  await run(signal => mockRegister(data, signal), async () => {
    values.password = ''; values.confirmPassword = ''
    await router.replace('/login')
  })
}
</script>

<template>
  <section aria-labelledby="register-title">
    <p class="mb-3 text-xs font-semibold uppercase tracking-widest text-green-700">{{ t('registerAuth.eyebrow') }}</p>
    <h1 id="register-title" class="page-title">{{ t('auth.registerTitle') }}</h1>
    <p class="secondary-text mt-2">{{ t('auth.registerSubtitle') }}</p>
    <form ref="form" novalidate class="mt-7 space-y-4" :aria-busy="loading" @submit.prevent="submit">
      <AuthError :message="error" />
      <UiInput v-model="values.fullName" :label="t('auth.fullName')" name="fullName" autocomplete="name" :placeholder="t('registerAuth.fullNamePlaceholder')" :error="fieldError('fullName')" :disabled="loading" required @blur="blur('fullName')" />
      <UiInput v-model="values.email" :label="t('auth.email')" name="email" type="email" autocomplete="email" placeholder="you@example.com" :error="fieldError('email')" :disabled="loading" required @blur="blur('email')" />
      <UiInput v-model="values.phone" :label="t('auth.phone')" name="phone" type="tel" autocomplete="tel" placeholder="+62 812 3456 7890" :error="fieldError('phone')" :disabled="loading" required @blur="blur('phone')" />
      <AuthPasswordInput v-model="values.password" :label="t('auth.password')" name="password" autocomplete="new-password" :placeholder="t('registerAuth.passwordPlaceholder')" :hint="t('registerAuth.passwordHint')" :show-label="t('auth.showPassword')" :hide-label="t('auth.hidePassword')" :error="fieldError('password')" :disabled="loading" required @blur="blur('password')" />
      <AuthPasswordInput v-model="values.confirmPassword" :label="t('auth.confirmPassword')" name="confirmPassword" autocomplete="new-password" :placeholder="t('registerAuth.confirmPasswordPlaceholder')" :show-label="t('auth.showPassword')" :hide-label="t('auth.hidePassword')" :error="fieldError('confirmPassword')" :disabled="loading" required @blur="blur('confirmPassword')" />
      <UiButton type="submit" class="mt-2 w-full" :loading="loading" :loading-label="t('auth.creatingAccount')">{{ loading ? t('auth.creatingAccount') : t('auth.register') }}<template #trailing><ArrowRight v-if="!loading" :size="17" aria-hidden="true" /></template></UiButton>
    </form>
    <p class="mt-6 text-center text-sm text-slate-500">{{ t('auth.alreadyAccount') }} <RouterLink to="/login" class="font-medium text-green-700 hover:text-green-800 hover:underline">{{ t('auth.loginLink') }}</RouterLink></p>
  </section>
</template>
