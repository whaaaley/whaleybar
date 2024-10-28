import { z } from 'zod'

export const validate = (schema, data) => {
  try {
    return schema.parse(data)
  }
  catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Zod validation failed:', error.errors)
      // You can add more error handling or side effects here
    }

    throw error
  }
}

export const zodMiddleware = async (ctx, next) => {
  await next()
  ctx.data = validate(ctx.schema, ctx.data)
}
