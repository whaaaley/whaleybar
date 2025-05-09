import { useNow } from '@vueuse/core'
import { computed } from 'vue'

const monthlyEmojis = [
  { month: 'January', name: 'snowman', unicode: '2603-fe0f' },
  { month: 'February', name: 'heart-with-ribbon', unicode: '1f49d' },
  { month: 'March', name: 'four-leaf-clover', unicode: '1f340' },
  { month: 'April', name: 'umbrella', unicode: '2602-fe0f' },
  { month: 'May', name: 'blossom', unicode: '1f33c' },
  { month: 'June', name: 'rainbow-flag', unicode: '1f3f3-fe0f-200d-1f308' },
  { month: 'July', name: 'flag-united-states', unicode: '1f1fa-1f1f8' },
  { month: 'August', name: 'ear-of-corn', unicode: '1f33d' },
  { month: 'September', name: 'fallen-leaf', unicode: '1f342' },
  { month: 'October', name: 'jack-o-lantern', unicode: '1f383' },
  { month: 'November', name: 'turkey', unicode: '1f983' },
  { month: 'December', name: 'christmas-tree', unicode: '1f384' },
]

type EmojiParams = {
  name: string
  platform?: 'apple' | 'google' | 'microsoft' | 'samsung' | 'twitter' | 'whatsapp'
  unicode?: string
}

export const useEmoji = () => {
  const now = useNow()

  const getEmoji = ({ name, platform = 'apple', unicode }: EmojiParams) => {
    const baseUrl = 'https://em-content.zobj.net/source'
    const versions = {
      apple: '419',
      google: '350',
      microsoft: '319',
      samsung: '320',
      twitter: '322',
      whatsapp: '352',
    }

    const filename = `${name}${unicode ? `_${unicode}` : ''}.png`
    const path = [baseUrl, platform, versions[platform], filename]

    return path.join('/')
  }

  const monthlyAppleEmojiUrl = computed(() => {
    const currentEmoji = monthlyEmojis[now.value.getMonth()]

    if (!currentEmoji) return

    return getEmoji({
      name: currentEmoji.name,
      unicode: currentEmoji.unicode,
      platform: 'apple',
    })
  })

  return {
    getEmoji,
    monthlyAppleEmojiUrl,
  }
}
