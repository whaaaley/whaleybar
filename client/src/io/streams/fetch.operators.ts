import { ZodError, ZodSchema } from 'zod'

type PrefixUrlContext = {
  url: string
}

export const prefixUrl = <T extends PrefixUrlContext>(context: T): T => {
  return {
    ...context,
    url: import.meta.env.VITE_API_PREFIX + context.url,
  }
}

type AuthContext = {
  headers: Record<string, string>
}

export const auth = <T extends AuthContext>(context: T): T => {
  const token = localStorage.getItem('token')

  if (!token) {
    throw new Error('Unauthorized')
  }

  context.headers = {
    ...context.headers,
    Authorization: `Bearer ${token}`,
  }

  return context
}

type MarshalContext = {
  url: string
  headers?: HeadersInit
  queryString?: Record<string, string>
  body?: unknown
}

export const marshal = <T extends MarshalContext>(context: T): T => {
  const url = new URL(context.url)

  if (context.queryString) {
    url.search = new URLSearchParams(context.queryString).toString()
    context.url = url.toString()
  }

  if (context.body) {
    context.headers = {
      ...context.headers,
      'Content-Type': 'application/json',
    }
  }

  return context
}

type UnmarshalContext = {
  response: Response
}

type UnmarshalOutput<T> = T & {
  data: unknown
}

type UnmarshalFn = <T extends UnmarshalContext>(context: T) => (
  Promise<UnmarshalOutput<T>>
)

export const unmarshal: UnmarshalFn = async (context) => {
  const response = context.response
  const contentType = response.headers.get('content-type')

  const data = contentType && contentType.includes('application/json')
    ? await response.json()
    : await response.text()

  return {
    ...context,
    data,
  }
}

type HttpContext = {
  data: unknown
  response: Response
}

export const http = <T extends HttpContext>(context: T): T => {
  const { data, response: res } = context

  if (res && !res.ok) {
    if (Array.isArray(data)) {
      const [firstError] = data
      throw new Error(firstError?.message || `API request failed: ${res.status}`)
    }

    throw new Error(`API request failed: ${res.status} ${res.statusText}`)
  }

  return context
}

//
//
//

type ZodContext = {
  data: unknown
  responseSchema: ZodSchema
}

export const zod = <T extends ZodContext>(context: T): T => {
  try {
    return {
      ...context,
      data: context.responseSchema.parse(context.data),
    }
  }
  catch (error) {
    if (error instanceof ZodError) {
      throw new Error('Unexpected data format received from API')
    }

    throw error
  }
}

type RateLimitContext = {
  response: Response
}

export const rateLimit = <T extends RateLimitContext>(context: T): T => {
  if (context.response.status === 429) {
    throw new Error('Rate limit exceeded')
  }

  return context
}
