import { z } from 'zod'
import { makeRequest } from '~/io/streams/fetch.streams'

//
//
//

export const RequestSchema = z.object({
  location: z.string({
    required_error: 'Location is required',
    invalid_type_error: 'Location must be a string',
  }),
})

export const ResponseSchema = z.object({
  condition: z.string(),
  temp: z.string(),
})

export type Request = z.infer<typeof RequestSchema>
export type Response = z.infer<typeof ResponseSchema>

//
//
//

// Type casting with 'as Promise<WeatherResponse>' is safe here because:
// 1. The Zod schema (WeatherResponseSchema) validates the data at runtime
// 2. If the API returns invalid data, Zod's parse() will throw regardless of the type cast
// 3. The cast just helps TypeScript understand the shape of the data after Zod validates it
export const getWeather = async (params: weather.Request) => {
  const data = await makeRequest({
    method: 'GET',
    url: '/api/weather',
    queryString: params,
    responseSchema: weather.ResponseSchema,
    headers: {
      'Cache-Control': 'public, max-age=3600, immutable',
    },
  })

  return data as Promise<weather.Response>
}

export const weatherQueries = {
  getWeather,
}
