import type { z } from 'zod'
import type { registerSchema, mockUserSchema } from '../schemas/auth'
import type { EntityId, ISODateString } from './index'

export type AuthErrorCode =
  | 'INVALID_CREDENTIALS'
  | 'UNAUTHENTICATED'
  | 'ACCOUNT_INACTIVE'
  | 'WORKSPACE_ACCESS_DENIED'
  | 'CSRF_TOKEN_MISMATCH'
  | 'VALIDATION_ERROR'
  | 'TOO_MANY_ATTEMPTS'
  | 'DEMO_UNAVAILABLE'
  | 'INVALID_RESET_TOKEN'
  | 'RESET_TOKEN_EXPIRED'
  | 'INTERNAL_ERROR'
  | 'NETWORK_ERROR'
  | 'REQUEST_TIMEOUT'

export interface WorkspaceMembership {
  id: EntityId
  workspaceId: EntityId
  workspaceName: string
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'WORKER'
  status: 'ACTIVE' | 'INACTIVE'
}

export interface AuthUser {
  id: EntityId
  name: string
  email: string
  status: 'ACTIVE' | 'INACTIVE'
  emailVerifiedAt: ISODateString | null
  /** Transitional display role until workspace selection owns the active role. */
  role?: WorkspaceMembership['role']
}

export interface LoginRequest {
  email: string
  password: string
  remember: boolean
}

export interface LoginResponse {
  user: AuthUser
  memberships: WorkspaceMembership[]
}

export interface AuthError {
  code: AuthErrorCode
  status?: number
  retryAfterSeconds?: number
}

export interface PasswordResetRequest { email: string }
export interface ResetPasswordRequest {
  token: string
  email: string
  password: string
  passwordConfirmation: string
}
export interface MessageResponse { message?: string }

export type RegisterValues = z.infer<typeof registerSchema>
export type MockUser = z.infer<typeof mockUserSchema>
