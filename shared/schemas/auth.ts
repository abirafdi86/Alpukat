import { z } from 'zod'

const email = z.string().trim().min(1, 'validation.required')
  .pipe(z.email('validation.email')).transform(value => value.toLowerCase())
const password = z.string().min(1, 'validation.required').min(8, 'validation.passwordMin').max(128, 'passwordRecovery.validation.passwordMax')

export const loginSchema = z.object({ email, password, remember: z.boolean() })
export const registerSchema = z.object({
  fullName: z.string().trim().min(2, 'registerAuth.validation.fullName').max(80, 'registerAuth.validation.fullNameMax'),
  email,
  phone: z.string().trim().min(1, 'validation.required')
    .regex(/^\+?[\d\s().-]+$/, 'registerAuth.validation.phone')
    .refine(value => { const digits = value.replace(/\D/g, ''); return digits.length >= 7 && digits.length <= 15 }, 'registerAuth.validation.phoneLength'),
  password: password.regex(/[a-zA-Z]/, 'registerAuth.validation.passwordLetter').regex(/\d/, 'registerAuth.validation.passwordNumber'),
  confirmPassword: z.string().min(1, 'validation.required'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'validation.passwordMatch', path: ['confirmPassword'],
})
const resetEmail = z.string().trim().min(1, 'validation.required')
  .pipe(z.email('validation.email')).transform(value => value.toLowerCase())
export const forgotPasswordSchema = z.object({ email: resetEmail })
export const resetPasswordSchema = z.object({
  email: resetEmail,
  password: z.string().min(1, 'validation.required').min(8, 'validation.passwordMin').max(128, 'passwordRecovery.validation.passwordMax'),
  passwordConfirmation: z.string().min(1, 'validation.required'),
}).refine(data => data.password === data.passwordConfirmation, {
  message: 'validation.passwordMatch', path: ['passwordConfirmation'],
})

export const mockUserSchema = z.object({
  name: z.string().min(1),
  email: z.email(),
  role: z.enum(['OWNER', 'WORKER']),
})
