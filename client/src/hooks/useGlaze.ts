import { useObservable, useSubscription } from '@vueuse/rxjs'
import { filter, map, Subject } from 'rxjs'
import { computed, ref } from 'vue'
import { createProviderGroup } from 'zebar'

declare global {
  interface Window {
    __TAURI_INTERNALS__?: unknown
  }
}

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
  monitorDimensions: {
    width: number
    height: number
  }
}

type Event = {
  type: string
  config: GlazeConfig
}

export const configSubject = new Subject<Event>()
export const glazeConfig$ = configSubject.asObservable().pipe(
  filter(event => event.type === 'glaze-config-update'),
  map(event => event.config),
)

type UseGlazeOptions = {
  saveConfigToServer: () => Promise<unknown>
}

export const useGlaze = (options?: UseGlazeOptions) => {
  const initialize = () => {
    if (window.__TAURI_INTERNALS__) {
      const providers = createProviderGroup({
        glazewm: { type: 'glazewm' },
      })

      const glazeNext = () => {
        const { glazewm } = providers.outputMap
        const { allMonitors, currentMonitor } = glazewm ?? {}

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

        const monitorDimensions = {
          width: currentMonitor?.width ?? 0,
          height: currentMonitor?.height ?? 0,
        }

        configSubject.next({
          type: 'glaze-config-update',
          config: {
            allMonitors: allMonitorIds,
            monitorWorkspaces: workspaceIds,
            monitorDimensions,
          },
        })
      }

      // Subscribe to config updates and save when current monitor has focus
      useSubscription(
        glazeConfig$.subscribe(() => {
          const { glazewm } = providers.outputMap
          const { currentMonitor } = glazewm ?? {}

          if (currentMonitor?.hasFocus) {
            options?.saveConfigToServer()
          }
        }),
      )

      // Initialize the glaze config
      glazeNext()

      const lastMonitorId = ref<string | null>(null)

      // Update the glaze config when the monitor changes
      providers.onOutput(() => {
        const { glazewm } = providers.outputMap
        const activeMonitor = glazewm?.allMonitors.find(m => m.hasFocus)
        const activeMonitorId = activeMonitor?.id ?? null

        if (lastMonitorId.value !== activeMonitorId) {
          glazeNext()
          lastMonitorId.value = activeMonitorId
        }
      })
    }
  }

  // Use observable for reactive config values
  const config = useObservable(glazeConfig$)

  // Computed values
  const allMonitors = computed(() => config.value?.allMonitors ?? [])
  const monitorWorkspaces = computed(() => config.value?.monitorWorkspaces ?? [])
  const monitorDimensions = computed(() => config.value?.monitorDimensions ?? { width: 0, height: 0 })

  return {
    allMonitors,
    monitorWorkspaces,
    monitorDimensions,
    initialize,
  }
}
