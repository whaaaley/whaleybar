import { filter, map, Subject } from 'rxjs'
import { computed, ref } from 'vue'
import { createProviderGroup } from 'zebar'

export type GlazeConfig = {
  allMonitors: {
    id: string
    hasFocus: boolean
  }[]
  monitorWorkspaces: {
    id: string
    displayName: string
    hasFocus: boolean
  }[]
}

type Event = {
  type: string
  config: GlazeConfig
}

const glazeConfig = ref<GlazeConfig | null>(null)
const lastMonitorId = ref<string | null>(null)

export const glazeConfigEventBus = new Subject<Event>()

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
  const initialize = () => {
    if (window.__TAURI_INTERNALS__) {
      const providers = createProviderGroup({
        glazewm: { type: 'glazewm' },
      })

      const glazeNext = () => {
        const { allMonitors, currentMonitor } = providers.outputMap.glazewm ?? {}

        const allMonitorIds = allMonitors?.map((m) => {
          return {
            id: m.id,
            hasFocus: m.hasFocus,
          }
        }) ?? []

        const workspaceIds = currentMonitor?.children?.map((w) => {
          return {
            id: w.id,
            displayName: w.displayName,
            hasFocus: w.hasFocus,
          }
        }) ?? []

        glazeConfigEventBus.next({
          type: 'glaze-config-update',
          config: {
            allMonitors: allMonitorIds,
            monitorWorkspaces: workspaceIds,
          },
        })
      }

      // Save the config to the server when the current monitor has focus
      glazeConfigEventBus.subscribe(() => {
        const { currentMonitor } = providers.outputMap.glazewm ?? {}

        if (currentMonitor?.hasFocus) {
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
    allMonitors: computed(() => glazeConfig.value?.allMonitors ?? []),
    monitorWorkspaces: computed(() => glazeConfig.value?.monitorWorkspaces ?? []),
    initialize,
  }
}

declare global {
  interface Window {
    __TAURI_INTERNALS__?: unknown
  }
}
