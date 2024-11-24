import { z } from 'zod'
import { withGet } from '~/promisePipelines/fetchPipeline'

type GetWeatherParams = {
  location: string
}

const WeatherResponseSchema = z.object({
  condition: z.string(),
  temp: z.string(),
})

type WeatherResponse = z.infer<typeof WeatherResponseSchema>

// Todo: add middleware to swap out the URL based on the environment

// Type casting with 'as Promise<WeatherResponse>' is safe here because:
// 1. The Zod schema (WeatherResponseSchema) validates the data at runtime
// 2. If the API returns invalid data, Zod's parse() will throw regardless of the type cast
// 3. The cast just helps TypeScript understand the shape of the data after Zod validates it
export const weatherQueries = {
  getWeather: async (params: GetWeatherParams) => {
    const { data } = await withGet.execute({
      url: '/api/weather',
      queryString: params,
      responseSchema: WeatherResponseSchema,
      headers: {
        'Cache-Control': 'public, max-age=3600, immutable',
      },
    })

    return data as Promise<WeatherResponse>
  },
}
