import { type LogRecord } from '@logtape/logtape'
import { outgoingEvents } from './logStream.model.ts'

export const getLogStreamSink = () => (record: LogRecord) => {
  outgoingEvents.next(record)
}
