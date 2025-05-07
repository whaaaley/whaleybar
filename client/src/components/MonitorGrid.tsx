import { cva } from 'class-variance-authority'
import { computed, defineComponent } from 'vue'
import { type GlazeConfig } from '~/hooks/useGlaze'

const monitorVariants = cva([
  'flex aspect-video w-8 text-xs text-white *:m-auto',
], {
  variants: {
    monitor: {
      topLeft: 'rounded-tl',
      topRight: 'rounded-tr',
      bottomLeft: 'rounded-bl',
      bottomRight: 'rounded-br',
    },
    active: {
      // true: 'bg-catppuccin-purple',
      // false: 'bg-catppuccin-purple/25',
      true: 'bg-blue-500',
      false: 'bg-blue-500/50',
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

    const monitorOrder = [0, 3, 1, 2]
    const monitorMap = {
      0: 'topLeft',
      1: 'topRight',
      2: 'bottomLeft',
      3: 'bottomRight',
    }

    const orderedMonitors = computed(() => {
      return props.monitors
        .map((monitor, index) => ({ monitor, order: monitorOrder.indexOf(index) }))
        .sort((a, b) => a.order - b.order)
        .map(item => item.monitor)
    })

    return () => (
      // <div class='grid grid-cols-2 gap-[2px]'>
      <div class='grid grid-cols-2'>
        {orderedMonitors.value.map((monitor, index) => {
          const monitorClass = monitorVariants({
            active: monitor.hasFocus,
            monitor: monitorMap[index],
          })

          return (
            <div key={monitor.id} class={monitorClass} onClick={() => selectMonitor(index)}>
              {/* <div>{index + 1}</div> */}
            </div>
          )
        })}
      </div>
    )
  },
})
