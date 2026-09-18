import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { z } from 'zod'
import { authenticate } from '../middleware/auth.js'
import { env } from '../config/env.js'
import { AuthServiceError, authenticateUser, createAccessToken, createRefreshToken, getActiveUser, registerUser, verifyRefreshToken } from '../services/auth.js'
import { loginSchema, refreshSchema, registerSchema } from '../validators/auth.js'

const router = Router()
const refreshCookie = 'afms_refresh_token'
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: 'draft-8', legacyHeaders: false, message: { success: false, code: 'RATE_LIMITED', message: 'Too many authentication attempts' } })

function cookieOptions() {
  return { httpOnly: true, secure: env.nodeEnv === 'production', sameSite: env.nodeEnv === 'production' ? 'none' as const : 'lax' as const, path: '/api/v1/auth' }
}

function validationError(error: z.ZodError) {
  return { success: false, code: 'VALIDATION_ERROR', message: 'Validation failed', details: error.flatten().fieldErrors }
}

router.post('/register', authLimiter, async (request, response, next) => {
  try {
    const parsed = registerSchema.safeParse(request.body)
    if (!parsed.success) return response.status(400).json(validationError(parsed.error))
    const user = await registerUser(parsed.data)
    return response.status(201).json({ success: true, data: { user } })
  } catch (error) { return next(error) }
})

router.post('/login', authLimiter, async (request, response, next) => {
  try {
    const parsed = loginSchema.safeParse(request.body)
    if (!parsed.success) return response.status(400).json(validationError(parsed.error))
    const user = await authenticateUser(parsed.data.email, parsed.data.password)
    response.cookie(refreshCookie, createRefreshToken(user), { ...cookieOptions(), maxAge: 7 * 24 * 60 * 60 * 1000 })
    return response.json({ success: true, data: { user, accessToken: createAccessToken(user) } })
  } catch (error) { return next(error) }
})

router.post('/refresh', authLimiter, async (request, response, next) => {
  try {
    const parsed = refreshSchema.safeParse(request.body)
    if (!parsed.success) return response.status(400).json(validationError(parsed.error))
    const token = request.cookies?.[refreshCookie] as string | undefined
    if (!token) return response.status(401).json({ success: false, code: 'UNAUTHORIZED', message: 'Unauthorized' })
    const user = await getActiveUser(verifyRefreshToken(token).sub)
    return response.json({ success: true, data: { accessToken: createAccessToken(user), user } })
  } catch {
    return response.status(401).json({ success: false, code: 'UNAUTHORIZED', message: 'Unauthorized' })
  }
})

router.post('/logout', (_request, response) => {
  response.clearCookie(refreshCookie, cookieOptions())
  return response.json({ success: true, message: 'Logged out successfully' })
})

router.get('/me', authenticate, (request, response) => response.json({ success: true, data: { user: request.user } }))

export default router

export function isAuthServiceError(error: unknown): error is AuthServiceError {
  return error instanceof AuthServiceError
}
