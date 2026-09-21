import { registerSchema } from '../../shared/schemas/auth'
import type { RegisterValues, MockUser } from '../../shared/types/auth'

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
export async function mockRegister(values: RegisterValues, signal?: AbortSignal): Promise<MockUser> {
  const data = registerSchema.parse(values)
  await delay(signal)
  return { name: data.fullName, email: data.email, role: 'OWNER' }
}
