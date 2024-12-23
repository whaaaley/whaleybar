import { useQuery } from '@tanstack/vue-query'
import { computed, defineComponent, onMounted } from 'vue'
import { MonitorGrid, WorkspaceGrid } from '~/components'
import { useEmoji, useLogStream } from '~/hooks'
import { useGlaze } from '~/hooks/useGlaze'
import { logStreamQueries } from '~/io/queries/logStream.queries'

export default defineComponent({
  name: 'GlazeGrids',
  setup () {
    const { error: logsError, refetch: logStreamConnect } = useLogStream()
    const { getEmoji } = useEmoji()

    const { error, refetch } = useQuery({
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

    const errorValue = computed(() => logsError.value || error.value)
    const errorEmojiUrl = getEmoji({ name: 'question-mark', unicode: '2753' })

    const ErrorIcon = () => (
      <div class='flex gap-2 text-white'>
        <img class='size-8' src={errorEmojiUrl}/>
        <div>{errorValue.value}</div>
      </div>
    )

    const Grids = () => (
      <>
        <MonitorGrid monitors={allMonitors.value}/>
        <WorkspaceGrid workspaces={monitorWorkspaces.value}/>
      </>
    )

    return () => (
      <>
        {errorValue.value ? <ErrorIcon/> : <Grids/>}
      </>
    )
  },
})
