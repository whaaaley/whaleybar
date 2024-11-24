import { getLogger } from '@logtape/logtape'
import { type Context, ServerSentEvent, Status } from '@oak/oak'
import { z } from 'zod'

const logger = getLogger(['app'])

const bytes = crypto.getRandomValues(new Uint8Array(16))
const salt = Array.from(bytes)
  .map((b) => b.toString(16).padStart(2, '0'))
  .join('')

const anonymizeIp = async (ip: string): Promise<string> => {
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(salt + ip))

  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 16) // Keep first 16 chars (64 bits) for demo purposes
}

//
//
//

type Connection = {
  target: EventTarget
  interval: number
}

const LogRequestSchema = z.object({
  category: z.array(z.string()),
  level: z.enum(['debug', 'info', 'warn', 'error', 'fatal']),
  message: z.array(z.string()),
  properties: z.unknown(),
})

// Track active connections and their intervals
const activeConnections = new Map<string, Connection>()

export const createLogStreamController = () => ({
  connect: async (ctx: Context) => {
    const { request: req } = ctx

    // Set correct headers for SSE
    ctx.response.status = 200

    const clientId = await anonymizeIp(req.ip) // Derive a key for the client connection
    const existing = activeConnections.get(clientId)

    // Clean up existing connection if it exists
    if (existing) {
      logger.info(`Closing existing connection for client: ${clientId}`)

      clearInterval(existing.interval)
      activeConnections.delete(clientId)
    }

    const target = await ctx.sendEvents()

    // const event = new ServerSentEvent('message', {
    //   data: JSON.stringify({ type: 'info', data: 'heartbeat' }),
    // })

    const heartbeat = new ServerSentEvent('heartbeat')

    // Send a heartbeat every 30 seconds to keep the connection alive
    const interval = setInterval(() => {
      target.dispatchEvent(heartbeat)
      logger.info('heartbeat')
    }, 30000)

    // Store both the target and interval for cleanup
    activeConnections.set(clientId, { target, interval })
    logger.info(`New connection established for client: ${clientId}`)

    // Cleanup when connection closes
    target.addEventListener('close', () => {
      const connection = activeConnections.get(clientId)

      if (connection) {
        clearInterval(connection.interval)
        activeConnections.delete(clientId)

        logger.info(`Connection closed for client: ${clientId}`)
      }
    })
  },
  sendEvent: (data: unknown) => {
    const event = new ServerSentEvent('message', { data })

    for (const { target } of activeConnections.values()) {
      target.dispatchEvent(event)
    }
  },
  log: async (ctx: Context) => {
    const { response: res, request: req } = ctx

    // const body = JSON.parse(await req.body.json())
    const body = await req.body.json()
    console.log(body, typeof body)
    const validated = LogRequestSchema.parse(body)

    logger[validated.level](validated.message.join(', '))

    res.status = Status.OK
  },
})
