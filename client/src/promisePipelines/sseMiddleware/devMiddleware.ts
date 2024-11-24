import { Middleware } from '~/composables/useWith'
import { RequestContext } from '~/composables/useWithSSE'

export const devMiddleware: Middleware<RequestContext> = async (context) => {
  context.url = import.meta.env.VITE_API_PREFIX + context.url
  console.log('devMiddleware', context.url)
  return context
}
