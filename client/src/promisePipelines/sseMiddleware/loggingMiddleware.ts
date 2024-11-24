import { Middleware } from '~/composables/useWith'
import { SSEContext, type SSEMessageEvent } from '~/composables/useWithSSE'

export const loggingMiddleware: Middleware<SSEContext> = async (context) => {
  console.log('loggingMiddleware1', JSON.stringify(context, null, 2))

  context.data = context.data
    .map((message: SSEMessageEvent) => {
      return {
        ...message,
        data: JSON.parse(message.data),
      }
    })

  console.log('loggingMiddleware2', JSON.stringify(context, null, 2))

  // Only keep the last 5 logs
  // context.data = context.data
  // .slice(-5)

  return context
}
