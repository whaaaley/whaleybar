import {
  type LogStreamMessageSchema,
  logStreamMessageSchema,
  type LogStreamRequestSchema,
  type LogStreamResponseSchema,
  logStreamResponseSchema,
} from '$schemas'
import { makeRequest } from '~/io/streams/fetch.streams'
import { connect, disconnect } from '~/io/streams/sse.streams'

type NextFn = (data: unknown) => void

let lastNext: NextFn | undefined

export const connectLogs = async (next: NextFn) => {
  lastNext = next

  const data = await connect({
    url: '/stream/logs',
    messageSchema: logStreamMessageSchema,
    next,
    error: (err) => { throw err },
  })

  return [data] as Promise<LogStreamMessageSchema>[]
}

export const disconnectLogs = () => {
  disconnect({ url: '/stream/logs' })
}

export const reconnectLogs = async (next?: NextFn) => {
  disconnectLogs()

  const nextFn = next ?? lastNext
  if (!nextFn) {
    throw new Error('Next function is not defined')
  }

  return connectLogs(nextFn)
}

export const sendLog = async (params: LogStreamRequestSchema) => {
  const data = await makeRequest({
    method: 'POST',
    url: '/api/log',
    responseSchema: logStreamResponseSchema,
    body: JSON.stringify(params),
    headers: {
      'Content-Type': 'application/json',
    },
  })

  return data as Promise<LogStreamResponseSchema>
}

export const logStreamQueries = {
  connectLogs,
  disconnectLogs,
  reconnectLogs,
  sendLog,
}
