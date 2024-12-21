import type { Context } from '@oak/oak'
import { getLogger } from '@logtape/logtape'
import { z } from 'zod'

const logger = getLogger(['app'])

interface Emoji {
  character: string
  cldrName: string
  codePoints: string
}

interface EmojiDeps {
  getWeatherEmoji: (weatherCondition: string) => Promise<Emoji>
}

const emojiRequestSchema = z.object({
  weatherCondition: z.string({
    required_error: 'Weather condition is required',
    invalid_type_error: 'Weather condition must be a string',
  }),
})

export const createEmojiController = (deps: EmojiDeps) => ({
  getWeatherEmoji: async ({ response: res, request: req }: Context) => {
    const queryString = Object.fromEntries(req.url.searchParams)
    const validated = emojiRequestSchema.parse(queryString)

    const result = await deps.getWeatherEmoji(validated.weatherCondition)
    logger.info('Emoji data retrieved', { result })

    res.status = 200
    res.headers.set('Content-Type', 'application/json')
    res.body = result
  },
})
