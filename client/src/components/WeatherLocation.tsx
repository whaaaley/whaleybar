import { useQuery } from '@tanstack/vue-query'
import { computed, defineComponent, onMounted } from 'vue'
import { useEmoji } from '~/hooks/useEmoji'
import { weatherQueries } from '~/io/queries/index'
import { getWeatherEmoji } from '~/utils/getWeatherEmoji'

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

    const isLoading = computed(() => isLoadingWeather.value)

    const emojiUrl = computed(() => {
      if (!weather.value) return

      const weatherEmoji = getWeatherEmoji(weather.value.condition)

      return getEmoji({
        name: weatherEmoji.cldrName,
        unicode: weatherEmoji.codePoints,
      })
    })

    const errorEmojiUrl = getEmoji({ name: 'question-mark', unicode: '2753' })
    const loadingEmojiUrl = getEmoji({ name: 'hourglass-not-done', unicode: '23f3' })

    onMounted(async () => {
      await refetchWeather()
    })

    return () => (
      <div class=' flex h-12 items-center gap-2 font-segoe text-white'>
        {weather.value && (
          <img class='size-8' src={emojiUrl.value}/>
        )}
        {!isLoading.value && weatherError.value && (
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
