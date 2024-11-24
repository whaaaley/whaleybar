import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { cva } from 'class-variance-authority'
import { computed, defineComponent, onMounted, ref } from 'vue'
import { logStreamQueries } from '~/queries'

const statusVariants = cva([
  'rounded px-2 text-black ',
], {
  variants: {
    level: {
      debug: 'bg-green-600',
      info: 'bg-blue-600',
      warning: 'bg-amber-600',
      error: 'bg-red-600',
      fatal: 'bg-fuchsia-600',
    },
  },
  compoundVariants: [
    // {}
  ],
  defaultVariants: {
    level: 'info',
  },
})

const FormatLogLine = defineComponent({
  name: 'FormatLogLine',
  props: {
    line: {
      type: Object,
      required: true,
    },
  },
  setup (props) {
    const formatDate = (timestamp: number) => {
      return new Date(timestamp).toLocaleTimeString()
    }

    const statusClass = computed(() => (
      statusVariants({
        level: props.line.data.level,
      })
    ))

    return () => {
      if (!props.line.data || typeof props.line.data === 'string') {
        return null
      }

      const { category, level, timestamp, message, properties } = props.line.data

      return (
        <div class='flex items-center gap-2 text-sm'>
          <span class='text-gray-500'>{formatDate(timestamp)}</span>
          <span class={statusClass.value}>{level}</span>
          <span>{Array.isArray(message) ? message.join(' ') : message}</span>
          {category && <span class='text-gray-400'>({category.join(', ')})</span>}
        </div>
      )
    }
  },
})

export default defineComponent({
  name: 'LiveLogs',
  setup () {
    const queryClient = useQueryClient()

    const {
      data: logs,
      error: logsError,
      refetch: refetchLogs,
      isLoading: isLoadingLogs,
    } = useQuery({
      enabled: false,
      queryKey: ['logs'],
      retry: false,
      queryFn: () => (
        logStreamQueries.connectLogs({
          onMessage: (data) => {
            return queryClient.setQueryData<MessageEvent[]>(['logs'], () => data)
          },
        })
      ),
    })

    const formattedError = computed(() => {
      const error = logsError.value

      if (!error) return {}

      return {
        name: error.name,
        message: error.message,
        stack: error.stack,
      }
    })

    onMounted(async () => {
      await refetchLogs()
    })

    const showLogs = computed(() => (
      !isLoadingLogs.value && Array.isArray(logs.value)
    ))

    const logText = ref('')
    const sendLog = (event: KeyboardEvent) => {
      if (event.key !== 'Enter') return

      logStreamQueries.sendLog({
        category: ['test'],
        level: 'info',
        message: [logText.value],
        properties: {},
      })
    }

    return () => (
      <div class='m-8 h-96 rounded-lg border border-slate-800 px-4 py-3'>
        <pre>logsError: {JSON.stringify(formattedError.value, null, 2)}</pre>
        <pre>isLoading: {JSON.stringify(isLoadingLogs.value)}</pre>
        <pre class='grid gap-1'>
          {showLogs.value && logs && logs.value?.map((line, index) => (
            <FormatLogLine key={index} line={line}/>
          ))}
        </pre>
        <input
          class='border bg-black'
          type='text'
          v-model={logText.value}
          onKeyup={sendLog}
        />
      </div>
    )
  },
})
