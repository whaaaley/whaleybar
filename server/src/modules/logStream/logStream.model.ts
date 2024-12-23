import { getLogger } from '@logtape/logtape'
import { Subject } from 'rxjs'
import { type LogStreamMessageSchema } from './logStream.schema.ts'

const log = getLogger(['app'])
const glazeLog = getLogger(['glaze'])

type Message = LogStreamMessageSchema

export const incomingEvents = new Subject<Message>()
export const outgoingEvents = new Subject<Message>()

// global state that holds onto the initialize monitor state
const glazeConfig = {
  isInitialized: false,
  allMonitors: [],
  monitorWorkspaces: [],
}

setInterval(() => {
  console.log('glazeConfig', JSON.stringify(glazeConfig, null, 2))
}, 5000)

export const getGlazeConfig = () => glazeConfig

incomingEvents.subscribe((event) => {
  console.log('!!!!! INCOMING EVENT !!!!!!!', event)

  // if (event.properties?.requestInit || event.properties?.requestUpdate) {
  if (event.category.includes('glaze') && event.properties.setGlazeConfig) {
    log.info('Initializing glaze configuration', {
      connectionId: event.properties.connectionId,
      glazeConfig: event.properties.glazeConfig,
    })

    // Todo: Fix types and narrow down the properties that are sent from the client
    glazeConfig.isInitialized = true
    glazeConfig.allMonitors = event.properties.allMonitors
    glazeConfig.monitorWorkspaces = event.properties.monitorWorkspaces
  }
})

outgoingEvents.subscribe((event) => {
  // Send Glaze config right when client establishes connection
  if (event.properties?.newConnection) {
    if (glazeConfig.isInitialized) {
      glazeLog.info('Sending glaze configuration to new client', {
        requestUpdate: true,
        connectionId: event.properties.connectionId,
        glazeConfig,
      })
    } else {
      glazeLog.info('Glaze configuration not initialized yet', {
        requestInit: true,
        connectionId: event.properties.connectionId,
      })
    }
  }
})
