import OpenAI from 'openai'
import type { ChatCompletion } from 'openai/resources/chat/completions'
import { z } from 'zod'

const openai = new OpenAI({
  apiKey: Deno.env.get('OPENAI_API_KEY'),
})

// Create Zod schema from OpenAI's type
const OpenAIResponse = z.custom<ChatCompletion>()

// Define the Zod schema for the response
const WeatherEmojiRes = z.object({
  character: z.string(),
  cldrName: z.string(),
  codePoints: z.string(),
})

// Infer the response type from the Zod schema
type WeatherEmojiRes = z.infer<typeof WeatherEmojiRes>

const getWeatherEmoji = async (weatherCondition: string): Promise<WeatherEmojiRes> => {
  const res = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{
      role: 'user',
      content: weatherCondition,
    }],
    temperature: 0,
    max_tokens: 64,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'weather_emoji',
        strict: true,
        schema: {
          type: 'object',
          properties: {
            character: {
              type: 'string',
              description: 'Emoji representing the weather (e.g., "🌧️", "☀️", "🌩️")',
            },
            cldrName: {
              type: 'string',
              description: 'CLDR name with hyphens instead of spaces (e.g., "cloud-with-rain", "sun", "thunder-cloud-and-rain")',
            },
            codePoints: {
              type: 'string',
              description: 'Hexadecimal Unicode code points with hyphens (e.g., "1f327-fe0f", "2600-fe0f", "26c8-fe0f")',
            },
          },
          required: ['character', 'cldrName', 'codePoints'],
          additionalProperties: false,
        },
      },
    },
  })

  const validRes = OpenAIResponse.parse(res)
  const content = JSON.parse(validRes.choices[0].message.content ?? '{}')

  return WeatherEmojiRes.parse(content)
}

export default {
  getWeatherEmoji,
}
