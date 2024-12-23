import { Context, ServerSentEvent, Status } from '@oak/oak'
import { getLogger } from '@logtape/logtape'
import { incomingEvents, outgoingEvents } from './logStream.model.ts'
import { logStreamRequestSchema } from './logStream.schema.ts'
import { createSaltedHash } from './logStream.util.ts'

const log = getLogger(['app'])

type Connection = {
  target: EventTarget
  interval: number
}

// Maps client IDs to their SSE connections
const activeConnections = new Map<string, Connection>()

export const createLogStreamController = () => ({
  connect: async (ctx: Context) => {
    const { request: req } = ctx
    ctx.response.status = 200

    const clientId = await createSaltedHash(req.ip)
    const existing = activeConnections.get(clientId)

    if (existing) {
      log.info(`Closing existing connection for client: ${clientId}`)
      clearInterval(existing.interval)
      activeConnections.delete(clientId)
    }

    const target = await ctx.sendEvents()
    const heartbeat = new ServerSentEvent('heartbeat')

    // Prevents connection timeout by sending periodic heartbeats
    const interval = setInterval(() => {
      target.dispatchEvent(heartbeat)
      log.info('heartbeat', { heartbeat: true })
    }, 30000)

    activeConnections.set(clientId, { target, interval })
    log.info(`New connection established for client: ${clientId}`, {
      type: 'new-connection',
    })

    // Outgoing events are broadcasted to the client
    outgoingEvents.subscribe((data) => {
      target.dispatchEvent(new ServerSentEvent('message', { data }))
    })

    // Ensures connection resources are properly cleaned up on disconnect
    target.addEventListener('close', () => {
      const connection = activeConnections.get(clientId)

      if (connection) {
        clearInterval(connection.interval)
        activeConnections.delete(clientId)
        log.info(`Connection closed for client: ${clientId}`)
      }
    })
  },
  emit: async (ctx: Context) => {
    const { response: res, request: req } = ctx

    const body = await req.body.json()
    const validated = logStreamRequestSchema.parse(body)

    // Emit the validated message to the logger
    log[validated.level](validated.message.join(', '))
    incomingEvents.next(validated)

    res.status = Status.OK
    res.body = { status: 'success' }

    // Return the response so we can test the controller
    return res
  },
})
