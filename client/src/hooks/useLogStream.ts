import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { type LogStreamMessage } from '$schemas'
import { configSubject } from '~/hooks/useGlaze'
import { logStreamQueries } from '~/io/queries/logStream.queries'

export const useLogStream = () => {
  const queryClient = useQueryClient()

  const { data, error, refetch, isLoading } = useQuery({
    enabled: false,
    queryKey: ['logStream'],
    retry: false,
    queryFn: () => (
      logStreamQueries.connectLogs((data: LogStreamMessage) => {
        const { category, properties } = data

        if (category.includes('glaze') && properties.type === 'glaze-config-update') {
          configSubject.next({
            type: 'glaze-config-update',
            config: properties.glazeConfig,
          })
        }

        queryClient.setQueryData(['logStream'], (oldData: LogStreamMessage[] = []) => {
          return [...oldData, data].slice(-20)
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
