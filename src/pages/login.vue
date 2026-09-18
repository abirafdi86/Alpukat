<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { ArrowRight } from 'lucide-vue-next'
import { UiButton, UiInput } from '@/components/ui'
import AuthPasswordInput from '@/components/auth/AuthPasswordInput.vue'
import AuthError from '@/components/auth/AuthError.vue'
import ForgotPasswordDialog from '@/components/auth/ForgotPasswordDialog.vue'
import { loginSchema } from '../../shared/schemas/auth'
import { useZodForm } from '@/composables/useZodForm'
import { useMockAuthRequest } from '@/composables/useMockAuthRequest'
import { mockLogin, DEMO_CREDENTIALS } from '@/services/mockAuth'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()
const values = reactive({ email: '', password: '', rememberMe: false })
const forgotOpen = ref(false)
const { form, errors, blur, validate } = useZodForm(loginSchema, values)
const { loading, error, run } = useMockAuthRequest()
watch(values, () => { error.value = '' }, { deep: true })
async function submit() {
  if (loading.value) return
  const data = await validate()
  if (!data) return
  await run(signal => mockLogin(data, signal), async user => {
    auth.startSession(user, data.rememberMe)
    values.password = ''
    await router.replace('/dashboard')
  })
}
function fillDemo() { Object.assign(values, DEMO_CREDENTIALS) }
</script>

<template>
  <section aria-labelledby="login-title">
    <p class="mb-3 text-xs font-semibold uppercase tracking-widest text-green-700">Your farm workspace</p>
    <h1 id="login-title" class="page-title">Welcome back</h1>
    <p class="secondary-text mt-2">Log in to keep your farm moving forward.</p>
    <form ref="form" novalidate class="mt-8 space-y-5" :aria-busy="loading" @submit.prevent="submit">
      <AuthError :message="error" />
      <UiInput v-model="values.email" label="Email" name="email" type="email" autocomplete="email" placeholder="you@example.com" :error="errors.email" :disabled="loading" required @blur="blur('email')" />
      <AuthPasswordInput v-model="values.password" label="Password" name="password" autocomplete="current-password" placeholder="Enter your password" :error="errors.password" :disabled="loading" required @blur="blur('password')" />
      <div class="flex flex-wrap items-center justify-between gap-3">
        <label class="flex cursor-pointer items-center gap-2 text-sm text-slate-600"><input v-model="values.rememberMe" name="rememberMe" type="checkbox" class="size-4 rounded border-slate-300 accent-green-700" :disabled="loading" />Remember me</label>
        <button type="button" class="text-sm font-medium text-green-700 hover:text-green-800 hover:underline disabled:opacity-50" :disabled="loading" @click="forgotOpen = true">Forgot password?</button>
      </div>
      <UiButton type="submit" class="w-full" :loading="loading">{{ loading ? 'Logging in...' : 'Login' }}<template #trailing><ArrowRight v-if="!loading" :size="17" aria-hidden="true" /></template></UiButton>
      <UiButton variant="secondary" class="w-full" :disabled="loading" @click="fillDemo">Use demo account</UiButton>
      <p class="text-xs leading-5 text-slate-500">For this demo, use any valid email and a password of at least 8 characters.</p>
    </form>
    <p class="mt-7 text-center text-sm text-slate-500">New to AFMS? <RouterLink to="/register" class="font-medium text-green-700 hover:text-green-800 hover:underline">Create an account</RouterLink></p>
    <ForgotPasswordDialog v-model="forgotOpen" :email="values.email" />
  </section>
</template>
