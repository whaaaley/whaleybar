import { getLogger } from '@logtape/logtape'
import { Subject } from 'rxjs'
import { type LogStreamMessage, type LogStreamRequest } from './logStream.schema.ts'

const log = getLogger(['app'])
const glazeLog = getLogger(['glaze'])

export const incomingEvents = new Subject<LogStreamRequest>()
export const outgoingEvents = new Subject<LogStreamMessage>()

type AppState = {
  hasConfig: boolean
  glazeConfig: unknown | null
}

const state: AppState = {
  hasConfig: false,
  glazeConfig: null,
}

incomingEvents.subscribe((event) => {
  const { category, properties } = event

  if (category.includes('glaze') && properties.type === 'set-config') {
    log.info('Receive glaze config')

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

  if (category.includes('app') && properties.type === 'new-connection') {
    if (state.hasConfig) {
      glazeLog.info('Broadcasting existing glaze config to new client', {
        type: 'glaze-config-update',
        glazeConfig: state.glazeConfig,
      })
    }
  }
})
