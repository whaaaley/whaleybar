import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { type LogStreamMessageSchema } from '$schemas'
import { wmEventBus } from '~/hooks/useGlazeWM'
import { logStreamQueries } from '~/io/queries/logStream.queries'

export const useLogStream = () => {
  const queryClient = useQueryClient()

  const { data, error, refetch, isLoading } = useQuery({
    enabled: false,
    queryKey: ['logStream'],
    retry: false,
    queryFn: () => (
      logStreamQueries.connectLogs((data: LogStreamMessageSchema) => {
        console.log('data:', data.category)

        // If the log message requests initialization, send an init event to
        // the event bus

        if (data.category.includes('glaze')) {
          if (data.properties?.requestInit) {
            console.log('hey buddy, the server aint got no glaze config', data.properties)

            wmEventBus.next({
              type: 'wm-init', // Todo: Rename to wm-request-init
              payload: null,
            })
          }

          if (data.properties?.requestUpdate) {
            console.log('xxx', data.properties)

            wmEventBus.next({
              type: 'wm-update',
              payload: data.properties.glazeConfig,
            })
          }
        }

        queryClient.setQueryData(['logStream'], (oldData: LogStreamMessageSchema[] = []) => {
          return [...oldData, data].slice(-20) // Keep the last 20 logs

          // Combine the new data with the old data
          // return from([...oldData, data]).pipe(
          //   takeLast(20),
          //   toArray(),
          // )
        })
      })
    ),
  })

  return {
    data,
    error,
    refetch,
    isLoading,
  }
}
