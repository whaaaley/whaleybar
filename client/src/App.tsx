import './index.css'
import { VueQueryPlugin } from '@tanstack/vue-query'
import { createApp, defineComponent, onMounted } from 'vue'
import { createRouter, createWebHistory, RouterView } from 'vue-router'
import * as zebar from 'zebar'
import { LiveLogs, TimeDate, WeatherLocation } from '~/components'

const App = defineComponent({
  name: 'App',
  setup () {
    return () => (
      <RouterView/>
    )
  },
})

const Zebar = defineComponent({
  name: 'Zebar',
  setup () {
    onMounted(() => {
      const providers = zebar.createProviderGroup({
        glazewm: { type: 'glazewm' },
        weather: { type: 'weather' },
      })

      console.log(providers)
    })

    return () => (
      <div class='flex gap-4 px-14'>
        <TimeDate/>
        <WeatherLocation location='Des Moines, Iowa'/>
        {/* <WeatherLocation location='Haywards Heath, UK'/> */}
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
          <Zebar/>
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
