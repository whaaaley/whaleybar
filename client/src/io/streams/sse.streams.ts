import { fromEvent, lastValueFrom, map, of, pipe, switchMap, tap } from 'rxjs'
import { type ZodSchema } from 'zod'
import { prefixUrl } from './fetch.operators'
import { logging, unmarshal, zod } from './sse.operators'

type ConnectConfig = {
  url: string
  messageSchema: ZodSchema
  next: (data: unknown) => void
  error: (error: Error) => void
}

type DisconnectConfig = {
  url: string
}

const sources = new Map<string, EventSource>()

const createEventSource = (context: ConnectConfig) => {
  let eventSource = sources.get(context.url)

  if (!eventSource) {
    eventSource = new EventSource(context.url)
    sources.set(context.url, eventSource)

    if (import.meta.env.DEV) {
      eventSource.onopen = () => console.log(`SSE connection established`)
      eventSource.onerror = event => console.error(`SSE error:`, event)
    }
  }

  return eventSource
}

const attachData = (ctx: ConnectConfig) => {
  return (event: MessageEvent) => ({
    ...ctx,
    data: event.data,
  })
}

export const connect = (config: ConnectConfig) => {
  const observable$ = of(config).pipe(
    map(pipe(prefixUrl)),
    switchMap((ctx) => {
      const eventSource = createEventSource(ctx)
      return fromEvent<MessageEvent>(eventSource, 'message').pipe(map(attachData(ctx)))
    }),
    map(pipe(unmarshal, zod, logging)),
    map(ctx => ctx.data),
  )

  return lastValueFrom(observable$.pipe(
    tap({
      next: config.next,
      error: config.error,
    }),
  ))
}

export const disconnect = (config: DisconnectConfig) => {
  const observable$ = of(config).pipe(
    map(pipe(prefixUrl)),
    map((ctx) => {
      const eventSource = sources.get(ctx.url)

      if (eventSource) {
        eventSource.close()
        sources.delete(ctx.url)
      }
    }),
  )

  return lastValueFrom(observable$)
}
