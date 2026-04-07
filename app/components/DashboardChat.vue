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
      <UChatPrompt
        v-model="input"
        :loading="status === 'submitted' || status === 'streaming'"
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
type ChatRole = 'user' | 'assistant' | 'system'
type ChatStatus = 'ready' | 'submitted' | 'streaming' | 'error'

interface ChatPart {
  type: 'text'
  text: string
}

interface UIChatMessage {
  id: string
  role: ChatRole
  parts: ChatPart[]
}

interface StreamedAssistantMessage extends UIChatMessage {
  done: boolean
}

const status = ref<ChatStatus>('ready')
const input = ref('')
const messages = ref<UIChatMessage[]>([])

let lastUserMessageContent = ''
let abortController: AbortController | null = null

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
    id: crypto.randomUUID(),
    role: 'assistant',
    parts: [{ type: 'text', text: errorText }]
  })
}

const streamAssistantResponse = async (response: Response) => {
  if (!response.body) {
    throw new Error('Missing response stream.')
  }

  const decoder = new TextDecoder()
  const reader = response.body.getReader()

  let buffer = ''
  let assistantMessageId = ''

  while (true) {
    const { done, value } = await reader.read()

    if (done) {
      break
    }

    buffer += decoder.decode(value, { stream: true })

    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''

    for (const line of lines) {
      const chunk = line.trim()

      if (!chunk) {
        continue
      }

      let streamed: StreamedAssistantMessage

      try {
        streamed = JSON.parse(chunk)
      } catch {
        continue
      }

      if (!streamed?.id || streamed.role !== 'assistant' || !Array.isArray(streamed.parts)) {
        continue
      }

      if (!assistantMessageId) {
        assistantMessageId = streamed.id
        messages.value.push({
          id: streamed.id,
          role: streamed.role,
          parts: streamed.parts
        })
      } else {
        const assistantIndex = messages.value.findIndex(message => message.id === assistantMessageId)

        if (assistantIndex >= 0) {
          messages.value[assistantIndex] = {
            id: streamed.id,
            role: streamed.role,
            parts: streamed.parts
          }
        }
      }

      status.value = streamed.done ? 'ready' : 'streaming'
    }
  }
}

const sendMessages = async () => {
  abortController = new AbortController()
  status.value = 'submitted'

  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    signal: abortController.signal,
    body: JSON.stringify({
      messages: messages.value.map(message => ({
        role: message.role,
        content: toContent(message)
      }))
    })
  })

  if (!response.ok) {
    const reason = await response.text().catch(() => '')
    throw new Error(reason || 'Chat request failed.')
  }

  status.value = 'streaming'
  await streamAssistantResponse(response)
  status.value = 'ready'
}

const onSubmit = async (event: Event) => {
  event.preventDefault()

  if (status.value === 'submitted' || status.value === 'streaming') {
    return
  }

  const content = input.value.trim()

  if (!content) {
    return
  }

  lastUserMessageContent = content

  messages.value.push({
    id: crypto.randomUUID(),
    role: 'user',
    parts: [{ type: 'text', text: content }]
  })

  input.value = ''

  try {
    await sendMessages()
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
  if (!lastUserMessageContent || status.value === 'submitted' || status.value === 'streaming') {
    return
  }

  messages.value.push({
    id: crypto.randomUUID(),
    role: 'user',
    parts: [{ type: 'text', text: lastUserMessageContent }]
  })

  try {
    await sendMessages()
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
