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
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()
const values = reactive({ fullName: '', email: '', phone: '', password: '', confirmPassword: '' })
const { form, errors, blur, validate } = useZodForm(registerSchema, values)
const { loading, error, run } = useMockAuthRequest()
watch(values, () => { error.value = '' }, { deep: true })
async function submit() {
  if (loading.value) return
  const data = await validate()
  if (!data) return
  await run(signal => mockRegister(data, signal), async user => {
    auth.startSession(user)
    values.password = ''; values.confirmPassword = ''
    await router.replace('/dashboard')
  })
}
</script>

<template>
  <section aria-labelledby="register-title">
    <p class="mb-3 text-xs font-semibold uppercase tracking-widest text-green-700">Room to grow</p>
    <h1 id="register-title" class="page-title">Create your account</h1>
    <p class="secondary-text mt-2">A more organized farm starts here.</p>
    <form ref="form" novalidate class="mt-7 space-y-4" :aria-busy="loading" @submit.prevent="submit">
      <AuthError :message="error" />
      <UiInput v-model="values.fullName" label="Full name" name="fullName" autocomplete="name" placeholder="Your full name" :error="errors.fullName" :disabled="loading" required @blur="blur('fullName')" />
      <UiInput v-model="values.email" label="Email" name="email" type="email" autocomplete="email" placeholder="you@example.com" :error="errors.email" :disabled="loading" required @blur="blur('email')" />
      <UiInput v-model="values.phone" label="Phone number" name="phone" type="tel" autocomplete="tel" placeholder="+62 812 3456 7890" :error="errors.phone" :disabled="loading" required @blur="blur('phone')" />
      <AuthPasswordInput v-model="values.password" label="Password" name="password" autocomplete="new-password" placeholder="Create a password" hint="At least 8 characters, including a letter and a number." :error="errors.password" :disabled="loading" required @blur="blur('password')" />
      <AuthPasswordInput v-model="values.confirmPassword" label="Confirm password" name="confirmPassword" autocomplete="new-password" placeholder="Enter your password again" :error="errors.confirmPassword" :disabled="loading" required @blur="blur('confirmPassword')" />
      <UiButton type="submit" class="mt-2 w-full" :loading="loading">{{ loading ? 'Creating account...' : 'Create account' }}<template #trailing><ArrowRight v-if="!loading" :size="17" aria-hidden="true" /></template></UiButton>
    </form>
    <p class="mt-6 text-center text-sm text-slate-500">Already have an account? <RouterLink to="/login" class="font-medium text-green-700 hover:text-green-800 hover:underline">Log in</RouterLink></p>
  </section>
</template>
