type ChatRole = 'user' | 'assistant' | 'system'

interface ChatPart {
  type: 'text'
  text: string
}

interface ChatMessage {
  role: ChatRole
  content?: string
  parts?: ChatPart[]
}

interface ChatRequestBody {
  messages?: ChatMessage[]
}

interface StreamedAssistantMessage {
  id: string
  role: 'assistant'
  parts: ChatPart[]
  done: boolean
}

interface OllamaChunk {
  message?: {
    content?: string
  }
  done?: boolean
}

const toMessageContent = (message: ChatMessage): string => {
  if (typeof message.content === 'string') {
    return message.content
  }

  if (Array.isArray(message.parts)) {
    return message.parts
      .filter(part => part.type === 'text' && typeof part.text === 'string')
      .map(part => part.text)
      .join('')
  }

  return ''
}

const isChatRole = (role: unknown): role is ChatRole => role === 'user' || role === 'assistant' || role === 'system'

export default defineEventHandler(async (event) => {
  const body = await readBody<ChatRequestBody>(event)
  const runtimeConfig = useRuntimeConfig(event)
  const ollamaUrl = `${runtimeConfig.ollama.baseUrl}/api/chat`

  const normalizedMessages = (body.messages ?? [])
    .map((message) => {
      const content = toMessageContent(message)

      return {
        role: message.role,
        content
      }
    })
    .filter(message => isChatRole(message.role) && message.content.trim().length > 0)
    .map(message => ({
      role: message.role,
      content: message.content
    }))

  if (normalizedMessages.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'At least one non-empty message is required.'
    })
  }

  const response = await fetch(ollamaUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: runtimeConfig.ollama.model,
      messages: normalizedMessages,
      stream: true,
      think: false
    })
  })

  if (!response.ok || !response.body) {
    const reason = await response.text().catch(() => '')

    throw createError({
      statusCode: response.status || 502,
      statusMessage: reason || 'Unable to reach local Ollama chat endpoint.'
    })
  }

  const assistantMessageId = crypto.randomUUID()
  const decoder = new TextDecoder()
  const encoder = new TextEncoder()
  const reader = response.body.getReader()

  let buffer = ''
  let assistantText = ''

  const processChunk = (parsed: OllamaChunk, controller: ReadableStreamDefaultController<Uint8Array>) => {
    const delta = typeof parsed?.message?.content === 'string' ? parsed.message.content : ''

    if (delta.length > 0) {
      assistantText += delta
    }

    if (delta.length > 0 || parsed?.done === true) {
      const streamedMessage: StreamedAssistantMessage = {
        id: assistantMessageId,
        role: 'assistant',
        parts: [{ type: 'text', text: assistantText }],
        done: parsed?.done === true
      }

      controller.enqueue(encoder.encode(`${JSON.stringify(streamedMessage)}\n`))
    }
  }

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      // Emit a keepalive newline so clients receive headers immediately.
      controller.enqueue(encoder.encode('\n'))
    },
    async pull(controller) {
      const { done, value } = await reader.read()

      if (done) {
        const remaining = buffer.trim()

        if (remaining.length > 0) {
          try {
            const parsed = JSON.parse(remaining) as OllamaChunk
            processChunk(parsed, controller)
          } catch {
            // Ignore malformed trailing chunk from upstream stream.
          }
        }

        if (assistantText.length > 0) {
          const finalMessage: StreamedAssistantMessage = {
            id: assistantMessageId,
            role: 'assistant',
            parts: [{ type: 'text', text: assistantText }],
            done: true
          }

          controller.enqueue(encoder.encode(`${JSON.stringify(finalMessage)}\n`))
        }

        controller.close()
        return
      }

      buffer += decoder.decode(value, { stream: true })

      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''

      for (const line of lines) {
        const chunk = line.trim()

        if (!chunk) {
          continue
        }

        let parsed: OllamaChunk

        try {
          parsed = JSON.parse(chunk) as OllamaChunk
        } catch {
          continue
        }

        processChunk(parsed, controller)
      }
    },
    cancel() {
      reader.cancel().catch(() => {})
    }
  })

  setResponseHeader(event, 'Content-Type', 'application/x-ndjson; charset=utf-8')
  setResponseHeader(event, 'Cache-Control', 'no-cache, no-transform')

  return sendStream(event, stream)
})
