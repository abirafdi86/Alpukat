import bcrypt from 'bcryptjs'
import { userRepository, type UserFilters } from '../repositories/user.js'
import { toSafeUser } from './auth.js'
import type { SafeUser } from '../types/auth.js'

export class UserManagementError extends Error {
  constructor(readonly code: 'USER_NOT_FOUND' | 'EMAIL_ALREADY_EXISTS' | 'SELF_DEACTIVATION_NOT_ALLOWED' | 'LAST_ACTIVE_OWNER', message: string) {
    super(message)
    this.name = 'UserManagementError'
  }
}

export async function listUsers(filters: UserFilters): Promise<{ users: SafeUser[]; total: number }> {
  const [users, total] = await Promise.all([userRepository.list(filters), userRepository.count(filters)])
  return { users: users.map(toSafeUser), total }
}

export async function getUser(id: string) {
  const user = await userRepository.findById(id)
  if (!user) throw new UserManagementError('USER_NOT_FOUND', 'User not found')
  return toSafeUser(user)
}

export async function createUser(input: { fullName: string; email: string; phone?: string; role: 'OWNER' | 'WORKER'; password: string }) {
  const email = input.email.toLowerCase()
  if (await userRepository.findByEmail(email)) throw new UserManagementError('EMAIL_ALREADY_EXISTS', 'Email is already registered')
  const passwordHash = await bcrypt.hash(input.password, 12)
  const { password: _password, ...userData } = input
  const user = await userRepository.create({ ...userData, email, passwordHash })
  return toSafeUser(user)
}

export async function updateUser(id: string, input: { fullName?: string; email?: string; phone?: string | null; role?: 'OWNER' | 'WORKER' }) {
  const current = await userRepository.findById(id)
  if (!current) throw new UserManagementError('USER_NOT_FOUND', 'User not found')
  const email = input.email?.toLowerCase()
  if (email && email !== current.email && await userRepository.findByEmail(email)) throw new UserManagementError('EMAIL_ALREADY_EXISTS', 'Email is already registered')
  return toSafeUser(await userRepository.update(id, { ...input, ...(email ? { email } : {}) }))
}

export async function updateUserStatus(id: string, status: 'ACTIVE' | 'INACTIVE', actorId: string) {
  const current = await userRepository.findById(id)
  if (!current) throw new UserManagementError('USER_NOT_FOUND', 'User not found')
  if (id === actorId && status === 'INACTIVE') throw new UserManagementError('SELF_DEACTIVATION_NOT_ALLOWED', 'You cannot deactivate your own account')
  if (current.role === 'OWNER' && current.status === 'ACTIVE' && status === 'INACTIVE') {
    const activeOwners = await userRepository.count({ role: 'OWNER', status: 'ACTIVE' })
    if (activeOwners <= 1) throw new UserManagementError('LAST_ACTIVE_OWNER', 'At least one active owner is required')
  }
  return toSafeUser(await userRepository.update(id, { status }))
}
