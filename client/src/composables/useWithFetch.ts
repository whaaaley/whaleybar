import { ZodType } from 'zod'
import { Middleware, useWith } from './useWith'

type FetchCtx = RequestInit & {
  url: string
  queryString?: Record<string, string>
  responseSchema: ZodType<unknown>
}

const beforeQueue: Middleware<FetchCtx>[] = []
const afterQueue: Middleware<FetchCtx>[] = []

const createFetchFn = (method?: string) => async (ctx: FetchCtx) => (
  fetch(ctx.url, { ...ctx, method }).then(res => res.json())
)

export const useWithFetch = () => useWith<FetchCtx>({
  fn: createFetchFn(),
  beforeQueue,
  afterQueue,
})

export const useWithGet = () => useWith<FetchCtx>({
  fn: createFetchFn('GET'),
  beforeQueue,
  afterQueue,
})

export const useWithPost = () => useWith<FetchCtx>({
  fn: createFetchFn('POST'),
  beforeQueue,
  afterQueue,
})
