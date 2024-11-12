interface Context {
  url: string
  queryString?: Record<string, string>
  body?: unknown
}

export const serializationMiddleware = async (ctx: Context): Promise<Context> => {
  const url = new URL(ctx.url)

  if (ctx.queryString) {
    url.search = new URLSearchParams(ctx.queryString).toString()
    ctx.url = url.toString()
  }

  if (ctx.body) {
    ctx.body = JSON.stringify(ctx.body)
  }

  return ctx
}
