import { type Middleware } from '~/composables/useWith'
import { type FetchContext } from '~/composables/useWithFetch'

export const httpMiddleware: Middleware<FetchContext> = async (context) => {
  const { data, response } = context

  if (response && !response.ok) {
    if (Array.isArray(data)) {
      const [firstError] = data
      throw new Error(firstError?.message || `API request failed: ${response.status}`)
    }

    throw new Error(`API request failed: ${response.status} ${response.statusText}`)
  }

  return context
}
