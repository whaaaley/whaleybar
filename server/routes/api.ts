import { Router } from '@oak/oak'
import * as controllers from '../controllers/index.ts'
import models from '../models/index.ts'

const router = new Router()

const emojiController = controllers.createEmojiController({
  getWeatherEmoji: models.emojiModel.getWeatherEmoji,
})

router.get('/api/weather-emoji', emojiController.getWeatherEmoji)

const weatherController = controllers.createWeatherController({
  getWeather: models.weatherModel.getWeather,
})

router.get('/api/weather', weatherController.getWeather)

export default router
