import { ZodType } from 'zod'
import { useWith } from './useWith'

export type RequestContext = RequestInit & {
  url: string
  queryString?: Record<string, string>
  body?: Record<string, unknown>
  responseSchema: ZodType<unknown> // Maybe find a better way to handle this
}

export type FetchContext = {
  request: RequestContext
  data: unknown
  response: Response
}

type FetchFunction = (request: RequestContext) => Promise<FetchContext>

const createFetchFn = (method?: string): FetchFunction => async (request) => {
  const response = await fetch(request.url, { ...request, method })
  const headers = response.headers.get('Content-Type') ?? ''

  const data = headers.includes('application/json')
    ? await response.json()
    : await response.text()

  // Opinionated way to handle server errors
  if (!response.ok) {
    if (Array.isArray(data)) {
      throw new Error(data[0]?.message || `API request failed: ${response.status}`)
    }

    throw new Error(`API request failed: ${response.status} ${response.statusText}`)
  }

  return {
    request,
    data,
    response,
  }
}

export const useWithFetch = () => useWith<RequestContext, FetchContext>({
  fn: createFetchFn(),
})

export const useWithGet = () => useWith<RequestContext, FetchContext>({
  fn: createFetchFn('GET'),
})

export const useWithPost = () => useWith<RequestContext, FetchContext>({
  fn: createFetchFn('POST'),
})
