import { cva } from 'class-variance-authority'
import { defineComponent } from 'vue'
import { type GlazeConfig } from '~/hooks/useGlaze'

const workspaceVariants = cva([
  'flex h-1 text-xs text-white *:m-auto',
], {
  variants: {
    workspace: {
      first: 'rounded-l',
      middle: 'rounded-none',
      last: 'rounded-r',
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

export default defineComponent({
  name: 'WorkspaceGrid',
  props: {
    activeWorkspaceDisplayName: {
      type: String,
      required: true,
      default: '',
    },
    workspaces: {
      type: Array as () => GlazeConfig['monitorWorkspaces'],
      required: true,
      default: () => [],
    },
  },
  setup (props) {
    const selectWorkspace = (index: number) => {
      console.log('selectWorkspace', index)
    }

    const workspaceMap = {
      0: 'first',
      1: 'middle',
      2: 'last',
    }

    return () => (
      // <div class='flex gap-[2px] *:flex-1'>
      <div class='flex *:flex-1'>
        {props.workspaces.map((workspace, index) => {
          const workspaceClass = workspaceVariants({
            active: props.activeWorkspaceDisplayName === workspace.displayName,
            workspace: workspaceMap[index],
          })

          return (
            <div key={workspace.id} class={workspaceClass} onClick={() => selectWorkspace(index)}>
              {/* <div>{workspace.displayName}</div> */}
            </div>
          )
        })}
      </div>
    )
  },
})
