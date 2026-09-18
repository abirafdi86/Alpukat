import type { NextFunction, Request, Response } from 'express'
import { z } from 'zod'
import { createBlock, deactivateBlock, getBlock, listBlocks, updateBlock } from '../services/blocks.js'
import { createBlockSchema, listBlocksSchema, updateBlockSchema } from '../validators/block.js'

function validationError(error: z.ZodError) { return { success: false, code: 'VALIDATION_ERROR', message: 'Validation failed', details: error.flatten().fieldErrors } }
function paramId(request: Request) { const value = request.params.id; return Array.isArray(value) ? value[0] : value }

export async function listBlocksController(request: Request, response: Response, next: NextFunction) {
  try {
    const parsed = listBlocksSchema.safeParse(request.query)
    if (!parsed.success) return response.status(400).json(validationError(parsed.error))
    const { page, limit, search, farmId, status, mainVariety } = parsed.data
    const result = await listBlocks({ skip: (page - 1) * limit, take: limit, search, farmId, status, mainVariety })
    return response.json({ success: true, data: result.blocks, meta: { page, limit, total: result.total, totalPages: Math.ceil(result.total / limit) } })
  } catch (error) { return next(error) }
}

export async function getBlockController(request: Request, response: Response, next: NextFunction) {
  try { return response.json({ success: true, data: await getBlock(paramId(request)) }) } catch (error) { return next(error) }
}

export async function createBlockController(request: Request, response: Response, next: NextFunction) {
  try {
    const parsed = createBlockSchema.safeParse(request.body)
    if (!parsed.success) return response.status(400).json(validationError(parsed.error))
    return response.status(201).json({ success: true, data: await createBlock(parsed.data) })
  } catch (error) { return next(error) }
}

export async function updateBlockController(request: Request, response: Response, next: NextFunction) {
  try {
    const parsed = updateBlockSchema.safeParse(request.body)
    if (!parsed.success) return response.status(400).json(validationError(parsed.error))
    return response.json({ success: true, data: await updateBlock(paramId(request), parsed.data) })
  } catch (error) { return next(error) }
}

export async function deleteBlockController(request: Request, response: Response, next: NextFunction) {
  try { return response.json({ success: true, data: await deactivateBlock(paramId(request)), message: 'Block deactivated successfully' }) } catch (error) { return next(error) }
}
