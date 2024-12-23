import { filter, map, Subject } from 'rxjs'
import { computed, ref } from 'vue'
import { createProviderGroup, type GlazeWmOutput } from 'zebar'

type GlazeConfig = GlazeWmOutput | null

type Event = {
  type: string
  config: GlazeConfig
}

const glazeConfig = ref<GlazeConfig>(null)
export const glazeConfigEventBus = new Subject<Event>()
const lastMonitorId = ref<string | null>(null)

glazeConfigEventBus.pipe(
  filter(event => event.type === 'glaze-config-update'),
  map(event => event.config),
).subscribe((config) => {
  glazeConfig.value = config
})

type UseGlazeOptions = {
  saveConfigToServer: () => Promise<unknown>
}

export const useGlaze = (options: UseGlazeOptions) => {
  const allMonitors = computed(() => glazeConfig.value?.allMonitors ?? [])
  const currentMonitor = computed(() => glazeConfig.value?.currentMonitor ?? null)
  const monitorWorkspaces = computed(() => currentMonitor.value?.children ?? [])

  const initialize = () => {
    if (window.__TAURI_INTERNALS__) {
      const providers = createProviderGroup({
        glazewm: { type: 'glazewm' },
      })

      const glazeNext = () => {
        glazeConfigEventBus.next({
          type: 'glaze-config-update',
          config: providers.outputMap.glazewm,
        })
      }

      // Save the config to the server when the current monitor has focus
      glazeConfigEventBus.subscribe(() => {
        if (currentMonitor.value?.hasFocus) {
          options.saveConfigToServer()
        }
      })

      // Initialize the glaze config
      glazeNext()

      // Update the glaze config when the monitor changes
      providers.onOutput(() => {
        const activeMonitor = providers.outputMap.glazewm?.allMonitors.find(m => m.hasFocus)
        const activeMonitorId = activeMonitor?.id ?? null

        if (lastMonitorId.value !== activeMonitorId) {
          glazeNext()
          lastMonitorId.value = activeMonitorId
        }
      })
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
