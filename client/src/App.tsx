import { VueQueryPlugin } from '@tanstack/vue-query'
import { computed, createApp, defineComponent } from 'vue'
import { createRouter, createWebHistory, RouterView } from 'vue-router'
import { useGlaze } from './hooks/useGlaze'
import { GlazeGrids, LiveLogs, TimeDate, WeatherLocation } from '~/components'
import './index.css'

const App = defineComponent({
  name: 'App',
  setup () {
    return () => (
      <>
        {import.meta.env.VITE_ENV === 'zebar' ? <Zebar/> : <RouterView/>}
      </>
    )
  },
})

const Zebar = defineComponent({
  name: 'Zebar',
  setup () {
    const { monitorDimensions } = useGlaze()

    const showWeather = computed(() => {
      return monitorDimensions.value?.height > 1200 || import.meta.env.VITE_ENV !== 'zebar'
    })

    return () => (
      <div class='flex h-screen items-center justify-between bg-gradient-to-b from-transparent to-black/25 pl-4 pr-3'>
        <div class='flex items-center gap-4'>
          <TimeDate/>
          {showWeather.value && (
            <>
              <WeatherLocation location='Des Moines, Iowa'/>
              <WeatherLocation
                includeTime
                label='Haywards Heath, UK'
                location='RH16'
                timezone='Europe/London'
              />
            </>
          )}
        </div>
        <GlazeGrids/>
      </div>
    )
  },
})

const routes = [{
  name: 'home',
  path: '/',
  component: defineComponent({
    name: 'Home',
    setup () {
      return () => (
        <div class='h-screen overflow-auto bg-black text-white'>
          <Zebar/>
        </div>
      )
    },
  }),
}, {
  name: 'logs',
  path: '/logs',
  component: defineComponent({
    name: 'Logs',
    setup () {
      return () => (
        <div class='h-screen overflow-auto bg-black text-white'>
          <GlazeGrids/>
          <LiveLogs/>
        </div>
      )
    },
  }),
}]

const app = createApp(App)

const router = createRouter({
  history: createWebHistory(),
  routes,
})

app.use(router)
app.use(VueQueryPlugin)

app.mount('#app')
