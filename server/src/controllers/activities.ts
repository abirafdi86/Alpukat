import type { NextFunction, Request, Response } from 'express'
import { z } from 'zod'
import { createActivity, deleteActivity, getActivity, listActivities, updateActivity } from '../services/activities.js'
import { createActivitySchema, listActivitiesSchema, updateActivitySchema } from '../validators/activity.js'

function validationError(error: z.ZodError) { return { success: false, code: 'VALIDATION_ERROR', message: 'Validation failed', details: error.flatten().fieldErrors } }
function paramId(request: Request) { const value = request.params.id; return Array.isArray(value) ? value[0] : value }

export async function listActivitiesController(request: Request, response: Response, next: NextFunction) {
  try {
    const parsed = listActivitiesSchema.safeParse(request.query)
    if (!parsed.success) return response.status(400).json(validationError(parsed.error))
    const { page, limit, ...filters } = parsed.data
    const result = await listActivities({ skip: (page - 1) * limit, take: limit, ...filters })
    return response.json({ success: true, data: result.activities, meta: { page, limit, total: result.total, totalPages: Math.ceil(result.total / limit) } })
  } catch (error) { return next(error) }
}

export async function getActivityController(request: Request, response: Response, next: NextFunction) { try { return response.json({ success: true, data: await getActivity(paramId(request)) }) } catch (error) { return next(error) } }
export async function createActivityController(request: Request, response: Response, next: NextFunction) { try { const parsed = createActivitySchema.safeParse(request.body); if (!parsed.success) return response.status(400).json(validationError(parsed.error)); return response.status(201).json({ success: true, data: await createActivity(parsed.data) }) } catch (error) { return next(error) } }
export async function updateActivityController(request: Request, response: Response, next: NextFunction) { try { const parsed = updateActivitySchema.safeParse(request.body); if (!parsed.success) return response.status(400).json(validationError(parsed.error)); return response.json({ success: true, data: await updateActivity(paramId(request), parsed.data) }) } catch (error) { return next(error) } }
export async function deleteActivityController(request: Request, response: Response, next: NextFunction) { try { return response.json({ success: true, data: await deleteActivity(paramId(request)), message: 'Activity cancelled successfully' }) } catch (error) { return next(error) } }
