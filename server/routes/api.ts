import { Router } from '@oak/oak'
import * as controllers from '../modules/controllers.ts'
import * as models from '../modules/models.ts'

const router = new Router()

// const eventStreamController = controllers.createEventStreamController({
//   eventEmitter: models.eventModel.eventEmitter,
// })
//
// router.get('/stream/events', eventStreamController.manageConnection)

const logStreamController = controllers.createLogStreamController()

router.post('/api/log', logStreamController.emit)
router.get('/stream/logs', logStreamController.connect)

// const emojiController = controllers.createEmojiController({
//   getWeatherEmoji: models.emojiModel.getWeatherEmoji,
// })
//
// router.get('/api/weather-emoji', emojiController.getWeatherEmoji)

const weatherController = controllers.createWeatherController({
  getWeather: models.weatherModel.getWeather,
})

router.get('/api/weather', weatherController.getWeather)

export default router
