import './index.css'
import { VueQueryPlugin } from '@tanstack/vue-query'
import { useDateFormat, useNow } from '@vueuse/core'

const Time = defineComponent({
  name: 'Time',
  setup () {
    const { monthlyAppleEmojiUrl } = useEmoji()
    const now = useNow()

    const timeFormat = useDateFormat(now, 'h:mm')
    const dateFormat = useDateFormat(now, 'MM/DD/YYYY')
    const meridiem = useDateFormat(now, 'A')

    return () => (
      <div class='flex h-12 items-center gap-2 font-segoe text-white'>
        <img
          class='flex size-8'
          src={monthlyAppleEmojiUrl.value}
        />
        <div class='grid text-xs'>
          <div>{timeFormat.value} {meridiem.value}</div>
          <div>{dateFormat.value}</div>
        </div>
      </div>
    )

    // return () => (
    //   <div style='display:flex;gap:8px;color:white;font-family:sans-serif;align-items:center;height:48px;padding:0 12px;'>
    //     <img
    //       src={monthlyAppleEmojiUrl.value}
    //       style="width:36px;height:36px;"
    //     />
    //     <div style='display:grid;gap:4px;font-size:12px;'>
    //       <div style="">{timeFormat.value} {meridiem.value}</div>
    //       <div style="">{dateFormat.value}</div>
    //     </div>
    //   </div>
    // )
  },
})

const App = defineComponent({
  name: 'App',
  setup () {
    return () => (
      <div class='flex gap-4 px-14'>
        <Time/>
        <WeatherLocation location='Des Moines, Iowa'/>
        {/* <WeatherLocation location='Haywards Heath, West Sussex'/> */}
      </div>
    )
  },
})

const app = createApp(App)

app.use(VueQueryPlugin)
app.mount('#app')
