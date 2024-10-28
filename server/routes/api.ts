import { Router } from '@oak/oak'
import controllers from '../controllers/index.ts'
import models from '../models/index.ts'

const router = new Router()

const emojiController = controllers.createEmojiController({
  getWeatherEmoji: models.emojiModel.getWeatherEmoji,
})

router.post('/api/get-weather-emoji', emojiController.getWeatherEmoji)

const weatherController = controllers.createWeatherController({
  getWeather: models.weatherModel.getWeather,
})

router.post('/api/get-weather', weatherController.getWeather)

export default router
