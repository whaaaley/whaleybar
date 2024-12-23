import { filter, map, Subject } from 'rxjs'
import { computed, ref } from 'vue'
import { createProviderGroup, type GlazeWmOutput } from 'zebar'

type GlazeConfig = GlazeWmOutput | null

type Event = {
  type: string
  payload: GlazeConfig
}

const glazeConfig = ref<GlazeConfig>(null)
export const glazeConfigEventBus = new Subject<Event>()

type UseGlazeOptions = {
  saveConfigToServer: () => Promise<unknown>
}

export const useGlaze = (options: UseGlazeOptions) => {
  const allMonitors = computed(() => glazeConfig.value?.allMonitors ?? [])
  const currentMonitor = computed(() => glazeConfig.value?.currentMonitor ?? null)
  const monitorWorkspaces = computed(() => currentMonitor.value?.children ?? [])

  glazeConfigEventBus.pipe(
    filter(event => event.type === 'glaze-config-update'),
    map(event => event.payload),
  ).subscribe((payload) => {
    glazeConfig.value = payload // Saves the current monitor configuration to a ref
  })

  const initialize = () => {
    if (window.__TAURI_INTERNALS__) {
      const providers = createProviderGroup({
        glazewm: { type: 'glazewm' },
      })

      const glazeNext = () => {
        glazeConfigEventBus.next({
          type: 'glaze-config-update',
          payload: providers.outputMap.glazewm,
        })
      }

      // When requested, tell the server the current monitor configuration
      glazeConfigEventBus.subscribe((event) => {
        if (event.type === 'glaze-config-update' && currentMonitor.value?.hasFocus) {
          options.saveConfigToServer()
        }
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
