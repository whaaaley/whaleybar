import type { Context } from '@oak/oak'

interface Emoji {
  character: string
  cldrName: string
  codePoints: string
}

interface EmojiDeps {
  getWeatherEmoji: (weatherCondition: string) => Promise<Emoji>
}

export const createEmojiController = (deps: EmojiDeps) => ({
  getWeatherEmoji: async ({ response: res, request: req }: Context) => {
    try {
      const body = await req.body.json()
      const result = await deps.getWeatherEmoji(body.weatherCondition)

      console.log('emoji', result)

      res.status = 200
      res.headers.set('Content-Type', 'application/json')
      res.body = result
    } catch (error) {
      console.error(error)

      res.status = 500
      res.headers.set('Content-Type', 'application/json')
      res.body = { error }
    }
  },
})
