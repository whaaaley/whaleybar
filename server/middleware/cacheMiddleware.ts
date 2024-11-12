import { Context, Next } from '@oak/oak'
import { encodeBase64 } from '@std/encoding'
import { getLogger } from '@logtape/logtape'

interface CacheOptions {
  ttl?: number
  excludePaths?: string[]
}

const logger = getLogger(['app'])

export const createCacheMiddleware = (options: CacheOptions = {}) => {
  const {
    ttl = 5 * 60 * 1000, // 5 minutes
    excludePaths = [],
  } = options

  const cache = new Map()

  return async (ctx: Context, next: Next) => {
    const { request: req, response: res } = ctx

    if (excludePaths.some((path) => req.url.pathname.startsWith(path))) {
      await next()
      return
    }

    if (!['GET', 'POST'].includes(req.method) || req.headers.has('Authorization')) {
      await next()
      return
    }

    let cacheKey = req.url.toString()

    if (req.method === 'POST') {
      const body = await req.body.json()
      const bodyData = new TextEncoder().encode(JSON.stringify(body))
      const bodyHash = await crypto.subtle.digest('SHA-256', bodyData)
      cacheKey += encodeBase64(new Uint8Array(bodyHash))
    }

    const cached = await cache.get(cacheKey)

    if (cached && Date.now() < cached.expires) {
      res.body = await cached.response.json()
      logger.info('Cache hit', { cacheKey })
      return
    }

    await next()
    logger.info('Cache miss', { cacheKey })

    cache.set(cacheKey, {
      response: new Response(JSON.stringify(res.body), { headers: res.headers }),
      expires: Date.now() + ttl,
    })
  }
}
