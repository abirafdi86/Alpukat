import { z } from 'zod'

const itemSchema = z.object({
  variety: z.string().trim().min(1),
  grade: z.enum(['GRADE_A', 'GRADE_B', 'GRADE_C', 'REJECTED']),
  fruitCount: z.coerce.number().int().min(0),
  weight: z.coerce.number().positive(),
})

export const listHarvestsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  farmId: z.string().uuid().optional(),
  blockId: z.string().uuid().optional(),
  treeId: z.string().uuid().optional(),
  workerId: z.string().uuid().optional(),
  variety: z.string().trim().optional(),
  grade: z.enum(['GRADE_A', 'GRADE_B', 'GRADE_C', 'REJECTED']).optional(),
})

export const createHarvestSchema = z.object({
  harvestDate: z.coerce.date(),
  farmId: z.string().uuid(),
  blockId: z.string().uuid(),
  treeId: z.string().uuid().nullable().optional(),
  workerId: z.string().uuid(),
  notes: z.string().trim().nullable().optional(),
  items: z.array(itemSchema).min(1),
})

export const updateHarvestSchema = createHarvestSchema
