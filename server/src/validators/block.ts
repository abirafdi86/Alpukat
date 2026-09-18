import { z } from 'zod'

export const blockStatusSchema = z.enum(['ACTIVE', 'INACTIVE'])
const areaSchema = z.union([z.string(), z.number()]).refine((value) => Number.isFinite(Number(value)) && Number(value) >= 0, 'Area must be a non-negative decimal')

export const listBlocksSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().optional(),
  farmId: z.string().uuid().optional(),
  status: blockStatusSchema.optional(),
  mainVariety: z.string().trim().optional(),
})

export const createBlockSchema = z.object({
  farmId: z.string().uuid(),
  name: z.string().trim().min(1),
  area: areaSchema,
  mainVariety: z.string().trim().min(1),
  plantingYear: z.coerce.number().int().min(1900).max(new Date().getFullYear()),
  status: blockStatusSchema.default('ACTIVE'),
  notes: z.string().trim().nullable().optional(),
})

export const updateBlockSchema = createBlockSchema.partial().refine((value) => Object.keys(value).length > 0, { message: 'At least one field is required' })
