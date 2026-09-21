import { z } from 'zod'

export const treeStatusSchema = z.enum(['PRODUCTIVE', 'NOT_PRODUCTIVE', 'YOUNG', 'DEAD'])
export const treeHealthSchema = z.enum(['HEALTHY', 'NEEDS_ATTENTION', 'SICK'])

export const listTreesSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().optional(),
  farmId: z.string().uuid().optional(),
  blockId: z.string().uuid().optional(),
  variety: z.string().trim().optional(),
  status: treeStatusSchema.optional(),
  health: treeHealthSchema.optional(),
})

export const createTreeSchema = z.object({
  treeCode: z.string().trim().min(1).max(100),
  farmId: z.string().uuid(),
  blockId: z.string().uuid(),
  variety: z.string().trim().min(1),
  plantingDate: z.coerce.date(),
  status: treeStatusSchema.default('YOUNG'),
  health: treeHealthSchema.default('HEALTHY'),
  notes: z.string().trim().nullable().optional(),
})

export const updateTreeSchema = createTreeSchema.partial().refine((value) => Object.keys(value).length > 0, { message: 'At least one field is required' })
