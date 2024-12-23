import { VueQueryPlugin } from '@tanstack/vue-query'
import { createApp, defineComponent } from 'vue'
import { createRouter, createWebHistory, RouterView } from 'vue-router'
import { GlazeGrids, LiveLogs, TimeDate } from '~/components'
import './index.css'

const App = defineComponent({
  name: 'App',
  setup () {
    return () => (
      <>
        {import.meta.env.VITE_ZEBAR ? <Zebar/> : <RouterView/>}
      </>
    )
  },
})

const Zebar = defineComponent({
  name: 'Zebar',
  setup () {
    return () => (
      <div class='flex h-screen items-center gap-4 bg-gradient-to-b from-transparent to-black/50 px-6'>
        <TimeDate/>
        {/* <WeatherLocation location='Des Moines, Iowa'/>
        <WeatherLocation
          includeTime
          label='Haywards Heath, UK'
          location='RH16'
          timezone='Europe/London'
        /> */}
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
        <Zebar/>
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
