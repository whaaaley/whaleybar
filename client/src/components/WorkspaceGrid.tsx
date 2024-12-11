import { cva } from 'class-variance-authority'
import { type Workspace } from 'glazewm'
import { defineComponent } from 'vue'

const workspaceVariants = cva([
  'flex rounded px-3 py-2 text-xs text-white *:m-auto',
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

type WorkspaceGridProps = {
  workspaces: Workspace[]
}

export default defineComponent<WorkspaceGridProps>({
  name: 'WorkspaceGrid',
  props: {
    workspaces: {
      type: Array,
      required: true,
      default: () => [],
    },
  },
  setup (props) {
    const selectWorkspace = (index: number) => {
      console.log('selectWorkspace', index)
    }

    return () => (
      <div class='flex gap-[2px]'>
        {props.workspaces.map((workspace, index) => {
          const workspaceClass = workspaceVariants({
            active: workspace.hasFocus,
          })

          return (
            <div key={workspace.id} class={workspaceClass} onClick={() => selectWorkspace(index)}>
              <div>{workspace.displayName}</div>
            </div>
          )
        })}
      </div>
    )
  },
})
