import type { Context } from '@oak/oak'

interface Weather {
  condition: string
  temp: string
}

interface WeatherDeps {
  getWeather: (location: string) => Promise<{ weather: Weather }>
}

export const createWeatherController = (deps: WeatherDeps) => ({
  getWeather: async ({ response: res, request: req }: Context) => {
    try {
      const body = await req.body.json()
      const weather = await deps.getWeather(body.location)

      console.log('weather', weather)

      res.status = 200
      res.headers.set('Content-Type', 'application/json')
      res.body = weather
    } catch (error) {
      console.error(error)

      res.status = 500
      res.body = { error }
    }
  },
})
