import type { NextFunction, Request, Response } from 'express'
import { z } from 'zod'
import { createUser, getUser, listUsers, updateUser, updateUserStatus } from '../services/users.js'
import { createUserSchema, listUsersSchema, updateUserSchema, updateUserStatusSchema } from '../validators/user.js'

function validationError(error: z.ZodError) {
  return { success: false, code: 'VALIDATION_ERROR', message: 'Validation failed', details: error.flatten().fieldErrors }
}

function paramId(request: Request) {
  const value = request.params.id
  return Array.isArray(value) ? value[0] : value
}

export async function listUsersController(request: Request, response: Response, next: NextFunction) {
  try {
    const parsed = listUsersSchema.safeParse(request.query)
    if (!parsed.success) return response.status(400).json(validationError(parsed.error))
    const { page, limit, search, role, status } = parsed.data
    const result = await listUsers({ skip: (page - 1) * limit, take: limit, search, role, status })
    return response.json({ success: true, data: result.users, meta: { page, limit, total: result.total, totalPages: Math.ceil(result.total / limit) } })
  } catch (error) { return next(error) }
}

export async function getUserController(request: Request, response: Response, next: NextFunction) {
  try { return response.json({ success: true, data: await getUser(paramId(request)) }) } catch (error) { return next(error) }
}

export async function createUserController(request: Request, response: Response, next: NextFunction) {
  try {
    const parsed = createUserSchema.safeParse(request.body)
    if (!parsed.success) return response.status(400).json(validationError(parsed.error))
    return response.status(201).json({ success: true, data: await createUser(parsed.data) })
  } catch (error) { return next(error) }
}

export async function updateUserController(request: Request, response: Response, next: NextFunction) {
  try {
    const parsed = updateUserSchema.safeParse(request.body)
    if (!parsed.success) return response.status(400).json(validationError(parsed.error))
    return response.json({ success: true, data: await updateUser(paramId(request), parsed.data) })
  } catch (error) { return next(error) }
}

export async function updateUserStatusController(request: Request, response: Response, next: NextFunction) {
  try {
    const parsed = updateUserStatusSchema.safeParse(request.body)
    if (!parsed.success) return response.status(400).json(validationError(parsed.error))
    return response.json({ success: true, data: await updateUserStatus(paramId(request), parsed.data.status, request.user!.id) })
  } catch (error) { return next(error) }
}
