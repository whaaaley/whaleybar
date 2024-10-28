import { withPost } from '~/promisePipelines/fetchPipeline.ts'

interface GetWeatherParams {
  location: string
}

// Todo: add a dev middleware to swap out the URL based on the environment
export const weatherQueries = {
  getWeather: (params: GetWeatherParams) => (
    withPost.execute({
      url: 'http://localhost:4202/api/get-weather',
      body: JSON.stringify(params),
      // todo: add zod schema for zod validation
    })
  ),
}
