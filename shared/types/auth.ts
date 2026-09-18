import type { z } from 'zod'
import type { loginSchema, registerSchema, mockUserSchema } from '../schemas/auth'

export type LoginValues = z.infer<typeof loginSchema>
export type RegisterValues = z.infer<typeof registerSchema>
export type MockUser = z.infer<typeof mockUserSchema>
