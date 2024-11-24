import { unmarshalMiddleware } from './sseMiddleware/index'
import { useWithSSE } from '~/composables/useWithSSE'

export const withSSE = useWithSSE()

withSSE.useAfter(unmarshalMiddleware)
// withSSE.useAfter(loggingMiddleware)
