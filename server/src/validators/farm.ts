import { z } from 'zod'

export const farmStatusSchema = z.enum(['ACTIVE', 'INACTIVE'])
const decimalSchema = z.union([z.string(), z.number()]).refine((value) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed >= 0
}, 'Area must be a non-negative decimal')

export const listFarmsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().optional(),
  status: farmStatusSchema.optional(),
})

export const createFarmSchema = z.object({
  name: z.string().trim().min(1),
  location: z.string().trim().min(1),
  area: decimalSchema,
  description: z.string().trim().nullable().optional(),
  status: farmStatusSchema.default('ACTIVE'),
})

export const updateFarmSchema = createFarmSchema.partial().refine((value) => Object.keys(value).length > 0, { message: 'At least one field is required' })
