<template>
  <UChatPalette>
    <UChatMessages
      :user="{
        side: 'right',
        variant: 'solid',
        avatar: {
          src: 'https://github.com/benjamincanac.png',
          loading: 'lazy'
        }
      }"
      :status="status"
      :messages="messages"
    />

    <template #prompt>
      <div class="px-4 pt-2 pb-1">
        <USelect
          v-model="provider"
          :items="providerItems"
          size="sm"
          class="max-w-44"
        />
      </div>

      <UChatPrompt
        v-model="input"
        :loading="status === 'submitted'"
        @submit="onSubmit"
      >
        <UChatPromptSubmit
          :status="status"
          @stop="onStop"
          @reload="onReload"
        />
      </UChatPrompt>
    </template>
  </UChatPalette>
</template>

<script setup lang="ts">
import type { TChatProvider } from '~/shared/chat'

type ChatRole = 'user' | 'assistant' | 'system'
type ChatStatus = 'ready' | 'submitted' | 'error'

interface ChatPart {
  type: 'text'
  text: string
}

interface UIChatMessage {
  id: string
  role: ChatRole
  parts: ChatPart[]
}

interface ChatMessageResponse {
  reply?: string
  provider?: TChatProvider
}

interface ChatErrorResponse {
  statusMessage?: string
  message?: string
}

const status = ref<ChatStatus>('ready')
const input = ref('')
const messages = ref<UIChatMessage[]>([])
const providerItems = [
  { label: 'Qwen3', value: 'qwen3' },
  { label: 'OpenClaw', value: 'openclaw' }
]

const { provider, chatId, username } = useChatSettings()

let lastUserMessageContent = ''
let abortController: AbortController | null = null

const createMessageId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `msg-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

const toContent = (message: UIChatMessage): string => message.parts
  .filter(part => part.type === 'text')
  .map(part => part.text)
  .join('')

const getErrorMessage = (error: unknown): string => {
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    return error.message
  }

  return 'Unable to get a response right now. Please try again.'
}

const pushAssistantError = (errorText: string) => {
  messages.value.push({
    id: createMessageId(),
    role: 'assistant',
    parts: [{ type: 'text', text: errorText }]
  })
}

const getResponseErrorMessage = async (response: Response): Promise<string> => {
  const fallback = 'Chat request failed.'

  const contentType = response.headers.get('content-type') || ''

  if (contentType.includes('application/json')) {
    const parsed = await response.json().catch(() => null) as ChatErrorResponse | null

    if (typeof parsed?.statusMessage === 'string' && parsed.statusMessage.trim().length > 0) {
      return parsed.statusMessage
    }

    if (typeof parsed?.message === 'string' && parsed.message.trim().length > 0) {
      return parsed.message
    }

    return fallback
  }

  const reason = await response.text().catch(() => '')
  return reason.trim() || fallback
}

const sendMessage = async (content: string) => {
  abortController = new AbortController()
  status.value = 'submitted'

  const response = await fetch('/api/chat/message', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    signal: abortController.signal,
    body: JSON.stringify({
      message: content,
      chatId: chatId.value,
      username: username.value,
      provider: provider.value,
      messages: messages.value.map(message => ({
        role: message.role,
        content: toContent(message)
      }))
    })
  })

  if (!response.ok) {
    const reason = await getResponseErrorMessage(response)
    throw new Error(reason)
  }

  const parsed = await response.json() as ChatMessageResponse
  const reply = typeof parsed.reply === 'string' ? parsed.reply.trim() : ''

  if (!reply) {
    throw new Error('The provider returned an empty reply.')
  }

  messages.value.push({
    id: createMessageId(),
    role: 'assistant',
    parts: [{ type: 'text', text: reply }]
  })

  status.value = 'ready'
}

const onSubmit = async (event: Event) => {
  event.preventDefault()

  if (status.value === 'submitted') {
    return
  }

  const content = input.value.trim()

  if (!content) {
    return
  }

  lastUserMessageContent = content

  messages.value.push({
    id: createMessageId(),
    role: 'user',
    parts: [{ type: 'text', text: content }]
  })

  input.value = ''

  try {
    await sendMessage(content)
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      status.value = 'ready'
      return
    }

    status.value = 'error'
    pushAssistantError(getErrorMessage(error))
  } finally {
    abortController = null
  }
}

const onStop = () => {
  abortController?.abort()
}

const onReload = async () => {
  if (!lastUserMessageContent || status.value === 'submitted') {
    return
  }

  messages.value.push({
    id: createMessageId(),
    role: 'user',
    parts: [{ type: 'text', text: lastUserMessageContent }]
  })

  try {
    await sendMessage(lastUserMessageContent)
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      status.value = 'ready'
      return
    }

    status.value = 'error'
    pushAssistantError(getErrorMessage(error))
  } finally {
    abortController = null
  }
}
</script>
