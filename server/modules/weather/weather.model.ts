import { env } from '../../env.js'
import { type WeatherRequest, type WeatherResponse, weatherResponseSchema } from './weather.schema.ts'

export const getWeather = async (params: WeatherRequest): Promise<WeatherResponse> => {
  if (env.DEV) {
    return {
      condition: 'Sunny',
      temp: '75',
    }
  }

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
