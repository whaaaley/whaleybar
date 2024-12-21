import { z } from 'zod'

export const logRequestSchema = z.object({
  category: z.array(z.string()),
  level: z.enum(['debug', 'info', 'warn', 'error', 'fatal']),
  message: z.array(z.string()),
  properties: z.unknown(),
})

export const logResponseSchema = z.object({
  status: z.enum(['success', 'error']),
})

export const messageSchema = z.object({
  category: z.array(z.string()),
  level: z.enum(['debug', 'info', 'warn', 'error', 'fatal']),
  timestamp: z.number(),
  message: z.array(z.string()),
  rawMessage: z.string(),
  properties: z.unknown(),
})

export type LogRequestSchema = z.infer<typeof logRequestSchema>
export type LogResponseSchema = z.infer<typeof logResponseSchema>

export type MessageSchema = z.infer<typeof messageSchema>
