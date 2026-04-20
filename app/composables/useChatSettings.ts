import type { TChatProvider } from '~/shared/chat'

const DEFAULT_CHAT_ID = 'main'
const DEFAULT_USERNAME = 'anonymous'

let chatSettingsSynced = false

export const useChatSettings = () => {
  const runtimeConfig = useRuntimeConfig()
  const defaultProvider = runtimeConfig.public.chat.defaultProvider === 'openclaw' ? 'openclaw' : 'qwen3'
  const provider = useState<TChatProvider>('chat.provider', () => defaultProvider)
  const chatId = useState<string>('chat.id', () => DEFAULT_CHAT_ID)
  const username = useState<string>('chat.username', () => DEFAULT_USERNAME)

  if (import.meta.client && !chatSettingsSynced) {
    const storedProvider = localStorage.getItem('chat.provider')
    const storedChatId = localStorage.getItem('chat.id')
    const storedUsername = localStorage.getItem('chat.username')

    if (storedProvider === 'qwen3' || storedProvider === 'openclaw') {
      provider.value = storedProvider
    } else {
      provider.value = defaultProvider
    }

    if (typeof storedChatId === 'string' && storedChatId.trim().length > 0) {
      chatId.value = storedChatId
    }

    if (typeof storedUsername === 'string' && storedUsername.trim().length > 0) {
      username.value = storedUsername.trim()
    } else {
      username.value = DEFAULT_USERNAME
    }

    watch(provider, (value) => {
      localStorage.setItem('chat.provider', value)
    }, { immediate: true })

    watch(chatId, (value) => {
      if (value.trim().length > 0) {
        localStorage.setItem('chat.id', value)
      }
    }, { immediate: true })

    watch(username, (value) => {
      const normalized = value.trim()

      if (normalized.length > 0) {
        localStorage.setItem('chat.username', normalized)
        return
      }

      username.value = DEFAULT_USERNAME
      localStorage.setItem('chat.username', DEFAULT_USERNAME)
    }, { immediate: true })

    chatSettingsSynced = true
  }

  return {
    provider,
    chatId,
    username
  }
}
