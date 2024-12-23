import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { useNow } from '@vueuse/core'
import { computed, defineComponent, onMounted } from 'vue'
import { useEmoji } from '~/hooks/useEmoji'
import { weatherQueries } from '~/io/queries/weather.queries'
import { getWeatherEmoji } from '~/utils/emoji.util'

export default defineComponent({
  name: 'WeatherLocation',
  props: {
    includeTime: {
      type: Boolean,
      default: false,
    },
    location: {
      type: String,
      default: 'Des Moines, Iowa',
    },
    label: {
      type: [String, null],
      default: null,
    },
    timezone: {
      type: String,
      default: 'America/Chicago',
    },
  },
  setup (props) {
    const { getEmoji } = useEmoji()
    const queryClient = useQueryClient()

    const now = useNow({ interval: 1000 })

    const timezoneNow = computed(() => {
      const date = now.value

      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        timeZone: props.timezone,
      })
    })

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
    const labelValue = computed(() => isLoading.value ? '' : (props.label ?? props.location))

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

      // 3600000 ms = 1 hour
      setInterval(async () => {
        queryClient.resetQueries({ queryKey: [props.location] })
        await refetchWeather()
      }, 3600000)
    })

    return () => (
      <div class='flex h-12 items-center gap-2 font-segoe text-white'>
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
            <div>
              <span>{weather.value.temp}°F {weather.value.condition}</span>
              {props.includeTime && (
                // <span> ({timezoneNow.value})</span>
                <span> / {timezoneNow.value}</span>
              )}
            </div>
          )}
          {weatherError.value && (
            <div>{weatherError.value.message}</div>
          )}
          <div>{labelValue.value}</div>
        </div>
      </div>
    )
  },
})
