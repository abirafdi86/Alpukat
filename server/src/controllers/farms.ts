import type { NextFunction, Request, Response } from 'express'
import { z } from 'zod'
import { createFarm, deactivateFarm, getFarm, listFarms, updateFarm } from '../services/farms.js'
import { createFarmSchema, listFarmsSchema, updateFarmSchema } from '../validators/farm.js'

function validationError(error: z.ZodError) {
  return { success: false, code: 'VALIDATION_ERROR', message: 'Validation failed', details: error.flatten().fieldErrors }
}

function paramId(request: Request) {
  const value = request.params.id
  return Array.isArray(value) ? value[0] : value
}

export async function listFarmsController(request: Request, response: Response, next: NextFunction) {
  try {
    const parsed = listFarmsSchema.safeParse(request.query)
    if (!parsed.success) return response.status(400).json(validationError(parsed.error))
    const { page, limit, search, status } = parsed.data
    const result = await listFarms({ skip: (page - 1) * limit, take: limit, search, status })
    return response.json({ success: true, data: result.farms, meta: { page, limit, total: result.total, totalPages: Math.ceil(result.total / limit) } })
  } catch (error) { return next(error) }
}

export async function getFarmController(request: Request, response: Response, next: NextFunction) {
  try { return response.json({ success: true, data: await getFarm(paramId(request)) }) } catch (error) { return next(error) }
}

export async function createFarmController(request: Request, response: Response, next: NextFunction) {
  try {
    const parsed = createFarmSchema.safeParse(request.body)
    if (!parsed.success) return response.status(400).json(validationError(parsed.error))
    return response.status(201).json({ success: true, data: await createFarm(parsed.data) })
  } catch (error) { return next(error) }
}

export async function updateFarmController(request: Request, response: Response, next: NextFunction) {
  try {
    const parsed = updateFarmSchema.safeParse(request.body)
    if (!parsed.success) return response.status(400).json(validationError(parsed.error))
    return response.json({ success: true, data: await updateFarm(paramId(request), parsed.data) })
  } catch (error) { return next(error) }
}

export async function deleteFarmController(request: Request, response: Response, next: NextFunction) {
  try { return response.json({ success: true, data: await deactivateFarm(paramId(request)), message: 'Farm deactivated successfully' }) } catch (error) { return next(error) }
}
