import { withPost } from '~/promisePipelines/fetchPipeline.ts'

interface GetWeatherEmojiParams {
  weatherCondition: string
}

// Todo: add a dev middleware to swap out the URL based on the environment
export const emojiQueries = {
  getWeatherEmoji: (params: GetWeatherEmojiParams) => (
    withPost.execute({
      url: 'http://localhost:4202/api/get-weather-emoji',
      body: JSON.stringify(params),
    })
  ),
}
