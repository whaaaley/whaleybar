import { useQuery } from '@tanstack/vue-query'
import { defineComponent, onMounted } from 'vue'
import { MonitorGrid, WorkspaceGrid } from '~/components'
import { useLogStream } from '~/hooks'
import { useGlazeWM } from '~/hooks/useGlazeWM'
import { logStreamQueries } from '~/io/queries/logStream.queries'

export default defineComponent({
  name: 'GlazeGrids',
  setup () {
    const { allMonitors, monitorWorkspaces } = useGlazeWM()

    const {
      data: logs,
      error: logsError,
      refetch: logStreamConnect,
      isLoading: isLoadingLogs,
    } = useLogStream()

    // const dirtyKey = computed(() => {
    //   return JSON.stringify({
    //     allMonitors: allMonitors.value,
    //     monitorWorkspaces: monitorWorkspaces.value,
    //   })
    // })

    const { data, error, refetch, isLoading } = useQuery({
      enabled: false,
      queryKey: ['initConfig'],
      queryFn: () => {
        return logStreamQueries.sendLog({
          category: ['glaze'],
          level: 'info',
          message: ['Initialize glaze configuration'],
          properties: {
            setGlazeConfig: true,
            allMonitors: allMonitors.value,
            monitorWorkspaces: monitorWorkspaces.value,
          },
        })
      },
    })

    const { initialize } = useGlazeWM({
      initConfig: refetch,
    })

    onMounted(() => {
      // LogStream connection is long lived; it won't resolve unless it closes
      // so we don't need to await it
      logStreamConnect()

      // Initialize the GlazeWM state if we're in a Zebar context
      initialize()
    })

    const Grids = () => (
      <>
        <MonitorGrid monitors={allMonitors.value}/>
        <WorkspaceGrid workspaces={monitorWorkspaces.value}/>
      </>
    )

    return () => (
      <div class='grid w-96 grid-cols-2 gap-4 bg-slate-800 text-white'>
        <div>
          {logsError.value ? <div>Error: {logsError.value.message}</div> : null}
          {error.value ? <div>Error: {error.value.message}</div> : null}
        </div>
        <div>
          {isLoading.value ? <div>Loading...</div> : <Grids/>}
        </div>
      </div>
    )
  },
})
