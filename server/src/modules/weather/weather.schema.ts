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
