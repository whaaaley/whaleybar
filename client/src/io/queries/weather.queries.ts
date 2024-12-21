import { type WeatherRequest, type WeatherResponse, weatherResponseSchema } from '$schemas/weather.schema'
// import { type WeatherRequest, type WeatherResponse, weatherResponseSchema } from '../../../../server/modules/weather/weather.schema.ts'
import { makeRequest } from '~/io/streams/fetch.streams'

// Type casting with 'as Promise<WeatherResponse>' is safe here because:
// 1. The Zod schema (WeatherResponseSchema) validates the data at runtime
// 2. If the API returns invalid data, Zod's parse() will throw regardless of the type cast
// 3. The cast just helps TypeScript understand the shape of the data after Zod validates it
export const getWeather = async (params: WeatherRequest) => {
  const data = await makeRequest({
    method: 'GET',
    url: '/api/weather',
    queryString: params,
    responseSchema: weatherResponseSchema,
    headers: {
      'Cache-Control': 'public, max-age=3600, immutable',
    },
  })

  return data as Promise<WeatherResponse>
}
