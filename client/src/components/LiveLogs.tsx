import { useQuery } from '@tanstack/vue-query'
import { cva } from 'class-variance-authority'
import { computed, defineComponent, onMounted, ref } from 'vue'
import { useLogStream } from '~/hooks'
import { logStreamQueries } from '~/io/queries/logStream.queries'

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
        level: props.line.level,
      })
    ))

    return () => {
      if (!props.line || typeof props.line === 'string') {
        return null
      }

      const { category, level, timestamp, message, properties } = props.line

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
    const { data: logs, error: logsError, refetch: refetchLogs, isLoading: isLoadingLogs } = useLogStream()

    const logText = ref('')

    const {
      data: sendLogData,
      error: sendLogError,
      refetch: sendLogRefetch,
      isLoading: isLoadingSendLog,
    } = useQuery({
      enabled: false,
      queryKey: ['sendLog'],
      retry: false,
      queryFn: () => (
        logStreamQueries.sendLog({
          category: ['test'],
          level: 'info',
          message: [logText.value],
          properties: {},
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

    const sendLog = (event: KeyboardEvent) => {
      if (event.key !== 'Enter') return
      sendLogRefetch()
    }

    const reconnect = () => logStreamQueries.reconnectLogs()

    return () => (
      <div class='m-8 h-96 rounded-lg border border-slate-800 px-4 py-3'>
        {/* <pre>logs: {JSON.stringify(logs.value, null, 2)}</pre> */}
        {/* <pre>showLogs: {JSON.stringify(showLogs.value, null, 2)}</pre> */}
        <pre>logsError: {JSON.stringify(formattedError.value, null, 2)}</pre>
        <pre>isLoading: {JSON.stringify(isLoadingLogs.value)}</pre>
        <pre class='grid gap-1'>
          {(showLogs.value && logs.value) && (
            logs.value.map((line, index) => (
              <FormatLogLine key={index} line={line}/>
            ))
          )}
        </pre>
        {isLoadingSendLog.value && <div>Sending log...</div>}
        {sendLogError.value && <div>Error sending log: {sendLogError.value.message}</div>}
        <pre>sendLogData: {JSON.stringify(sendLogData.value, null, 2)}</pre>
        <input
          class='border bg-black'
          type='text'
          v-model={logText.value}
          onKeyup={sendLog}
        />
        <button onClick={reconnect}>Reconnect</button>
      </div>
    )
  },
})
