import { type Context, Status } from '@oak/oak'
import { getLogger } from '@logtape/logtape'
import { z } from 'zod'

const logger = getLogger(['app'])

type Weather = {
  condition: string
  temp: string
}

type WeatherDeps = {
  getWeather: (location: string) => Promise<Weather>
}

const weatherRequestSchema = z.object({
  location: z.string({
    required_error: 'Location is required',
    invalid_type_error: 'Location must be a string',
  }),
})

export const createWeatherController = (deps: WeatherDeps) => ({
  getWeather: async (ctx: Context) => {
    const { response: res, request: req } = ctx

    const queryString = Object.fromEntries(req.url.searchParams)
    const validated = weatherRequestSchema.parse(queryString)

    const weather = await deps.getWeather(validated.location)
    logger.info('Weather data retrieved', { weather })

    res.status = Status.OK
    res.headers.set('Content-Type', 'application/json')
    res.body = weather
  },
})
