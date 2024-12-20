import { VueQueryPlugin } from '@tanstack/vue-query'
import { computed, createApp, defineComponent, onMounted, ref } from 'vue'
import { createRouter, createWebHistory, RouterView } from 'vue-router'
import { createProviderGroup, type GlazeWmOutput } from 'zebar'
import { LiveLogs, MonitorGrid, TimeDate, WeatherLocation, WorkspaceGrid } from '~/components'
import './index.css'

declare global {
  interface Window {
    __TAURI_INTERNALS__?: unknown
  }
}

const App = defineComponent({
  name: 'App',
  setup () {
    return () => (
      <>
        {import.meta.env.DEV ? <RouterView/> : <Zebar/>}
      </>
    )
  },
})

const Zebar = defineComponent({
  name: 'Zebar',
  setup () {
    const glazewm = ref<GlazeWmOutput | null>(null)

    const allMonitors = computed(() => glazewm.value?.allMonitors ?? [])

    const currentMonitor = computed(() => glazewm.value?.currentMonitor ?? null)
    const monitorWorkspaces = computed(() => currentMonitor.value?.children ?? [])

    onMounted(() => {
      if (window.__TAURI_INTERNALS__) {
        const providers = createProviderGroup({
          glazewm: { type: 'glazewm' },
        })

        glazewm.value = providers.outputMap.glazewm

        providers.onOutput(() => {
          glazewm.value = providers.outputMap.glazewm
          console.log('glazewm', glazewm.value)
        })
      }
    })

    return () => (
      <div class='flex h-screen items-center gap-4 bg-gradient-to-b from-transparent to-black/50 px-6'>
        <TimeDate/>
        <WeatherLocation location='Des Moines, Iowa'/>
        <WeatherLocation
          includeTime
          label='Haywards Heath, UK'
          location='RH16'
          timezone='Europe/London'
        />
        <MonitorGrid monitors={allMonitors.value}/>
        <WorkspaceGrid workspaces={monitorWorkspaces.value}/>
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

if (import.meta.env.DEV) {
  const router = createRouter({
    history: createWebHistory(),
    routes,
  })

  app.use(router)
}

app.use(VueQueryPlugin)

app.mount('#app')
