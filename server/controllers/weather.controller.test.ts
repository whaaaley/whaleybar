import { assertEquals } from '@std/assert'
import { testing } from '@oak/oak'
import { describe, it } from '@std/testing/bdd'
import { createWeatherController } from './weather.controller.ts'

describe('WeatherController', () => {
  const mockDeps = {
    getWeather: async () => ({ condition: 'sunny', temp: '75' }),
  }

  it('should return weather data', async () => {
    const weatherController = createWeatherController(mockDeps)

    const response = await weatherController.getWeather(
      testing.createMockContext({
        method: 'GET',
        path: '/api/weather?location=London',
        headers: [['Content-Type', 'application/json']],
      }),
    )

    assertEquals(response.status, 200)
    assertEquals(response.headers.get('Content-Type'), 'application/json')
    assertEquals(response.body, { condition: 'sunny', temp: '75' })
  })
})
