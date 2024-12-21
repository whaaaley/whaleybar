import { type LogRecord } from '@logtape/logtape'
import { createLogStreamController } from '../controllers/logStream.controller.ts'

const logStreamController = createLogStreamController()

export const getLogStreamSink = () => (record: LogRecord) => {
  logStreamController.broadcast(record)
}
