import axios from 'axios'
import http from './http'
import * as mockAuth from './auth.mock'
import type {
  AuthError,
  AuthErrorCode,
  LoginRequest,
  LoginResponse,
  MessageResponse,
  PasswordResetRequest,
  ResetPasswordRequest,
} from '../../shared/types/auth'

const useMockAuth = import.meta.env.VITE_AUTH_MODE === 'mock'

const backendErrorCodes = new Set<AuthErrorCode>([
  'INVALID_CREDENTIALS',
  'UNAUTHENTICATED',
  'ACCOUNT_INACTIVE',
  'WORKSPACE_ACCESS_DENIED',
  'CSRF_TOKEN_MISMATCH',
  'VALIDATION_ERROR',
  'TOO_MANY_ATTEMPTS',
  'DEMO_UNAVAILABLE',
  'INVALID_RESET_TOKEN',
  'RESET_TOKEN_EXPIRED',
  'INTERNAL_ERROR',
])

const backendErrorAliases: Record<string, AuthErrorCode> = {
  INVALID_TOKEN: 'INVALID_RESET_TOKEN',
  RESET_TOKEN_INVALID: 'INVALID_RESET_TOKEN',
  EXPIRED_TOKEN: 'RESET_TOKEN_EXPIRED',
  TOKEN_EXPIRED: 'RESET_TOKEN_EXPIRED',
}

export const authErrorMessageKeys: Record<AuthErrorCode, string> = {
  INVALID_CREDENTIALS: 'authErrors.invalidCredentials',
  UNAUTHENTICATED: 'authErrors.unauthenticated',
  ACCOUNT_INACTIVE: 'authErrors.accountInactive',
  WORKSPACE_ACCESS_DENIED: 'authErrors.workspaceAccessDenied',
  CSRF_TOKEN_MISMATCH: 'authErrors.csrfTokenMismatch',
  VALIDATION_ERROR: 'authErrors.validationError',
  TOO_MANY_ATTEMPTS: 'authErrors.tooManyAttempts',
  DEMO_UNAVAILABLE: 'authErrors.demoUnavailable',
  INVALID_RESET_TOKEN: 'passwordRecovery.errors.invalidToken',
  RESET_TOKEN_EXPIRED: 'passwordRecovery.errors.expiredToken',
  INTERNAL_ERROR: 'authErrors.internalError',
  NETWORK_ERROR: 'authErrors.networkError',
  REQUEST_TIMEOUT: 'authErrors.requestTimeout',
}

function parseRetryAfter(value: unknown): number | undefined {
  if (typeof value !== 'string' || !value.trim()) return undefined
  const seconds = Number(value)
  if (Number.isFinite(seconds) && seconds >= 0) return Math.ceil(seconds)
  const retryAt = Date.parse(value)
  if (Number.isNaN(retryAt)) return undefined
  return Math.max(0, Math.ceil((retryAt - Date.now()) / 1000))
}

function codeFromStatus(status?: number): AuthErrorCode {
  if (status === 401) return 'INVALID_CREDENTIALS'
  if (status === 403) return 'ACCOUNT_INACTIVE'
  if (status === 419) return 'CSRF_TOKEN_MISMATCH'
  if (status === 422) return 'VALIDATION_ERROR'
  if (status === 429) return 'TOO_MANY_ATTEMPTS'
  return 'INTERNAL_ERROR'
}

export function normalizeAuthError(cause: unknown): AuthError {
  if (cause && typeof cause === 'object' && 'code' in cause && typeof cause.code === 'string') {
    const code = cause.code as AuthErrorCode
    if (backendErrorCodes.has(code) || code === 'NETWORK_ERROR' || code === 'REQUEST_TIMEOUT') {
      return { code, status: 'status' in cause && typeof cause.status === 'number' ? cause.status : undefined, retryAfterSeconds: 'retryAfterSeconds' in cause && typeof cause.retryAfterSeconds === 'number' ? cause.retryAfterSeconds : undefined }
    }
  }
  if (!axios.isAxiosError(cause)) return { code: 'INTERNAL_ERROR' }
  if (cause.code === 'ECONNABORTED' || cause.code === 'ETIMEDOUT') return { code: 'REQUEST_TIMEOUT' }
  if (!cause.response) return { code: 'NETWORK_ERROR' }

  const status = cause.response.status
  const payload = cause.response.data
  const responseCode = payload && typeof payload === 'object' && 'code' in payload ? payload.code : undefined
  const aliasedCode = typeof responseCode === 'string' ? backendErrorAliases[responseCode] : undefined
  const code = aliasedCode ?? (typeof responseCode === 'string' && backendErrorCodes.has(responseCode as AuthErrorCode)
    ? responseCode as AuthErrorCode
    : codeFromStatus(status))

  return {
    code,
    status,
    retryAfterSeconds: code === 'TOO_MANY_ATTEMPTS'
      ? parseRetryAfter(cause.response.headers['retry-after'])
      : undefined,
  }
}

async function initializeCsrf(signal?: AbortSignal): Promise<void> {
  await http.get('/sanctum/csrf-cookie', { signal })
}

export async function login(payload: LoginRequest, signal?: AbortSignal): Promise<LoginResponse> {
  if (useMockAuth) return mockAuth.mockLogin(payload, signal)
  await initializeCsrf(signal)
  const { data } = await http.post<LoginResponse>('/api/auth/login', payload, { signal })
  return data
}

export async function logout(signal?: AbortSignal): Promise<void> {
  if (useMockAuth) return mockAuth.mockLogout(signal)
  await http.post('/api/auth/logout', undefined, { signal })
}

export async function getCurrentUser(signal?: AbortSignal): Promise<LoginResponse> {
  if (useMockAuth) return mockAuth.mockGetCurrentUser(signal)
  const { data } = await http.get<LoginResponse>('/api/auth/me', { signal })
  return data
}

export async function requestPasswordReset(payload: PasswordResetRequest, signal?: AbortSignal): Promise<MessageResponse> {
  if (useMockAuth) return mockAuth.mockRequestPasswordReset(payload, signal)
  const { data } = await http.post<MessageResponse>('/api/auth/forgot-password', payload, { signal })
  return data
}

export async function resetPassword(payload: ResetPasswordRequest, signal?: AbortSignal): Promise<MessageResponse> {
  if (useMockAuth) return mockAuth.mockResetPassword(payload, signal)
  const { data } = await http.post<MessageResponse>('/api/auth/reset-password', payload, { signal })
  return data
}

export async function loginDemo(signal?: AbortSignal): Promise<LoginResponse> {
  if (useMockAuth) return mockAuth.mockLoginDemo(signal)
  await initializeCsrf(signal)
  const { data } = await http.post<LoginResponse>('/api/auth/demo', undefined, { signal })
  return data
}
