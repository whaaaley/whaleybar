import { assertEquals, assertStrictEquals, assertThrows } from '@std/assert'
import { afterEach, beforeEach, describe, it } from '@std/testing/bdd'
import { createWeatherController } from './weatherController.ts'

// TODO: Write tests for the WeatherController

describe('WeatherController', () => {
  it('should return weather data', () => {
    const weatherController = createWeatherController({
      getWeather: async () => ({
        condition: 'sunny',
        temp: '75',
      }),
    })
  })
})
