import { lastValueFrom, map, of, pipe, switchMap } from 'rxjs'
import { fromFetch } from 'rxjs/fetch'
import { type ZodSchema } from 'zod'
import { http, marshal, prefixUrl, unmarshal, zod } from './fetch.operators'

type RequestConfig = RequestInit & {
  url: string
  queryString?: Record<string, string>
  responseSchema: ZodSchema
}

const attachResponse = (ctx: RequestConfig) => {
  return (response: Response) => ({ ...ctx, response })
}

export const makeRequest = (config: RequestConfig) => {
  const observable$ = of(config).pipe(
    map(pipe(prefixUrl, marshal)),
    switchMap(ctx => fromFetch(ctx.url, ctx).pipe(
      map(attachResponse(ctx)),
    )),
    switchMap(pipe(unmarshal)),
    map(pipe(http, zod)),
    map(ctx => ctx.data),
  )

  return lastValueFrom(observable$)
}
