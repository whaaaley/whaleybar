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

export const weatherQueries = {
  getWeather: (params: GetWeatherParams) => (
    withGet.execute({
      url: 'http://localhost:4202/api/weather',
      queryString: params,
      responseSchema: WeatherResponseSchema,
      headers: {
        'Cache-Control': 'public, max-age=3600, immutable',
      },
    }) as Promise<WeatherResponse>
  ),
}
