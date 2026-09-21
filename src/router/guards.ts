import type { Pinia } from 'pinia'
import type { RouteLocationNormalized, RouteLocationRaw, Router } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { useWorkspaceStore } from '@/stores/workspace.store'
import { normalizeAuthError } from '@/services/auth.service'
import http from '@/services/http'

const LOGIN_ROUTE = 'login'
const DASHBOARD_ROUTE = 'dashboard'
const WORKSPACE_SELECTION_ROUTE = 'workspace-selection'

function loginDestination(to: RouteLocationNormalized): RouteLocationRaw {
  return { name: LOGIN_ROUTE, query: { redirect: to.fullPath } }
}

function safeIntendedDestination(router: Router, value: unknown): string | undefined {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//')) return undefined
  const resolved = router.resolve(value)
  if (resolved.name === LOGIN_ROUTE || !resolved.matched.some(record => record.meta.requiresAuth)) return undefined
  return value
}

/** Prompt 5 can register this named route without changing the guard contract. */
function authenticatedHome(router: Router, workspaceCount: number): RouteLocationRaw {
  if (workspaceCount !== 1 && router.hasRoute(WORKSPACE_SELECTION_ROUTE)) return { name: WORKSPACE_SELECTION_ROUTE }
  return { name: DASHBOARD_ROUTE }
}

export function resolveAuthenticatedDestination(router: Router, workspaceCount: number, intended?: unknown): RouteLocationRaw {
  const safeIntended = safeIntendedDestination(router, intended)
  if (workspaceCount !== 1) {
    return { name: WORKSPACE_SELECTION_ROUTE, query: safeIntended ? { redirect: safeIntended } : undefined }
  }
  return safeIntended ?? authenticatedHome(router, workspaceCount)
}

export function resolvePostWorkspaceSelectionDestination(router: Router, intended?: unknown): RouteLocationRaw {
  return safeIntendedDestination(router, intended) ?? { name: DASHBOARD_ROUTE }
}

export function installAuthGuards(router: Router, pinia?: Pinia): void {
  router.beforeEach(async (to) => {
    const auth = useAuthStore(pinia)
    if (!auth.isHydrated) await auth.hydrate()

    if (to.meta.requiresAuth && !auth.isAuthenticated) return loginDestination(to)

    if (auth.isAuthenticated) {
      const workspace = useWorkspaceStore(pinia)
      const showingAccessDenied = to.name === WORKSPACE_SELECTION_ROUTE && to.query.error === 'access-denied'
      workspace.setAvailableMemberships(auth.activeMemberships)
      if (auth.workspaceCount === 1 && !workspace.selectedWorkspace && !showingAccessDenied) {
        workspace.selectWorkspace(auth.activeMemberships[0].workspaceId)
      }
      if (to.name === WORKSPACE_SELECTION_ROUTE && auth.workspaceCount === 1 && !showingAccessDenied) {
        return resolvePostWorkspaceSelectionDestination(router, to.query.redirect)
      }
      if (to.meta.requiresAuth && to.name !== WORKSPACE_SELECTION_ROUTE) {
        const needsSelection = auth.workspaceCount === 0 || (auth.workspaceCount > 1 && !workspace.selectedWorkspace)
        if (needsSelection) return { name: WORKSPACE_SELECTION_ROUTE, query: { redirect: to.fullPath } }
      }
    }

    if (to.meta.guestOnly && auth.isAuthenticated) {
      return resolveAuthenticatedDestination(router, auth.workspaceCount, to.query.redirect)
    }

    // Preserve the application's existing owner-only user-management rule.
    if (to.path.startsWith('/users') && auth.user?.role !== 'OWNER') return { name: DASHBOARD_ROUTE }
  })

  http.interceptors.response.use(
    response => response,
    async (cause: unknown) => {
      const error = normalizeAuthError(cause)
      if (error.code === 'UNAUTHENTICATED') {
        const auth = useAuthStore(pinia)
        auth.clearAuth()
        const current = router.currentRoute.value
        if (current.meta.requiresAuth && current.name !== LOGIN_ROUTE) {
          await router.replace(loginDestination(current))
        }
      } else if (error.code === 'WORKSPACE_ACCESS_DENIED') {
        const auth = useAuthStore(pinia)
        const workspace = useWorkspaceStore(pinia)
        workspace.clearWorkspace()
        const current = router.currentRoute.value
        if (auth.isAuthenticated && current.name !== WORKSPACE_SELECTION_ROUTE) {
          await router.replace({ name: WORKSPACE_SELECTION_ROUTE, query: { redirect: current.fullPath, error: 'access-denied' } })
        }
      }
      return Promise.reject(cause)
    },
  )
}
