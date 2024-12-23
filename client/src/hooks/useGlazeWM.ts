import { filter, map, Subject } from 'rxjs'
import { computed, ref } from 'vue'
import { createProviderGroup, type GlazeWmOutput } from 'zebar'

type WMPayload = GlazeWmOutput | null

type WMEvent = {
  type: string
  payload: WMPayload
}

const wm = ref<WMPayload>(null)
export const wmEventBus = new Subject<WMEvent>()

wmEventBus.pipe(
  filter(event => event.type === 'wm-update'),
  map(event => event.payload),
).subscribe((payload) => {
  wm.value = payload
})

type UseGlazeWMOptions = {
  initConfig: () => void
}

export const useGlazeWM = (options?: UseGlazeWMOptions) => {
  const allMonitors = computed(() => wm.value?.allMonitors ?? [])
  const currentMonitor = computed(() => wm.value?.currentMonitor ?? null)
  const monitorWorkspaces = computed(() => currentMonitor.value?.children ?? [])

  const currentMonitorIndex = computed(() => {
    return allMonitors.value.findIndex(monitor => monitor.id === currentMonitor.value?.id)
  })

  const initialize = () => {
    if (window.__TAURI_INTERNALS__) {
      const providers = createProviderGroup({
        glazewm: { type: 'glazewm' },
      })

      const glazeNext = () => {
        console.log('glaze next should fire when changing monitors')
        wmEventBus.next({
          type: 'wm-update',
          payload: providers.outputMap.glazewm,
        })
        // options?.initConfig()

        console.log(currentMonitor.value, currentMonitorIndex.value)
      }

      // When requested, tell the server the current monitor configuration
      wmEventBus.subscribe((event) => {
      // Todo: Rename to wm-request-init
      // Only send events from Zebar on the second monitor (I usually have my
      // Zebar dev tools here)
      // if (event.type === 'wm-init' && currentMonitorIndex.value === 2) {
        if (event.type === 'wm-init' && currentMonitorIndex.value === 2) {
          options?.initConfig()
        }
      // if (event.type === 'wm-update') { // Todo: Rename to wm-request-init
      // options?.initConfig()
      // }
      })

      // Initialize the wm ref
      glazeNext()

      // Update the wm ref on output changes
      providers.onOutput(glazeNext)
    }
  }

  return {
    allMonitors,
    currentMonitor,
    monitorWorkspaces,
    initialize,
  }
}

declare global {
  interface Window {
    __TAURI_INTERNALS__?: unknown
  }
}
