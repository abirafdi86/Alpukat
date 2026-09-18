import { z } from 'zod'

const email = z.string().trim().min(1, 'Enter your email address.')
  .pipe(z.email('Enter a valid email address.')).transform(value => value.toLowerCase())
const password = z.string().min(8, 'Use at least 8 characters.').max(128, 'Use no more than 128 characters.')

export const loginSchema = z.object({ email, password, rememberMe: z.boolean() })
export const registerSchema = z.object({
  fullName: z.string().trim().min(2, 'Enter your full name.').max(80, 'Use no more than 80 characters.'),
  email,
  phone: z.string().trim().min(1, 'Enter your phone number.')
    .regex(/^\+?[\d\s().-]+$/, 'Enter a valid phone number.')
    .refine(value => { const digits = value.replace(/\D/g, ''); return digits.length >= 7 && digits.length <= 15 }, 'Use 7 to 15 digits, including your country code.'),
  password: password.regex(/[a-zA-Z]/, 'Include at least one letter.').regex(/\d/, 'Include at least one number.'),
  confirmPassword: z.string().min(1, 'Confirm your password.'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match.', path: ['confirmPassword'],
})
export const forgotPasswordSchema = z.object({ email })

export const mockUserSchema = z.object({
  name: z.string().min(1),
  email: z.email(),
  role: z.enum(['OWNER', 'WORKER']),
})
