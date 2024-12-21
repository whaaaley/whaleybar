import { getLogger } from '@logtape/logtape'
import { Context, ServerSentEvent, Status } from '@oak/oak'
import { createSaltedHash } from '../../utils/hash.util.ts'
import { logRequestSchema } from './logStream.schema.ts'

const logger = getLogger(['app'])

// type LogStreamDeps = {
//   // Add dependencies here
// }

type Connection = {
  target: EventTarget
  interval: number
}

// Maps anonymized client IDs to their SSE connections
const activeConnections = new Map<string, Connection>()

export const createLogStreamController = (/* deps: LogStreamDeps */) => ({
  connect: async (ctx: Context) => {
    const { request: req } = ctx
    ctx.response.status = 200

    const clientId = await createSaltedHash(req.ip)
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
    const validated = logRequestSchema.parse(body)

    logger[validated.level](validated.message.join(', '))

    res.status = Status.OK
    res.body = { status: 'success' }

    // Return the response so we can test the controller
    return res
  },
  broadcast: (data: unknown) => {
    const event = new ServerSentEvent('message', { data })

    for (const { target } of activeConnections.values()) {
      target.dispatchEvent(event)
    }

    // Return the data so we can test the controller
    return data
  },
})
