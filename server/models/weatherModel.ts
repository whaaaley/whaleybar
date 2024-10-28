import { z } from 'zod'

const WeatherRes = z.object({
  condition: z.string(),
  temp: z.string(),
})

const getWeather = async (location: string) => {
  const res = await fetch(`https://wttr.in/${location}?format=j1`)

  if (!res.ok) {
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
