<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { MailCheck } from 'lucide-vue-next'
import { UiButton, UiInput, UiModal } from '@/components/ui'
import AuthError from './AuthError.vue'
import { forgotPasswordSchema } from '../../../shared/schemas/auth'
import { useZodForm } from '@/composables/useZodForm'
import { useMockAuthRequest } from '@/composables/useMockAuthRequest'
import { mockPasswordReset } from '@/services/mockAuth'

const open = defineModel<boolean>({ required: true })
const props = defineProps<{ email: string }>()
const values = reactive({ email: '' })
const sent = ref(false)
const { form, errors, blur, validate, resetValidation } = useZodForm(forgotPasswordSchema, values)
const { loading, error, run, cancel } = useMockAuthRequest()
watch(open, value => {
  if (value) { resetValidation(); values.email = props.email; sent.value = false; error.value = '' }
  else cancel()
})
async function submit() {
  if (loading.value) return
  const data = await validate()
  if (data) await run(signal => mockPasswordReset(data.email, signal), () => { sent.value = true })
}
</script>

<template>
  <UiModal v-model="open" title="Forgot your password?" description="Enter the email you use for your farm workspace.">
    <div v-if="sent" role="status" class="space-y-4">
      <MailCheck :size="28" class="text-green-700" aria-hidden="true" />
      <p class="font-medium">Reset request preview complete</p>
      <p class="secondary-text">In the live app, a reset link would be sent to {{ values.email }}. This demo does not send emails.</p>
      <UiButton variant="secondary" @click="open = false">Back to login</UiButton>
    </div>
    <form v-else ref="form" novalidate class="space-y-5" :aria-busy="loading" @submit.prevent="submit">
      <AuthError :message="error" />
      <UiInput v-model="values.email" label="Email" name="reset-email" type="email" autocomplete="email" placeholder="you@example.com" :error="errors.email" :disabled="loading" required autofocus @blur="blur('email')" />
      <p class="secondary-text">Demo only. No reset email will be sent.</p>
      <UiButton type="submit" class="w-full" :loading="loading">{{ loading ? 'Submitting...' : 'Request reset link' }}</UiButton>
    </form>
  </UiModal>
</template>
