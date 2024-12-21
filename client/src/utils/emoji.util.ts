import { matchSorter } from 'match-sorter'

type WeatherEmoji = {
  character: string
  cldrName: string
  codePoints: string
}

const weatherEmojis = {
  clear: {
    character: '☀️',
    cldrName: 'sun',
    codePoints: '2600-fe0f',
  },
  sunny: {
    character: '☀️',
    cldrName: 'sun',
    codePoints: '2600-fe0f',
  },
  'mostly-sunny': {
    character: '🌤️',
    cldrName: 'sun-behind-small-cloud',
    codePoints: '1f324-fe0f',
  },
  'partly-cloudy': {
    character: '⛅',
    cldrName: 'sun-behind-cloud',
    codePoints: '26c5',
  },
  'mostly-cloudy': {
    character: '🌥️',
    cldrName: 'sun-behind-large-cloud',
    codePoints: '1f325-fe0f',
  },
  cloudy: {
    character: '☁️',
    cldrName: 'cloud',
    codePoints: '2601-fe0f',
  },
  'sun-showers': {
    character: '🌦️',
    cldrName: 'sun-behind-rain-cloud',
    codePoints: '1f326-fe0f',
  },
  rain: {
    character: '🌧️',
    cldrName: 'cloud-with-rain',
    codePoints: '1f327-fe0f',
  },
  drizzle: {
    character: '🌧️',
    cldrName: 'cloud-with-rain',
    codePoints: '1f327-fe0f',
  },
  storm: {
    character: '⛈️',
    cldrName: 'cloud-with-lightning-and-rain',
    codePoints: '26c8-fe0f',
  },
  thunder: {
    character: '🌩️',
    cldrName: 'cloud-with-lightning',
    codePoints: '1f329-fe0f',
  },
  snow: {
    character: '🌨️',
    cldrName: 'cloud-with-snow',
    codePoints: '1f328-fe0f',
  },
  'light-snow': {
    character: '❄️',
    cldrName: 'snowflake',
    codePoints: '2744-fe0f',
  },
  blizzard: {
    character: '🌨️',
    cldrName: 'cloud-with-snow',
    codePoints: '1f328-fe0f',
  },
  sleet: {
    character: '🌨️',
    cldrName: 'cloud-with-snow',
    codePoints: '1f328-fe0f',
  },
  'snow-showers': {
    character: '🌨️',
    cldrName: 'cloud-with-snow',
    codePoints: '1f328-fe0f',
  },
  frost: {
    character: '❄️',
    cldrName: 'snowflake',
    codePoints: '2744-fe0f',
  },
  fog: {
    character: '🌫️',
    cldrName: 'fog',
    codePoints: '1f32b-fe0f',
  },
  mist: {
    character: '🌫️',
    cldrName: 'fog',
    codePoints: '1f32b-fe0f',
  },
  haze: {
    character: '🌫️',
    cldrName: 'fog',
    codePoints: '1f32b-fe0f',
  },
  windy: {
    character: '💨',
    cldrName: 'dashing-away',
    codePoints: '1f4a8',
  },
  tornado: {
    character: '🌪️',
    cldrName: 'tornado',
    codePoints: '1f32a-fe0f',
  },
} as const

type WeatherType = keyof typeof weatherEmojis

const weatherAliases: Record<WeatherType, string[]> = {
  clear: ['clear', 'fair', 'fine', 'bright'],
  sunny: ['sunny', 'sunshine', 'sun'],
  'mostly-sunny': ['mostly sunny', 'mainly sunny', 'predominantly sunny'],
  cloudy: ['cloudy', 'clouds', 'overcast', 'grey', 'gray'],
  'mostly-cloudy': ['mostly cloudy', 'mainly cloudy', 'predominantly cloudy'],
  'partly-cloudy': ['partly cloudy', 'partially cloudy', 'scattered clouds', 'broken clouds'],
  'sun-showers': ['sun shower', 'sunshower', 'rain with sun', 'scattered showers'],
  rain: ['rain', 'rainfall', 'raining', 'wet', 'precipitation', 'showers', 'heavy rain'],
  drizzle: ['drizzle', 'light rain', 'sprinkle', 'spitting', 'light drizzle'],
  storm: ['storm', 'thunderstorm', 'lightning and rain', 'electrical storm'],
  thunder: ['thunder', 'lightning', 'thundery'],
  snow: ['snow', 'snowing', 'snowfall', 'wintry'],
  'light-snow': ['light snow', 'snow flurries', 'few snowflakes'],
  blizzard: ['blizzard', 'heavy snow', 'snow storm', 'whiteout'],
  sleet: ['sleet', 'rain and snow', 'wintry mix', 'ice pellets', 'freezing rain'],
  'snow-showers': ['snow showers', 'intermittent snow', 'scattered snow'],
  frost: ['frost', 'freezing', 'ice crystals', 'rime', 'ice'],
  fog: ['fog', 'foggy'],
  mist: ['mist', 'misty'],
  haze: ['haze', 'hazy'],
  windy: ['wind', 'windy', 'breezy', 'gusts', 'blustery'],
  tornado: ['tornado', 'cyclone', 'twister'],
} as const

const getWeatherEmoji = (condition: string): WeatherEmoji => {
  const [mainCondition] = condition.split(',')
  const normalizedCondition = mainCondition?.toLowerCase().trim() ?? ''

  for (const [type, aliases] of Object.entries(weatherAliases)) {
    if (aliases.some(alias => normalizedCondition.includes(alias))) {
      return weatherEmojis[type as WeatherType]
    }
  }

  const weatherMatches = Object.entries(weatherAliases)
    .map(([type, aliases]) => ({
      type: type as WeatherType,
      aliases,
    }))

  const matches = matchSorter(weatherMatches, normalizedCondition, {
    keys: ['type', 'aliases'],
    threshold: matchSorter.rankings.CONTAINS,
  })

  return weatherEmojis[matches[0]?.type ?? 'partly-cloudy']
}

export { getWeatherEmoji, type WeatherEmoji }
