import { ZodError } from 'zod'
import { type Middleware } from '~/composables/useWith'
import { type FetchContext } from '~/composables/useWithFetch'

export const zodMiddleware: Middleware<FetchContext> = async (context) => {
  const { request, data } = context

  try {
    request.responseSchema.parse(data)
    return context
  }
  catch (error) {
    if (error instanceof ZodError) {
      throw new Error('Unexpected data format received from API')
    }

    throw error
  }
}
