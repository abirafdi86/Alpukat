import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import * as authService from '@/services/auth.service'
import { useWorkspaceStore } from '@/stores/workspace.store'
import type { AuthError, AuthUser, LoginRequest, LoginResponse, WorkspaceMembership } from '../../shared/types/auth'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isLoginResponse(value: unknown): value is LoginResponse {
  if (!isRecord(value) || !isRecord(value.user) || !Array.isArray(value.memberships)) return false
  const user = value.user
  return typeof user.id === 'string'
    && typeof user.name === 'string'
    && typeof user.email === 'string'
    && value.memberships.every(membership => isRecord(membership)
      && typeof membership.id === 'string'
      && typeof membership.workspaceId === 'string'
      && typeof membership.workspaceName === 'string')
}

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
    if (!isLoginResponse(response)) throw new TypeError('Invalid authentication response.')
    const nextMemberships = [...response.memberships]
    user.value = response.user
    memberships.value = nextMemberships
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
