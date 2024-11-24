import * as middleware from './sseMiddleware/index'
import { useWithSSE } from '~/composables/useWithSSE'

export const withSSE = useWithSSE()

withSSE.useBefore(middleware.devMiddleware)

withSSE.useAfter(middleware.unmarshalMiddleware)
// withSSE.useAfter(loggingMiddleware)
