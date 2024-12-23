import { useQuery } from '@tanstack/vue-query'
import { defineComponent, onMounted } from 'vue'
import { MonitorGrid, WorkspaceGrid } from '~/components'
import { useLogStream } from '~/hooks'
import { useGlaze } from '~/hooks/useGlaze'
import { logStreamQueries } from '~/io/queries/logStream.queries'

export default defineComponent({
  name: 'GlazeGrids',
  setup () {
    const {
      data: logs,
      error: logsError,
      refetch: logStreamConnect,
      isLoading: isLoadingLogs,
    } = useLogStream()

    const { data, error, refetch, isLoading } = useQuery({
      enabled: false,
      queryKey: ['initConfig'],
      queryFn: () => {
        return logStreamQueries.sendLog({
          category: ['glaze'],
          level: 'info',
          message: ['Set glaze config'],
          properties: {
            type: 'set-config',
            glazeConfig: {
              allMonitors: allMonitors.value,
              monitorWorkspaces: monitorWorkspaces.value,
            },
          },
        })
      },
    })

    const { allMonitors, monitorWorkspaces, initialize } = useGlaze({
      saveConfigToServer: refetch,
    })

    onMounted(() => {
      if (window.__TAURI_INTERNALS__) {
        initialize()
      }
      else {
        logStreamConnect()
      }
    })

    const Grids = () => (
      <>
        <MonitorGrid monitors={allMonitors.value}/>
        <WorkspaceGrid workspaces={monitorWorkspaces.value}/>
      </>
    )

    return () => (
      <>
        {isLoading.value ? <div>Loading...</div> : <Grids/>}
        <div class='flex flex-col gap-2 text-sm text-white'>
          <div>
            {logsError.value ? `Error: ${logsError.value.message}` : 'no log stream error'}
          </div>
          <div>
            {error.value ? `Error: ${error.value.message}` : 'no error sending log'}
          </div>
        </div>
      </>
    )
  },
})
