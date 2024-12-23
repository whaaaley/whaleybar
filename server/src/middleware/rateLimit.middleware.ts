import { Context, Next, Status } from '@oak/oak'
import { getLogger } from '@logtape/logtape'

const logger = getLogger(['rateLimit'])

type RateLimitConfig = {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
  message?: string // Optional custom error message
}

type RateLimitStore = {
  timestamp: number
  requests: number
}

// Default configuration
const defaultConfig: RateLimitConfig = {
  windowMs: 10 * 60 * 1000, // 10 minutes
  maxRequests: 30, // 30 requests per minute
  message: 'Rate limit exceeded. Please try again later.',
}

// In-memory store for rate limiting
const store = new Map<string, RateLimitStore>()

// Clean up old entries periodically
const cleanup = () => {
  const now = Date.now()

  for (const [key, value] of store.entries()) {
    if (now - value.timestamp > defaultConfig.windowMs) {
      store.delete(key)
    }
  }
}

// Run cleanup every minute
setInterval(cleanup, 60 * 1000)

export const rateLimitMiddleware = (config: Partial<RateLimitConfig> = {}) => {
  const options: RateLimitConfig = { ...defaultConfig, ...config }

  return async (ctx: Context, next: Next) => {
    try {
      const ip = ctx.request.ip

      // Get or create rate limit info for this IP
      const now = Date.now()
      const rateLimitInfo = store.get(ip) || {
        timestamp: now,
        requests: 0,
      }

      // Reset if window has passed
      if (now - rateLimitInfo.timestamp > options.windowMs) {
        rateLimitInfo.timestamp = now
        rateLimitInfo.requests = 0
      }

      // Increment request count
      rateLimitInfo.requests++

      // Update store
      store.set(ip, rateLimitInfo)

      // Set RateLimit headers
      // const remaining = Math.max(0, options.maxRequests - rateLimitInfo.requests)
      const reset = rateLimitInfo.timestamp + options.windowMs

      // ctx.response.headers.set('X-RateLimit-Limit', options.maxRequests.toString())
      // ctx.response.headers.set('X-RateLimit-Remaining', remaining.toString())
      // ctx.response.headers.set('X-RateLimit-Reset', reset.toString())

      // Check if rate limit exceeded
      if (rateLimitInfo.requests > options.maxRequests) {
        logger.warn(`Rate limit exceeded for IP: ${ip}`)

        ctx.response.status = Status.TooManyRequests
        ctx.response.headers.set('Retry-After', Math.ceil((reset - now) / 1000).toString())
        // ctx.response.body = {
        //   errors: [{
        //     message: options.message,
        //   }],
        // }

        // Return the response so we can test the middleware
        return ctx.response
      }

      await next()
    } catch (error: unknown) {
      logger.error(`Rate limit middleware error: ${error instanceof Error ? error.message : 'Unknown error'}`)

      ctx.response.status = Status.InternalServerError
      // ctx.response.body = {
      //   errors: [{
      //     message: 'An error occurred while processing the request.',
      //   }],
      // }
    }

    // Return the response so we can test the middleware
    return ctx.response
  }
}
