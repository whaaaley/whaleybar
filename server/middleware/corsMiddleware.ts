import { Context, Next } from '@oak/oak'
import { env } from '../env.js'

interface Whitelist {
  [key: string]: {
    methods: string
    headers: string
  }
}

const whitelist: Whitelist = {
  'https://whaleybar.deno.dev': {
    methods: 'GET, POST, OPTIONS',
    headers: 'Authorization, Content-Type, Cache-Control',
  },
}

// Add localhost to whitelist in development environment
if (env.ENV === 'development') {
  whitelist['http://localhost:4200'] = {
    methods: 'GET, POST, OPTIONS',
    headers: 'Authorization, Content-Type, Cache-Control',
  }

  whitelist['http://localhost:4201'] = {
    methods: 'GET, POST, OPTIONS',
    headers: 'Authorization, Content-Type, Cache-Control',
  }

  whitelist['http://asset.localhost'] = {
    methods: 'GET, POST, OPTIONS',
    headers: 'Authorization, Content-Type, Cache-Control',
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
    res.headers.set('Access-Control-Expose-Headers', 'Cache-Control')
  }

  if (req.method === 'OPTIONS') {
    res.status = 204 // No Content

    res.headers.set('Access-Control-Max-Age', '86400') // Increased to 24 hours
    res.headers.set('Cache-Control', 'public, max-age=86400') // Added Cache-Control

    return
  }

  await next()
}
