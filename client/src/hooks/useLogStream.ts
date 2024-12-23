import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { type LogStreamMessageSchema } from '$schemas'
import { glazeConfigEventBus } from '~/hooks/useGlaze'
import { logStreamQueries } from '~/io/queries/logStream.queries'

export const useLogStream = () => {
  const queryClient = useQueryClient()

  const { data, error, refetch, isLoading } = useQuery({
    enabled: false,
    queryKey: ['logStream'],
    retry: false,
    queryFn: () => (
      logStreamQueries.connectLogs((data: LogStreamMessageSchema) => {
        if (data.category.includes('glaze') && data.properties.type === 'glaze-config-update') {
          glazeConfigEventBus.next({
            type: 'glaze-config-update',
            payload: data.properties.glazeConfig,
          })
        }

        queryClient.setQueryData(['logStream'], (oldData: LogStreamMessageSchema[] = []) => {
          return [...oldData, data].slice(-20) // Keep the last 20 logs
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
