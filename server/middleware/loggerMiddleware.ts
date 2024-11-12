import { type Context, type Next } from '@oak/oak'
import { getLogger } from '@logtape/logtape'

const logger = getLogger(['app'])

export const loggerMiddleware = async (ctx: Context, next: Next) => {
  const start = Date.now()
  await next()

  const { method, url } = ctx.request
  const { status } = ctx.response
  const responseTime = Date.now() - start
  const contentLength = ctx.response.headers.get('Content-Length') || '-'

  const logEntry = `"${method} ${url} HTTP/1.1" ${status} ${contentLength} ${responseTime}ms`

  if (status >= 500) {
    logger.error(logEntry)
    return
  }

  if (status >= 400) {
    logger.warn(logEntry)
    return
  }

  logger.info(logEntry)
}
