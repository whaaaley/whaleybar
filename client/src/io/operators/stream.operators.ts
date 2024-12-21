import { ZodError, ZodSchema } from 'zod'

type PrefixUrlContext = {
  url: string
}

export function prefixUrl<T extends PrefixUrlContext> (context: T): T {
  context.url = import.meta.env.VITE_API_PREFIX + context.url
  return context
}

type UnmarshalContext = {
  data: unknown
}

export function unmarshal<T extends UnmarshalContext> (context: T): T {
  context.data = JSON.parse(context.data as string)
  return context
}

type ZodContext = {
  data: unknown
  messageSchema: ZodSchema
}

export function zod<T extends ZodContext> (context: T): T {
  try {
    // context.data = context.messageSchema.parse(context.data)
    // return context
    return {
      ...context,
      data: context.messageSchema.parse(context.data),
    }
  }
  catch (error) {
    if (error instanceof ZodError) {
      throw new Error('Unexpected data format received from API')
    }
    throw error
  }
}

type LoggingContext = {
  data: unknown
}

export function logging<T extends LoggingContext> (context: T): T {
  console.log(JSON.stringify(context.data, null, 2))
  return context
}
