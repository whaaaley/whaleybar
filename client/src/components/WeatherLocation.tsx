import { useQuery } from '@tanstack/vue-query'
import { emojiQueries } from '~/queries/emojiQueries'
import { weatherQueries } from '~/queries/weatherQueries'

export default defineComponent({
  name: 'WeatherLocation',
  props: {
    location: {
      type: String,
      default: 'Des Moines, Iowa',
    },
  },
  setup (props) {
    const { getEmoji } = useEmoji()

    const { data: weather, error: weatherError, refetch: refetchWeather } = useQuery({
      enabled: false,
      queryKey: [props.location],
      queryFn: () => (
        weatherQueries.getWeather({ location: props.location })
      ),
    })

    const { data: weatherEmoji, error: weatherEmojiError, refetch: refetchWeatherEmoji } = useQuery({
      enabled: false,
      queryKey: [props.location, weather.value],
      queryFn: () => (
        emojiQueries.getWeatherEmoji({ weatherCondition: weather.value.condition })
      ),
    })

    const emojiUrl = computed(() => (
      getEmoji({
        name: weatherEmoji.value?.cldrName,
        unicode: weatherEmoji.value?.codePoints,
      })
    ))

    onMounted(async () => {
      await refetchWeather()
      await refetchWeatherEmoji()
    })

    watch(weather, () => {
      console.log('weather', weather.value)
    })

    watch(weatherEmoji, () => {
      console.log('weatherEmoji', weatherEmoji.value)
    })

    return () => {
      console.log(weather.value, weatherEmoji.value)
      if (!weather.value || !weatherEmoji.value) {
        return <div>Loading...</div>
      }

      return (
        <>
          <div class=' flex h-12 items-center gap-2 font-segoe text-white'>
            <img class='size-8' src={emojiUrl.value}/>
            <div class='grid text-xs'>
              <div>{weather.value.temp}°F {weather.value.condition}</div>
              <div>{props.location}</div>
            </div>
          </div>
        </>
      )
    }
  },
})
