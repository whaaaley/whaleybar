import { z } from 'zod'
import { makeRequest } from '~/io/streams/fetch.streams'
import { connect, disconnect } from '~/io/streams/sseStreams'

type SendLogParams = {
  category: string[]
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal'
  message: string[]
  properties: unknown
}

const MessageSchema = z.object({
  category: z.array(z.string()),
  level: z.enum(['debug', 'info', 'warn', 'error', 'fatal']),
  timestamp: z.number(),
  message: z.array(z.string()),
  rawMessage: z.string(),
  properties: z.unknown(),
})

export type MessageSchema = z.infer<typeof MessageSchema>

type NextFn = (data: unknown) => void

let lastNext: NextFn | undefined

export const connectLogs = async (next: NextFn) => {
  lastNext = next

  const data = await connect({
    url: '/stream/logs',
    messageSchema: MessageSchema,
    next,
    error: (err) => { throw err },
  })

  return [data] as Promise<MessageSchema>[]
}

export const disconnectLogs = () => {
  disconnect({
    url: '/stream/logs',
  })
}

export const reconnectLogs = async (next?: NextFn) => {
  disconnectLogs()

  if (!next && !lastNext) {
    throw new Error('Next function is not defined')
  }

  return connectLogs(next ?? lastNext!)
}

export const sendLog = async (params: SendLogParams) => {
  const data = await makeRequest({
    url: '/api/log',
    responseSchema: z.unknown(),
    body: JSON.stringify(params),
  })

  return data as Promise<void>
}
