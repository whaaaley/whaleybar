import { getLogger } from '@logtape/logtape'
import { Context, ServerSentEvent, Status } from '@oak/oak'
import { z } from 'zod'

const logger = getLogger(['app'])

// Salt used for one-way hashing of IP addresses for privacy
const bytes = crypto.getRandomValues(new Uint8Array(16))
const salt = Array.from(bytes)
  .map((b) => b.toString(16).padStart(2, '0'))
  .join('')

// Creates a consistent but anonymized identifier from an IP address
const anonymizeIp = async (ip: string): Promise<string> => {
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(salt + ip))
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 16)
}

const LogRequestSchema = z.object({
  category: z.array(z.string()),
  level: z.enum(['debug', 'info', 'warn', 'error', 'fatal']),
  message: z.array(z.string()),
  properties: z.unknown(),
})

type Connection = {
  target: EventTarget
  interval: number
}

// Maps anonymized client IDs to their SSE connections
const activeConnections = new Map<string, Connection>()

export const createLogStreamController = () => ({
  connect: async (ctx: Context) => {
    const { request: req } = ctx
    ctx.response.status = 200

    const clientId = await anonymizeIp(req.ip)
    const existing = activeConnections.get(clientId)

    if (existing) {
      logger.info(`Closing existing connection for client: ${clientId}`)
      clearInterval(existing.interval)
      activeConnections.delete(clientId)
    }

    const target = await ctx.sendEvents()
    const heartbeat = new ServerSentEvent('heartbeat')

    // Prevents connection timeout by sending periodic heartbeats
    const interval = setInterval(() => {
      target.dispatchEvent(heartbeat)
      logger.info('heartbeat')
    }, 30000)

    activeConnections.set(clientId, { target, interval })
    logger.info(`New connection established for client: ${clientId}`)

    // Ensures connection resources are properly cleaned up on disconnect
    target.addEventListener('close', () => {
      const connection = activeConnections.get(clientId)

      if (connection) {
        clearInterval(connection.interval)
        activeConnections.delete(clientId)
        logger.info(`Connection closed for client: ${clientId}`)
      }
    })
  },
  emit: async (ctx: Context) => {
    const { response: res, request: req } = ctx

    const body = await req.body.json()
    const validated = LogRequestSchema.parse(body)

    logger[validated.level](validated.message.join(', '))
    res.status = Status.OK
  },
  broadcast: (data: unknown) => {
    const event = new ServerSentEvent('message', { data })

    for (const { target } of activeConnections.values()) {
      target.dispatchEvent(event)
    }
  },
})
