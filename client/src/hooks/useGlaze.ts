import { useObservable, useSubscription } from '@vueuse/rxjs'
import { filter, map, Subject } from 'rxjs'
import { computed, ref } from 'vue'
import { createProviderGroup } from 'zebar'

declare global {
  interface Window {
    __TAURI_INTERNALS__?: unknown
  }
}

// Define a shared type for workspace
export type Workspace = {
  id: string
  displayName: string
  hasFocus: boolean
}

export type GlazeConfig = {
  allMonitors: {
    id: string
    hasFocus: boolean
  }[]
  monitorWorkspaces: Workspace[]
  workspacesByMonitor: Record<string, Workspace[]>
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
        const { allMonitors, currentMonitor } = glazewm ?? {
          allMonitors: [],
          currentMonitor: null,
        }

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

        // Create workspacesByMonitor map
        const workspacesByMonitor: Record<string, Workspace[]> = {}

        // Collect workspaces for all monitors
        allMonitors.forEach((monitor) => {
          const workspaces = monitor.children?.map((w) => {
            return {
              id: w.id,
              displayName: w.displayName,
              hasFocus: w.hasFocus,
            }
          }) ?? []

          workspacesByMonitor[monitor.id] = workspaces
        })

        const monitorDimensions = {
          width: currentMonitor?.width ?? 0,
          height: currentMonitor?.height ?? 0,
        }

        configSubject.next({
          type: 'glaze-config-update',
          config: {
            allMonitors: allMonitorIds,
            monitorWorkspaces: workspaceIds,
            workspacesByMonitor,
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
      const lastActiveWorkspaceId = ref<string | null>(null)

      // Update the glaze config when the monitor or workspace changes
      providers.onOutput(() => {
        const { glazewm } = providers.outputMap
        const { allMonitors, currentMonitor } = glazewm ?? {
          allMonitors: [],
          currentMonitor: null,
        }

        const activeMonitor = allMonitors.find(m => m.hasFocus)
        const activeMonitorId = activeMonitor?.id ?? null

        // Find the active workspace ID across all monitors
        let activeWorkspaceId: string | null = null

        allMonitors.forEach((monitor) => {
          const activeWorkspace = monitor.children?.find(w => w.hasFocus)
          if (activeWorkspace) {
            activeWorkspaceId = activeWorkspace.id
          }
        })

        // Update if either monitor or active workspace changes
        if (lastMonitorId.value !== activeMonitorId || lastActiveWorkspaceId.value !== activeWorkspaceId) {
          glazeNext()
          lastMonitorId.value = activeMonitorId
          lastActiveWorkspaceId.value = activeWorkspaceId
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

  const workspacesByMonitor = computed(() => config.value?.workspacesByMonitor ?? {})

  // Get all workspaces across all monitors
  const allWorkspaces = computed(() => {
    return Object.values(workspacesByMonitor.value).flat()
  })

  // Get the active workspace for each monitor
  const activeWorkspacesByMonitor = computed(() => {
    const result: Record<string, Workspace | null> = {}

    Object.entries(workspacesByMonitor.value).forEach(([monitorId, workspaces]) => {
      const activeWorkspace = workspaces.find(workspace => workspace.hasFocus)
      result[monitorId] = activeWorkspace || null
    })

    return result
  })

  // Get active workspace display name for focused monitor
  const activeWorkspaceDisplayName = computed(() => {
    const focusedMonitor = allMonitors.value.find(monitor => monitor.hasFocus)
    if (!focusedMonitor) return null

    const activeWorkspace = activeWorkspacesByMonitor.value[focusedMonitor.id]
    return activeWorkspace?.displayName || null
  })

  return {
    allMonitors,
    allWorkspaces,
    activeWorkspaceDisplayName,
    activeWorkspacesByMonitor,
    workspacesByMonitor,
    monitorWorkspaces,
    monitorDimensions,
    initialize,
  }
}
