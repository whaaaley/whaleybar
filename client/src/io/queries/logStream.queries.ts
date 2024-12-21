import { type LogRequestSchema, logResponseSchema, messageSchema } from '$models/logStream.model'
import { makeRequest } from '~/io/streams/fetch.streams'
import { connect, disconnect } from '~/io/streams/sse.streams'

export type LogResponseSchema = z.infer<typeof logResponseSchema>
export type MessageSchema = z.infer<typeof messageSchema>

type NextFn = (data: unknown) => void

let lastNext: NextFn | undefined

export const connectLogs = async (next: NextFn) => {
  lastNext = next

  const data = await connect({
    url: '/stream/logs',
    messageSchema,
    next,
    error: (err) => { throw err },
  })

  return [data] as Promise<MessageSchema>[]
}

export const disconnectLogs = () => {
  disconnect({ url: '/stream/logs' })
}

export const reconnectLogs = async (next?: NextFn) => {
  disconnectLogs()

  if (!next && !lastNext) {
    throw new Error('Next function is not defined')
  }

  return connectLogs(next ?? lastNext!)
}

export const sendLog = async (params: LogRequestSchema) => {
  const data = await makeRequest({
    method: 'POST',
    url: '/api/log',
    responseSchema: logResponseSchema,
    body: JSON.stringify(params),
    headers: {
      'Content-Type': 'application/json',
    },
  })

  return data as Promise<LogResponseSchema>
}
