import { z } from 'zod'
import { getLogger } from '@logtape/logtape'

const logger = getLogger(['app'])

const WeatherRes = z.object({
  condition: z.string(),
  temp: z.string(),
})

const getWeather = async (location: string) => {
  // For testing purposes
  return {
    condition: 'Snowing',
    temp: '32',
  }

  const res = await fetch(`https://wttr.in/${location}?format=j1`, {
    headers: {
      'Cache-Control': 'max-age=3600',
    },
  })

  if (!res.ok || res.status !== 200) {
    throw new Error('Failed to fetch weather data')
  }

  const data = await res.json()
  const [today] = data.current_condition

  return WeatherRes.parse({
    condition: today.weatherDesc[0].value,
    temp: today.temp_F,
  })
}

export default {
  getWeather,
}
