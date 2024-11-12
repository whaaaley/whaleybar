import './index.css'
import { VueQueryPlugin } from '@tanstack/vue-query'
import { createApp, defineComponent } from 'vue'
import { LiveLogs, TimeDate, WeatherLocation } from '~/components'

const App = defineComponent({
  name: 'App',
  setup () {
    return () => (
      <div>
        <div class='flex gap-4 px-14'>
          <TimeDate/>
          <WeatherLocation location='Des Moines, Iowa'/>
          {/* <WeatherLocation location='Haywards Heath, West Sussex'/> */}
        </div>
        <LiveLogs/>
      </div>
    )
  },
})

const app = createApp(App)

app.use(VueQueryPlugin)
app.mount('#app')
