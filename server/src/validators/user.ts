import { z } from 'zod'

export const userRoleSchema = z.enum(['OWNER', 'WORKER'])
export const userStatusSchema = z.enum(['ACTIVE', 'INACTIVE'])

export const listUsersSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().optional(),
  role: userRoleSchema.optional(),
  status: userStatusSchema.optional(),
})

export const createUserSchema = z.object({
  fullName: z.string().trim().min(1),
  email: z.string().trim().email(),
  phone: z.string().trim().min(1).optional(),
  role: userRoleSchema,
  password: z.string().min(8),
})

export const updateUserSchema = z.object({
  fullName: z.string().trim().min(1).optional(),
  email: z.string().trim().email().optional(),
  phone: z.string().trim().min(1).nullable().optional(),
  role: userRoleSchema.optional(),
}).refine((value) => Object.keys(value).length > 0, { message: 'At least one field is required' })

export const updateUserStatusSchema = z.object({ status: userStatusSchema })
