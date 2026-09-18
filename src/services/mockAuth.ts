import { loginSchema, registerSchema, forgotPasswordSchema } from '../../shared/schemas/auth'
import type { LoginValues, RegisterValues, MockUser } from '../../shared/types/auth'

export const DEMO_CREDENTIALS = { email: 'demo@afms.test', password: 'Avocado123' }
export const WORKER_DEMO_CREDENTIALS = { email: 'worker@afms.test', password: 'Avocado123' }

function delay(signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const abort = () => {
      clearTimeout(timer)
      reject(new DOMException('Request cancelled', 'AbortError'))
    }
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', abort)
      resolve()
    }, 650)
    if (signal?.aborted) abort()
    else signal?.addEventListener('abort', abort, { once: true })
  })
}
function simulateError(email: string) {
  if (email === 'error@afms.test') throw new Error('We could not connect to the demo workspace. Please try another email address.')
}

/** Demo only. No credentials are transmitted, verified, or persisted. */
export async function mockLogin(values: LoginValues, signal?: AbortSignal): Promise<MockUser> {
  const data = loginSchema.parse(values)
  await delay(signal)
  simulateError(data.email)
  return { name: data.email === WORKER_DEMO_CREDENTIALS.email ? 'Demo Worker' : data.email === DEMO_CREDENTIALS.email ? 'Demo Owner' : data.email.split('@')[0].replace(/[._-]/g, ' '), email: data.email, role: data.email === WORKER_DEMO_CREDENTIALS.email ? 'WORKER' : 'OWNER' }
}
export async function mockRegister(values: RegisterValues, signal?: AbortSignal): Promise<MockUser> {
  const data = registerSchema.parse(values)
  await delay(signal)
  simulateError(data.email)
  return { name: data.fullName, email: data.email, role: 'OWNER' }
}
export async function mockPasswordReset(email: string, signal?: AbortSignal): Promise<void> {
  const data = forgotPasswordSchema.parse({ email })
  await delay(signal)
  simulateError(data.email)
}
