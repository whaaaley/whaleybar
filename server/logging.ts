import { configure, getConsoleSink } from '@logtape/logtape'
import { getLogStreamSink } from './modules/logStream/logStream.sink.ts'

await configure({
  sinks: {
    console: getConsoleSink(),
    logStream: getLogStreamSink(),
  },
  filters: {},
  loggers: [
    {
      category: ['app'],
      level: 'debug',
      sinks: ['console', 'logStream'],
    },
    {
      category: ['logtape', 'meta'],
      level: 'warning',
      sinks: ['console'],
    },
  ],
})
