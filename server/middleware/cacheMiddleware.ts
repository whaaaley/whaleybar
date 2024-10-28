import { Context, Next } from '@oak/oak'
import { encodeBase64 } from '@std/encoding'

// WARNING: This code is untested!!!

export const cacheMiddleware = async (ctx: Context, next: Next) => {
  const { request: req, response: res } = ctx

  // Open the cache
  const cache = await caches.open('oak-cache')

  // Skip caching if Authorization header is present
  // This is a simple way to avoid caching sensitive data
  if (req.headers.has('Authorization')) {
    await next()
    return
  }

  // Generate a cache key based on the request URL
  let cacheKey = req.url.toString()

  // Include the request body in the cache key for POST requests
  if (req.method === 'POST') {
    const body = await req.body.json()

    const bodyData = new TextEncoder().encode(JSON.stringify(body))
    const bodyHash = await crypto.subtle.digest('SHA-256', bodyData)

    cacheKey += encodeBase64(new Uint8Array(bodyHash))
  }

  // Encode the cache key hash to base64
  // This is necessary because cache keys can only be strings
  const encodedCacheKey = encodeBase64(new TextEncoder().encode(cacheKey))

  // Check if the response is already cached
  // If it is, return the cached response
  const cachedResponse = await cache.match(encodedCacheKey)
  if (cachedResponse) {
    res.body = await cachedResponse.json()
    return
  }

  // Proceed if no cache match
  await next()

  // Cache the response
  await cache.put(
    encodedCacheKey,
    new Response(JSON.stringify(res.body), { headers: res.headers }),
  )
}
