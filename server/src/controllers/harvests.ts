import type { NextFunction, Request, Response } from 'express'
import { z } from 'zod'
import { createHarvest, deleteHarvest, getHarvest, listHarvests, updateHarvest } from '../services/harvests.js'
import { createHarvestSchema, listHarvestsSchema, updateHarvestSchema } from '../validators/harvest.js'

function validationError(error: z.ZodError) { return { success: false, code: 'VALIDATION_ERROR', message: 'Validation failed', details: error.flatten().fieldErrors } }
function paramId(request: Request) { const value = request.params.id; return Array.isArray(value) ? value[0] : value }

export async function listHarvestsController(request: Request, response: Response, next: NextFunction) {
  try {
    const parsed = listHarvestsSchema.safeParse(request.query)
    if (!parsed.success) return response.status(400).json(validationError(parsed.error))
    const { page, limit, ...filters } = parsed.data
    const result = await listHarvests({ skip: (page - 1) * limit, take: limit, ...filters })
    return response.json({ success: true, data: result.harvests, meta: { page, limit, total: result.total, totalPages: Math.ceil(result.total / limit) } })
  } catch (error) { return next(error) }
}

export async function getHarvestController(request: Request, response: Response, next: NextFunction) {
  try { return response.json({ success: true, data: await getHarvest(paramId(request)) }) } catch (error) { return next(error) }
}

export async function createHarvestController(request: Request, response: Response, next: NextFunction) {
  try {
    const parsed = createHarvestSchema.safeParse(request.body)
    if (!parsed.success) return response.status(400).json(validationError(parsed.error))
    return response.status(201).json({ success: true, data: await createHarvest(parsed.data) })
  } catch (error) { return next(error) }
}

export async function updateHarvestController(request: Request, response: Response, next: NextFunction) {
  try {
    const parsed = updateHarvestSchema.safeParse(request.body)
    if (!parsed.success) return response.status(400).json(validationError(parsed.error))
    return response.json({ success: true, data: await updateHarvest(paramId(request), parsed.data) })
  } catch (error) { return next(error) }
}

export async function deleteHarvestController(request: Request, response: Response, next: NextFunction) {
  try { await deleteHarvest(paramId(request)); return response.json({ success: true, message: 'Harvest deleted successfully' }) } catch (error) { return next(error) }
}
