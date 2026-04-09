import type { TChatProvider } from '~/shared/chat'

const DEFAULT_CHAT_ID = 'main'

export const useChatSettings = () => {
  const runtimeConfig = useRuntimeConfig()
  const defaultProvider = runtimeConfig.public.chat.defaultProvider === 'openclaw' ? 'openclaw' : 'qwen3'
  const provider = useState<TChatProvider>('chat.provider', () => defaultProvider)
  const chatId = useState<string>('chat.id', () => DEFAULT_CHAT_ID)

  if (import.meta.client) {
    const storedProvider = localStorage.getItem('chat.provider')
    const storedChatId = localStorage.getItem('chat.id')

    if (storedProvider === 'qwen3' || storedProvider === 'openclaw') {
      provider.value = storedProvider
    } else {
      provider.value = defaultProvider
    }

    if (typeof storedChatId === 'string' && storedChatId.trim().length > 0) {
      chatId.value = storedChatId
    }

    watch(provider, (value) => {
      localStorage.setItem('chat.provider', value)
    }, { immediate: true })

    watch(chatId, (value) => {
      if (value.trim().length > 0) {
        localStorage.setItem('chat.id', value)
      }
    }, { immediate: true })
  }

  return {
    provider,
    chatId
  }
}
