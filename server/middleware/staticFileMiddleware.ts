import { Context, Next, send } from '@oak/oak'

// Middleware to handle static file requests
export const staticFileMiddleware = async (ctx: Context, next: Next) => {
  const { request, response } = ctx
  const path = request.url.pathname

  if (path.startsWith('/assets')) {
    try {
      await send(ctx, path, {
        root: './dist',
      })
    } catch (error) {
      response.status = error.status ?? 500
      response.body = error.message ?? 'Internal Server Error'
    }
  } else {
    await next()
  }
}
