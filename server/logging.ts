import { configure, getConsoleSink } from '@logtape/logtape'

await configure({
  sinks: {
    console: getConsoleSink(),
  },
  filters: {},
  loggers: [
    {
      category: ['app'],
      level: 'info',
      sinks: ['console'],
    },
    {
      category: ['logtape', 'meta'],
      level: 'warning',
      sinks: ['console'],
    },
  ],
})
