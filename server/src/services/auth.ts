import bcrypt from 'bcryptjs'
import jwt, { type SignOptions } from 'jsonwebtoken'
import { prisma } from '../config/database.js'
import { env } from '../config/env.js'
import type { AuthTokenPayload, SafeUser, UserRole, UserStatus } from '../types/auth.js'

interface DbUser {
  id: string
  fullName: string
  email: string
  phone: string | null
  passwordHash: string
  role: UserRole
  status: UserStatus
  createdAt: Date
  updatedAt: Date
}

export class AuthServiceError extends Error {
  constructor(readonly code: 'INVALID_CREDENTIALS' | 'ACCOUNT_INACTIVE' | 'EMAIL_ALREADY_EXISTS' | 'UNAUTHORIZED', message: string) {
    super(message)
    this.name = 'AuthServiceError'
  }
}

function ensureSecrets() {
  if (!env.jwtAccessSecret || !env.jwtRefreshSecret) throw new Error('JWT secrets are not configured')
}

export function toSafeUser(user: DbUser): SafeUser {
  const { passwordHash: _passwordHash, ...safeUser } = user
  return safeUser
}

function signToken(payload: AuthTokenPayload, secret: string, expiresIn: string) {
  return jwt.sign(payload, secret, { expiresIn: expiresIn as SignOptions['expiresIn'] })
}

export function createAccessToken(user: SafeUser) {
  ensureSecrets()
  return signToken({ sub: user.id, role: user.role, type: 'access' }, env.jwtAccessSecret, env.jwtAccessExpiresIn)
}

export function createRefreshToken(user: SafeUser) {
  ensureSecrets()
  return signToken({ sub: user.id, role: user.role, type: 'refresh' }, env.jwtRefreshSecret, env.jwtRefreshExpiresIn)
}

export function verifyAccessToken(token: string): AuthTokenPayload {
  ensureSecrets()
  const payload = jwt.verify(token, env.jwtAccessSecret)
  if (typeof payload !== 'object' || payload.type !== 'access' || typeof payload.sub !== 'string') throw new AuthServiceError('UNAUTHORIZED', 'Unauthorized')
  return payload as AuthTokenPayload
}

export function verifyRefreshToken(token: string): AuthTokenPayload {
  ensureSecrets()
  const payload = jwt.verify(token, env.jwtRefreshSecret)
  if (typeof payload !== 'object' || payload.type !== 'refresh' || typeof payload.sub !== 'string') throw new AuthServiceError('UNAUTHORIZED', 'Unauthorized')
  return payload as AuthTokenPayload
}

export async function registerUser(input: { fullName: string; email: string; phone?: string; password: string }) {
  const email = input.email.toLowerCase()
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) throw new AuthServiceError('EMAIL_ALREADY_EXISTS', 'Email is already registered')
  const passwordHash = await bcrypt.hash(input.password, 12)
  const user = await prisma.user.create({ data: { fullName: input.fullName, email, phone: input.phone, passwordHash, role: 'WORKER', status: 'ACTIVE' } })
  return toSafeUser(user)
}

export async function authenticateUser(emailInput: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email: emailInput.toLowerCase() } })
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) throw new AuthServiceError('INVALID_CREDENTIALS', 'Invalid email or password')
  if (user.status !== 'ACTIVE') throw new AuthServiceError('ACCOUNT_INACTIVE', 'Account is inactive')
  return toSafeUser(user)
}

export async function getActiveUser(id: string) {
  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) throw new AuthServiceError('UNAUTHORIZED', 'Unauthorized')
  if (user.status !== 'ACTIVE') throw new AuthServiceError('ACCOUNT_INACTIVE', 'Account is inactive')
  return toSafeUser(user)
}
