import { z } from 'zod'

export const weatherRequestSchema = z.object({
  location: z.string({
    required_error: 'Location is required',
    invalid_type_error: 'Location must be a string',
  }),
})

export const weatherResponseSchema = z.object({
  condition: z.string(),
  temp: z.string(),
})

export type WeatherRequest = z.infer<typeof weatherRequestSchema>
export type WeatherResponse = z.infer<typeof weatherResponseSchema>

const getWeather = async (params: WeatherRequest): Promise<WeatherResponse> => {
  const res = await fetch(`https://wttr.in/${params.location}?format=j1`, {
    headers: {
      'Cache-Control': 'max-age=3600',
    },
  })

  if (!res.ok || res.status !== 200) {
    throw new Error('Failed to fetch weather data')
  }

  const data = await res.json()
  const [today] = data.current_condition

  return weatherResponseSchema.parse({
    condition: today.weatherDesc[0].value,
    temp: today.temp_F,
  })
}

export default {
  getWeather,
}
