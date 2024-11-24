import { Middleware } from '~/composables/useWith'
import { RequestContext } from '~/composables/useWithFetch'

export const marshalMiddleware: Middleware<RequestContext> = async (context) => {
  const url = new URL(context.url)

  if (context.queryString) {
    url.search = new URLSearchParams(context.queryString).toString()
    context.url = url.toString()
  }

  if (context.body) {
    console.log('context.body', context.body, typeof context.body)
    context.body = JSON.stringify(context.body)
    context.headers = {
      ...context.headers,
      'Content-Type': 'application/json',
    }
  }

  return context
}
