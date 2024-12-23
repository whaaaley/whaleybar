import { z } from 'zod'

export const logStreamRequestSchema = z.object({
  category: z.array(z.string()),
  level: z.enum(['debug', 'info', 'warn', 'error', 'fatal']),
  message: z.array(z.string()),
  properties: z.record(z.string(), z.unknown()),
})

export const logStreamResponseSchema = z.object({
  status: z.enum(['success', 'error']),
})

export const logStreamMessageSchema = z.object({
  category: z.array(z.string()),
  level: z.enum(['debug', 'info', 'warn', 'error', 'fatal']),
  timestamp: z.number(),
  message: z.array(z.string()),
  rawMessage: z.string(),
  properties: z.record(z.string(), z.unknown()),
})

export type LogStreamRequest = z.infer<typeof logStreamRequestSchema>
export type LogStreamResponse = z.infer<typeof logStreamResponseSchema>
export type LogStreamMessage = z.infer<typeof logStreamMessageSchema>
