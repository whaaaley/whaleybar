import { type Context, Status } from '@oak/oak'
import { getLogger } from '@logtape/logtape'
import { type WeatherRequest, weatherRequestSchema, type WeatherResponse } from './weather.schema.ts'

const logger = getLogger(['app'])

type WeatherDeps = {
  getWeather: (params: WeatherRequest) => Promise<WeatherResponse>
}

export const createWeatherController = (deps: WeatherDeps) => ({
  getWeather: async (ctx: Context) => {
    const queryString = Object.fromEntries(ctx.request.url.searchParams)
    const validated = weatherRequestSchema.parse(queryString)

    const weather = await deps.getWeather({ location: validated.location })
    logger.info('Weather data retrieved', { weather })

    ctx.response.body = weather
    ctx.response.status = Status.OK
    ctx.response.headers.set('Content-Type', 'application/json')

    // Return the response so we can test the controller
    return ctx.response
  },
})
