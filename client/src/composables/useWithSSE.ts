import { useWith } from './useWith'

export type RequestContext = {
  url: string
  onMessage: (data: MessageEvent[]) => void
}

export type SSEContext = {
  request: RequestContext
  data: MessageEvent[]
}

type RunAfterQueue = (result: SSEContext) => void
type SSEFn = (request: RequestContext, runAfterQueue: RunAfterQueue) => Promise<SSEContext>

const createSSEFn = (): SSEFn => async (request, runAfterQueue) => {
  const eventSource = new EventSource(request.url)
  const data: MessageEvent[] = []

  await new Promise((resolve, reject) => {
    eventSource.onopen = resolve
    eventSource.onerror = err => reject(err)
  })

  const handleEvent = (event: MessageEvent) => {
    data.push(event)

    const context = { request, data }
    runAfterQueue(context)

    request.onMessage(context.data)
  }

  eventSource.addEventListener('heartbeat', handleEvent)
  eventSource.addEventListener('message', handleEvent)

  return {
    request,
    data,
  }
}

export const useWithSSE = () => useWith<RequestContext, SSEContext>({
  fn: createSSEFn(),
})
