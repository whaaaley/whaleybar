import { getLogger } from '@logtape/logtape'
import { Subject } from 'rxjs'
import { type LogStreamMessageSchema } from './logStream.schema.ts'

const log = getLogger(['app'])
const glazeLog = getLogger(['glaze'])

type Message = LogStreamMessageSchema

export const incomingEvents = new Subject<Message>()
export const outgoingEvents = new Subject<Message>()

const state = {
  hasConfig: false,
  glazeConfig: null,
}

incomingEvents.subscribe((event) => {
  const { category, properties } = event

  if (category.includes('glaze') && properties.type === 'set-config') {
    log.info('Receive glaze config')
    // console.log('glz', properties.glazeConfig.allMonitors.find((m) => m.hasFocus))

    // Todo: Narrow down specific properties that are allowed to be set in the config
    state.hasConfig = true
    state.glazeConfig = properties.glazeConfig

    glazeLog.info('Broadcast glaze config', {
      type: 'glaze-config-update',
      glazeConfig: state.glazeConfig,
    })
  }
})

outgoingEvents.subscribe((event) => {
  const { category, properties } = event

  if (category.includes('info') && properties.type === 'new-connection') {
    if (state.hasConfig) {
      glazeLog.info('Sending glaze configuration to new client', {
        type: 'request-config-update',
        connectionId: properties.connectionId,
        glazeConfig: state.glazeConfig,
      })
    } else {
      glazeLog.info('Glaze configuration not initialized yet', {
        type: 'request-config-init',
        connectionId: properties.connectionId,
      })
    }
  }
})
