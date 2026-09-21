import type { AuthError, AuthUser, LoginRequest, LoginResponse, MessageResponse, PasswordResetRequest, ResetPasswordRequest, WorkspaceMembership } from '../../shared/types/auth'

let currentSession: LoginResponse | null = null

export const AUTH_MOCK_SCENARIOS = {
  invalidCredentials: 'invalid@kebunku.test',
  inactiveAccount: 'inactive@kebunku.test',
  validationError: 'validation@kebunku.test',
  rateLimited: 'rate-limit@kebunku.test',
  serverError: 'server-error@kebunku.test',
  networkError: 'network@kebunku.test',
  hydrationNetworkError: 'hydrate-network@kebunku.test',
} as const

function fail(error: AuthError): never { throw error }
function wait(signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) { reject(new DOMException('Request aborted', 'AbortError')); return }
    const timer = window.setTimeout(resolve, 250)
    signal?.addEventListener('abort', () => { window.clearTimeout(timer); reject(new DOMException('Request aborted', 'AbortError')) }, { once: true })
  })
}
function membershipsFor(email: string): WorkspaceMembership[] {
  if (email.startsWith('no-workspace')) return []
  const primary: WorkspaceMembership = { id: 'membership-demo-1', workspaceId: 'workspace-demo-1', workspaceName: 'Kebunku Demo', role: 'OWNER', status: 'ACTIVE' }
  if (!email.startsWith('multi-workspace')) return [primary]
  return [primary, { id: 'membership-demo-2', workspaceId: 'workspace-demo-2', workspaceName: 'Kebunku Nursery', role: 'MEMBER', status: 'ACTIVE' }]
}
function responseFor(email: string): LoginResponse {
  const memberships = membershipsFor(email)
  const user: AuthUser = { id: 'user-demo-1', name: 'Demo User', email, status: 'ACTIVE', emailVerifiedAt: '2026-01-01T00:00:00Z', role: memberships[0]?.role }
  return { user, memberships }
}
export async function mockLogin(payload: LoginRequest, signal?: AbortSignal): Promise<LoginResponse> {
  await wait(signal)
  if (payload.email === AUTH_MOCK_SCENARIOS.invalidCredentials) fail({ code: 'INVALID_CREDENTIALS', status: 401 })
  if (payload.email === AUTH_MOCK_SCENARIOS.inactiveAccount) fail({ code: 'ACCOUNT_INACTIVE', status: 403 })
  if (payload.email === AUTH_MOCK_SCENARIOS.validationError) fail({ code: 'VALIDATION_ERROR', status: 422 })
  if (payload.email === AUTH_MOCK_SCENARIOS.rateLimited) fail({ code: 'TOO_MANY_ATTEMPTS', status: 429, retryAfterSeconds: 30 })
  if (payload.email === AUTH_MOCK_SCENARIOS.serverError) fail({ code: 'INTERNAL_ERROR', status: 500 })
  if (payload.email === AUTH_MOCK_SCENARIOS.networkError) fail({ code: 'NETWORK_ERROR' })
  currentSession = responseFor(payload.email)
  return currentSession
}
export async function mockLoginDemo(signal?: AbortSignal): Promise<LoginResponse> {
  await wait(signal)
  const scenario = import.meta.env.VITE_AUTH_MOCK_DEMO_SCENARIO ?? 'success'
  if (scenario === 'unavailable') fail({ code: 'DEMO_UNAVAILABLE', status: 503 })
  if (scenario === 'rate-limit') fail({ code: 'TOO_MANY_ATTEMPTS', status: 429, retryAfterSeconds: 30 })
  if (scenario === 'network') fail({ code: 'NETWORK_ERROR' })
  currentSession = responseFor('demo-user@kebunku.test')
  return currentSession
}
export async function mockGetCurrentUser(signal?: AbortSignal): Promise<LoginResponse> { await wait(signal); if (!currentSession) fail({ code: 'UNAUTHENTICATED', status: 401 }); if (currentSession.user.email === AUTH_MOCK_SCENARIOS.hydrationNetworkError) fail({ code: 'NETWORK_ERROR' }); return currentSession }
export async function mockLogout(signal?: AbortSignal): Promise<void> { await wait(signal); currentSession = null }
export async function mockRequestPasswordReset(_payload: PasswordResetRequest, signal?: AbortSignal): Promise<MessageResponse> { await wait(signal); return {} }
export async function mockResetPassword(payload: ResetPasswordRequest, signal?: AbortSignal): Promise<MessageResponse> {
  await wait(signal)
  if (payload.token === 'invalid-token') fail({ code: 'INVALID_RESET_TOKEN', status: 422 })
  if (payload.token === 'expired-token') fail({ code: 'RESET_TOKEN_EXPIRED', status: 422 })
  if (payload.token === 'network-error') fail({ code: 'NETWORK_ERROR' })
  return {}
}
