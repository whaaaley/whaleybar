import { z } from 'zod'

// Todo: Log messages should be the LogRecord type from @logtape/logtape

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

export type LogStreamRequestSchema = z.infer<typeof logStreamRequestSchema>
export type LogStreamResponseSchema = z.infer<typeof logStreamResponseSchema>

export type LogStreamMessageSchema = z.infer<typeof logStreamMessageSchema>
