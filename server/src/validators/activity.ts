import { z } from 'zod'

export const activityTypeSchema = z.enum(['WATERING', 'FERTILIZATION', 'PRUNING', 'PEST_CONTROL', 'DISEASE_TREATMENT', 'CLEANING', 'HARVEST_PREPARATION', 'OTHER'])
export const activityStatusSchema = z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'])
export const activityViewSchema = z.enum(['upcoming', 'overdue', 'completed']).optional()
const costSchema = z.union([z.string(), z.number()]).refine((value) => Number.isFinite(Number(value)) && Number(value) >= 0, 'Cost must be a non-negative decimal')

export const listActivitiesSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  farmId: z.string().uuid().optional(),
  blockId: z.string().uuid().optional(),
  treeId: z.string().uuid().optional(),
  assignedWorkerId: z.string().uuid().optional(),
  type: activityTypeSchema.optional(),
  status: activityStatusSchema.optional(),
  view: activityViewSchema,
})

export const createActivitySchema = z.object({
  type: activityTypeSchema,
  farmId: z.string().uuid(),
  blockId: z.string().uuid(),
  treeId: z.string().uuid().nullable().optional(),
  assignedWorkerId: z.string().uuid(),
  scheduledDate: z.coerce.date(),
  status: activityStatusSchema.default('SCHEDULED'),
  notes: z.string().trim().nullable().optional(),
  cost: costSchema,
})

export const updateActivitySchema = createActivitySchema.partial().refine((value) => Object.keys(value).length > 0, { message: 'At least one field is required' })
