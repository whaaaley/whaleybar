import { useQuery } from '@tanstack/vue-query'
import { computed, defineComponent, onMounted, watch } from 'vue'
import { useEmoji } from '~/composables/useEmoji'
import { emojiQueries, weatherQueries } from '~/queries/index'

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

    const {
      data: weather,
      error: weatherError,
      refetch: refetchWeather,
      isLoading: isLoadingWeather,
    } = useQuery({
      enabled: false,
      queryKey: [props.location],
      queryFn: () => (
        weatherQueries.getWeather({
          location: props.location,
        })
      ),
    })

    const {
      data: weatherEmoji,
      error: weatherEmojiError,
      refetch: refetchWeatherEmoji,
      isLoading: isLoadingWeatherEmoji,
    } = useQuery({
      enabled: false,
      queryKey: [props.location, weather.value],
      queryFn: () => {
        if (!weather.value) return

        return emojiQueries.getWeatherEmoji({
          weatherCondition: weather.value.condition,
        })
      },
    })

    const isLoading = computed(() => (
      isLoadingWeather.value || isLoadingWeatherEmoji.value
    ))

    const emojiUrl = computed(() => {
      if (!weatherEmoji.value) return

      return getEmoji({
        name: weatherEmoji.value.cldrName,
        unicode: weatherEmoji.value.codePoints,
      })
    })

    const errorEmojiUrl = getEmoji({ name: 'question-mark', unicode: '2753' })
    const loadingEmojiUrl = getEmoji({ name: 'hourglass-not-done', unicode: '23f3' })

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

    return () => (
      <div class=' flex h-12 items-center gap-2 font-segoe text-white'>
        {weatherEmoji.value && (
          <img class='size-8' src={emojiUrl.value}/>
        )}
        {!isLoading.value && weatherEmojiError.value && (
          <img class='size-8' src={errorEmojiUrl}/>
        )}
        {isLoading.value && (
          <img class='size-8' src={loadingEmojiUrl}/>
        )}
        <div class='grid text-xs'>
          {weather.value && (
            <div>{weather.value.temp}°F {weather.value.condition}</div>
          )}
          {weatherError.value && (
            <div>{weatherError.value.message}</div>
          )}
          <div>{props.location}</div>
        </div>
      </div>
    )
  },
})
