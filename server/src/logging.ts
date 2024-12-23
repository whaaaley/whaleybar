import { configure, getConsoleSink } from '@logtape/logtape'
import { getLogStreamSink } from './modules/logStream/logStream.sink.ts'

await configure({
  sinks: {
    console: getConsoleSink(),
    logStream: getLogStreamSink(),
  },
  filters: {
    debugAndAbove: 'debug',
    warningAndAbove: 'warning',
  },
  loggers: [
    {
      category: ['app'],
      filters: ['debugAndAbove'],
      sinks: ['console', 'logStream'],
    },
    {
      category: ['glaze'],
      filters: ['debugAndAbove'],
      sinks: ['console', 'logStream'],
    },
    {
      category: ['logtape', 'meta'],
      filters: ['warningAndAbove'],
      sinks: ['console'],
    },
  ],
})
