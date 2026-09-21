import type { NextFunction, Request, Response } from 'express'
import { z } from 'zod'
import { createTree, deactivateTree, getTree, listTrees, updateTree } from '../services/trees.js'
import { createTreeSchema, listTreesSchema, updateTreeSchema } from '../validators/tree.js'

function validationError(error: z.ZodError) { return { success: false, code: 'VALIDATION_ERROR', message: 'Validation failed', details: error.flatten().fieldErrors } }
function paramId(request: Request) { const value = request.params.id; return Array.isArray(value) ? value[0] : value }

export async function listTreesController(request: Request, response: Response, next: NextFunction) {
  try {
    const parsed = listTreesSchema.safeParse(request.query)
    if (!parsed.success) return response.status(400).json(validationError(parsed.error))
    const { page, limit, search, farmId, blockId, variety, status, health } = parsed.data
    const result = await listTrees({ skip: (page - 1) * limit, take: limit, search, farmId, blockId, variety, status, health })
    return response.json({ success: true, data: result.trees, meta: { page, limit, total: result.total, totalPages: Math.ceil(result.total / limit) } })
  } catch (error) { return next(error) }
}

export async function getTreeController(request: Request, response: Response, next: NextFunction) {
  try { return response.json({ success: true, data: await getTree(paramId(request)) }) } catch (error) { return next(error) }
}

export async function createTreeController(request: Request, response: Response, next: NextFunction) {
  try {
    const parsed = createTreeSchema.safeParse(request.body)
    if (!parsed.success) return response.status(400).json(validationError(parsed.error))
    return response.status(201).json({ success: true, data: await createTree(parsed.data) })
  } catch (error) { return next(error) }
}

export async function updateTreeController(request: Request, response: Response, next: NextFunction) {
  try {
    const parsed = updateTreeSchema.safeParse(request.body)
    if (!parsed.success) return response.status(400).json(validationError(parsed.error))
    return response.json({ success: true, data: await updateTree(paramId(request), parsed.data) })
  } catch (error) { return next(error) }
}

export async function deleteTreeController(request: Request, response: Response, next: NextFunction) {
  try { return response.json({ success: true, data: await deactivateTree(paramId(request)), message: 'Tree deactivated successfully' }) } catch (error) { return next(error) }
}
