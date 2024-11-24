import { z } from 'zod'
import { withPost } from '~/promisePipelines/fetchPipeline'
import { withSSE } from '~/promisePipelines/ssePiepeline'

type ConnectLogsParams = {
  onMessage: (data: MessageEvent[]) => void
}

type SendLogParams = {
  category: string[]
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal'
  message: string[]
  properties: unknown
}

const LogResponseSchema = z.array(
  z.object({
    category: z.array(z.string()),
    level: z.enum(['debug', 'info', 'warn', 'error', 'fatal']),
    timestamp: z.number(),
    message: z.array(z.string()),
    rawMessage: z.string(),
    properties: z.unknown(),
  }),
)

type LogResponse = z.infer<typeof LogResponseSchema>

// Todo: add middleware to swap out the URL based on the environment

// Type casting with 'as Promise<LogResponse>' is safe here because:
// 1. The Zod schema (LogResponseSchema) validates the data at runtime
// 2. If the API returns invalid data, Zod's parse() will throw regardless of the type cast
// 3. The cast just helps TypeScript understand the shape of the data after Zod validates it
export const logStreamQueries = {
  connectLogs: async (params: ConnectLogsParams) => {
    const { data } = await withSSE.execute({
      url: '/stream/logs',
      responseSchema: LogResponseSchema,
      onMessage: params.onMessage,
    })

    return data as Promise<LogResponse>
  },
  sendLog: async (params: SendLogParams) => {
    const { data } = await withPost.execute({
      url: '/api/log',
      body: params,
      responseSchema: z.unknown(),
    })

    return data as Promise<void>
  },
}
