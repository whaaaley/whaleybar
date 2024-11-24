import { Middleware } from '~/composables/useWith'
import { type SSEContext } from '~/composables/useWithSSE'

export const unmarshalMiddleware: Middleware<SSEContext> = async (context) => {
  context.data = context.data
    .map((message: MessageEvent) => {
      let data

      try {
        data = JSON.parse(message.data)
      }
      catch {
        data = message.data
      }

      return { ...message, data }
    })
}
