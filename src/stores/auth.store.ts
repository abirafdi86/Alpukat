import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import * as authService from '@/services/auth.service'
import { useWorkspaceStore } from '@/stores/workspace.store'
import type { AuthError, AuthUser, LoginRequest, LoginResponse, WorkspaceMembership } from '../../shared/types/auth'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(null)
  const memberships = ref<WorkspaceMembership[]>([])
  const isHydrated = ref(false)
  const isLoading = ref(false)
  const lastError = ref<AuthError | null>(null)
  const isAuthenticated = computed(() => user.value !== null)
  const activeMemberships = computed(() => memberships.value.filter(membership => membership.status === 'ACTIVE'))
  const workspaceCount = computed(() => activeMemberships.value.length)
  let hydrationPromise: Promise<void> | null = null

  function applyAuth(response: LoginResponse) {
    user.value = response.user
    memberships.value = [...response.memberships]
    const workspace = useWorkspaceStore()
    workspace.setAvailableMemberships(activeMemberships.value)
    if (workspace.availableMemberships.length === 1) workspace.selectWorkspace(workspace.availableMemberships[0].workspaceId)
    isHydrated.value = true
    lastError.value = null
  }
  function clearAuth() {
    user.value = null
    memberships.value = []
    const workspace = useWorkspaceStore()
    workspace.setAvailableMemberships([])
    workspace.clearWorkspace()
    lastError.value = null
  }
  async function hydrate(): Promise<void> {
    if (hydrationPromise) return hydrationPromise
    hydrationPromise = (async () => {
      isLoading.value = true
      try {
        applyAuth(await authService.getCurrentUser())
      } catch (cause) {
        const error = authService.normalizeAuthError(cause)
        if (error.code === 'UNAUTHENTICATED' || error.status === 401) clearAuth()
        lastError.value = error
      } finally {
        isLoading.value = false
        isHydrated.value = true
        hydrationPromise = null
      }
    })()
    return hydrationPromise
  }
  async function login(payload: LoginRequest, signal?: AbortSignal): Promise<LoginResponse> {
    if (isLoading.value) throw new Error('An authentication request is already in progress.')
    isLoading.value = true
    lastError.value = null
    try {
      const response = await authService.login(payload, signal)
      applyAuth(response)
      return response
    } catch (cause) {
      lastError.value = authService.normalizeAuthError(cause)
      throw cause
    } finally { isLoading.value = false }
  }
  async function loginDemo(signal?: AbortSignal): Promise<LoginResponse> {
    if (isLoading.value) throw new Error('An authentication request is already in progress.')
    isLoading.value = true
    lastError.value = null
    try {
      const response = await authService.loginDemo(signal)
      applyAuth(response)
      return response
    } catch (cause) {
      lastError.value = authService.normalizeAuthError(cause)
      throw cause
    } finally { isLoading.value = false }
  }
  async function logout(signal?: AbortSignal): Promise<void> {
    if (isLoading.value) return
    isLoading.value = true
    lastError.value = null
    try {
      await authService.logout(signal)
      clearAuth()
    } catch (cause) {
      lastError.value = authService.normalizeAuthError(cause)
      throw cause
    } finally { isLoading.value = false }
  }
  return { user, memberships, activeMemberships, isAuthenticated, isHydrated, isLoading, lastError, workspaceCount, hydrate, login, loginDemo, logout, clearAuth }
})
