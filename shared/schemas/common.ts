import { z } from 'zod'

export const entityIdSchema = z.string().trim().min(1)
export const isoDateTimeSchema = z.iso.datetime({ offset: true })
