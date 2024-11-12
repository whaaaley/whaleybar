import { z } from 'zod'
import { type Middleware } from '~/composables/useWith'

type Context = {
  responseSchema: z.ZodSchema<unknown>
}

export const zodMiddleware: Middleware<Context> = async (ctx, data) => {
  try {
    // Validate but don't return - let the pipeline handle the data
    ctx.responseSchema.parse(data)
    return ctx
  }
  catch (error) {
    // Todo: use the logger here instead of console.error
    console.error('Zod validation failed:', error)

    if (error instanceof z.ZodError) {
      console.error('Zod validation errors:', error.errors)
    }

    throw error
  }
}
