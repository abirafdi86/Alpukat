import type { NextFunction, Request, Response } from 'express'
import type { UserRole } from '../types/auth.js'
import { getActiveUser, verifyAccessToken } from '../services/auth.js'

export async function authenticate(request: Request, response: Response, next: NextFunction) {
  try {
    const header = request.header('authorization')
    if (!header?.startsWith('Bearer ')) return response.status(401).json({ success: false, code: 'UNAUTHORIZED', message: 'Unauthorized' })
    const user = await getActiveUser(verifyAccessToken(header.slice(7)).sub)
    request.user = user
    return next()
  } catch {
    return response.status(401).json({ success: false, code: 'UNAUTHORIZED', message: 'Unauthorized' })
  }
}

export function authorize(...roles: UserRole[]) {
  return (request: Request, response: Response, next: NextFunction) => {
    if (!request.user || !roles.includes(request.user.role)) return response.status(403).json({ success: false, code: 'FORBIDDEN', message: 'Forbidden' })
    return next()
  }
}
