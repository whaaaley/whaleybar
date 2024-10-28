import { Context, Next } from '@oak/oak'
import { env } from '../config/env.js'

// Define the type for the whitelist
interface Whitelist {
  [key: string]: {
    methods: string
    headers: string
  }
}

// CORS whitelist configuration
const whitelist: Whitelist = {
  'https://whaleybar.deno.dev': {
    methods: 'GET, POST, OPTIONS',
    headers: 'Authorization, Content-Type',
  },
}

// Add localhost to whitelist in development environment
if (env.ENV === 'development') {
  whitelist['http://localhost:4200'] = {
    methods: 'GET, POST, OPTIONS',
    headers: 'Authorization, Content-Type',
  }
}

// CORS middleware
export const corsMiddleware = async (ctx: Context, next: Next) => {
  const { request: req, response: res } = ctx
  const origin = req.headers.get('Origin')

  if (origin && whitelist[origin]) {
    res.headers.set('Access-Control-Allow-Origin', origin ?? '*')
    res.headers.set('Access-Control-Allow-Methods', whitelist[origin].methods)
    res.headers.set('Access-Control-Allow-Headers', whitelist[origin].headers)
  }

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status = 204 // No content
    res.headers.set('Access-Control-Max-Age', '300') // 5 min cache only on preflight
    return // Stop the middleware chain
  }

  await next()
}
