import { cva } from 'class-variance-authority'
// import { type Monitor } from 'glazewm'
import { computed, defineComponent } from 'vue'
import { type GlazeConfig } from '~/hooks/useGlaze'

const monitorVariants = cva([
  'flex aspect-video w-10 rounded text-xs text-white *:m-auto',
], {
  variants: {
    active: {
      true: 'bg-blue-500',
      false: 'bg-blue-500/25',
    },
  },
  defaultVariants: {
    active: true,
  },
})

type MonitorGridProps = {
  monitors: GlazeConfig['allMonitors']
}

export default defineComponent<MonitorGridProps>({
  name: 'MonitorGrid',
  props: {
    monitors: {
      type: Array,
      required: true,
      default: () => [],
    },
  },
  setup (props) {
    const selectMonitor = (index: number) => {
      console.log('selectMonitor', index)
    }

    const monitorOrder = [0, 2, 1, 3]

    const orderedMonitors = computed(() => {
      return props.monitors
        .map((monitor, index) => ({ monitor, order: monitorOrder.indexOf(index) }))
        .sort((a, b) => a.order - b.order)
        .map(item => item.monitor)
    })

    return () => (
      <div class='grid grid-cols-2 gap-[2px]'>
        {orderedMonitors.value.map((monitor, index) => {
          const monitorClass = monitorVariants({
            active: monitor.hasFocus,
          })

          return (
            <div key={monitor.id} class={monitorClass} onClick={() => selectMonitor(index)}>
              <div>{index + 1}</div>
            </div>
          )
        })}
      </div>
    )
  },
})
