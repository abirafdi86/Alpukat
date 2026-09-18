import { computed } from 'vue'
import { defineStore } from 'pinia'
import { StorageSerializers, useStorage } from '@vueuse/core'
import { mockUserSchema } from '../../shared/schemas/auth'
import type { MockUser } from '../../shared/types/auth'

export const useAuthStore = defineStore('auth', () => {
  const remembered = useStorage<MockUser | null>('afms:mock-user', null, localStorage, { serializer: StorageSerializers.object })
  const temporary = useStorage<MockUser | null>('afms:mock-user', null, sessionStorage, { serializer: StorageSerializers.object })
  const user = computed(() => {
    const result = mockUserSchema.safeParse(temporary.value ?? remembered.value)
    return result.success ? result.data : null
  })
  const isAuthenticated = computed(() => user.value !== null)
  function startSession(profile: MockUser, remember = false) {
    const valid = mockUserSchema.parse(profile)
    remembered.value = remember ? valid : null
    temporary.value = remember ? null : valid
  }
  function logout() { remembered.value = null; temporary.value = null }
  return { user, isAuthenticated, startSession, logout }
})
