import { z } from 'zod'
import { withGet } from '~/promisePipelines/fetchPipeline'

type GetWeatherEmojiParams = {
  weatherCondition: string
}

const WeatherEmojiResponseSchema = z.object({
  character: z.string(),
  cldrName: z.string(),
  codePoints: z.string(),
})

type WeatherEmojiResponse = z.infer<typeof WeatherEmojiResponseSchema>

// Todo: add middleware to swap out the URL based on the environment

// Type casting with 'as Promise<WeatherEmojiResponse>' is safe here because:
// 1. The Zod schema (WeatherEmojiResponseSchema) validates the data at runtime
// 2. If the API returns invalid data, Zod's parse() will throw regardless of the type cast
// 3. The cast just helps TypeScript understand the shape of the data after Zod validates it
export const emojiQueries = {
  getWeatherEmoji: async (params: GetWeatherEmojiParams) => (
    withGet.execute({
      url: 'http://localhost:4202/api/weather-emoji',
      queryString: params,
      responseSchema: WeatherEmojiResponseSchema,
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    }) as Promise<WeatherEmojiResponse>
  ),
}
