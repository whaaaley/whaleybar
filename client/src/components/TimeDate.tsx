import { useDateFormat, useNow } from '@vueuse/core'
import { defineComponent } from 'vue'
import { useEmoji } from '~/hooks'

export default defineComponent({
  name: 'TimeDate',
  setup () {
    const { monthlyAppleEmojiUrl } = useEmoji()
    const now = useNow()

    const timeFormat = useDateFormat(now, 'h:mm')
    const dateFormat = useDateFormat(now, 'MM/DD/YYYY')
    const meridiem = useDateFormat(now, 'A')

    return () => (
      <div class='flex h-12 items-center gap-2 font-segoe text-white'>
        <img class='flex size-8' src={monthlyAppleEmojiUrl.value}/>
        <div class='grid text-xs'>
          <div>{timeFormat.value} {meridiem.value}</div>
          <div>{dateFormat.value}</div>
        </div>
      </div>
    )
  },
})
