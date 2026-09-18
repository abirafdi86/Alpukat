export type UserRole = 'OWNER' | 'WORKER'
export type UserStatus = 'ACTIVE' | 'INACTIVE'

export interface SafeUser {
  id: string
  fullName: string
  email: string
  phone: string | null
  role: UserRole
  status: UserStatus
  createdAt: Date
  updatedAt: Date
}

export interface AuthTokenPayload {
  sub: string
  role: UserRole
  type: 'access' | 'refresh'
}

declare global {
  namespace Express {
    interface Request {
      user?: SafeUser
    }
  }
}
