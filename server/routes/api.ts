import { Router } from '@oak/oak'
import * as controllers from '../controllers/index.ts'
import models from '../models/index.ts'

const router = new Router()

// const emojiController = controllers.createEmojiController({
//   getWeatherEmoji: models.emojiModel.getWeatherEmoji,
// })

const weatherController = controllers.createWeatherController({
  getWeather: models.weatherModel.getWeather,
})

// const eventStreamController = controllers.createEventStreamController({
//   eventEmitter: models.eventModel.eventEmitter,
// })

const logStreamController = controllers.createLogStreamController()

// router.get('/api/weather-emoji', emojiController.getWeatherEmoji)
router.get('/api/weather', weatherController.getWeather)

router.post('/api/log', logStreamController.log)
// router.get('/stream/events', eventStreamController.manageConnection)
router.get('/stream/logs', logStreamController.connect)

export default router
