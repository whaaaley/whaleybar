import { useWith, Middleware } from './useWith.js'

interface FetchCtx extends RequestInit {
  url: string
}

const beforeQueue: Middleware<FetchCtx>[] = []
const afterQueue: Middleware<FetchCtx>[] = []

export const useWithFetch = () => useWith<FetchCtx>({
  fn: ctx => fetch(ctx.url, ctx),
  beforeQueue,
  afterQueue,
})

export const useWithGet = () => useWith<FetchCtx>({
  fn: ctx => fetch(ctx.url, { ...ctx, method: 'GET' }).then(res => res.json()),
  beforeQueue,
  afterQueue,
})

export const useWithPost = () => useWith<FetchCtx>({
  fn: ctx => fetch(ctx.url, { ...ctx, method: 'POST' }).then(res => res.json()),
  beforeQueue,
  afterQueue,
})
